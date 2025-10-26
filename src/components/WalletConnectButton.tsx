import { ConnectButton, useCurrentAccount, useDisconnectWallet } from '@mysten/dapp-kit';
import { Link, Gem, Lock, Zap, Globe, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function WalletConnectButton() {
  const account = useCurrentAccount();
  const { mutate: disconnect } = useDisconnectWallet();

  if (account) {
    return (
      <Card className="wallet-connected-card">
        <CardContent className="p-4">
          <div className="wallet-status">
            <div className="wallet-icon">
              <Link className="w-6 h-6 text-blue-400" />
            </div>
            <div className="wallet-info">
              <h4 className="text-lg font-semibold">Wallet Connected</h4>
              <p className="wallet-address text-sm text-gray-300">
                {account.address.slice(0, 6)}...{account.address.slice(-4)}
              </p>
            </div>
          </div>
          <Button 
            onClick={() => disconnect()}
            variant="outline"
            size="sm"
            className="disconnect-btn"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Disconnect
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="wallet-connect-card">
      <CardHeader className="text-center">
        <div className="wallet-icon-large">
          <Gem className="w-12 h-12 text-purple-400 mx-auto" />
        </div>
        <CardTitle className="text-xl">Connect Your Wallet</CardTitle>
        <CardDescription>
          Connect your Sui wallet to access the healthcare dApp
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="connect-button-wrapper">
          <ConnectButton />
        </div>
        <div className="wallet-features grid grid-cols-1 gap-2">
          <div className="feature-item flex items-center gap-2 text-sm">
            <Lock className="w-4 h-4 text-green-400" />
            <span>Secure & Private</span>
          </div>
          <div className="feature-item flex items-center gap-2 text-sm">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span>Fast Transactions</span>
          </div>
          <div className="feature-item flex items-center gap-2 text-sm">
            <Globe className="w-4 h-4 text-blue-400" />
            <span>Decentralized</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
