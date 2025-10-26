import { SuiClient } from '@mysten/sui/client';

// Sui Network Configuration
export const NETWORKS = {
  testnet: {
    name: 'Sui Testnet',
    rpcUrl: 'https://fullnode.testnet.sui.io:443',
    wsUrl: 'wss://fullnode.testnet.sui.io:443',
    faucetUrl: 'https://faucet.testnet.sui.io/gas',
  },
  mainnet: {
    name: 'Sui Mainnet',
    rpcUrl: 'https://fullnode.mainnet.sui.io:443',
    wsUrl: 'wss://fullnode.mainnet.sui.io:443',
  },
} as const;

export type NetworkName = keyof typeof NETWORKS;

// Create SuiClient instances for each network
export const suiClients = {
  testnet: new SuiClient({ url: NETWORKS.testnet.rpcUrl }),
  mainnet: new SuiClient({ url: NETWORKS.mainnet.rpcUrl }),
} as const;

// Default network
export const DEFAULT_NETWORK: NetworkName = 'testnet';
