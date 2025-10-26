import { useCurrentAccount } from '@mysten/dapp-kit';
import { useState } from 'react';
import { useUserRole, type UserRole } from '../hooks/useUserRole';

interface RoleSelectionProps {
  onRoleSelected: (role: UserRole) => void;
  isVisible: boolean;
}

// ORIGINAL VERSION (COMMENTED OUT - REAL SEAL/WALRUS INTEGRATION)
/*
export function RoleSelection({ onRoleSelected, isVisible }: RoleSelectionProps) {
  const account = useCurrentAccount();
  const { saveUserRole, isLoading, error } = useUserRole();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isVisible || !account) {
    return null;
  }

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
  };

  const handleConfirmRole = async () => {
    if (!selectedRole) return;

    setIsSubmitting(true);
    
    try {
      // Save role using Seal encryption and Walrus storage
      const success = await saveUserRole(selectedRole, true);
      
      if (success) {
        onRoleSelected(selectedRole);
      } else {
        console.error('Failed to save role');
      }
    } catch (error) {
      console.error('Error confirming role:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const roles = [
    {
      id: 'DOCTOR' as UserRole,
      title: 'Doctor',
      icon: '👨‍⚕️',
      description: 'Medical professional providing healthcare services',
      color: '#4ecdc4',
    },
    {
      id: 'PHARMACY' as UserRole,
      title: 'Pharmacy',
      icon: '🏥',
      description: 'Healthcare facility managing medications',
      color: '#45b7b8',
    },
    {
      id: 'PATIENT' as UserRole,
      title: 'Patient',
      icon: '👤',
      description: 'Individual seeking healthcare services',
      color: '#96ceb4',
    },
  ];

  return (
    <div className="role-selection">
      <div className="role-selection-header">
        <h3>🎭 Select Your Role</h3>
        <p>Choose your role in the healthcare ecosystem to continue.</p>
      </div>

      <div className="roles-grid">
        {roles.map((role) => (
          <div
            key={role.id}
            className={`role-card ${selectedRole === role.id ? 'selected' : ''}`}
            onClick={() => handleRoleSelect(role.id)}
            style={{ '--role-color': role.color } as React.CSSProperties}
          >
            <div className="role-icon">{role.icon}</div>
            <h4 className="role-title">{role.title}</h4>
            <p className="role-description">{role.description}</p>
            {selectedRole === role.id && (
              <div className="selected-indicator">✓</div>
            )}
          </div>
        ))}
      </div>

      {error && (
        <div className="role-error">
          <div className="error-message">
            <span className="error-icon">❌</span>
            <span>{error}</span>
          </div>
        </div>
      )}

      {selectedRole && (
        <div className="role-confirmation">
          <div className="selected-role-info">
            <span className="selected-role-icon">{roles.find(r => r.id === selectedRole)?.icon}</span>
            <span className="selected-role-text">
              Selected: <strong>{roles.find(r => r.id === selectedRole)?.title}</strong>
            </span>
          </div>
          
          <button
            onClick={handleConfirmRole}
            disabled={isSubmitting || isLoading}
            className="confirm-role-button"
          >
            {isSubmitting || isLoading ? (
              <>
                <div className="button-spinner"></div>
                {isSubmitting ? 'Saving...' : 'Loading...'}
              </>
            ) : (
              'Confirm Role Selection'
            )}
          </button>
        </div>
      )}
    </div>
  );
}
*/

// MOCK VERSION - DIRECTLY REDIRECTS TO DASHBOARDS
export function RoleSelection({ onRoleSelected, isVisible }: RoleSelectionProps) {
  const account = useCurrentAccount();
  const { saveUserRole, isLoading, error } = useUserRole();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isVisible || !account) {
    return null;
  }

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
  };

  const handleConfirmRole = async () => {
    if (!selectedRole) return;

    setIsSubmitting(true);
    
    try {
      // Save role using mock localStorage system
      const success = await saveUserRole(selectedRole, true);
      
      if (success) {
        console.log(`🎭 Mock role selected: ${selectedRole}`);
        onRoleSelected(selectedRole);
      } else {
        console.error('Failed to save mock role');
      }
    } catch (error) {
      console.error('Error confirming mock role:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const roles = [
    {
      id: 'DOCTOR' as UserRole,
      title: 'Doctor',
      icon: '👨‍⚕️',
      description: 'Medical professional providing healthcare services',
      color: '#4ecdc4',
      permissions: ['View all patient data', 'Add new reports', 'Emergency access', 'Manage access requests']
    },
    {
      id: 'PHARMACY' as UserRole,
      title: 'Pharmacy',
      icon: '💊',
      description: 'Healthcare facility managing medications',
      color: '#45b7b8',
      permissions: ['View prescriptions only', 'Manage inventory', 'Dispense medication']
    },
    {
      id: 'PATIENT' as UserRole,
      title: 'Patient',
      icon: '👤',
      description: 'Individual seeking healthcare services',
      color: '#96ceb4',
      permissions: ['View own records', 'Manage access control', 'Download reports']
    },
  ];

  return (
    <div className="role-selection">
      <div className="role-selection-header">
        <h3>🎭 Select Your Role (Mock Version)</h3>
        <p>Choose your role in the healthcare ecosystem to continue.</p>
        <div className="mock-notice">
          <p>🔧 <strong>Mock Mode:</strong> This will redirect you to the appropriate dashboard based on your role selection.</p>
        </div>
      </div>

      <div className="roles-grid">
        {roles.map((role) => (
          <div
            key={role.id}
            className={`role-card ${selectedRole === role.id ? 'selected' : ''}`}
            onClick={() => handleRoleSelect(role.id)}
            style={{ '--role-color': role.color } as React.CSSProperties}
          >
            <div className="role-icon">{role.icon}</div>
            <h4 className="role-title">{role.title}</h4>
            <p className="role-description">{role.description}</p>
            <div className="role-permissions">
              <h5>Permissions:</h5>
              <ul>
                {role.permissions.map((permission, index) => (
                  <li key={index}>{permission}</li>
                ))}
              </ul>
            </div>
            {selectedRole === role.id && (
              <div className="selected-indicator">✓</div>
            )}
          </div>
        ))}
      </div>

      {error && (
        <div className="role-error">
          <div className="error-message">
            <span className="error-icon">❌</span>
            <span>{error}</span>
          </div>
        </div>
      )}

      {selectedRole && (
        <div className="role-confirmation">
          <div className="selected-role-info">
            <span className="selected-role-icon">{roles.find(r => r.id === selectedRole)?.icon}</span>
            <span className="selected-role-text">
              Selected: <strong>{roles.find(r => r.id === selectedRole)?.title}</strong>
            </span>
          </div>
          
          <button
            onClick={handleConfirmRole}
            disabled={isSubmitting || isLoading}
            className="confirm-role-button"
          >
            {isSubmitting || isLoading ? (
              <>
                <div className="button-spinner"></div>
                {isSubmitting ? 'Saving...' : 'Loading...'}
              </>
            ) : (
              'Confirm Role Selection & Go to Dashboard'
            )}
          </button>
        </div>
      )}
    </div>
  );
}
