import React from 'react';
import { useCurrentAccount } from '@mysten/dapp-kit';

export function DoctorDashboard() {
  const account = useCurrentAccount();

  return (
    <div className="dashboard doctor-dashboard">
      <div className="dashboard-header">
        <h2>👨‍⚕️ Doctor Dashboard</h2>
        <p>Welcome, Dr. {account?.address?.slice(0, 8)}...</p>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-section">
          <h3>📋 Patient Records</h3>
          <div className="section-content">
            <p>View and manage patient health records</p>
            <div className="action-buttons">
              <button className="btn-primary">View Patient List</button>
              <button className="btn-secondary">Search Patient</button>
            </div>
          </div>
        </div>

        <div className="dashboard-section">
          <h3>📝 New Reports</h3>
          <div className="section-content">
            <p>Add new test results and medical reports</p>
            <div className="action-buttons">
              <button className="btn-primary">Add Lab Results</button>
              <button className="btn-secondary">Add Diagnosis</button>
            </div>
          </div>
        </div>

        <div className="dashboard-section">
          <h3>🔐 Access Requests</h3>
          <div className="section-content">
            <p>Manage patient data access requests</p>
            <div className="action-buttons">
              <button className="btn-primary">View Requests</button>
              <button className="btn-secondary">Request Access</button>
            </div>
          </div>
        </div>

        <div className="dashboard-section">
          <h3>🚨 Emergency Access</h3>
          <div className="section-content">
            <p>Emergency access to patient data (MasterKey authority)</p>
            <div className="action-buttons">
              <button className="btn-emergency">Emergency Access</button>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-footer">
        <p className="role-info">
          <strong>Role:</strong> Doctor | <strong>Permissions:</strong> Read all patient data, Add new reports, Emergency access
        </p>
      </div>
    </div>
  );
}