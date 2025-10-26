import { useCurrentAccount, useDisconnectWallet } from '@mysten/dapp-kit';
import { useState } from 'react';

export function SimpleWalletConnect() {
  const account = useCurrentAccount();
  const { mutate: disconnect } = useDisconnectWallet();
  const [isConnecting, setIsConnecting] = useState(false);

  console.log('SimpleWalletConnect render:', { 
    account, 
    hasAccount: !!account,
    isConnecting 
  });

  const handleConnect = async () => {
    try {
      setIsConnecting(true);
      console.log('Attempting to connect wallet...');
      // This component is deprecated, use ConnectButton instead
      console.log('Use ConnectButton component instead');
    } catch (error) {
      console.error('Error connecting wallet:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  if (account) {
    return (
      <div className="wallet-connected fade-in">
        <p>✅ Connected: {account.address}</p>
        <button 
          onClick={() => disconnect()}
          className="disconnect-button"
        >
          Disconnect Wallet
        </button>
      </div>
    );
  }

  return (
    <div className="wallet-connect fade-in">
      <p>🔗 Connect your Sui wallet:</p>
      <button 
        onClick={handleConnect}
        disabled={isConnecting}
        className="btn-primary"
      >
        {isConnecting ? 'Connecting...' : 'Connect Wallet'}
      </button>
    </div>
  );
}
