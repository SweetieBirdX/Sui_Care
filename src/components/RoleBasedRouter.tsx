import React from 'react';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { useUserRole } from '../hooks/useUserRole';
import { DoctorDashboard } from './DoctorDashboard';
import { PharmacyDashboard } from './PharmacyDashboard';
import { PatientDashboard } from './PatientDashboard';
import { RoleSetup } from './RoleSetup';
import { UnauthorizedPage } from './UnauthorizedPage';
import { KYCVerification } from './KYCVerification';

export function RoleBasedRouter() {
  const account = useCurrentAccount();
  const { roleData, status, error } = useUserRole();
  const [kycCompleted, setKycCompleted] = React.useState(false);

  // Debug logs
  console.log('🔍 RoleBasedRouter Debug:', {
    kycCompleted,
    roleData,
    status,
    error
  });

  // Loading state
  if (status === 'loading') {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your role information...</p>
      </div>
    );
  }

  // Error state
  if (status === 'error') {
    return (
      <div className="error-container">
        <div className="error-icon">⚠️</div>
        <h3>Error Loading Role</h3>
        <p>{error || 'An error occurred while loading your role information.'}</p>
        <button 
          className="retry-btn"
          onClick={() => window.location.reload()}
        >
          🔄 Retry
        </button>
      </div>
    );
  }

  // No wallet connected
  if (!account) {
    return (
      <div className="no-wallet-container">
        <div className="no-wallet-icon">🔗</div>
        <h3>Connect Your Wallet</h3>
        <p>Please connect your Sui wallet to access the healthcare system.</p>
      </div>
    );
  }

  // KYC Verification
  if (!kycCompleted) {
    return (
      <KYCVerification 
        onKYCComplete={() => {
          console.log('🎉 KYC completed callback triggered in RoleBasedRouter');
          setKycCompleted(true);
        }}
        isVisible={true}
      />
    );
  }

  // After KYC completion, show role setup if no role is selected
  if (kycCompleted && (roleData?.role === 'UNASSIGNED' || !roleData?.role)) {
    console.log('🎭 Showing role setup after KYC completion');
    return (
      <RoleSetup 
        onRoleSelected={(role) => {
          console.log(`Role ${role} selected, will be saved by useUserRole hook`);
        }} 
        isVisible={true} 
      />
    );
  }

  // If KYC is completed and role is selected, show appropriate dashboard
  if (kycCompleted && roleData?.role && roleData.role !== 'UNASSIGNED') {
    switch (roleData.role) {
      case 'DOCTOR':
        return <DoctorDashboard />;
      case 'PHARMACY':
        return <PharmacyDashboard />;
      case 'PATIENT':
        return <PatientDashboard />;
      default:
        return <UnauthorizedPage />;
    }
  }

  // Fallback: should not reach here
  return <UnauthorizedPage />;
}
