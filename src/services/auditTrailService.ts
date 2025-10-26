import { SuiClient } from '@mysten/sui/client';
import { ENV_VARS } from '../config/production';

// Audit Event Types
export const AUDIT_EVENT_TYPES = {
  ACCESS_REQUEST_CREATED: 'AccessRequestCreatedEvent',
  ACCESS_REQUEST_APPROVED: 'AccessRequestApprovedEvent',
  ACCESS_REQUEST_REJECTED: 'AccessRequestRejectedEvent',
  DATA_ACCESS_RECORDED: 'AccessAuditEvent',
  DATA_ADDED: 'DataAddedEvent',
  DATA_INTEGRITY_VIOLATION: 'DataIntegrityViolationEvent',
} as const;

export type AuditEventType = typeof AUDIT_EVENT_TYPES[keyof typeof AUDIT_EVENT_TYPES];

// Audit Event Interface
export interface AuditEvent {
  id: string;
  eventType: AuditEventType;
  timestamp: number;
  userAddress: string;
  patientAddress: string;
  dataObjectId: string;
  transactionType: number; // READ, WRITE, DELETE
  requestId?: number;
  details: Record<string, any>;
  blockHeight?: number;
  transactionHash?: string;
}

// Audit Trail Filter
export interface AuditTrailFilter {
  patientAddress?: string;
  userAddress?: string;
  eventType?: AuditEventType;
  startTime?: number;
  endTime?: number;
  limit?: number;
}

// Audit Trail Response
export interface AuditTrailResponse {
  success: boolean;
  events: AuditEvent[];
  total: number;
  error?: string;
}

/**
 * Audit Trail Service for tracking all data access and modifications
 * Provides comprehensive audit logging for compliance and transparency
 */
export class AuditTrailService {
  private suiClient: SuiClient;
  private packageId: string;

  constructor(suiClient: SuiClient, packageId?: string) {
    this.suiClient = suiClient;
    this.packageId = packageId || ENV_VARS.POLICY_PACKAGE_ID;
  }

  /**
   * Get audit trail for a specific patient
   * 
   * @param patientAddress - Patient's wallet address
   * @param filter - Optional filters
   * @returns Audit trail events
   */
  async getAuditTrailForPatient(
    patientAddress: string,
    filter: AuditTrailFilter = {}
  ): Promise<AuditTrailResponse> {
    try {
      console.log(`Getting audit trail for patient: ${patientAddress}`);

      const events: AuditEvent[] = [];
      let total = 0;

      // Query AccessRequestCreatedEvent
      const requestCreatedEvents = await this.queryAuditEvents(
        `${this.packageId}::access_control::AccessRequestCreatedEvent`,
        { ...filter, patientAddress }
      );
      events.push(...this.parseAccessRequestCreatedEvents(requestCreatedEvents));

      // Query AccessRequestApprovedEvent
      const requestApprovedEvents = await this.queryAuditEvents(
        `${this.packageId}::access_control::AccessRequestApprovedEvent`,
        { ...filter, patientAddress }
      );
      events.push(...this.parseAccessRequestApprovedEvents(requestApprovedEvents));

      // Query AccessRequestRejectedEvent
      const requestRejectedEvents = await this.queryAuditEvents(
        `${this.packageId}::access_control::AccessRequestRejectedEvent`,
        { ...filter, patientAddress }
      );
      events.push(...this.parseAccessRequestRejectedEvents(requestRejectedEvents));

      // Query AccessAuditEvent
      const accessAuditEvents = await this.queryAuditEvents(
        `${this.packageId}::access_control::AccessAuditEvent`,
        { ...filter, patientAddress }
      );
      events.push(...this.parseAccessAuditEvents(accessAuditEvents));

      // Sort events by timestamp (newest first)
      events.sort((a, b) => b.timestamp - a.timestamp);

      // Apply additional filters
      const filteredEvents = this.applyFilters(events, filter);

      total = filteredEvents.length;

      return {
        success: true,
        events: filteredEvents,
        total,
      };
    } catch (error) {
      console.error('Error getting audit trail for patient:', error);
      return {
        success: false,
        events: [],
        total: 0,
        error: error instanceof Error ? error.message : 'Unknown error getting audit trail',
      };
    }
  }

