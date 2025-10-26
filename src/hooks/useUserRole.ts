import { useState, useCallback, useEffect } from 'react';
import { useCurrentAccount } from '@mysten/dapp-kit';

// MOCK VERSION: Simplified role management for UI development
// This bypasses Seal encryption and Walrus storage issues temporarily
// In production, this should use real Seal/Walrus integration

export type UserRole = 'DOCTOR' | 'PHARMACY' | 'PATIENT' | 'UNASSIGNED';

export interface UserRoleData {
  role: UserRole;
  selectedAt: Date;
  kycVerified: boolean;
  blobId?: string;
}

export type RoleStatus = 'idle' | 'loading' | 'loaded' | 'error' | 'not_found';

// Mock role storage key
const ROLE_STORAGE_KEY = 'sui_care_mock_role';

// Helper function to get stored role from localStorage
function getStoredRole(address: string | undefined): UserRoleData | null {
  if (!address) return null;
  
  try {
    const stored = localStorage.getItem(`${ROLE_STORAGE_KEY}_${address}`);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        ...parsed,
        selectedAt: new Date(parsed.selectedAt)
      };
    }
  } catch (error) {
    console.warn('Failed to parse stored role:', error);
  }
  
  return null;
}

// Helper function to store role in localStorage
function storeRole(address: string, roleData: UserRoleData): void {
  try {
    localStorage.setItem(`${ROLE_STORAGE_KEY}_${address}`, JSON.stringify(roleData));
  } catch (error) {
    console.warn('Failed to store role:', error);
  }
}

// Helper function to clear stored role
function clearStoredRole(address: string): void {
  try {
    localStorage.removeItem(`${ROLE_STORAGE_KEY}_${address}`);
  } catch (error) {
    console.warn('Failed to clear stored role:', error);
  }
}

export function useUserRole() {
  const account = useCurrentAccount();
  const [roleData, setRoleData] = useState<UserRoleData | null>(null);
  const [status, setStatus] = useState<RoleStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  // Load user role from localStorage (mock)
  const loadUserRole = useCallback(async (): Promise<UserRoleData | null> => {
    if (!account?.address) {
      setStatus('idle');
      return null;
    }

    setStatus('loading');
    
    try {
      // Simulate loading delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const storedRole = getStoredRole(account.address);
      
      if (storedRole) {
        setRoleData(storedRole);
        setStatus('loaded');
        console.log('🎭 Mock role loaded:', storedRole.role);
        return storedRole;
      } else {
        setStatus('not_found');
        setRoleData({ role: 'UNASSIGNED', selectedAt: new Date(), kycVerified: true });
        console.log('🔍 Mock role: No role found, setting to UNASSIGNED');
        return null;
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      setStatus('error');
      console.error('Error loading mock role:', err);
      return null;
    }
  }, [account?.address]);

  // Save user role to localStorage (mock)
  const saveUserRole = useCallback(async (role: UserRole, kycVerified: boolean = true): Promise<boolean> => {
    if (!account?.address) {
      setError('No wallet connected');
      return false;
    }

    setStatus('loading');
    setError(null);

    try {
      // Simulate saving delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const userRoleData: UserRoleData = {
        role,
        selectedAt: new Date(),
        kycVerified,
        blobId: `mock_blob_${Date.now()}`, // Mock blob ID
      };

      // Store in localStorage
      storeRole(account.address, userRoleData);
      
      setRoleData(userRoleData);
      setStatus('loaded');
      console.log('✅ Mock role saved:', role);
      return true;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      setStatus('error');
      console.error('Error saving mock role:', err);
      return false;
    }
  }, [account?.address]);

  // Clear user role from localStorage (mock)
  const clearUserRole = useCallback(async (): Promise<boolean> => {
    if (!account?.address) {
      setError('No wallet connected');
      return false;
    }

    setStatus('loading');
    setError(null);

    try {
      // Simulate clearing delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      clearStoredRole(account.address);
      setRoleData(null);
      setStatus('not_found');
      console.log('✅ Mock role cleared');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      setStatus('error');
      console.error('Error clearing mock role:', err);
      return false;
    }
  }, [account?.address]);

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