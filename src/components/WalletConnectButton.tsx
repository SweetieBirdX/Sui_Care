import { ConnectButton, useCurrentAccount, useDisconnectWallet } from '@mysten/dapp-kit';

export function WalletConnectButton() {
  const account = useCurrentAccount();
  const { mutate: disconnect } = useDisconnectWallet();

  if (account) {
    return (
      <div className="wallet-connected">
        <p>Connected: {account.address}</p>
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
    <div className="wallet-connect">
      <ConnectButton />
    </div>
  );
}
