import { SealClient, DemType } from '@mysten/seal';
import { SuiClient } from '@mysten/sui/client';

// Role metadata structure
export interface RoleMetadata {
  address: string;
  role: string;
  timestamp: number;
  kycVerified: boolean;
}

// Seal service using real Seal SDK
export class SealService {
  private sealClient: SealClient;
  private packageId: string;

  constructor(suiClient: SuiClient) {
    // Initialize Seal client with key server configuration
    this.sealClient = new SealClient({
      suiClient: suiClient as any, // Cast to SealCompatibleClient
      serverConfigs: [
        {
          objectId: '0x1', // Default key server object ID for testnet
          weight: 1,
        }
      ],
      verifyKeyServers: false, // Set to true in production
      timeout: 30000, // 30 seconds timeout
    });
    
    // Package ID for Seal protocol (this should be the actual package ID)
    this.packageId = '0x2'; // This should be the actual Seal package ID
  }

  // Encrypt role data using real Seal SDK
  async encryptRoleData(roleData: RoleMetadata, userAddress: string): Promise<Uint8Array> {
    try {
      // Convert role data to bytes
      const roleDataString = JSON.stringify(roleData);
      const dataBytes = new TextEncoder().encode(roleDataString);
      
      // Create additional authenticated data (AAD) for policy
      const aad = new TextEncoder().encode(JSON.stringify({
        owner: userAddress,
        allowed_roles: [roleData.role],
        kyc_required: true,
        timestamp: roleData.timestamp,
      }));

      // Encrypt using Seal SDK
      const result = await this.sealClient.encrypt({
        kemType: 0, // KemType.BonehFranklinBLS12381DemCCA
        demType: DemType.AesGcm256, // AES-256-GCM for DEM
        threshold: 1, // Threshold for TSS encryption
        packageId: this.packageId,
        id: userAddress, // Identity to encrypt under
        data: dataBytes,
        aad: aad, // Additional authenticated data
      });

      // Return the encrypted object (contains metadata and encrypted data)
      return result.encryptedObject;
    } catch (error) {
      console.error('Error encrypting role data with Seal:', error);
      throw new Error('Failed to encrypt role data with Seal');
    }
  }

  // Decrypt role data using real Seal SDK
  async decryptRoleData(encryptedBlob: Uint8Array, userAddress: string): Promise<RoleMetadata | null> {
    try {
      // For decryption, we need to create a transaction that calls seal_approve functions
      // This is a simplified version - in production, you'd need to create proper transaction bytes
      const txBytes = new Uint8Array(0); // This should be actual transaction bytes
      
      // Create a session key (this should be derived from the encrypted object)
      // For now, we'll use a placeholder - in production, this should be extracted from the encrypted object
      const sessionKey = {
        kemType: 0, // KemType.BonehFranklinBLS12381DemCCA
        demType: DemType.AesGcm256,
        threshold: 1,
        packageId: this.packageId,
        id: userAddress,
      } as any;

      // Decrypt using Seal SDK
      const decryptedData = await this.sealClient.decrypt({
        data: encryptedBlob,
        sessionKey: sessionKey,
        txBytes: txBytes,
        checkShareConsistency: false,
        checkLEEncoding: false,
      });

      // Convert back to JSON
      const roleDataString = new TextDecoder().decode(decryptedData);
      const roleData: RoleMetadata = JSON.parse(roleDataString);
      
      // Verify the data belongs to the current user
      if (roleData.address !== userAddress) {
        throw new Error('Role data does not belong to current user');
      }
      
      return roleData;
    } catch (error) {
      console.error('Error decrypting role data with Seal:', error);
      return null;
    }
  }

  // Generate a unique identifier for the encrypted blob
  generateBlobId(userAddress: string, role: string): string {
    const timestamp = Date.now();
    return `role_${userAddress.slice(0, 8)}_${role}_${timestamp}`;
  }

  // Get the Seal client for advanced operations
  getSealClient(): SealClient {
    return this.sealClient;
  }
}
