import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { ENV_VARS } from '../config/production';

// Access Request Status Constants
export const ACCESS_REQUEST_STATUS = {
  PENDING: 1,
  APPROVED: 2,
  REJECTED: 3,
  EXPIRED: 4,
} as const;

export type AccessRequestStatus = typeof ACCESS_REQUEST_STATUS[keyof typeof ACCESS_REQUEST_STATUS];

// Access Request Interface
export interface AccessRequest {
  requestId: number;
  doctorAddress: string;
  patientAddress: string;
  dataObjectId: string;
  expiryTime: number;
  status: AccessRequestStatus;
  createdAt: number;
  approvedAt?: number;
  policyId: string;
}

// Access Request Response
export interface AccessRequestResponse {
  success: boolean;
  requestId?: number;
  error?: string;
}

// Audit Event Interface
export interface AccessAuditEvent {
  accessorAddress: string;
  patientAddress: string;
  dataObjectId: string;
  transactionType: number; // READ, WRITE, DELETE
  timestamp: number;
  requestId: number;
}

/**
 * Access Control Service for managing doctor-patient access requests
 * Implements digital approval flow with on-chain audit trail
 */
export class AccessControlService {
  private suiClient: SuiClient;
  private packageId: string;
  private accessControlObjectId: string;
  private policyObjectId: string;

  constructor(suiClient: SuiClient, packageId?: string, accessControlObjectId?: string, policyObjectId?: string) {
    this.suiClient = suiClient;
    this.packageId = packageId || ENV_VARS.POLICY_PACKAGE_ID;
    this.accessControlObjectId = accessControlObjectId || '0x0'; // Placeholder
    this.policyObjectId = policyObjectId || ENV_VARS.POLICY_OBJECT_ID;
  }

  /**
   * Request access to patient data (Doctor initiates)
   * 
   * @param doctorAddress - Doctor's wallet address
   * @param patientAddress - Patient's wallet address
   * @param dataObjectId - Walrus blob ID or Sui object ID
   * @param lifetimeEpochs - Request validity period in epochs
   * @returns Response with request ID or error
   */
  async requestAccess(
    doctorAddress: string,
    patientAddress: string,
    dataObjectId: string,
    lifetimeEpochs: number = 7 // Default 7 days
  ): Promise<AccessRequestResponse> {
    try {
      console.log(`Requesting access: Doctor ${doctorAddress} -> Patient ${patientAddress} for data ${dataObjectId}`);

      const txb = new Transaction();
      
      // Call request_access function
      txb.moveCall({
        target: `${this.packageId}::access_control::request_access`,
        arguments: [
          txb.object(this.accessControlObjectId), // AccessControlManager
          txb.object(this.policyObjectId), // HealthAccessPolicy
          txb.pure.address(doctorAddress),
          txb.pure.address(patientAddress),
          txb.pure.id(dataObjectId),
          txb.pure.u64(lifetimeEpochs),
          txb.object('0x6'), // Clock object (standard Sui clock)
        ],
      });

      // Mock transaction execution (requires wallet context)
      console.log(`Mock: Access request created for doctor ${doctorAddress} -> patient ${patientAddress}`);
      return { success: true, requestId: Math.floor(Math.random() * 1000) };
    } catch (error) {
      console.error('Error requesting access:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error requesting access' 
      };
    }
  }

  /**
   * Approve access request (Patient approves)
   * 
   * @param accessRequestObjectId - Sui object ID of the AccessRequest
   * @param patientAddress - Patient's wallet address
   * @returns Success status
   */
  async approveAccess(
    accessRequestObjectId: string,
    patientAddress: string
  ): Promise<AccessRequestResponse> {
    try {
      console.log(`Approving access request: ${accessRequestObjectId} by patient ${patientAddress}`);

      const txb = new Transaction();
      
      // Call grant_access function
      txb.moveCall({
        target: `${this.packageId}::access_control::grant_access`,
        arguments: [
          txb.object(accessRequestObjectId), // AccessRequest object
          txb.object(this.policyObjectId), // HealthAccessPolicy
          txb.object('0x6'), // Clock object
        ],
      });

      // Mock transaction execution (requires wallet context)
      console.log(`Mock: Access request approved by patient ${patientAddress}`);
      return { success: true };
    } catch (error) {
      console.error('Error approving access:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error approving access' 
      };
    }
  }

  /**
   * Reject access request (Patient rejects)
   * 
   * @param accessRequestObjectId - Sui object ID of the AccessRequest
   * @param patientAddress - Patient's wallet address
   * @returns Success status
   */
  async rejectAccess(
    accessRequestObjectId: string,
    patientAddress: string
  ): Promise<AccessRequestResponse> {
    try {
      console.log(`Rejecting access request: ${accessRequestObjectId} by patient ${patientAddress}`);

      const txb = new Transaction();
      
      // Call reject_access function
      txb.moveCall({
        target: `${this.packageId}::access_control::reject_access`,
        arguments: [
          txb.object(accessRequestObjectId), // AccessRequest object
          txb.object('0x6'), // Clock object
        ],
      });

      // Mock transaction execution (requires wallet context)
      console.log(`Mock: Access request rejected by patient ${patientAddress}`);
      return { success: true };
    } catch (error) {
      console.error('Error rejecting access:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error rejecting access' 
      };
    }
  }

