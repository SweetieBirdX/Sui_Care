import { useState, useCallback, useEffect } from 'react';
import { useCurrentAccount, useSuiClient } from '@mysten/dapp-kit';
import { SealService, type RoleMetadata } from '../services/sealService';
import { WalrusService } from '../services/walrusService';

export type UserRole = 'doctor' | 'pharmacist' | 'patient';

export interface UserRoleData {
  role: UserRole;
  selectedAt: Date;
  kycVerified: boolean;
  blobId?: string;
}

export type RoleStatus = 'idle' | 'loading' | 'loaded' | 'error' | 'not_found';

export function useUserRole() {
  const account = useCurrentAccount();
  const suiClient = useSuiClient();
  const [roleData, setRoleData] = useState<UserRoleData | null>(null);
  const [status, setStatus] = useState<RoleStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  // Initialize services
  const sealService = new SealService(suiClient);
  const walrusService = new WalrusService('testnet');

  // Load user role from Walrus
  const loadUserRole = useCallback(async (): Promise<UserRoleData | null> => {
    if (!account?.address) {
      setStatus('idle');
      return null;
    }

    setStatus('loading');
    setError(null);

    try {
      // Generate blob ID based on user address
      const blobId = `role_${account.address.slice(0, 8)}_${Date.now()}`;
      
      // Try to find existing role data by checking multiple possible blob IDs
      const possibleBlobIds = [
        blobId,
        `role_${account.address.slice(0, 8)}_doctor`,
        `role_${account.address.slice(0, 8)}_pharmacist`,
        `role_${account.address.slice(0, 8)}_patient`,
      ];

      let foundBlobId: string | null = null;
      let encryptedData: Uint8Array | null = null;

      // Check each possible blob ID
      for (const id of possibleBlobIds) {
        const exists = await walrusService.checkRoleDataExists(id);
        if (exists) {
          const data = await walrusService.getRoleData(id);
          if (data) {
            foundBlobId = id;
            encryptedData = data;
            break;
          }
        }
      }

      if (!encryptedData || !foundBlobId) {
        setStatus('not_found');
        return null;
      }

      // Decrypt the role data
      const decryptedRoleData = await sealService.decryptRoleData(encryptedData, account.address);
      
      if (!decryptedRoleData) {
        setStatus('error');
        setError('Failed to decrypt role data');
        return null;
      }

      const userRoleData: UserRoleData = {
        role: decryptedRoleData.role as UserRole,
        selectedAt: new Date(decryptedRoleData.timestamp),
        kycVerified: decryptedRoleData.kycVerified,
        blobId: foundBlobId,
      };

      setRoleData(userRoleData);
      setStatus('loaded');
      return userRoleData;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      setStatus('error');
      console.error('Error loading user role:', err);
      return null;
    }
  }, [account?.address, sealService, walrusService]);

  // Save user role to Walrus
  const saveUserRole = useCallback(async (role: UserRole, kycVerified: boolean = true): Promise<boolean> => {
    if (!account?.address) {
      setError('No wallet connected');
      return false;
    }

    setStatus('loading');
    setError(null);

    try {
      // Create role metadata
      const roleMetadata: RoleMetadata = {
        address: account.address,
        role,
        timestamp: Date.now(),
        kycVerified,
      };

      // Generate blob ID
      const blobId = sealService.generateBlobId(account.address, role);

      // Encrypt role data
      const encryptedBlob = await sealService.encryptRoleData(roleMetadata, account.address);

      // Store in Walrus
      await walrusService.storeRoleData(encryptedBlob, blobId);

      // Update local state
      const userRoleData: UserRoleData = {
        role,
        selectedAt: new Date(roleMetadata.timestamp),
        kycVerified,
        blobId,
      };

      setRoleData(userRoleData);
      setStatus('loaded');
      return true;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      setStatus('error');
      console.error('Error saving user role:', err);
      return false;
    }
  }, [account?.address, sealService, walrusService]);

  // Clear user role
  const clearUserRole = useCallback(async (): Promise<boolean> => {
    if (!roleData?.blobId) {
      setRoleData(null);
      setStatus('idle');
      return true;
    }

    try {
      // Delete from Walrus
      await walrusService.deleteRoleData(roleData.blobId);
      
      // Clear local state
      setRoleData(null);
      setStatus('idle');
      setError(null);
      return true;
    } catch (err) {
      console.error('Error clearing user role:', err);
      return false;
    }
  }, [roleData?.blobId, walrusService]);

  // Auto-load role when account changes
  useEffect(() => {
    if (account?.address) {
      loadUserRole();
    } else {
      setRoleData(null);
      setStatus('idle');
      setError(null);
    }
  }, [account?.address, loadUserRole]);

  return {
    roleData,
    status,
    error,
    loadUserRole,
    saveUserRole,
    clearUserRole,
    isLoading: status === 'loading',
    isLoaded: status === 'loaded',
    isError: status === 'error',
    isNotFound: status === 'not_found',
  };
}
