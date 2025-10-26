import { useState, useCallback, useEffect } from 'react';
import { useCurrentAccount, useSuiClient } from '@mysten/dapp-kit';
import { SealService, type RoleMetadata } from '../services/sealService';
import { WalrusService } from '../services/walrusService';

// WARNING: Walrus Testnet is periodically wiped and restarted
// This means user role data can be lost at any time
// For production use, migrate to Mainnet with proper JWT authentication
// 
// PRODUCTION REQUIREMENTS:
// - Mainnet RPC endpoints must be used for production applications
// - Rate limiting applies; high traffic requires dedicated nodes or professional providers
// - Seal's on-chain policy requirement means Move contracts and Key Servers must be tested in stable Mainnet environment

export type UserRole = 'DOCTOR' | 'PHARMACY' | 'PATIENT' | 'UNASSIGNED';

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

    // TEMPORARY FIX: Skip Walrus check due to Testnet instability
    // Go directly to role selection
    console.warn('⚠️ Walrus Testnet is unstable - Skipping role check, going to role selection');
    setStatus('not_found');
    setRoleData({ role: 'UNASSIGNED', selectedAt: new Date(), kycVerified: true });
    console.log('🔍 useUserRole: Set roleData to UNASSIGNED with kycVerified: true');
    return null;
  }, [account?.address]);

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
      console.log('🔄 Storing role data in Walrus Testnet (data may be wiped at any time)');
      await walrusService.storeRoleData(encryptedBlob, blobId);
      console.log('✅ Role data stored successfully in Walrus');

      // Update local state
      const userRoleData: UserRoleData = {
        role,
        selectedAt: new Date(roleMetadata.timestamp),
        kycVerified,
        blobId,
      };

      setRoleData(userRoleData);
      setStatus('loaded');
      console.log('🎉 User role loaded successfully');
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
  }, [account?.address]);

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