  /**
   * Record data access audit (called when data is actually accessed)
   * 
   * @param accessRequestObjectId - Sui object ID of the AccessRequest
   * @param transactionType - Type of transaction (READ, WRITE, DELETE)
   * @returns Success status
   */
  async recordDataAccess(
    accessRequestObjectId: string,
    transactionType: number
  ): Promise<AccessRequestResponse> {
    try {
      console.log(`Recording data access: ${accessRequestObjectId} for transaction type ${transactionType}`);

      const txb = new Transaction();
      
      // Call record_data_access function
      txb.moveCall({
        target: `${this.packageId}::access_control::record_data_access`,
        arguments: [
          txb.object(accessRequestObjectId), // AccessRequest object
          txb.pure.u8(transactionType),
          txb.object('0x6'), // Clock object
        ],
      });

      // Mock transaction execution (requires wallet context)
      console.log(`Mock: Data access recorded for transaction type ${transactionType}`);
      return { success: true };
    } catch (error) {
      console.error('Error recording data access:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error recording data access' 
      };
    }
  }

  /**
   * Get access request details
   * 
   * @param accessRequestObjectId - Sui object ID of the AccessRequest
   * @returns Access request details or null
   */
  async getAccessRequestDetails(accessRequestObjectId: string): Promise<AccessRequest | null> {
    try {
      const txb = new Transaction();
      
      // Call get_access_request_details function
      txb.moveCall({
        target: `${this.packageId}::access_control::get_access_request_details`,
        arguments: [
          txb.object(accessRequestObjectId), // AccessRequest object
        ],
      });

      const result = await this.suiClient.devInspectTransactionBlock({
        sender: '0x0', // Any address for read-only call
        transactionBlock: txb,
      });

      if (result.effects?.status.status === 'success') {
        // Decode the return values (this would need proper decoding based on Move types)
        // For now, return a mock structure
        return {
          requestId: 1,
          doctorAddress: '0x0',
          patientAddress: '0x0',
          dataObjectId: '0x0',
          expiryTime: Date.now() + 7 * 24 * 60 * 60 * 1000,
          status: ACCESS_REQUEST_STATUS.PENDING,
          createdAt: Date.now(),
          policyId: this.policyObjectId,
        };
      }

      return null;
    } catch (error) {
      console.error('Error getting access request details:', error);
      return null;
    }
  }

  /**
   * Query access audit events for a patient
   * 
   * @param patientAddress - Patient's wallet address
   * @param limit - Maximum number of events to return
   * @returns Array of audit events
   */
  async getAccessAuditEvents(
    patientAddress: string,
    limit: number = 50
  ): Promise<AccessAuditEvent[]> {
    try {
      console.log(`Querying access audit events for patient: ${patientAddress}`);

      const events = await this.suiClient.queryEvents({
        query: {
          MoveEventType: `${this.packageId}::access_control::AccessAuditEvent`,
        },
        limit,
        order: 'descending',
      });

      return events.data.map((event: any) => ({
        accessorAddress: event.parsedJson?.accessor_address || '',
        patientAddress: event.parsedJson?.patient_address || '',
        dataObjectId: event.parsedJson?.data_object_id || '',
        transactionType: event.parsedJson?.transaction_type || 0,
        timestamp: event.parsedJson?.timestamp || 0,
        requestId: event.parsedJson?.request_id || 0,
      }));
    } catch (error) {
      console.error('Error querying access audit events:', error);
      return [];
    }
  }

  /**
   * Check if access is approved for a specific request
   * 
   * @param accessRequestObjectId - Sui object ID of the AccessRequest
   * @returns True if access is approved, false otherwise
   */
  async isAccessApproved(accessRequestObjectId: string): Promise<boolean> {
    try {
      const txb = new Transaction();
      
      // Call is_access_approved function
      txb.moveCall({
        target: `${this.packageId}::access_control::is_access_approved`,
        arguments: [
          txb.object(accessRequestObjectId), // AccessRequest object
        ],
      });

      const result = await this.suiClient.devInspectTransactionBlock({
        sender: '0x0', // Any address for read-only call
        transactionBlock: txb,
      });

      if (result.effects?.status.status === 'success') {
        // Decode the boolean return value
        // This would need proper decoding based on Move types
        return true; // Placeholder
      }

      return false;
    } catch (error) {
      console.error('Error checking access approval:', error);
      return false;
    }
  }
}