import { SealClient, DemType } from '@mysten/seal';
import { SuiClient } from '@mysten/sui/client';
import { ENV_VARS } from '../config/production';

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
    // Initialize Seal client with real SuiClient and production key server configuration
    this.sealClient = new SealClient({
      suiClient: suiClient as any, // Cast to SealCompatibleClient
      serverConfigs: ENV_VARS.SEAL_KEY_SERVERS, // Real key server object IDs from environment
      verifyKeyServers: false, // Set to false for Testnet, true for Mainnet
      timeout: 30000, // 30 seconds timeout
    });
    
    // Package ID for Seal protocol - using production configuration
    this.packageId = ENV_VARS.SEAL_PACKAGE_ID;
    
    console.log('🔍 SealService initialized with Testnet configuration:', {
      packageId: this.packageId,
      keyServers: ENV_VARS.SEAL_KEY_SERVERS,
      verifyKeyServers: false,
      network: 'testnet'
    });
  }

  // Encrypt role data using real Seal SDK
  async encryptRoleData(roleData: RoleMetadata, userAddress: string): Promise<Uint8Array> {
    try {
      // Get Policy Package ID from environment
      const POLICY_PACKAGE_ID = ENV_VARS.POLICY_PACKAGE_ID;
      
      if (!POLICY_PACKAGE_ID || POLICY_PACKAGE_ID === '0x0') {
        throw new Error("POLICY_PACKAGE_ID is missing or invalid in configuration. Please check your .env file or production.ts");
      }

      console.log('🔍 Encrypting role data with Seal:', {
        sealPackageId: this.packageId,
        policyPackageId: POLICY_PACKAGE_ID,
        userAddress,
        role: roleData.role
      });

      // Convert role data to bytes
      const roleDataString = JSON.stringify(roleData);
      const dataBytes = new TextEncoder().encode(roleDataString);
      
      // Create additional authenticated data (AAD) for policy
      const aad = new TextEncoder().encode(JSON.stringify({
        owner: userAddress,
        allowed_roles: [roleData.role],
        kyc_required: true,
        timestamp: roleData.timestamp,
        policy_package_id: POLICY_PACKAGE_ID, // Include policy package ID in AAD
      }));

      // Encrypt using Seal SDK with correct package ID
      const result = await this.sealClient.encrypt({
        kemType: 0, // KemType.BonehFranklinBLS12381DemCCA
        demType: DemType.AesGcm256, // AES-256-GCM for DEM
        threshold: 1, // Threshold for TSS encryption
        packageId: this.packageId, // Seal package ID
        id: userAddress, // Identity to encrypt under
        data: dataBytes,
        aad: aad, // Additional authenticated data with policy info
      });

      console.log('✅ Role data encrypted successfully with Seal');
      // Return the encrypted object (contains metadata and encrypted data)
      return result.encryptedObject;
    } catch (error) {
      console.error('❌ Error encrypting role data with Seal:', error);
      
      // Check for specific error types
      if (error instanceof Error) {
        if (error.message.includes('InvalidPackageError')) {
          console.error('❌ InvalidPackageError: Check package ID configuration');
          console.error('Seal Package ID:', this.packageId);
          console.error('Policy Package ID:', ENV_VARS.POLICY_PACKAGE_ID);
          console.error('Expected Testnet Seal:', '0x927a54e9ae803f82ebf480136a9bcff45101ccbe28b13f433c89f5181069d682');
          console.error('Expected Testnet Policy:', '0xca7b6dafb380da7a0723ef54cc1f671e34225d6818d57bbe190313f4229448bf');
          console.error('Are you using the correct network? Current: testnet');
        }
      }
      
      throw new Error(`Failed to encrypt role data with Seal: ${error instanceof Error ? error.message : String(error)}`);
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
