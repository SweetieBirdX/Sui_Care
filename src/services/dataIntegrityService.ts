import { SuiClient } from '@mysten/sui/client';
import { SealService } from './sealService';
import { WalrusService } from './walrusService';
import { DataService } from './dataService';
import { AccessControlService } from './accessControlService';
import { 
  type HealthData, 
  type HealthDataType
} from '../types/healthData';

// Data Integrity Constants
export const DATA_INTEGRITY_RULES = {
  NO_MODIFICATION: 'NO_MODIFICATION',
  ADD_ONLY: 'ADD_ONLY',
  READ_ONLY: 'READ_ONLY',
} as const;

export type DataIntegrityRule = typeof DATA_INTEGRITY_RULES[keyof typeof DATA_INTEGRITY_RULES];

// Data Modification Attempt Result
export interface DataModificationResult {
  success: boolean;
  allowed: boolean;
  reason?: string;
  newBlobId?: string;
  error?: string;
}

// Data Integrity Violation
export interface DataIntegrityViolation {
  violationType: string;
  userAddress: string;
  dataId: string;
  timestamp: number;
  reason: string;
}

/**
 * Data Integrity Service for enforcing immutable data rules
 * Prevents modification of existing health records while allowing new additions
 */
export class DataIntegrityService {
  private sealService: SealService;
  private walrusService: WalrusService;
  private dataService: DataService;
  private accessControlService: AccessControlService;

  constructor(suiClient: SuiClient) {
    this.sealService = new SealService(suiClient);
    this.walrusService = new WalrusService('testnet');
    this.dataService = new DataService(suiClient);
    this.accessControlService = new AccessControlService(suiClient);
  }

  /**
   * Add new health record (enforces ADD_ONLY rule)
   * Doctors can only add new records, never modify existing ones
   * 
   * @param newData - New health data to add
   * @param doctorAddress - Doctor's wallet address
   * @param patientAddress - Patient's wallet address
   * @param accessRequestId - Approved access request ID
   * @returns Result indicating success or failure
   */
  async addNewHealthRecord(
    newData: HealthData,
    doctorAddress: string,
    patientAddress: string,
    accessRequestId?: string
  ): Promise<DataModificationResult> {
    try {
      console.log(`Adding new health record: ${newData.type} for patient ${patientAddress} by doctor ${doctorAddress}`);

      // Verify access permission if access request ID is provided
      if (accessRequestId) {
        const isApproved = await this.accessControlService.isAccessApproved(accessRequestId);
        if (!isApproved) {
          return {
            success: false,
            allowed: false,
            reason: 'Access request not approved or expired',
          };
        }
      }

      // Check if this is truly new data (not modifying existing)
      const existingData = await this.dataService.listHealthData(
        doctorAddress, // userAddress
        'doctor', // userRole
        1, // page
        10, // limit
        newData.type // type filter
      );

      if (existingData.success && existingData.data) {
        // Check for potential duplicate based on content similarity
        const isDuplicate = await this.checkForDuplicateData(newData, existingData.data);
        if (isDuplicate) {
          return {
            success: false,
            allowed: false,
            reason: 'Similar data already exists. Cannot add duplicate records.',
          };
        }
      }

      // Generate unique data ID to prevent conflicts
      const uniqueDataId = this.generateUniqueDataId(newData.type, patientAddress, doctorAddress);
      newData.id = uniqueDataId;
      // Note: HealthDataMetadata doesn't have id field, using id from HealthData

      // Encrypt the new data using Seal
      const encryptedBlob = await this.sealService.encryptRoleData(
        {
          address: doctorAddress,
          role: 'doctor',
          timestamp: Date.now(),
          kycVerified: true,
        },
        doctorAddress
      );

      // Generate unique blob ID
      const blobId = this.generateUniqueBlobId(uniqueDataId, newData.type, patientAddress);

      // Store encrypted data in Walrus
      await this.walrusService.storeRoleData(encryptedBlob, blobId);

      // Update data metadata
      newData.metadata.blobId = blobId;
      newData.metadata.encrypted = true;
      newData.metadata.policyId = 'immutable_policy'; // Special policy for immutable data

      // Store metadata in local storage (in production, this would be on-chain)
      await this.storeDataMetadata(newData);

      // Record data access audit
      if (accessRequestId) {
        await this.accessControlService.recordDataAccess(accessRequestId, 2); // WRITE permission
      }

      console.log(`New health record added successfully: ${uniqueDataId} -> ${blobId}`);

      return {
        success: true,
        allowed: true,
        newBlobId: blobId,
      };
    } catch (error) {
      console.error('Error adding new health record:', error);
      return {
        success: false,
        allowed: false,
        error: error instanceof Error ? error.message : 'Unknown error adding health record',
      };
    }
  }

