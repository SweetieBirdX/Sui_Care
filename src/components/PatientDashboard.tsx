import React from 'react';
import { useCurrentAccount } from '@mysten/dapp-kit';

export function PatientDashboard() {
  const account = useCurrentAccount();

  return (
    <div className="dashboard patient-dashboard">
      <div className="dashboard-header">
        <h2>👤 Patient Dashboard</h2>
        <p>Welcome, Patient {account?.address?.slice(0, 8)}...</p>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-section">
          <h3>📋 My Health Records</h3>
          <div className="section-content">
            <p>View your personal health information (read-only)</p>
            <div className="action-buttons">
              <button className="btn-primary">View My Records</button>
              <button className="btn-secondary">Download Report</button>
            </div>
          </div>
        </div>

        <div className="dashboard-section">
          <h3>💊 My Prescriptions</h3>
          <div className="section-content">
            <p>View your current and past prescriptions</p>
            <div className="action-buttons">
              <button className="btn-primary">View Prescriptions</button>
              <button className="btn-secondary">Prescription History</button>
            </div>
          </div>
        </div>

        <div className="dashboard-section">
          <h3>🔐 Access Control</h3>
          <div className="section-content">
            <p>Manage who can access your health data</p>
            <div className="action-buttons">
              <button className="btn-primary">View Access Requests</button>
              <button className="btn-secondary">Grant Access</button>
            </div>
          </div>
        </div>

        <div className="dashboard-section">
          <h3>📊 Health Analytics</h3>
          <div className="section-content">
            <p>View your health trends and statistics</p>
            <div className="action-buttons">
              <button className="btn-primary">View Analytics</button>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-footer">
        <p className="role-info">
          <strong>Role:</strong> Patient | <strong>Permissions:</strong> View own data only, No modification rights
        </p>
        <div className="restriction-notice">
          <p>⚠️ <strong>Access Restriction:</strong> You can only view your own data. You cannot modify any health information.</p>
        </div>
      </div>
    </div>
  );
}