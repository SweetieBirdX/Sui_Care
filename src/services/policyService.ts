import { SuiClient } from '@mysten/sui/client';
import { Transaction } from '@mysten/sui/transactions';
import { ENV_VARS } from '../config/production';

// Move contract constants
export const ROLE_TYPES = {
  DOCTOR: 1,
  PHARMACIST: 2,
  PATIENT: 3,
} as const;

export const DATA_TYPES = {
  PRESCRIPTION: 1,
  LAB_RESULT: 2,
  GENERAL_RECORD: 3,
  MEDICAL_RECORD: 4,
  DIAGNOSIS: 5,
  TREATMENT_PLAN: 6,
  VITAL_SIGNS: 7,
  IMAGING_RESULT: 8,
  MEDICATION_HISTORY: 9,
} as const;

export const PERMISSIONS = {
  READ: 1,
  WRITE: 2,
  DELETE: 4,
  SHARE: 8,
} as const;

export type RoleType = typeof ROLE_TYPES[keyof typeof ROLE_TYPES];
export type DataType = typeof DATA_TYPES[keyof typeof DATA_TYPES];
export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

export interface PolicyCheckResult {
  hasPermission: boolean;
  reason?: string;
  timestamp: number;
}

export interface AccessPolicy {
  id: string;
  version: number;
  permissions: Array<{
    roleType: number;
    dataType: number;
    permissions: number;
  }>;
  createdAt: number;
  updatedAt: number;
  admin: string;
}

/**
 * Service for interacting with on-chain access policies
 */
export class PolicyService {
  private suiClient: SuiClient;
  private packageId: string;
  private policyObjectId: string;

  constructor(suiClient: SuiClient, packageId?: string, policyObjectId?: string) {
    this.suiClient = suiClient;
    // Use production configuration if not provided
    this.packageId = packageId || ENV_VARS.POLICY_PACKAGE_ID;
    this.policyObjectId = policyObjectId || ENV_VARS.POLICY_OBJECT_ID;
  }

  /**
   * Check if a user has permission to perform an operation
   */
  async checkPermission(
    userAddress: string,
    roleType: RoleType,
    dataType: DataType,
    operation: Permission
  ): Promise<PolicyCheckResult> {
    try {
      const txb = new Transaction();
      
      // Call the check_permission function
      txb.moveCall({
        target: `${this.packageId}::health_access_policy::check_permission`,
        arguments: [
          txb.object(this.policyObjectId),
          txb.pure.string(userAddress),
          txb.pure.u8(roleType),
          txb.pure.u8(dataType),
          txb.pure.u8(operation),
        ],
      });

      // Execute the transaction
      const result = await this.suiClient.devInspectTransactionBlock({
        transactionBlock: txb,
        sender: userAddress,
      });

      if (result.effects.status.status === 'success') {
        // Parse the return value to get the permission result
        const hasPermission = this.parsePermissionResult(result);
        
        return {
          hasPermission,
          timestamp: Date.now(),
        };
      } else {
        return {
          hasPermission: false,
          reason: result.effects.status.error || 'Unknown error',
          timestamp: Date.now(),
        };
      }
    } catch (error) {
      console.error('Error checking permission:', error);
      return {
        hasPermission: false,
        reason: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now(),
      };
    }
  }

  /**
   * Check if a user can modify data (with self-modification restrictions)
   */
  async canModifyData(
    userAddress: string,
    dataOwnerAddress: string,
    roleType: RoleType,
    dataType: DataType
  ): Promise<PolicyCheckResult> {
    try {
      const txb = new Transaction();
      
      // Call the can_modify_data function
      txb.moveCall({
        target: `${this.packageId}::health_access_policy::can_modify_data`,
        arguments: [
          txb.object(this.policyObjectId),
          txb.pure.string(userAddress),
          txb.pure.string(dataOwnerAddress),
          txb.pure.u8(roleType),
          txb.pure.u8(dataType),
        ],
      });

      const result = await this.suiClient.devInspectTransactionBlock({
        transactionBlock: txb,
        sender: userAddress,
      });

      if (result.effects.status.status === 'success') {
        const canModify = this.parsePermissionResult(result);
        
        return {
          hasPermission: canModify,
          timestamp: Date.now(),
        };
      } else {
        return {
          hasPermission: false,
          reason: result.effects.status.error || 'Unknown error',
          timestamp: Date.now(),
        };
      }
    } catch (error) {
      console.error('Error checking modify permission:', error);
      return {
        hasPermission: false,
        reason: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now(),
      };
    }
  }

