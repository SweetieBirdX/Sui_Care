// Production configuration for Sui Care dApp
// This file contains real production values that need to be updated

export const PRODUCTION_CONFIG = {
  // Sui Network Configuration
  SUI_NETWORKS: {
    testnet: {
      rpcUrl: 'https://fullnode.testnet.sui.io:443',
      name: 'Sui Testnet',
    },
    mainnet: {
      rpcUrl: 'https://fullnode.mainnet.sui.io:443',
      name: 'Sui Mainnet',
    },
  },

  // Walrus Configuration
  WALRUS_CONFIG: {
    testnet: {
      publisherUrl: 'https://publisher.walrus-testnet.walrus.space/v1',
      systemObjectId: '0x2134d52768ea07e8c43570ef975eb3e4c27a39fa6396bef985b5abc58d03ddd2', // Example from docs
      stakingObjectId: '0x10b9d30c28448939ce6c4d6c6e0ffce4a7f8a4ada8248bdad09ef8b70e4a3904', // Example from docs
    },
    mainnet: {
      publisherUrl: 'https://publisher.walrus-mainnet.walrus.space/v1',
      systemObjectId: '0x2134d52768ea07e8c43570ef975eb3e4c27a39fa6396bef985b5abc58d03ddd2', // Mainnet System Object
      stakingObjectId: '0x10b9d30c28448939ce6c4d6c6e0ffce4a7f8a4ada8248bdad09ef8b70e4a3904', // Mainnet Staking Object
    },
  },

  // Seal Configuration
  SEAL_CONFIG: {
    // TODO: These need to be updated with real values from Seal documentation
    packageId: '0x2', // Replace with actual Seal package ID
    keyServers: [
      {
        objectId: '0x1', // Replace with real key server object ID
        weight: 1,
      },
      // Add more key servers as needed
    ],
    verifyKeyServers: false, // Set to true in production
    timeout: 30000, // 30 seconds
  },

  // Health Access Policy Configuration
  POLICY_CONFIG: {
    // TODO: These need to be updated after deploying the Move contract
    packageId: '0x0', // Replace with deployed health_access_policy package ID
    policyObjectId: '0x0', // Replace with deployed policy object ID
  },

  // Environment Detection
  getCurrentNetwork(): 'testnet' | 'mainnet' {
    // In production, this should be determined by environment variables
    return process.env.NODE_ENV === 'production' ? 'mainnet' : 'testnet';
  },

  // Get RPC URL for current network
  getRpcUrl(): string {
    const network = this.getCurrentNetwork();
    return this.SUI_NETWORKS[network].rpcUrl;
  },

  // Get Walrus URL for current network
  getWalrusUrl(): string {
    const network = this.getCurrentNetwork();
    return this.WALRUS_CONFIG[network].publisherUrl;
  },

  // Get Walrus system object ID for current network
  getWalrusSystemObjectId(): string {
    const network = this.getCurrentNetwork();
    return this.WALRUS_CONFIG[network].systemObjectId;
  },

  // Get Walrus staking object ID for current network
  getWalrusStakingObjectId(): string {
    const network = this.getCurrentNetwork();
    return this.WALRUS_CONFIG[network].stakingObjectId;
  },
};

// Environment variables for production
export const ENV_VARS = {
  // Sui Configuration
  SUI_RPC_URL: import.meta.env.VITE_SUI_RPC_URL || PRODUCTION_CONFIG.getRpcUrl(),
  
  // Walrus Configuration
  WALRUS_PUBLISHER_URL: import.meta.env.VITE_WALRUS_PUBLISHER_URL || PRODUCTION_CONFIG.getWalrusUrl(),
  WALRUS_SYSTEM_OBJECT_ID: import.meta.env.VITE_WALRUS_SYSTEM_OBJECT_ID || PRODUCTION_CONFIG.getWalrusSystemObjectId(),
  WALRUS_STAKING_OBJECT_ID: import.meta.env.VITE_WALRUS_STAKING_OBJECT_ID || PRODUCTION_CONFIG.getWalrusStakingObjectId(),
  
  // Seal Configuration
  SEAL_PACKAGE_ID: import.meta.env.VITE_SEAL_PACKAGE_ID || PRODUCTION_CONFIG.SEAL_CONFIG.packageId,
  SEAL_KEY_SERVERS: import.meta.env.VITE_SEAL_KEY_SERVERS ? 
    JSON.parse(import.meta.env.VITE_SEAL_KEY_SERVERS) : 
    PRODUCTION_CONFIG.SEAL_CONFIG.keyServers,
  
  // Policy Configuration
  POLICY_PACKAGE_ID: import.meta.env.VITE_POLICY_PACKAGE_ID || PRODUCTION_CONFIG.POLICY_CONFIG.packageId,
  POLICY_OBJECT_ID: import.meta.env.VITE_POLICY_OBJECT_ID || PRODUCTION_CONFIG.POLICY_CONFIG.policyObjectId,
};

// Validation function to check if all required production values are set
export function validateProductionConfig(): { isValid: boolean; missing: string[] } {
  const missing: string[] = [];
  
  // Check if critical values are still placeholder values
  if (ENV_VARS.SEAL_PACKAGE_ID === '0x2') {
    missing.push('SEAL_PACKAGE_ID - needs real Seal package ID');
  }
  
  if (ENV_VARS.POLICY_PACKAGE_ID === '0x0') {
    missing.push('POLICY_PACKAGE_ID - needs deployed contract package ID');
  }
  
  if (ENV_VARS.POLICY_OBJECT_ID === '0x0') {
    missing.push('POLICY_OBJECT_ID - needs deployed policy object ID');
  }
  
  if (ENV_VARS.SEAL_KEY_SERVERS.some((server: any) => server.objectId === '0x1')) {
    missing.push('SEAL_KEY_SERVERS - needs real key server object IDs');
  }
  
  return {
    isValid: missing.length === 0,
    missing,
  };
}

// Helper function to log production readiness status
export function logProductionStatus(): void {
  const validation = validateProductionConfig();
  
  if (validation.isValid) {
    console.log('✅ Production configuration is complete and ready!');
  } else {
    console.warn('⚠️ Production configuration is incomplete:');
    validation.missing.forEach(item => console.warn(`   - ${item}`));
    console.warn('Please update the configuration with real production values.');
  }
}
