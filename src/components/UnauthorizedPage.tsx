import { useCurrentAccount } from '@mysten/dapp-kit';

export function UnauthorizedPage() {
  const account = useCurrentAccount();

  return (
    <div className="unauthorized-page">
      <div className="unauthorized-content">
        <div className="unauthorized-icon">🚫</div>
        <h2>Access Denied</h2>
        <p>You don't have permission to access this area.</p>
        
        {account ? (
          <div className="unauthorized-details">
            <p>Your wallet: {account.address.slice(0, 8)}...</p>
            <p>Please contact an administrator if you believe this is an error.</p>
          </div>
        ) : (
          <div className="unauthorized-details">
            <p>Please connect your wallet to access the system.</p>
          </div>
        )}

        <div className="unauthorized-actions">
          <button 
            className="btn-primary"
            onClick={() => window.location.reload()}
          >
            🔄 Refresh Page
          </button>
        </div>

        <div className="security-notice">
          <p>
            🔒 <strong>Security Notice:</strong> Access control is enforced by on-chain policies. 
            Even if you bypass the UI, Seal Key Servers will deny decryption without proper authorization.
          </p>
        </div>
      </div>
    </div>
  );
}