  /**
   * Get audit trail for a specific user (doctor/pharmacist)
   * 
   * @param userAddress - User's wallet address
   * @param filter - Optional filters
   * @returns Audit trail events
   */
  async getAuditTrailForUser(
    userAddress: string,
    filter: AuditTrailFilter = {}
  ): Promise<AuditTrailResponse> {
    try {
      console.log(`Getting audit trail for user: ${userAddress}`);

      const events: AuditEvent[] = [];
      let total = 0;

      // Query all audit events where user is the accessor
      const accessAuditEvents = await this.queryAuditEvents(
        `${this.packageId}::access_control::AccessAuditEvent`,
        { ...filter, userAddress }
      );
      events.push(...this.parseAccessAuditEvents(accessAuditEvents));

      // Query access request events where user is the doctor
      const requestCreatedEvents = await this.queryAuditEvents(
        `${this.packageId}::access_control::AccessRequestCreatedEvent`,
        { ...filter, userAddress }
      );
      events.push(...this.parseAccessRequestCreatedEvents(requestCreatedEvents));

      // Sort events by timestamp (newest first)
      events.sort((a, b) => b.timestamp - a.timestamp);

      // Apply additional filters
      const filteredEvents = this.applyFilters(events, filter);

      total = filteredEvents.length;

      return {
        success: true,
        events: filteredEvents,
        total,
      };
    } catch (error) {
      console.error('Error getting audit trail for user:', error);
      return {
        success: false,
        events: [],
        total: 0,
        error: error instanceof Error ? error.message : 'Unknown error getting audit trail',
      };
    }
  }

  /**
   * Get comprehensive audit trail (all events)
   * 
   * @param filter - Optional filters
   * @returns All audit trail events
   */
  async getAllAuditTrail(filter: AuditTrailFilter = {}): Promise<AuditTrailResponse> {
    try {
      console.log('Getting comprehensive audit trail');

      const events: AuditEvent[] = [];
      let total = 0;

      // Query all event types
      const eventTypes = [
        `${this.packageId}::access_control::AccessRequestCreatedEvent`,
        `${this.packageId}::access_control::AccessRequestApprovedEvent`,
        `${this.packageId}::access_control::AccessRequestRejectedEvent`,
        `${this.packageId}::access_control::AccessAuditEvent`,
      ];

      for (const eventType of eventTypes) {
        const eventData = await this.queryAuditEvents(eventType, filter);
        
        switch (eventType) {
          case `${this.packageId}::access_control::AccessRequestCreatedEvent`:
            events.push(...this.parseAccessRequestCreatedEvents(eventData));
            break;
          case `${this.packageId}::access_control::AccessRequestApprovedEvent`:
            events.push(...this.parseAccessRequestApprovedEvents(eventData));
            break;
          case `${this.packageId}::access_control::AccessRequestRejectedEvent`:
            events.push(...this.parseAccessRequestRejectedEvents(eventData));
            break;
          case `${this.packageId}::access_control::AccessAuditEvent`:
            events.push(...this.parseAccessAuditEvents(eventData));
            break;
        }
      }

      // Sort events by timestamp (newest first)
      events.sort((a, b) => b.timestamp - a.timestamp);

      // Apply additional filters
      const filteredEvents = this.applyFilters(events, filter);

      total = filteredEvents.length;

      return {
        success: true,
        events: filteredEvents,
        total,
      };
    } catch (error) {
      console.error('Error getting comprehensive audit trail:', error);
      return {
        success: false,
        events: [],
        total: 0,
        error: error instanceof Error ? error.message : 'Unknown error getting audit trail',
      };
    }
  }