  /**
   * Check if a user can authorize access for another user
   */
  async canAuthorizeAccess(
    authorizerAddress: string,
    targetUserAddress: string,
    roleType: RoleType
  ): Promise<PolicyCheckResult> {
    try {
      const txb = new Transaction();
      
      // Call the can_authorize_access function
      txb.moveCall({
        target: `${this.packageId}::health_access_policy::can_authorize_access`,
        arguments: [
          txb.object(this.policyObjectId),
          txb.pure.string(authorizerAddress),
          txb.pure.string(targetUserAddress),
          txb.pure.u8(roleType),
        ],
      });

      const result = await this.suiClient.devInspectTransactionBlock({
        transactionBlock: txb,
        sender: authorizerAddress,
      });

      if (result.effects.status.status === 'success') {
        const canAuthorize = this.parsePermissionResult(result);
        
        return {
          hasPermission: canAuthorize,
          timestamp: Date.now(),
        };
      } else {
        return {
          hasPermission: false,
          reason: result.effects.status.error || 'Unknown error',
          timestamp: Date.now(),
        };
      }
    } catch (error) {
      console.error('Error checking authorization permission:', error);
      return {
        hasPermission: false,
        reason: error instanceof Error ? error.message : 'Unknown error',
        timestamp: Date.now(),
      };
    }
  }

  /**
   * Get the current access policy
   */
  async getAccessPolicy(): Promise<AccessPolicy | null> {
    try {
      const policyObject = await this.suiClient.getObject({
        id: this.policyObjectId,
        options: {
          showContent: true,
        },
      });

      if (policyObject.data?.content && 'fields' in policyObject.data.content) {
        const fields = policyObject.data.content.fields as any;
        
        return {
          id: this.policyObjectId,
          version: parseInt(fields.version),
          permissions: fields.permissions || [],
          createdAt: parseInt(fields.created_at),
          updatedAt: parseInt(fields.updated_at),
          admin: fields.admin,
        };
      }

      return null;
    } catch (error) {
      console.error('Error getting access policy:', error);
      return null;
    }
  }

  /**
   * Get role constants
   */
  getRoleTypes() {
    return ROLE_TYPES;
  }

  /**
   * Get data type constants
   */
  getDataTypes() {
    return DATA_TYPES;
  }

  /**
   * Get permission constants
   */
  getPermissions() {
    return PERMISSIONS;
  }

  /**
   * Parse permission result from transaction response
   */
  private parsePermissionResult(result: any): boolean {
    try {
      // The Move function returns a boolean value
      // We need to parse it from the transaction result
      if (result.results && result.results.length > 0) {
        const returnValue = result.results[0].returnValues;
        if (returnValue && returnValue.length > 0) {
          // Convert bytes to boolean
          const bytes = returnValue[0][1];
          return bytes[0] === 1;
        }
      }
      return false;
    } catch (error) {
      console.error('Error parsing permission result:', error);
      return false;
    }
  }

  /**
   * Create a new access policy (admin only)
   * Note: This function requires a signer and should be called from a wallet context
   */
  async createAccessPolicy(): Promise<string> {
    // This function requires wallet integration and signer
    // For now, return a placeholder
    throw new Error('createAccessPolicy requires wallet integration. Use the deployed policy object ID instead.');
  }
}
