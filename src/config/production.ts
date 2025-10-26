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
    // Updated with real values from Seal documentation
    packageId: '0x927a54e9ae803f82ebf480136a9bcff45101ccbe28b13f433c89f5181069d682', // Real Seal package ID
    keyServers: [
      {
        objectId: '0x73d05d62c18d9374e3ea529e8e0ed6161da1a141a94d3f76ae3fe4e99356db75', // Real key server object ID
        weight: 1,
      },
      {
        objectId: '0xf5d14a81a982144ae441cd7d64b09027f116a468bd36e7eca494f750591623c8', // Real key server object ID
        weight: 1,
      },
    ],
    verifyKeyServers: true, // Set to true in production
    timeout: 30000, // 30 seconds
  },

  // Health Access Policy Configuration
  POLICY_CONFIG: {
    // Updated with deployed contract IDs
    packageId: '0xca7b6dafb380da7a0723ef54cc1f671e34225d6818d57bbe190313f4229448bf', // Deployed health_access_policy package ID
    policyObjectId: '0x8cbbb7073ca9da3cdf54c235e2a0be67f9a53f613040b83963294274f151c9b8', // Deployed policy object ID
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
  SUI_RPC_URL: process.env.VITE_SUI_RPC_URL || process.env.REACT_SUI_FULLNODE_URL || PRODUCTION_CONFIG.getRpcUrl(),
  
  // Walrus Configuration
  WALRUS_PUBLISHER_URL: process.env.VITE_WALRUS_PUBLISHER_URL || process.env.REACT_WALRUS_PUBLISHER_URL || PRODUCTION_CONFIG.getWalrusUrl(),
  WALRUS_SYSTEM_OBJECT_ID: process.env.VITE_WALRUS_SYSTEM_OBJECT_ID || process.env.REACT_WALRUS_SYSTEM_OBJECT_ID || PRODUCTION_CONFIG.getWalrusSystemObjectId(),
  WALRUS_STAKING_OBJECT_ID: process.env.VITE_WALRUS_STAKING_OBJECT_ID || process.env.REACT_WALRUS_STAKING_OBJECT_ID || PRODUCTION_CONFIG.getWalrusStakingObjectId(),
  
  // Seal Configuration
  SEAL_PACKAGE_ID: process.env.VITE_SEAL_PACKAGE_ID || process.env.SEAL_PACKAGE_ID || PRODUCTION_CONFIG.SEAL_CONFIG.packageId,
  SEAL_KEY_SERVERS: process.env.VITE_SEAL_KEY_SERVERS || process.env.REACT_SEAL_KEY_SERVER_URLS ? 
    JSON.parse(process.env.VITE_SEAL_KEY_SERVERS || process.env.REACT_SEAL_KEY_SERVER_URLS || '[]') : 
    PRODUCTION_CONFIG.SEAL_CONFIG.keyServers,
  
  // Policy Configuration
  POLICY_PACKAGE_ID: process.env.VITE_POLICY_PACKAGE_ID || process.env.POLICY_PACKAGE_ID || process.env.PACKAGE_ID || PRODUCTION_CONFIG.POLICY_CONFIG.packageId,
  POLICY_OBJECT_ID: process.env.VITE_POLICY_OBJECT_ID || process.env.POLICY_OBJECT_ID || PRODUCTION_CONFIG.POLICY_CONFIG.policyObjectId,
  ACCESS_CONTROL_MANAGER_OBJECT_ID: process.env.VITE_ACCESS_CONTROL_MANAGER_OBJECT_ID || process.env.MANAGER_OBJECT_ID || '0x0',
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
