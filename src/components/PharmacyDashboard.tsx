import React from 'react';
import { useCurrentAccount } from '@mysten/dapp-kit';

export function PharmacyDashboard() {
  const account = useCurrentAccount();

  return (
    <div className="dashboard pharmacy-dashboard">
      <div className="dashboard-header">
        <h2>💊 Pharmacy Dashboard</h2>
        <p>Welcome, Pharmacist {account?.address?.slice(0, 8)}...</p>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-section">
          <h3>📋 Prescriptions</h3>
          <div className="section-content">
            <p>View and manage patient prescriptions only</p>
            <div className="action-buttons">
              <button className="btn-primary">View Prescriptions</button>
              <button className="btn-secondary">Search Prescription</button>
            </div>
          </div>
        </div>

        <div className="dashboard-section">
          <h3>💊 Medication Management</h3>
          <div className="section-content">
            <p>Manage medication inventory and dispensing</p>
            <div className="action-buttons">
              <button className="btn-primary">Inventory</button>
              <button className="btn-secondary">Dispense Medication</button>
            </div>
          </div>
        </div>

        <div className="dashboard-section">
          <h3>📊 Prescription Analytics</h3>
          <div className="section-content">
            <p>View prescription statistics and trends</p>
            <div className="action-buttons">
              <button className="btn-primary">View Analytics</button>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-footer">
        <p className="role-info">
          <strong>Role:</strong> Pharmacist | <strong>Permissions:</strong> Read prescriptions only, No access to other patient data
        </p>
        <div className="restriction-notice">
          <p>⚠️ <strong>Access Restriction:</strong> You can only view prescriptions. Other patient data (lab results, diagnoses) is not accessible.</p>
        </div>
      </div>
    </div>
  );
}