  /**
   * Query audit events from Sui blockchain
   * 
   * @param eventType - Type of event to query
   * @param filter - Filter criteria
   * @returns Raw event data
   */
  private async queryAuditEvents(
    eventType: string,
    filter: AuditTrailFilter
  ): Promise<any[]> {
    try {
      const query: any = {
        MoveEventType: eventType,
      };

      // Add time range filter if provided
      if (filter.startTime || filter.endTime) {
        query.Transaction = {};
        if (filter.startTime) {
          query.Transaction.after = filter.startTime;
        }
        if (filter.endTime) {
          query.Transaction.before = filter.endTime;
        }
      }

      const events = await this.suiClient.queryEvents({
        query,
        limit: filter.limit || 100,
        order: 'descending',
      });

      return events.data || [];
    } catch (error) {
      console.error('Error querying audit events:', error);
      return [];
    }
  }

  /**
   * Parse AccessRequestCreatedEvent data
   * 
   * @param events - Raw event data
   * @returns Parsed audit events
   */
  private parseAccessRequestCreatedEvents(events: any[]): AuditEvent[] {
    return events.map((event, index) => ({
      id: `access_request_created_${event.id?.txDigest}_${index}`,
      eventType: AUDIT_EVENT_TYPES.ACCESS_REQUEST_CREATED,
      timestamp: event.parsedJson?.expiry_time || Date.now(),
      userAddress: event.parsedJson?.doctor_address || '',
      patientAddress: event.parsedJson?.patient_address || '',
      dataObjectId: event.parsedJson?.data_object_id || '',
      transactionType: 0, // Request creation
      requestId: event.parsedJson?.request_id || 0,
      details: {
        expiryTime: event.parsedJson?.expiry_time,
        requestId: event.parsedJson?.request_id,
      },
      blockHeight: event.id?.eventSeq,
      transactionHash: event.id?.txDigest,
    }));
  }

  /**
   * Parse AccessRequestApprovedEvent data
   * 
   * @param events - Raw event data
   * @returns Parsed audit events
   */
  private parseAccessRequestApprovedEvents(events: any[]): AuditEvent[] {
    return events.map((event, index) => ({
      id: `access_request_approved_${event.id?.txDigest}_${index}`,
      eventType: AUDIT_EVENT_TYPES.ACCESS_REQUEST_APPROVED,
      timestamp: event.parsedJson?.approved_at || Date.now(),
      userAddress: event.parsedJson?.doctor_address || '',
      patientAddress: event.parsedJson?.patient_address || '',
      dataObjectId: event.parsedJson?.data_object_id || '',
      transactionType: 1, // Approval
      requestId: event.parsedJson?.request_id || 0,
      details: {
        approvedAt: event.parsedJson?.approved_at,
        requestId: event.parsedJson?.request_id,
      },
      blockHeight: event.id?.eventSeq,
      transactionHash: event.id?.txDigest,
    }));
  }

  /**
   * Parse AccessRequestRejectedEvent data
   * 
   * @param events - Raw event data
   * @returns Parsed audit events
   */
  private parseAccessRequestRejectedEvents(events: any[]): AuditEvent[] {
    return events.map((event, index) => ({
      id: `access_request_rejected_${event.id?.txDigest}_${index}`,
      eventType: AUDIT_EVENT_TYPES.ACCESS_REQUEST_REJECTED,
      timestamp: event.parsedJson?.rejected_at || Date.now(),
      userAddress: event.parsedJson?.doctor_address || '',
      patientAddress: event.parsedJson?.patient_address || '',
      dataObjectId: event.parsedJson?.data_object_id || '',
      transactionType: 2, // Rejection
      requestId: event.parsedJson?.request_id || 0,
      details: {
        rejectedAt: event.parsedJson?.rejected_at,
        requestId: event.parsedJson?.request_id,
      },
      blockHeight: event.id?.eventSeq,
      transactionHash: event.id?.txDigest,
    }));
  }

