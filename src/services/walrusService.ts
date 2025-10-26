import { ENV_VARS } from '../config/production';

// Walrus storage service for encrypted role data
export class WalrusService {
  private baseUrl: string;
  private fallbackUrls: string[];
  private apiKey?: string;
  private network: 'testnet' | 'mainnet';
  private lastRequestTime: number = 0;
  private requestInterval: number = 7000; // 7 seconds between requests
  private pendingRequests: Map<string, Promise<any>> = new Map();

  constructor(network: 'testnet' | 'mainnet' = 'testnet') {
    this.network = network;
    
    if (network === 'mainnet') {
      // Mainnet configuration with JWT authentication
      this.baseUrl = 'https://publisher.walrus-mainnet.walrus.space/v1';
      this.fallbackUrls = [
        'https://publisher.walrus-mainnet.walrus.space/v1',
        // Add other Mainnet publishers if available
      ];
      // JWT token for Mainnet authentication
      this.apiKey = ENV_VARS.WALRUS_JWT_TOKEN;
      
      if (!this.apiKey) {
        console.warn('⚠️ No JWT token provided for Walrus Mainnet. Authentication may fail.');
      }
    } else {
      // Testnet configuration with proxy for development
      this.baseUrl = '/walrus-api'; // Vite proxy endpoint
      
      // WARNING: Walrus Testnet is unstable and periodically wiped
      // This means data can be lost at any time - DO NOT use for production
      // For stable development, consider migrating to Mainnet
      //
      // PRODUCTION REQUIREMENTS:
      // - Mainnet RPC endpoints must be used for production applications
      // - Rate limiting applies; high traffic requires dedicated nodes or professional providers
      // - Seal's on-chain policy requirement means Move contracts and Key Servers must be tested in stable Mainnet environment
      this.fallbackUrls = [
        '/walrus-api', // Primary proxy endpoint
        '/walrus-testnet', // Alternative proxy endpoint
        '/walrus-alt', // Alternative proxy endpoint
        // Direct URLs as last resort (may cause CORS issues)
        'https://publisher.walrus-testnet.h2o-nodes.com',
        'https://publisher.walrus-testnet.walrus.space/v1',
        'http://walrus-publisher-testnet.haedal.xyz:9001'
      ];
      this.apiKey = undefined; // No authentication needed for Testnet
    }
  }

