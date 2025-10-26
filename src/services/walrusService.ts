import { ENV_VARS } from '../config/production';

// Walrus storage service for encrypted role data
export class WalrusService {
  private baseUrl: string;
  private apiKey?: string;

  constructor(_network: 'testnet' | 'mainnet' = 'testnet') {
    // Use production configuration for Walrus URLs
    this.baseUrl = ENV_VARS.WALRUS_PUBLISHER_URL;
    this.apiKey = undefined; // Add API key if required
  }

  // Store encrypted role data in Walrus
  async storeRoleData(encryptedBlob: Uint8Array, blobId: string): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/blobs/${blobId}`, {
        method: 'PUT',
        body: new Uint8Array(encryptedBlob),
        headers: {
          'Content-Type': 'application/octet-stream',
          'X-Walrus-Store': 'true',
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` }),
        },
      });

      if (!response.ok) {
        throw new Error(`Walrus storage failed: ${response.status} ${response.statusText}`);
      }

      // Return the blob ID for future retrieval
      return blobId;
    } catch (error) {
      console.error('Error storing role data in Walrus:', error);
      throw new Error('Failed to store role data in Walrus');
    }
  }

  // Retrieve encrypted role data from Walrus
  async getRoleData(blobId: string): Promise<Uint8Array | null> {
    try {
      const response = await fetch(`${this.baseUrl}/blobs/${blobId}`, {
        method: 'GET',
        headers: {
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` }),
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null; // Blob not found
        }
        throw new Error(`Walrus retrieval failed: ${response.status} ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      return new Uint8Array(arrayBuffer);
    } catch (error) {
      console.error('Error retrieving role data from Walrus:', error);
      return null;
    }
  }

  // Check if role data exists in Walrus
  async checkRoleDataExists(blobId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/blobs/${blobId}`, {
        method: 'HEAD',
        headers: {
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` }),
        },
      });

      return response.ok;
    } catch (error) {
      console.error('Error checking role data existence:', error);
      return false;
    }
  }

  // Delete role data from Walrus (if needed)
  async deleteRoleData(blobId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/blobs/${blobId}`, {
        method: 'DELETE',
        headers: {
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` }),
        },
      });

      return response.ok;
    } catch (error) {
      console.error('Error deleting role data:', error);
      return false;
    }
  }
}
