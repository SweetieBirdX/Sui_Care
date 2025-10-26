import { useCurrentAccount } from '@mysten/dapp-kit';
import { useUserRole } from '../hooks/useUserRole';
import { AccessControlService } from '../services/accessControlService';
import { useSuiClient } from '@mysten/dapp-kit';
import { useState, useEffect, useCallback } from 'react';
import { 
  type AccessRequest, 
  type AccessRequestResponse,
  ACCESS_REQUEST_STATUS 
} from '../services/accessControlService';

export function AccessRequestManager() {
  const account = useCurrentAccount();
  const { roleData } = useUserRole();
  const suiClient = useSuiClient();
  const [accessControlService] = useState(() => new AccessControlService(suiClient));
  
  const [accessRequests, setAccessRequests] = useState<AccessRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [selectedDataId, setSelectedDataId] = useState('');
  const [lifetimeEpochs, setLifetimeEpochs] = useState(7);

  // Load access requests (mock data for now)
  const loadAccessRequests = useCallback(async () => {
    if (!account?.address || !roleData?.role) {
      setAccessRequests([]);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // In production, this would query on-chain events
      // For now, use mock data
      const mockRequests: AccessRequest[] = [
        {
          requestId: 1,
          doctorAddress: account.address,
          patientAddress: '0x1234567890abcdef',
          dataObjectId: 'health_lab_result_123',
          expiryTime: Date.now() + 7 * 24 * 60 * 60 * 1000,
          status: ACCESS_REQUEST_STATUS.PENDING,
          createdAt: Date.now() - 2 * 60 * 60 * 1000, // 2 hours ago
          policyId: 'default_policy',
        },
        {
          requestId: 2,
          doctorAddress: '0x9876543210fedcba',
          patientAddress: account.address,
          dataObjectId: 'health_prescription_456',
          expiryTime: Date.now() + 5 * 24 * 60 * 60 * 1000,
          status: ACCESS_REQUEST_STATUS.APPROVED,
          createdAt: Date.now() - 24 * 60 * 60 * 1000, // 1 day ago
          approvedAt: Date.now() - 12 * 60 * 60 * 1000, // 12 hours ago
          policyId: 'default_policy',
        },
      ];
      
      setAccessRequests(mockRequests);
    } catch (err) {
      console.error('Error loading access requests:', err);
      setError(err instanceof Error ? err.message : 'Unknown error loading access requests.');
    } finally {
      setLoading(false);
    }
  }, [account?.address, roleData?.role]);

  useEffect(() => {
    loadAccessRequests();
  }, [loadAccessRequests]);

  const requestAccess = async () => {
    if (!account?.address || !roleData?.role || !selectedPatient || !selectedDataId) {
      setError('Please fill in all required fields.');
      return;
    }

    if (roleData.role !== 'doctor') {
      setError('Only doctors can request access to patient data.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response: AccessRequestResponse = await accessControlService.requestAccess(
        account.address,
        selectedPatient,
        selectedDataId,
        lifetimeEpochs
      );

      if (response.success) {
        await loadAccessRequests(); // Reload requests
        setSelectedPatient('');
        setSelectedDataId('');
        setLifetimeEpochs(7);
      } else {
        setError(response.error || 'Failed to request access.');
      }
    } catch (err) {
      console.error('Error requesting access:', err);
      setError(err instanceof Error ? err.message : 'Unknown error requesting access.');
    } finally {
      setLoading(false);
    }
  };

  const approveAccess = async (requestId: number) => {
    if (!account?.address || !roleData?.role) {
      setError('Wallet not connected or role not selected.');
      return;
    }

    if (roleData.role !== 'patient') {
      setError('Only patients can approve access requests.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // In production, this would use the actual AccessRequest object ID
      const accessRequestObjectId = `access_request_${requestId}`;
      
      const response: AccessRequestResponse = await accessControlService.approveAccess(
        accessRequestObjectId,
        account.address
      );

      if (response.success) {
        await loadAccessRequests(); // Reload requests
      } else {
        setError(response.error || 'Failed to approve access request.');
      }
    } catch (err) {
      console.error('Error approving access:', err);
      setError(err instanceof Error ? err.message : 'Unknown error approving access.');
    } finally {
      setLoading(false);
    }
  };

  const rejectAccess = async (requestId: number) => {
    if (!account?.address || !roleData?.role) {
      setError('Wallet not connected or role not selected.');
      return;
    }

    if (roleData.role !== 'patient') {
      setError('Only patients can reject access requests.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // In production, this would use the actual AccessRequest object ID
      const accessRequestObjectId = `access_request_${requestId}`;
      
      const response: AccessRequestResponse = await accessControlService.rejectAccess(
        accessRequestObjectId,
        account.address
      );

      if (response.success) {
        await loadAccessRequests(); // Reload requests
      } else {
        setError(response.error || 'Failed to reject access request.');
      }
    } catch (err) {
      console.error('Error rejecting access:', err);
      setError(err instanceof Error ? err.message : 'Unknown error rejecting access.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusText = (status: number) => {
    switch (status) {
      case ACCESS_REQUEST_STATUS.PENDING:
        return 'Pending';
      case ACCESS_REQUEST_STATUS.APPROVED:
        return 'Approved';
      case ACCESS_REQUEST_STATUS.REJECTED:
        return 'Rejected';
      case ACCESS_REQUEST_STATUS.EXPIRED:
        return 'Expired';
      default:
        return 'Unknown';
    }
  };

  const getStatusColor = (status: number) => {
    switch (status) {
      case ACCESS_REQUEST_STATUS.PENDING:
        return '#f59e0b'; // Yellow
      case ACCESS_REQUEST_STATUS.APPROVED:
        return '#10b981'; // Green
      case ACCESS_REQUEST_STATUS.REJECTED:
        return '#ef4444'; // Red
      case ACCESS_REQUEST_STATUS.EXPIRED:
        return '#6b7280'; // Gray
      default:
        return '#6b7280';
    }
  };

  if (!account || !roleData) {
    return (
      <div className="access-request-manager">
        <div className="access-request-header">
          <h3><span role="img" aria-label="access-request">🔐</span> Access Request Manager</h3>
          <p>Connect your wallet and select a role to manage access requests.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="access-request-manager">
      <div className="access-request-header">
        <h3><span role="img" aria-label="access-request">🔐</span> Access Request Manager</h3>
        <p>Manage digital approval flow for patient data access with on-chain audit trail.</p>
      </div>

      {error && (
        <div className="error-message">
          <span className="error-icon">❌</span>
          <span>{error}</span>
        </div>
      )}

      {/* Request Access Form (for Doctors) */}
      {roleData.role === 'doctor' && (
        <div className="request-access-form">
          <h4>Request Access to Patient Data</h4>
          <div className="form-group">
            <label htmlFor="patientAddress">Patient Address:</label>
            <input
              id="patientAddress"
              type="text"
              value={selectedPatient}
              onChange={(e) => setSelectedPatient(e.target.value)}
              placeholder="0x..."
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="dataId">Data Object ID:</label>
            <input
              id="dataId"
              type="text"
              value={selectedDataId}
              onChange={(e) => setSelectedDataId(e.target.value)}
              placeholder="health_lab_result_123"
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="lifetimeEpochs">Lifetime (days):</label>
            <input
              id="lifetimeEpochs"
              type="number"
              value={lifetimeEpochs}
              onChange={(e) => setLifetimeEpochs(Number(e.target.value))}
              min="1"
              max="30"
              disabled={loading}
            />
          </div>
          <button 
            onClick={requestAccess} 
            disabled={loading || !selectedPatient || !selectedDataId}
            className="request-button"
          >
            {loading ? 'Requesting...' : 'Request Access'}
          </button>
        </div>
      )}

      {/* Access Requests List */}
      <div className="access-requests-list">
        <h4>Access Requests</h4>
        {loading && (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <span>Loading access requests...</span>
          </div>
        )}

        {!loading && accessRequests.length === 0 && (
          <div className="no-requests">
            <p>No access requests found.</p>
          </div>
        )}

        {accessRequests.map((request) => (
          <div key={request.requestId} className="access-request-item">
            <div className="request-header">
              <h5>Request #{request.requestId}</h5>
              <span 
                className="request-status"
                style={{ color: getStatusColor(request.status) }}
              >
                {getStatusText(request.status)}
              </span>
            </div>
            <div className="request-details">
              <p><strong>Doctor:</strong> {request.doctorAddress.slice(0, 6)}...{request.doctorAddress.slice(-4)}</p>
              <p><strong>Patient:</strong> {request.patientAddress.slice(0, 6)}...{request.patientAddress.slice(-4)}</p>
              <p><strong>Data ID:</strong> {request.dataObjectId}</p>
              <p><strong>Created:</strong> {new Date(request.createdAt).toLocaleString()}</p>
              <p><strong>Expires:</strong> {new Date(request.expiryTime).toLocaleString()}</p>
              {request.approvedAt && (
                <p><strong>Approved:</strong> {new Date(request.approvedAt).toLocaleString()}</p>
              )}
            </div>
            
            {/* Action Buttons (for Patients) */}
            {roleData.role === 'patient' && 
             request.patientAddress === account.address && 
             request.status === ACCESS_REQUEST_STATUS.PENDING && (
              <div className="request-actions">
                <button 
                  onClick={() => approveAccess(request.requestId)} 
                  disabled={loading}
                  className="approve-button"
                >
                  Approve
                </button>
                <button 
                  onClick={() => rejectAccess(request.requestId)} 
                  disabled={loading}
                  className="reject-button"
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