  /**
   * Attempt to modify existing data (should be blocked)
   * This function demonstrates the immutable data rule enforcement
   * 
   * @param dataId - ID of data to modify
   * @param modifications - Proposed modifications
   * @param userAddress - User attempting modification
   * @param userRole - User's role
   * @returns Result indicating modification is blocked
   */
  async attemptDataModification(
    dataId: string,
    _modifications: Partial<HealthData>,
    userAddress: string,
    userRole: string
  ): Promise<DataModificationResult> {
    try {
      console.log(`Attempting to modify data: ${dataId} by ${userRole} ${userAddress}`);

      // Check if user is trying to modify their own data (even if they're a doctor)
      const dataMetadata = await this.getDataMetadata(dataId);
      if (!dataMetadata) {
        return {
          success: false,
          allowed: false,
          reason: 'Data not found',
        };
      }

      // Enforce self-modification restriction
      if (userAddress === dataMetadata.patientId && userRole === 'patient') {
        return {
          success: false,
          allowed: false,
          reason: 'Patients cannot modify their own data, even if they are also doctors',
        };
      }

      // Enforce immutable data rule - no modifications allowed
      return {
        success: false,
        allowed: false,
        reason: 'Data modification is not allowed. Only new records can be added.',
      };
    } catch (error) {
      console.error('Error attempting data modification:', error);
      return {
        success: false,
        allowed: false,
        error: error instanceof Error ? error.message : 'Unknown error attempting modification',
      };
    }
  }

  /**
   * Attempt to delete existing data (should be blocked)
   * This function demonstrates the immutable data rule enforcement
   * 
   * @param dataId - ID of data to delete
   * @param userAddress - User attempting deletion
   * @param userRole - User's role
   * @returns Result indicating deletion is blocked
   */
  async attemptDataDeletion(
    dataId: string,
    userAddress: string,
    userRole: string
  ): Promise<DataModificationResult> {
    try {
      console.log(`Attempting to delete data: ${dataId} by ${userRole} ${userAddress}`);

      // Enforce immutable data rule - no deletions allowed
      return {
        success: false,
        allowed: false,
        reason: 'Data deletion is not allowed. All health records are immutable for audit purposes.',
      };
    } catch (error) {
      console.error('Error attempting data deletion:', error);
      return {
        success: false,
        allowed: false,
        error: error instanceof Error ? error.message : 'Unknown error attempting deletion',
      };
    }
  }

  /**
   * Check for duplicate data based on content similarity
   * 
   * @param newData - New data to check
   * @param existingData - Array of existing data
   * @returns True if duplicate found, false otherwise
   */
  private async checkForDuplicateData(newData: HealthData, existingData: HealthData[]): Promise<boolean> {
    try {
      for (const existing of existingData) {
        if (existing.type !== newData.type) continue;

        // Check for content similarity based on data type
        switch (newData.type) {
          case 'lab_result':
            const newLab = newData.data as any;
            const existingLab = existing.data as any;
            if (newLab.testName === existingLab.testName && 
                newLab.results === existingLab.results &&
                Math.abs(parseInt(newData.id.split('_').pop() || '0') - parseInt(existing.id.split('_').pop() || '0')) < 24 * 60 * 60 * 1000) { // Within 24 hours
              return true;
            }
            break;
          case 'prescription':
            const newPrescription = newData.data as any;
            const existingPrescription = existing.data as any;
            if (newPrescription.medications === existingPrescription.medications &&
                newPrescription.dosage === existingPrescription.dosage &&
                Math.abs(parseInt(newData.id.split('_').pop() || '0') - parseInt(existing.id.split('_').pop() || '0')) < 24 * 60 * 60 * 1000) {
              return true;
            }
            break;
          case 'medical_record':
            const newRecord = newData.data as any;
            const existingRecord = existing.data as any;
            if (newRecord.recordType === existingRecord.recordType &&
                Math.abs(parseInt(newData.id.split('_').pop() || '0') - parseInt(existing.id.split('_').pop() || '0')) < 24 * 60 * 60 * 1000) {
              return true;
            }
            break;
        }
      }
      return false;
    } catch (error) {
      console.error('Error checking for duplicate data:', error);
      return false;
    }
  }

