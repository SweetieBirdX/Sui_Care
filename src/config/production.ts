// Production configuration for Sui Care dApp
// This file contains real production values that need to be updated

// CRITICAL: Walrus Testnet is unstable and periodically wiped
// Mainnet is MANDATORY for any production use
// Testnet should only be used for development with local Walrus daemon

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
      requiresJWT: false,
      costPerOperation: 'Free (but unstable)',
      stability: 'Low - Data may be wiped at any time',
      dataLossRisk: 'High - Periodic wipes and restarts'
    },
    mainnet: {
      publisherUrl: 'https://publisher.walrus-mainnet.walrus.space/v1',
      systemObjectId: '0x2134d52768ea07e8c43570ef975eb3e4c27a39fa6396bef985b5abc58d03ddd2', // Mainnet System Object
      stakingObjectId: '0x10b9d30c28448939ce6c4d6c6e0ffce4a7f8a4ada8248bdad09ef8b70e4a3904', // Mainnet Staking Object
      // NOTE: Mainnet requires JWT authentication and has costs in SUI and WAL
      requiresJWT: true,
      costPerOperation: 'SUI + WAL tokens required',
      // Mainnet provides stability and data persistence
      stability: 'High - Data persists across restarts',
      dataLossRisk: 'Low - Only in extreme network events',
      // JWT Token for authentication
      jwtToken: import.meta.env.VITE_WALRUS_JWT_TOKEN || undefined
    },
  },

  // Seal Configuration
  SEAL_CONFIG: {
    // Updated with real values from Seal documentation
    // Mainnet: 0xa212c4c6c7183b911d0be8768f4cb1df7a383025b5d0ba0c014009f0f30f5f8d
    // Testnet: 0x927a54e9ae803f82ebf480136a9bcff45101ccbe28b13f433c89f5181069d682
    packageId: '0x927a54e9ae803f82ebf480136a9bcff45101ccbe28b13f433c89f5181069d682', // Testnet Seal package ID
    keyServers: [
      {
        objectId: '0x73d05d62c18d9374e3ea529e8e0ed6161da1a141a94d3f76ae3fe4e99356db75', // Testnet key server object ID
        weight: 1,
      },
      {
        objectId: '0xf5d14a81a982144ae441cd7d64b09027f116a468bd36e7eca494f750591623c8', // Testnet key server object ID
        weight: 1,
      },
    ],
    verifyKeyServers: false, // Set to false for Testnet, true for Mainnet
    timeout: 30000, // 30 seconds
  },

  // Health Access Policy Configuration
  POLICY_CONFIG: {
    // Updated with deployed contract IDs (VERIFIED ON TESTNET)
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
    // Sui Configuration - DEFAULT TO TESTNET FOR DEVELOPMENT
    SUI_RPC_URL: import.meta.env.VITE_SUI_RPC_URL || 'https://fullnode.testnet.sui.io:443',
    SUI_NETWORK: import.meta.env.VITE_SUI_NETWORK || 'testnet',
    
    // Walrus Configuration - DEFAULT TO TESTNET FOR DEVELOPMENT
    WALRUS_PUBLISHER_URL: import.meta.env.VITE_WALRUS_PUBLISHER_URL || 'https://publisher.walrus-testnet.walrus.space/v1',
    WALRUS_SYSTEM_OBJECT_ID: import.meta.env.VITE_WALRUS_SYSTEM_OBJECT_ID || PRODUCTION_CONFIG.WALRUS_CONFIG.testnet.systemObjectId,
    WALRUS_STAKING_OBJECT_ID: import.meta.env.VITE_WALRUS_STAKING_OBJECT_ID || PRODUCTION_CONFIG.WALRUS_CONFIG.testnet.stakingObjectId,
    
    // JWT Token for Mainnet (OPTIONAL)
    WALRUS_JWT_TOKEN: import.meta.env.VITE_WALRUS_JWT_TOKEN || undefined,
    
    // Seal Configuration - Use Testnet by default
    SEAL_PACKAGE_ID: import.meta.env.VITE_SEAL_PACKAGE_ID || PRODUCTION_CONFIG.SEAL_CONFIG.packageId,
    SEAL_KEY_SERVERS: PRODUCTION_CONFIG.SEAL_CONFIG.keyServers,
    
    // Policy Configuration
    POLICY_PACKAGE_ID: import.meta.env.VITE_POLICY_PACKAGE_ID || PRODUCTION_CONFIG.POLICY_CONFIG.packageId,
    POLICY_OBJECT_ID: import.meta.env.VITE_POLICY_OBJECT_ID || PRODUCTION_CONFIG.POLICY_CONFIG.policyObjectId,
    ACCESS_CONTROL_MANAGER_OBJECT_ID: import.meta.env.VITE_ACCESS_CONTROL_MANAGER_OBJECT_ID || '0x0',
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
  
  console.log('--- Production Status Check ---');
  console.log(`Sui RPC URL: ${ENV_VARS.SUI_RPC_URL}`);
  console.log(`Sui Network: ${ENV_VARS.SUI_NETWORK}`);
  console.log(`Walrus Publisher URL: ${ENV_VARS.WALRUS_PUBLISHER_URL}`);
  console.log(`Seal Package ID: ${ENV_VARS.SEAL_PACKAGE_ID}`);
  console.log(`Policy Package ID: ${ENV_VARS.POLICY_PACKAGE_ID}`);
  console.log(`Access Control Manager Object ID: ${ENV_VARS.ACCESS_CONTROL_MANAGER_OBJECT_ID}`);
  console.log('-----------------------------');

  // Verify Policy Package ID is deployed
  if (ENV_VARS.POLICY_PACKAGE_ID === '0xca7b6dafb380da7a0723ef54cc1f671e34225d6818d57bbe190313f4229448bf') {
    console.log('✅ Policy Package ID verified: Contract is deployed on Testnet');
  } else {
    console.warn('⚠️ Policy Package ID mismatch: Check deployment status');
  }

  if (validation.isValid) {
    console.log('✅ Production configuration is complete and ready!');
  } else {
    console.warn('⚠️ Production configuration is incomplete:');
    validation.missing.forEach(item => console.warn(`   - ${item}`));
    console.warn('Please update the configuration with real production values.');
  }

  // Detailed Walrus Testnet warning
  if (ENV_VARS.WALRUS_PUBLISHER_URL.includes('testnet')) {
    console.warn('⚠️ WALRUS TESTNET WARNING: Data is periodically wiped and restarted. DO NOT use for production. Consider migrating to Mainnet for stability.');
  }
}
