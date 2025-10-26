import { useState } from 'react';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { useUserRole, type UserRole } from '../hooks/useUserRole';

interface RoleSetupProps {
  onRoleSelected?: (role: UserRole) => void;
  isVisible?: boolean;
}

export function RoleSetup({ onRoleSelected, isVisible = true }: RoleSetupProps) {
  const account = useCurrentAccount();
  const { saveUserRole, isLoading } = useUserRole();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  const roles = [
    {
      id: 'DOCTOR' as UserRole,
      title: 'Doctor',
      description: 'Access all patient data, add new reports, emergency access',
      icon: '👨‍⚕️',
      permissions: ['View all patient records', 'Add new reports', 'Emergency access', 'Manage access requests']
    },
    {
      id: 'PHARMACY' as UserRole,
      title: 'Pharmacist',
      description: 'Access prescriptions only, manage medication inventory',
      icon: '💊',
      permissions: ['View prescriptions only', 'Manage inventory', 'Dispense medication']
    },
    {
      id: 'PATIENT' as UserRole,
      title: 'Patient',
      description: 'View own data only, manage access permissions',
      icon: '👤',
      permissions: ['View own records', 'Manage access control', 'Download reports']
    }
  ];

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
  };

  const handleConfirmRole = async () => {
    if (!selectedRole || !account?.address) return;

    console.log(`🎭 Confirming role selection: ${selectedRole}`);
    
    const success = await saveUserRole(selectedRole, true);
    if (success) {
      console.log(`✅ Role ${selectedRole} saved successfully`);
      onRoleSelected?.(selectedRole);
    } else {
      console.error(`❌ Failed to save role ${selectedRole}`);
    }
  };

  if (!isVisible || !account) {
    return (
      <div className="role-setup">
        <h3>🔐 Role Setup</h3>
        <p>Please connect your wallet to set up your role.</p>
      </div>
    );
  }

  return (
    <div className="role-setup">
      <div className="role-setup-header">
        <h2>🎭 Choose Your Role</h2>
        <p>Select your role in the healthcare system to access the appropriate features.</p>
      </div>

      <div className="role-options">
        {roles.map((role) => (
          <div
            key={role.id}
            className={`role-option ${selectedRole === role.id ? 'selected' : ''}`}
            onClick={() => handleRoleSelect(role.id)}
          >
            <div className="role-icon">{role.icon}</div>
            <div className="role-content">
              <h3>{role.title}</h3>
              <p className="role-description">{role.description}</p>
              <div className="role-permissions">
                <h4>Permissions:</h4>
                <ul>
                  {role.permissions.map((permission, index) => (
                    <li key={index}>{permission}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="role-selector">
              <input
                type="radio"
                name="role"
                value={role.id}
                checked={selectedRole === role.id}
                onChange={() => handleRoleSelect(role.id)}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="role-setup-actions">
        <button
          className="btn-primary"
          onClick={handleConfirmRole}
          disabled={!selectedRole || isLoading}
        >
          {isLoading ? 'Saving...' : 'Confirm Role Selection'}
        </button>
      </div>

      <div className="role-setup-footer">
        <p className="security-notice">
          🔒 <strong>Security Notice:</strong> Your role will be encrypted and stored securely. 
          You can change your role later if needed.
        </p>
      </div>
    </div>
  );
}
