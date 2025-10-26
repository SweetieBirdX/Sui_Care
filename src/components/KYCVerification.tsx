import { useCurrentAccount } from '@mysten/dapp-kit';
import { useZKProofVerification } from '../hooks/useZKProofVerification';
import { useUserRole, type UserRole } from '../hooks/useUserRole';
import { RoleSelection } from './RoleSelection';
import { useEffect, useState } from 'react';

export function KYCVerification() {
  const account = useCurrentAccount();
  const {
    status,
    verificationResult,
    verifyZKProof,
    checkVerificationStatus,
    loadStoredVerification,
    resetVerification,
  } = useZKProofVerification();
  
  const { roleData } = useUserRole();
  const [showRoleSelection, setShowRoleSelection] = useState(false);

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

  // Show role selection after KYC verification
  useEffect(() => {
    if (status === 'verified' && !roleData && !showRoleSelection) {
      setShowRoleSelection(true);
    }
  }, [status, roleData, showRoleSelection]);

  const handleVerifyKYC = async () => {
    if (!account?.address) return;
    
    await verifyZKProof(account.address);
  };

  const handleResetVerification = () => {
    resetVerification();
    setShowRoleSelection(false);
  };

  const handleRoleSelected = (_role: UserRole) => {
    setShowRoleSelection(false);
  };

  if (!account) {
    return (
      <div className="kyc-verification">
        <h3>🔐 KYC Verification</h3>
        <p>Please connect your wallet to verify your identity.</p>
      </div>
    );
  }

  return (
    <div className="kyc-verification">
      <h3>🔐 KYC Verification</h3>
      
      {status === 'idle' && (
        <div className="kyc-idle">
          <p>Verify your identity using Zero-Knowledge Proof technology.</p>
          <p className="kyc-description">
            This process will verify your KYC status without revealing your personal information.
          </p>
          <button 
            onClick={handleVerifyKYC}
            className="verify-button"
          >
            Start KYC Verification
          </button>
        </div>
      )}

      {status === 'verifying' && (
        <div className="kyc-verifying">
          <div className="verification-spinner">
            <div className="spinner"></div>
          </div>
          <p>Verifying your identity...</p>
          <p className="verification-subtitle">
            This may take a few moments. Please don't close this page.
          </p>
        </div>
      )}

      {status === 'verified' && verificationResult && (
        <div className="kyc-verified">
          <div className="verification-success">
            <div className="success-icon">✅</div>
            <h4>KYC Verification Successful!</h4>
          </div>
          
          <div className="verification-details">
            <div className="detail-item">
              <strong>Status:</strong>
              <span className="status-verified">Verified</span>
            </div>
            <div className="detail-item">
              <strong>Proof Hash:</strong>
              <code className="proof-hash">{verificationResult.proofHash}</code>
            </div>
            <div className="detail-item">
              <strong>Verified At:</strong>
              <span>{verificationResult.verifiedAt?.toLocaleString()}</span>
            </div>
            <div className="detail-item">
              <strong>Expires At:</strong>
              <span>{verificationResult.expiresAt?.toLocaleString()}</span>
            </div>
            {roleData && (
              <div className="detail-item">
                <strong>Role:</strong>
                <span className="role-badge">
                  {roleData.role === 'doctor' && '👨‍⚕️ Doctor'}
                  {roleData.role === 'pharmacist' && '👩‍⚕️ Pharmacist'}
                  {roleData.role === 'patient' && '👤 Patient'}
                </span>
              </div>
            )}
          </div>
          
          <button 
            onClick={handleResetVerification}
            className="reset-button"
          >
            Reset Verification
          </button>
        </div>
      )}

      {/* Role Selection Component */}
      <RoleSelection 
        onRoleSelected={handleRoleSelected}
        isVisible={showRoleSelection}
      />

      {status === 'failed' && (
        <div className="kyc-failed">
          <div className="verification-error">
            <div className="error-icon">❌</div>
            <h4>KYC Verification Failed</h4>
          </div>
          
          <p className="error-message">
            {verificationResult?.error || 'Verification failed. Please try again.'}
          </p>
          
          <button 
            onClick={handleVerifyKYC}
            className="retry-button"
          >
            Try Again
          </button>
        </div>
      )}

      {status === 'expired' && (
        <div className="kyc-expired">
          <div className="verification-expired">
            <div className="expired-icon">⏰</div>
            <h4>KYC Verification Expired</h4>
          </div>
          
          <p>Your KYC verification has expired. Please verify again to continue.</p>
          
          <button 
            onClick={handleVerifyKYC}
            className="verify-button"
          >
            Re-verify KYC
          </button>
        </div>
      )}
    </div>
  );
}
