import { useCurrentAccount } from '@mysten/dapp-kit';
import { useUserRole } from '../hooks/useUserRole';
import { AuditTrailService } from '../services/auditTrailService';
import { useSuiClient } from '@mysten/dapp-kit';
import { useState, useEffect, useCallback } from 'react';
import { 
  type AuditEvent, 
  type AuditTrailResponse,
  type AuditTrailFilter,
  AUDIT_EVENT_TYPES 
} from '../services/auditTrailService';

export function AuditTrailViewer() {
  const account = useCurrentAccount();
  const { roleData } = useUserRole();
  const suiClient = useSuiClient();
  const [auditTrailService] = useState(() => new AuditTrailService(suiClient));
  
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<AuditTrailFilter>({
    limit: 50,
  });
  const [statistics, setStatistics] = useState({
    totalAccessRequests: 0,
    approvedRequests: 0,
    rejectedRequests: 0,
    totalDataAccess: 0,
    uniqueAccessors: 0,
    lastAccessTime: 0,
  });

  // Load audit trail
  const loadAuditTrail = useCallback(async () => {
    if (!account?.address || !roleData?.role) {
      setAuditEvents([]);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      let response: AuditTrailResponse;
      
      if (roleData.role === 'patient') {
        // Patients see their own audit trail
        response = await auditTrailService.getAuditTrailForPatient(account.address, filter);
      } else {
        // Doctors/pharmacists see their access audit trail
        response = await auditTrailService.getAuditTrailForUser(account.address, filter);
      }

      if (response.success) {
        setAuditEvents(response.events);
      } else {
        setError(response.error || 'Failed to load audit trail.');
      }
    } catch (err) {
      console.error('Error loading audit trail:', err);
      setError(err instanceof Error ? err.message : 'Unknown error loading audit trail.');
    } finally {
      setLoading(false);
    }
  }, [account?.address, roleData?.role, filter, auditTrailService]);

  // Load audit statistics
  const loadAuditStatistics = useCallback(async () => {
    if (!account?.address || roleData?.role !== 'patient') {
      return;
    }
    
    try {
      const stats = await auditTrailService.getAuditStatistics(account.address);
      setStatistics(stats);
    } catch (err) {
      console.error('Error loading audit statistics:', err);
    }
  }, [account?.address, roleData?.role, auditTrailService]);

  useEffect(() => {
    loadAuditTrail();
    loadAuditStatistics();
  }, [loadAuditTrail, loadAuditStatistics]);

  const getEventTypeText = (eventType: string) => {
    switch (eventType) {
      case AUDIT_EVENT_TYPES.ACCESS_REQUEST_CREATED:
        return 'Access Request Created';
      case AUDIT_EVENT_TYPES.ACCESS_REQUEST_APPROVED:
        return 'Access Request Approved';
      case AUDIT_EVENT_TYPES.ACCESS_REQUEST_REJECTED:
        return 'Access Request Rejected';
      case AUDIT_EVENT_TYPES.DATA_ACCESS_RECORDED:
        return 'Data Access Recorded';
      default:
        return eventType;
    }
  };

  const getEventTypeIcon = (eventType: string) => {
    switch (eventType) {
      case AUDIT_EVENT_TYPES.ACCESS_REQUEST_CREATED:
        return '📝';
      case AUDIT_EVENT_TYPES.ACCESS_REQUEST_APPROVED:
        return '✅';
      case AUDIT_EVENT_TYPES.ACCESS_REQUEST_REJECTED:
        return '❌';
      case AUDIT_EVENT_TYPES.DATA_ACCESS_RECORDED:
        return '👁️';
      default:
        return '📋';
    }
  };

  const getTransactionTypeText = (transactionType: number) => {
    switch (transactionType) {
      case 0:
        return 'Request';
      case 1:
        return 'Approval';
      case 2:
        return 'Rejection';
      case 3:
        return 'Read';
      case 4:
        return 'Write';
      case 5:
        return 'Delete';
      default:
        return 'Unknown';
    }
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (!account || !roleData) {
    return (
      <div className="audit-trail-viewer">
        <div className="audit-trail-header">
          <h3><span role="img" aria-label="audit-trail">📊</span> Audit Trail Viewer</h3>
          <p>Connect your wallet and select a role to view audit trail.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="audit-trail-viewer">
      <div className="audit-trail-header">
        <h3><span role="img" aria-label="audit-trail">📊</span> Audit Trail Viewer</h3>
        <p>Comprehensive audit logging for compliance and transparency.</p>
      </div>

      {error && (
        <div className="error-message">
          <span className="error-icon">❌</span>
          <span>{error}</span>
        </div>
      )}

      {/* Audit Statistics (for Patients) */}
      {roleData.role === 'patient' && (
        <div className="audit-statistics">
          <h4>Access Statistics</h4>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-value">{statistics.totalAccessRequests}</span>
              <span className="stat-label">Total Requests</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{statistics.approvedRequests}</span>
              <span className="stat-label">Approved</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{statistics.rejectedRequests}</span>
              <span className="stat-label">Rejected</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{statistics.totalDataAccess}</span>
              <span className="stat-label">Data Access</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{statistics.uniqueAccessors}</span>
              <span className="stat-label">Unique Accessors</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">
                {statistics.lastAccessTime ? formatTimestamp(statistics.lastAccessTime) : 'Never'}
              </span>
              <span className="stat-label">Last Access</span>
            </div>
          </div>
        </div>
      )}

      {/* Filter Controls */}
      <div className="audit-filters">
        <h4>Filters</h4>
        <div className="filter-controls">
          <div className="filter-group">
            <label htmlFor="eventType">Event Type:</label>
            <select
              id="eventType"
              value={filter.eventType || ''}
              onChange={(e) => setFilter({ ...filter, eventType: e.target.value as any || undefined })}
              disabled={loading}
            >
              <option value="">All Events</option>
              <option value={AUDIT_EVENT_TYPES.ACCESS_REQUEST_CREATED}>Access Request Created</option>
              <option value={AUDIT_EVENT_TYPES.ACCESS_REQUEST_APPROVED}>Access Request Approved</option>
              <option value={AUDIT_EVENT_TYPES.ACCESS_REQUEST_REJECTED}>Access Request Rejected</option>
              <option value={AUDIT_EVENT_TYPES.DATA_ACCESS_RECORDED}>Data Access Recorded</option>
            </select>
          </div>
          <div className="filter-group">
            <label htmlFor="limit">Limit:</label>
            <select
              id="limit"
              value={filter.limit || 50}
              onChange={(e) => setFilter({ ...filter, limit: Number(e.target.value) })}
              disabled={loading}
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={200}>200</option>
            </select>
          </div>
          <button 
            onClick={loadAuditTrail} 
            disabled={loading}
            className="refresh-button"
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Audit Events List */}
      <div className="audit-events-list">
        <h4>Audit Events</h4>
        {loading && (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <span>Loading audit events...</span>
          </div>
        )}

        {!loading && auditEvents.length === 0 && (
          <div className="no-events">
            <p>No audit events found.</p>
          </div>
        )}

        {auditEvents.map((event) => (
          <div key={event.id} className="audit-event-item">
            <div className="event-header">
              <div className="event-type">
                <span className="event-icon">{getEventTypeIcon(event.eventType)}</span>
                <span className="event-name">{getEventTypeText(event.eventType)}</span>
              </div>
              <span className="event-timestamp">{formatTimestamp(event.timestamp)}</span>
            </div>
            <div className="event-details">
              <div className="event-info">
                <p><strong>User:</strong> {formatAddress(event.userAddress)}</p>
                <p><strong>Patient:</strong> {formatAddress(event.patientAddress)}</p>
                <p><strong>Data ID:</strong> {event.dataObjectId}</p>
                <p><strong>Transaction Type:</strong> {getTransactionTypeText(event.transactionType)}</p>
                {event.requestId && (
                  <p><strong>Request ID:</strong> #{event.requestId}</p>
                )}
              </div>
              {event.details && Object.keys(event.details).length > 0 && (
                <div className="event-details-json">
                  <details>
                    <summary>Additional Details</summary>
                    <pre>{JSON.stringify(event.details, null, 2)}</pre>
                  </details>
                </div>
              )}
              {event.transactionHash && (
                <div className="event-transaction">
                  <p><strong>Transaction:</strong> {formatAddress(event.transactionHash)}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
