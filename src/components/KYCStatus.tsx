import { useCurrentAccount } from '@mysten/dapp-kit';
import { useZKProofVerification } from '../hooks/useZKProofVerification';
import { useEffect } from 'react';

export function KYCStatus() {
  const account = useCurrentAccount();
  const { verificationResult, loadStoredVerification, checkVerificationStatus } = useZKProofVerification();

  // Load stored verification on mount
  useEffect(() => {
    loadStoredVerification();
  }, [loadStoredVerification]);

  // Check verification status periodically
  useEffect(() => {
    if (verificationResult?.isVerified) {
      const interval = setInterval(() => {
        checkVerificationStatus();
      }, 60000); // Check every minute

      return () => clearInterval(interval);
    }
  }, [verificationResult, checkVerificationStatus]);

  if (!account) {
    return null;
  }

  if (!verificationResult?.isVerified) {
    return (
      <div className="kyc-status">
        <div className="status-indicator not-verified">
          <span className="status-icon">⚠️</span>
          <span className="status-text">KYC Required</span>
        </div>
      </div>
    );
  }

  const isExpired = verificationResult.expiresAt && new Date() > verificationResult.expiresAt;

  if (isExpired) {
    return (
      <div className="kyc-status">
        <div className="status-indicator expired">
          <span className="status-icon">⏰</span>
          <span className="status-text">KYC Expired</span>
        </div>
      </div>
    );
  }

  return (
    <div className="kyc-status">
      <div className="status-indicator verified">
        <span className="status-icon">✅</span>
        <span className="status-text">KYC Verified</span>
      </div>
      <div className="kyc-details">
        <small>
          Expires: {verificationResult.expiresAt?.toLocaleDateString()}
        </small>
      </div>
    </div>
  );
}