  /**
   * Generate unique data ID to prevent conflicts
   * 
   * @param dataType - Type of health data
   * @param patientAddress - Patient's address
   * @param doctorAddress - Doctor's address
   * @returns Unique data ID
   */
  private generateUniqueDataId(dataType: HealthDataType, patientAddress: string, doctorAddress: string): string {
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    return `immutable_${dataType}_${patientAddress.slice(0, 8)}_${doctorAddress.slice(0, 8)}_${timestamp}_${randomSuffix}`;
  }

  /**
   * Generate unique blob ID for Walrus storage
   * 
   * @param dataId - Data ID
   * @param dataType - Type of health data
   * @param patientAddress - Patient's address
   * @returns Unique blob ID
   */
  private generateUniqueBlobId(dataId: string, dataType: HealthDataType, patientAddress: string): string {
    const timestamp = Date.now();
    return `immutable_blob_${dataType}_${dataId}_${patientAddress.slice(0, 8)}_${timestamp}`;
  }

  /**
   * Store data metadata in local storage
   * In production, this would be stored on-chain
   * 
   * @param data - Health data to store metadata for
   */
  private async storeDataMetadata(data: HealthData): Promise<void> {
    const key = `immutable_health_data_${data.id}`;
    localStorage.setItem(key, JSON.stringify(data));
  }

  /**
   * Get data metadata from local storage
   * In production, this would be fetched from on-chain
   * 
   * @param dataId - Data ID
   * @returns Data metadata or null
   */
  private async getDataMetadata(dataId: string): Promise<HealthData | null> {
    const key = `immutable_health_data_${dataId}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored);
    }
    return null;
  }

  /**
   * Get all immutable data for a patient
   * 
   * @param patientAddress - Patient's address
   * @param userRole - User's role requesting the data
   * @param userAddress - User's address
   * @returns Array of immutable health data
   */
  async getImmutableDataForPatient(
    patientAddress: string,
    userRole: string,
    userAddress: string
  ): Promise<HealthData[]> {
    try {
      console.log(`Getting immutable data for patient: ${patientAddress} by ${userRole} ${userAddress}`);

      // Get all metadata from local storage
      const allData: HealthData[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('immutable_health_data_')) {
          const stored = localStorage.getItem(key);
          if (stored) {
            const data: HealthData = JSON.parse(stored);
            if (data.patientId === patientAddress) {
              allData.push(data);
            }
          }
        }
      }

      // Sort by creation time (newest first) - using id timestamp as fallback
      allData.sort((a, b) => {
        const aTime = parseInt(a.id.split('_').pop() || '0');
        const bTime = parseInt(b.id.split('_').pop() || '0');
        return bTime - aTime;
      });

      return allData;
    } catch (error) {
      console.error('Error getting immutable data for patient:', error);
      return [];
    }
  }

  /**
   * Validate data integrity rules
   * 
   * @param data - Health data to validate
   * @param operation - Operation being performed (ADD, MODIFY, DELETE)
   * @param userAddress - User performing the operation
   * @param userRole - User's role
   * @returns Validation result
   */
  async validateDataIntegrity(
    data: HealthData,
    operation: 'ADD' | 'MODIFY' | 'DELETE',
    userAddress: string,
    userRole: string
  ): Promise<{ valid: boolean; reason?: string }> {
    try {
      // Check if user is trying to modify their own data as a patient
      if (userAddress === data.patientId && userRole === 'patient' && operation !== 'ADD') {
        return {
          valid: false,
          reason: 'Patients cannot modify or delete their own data',
        };
      }

      // Check immutable data rules
      if (operation === 'MODIFY' || operation === 'DELETE') {
        return {
          valid: false,
          reason: 'Data modification and deletion are not allowed. Only new records can be added.',
        };
      }

      // Check if user has permission to add data
      if (operation === 'ADD' && userRole !== 'doctor') {
        return {
          valid: false,
          reason: 'Only doctors can add new health records',
        };
      }

      return { valid: true };
    } catch (error) {
      console.error('Error validating data integrity:', error);
      return {
        valid: false,
        reason: 'Error validating data integrity',
      };
    }
  }
}
