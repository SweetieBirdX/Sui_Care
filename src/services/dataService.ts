import { SealService } from './sealService';
import { WalrusService } from './walrusService';
import { PolicyService, type RoleType, type DataType } from './policyService';
import { SuiClient } from '@mysten/sui/client';
import { 
  type HealthData, 
  type HealthDataType, 
  type SaveHealthDataResponse, 
  type GetHealthDataResponse,
  type HealthDataListResponse
} from '../types/healthData';

/**
 * Centralized DataService for managing sensitive health data
 * Implements Seal encryption and Walrus storage for privacy and data integrity
 */
export class DataService {
  private sealService: SealService;
  private walrusService: WalrusService;
  private policyService: PolicyService;

  constructor(suiClient: SuiClient, packageId?: string, policyObjectId?: string) {
    this.sealService = new SealService(suiClient);
    this.walrusService = new WalrusService('testnet');
    this.policyService = new PolicyService(suiClient, packageId, policyObjectId);
  }

  /**
   * Save health data with Seal encryption and Walrus storage
   * 
   * @param data - Health data to save
   * @param policyId - Access policy ID for encryption
   * @param userAddress - User's wallet address
   * @param userRole - User's role (doctor, pharmacist, patient)
   * @returns SaveHealthDataResponse with blob ID and policy ID
   */
  async saveHealthData(
    data: HealthData, 
    policyId: string, 
    userAddress: string, 
    userRole: string
  ): Promise<SaveHealthDataResponse> {
    try {
      console.log(`Saving health data: ${data.type} for user: ${userAddress}`);

      // Check on-chain permissions
      const roleType = this.mapRoleToType(userRole);
      const dataType = this.mapHealthDataTypeToType(data.type);
      
      const permissionCheck = await this.policyService.checkPermission(
        userAddress,
        roleType,
        dataType,
        this.policyService.getPermissions().WRITE
      );

      if (!permissionCheck.hasPermission) {
        throw new Error(`User ${userRole} does not have permission to write ${data.type}: ${permissionCheck.reason}`);
      }

      // Check if user can modify this data (self-modification restrictions)
      const canModifyCheck = await this.policyService.canModifyData(
        userAddress,
        data.patientId,
        roleType,
        dataType
      );

      if (!canModifyCheck.hasPermission) {
        throw new Error(`User cannot modify this data: ${canModifyCheck.reason}`);
      }

      // Encrypt data using Seal
      const encryptedBlob = await this.sealService.encryptRoleData(
        {
          address: userAddress,
          role: userRole,
          timestamp: Date.now(),
          kycVerified: true,
        },
        userAddress
      );

      // Generate unique blob ID
      const blobId = this.generateBlobId(data.id, data.type, userAddress);

      // Store encrypted data in Walrus
      await this.walrusService.storeRoleData(encryptedBlob, blobId);

      // Update data metadata
      data.metadata.blobId = blobId;
      data.metadata.encrypted = true;
      data.metadata.policyId = policyId;

      // Store metadata in local storage (in production, this would be on-chain)
      await this.storeDataMetadata(data);

      console.log(`Health data saved successfully: ${data.id} -> ${blobId}`);

      return {
        success: true,
        dataId: data.id,
        blobId,
        policyId,
        encrypted: true,
      };

    } catch (error) {
      console.error('Error saving health data:', error);
      return {
        success: false,
        dataId: data.id,
        blobId: '',
        policyId,
        encrypted: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get and decrypt health data from Walrus
   * 
   * @param blobId - Walrus blob ID
   * @param userRole - User's role
   * @param userAddress - User's wallet address
   * @returns GetHealthDataResponse with decrypted data
   */
  async getAndDecryptHealthData(
    blobId: string, 
    userRole: string, 
    userAddress: string
  ): Promise<GetHealthDataResponse> {
    try {
      console.log(`Retrieving health data: ${blobId} for user: ${userAddress}`);

      // Retrieve encrypted data from Walrus
      const encryptedBlob = await this.walrusService.getRoleData(blobId);
      if (!encryptedBlob) {
        throw new Error(`Health data not found: ${blobId}`);
      }

      // Decrypt data using Seal
      const decryptedData = await this.sealService.decryptRoleData(encryptedBlob, userAddress);
      if (!decryptedData) {
        throw new Error('Failed to decrypt health data');
      }

      // Get data metadata
      const metadata = await this.getDataMetadata(blobId);
      if (!metadata) {
        throw new Error('Data metadata not found');
      }

      // Check on-chain permissions for reading
      const roleType = this.mapRoleToType(userRole);
      const dataType = this.mapHealthDataTypeToType(metadata.type);
      
      const permissionCheck = await this.policyService.checkPermission(
        userAddress,
        roleType,
        dataType,
        this.policyService.getPermissions().READ
      );

      if (!permissionCheck.hasPermission) {
        throw new Error(`User ${userRole} does not have permission to read ${metadata.type}: ${permissionCheck.reason}`);
      }

      // Reconstruct health data
      const healthData: HealthData = {
        ...metadata,
        data: decryptedData,
      };

      console.log(`Health data retrieved successfully: ${blobId}`);

      return {
        success: true,
        data: healthData,
      };

    } catch (error) {
      console.error('Error retrieving health data:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * List health data for a user with pagination
   * 
   * @param userAddress - User's wallet address
   * @param userRole - User's role
   * @param page - Page number
   * @param limit - Items per page
   * @param type - Filter by data type
   * @returns HealthDataListResponse with paginated data
   */
  async listHealthData(
    userAddress: string,
    userRole: string,
    page: number = 1,
    limit: number = 10,
    type?: HealthDataType
  ): Promise<HealthDataListResponse> {
    try {
      // Get user's data metadata
      const allMetadata = await this.getUserDataMetadata(userAddress);
      
      // Filter by type if specified
      let filteredMetadata = allMetadata;
      if (type) {
        filteredMetadata = allMetadata.filter(meta => meta.type === type);
      }

      // Apply pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedMetadata = filteredMetadata.slice(startIndex, endIndex);

      // Get full data for each item
      const healthData: HealthData[] = [];
      for (const metadata of paginatedMetadata) {
        if (metadata.metadata.blobId) {
          const result = await this.getAndDecryptHealthData(metadata.metadata.blobId, userRole, userAddress);
          if (result.success && result.data) {
            healthData.push(result.data);
          }
        }
      }

      return {
        success: true,
        data: healthData,
        total: filteredMetadata.length,
        page,
        limit,
      };

    } catch (error) {
      console.error('Error listing health data:', error);
      return {
        success: false,
        data: [],
        total: 0,
        page,
        limit,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Delete health data
   * 
   * @param blobId - Walrus blob ID
   * @param userRole - User's role
   * @param userAddress - User's wallet address
   * @returns Success status
   */
  async deleteHealthData(
    blobId: string,
    userRole: string,
    _userAddress: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Get data metadata
      const metadata = await this.getDataMetadata(blobId);
      if (!metadata) {
        throw new Error('Data not found');
      }

      // Check on-chain permissions for deletion
      const roleType = this.mapRoleToType(userRole);
      const dataType = this.mapHealthDataTypeToType(metadata.type);
      
      const permissionCheck = await this.policyService.checkPermission(
        _userAddress,
        roleType,
        dataType,
        this.policyService.getPermissions().DELETE
      );

      if (!permissionCheck.hasPermission) {
        throw new Error(`User ${userRole} does not have permission to delete ${metadata.type}: ${permissionCheck.reason}`);
      }

      // Delete from Walrus
      await this.walrusService.deleteRoleData(blobId);

      // Delete metadata
      await this.deleteDataMetadata(blobId);

      return { success: true };

    } catch (error) {
      console.error('Error deleting health data:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Private helper methods

  private generateBlobId(dataId: string, type: HealthDataType, userAddress: string): string {
    const timestamp = Date.now();
    return `health_${type}_${dataId}_${userAddress.slice(0, 8)}_${timestamp}`;
  }

  // Mapping functions for role and data type conversion
  private mapRoleToType(userRole: string): RoleType {
    switch (userRole.toLowerCase()) {
      case 'doctor':
        return this.policyService.getRoleTypes().DOCTOR;
      case 'pharmacist':
        return this.policyService.getRoleTypes().PHARMACIST;
      case 'patient':
        return this.policyService.getRoleTypes().PATIENT;
      default:
        throw new Error(`Unknown role: ${userRole}`);
    }
  }

  private mapHealthDataTypeToType(healthDataType: HealthDataType): DataType {
    switch (healthDataType) {
      case 'prescription':
        return this.policyService.getDataTypes().PRESCRIPTION;
      case 'lab_result':
        return this.policyService.getDataTypes().LAB_RESULT;
      case 'medical_record':
        return this.policyService.getDataTypes().MEDICAL_RECORD;
      case 'diagnosis':
        return this.policyService.getDataTypes().DIAGNOSIS;
      case 'treatment_plan':
        return this.policyService.getDataTypes().TREATMENT_PLAN;
      case 'vital_signs':
        return this.policyService.getDataTypes().VITAL_SIGNS;
      case 'imaging_result':
        return this.policyService.getDataTypes().IMAGING_RESULT;
      case 'medication_history':
        return this.policyService.getDataTypes().MEDICATION_HISTORY;
      default:
        return this.policyService.getDataTypes().GENERAL_RECORD;
    }
  }

  private async storeDataMetadata(data: HealthData): Promise<void> {
    // In production, this would store on-chain
    // For now, use localStorage
    const key = `health_data_${data.id}`;
    localStorage.setItem(key, JSON.stringify(data));
  }

  private async getDataMetadata(blobId: string): Promise<HealthData | null> {
    // In production, this would fetch from on-chain storage
    // For now, use localStorage
    const keys = Object.keys(localStorage).filter(key => key.startsWith('health_data_'));
    for (const key of keys) {
      const data = JSON.parse(localStorage.getItem(key) || '{}');
      if (data.metadata?.blobId === blobId) {
        return data;
      }
    }
    return null;
  }

  private async getUserDataMetadata(userAddress: string): Promise<HealthData[]> {
    // In production, this would fetch from on-chain storage
    // For now, use localStorage
    const keys = Object.keys(localStorage).filter(key => key.startsWith('health_data_'));
    const userData: HealthData[] = [];
    
    for (const key of keys) {
      const data = JSON.parse(localStorage.getItem(key) || '{}');
      if (data.patientId === userAddress || data.doctorId === userAddress || data.pharmacistId === userAddress) {
        userData.push(data);
      }
    }
    
    return userData;
  }

  private async deleteDataMetadata(blobId: string): Promise<void> {
    // In production, this would delete from on-chain storage
    // For now, use localStorage
    const keys = Object.keys(localStorage).filter(key => key.startsWith('health_data_'));
    for (const key of keys) {
      const data = JSON.parse(localStorage.getItem(key) || '{}');
      if (data.metadata?.blobId === blobId) {
        localStorage.removeItem(key);
        break;
      }
    }
  }
}
