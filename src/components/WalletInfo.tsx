import { useCurrentAccount, useSuiClient } from '@mysten/dapp-kit';
import { useQuery } from '@tanstack/react-query';

export function WalletInfo() {
  const account = useCurrentAccount();
  const client = useSuiClient();

  const { data: balance, isLoading: balanceLoading } = useQuery({
    queryKey: ['balance', account?.address],
    queryFn: async () => {
      if (!account?.address) return null;
      const coins = await client.getBalance({
        owner: account.address,
      });
      return coins;
    },
    enabled: !!account?.address,
  });

  const { data: objects, isLoading: objectsLoading } = useQuery({
    queryKey: ['objects', account?.address],
    queryFn: async () => {
      if (!account?.address) return null;
      const objects = await client.getOwnedObjects({
        owner: account.address,
        options: {
          showType: true,
          showContent: true,
          showDisplay: true,
        },
      });
      return objects;
    },
    enabled: !!account?.address,
  });

  if (!account) {
    return (
      <div className="wallet-info">
        <h3>Wallet Information</h3>
        <p>Please connect your wallet to view information.</p>
      </div>
    );
  }

  return (
    <div className="wallet-info">
      <h3>Wallet Information</h3>
      <div className="wallet-details">
        <div className="wallet-address">
          <strong>Address:</strong>
          <code>{account.address}</code>
        </div>
        
        <div className="wallet-balance">
          <strong>Balance:</strong>
          {balanceLoading ? (
            <span>Loading...</span>
          ) : (
            <span>{balance?.totalBalance || '0'} SUI</span>
          )}
        </div>
        
        <div className="wallet-objects">
          <strong>Objects:</strong>
          {objectsLoading ? (
            <span>Loading...</span>
          ) : (
            <span>{objects?.data?.length || 0} objects</span>
          )}
        </div>
      </div>
    </div>
  );
}
