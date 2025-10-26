import { useCurrentAccount } from '@mysten/dapp-kit';
import { useState } from 'react';
import { useUserRole, type UserRole } from '../hooks/useUserRole';
import { User, Stethoscope, Pill, CheckCircle, XCircle, Settings } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

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

// Role Selection - Redirects to appropriate dashboards
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
      // Save role using localStorage system
      const success = await saveUserRole(selectedRole, true);
      
              if (success) {
                console.log(`🎭 Role selected: ${selectedRole}`);
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
      icon: Stethoscope,
      description: 'Medical professional providing healthcare services',
      color: '#4ecdc4',
      permissions: ['View all patient data', 'Add new reports', 'Emergency access', 'Manage access requests']
    },
    {
      id: 'PHARMACY' as UserRole,
      title: 'Pharmacy',
      icon: Pill,
      description: 'Healthcare facility managing medications',
      color: '#45b7b8',
      permissions: ['View prescriptions only', 'Manage inventory', 'Dispense medication']
    },
    {
      id: 'PATIENT' as UserRole,
      title: 'Patient',
      icon: User,
      description: 'Individual seeking healthcare services',
      color: '#96ceb4',
      permissions: ['View own records', 'Manage access control', 'Download reports']
    },
  ];

  return (
    <div className="role-selection">
      <Card className="role-selection-header">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-6 h-6" />
            Select Your Role
          </CardTitle>
          <CardDescription>
            Choose your role in the healthcare ecosystem to continue.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="roles-grid">
        {roles.map((role) => {
          const IconComponent = role.icon;
          return (
            <Card
              key={role.id}
              className={`role-card ${selectedRole === role.id ? 'selected' : ''} cursor-pointer transition-all duration-300 hover:scale-105`}
              onClick={() => handleRoleSelect(role.id)}
              style={{ '--role-color': role.color } as React.CSSProperties}
            >
              <CardHeader className="text-center">
                <div className="role-icon mx-auto mb-4">
                  <IconComponent className="w-12 h-12" style={{ color: role.color }} />
                </div>
                <CardTitle className="role-title">{role.title}</CardTitle>
                <CardDescription className="role-description">{role.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="role-permissions">
                  <h5 className="font-semibold mb-2">Permissions:</h5>
                  <ul className="space-y-1">
                    {role.permissions.map((permission, index) => (
                      <li key={index} className="text-sm text-gray-600 dark:text-gray-300">
                        • {permission}
                      </li>
                    ))}
                  </ul>
                </div>
                {selectedRole === role.id && (
                  <div className="selected-indicator mt-4 flex justify-center">
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {error && (
        <Card className="role-error border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
          <CardContent className="p-4">
            <div className="error-message flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-500" />
              <span className="text-red-700 dark:text-red-300">{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {selectedRole && (
        <Card className="role-confirmation">
          <CardContent className="p-6">
            <div className="selected-role-info flex items-center gap-3 mb-4">
              {(() => {
                const selectedRoleData = roles.find(r => r.id === selectedRole);
                const IconComponent = selectedRoleData?.icon;
                return (
                  <>
                    <div className="selected-role-icon">
                      {IconComponent && <IconComponent className="w-6 h-6" style={{ color: selectedRoleData?.color }} />}
                    </div>
                    <span className="selected-role-text text-lg">
                      Selected: <strong>{selectedRoleData?.title}</strong>
                    </span>
                  </>
                );
              })()}
            </div>
            
            <Button
              onClick={handleConfirmRole}
              disabled={isSubmitting || isLoading}
              className="w-full"
              size="lg"
            >
                      {isSubmitting || isLoading ? (
                        <>
                          <div className="button-spinner mr-2"></div>
                          {isSubmitting ? 'Saving...' : 'Loading...'}
                        </>
                      ) : (
                        'Confirm Role Selection'
                      )}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