  // Rate limiting to prevent too many requests
  private async waitForRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.requestInterval) {
      const waitTime = this.requestInterval - timeSinceLastRequest;
      console.log(`⏳ Rate limiting: waiting ${waitTime}ms before next request`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    this.lastRequestTime = Date.now();
  }

  // Check if request is already pending to avoid duplicates
  private getRequestKey(operationName: string, url: string): string {
    return `${operationName}_${url}`;
  }

  // Try multiple Walrus URLs with fallback
  private async tryWithFallback<T>(
    operation: (url: string) => Promise<T>,
    operationName: string
  ): Promise<T> {
    const urls = [this.baseUrl, ...this.fallbackUrls];
    const errors: string[] = [];
    let isTestnetUnstable = false;
    
    for (let i = 0; i < urls.length; i++) {
      try {
        // Wait for rate limit before each request
        await this.waitForRateLimit();
        
        // Check if request is already pending
        const requestKey = this.getRequestKey(operationName, urls[i]);
        if (this.pendingRequests.has(requestKey)) {
          console.log(`🔄 Request already pending for ${operationName} with ${urls[i]}, waiting...`);
          return await this.pendingRequests.get(requestKey)!;
        }
        
        console.log(`🔄 Trying ${operationName} with URL: ${urls[i]}`);
        
        // Create and store the pending request
        const requestPromise = operation(urls[i]);
        this.pendingRequests.set(requestKey, requestPromise);
        
        const result = await requestPromise;
        
        // Remove from pending requests
        this.pendingRequests.delete(requestKey);
        
        console.log(`✅ ${operationName} succeeded with URL: ${urls[i]}`);
        return result;
      } catch (error) {
        // Remove from pending requests on error
        const requestKey = this.getRequestKey(operationName, urls[i]);
        this.pendingRequests.delete(requestKey);
        
        let errorMessage = `${operationName} failed with URL ${urls[i]}: ${error instanceof Error ? error.message : String(error)}`;
        
        // Check for specific error types
        if (error instanceof Error) {
          if (error.message.includes('502') || error.message.includes('Bad Gateway')) {
            errorMessage += ' (502 Bad Gateway - Testnet may be unstable)';
            isTestnetUnstable = true;
          } else if (error.message.includes('CORS')) {
            errorMessage += ' (CORS blocked - using proxy)';
          } else if (error.message.includes('404')) {
            errorMessage += ' (404 Not Found - data may be wiped)';
            isTestnetUnstable = true;
          }
        }
        
        console.warn(`❌ ${errorMessage}`);
        errors.push(errorMessage);
        
        if (i === urls.length - 1) {
          // Last URL failed, throw comprehensive error
          const allErrors = errors.join('\n');
          let finalMessage = `${operationName} failed with all Walrus Publishers:\n${allErrors}`;
          
          if (isTestnetUnstable) {
            finalMessage += '\n\n⚠️ Walrus Testnet is unstable and may be down. Consider migrating to Mainnet.';
          }
          
          throw new Error(finalMessage);
        }
        
        // Add delay between retries for unstable Testnet
        if (isTestnetUnstable && i < urls.length - 1) {
          console.log('⏳ Waiting 2 seconds before trying next URL...');
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
    }
    
    throw new Error(`${operationName} failed with all URLs`);
  }

  // Store encrypted role data in Walrus
  async storeRoleData(encryptedBlob: Uint8Array, blobId: string): Promise<string> {
    return this.tryWithFallback(async (url) => {
      const headers: Record<string, string> = {
        'Content-Type': 'application/octet-stream',
        'X-Walrus-Store': 'true',
      };

      // Add JWT authentication for Mainnet
      if (this.network === 'mainnet' && this.apiKey) {
        headers['Authorization'] = `Bearer ${this.apiKey}`;
        console.log('🔐 Using JWT authentication for Walrus Mainnet');
      }

      const response = await fetch(`${url}/blobs/${blobId}`, {
        method: 'PUT',
        body: new Uint8Array(encryptedBlob),
        headers,
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error(`Walrus authentication failed: ${response.status} ${response.statusText} - Check JWT token`);
        }
        throw new Error(`Walrus storage failed: ${response.status} ${response.statusText}`);
      }

      // Return the blob ID for future retrieval
      return blobId;
    }, 'storeRoleData');
  }

  // Retrieve encrypted role data from Walrus
  async getRoleData(blobId: string): Promise<Uint8Array | null> {
    try {
      return await this.tryWithFallback(async (url) => {
        const headers: Record<string, string> = {};

        // Add JWT authentication for Mainnet
        if (this.network === 'mainnet' && this.apiKey) {
          headers['Authorization'] = `Bearer ${this.apiKey}`;
        }

        const response = await fetch(`${url}/blobs/${blobId}`, {
          method: 'GET',
          headers,
        });

        if (!response.ok) {
          if (response.status === 404) {
            return null; // Blob not found
          }
          if (response.status === 401) {
            throw new Error(`Walrus authentication failed: ${response.status} ${response.statusText} - Check JWT token`);
          }
          throw new Error(`Walrus retrieval failed: ${response.status} ${response.statusText}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        return new Uint8Array(arrayBuffer);
      }, 'getRoleData');
    } catch (error) {
      console.error('Error retrieving role data from Walrus:', error);
      return null;
    }
  }

  // Check if role data exists in Walrus
  async checkRoleDataExists(blobId: string): Promise<boolean> {
    try {
      return await this.tryWithFallback(async (url) => {
        const headers: Record<string, string> = {};

        // Add JWT authentication for Mainnet
        if (this.network === 'mainnet' && this.apiKey) {
          headers['Authorization'] = `Bearer ${this.apiKey}`;
        }

        const response = await fetch(`${url}/blobs/${blobId}`, {
          method: 'HEAD',
          headers,
        });

        // Testnet Kararsızlıklarını ve Veri Kaybını Ele Al
        if (response.status === 404) {
          console.warn(`⚠️ Blob not found (404): ${blobId} - Data may have been wiped from Walrus Testnet`);
          return false;
        }

        if (response.status === 502) {
          console.warn(`⚠️ Bad Gateway (502): ${blobId} - Walrus Testnet service is unstable`);
          return false;
        }

        if (response.status === 503) {
          console.warn(`⚠️ Service Unavailable (503): ${blobId} - Walrus Testnet is temporarily down`);
          return false;
        }

        if (response.status === 401) {
          throw new Error(`Walrus authentication failed: ${response.status} ${response.statusText} - Check JWT token`);
        }

        if (!response.ok) {
          console.warn(`⚠️ HTTP Error ${response.status}: ${response.statusText} - Walrus Testnet instability`);
          return false;
        }

        return response.ok;
      }, 'checkRoleDataExists');
    } catch (error) {
      console.error('❌ Role data check failed on all Walrus Publishers:', error);
      
      // Testnet kararsızlığı durumunda kullanıcıyı rol seçimine yönlendir
      if (this.network === 'testnet') {
        console.log('🔄 Walrus Testnet is unstable. User will be redirected to role selection.');
      }
      
      // Return false to indicate no role data found, triggering role selection
      return false;
    }
  }

  // Delete role data from Walrus (if needed)
  async deleteRoleData(blobId: string): Promise<boolean> {
    try {
      return await this.tryWithFallback(async (url) => {
        const headers: Record<string, string> = {};

        // Add JWT authentication for Mainnet
        if (this.network === 'mainnet' && this.apiKey) {
          headers['Authorization'] = `Bearer ${this.apiKey}`;
        }

        const response = await fetch(`${url}/blobs/${blobId}`, {
          method: 'DELETE',
          headers,
        });

        if (response.status === 401) {
          throw new Error(`Walrus authentication failed: ${response.status} ${response.statusText} - Check JWT token`);
        }

        return response.ok;
      }, 'deleteRoleData');
    } catch (error) {
      console.error('Error deleting role data:', error);
      return false;
    }
  }
}