  /**
   * Parse AccessAuditEvent data
   * 
   * @param events - Raw event data
   * @returns Parsed audit events
   */
  private parseAccessAuditEvents(events: any[]): AuditEvent[] {
    return events.map((event, index) => ({
      id: `access_audit_${event.id?.txDigest}_${index}`,
      eventType: AUDIT_EVENT_TYPES.DATA_ACCESS_RECORDED,
      timestamp: event.parsedJson?.timestamp || Date.now(),
      userAddress: event.parsedJson?.accessor_address || '',
      patientAddress: event.parsedJson?.patient_address || '',
      dataObjectId: event.parsedJson?.data_object_id || '',
      transactionType: event.parsedJson?.transaction_type || 0,
      requestId: event.parsedJson?.request_id || 0,
      details: {
        requestId: event.parsedJson?.request_id,
        transactionType: event.parsedJson?.transaction_type,
      },
      blockHeight: event.id?.eventSeq,
      transactionHash: event.id?.txDigest,
    }));
  }

  /**
   * Apply additional filters to events
   * 
   * @param events - Events to filter
   * @param filter - Filter criteria
   * @returns Filtered events
   */
  private applyFilters(events: AuditEvent[], filter: AuditTrailFilter): AuditEvent[] {
    let filteredEvents = events;

    // Filter by user address
    if (filter.userAddress) {
      filteredEvents = filteredEvents.filter(event => 
        event.userAddress === filter.userAddress
      );
    }

    // Filter by patient address
    if (filter.patientAddress) {
      filteredEvents = filteredEvents.filter(event => 
        event.patientAddress === filter.patientAddress
      );
    }

    // Filter by event type
    if (filter.eventType) {
      filteredEvents = filteredEvents.filter(event => 
        event.eventType === filter.eventType
      );
    }

    // Filter by time range
    if (filter.startTime) {
      filteredEvents = filteredEvents.filter(event => 
        event.timestamp >= filter.startTime!
      );
    }

    if (filter.endTime) {
      filteredEvents = filteredEvents.filter(event => 
        event.timestamp <= filter.endTime!
      );
    }

    // Apply limit
    if (filter.limit) {
      filteredEvents = filteredEvents.slice(0, filter.limit);
    }

    return filteredEvents;
  }

  /**
   * Get audit statistics for a patient
   * 
   * @param patientAddress - Patient's wallet address
   * @returns Audit statistics
   */
  async getAuditStatistics(patientAddress: string): Promise<{
    totalAccessRequests: number;
    approvedRequests: number;
    rejectedRequests: number;
    totalDataAccess: number;
    uniqueAccessors: number;
    lastAccessTime: number;
  }> {
    try {
      const auditTrail = await this.getAuditTrailForPatient(patientAddress);
      
      const events = auditTrail.events;
      const accessRequests = events.filter(e => 
        e.eventType === AUDIT_EVENT_TYPES.ACCESS_REQUEST_CREATED
      );
      const approvedRequests = events.filter(e => 
        e.eventType === AUDIT_EVENT_TYPES.ACCESS_REQUEST_APPROVED
      );
      const rejectedRequests = events.filter(e => 
        e.eventType === AUDIT_EVENT_TYPES.ACCESS_REQUEST_REJECTED
      );
      const dataAccess = events.filter(e => 
        e.eventType === AUDIT_EVENT_TYPES.DATA_ACCESS_RECORDED
      );

      const uniqueAccessors = new Set(
        events.map(e => e.userAddress).filter(addr => addr !== patientAddress)
      ).size;

      const lastAccessTime = events.length > 0 ? events[0].timestamp : 0;

      return {
        totalAccessRequests: accessRequests.length,
        approvedRequests: approvedRequests.length,
        rejectedRequests: rejectedRequests.length,
        totalDataAccess: dataAccess.length,
        uniqueAccessors,
        lastAccessTime,
      };
    } catch (error) {
      console.error('Error getting audit statistics:', error);
      return {
        totalAccessRequests: 0,
        approvedRequests: 0,
        rejectedRequests: 0,
        totalDataAccess: 0,
        uniqueAccessors: 0,
        lastAccessTime: 0,
      };
    }
  }
}
