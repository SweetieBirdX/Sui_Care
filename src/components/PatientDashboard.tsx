import React from 'react';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { useUserRole } from '../hooks/useUserRole';

export function PatientDashboard() {
  const account = useCurrentAccount();
  const { roleData } = useUserRole();

  return (
    <div className="dashboard patient-dashboard">
      <div className="dashboard-header">
        <h2>👤 Patient Dashboard</h2>
        <p>Welcome, Patient {account?.address?.slice(0, 8)}...</p>
        <div className="role-badge patient">PATIENT</div>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-section">
          <h3>My Health Records</h3>
          <p>View your personal health information and medical history.</p>
          <div className="permissions">
            <div className="permission-item">
              <span className="permission-icon">👁️</span>
              <span>View your own data</span>
            </div>
            <div className="permission-item">
              <span className="permission-icon">🔒</span>
              <span>Control data access permissions</span>
            </div>
            <div className="permission-item">
              <span className="permission-icon">❌</span>
              <span>Cannot modify existing records</span>
            </div>
            <div className="permission-item">
              <span className="permission-icon">❌</span>
              <span>Cannot access other patients' data</span>
            </div>
          </div>
        </div>

        <div className="dashboard-section">
          <h3>Access Control</h3>
          <p>Manage who can access your health data.</p>
          <div className="access-controls">
            <button className="access-btn grant">
              👨‍⚕️ Grant Doctor Access
            </button>
            <button className="access-btn revoke">
              🚫 Revoke Access
            </button>
          </div>
        </div>

        <div className="dashboard-section">
          <h3>My Data</h3>
          <p>Your personal health information.</p>
          <div className="data-summary">
            <div className="data-item">
              <span className="data-label">Lab Results:</span>
              <span className="data-count">3 records</span>
            </div>
            <div className="data-item">
              <span className="data-label">Prescriptions:</span>
              <span className="data-count">2 active</span>
            </div>
            <div className="data-item">
              <span className="data-label">Medical History:</span>
              <span className="data-count">5 entries</span>
            </div>
          </div>
        </div>

        <div className="dashboard-section">
          <h3>Important Notice</h3>
          <div className="patient-notice">
            <p>🔒 <strong>Data Protection:</strong> You can view your own data and control access permissions, 
            but you cannot modify existing health records. Only authorized doctors can add new information to your records.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
