import React from 'react';
import { useCurrentAccount } from '@mysten/dapp-kit';

export function UnauthorizedPage() {
  const account = useCurrentAccount();

  return (
    <div className="unauthorized-page">
      <div className="unauthorized-content">
        <div className="error-icon">🚫</div>
        <h2>Access Denied</h2>
        <p>You don't have permission to access this page.</p>
        <div className="unauthorized-details">
          <p><strong>Wallet:</strong> {account?.address?.slice(0, 8)}...</p>
          <p><strong>Status:</strong> Unauthorized access attempt</p>
        </div>
        <button 
          className="retry-btn"
          onClick={() => window.location.reload()}
        >
          🔄 Refresh Page
        </button>
      </div>
    </div>
  );
}
