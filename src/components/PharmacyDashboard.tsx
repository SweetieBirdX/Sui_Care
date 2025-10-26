import React from 'react';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { useUserRole } from '../hooks/useUserRole';

export function PharmacyDashboard() {
  const account = useCurrentAccount();
  const { roleData } = useUserRole();

  return (
    <div className="dashboard pharmacy-dashboard">
      <div className="dashboard-header">
        <h2>🏥 Pharmacy Dashboard</h2>
        <p>Welcome, Pharmacy {account?.address?.slice(0, 8)}...</p>
        <div className="role-badge pharmacy">PHARMACY</div>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-section">
          <h3>Prescription Management</h3>
          <p>View and manage patient prescriptions with read-only access.</p>
          <div className="permissions">
            <div className="permission-item">
              <span className="permission-icon">📋</span>
              <span>View prescriptions only</span>
            </div>
            <div className="permission-item">
              <span className="permission-icon">🔍</span>
              <span>Read medication details</span>
            </div>
            <div className="permission-item">
              <span className="permission-icon">❌</span>
              <span>Cannot modify patient data</span>
            </div>
            <div className="permission-item">
              <span className="permission-icon">❌</span>
              <span>Cannot access lab results</span>
            </div>
          </div>
        </div>

        <div className="dashboard-section">
          <h3>Prescription Queue</h3>
          <p>Current prescriptions awaiting processing.</p>
          <div className="prescription-list">
            <div className="prescription-item">
              <span className="prescription-id">RX-001</span>
              <span className="prescription-patient">Patient A</span>
              <span className="prescription-status pending">Pending</span>
            </div>
            <div className="prescription-item">
              <span className="prescription-id">RX-002</span>
              <span className="prescription-patient">Patient B</span>
              <span className="prescription-status completed">Completed</span>
            </div>
          </div>
        </div>

        <div className="dashboard-section">
          <h3>Restrictions Notice</h3>
          <div className="restriction-notice">
            <p>⚠️ <strong>Access Limited:</strong> As a pharmacy, you can only view prescription data. 
            You cannot access patient lab results, medical history, or other sensitive health information.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
