import React from 'react';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { useUserRole } from '../hooks/useUserRole';

export function DoctorDashboard() {
  const account = useCurrentAccount();
  const { roleData } = useUserRole();

  return (
    <div className="dashboard doctor-dashboard">
      <div className="dashboard-header">
        <h2>👨‍⚕️ Doctor Dashboard</h2>
        <p>Welcome, Dr. {account?.address?.slice(0, 8)}...</p>
        <div className="role-badge doctor">DOCTOR</div>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-section">
          <h3>Patient Records</h3>
          <p>Access and manage patient health records with full permissions.</p>
          <div className="permissions">
            <div className="permission-item">
              <span className="permission-icon">📋</span>
              <span>View all patient data</span>
            </div>
            <div className="permission-item">
              <span className="permission-icon">✏️</span>
              <span>Add new health records</span>
            </div>
            <div className="permission-item">
              <span className="permission-icon">🔍</span>
              <span>Access lab results</span>
            </div>
            <div className="permission-item">
              <span className="permission-icon">💊</span>
              <span>Manage prescriptions</span>
            </div>
          </div>
        </div>

        <div className="dashboard-section">
          <h3>Emergency Access</h3>
          <p>Emergency access capabilities for critical situations.</p>
          <button className="emergency-btn">
            🚨 Initiate Emergency Access
          </button>
        </div>

        <div className="dashboard-section">
          <h3>Recent Activity</h3>
          <p>Your recent patient interactions and data access.</p>
          <div className="activity-list">
            <div className="activity-item">
              <span className="activity-time">2 hours ago</span>
              <span className="activity-desc">Viewed patient lab results</span>
            </div>
            <div className="activity-item">
              <span className="activity-time">1 day ago</span>
              <span className="activity-desc">Added prescription for Patient A</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
