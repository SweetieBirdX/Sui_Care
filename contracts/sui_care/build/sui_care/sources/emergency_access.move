module sui_care::health_access_policy {
    use std::string::String;
    use std::vector;
    use sui::object::{Self, UID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::event;

    // ===== CONSTANTS =====
    
    // Role constants
    const ROLE_DOCTOR: u8 = 1;
    const ROLE_PHARMACIST: u8 = 2;
    const ROLE_PATIENT: u8 = 3;
    
    // Data type constants
    const DATA_TYPE_PRESCRIPTION: u8 = 1;
    const DATA_TYPE_LAB_RESULT: u8 = 2;
    const DATA_TYPE_GENERAL_RECORD: u8 = 3;
    const DATA_TYPE_MEDICAL_RECORD: u8 = 4;
    const DATA_TYPE_DIAGNOSIS: u8 = 5;
    const DATA_TYPE_TREATMENT_PLAN: u8 = 6;
    const DATA_TYPE_VITAL_SIGNS: u8 = 7;
    const DATA_TYPE_IMAGING_RESULT: u8 = 8;
    const DATA_TYPE_MEDICATION_HISTORY: u8 = 9;
    
    // Permission constants
    const PERMISSION_READ: u8 = 1;
    const PERMISSION_WRITE: u8 = 2;
    const PERMISSION_DELETE: u8 = 4;
    const PERMISSION_SHARE: u8 = 8;
    
    // Error codes
    const E_INVALID_ROLE: u64 = 1;
    const E_INVALID_DATA_TYPE: u64 = 2;
    const E_INSUFFICIENT_PERMISSIONS: u64 = 3;
    const E_SELF_AUTHORIZATION_FORBIDDEN: u64 = 4;
    const E_SELF_MODIFICATION_FORBIDDEN: u64 = 5;
    const E_INVALID_POLICY: u64 = 6;
    const E_UNAUTHORIZED_ACCESS: u64 = 7;

    // ===== STRUCTS =====
    
    /// Represents a user role in the healthcare system
    struct UserRole has copy, drop, store {
        role_type: u8,
        user_address: String,
        verified: bool,
        created_at: u64,
    }
    
    /// Represents a health data type
    struct HealthDataType has copy, drop, store {
        data_type: u8,
        name: String,
        description: String,
    }
    
    /// Represents a permission for a specific role and data type
    struct Permission has copy, drop, store {
        role_type: u8,
        data_type: u8,
        permissions: u8, // Bitmask of allowed operations
    }
    
    /// Main access policy object that contains all role-based access rules
    struct HealthAccessPolicy has key {
        id: UID,
        version: u64,
        permissions: vector<Permission>,
        created_at: u64,
        updated_at: u64,
        admin: address, // Address of the policy administrator
    }
    
    /// Event emitted when permissions are checked
    struct PermissionChecked has copy, drop {
        user_address: address,
        role_type: u8,
        data_type: u8,
        operation: u8,
        granted: bool,
        timestamp: u64,
    }
    
    /// Event emitted when access is denied
    struct AccessDenied has copy, drop {
        user_address: address,
        role_type: u8,
        data_type: u8,
        operation: u8,
        reason: u64,
        timestamp: u64,
    }

    // ===== INITIALIZATION =====
    
    /// Initialize the health access policy module
    fun init(ctx: &mut TxContext) {
        let permissions = vector::empty<Permission>();
        
        // Add default permissions for each role
        add_default_permissions(&mut permissions);
        
        let policy = HealthAccessPolicy {
            id: object::new(ctx),
            version: 1,
            permissions,
            created_at: tx_context::epoch_timestamp_ms(ctx),
            updated_at: tx_context::epoch_timestamp_ms(ctx),
            admin: tx_context::sender(ctx),
        };
        
        // Transfer the policy to the sender (admin)
        transfer::transfer(policy, tx_context::sender(ctx));
    }
    
    /// Add default permissions for all roles and data types
    fun add_default_permissions(permissions: &mut vector<Permission>) {
        // Doctor permissions - Full access to all data types
        vector::push_back(permissions, Permission {
            role_type: ROLE_DOCTOR,
            data_type: DATA_TYPE_PRESCRIPTION,
            permissions: PERMISSION_READ | PERMISSION_WRITE | PERMISSION_DELETE | PERMISSION_SHARE,
        });
        
        vector::push_back(permissions, Permission {
            role_type: ROLE_DOCTOR,
            data_type: DATA_TYPE_LAB_RESULT,
            permissions: PERMISSION_READ | PERMISSION_WRITE | PERMISSION_DELETE | PERMISSION_SHARE,
        });
        
        vector::push_back(permissions, Permission {
            role_type: ROLE_DOCTOR,
            data_type: DATA_TYPE_GENERAL_RECORD,
            permissions: PERMISSION_READ | PERMISSION_WRITE | PERMISSION_DELETE | PERMISSION_SHARE,
        });
        
        vector::push_back(permissions, Permission {
            role_type: ROLE_DOCTOR,
            data_type: DATA_TYPE_MEDICAL_RECORD,
            permissions: PERMISSION_READ | PERMISSION_WRITE | PERMISSION_DELETE | PERMISSION_SHARE,
        });
        
        vector::push_back(permissions, Permission {
            role_type: ROLE_DOCTOR,
            data_type: DATA_TYPE_DIAGNOSIS,
            permissions: PERMISSION_READ | PERMISSION_WRITE | PERMISSION_DELETE | PERMISSION_SHARE,
        });
        
        vector::push_back(permissions, Permission {
            role_type: ROLE_DOCTOR,
            data_type: DATA_TYPE_TREATMENT_PLAN,
            permissions: PERMISSION_READ | PERMISSION_WRITE | PERMISSION_DELETE | PERMISSION_SHARE,
        });
        
        vector::push_back(permissions, Permission {
            role_type: ROLE_DOCTOR,
            data_type: DATA_TYPE_VITAL_SIGNS,
            permissions: PERMISSION_READ | PERMISSION_WRITE | PERMISSION_DELETE | PERMISSION_SHARE,
        });
        
        vector::push_back(permissions, Permission {
            role_type: ROLE_DOCTOR,
            data_type: DATA_TYPE_IMAGING_RESULT,
            permissions: PERMISSION_READ | PERMISSION_WRITE | PERMISSION_DELETE | PERMISSION_SHARE,
        });
        
        vector::push_back(permissions, Permission {
            role_type: ROLE_DOCTOR,
            data_type: DATA_TYPE_MEDICATION_HISTORY,
            permissions: PERMISSION_READ | PERMISSION_WRITE | PERMISSION_DELETE | PERMISSION_SHARE,
        });
        
        // Pharmacist permissions - Only READ access to prescriptions
        vector::push_back(permissions, Permission {
            role_type: ROLE_PHARMACIST,
            data_type: DATA_TYPE_PRESCRIPTION,
            permissions: PERMISSION_READ,
        });
        
        // Patient permissions - READ access to their own data only
        vector::push_back(permissions, Permission {
            role_type: ROLE_PATIENT,
            data_type: DATA_TYPE_PRESCRIPTION,
            permissions: PERMISSION_READ,
        });
        
        vector::push_back(permissions, Permission {
            role_type: ROLE_PATIENT,
            data_type: DATA_TYPE_LAB_RESULT,
            permissions: PERMISSION_READ,
        });
        
        vector::push_back(permissions, Permission {
            role_type: ROLE_PATIENT,
            data_type: DATA_TYPE_GENERAL_RECORD,
            permissions: PERMISSION_READ,
        });
        
        vector::push_back(permissions, Permission {
            role_type: ROLE_PATIENT,
            data_type: DATA_TYPE_MEDICAL_RECORD,
            permissions: PERMISSION_READ,
        });
        
        vector::push_back(permissions, Permission {
            role_type: ROLE_PATIENT,
            data_type: DATA_TYPE_DIAGNOSIS,
            permissions: PERMISSION_READ,
        });
        
        vector::push_back(permissions, Permission {
            role_type: ROLE_PATIENT,
            data_type: DATA_TYPE_TREATMENT_PLAN,
            permissions: PERMISSION_READ,
        });
        
        vector::push_back(permissions, Permission {
            role_type: ROLE_PATIENT,
            data_type: DATA_TYPE_VITAL_SIGNS,
            permissions: PERMISSION_READ,
        });
        
        vector::push_back(permissions, Permission {
            role_type: ROLE_PATIENT,
            data_type: DATA_TYPE_IMAGING_RESULT,
            permissions: PERMISSION_READ,
        });
        
        vector::push_back(permissions, Permission {
            role_type: ROLE_PATIENT,
            data_type: DATA_TYPE_MEDICATION_HISTORY,
            permissions: PERMISSION_READ,
        });
    }

    // ===== PERMISSION CHECKING FUNCTIONS =====
    
    /// Check if a user has permission to perform an operation on a data type
    public fun check_permission(
        policy: &HealthAccessPolicy,
        user_address: address,
        role_type: u8,
        data_type: u8,
        operation: u8,
        ctx: &TxContext
    ): bool {
        // Validate inputs
        assert!(is_valid_role(role_type), E_INVALID_ROLE);
        assert!(is_valid_data_type(data_type), E_INVALID_DATA_TYPE);
        
        // Find permission for the given role and data type
        let i = 0;
        let len = vector::length(&policy.permissions);
        while (i < len) {
            let permission = vector::borrow(&policy.permissions, i);
            if (permission.role_type == role_type && permission.data_type == data_type) {
                let has_permission = (permission.permissions & operation) == operation;
                
                // Emit permission check event
                event::emit(PermissionChecked {
                    user_address,
                    role_type,
                    data_type,
                    operation,
                    granted: has_permission,
                    timestamp: tx_context::epoch_timestamp_ms(ctx),
                });
                
                if (!has_permission) {
                    event::emit(AccessDenied {
                        user_address,
                        role_type,
                        data_type,
                        operation,
                        reason: E_INSUFFICIENT_PERMISSIONS,
                        timestamp: tx_context::epoch_timestamp_ms(ctx),
                    });
                };
                
                return has_permission
            };
            i = i + 1;
        };
        
        // No permission found - access denied
        event::emit(AccessDenied {
            user_address,
            role_type,
            data_type,
            operation,
            reason: E_INSUFFICIENT_PERMISSIONS,
            timestamp: tx_context::epoch_timestamp_ms(ctx),
        });
        
        false
    }
    
    /// Check if a user can modify data (with self-modification restrictions)
    public fun can_modify_data(
        policy: &HealthAccessPolicy,
        user_address: address,
        data_owner_address: address,
        role_type: u8,
        data_type: u8,
        ctx: &TxContext
    ): bool {
        // Check if user is trying to modify their own data
        if (user_address == data_owner_address) {
            // Self-modification is forbidden for patients
            if (role_type == ROLE_PATIENT) {
                event::emit(AccessDenied {
                    user_address,
                    role_type,
                    data_type,
                    operation: PERMISSION_WRITE,
                    reason: E_SELF_MODIFICATION_FORBIDDEN,
                    timestamp: tx_context::epoch_timestamp_ms(ctx),
                });
                return false
            };
            
            // Even doctors cannot modify their own data
            if (role_type == ROLE_DOCTOR) {
                event::emit(AccessDenied {
                    user_address,
                    role_type,
                    data_type,
                    operation: PERMISSION_WRITE,
                    reason: E_SELF_MODIFICATION_FORBIDDEN,
                    timestamp: tx_context::epoch_timestamp_ms(ctx),
                });
                return false
            };
        };
        
        // Check if user has write permission for this data type
        check_permission(policy, user_address, role_type, data_type, PERMISSION_WRITE, ctx)
    }
    
    /// Check if a user can authorize access for another user
    public fun can_authorize_access(
        policy: &HealthAccessPolicy,
        authorizer_address: address,
        target_user_address: address,
        role_type: u8,
        ctx: &TxContext
    ): bool {
        // Self-authorization is forbidden
        if (authorizer_address == target_user_address) {
            event::emit(AccessDenied {
                user_address: authorizer_address,
                role_type,
                data_type: 0, // Not applicable
                operation: PERMISSION_SHARE,
                reason: E_SELF_AUTHORIZATION_FORBIDDEN,
                timestamp: tx_context::epoch_timestamp_ms(ctx),
            });
            return false
        };
        
        // Only doctors and healthcare institutions can authorize access
        if (role_type != ROLE_DOCTOR) {
            event::emit(AccessDenied {
                user_address: authorizer_address,
                role_type,
                data_type: 0, // Not applicable
                operation: PERMISSION_SHARE,
                reason: E_UNAUTHORIZED_ACCESS,
                timestamp: tx_context::epoch_timestamp_ms(ctx),
            });
            return false
        };
        
        true
    }

    // ===== VALIDATION FUNCTIONS =====
    
    /// Validate if a role type is valid
    public fun is_valid_role(role_type: u8): bool {
        role_type == ROLE_DOCTOR || role_type == ROLE_PHARMACIST || role_type == ROLE_PATIENT
    }
    
    /// Validate if a data type is valid
    public fun is_valid_data_type(data_type: u8): bool {
        data_type >= DATA_TYPE_PRESCRIPTION && data_type <= DATA_TYPE_MEDICATION_HISTORY
    }
    
    /// Validate if an operation is valid
    public fun is_valid_operation(operation: u8): bool {
        operation == PERMISSION_READ || 
        operation == PERMISSION_WRITE || 
        operation == PERMISSION_DELETE || 
        operation == PERMISSION_SHARE ||
        operation == (PERMISSION_READ | PERMISSION_WRITE) ||
        operation == (PERMISSION_READ | PERMISSION_WRITE | PERMISSION_DELETE) ||
        operation == (PERMISSION_READ | PERMISSION_WRITE | PERMISSION_DELETE | PERMISSION_SHARE)
    }

    // ===== GETTER FUNCTIONS =====
    
    /// Get the current policy version
    public fun get_policy_version(policy: &HealthAccessPolicy): u64 {
        policy.version
    }
    
    /// Get the policy administrator
    public fun get_policy_admin(policy: &HealthAccessPolicy): address {
        policy.admin
    }
    
    /// Get the number of permissions in the policy
    public fun get_permissions_count(policy: &HealthAccessPolicy): u64 {
        vector::length(&policy.permissions)
    }
    
    /// Get a specific permission by role and data type
    public fun get_permission(
        policy: &HealthAccessPolicy,
        role_type: u8,
        data_type: u8
    ): (bool, u8) {
        let i = 0;
        let len = vector::length(&policy.permissions);
        while (i < len) {
            let permission = vector::borrow(&policy.permissions, i);
            if (permission.role_type == role_type && permission.data_type == data_type) {
                return (true, permission.permissions)
            };
            i = i + 1;
        };
        (false, 0)
    }

    // ===== ROLE CONSTANTS GETTERS =====
    
    public fun get_role_doctor(): u8 { ROLE_DOCTOR }
    public fun get_role_pharmacist(): u8 { ROLE_PHARMACIST }
    public fun get_role_patient(): u8 { ROLE_PATIENT }
    
    public fun get_data_type_prescription(): u8 { DATA_TYPE_PRESCRIPTION }
    public fun get_data_type_lab_result(): u8 { DATA_TYPE_LAB_RESULT }
    public fun get_data_type_general_record(): u8 { DATA_TYPE_GENERAL_RECORD }
    public fun get_data_type_medical_record(): u8 { DATA_TYPE_MEDICAL_RECORD }
    public fun get_data_type_diagnosis(): u8 { DATA_TYPE_DIAGNOSIS }
    public fun get_data_type_treatment_plan(): u8 { DATA_TYPE_TREATMENT_PLAN }
    public fun get_data_type_vital_signs(): u8 { DATA_TYPE_VITAL_SIGNS }
    public fun get_data_type_imaging_result(): u8 { DATA_TYPE_IMAGING_RESULT }
    public fun get_data_type_medication_history(): u8 { DATA_TYPE_MEDICATION_HISTORY }
    
    public fun get_permission_read(): u8 { PERMISSION_READ }
    public fun get_permission_write(): u8 { PERMISSION_WRITE }
    public fun get_permission_delete(): u8 { PERMISSION_DELETE }
    public fun get_permission_share(): u8 { PERMISSION_SHARE }
}

// ============================================================================
// ACCESS REQUEST AND APPROVAL MODULE
// ============================================================================

module sui_care::access_control {
    use sui::object::{Self, UID, ID};
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;
    use sui::event;
    use sui::clock::{Self, Clock};
    use std::option::{Self, Option};
    use sui_care::health_access_policy::{Self, HealthAccessPolicy};

    // --- Constants ---
    const EAccessRequestNotFound: u64 = 10;
    const EAccessRequestExpired: u64 = 11;
    const EAccessRequestAlreadyApproved: u64 = 12;
    const EAccessRequestNotApproved: u64 = 13;
    const EInvalidRequestor: u64 = 14;
    const EInvalidApprover: u64 = 15;
    const ERequestExpired: u64 = 16;
    const EInsufficientPermission: u64 = 17;

    // --- Access Request Status ---
    const STATUS_PENDING: u8 = 1;
    const STATUS_APPROVED: u8 = 2;
    const STATUS_REJECTED: u8 = 3;
    const STATUS_EXPIRED: u8 = 4;

    // --- Structs ---
    struct AccessRequest has key, store {
        id: UID,
        request_id: u64,
        doctor_address: address,
        patient_address: address,
        data_object_id: ID, // Walrus blob ID or Sui object ID
        expiry_time: u64, // Epoch timestamp
        status: u8, // PENDING, APPROVED, REJECTED, EXPIRED
        created_at: u64,
        approved_at: Option<u64>,
        policy_id: ID, // Reference to HealthAccessPolicy
    }

    struct AccessControlManager has key {
        id: UID,
        next_request_id: u64,
        policy: ID, // Reference to HealthAccessPolicy
    }

    // --- Events ---
    struct AccessRequestCreatedEvent has copy, drop {
        request_id: u64,
        doctor_address: address,
        patient_address: address,
        data_object_id: ID,
        expiry_time: u64,
    }

    struct AccessRequestApprovedEvent has copy, drop {
        request_id: u64,
        doctor_address: address,
        patient_address: address,
        data_object_id: ID,
        approved_at: u64,
    }

    struct AccessRequestRejectedEvent has copy, drop {
        request_id: u64,
        doctor_address: address,
        patient_address: address,
        data_object_id: ID,
        rejected_at: u64,
    }

    struct AccessAuditEvent has copy, drop {
        accessor_address: address,
        patient_address: address,
        data_object_id: ID,
        transaction_type: u8, // READ, WRITE, DELETE
        timestamp: u64,
        request_id: u64,
    }

    // --- Initialization ---
    fun init(ctx: &mut TxContext) {
        let access_control = AccessControlManager {
            id: object::new(ctx),
            next_request_id: 1,
            policy: object::id_from_address(@sui_care), // Will be set after policy creation
        };

        transfer::share_object(access_control);
    }

    // --- Public Functions ---

    /// Set the policy reference (called after HealthAccessPolicy is created)
    public entry fun set_policy_reference(
        access_control: &mut AccessControlManager,
        policy_id: ID,
        ctx: &mut TxContext
    ) {
        access_control.policy = policy_id;
    }

    /// Request access to patient data
    public entry fun request_access(
        access_control: &mut AccessControlManager,
        policy: &HealthAccessPolicy,
        doctor_address: address,
        patient_address: address,
        data_object_id: ID,
        lifetime_epochs: u64,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        // Verify doctor has permission to request access
        let has_permission = health_access_policy::check_permission(
            policy,
            doctor_address,
            health_access_policy::get_role_doctor(),
            health_access_policy::get_data_type_general_record(), // Generic data type for access requests
            health_access_policy::get_permission_read(),
            ctx
        );
        assert!(has_permission, EInsufficientPermission);

        // Prevent self-authorization
        assert!(doctor_address != patient_address, EInvalidRequestor);

        let request_id = access_control.next_request_id;
        access_control.next_request_id = access_control.next_request_id + 1;

        let current_time = clock::timestamp_ms(clock);
        let expiry_time = current_time + (lifetime_epochs * 24 * 60 * 60 * 1000); // Convert epochs to milliseconds

        let access_request = AccessRequest {
            id: object::new(ctx),
            request_id,
            doctor_address,
            patient_address,
            data_object_id,
            expiry_time,
            status: STATUS_PENDING,
            created_at: current_time,
            approved_at: option::none(),
            policy_id: object::id(policy),
        };

        // Emit event
        event::emit(AccessRequestCreatedEvent {
            request_id,
            doctor_address,
            patient_address,
            data_object_id,
            expiry_time,
        });

        // Store the request (in production, this would be stored on-chain)
        // For now, we'll transfer it to the patient for them to approve
        transfer::public_transfer(access_request, patient_address);
    }

    /// Patient approves access request
    public entry fun grant_access(
        access_request: &mut AccessRequest,
        policy: &HealthAccessPolicy,
        clock: &Clock,
        ctx: &mut TxContext,
    ) {
        let patient_address = tx_context::sender(ctx);
        
        // Verify the patient is the correct approver
        assert!(patient_address == access_request.patient_address, EInvalidApprover);
        
        // Check if request is still valid
        let current_time = clock::timestamp_ms(clock);
        assert!(current_time <= access_request.expiry_time, ERequestExpired);
        
        // Check if already processed
        assert!(access_request.status == STATUS_PENDING, EAccessRequestAlreadyApproved);

        // Update request status
        access_request.status = STATUS_APPROVED;
        access_request.approved_at = option::some(current_time);

        // Emit approval event
        event::emit(AccessRequestApprovedEvent {
            request_id: access_request.request_id,
            doctor_address: access_request.doctor_address,
            patient_address: access_request.patient_address,
            data_object_id: access_request.data_object_id,
            approved_at: current_time,
        });

        // Emit audit event for access granted
        event::emit(AccessAuditEvent {
            accessor_address: access_request.doctor_address,
            patient_address: access_request.patient_address,
            data_object_id: access_request.data_object_id,
            transaction_type: health_access_policy::get_permission_read(),
            timestamp: current_time,
            request_id: access_request.request_id,
        });
    }

    /// Patient rejects access request
    public entry fun reject_access(
        access_request: &mut AccessRequest,
        clock: &Clock,
        ctx: &mut TxContext,
    ) {
        let patient_address = tx_context::sender(ctx);
        
        // Verify the patient is the correct approver
        assert!(patient_address == access_request.patient_address, EInvalidApprover);
        
        // Check if request is still valid
        let current_time = clock::timestamp_ms(clock);
        assert!(current_time <= access_request.expiry_time, ERequestExpired);
        
        // Check if already processed
        assert!(access_request.status == STATUS_PENDING, EAccessRequestAlreadyApproved);

        // Update request status
        access_request.status = STATUS_REJECTED;

        // Emit rejection event
        event::emit(AccessRequestRejectedEvent {
            request_id: access_request.request_id,
            doctor_address: access_request.doctor_address,
            patient_address: access_request.patient_address,
            data_object_id: access_request.data_object_id,
            rejected_at: current_time,
        });
    }

    /// Check if access is approved for a specific request
    public fun is_access_approved(access_request: &AccessRequest): bool {
        access_request.status == STATUS_APPROVED
    }

    /// Get access request details
    public fun get_access_request_details(access_request: &AccessRequest): (u64, address, address, ID, u8, u64) {
        (
            access_request.request_id,
            access_request.doctor_address,
            access_request.patient_address,
            access_request.data_object_id,
            access_request.status,
            access_request.created_at
        )
    }

    /// Record data access audit (called when data is actually accessed)
    public entry fun record_data_access(
        access_request: &AccessRequest,
        transaction_type: u8,
        clock: &Clock,
    ) {
        // Verify access is approved
        assert!(access_request.status == STATUS_APPROVED, EAccessRequestNotApproved);
        
        let current_time = clock::timestamp_ms(clock);
        
        // Emit audit event for actual data access
        event::emit(AccessAuditEvent {
            accessor_address: access_request.doctor_address,
            patient_address: access_request.patient_address,
            data_object_id: access_request.data_object_id,
            transaction_type,
            timestamp: current_time,
            request_id: access_request.request_id,
        });
    }

    // --- Getters ---
    public fun get_next_request_id(access_control: &AccessControlManager): u64 {
        access_control.next_request_id
    }

    public fun get_policy_id(access_control: &AccessControlManager): ID {
        access_control.policy
    }
}

// ============================================================================
// EMERGENCY ACCESS MANAGEMENT MODULE
// ============================================================================

module sui_care::emergency_access {
    use sui::object::{Self, UID, ID};
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;
    use sui::event;
    use sui::clock::{Self, Clock};
    use sui::table::{Self, Table};
    use sui::vec_set::{Self, VecSet};
    use std::vector;
    use sui_care::health_access_policy::HealthAccessPolicy;

    // --- Constants ---
    const ENotAuthorizedEmergencyDoctor: u64 = 20;
    const EEmergencyAccessAlreadyActive: u64 = 21;
    const EEmergencyAccessNotActive: u64 = 22;
    const EInvalidEmergencyDoctor: u64 = 23;
    const EPatientNotAuthorized: u64 = 24;
    const EEmergencyAccessExpired: u64 = 25;

    // --- Emergency Access Status ---
    const EMERGENCY_STATUS_ACTIVE: u8 = 1;
    const EMERGENCY_STATUS_REVOKED: u8 = 2;
    const EMERGENCY_STATUS_EXPIRED: u8 = 3;

    // --- Structs ---
    struct EmergencyAccessManager has key {
        id: UID,
        authorized_doctors: VecSet<address>,
        emergency_locks: Table<address, EmergencyLock>,
        max_emergency_duration: u64, // Maximum duration in milliseconds
    }

    struct EmergencyLock has store, drop {
        patient_address: address,
        doctor_address: address,
        start_time: u64,
        expiry_time: u64,
        status: u8,
        access_count: u64,
        last_access_time: u64,
    }

    // --- Events ---
    struct EmergencyAccessInitiated has copy, drop {
        patient_address: address,
        doctor_address: address,
        start_time: u64,
        expiry_time: u64,
        emergency_signature: vector<u8>, // Emergency authorization signature
    }

    struct EmergencyAccessRevoked has copy, drop {
        patient_address: address,
        doctor_address: address,
        revoke_time: u64,
        total_access_count: u64,
    }

    struct EmergencyDataAccess has copy, drop {
        patient_address: address,
        doctor_address: address,
        access_time: u64,
        access_type: u8, // READ, WRITE, MODIFY
        data_object_id: ID,
    }

    struct EmergencyAuditLog has copy, drop {
        patient_address: address,
        doctor_address: address,
        action_type: u8, // INITIATE, ACCESS, REVOKE
        timestamp: u64,
        emergency_signature: vector<u8>,
        access_count: u64,
    }

    // --- Initialization ---
    fun init(ctx: &mut TxContext) {
        let emergency_manager = EmergencyAccessManager {
            id: object::new(ctx),
            authorized_doctors: vec_set::empty(),
            emergency_locks: table::new(ctx),
            max_emergency_duration: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
        };

        transfer::share_object(emergency_manager);
    }

    // --- Public Functions ---

    /// Authorize an emergency doctor (only by admin)
    public entry fun authorize_emergency_doctor(
        emergency_manager: &mut EmergencyAccessManager,
        doctor_address: address,
        ctx: &mut TxContext
    ) {
        // In production, this should check if caller is admin
        // For now, we'll allow any caller to authorize doctors
        vec_set::insert(&mut emergency_manager.authorized_doctors, doctor_address);
    }

    /// Initiate emergency access for a patient
    public entry fun initiate_emergency_access(
        emergency_manager: &mut EmergencyAccessManager,
        policy: &HealthAccessPolicy,
        patient_address: address,
        emergency_duration_hours: u64,
        emergency_signature: vector<u8>,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let doctor_address = tx_context::sender(ctx);
        
        // Verify doctor is authorized for emergency access
        assert!(vec_set::contains(&emergency_manager.authorized_doctors, &doctor_address), ENotAuthorizedEmergencyDoctor);
        
        // Check if emergency access is already active for this patient
        assert!(!table::contains(&emergency_manager.emergency_locks, patient_address), EEmergencyAccessAlreadyActive);
        
        let current_time = clock::timestamp_ms(clock);
        let emergency_duration_ms = emergency_duration_hours * 60 * 60 * 1000;
        let expiry_time = current_time + emergency_duration_ms;
        
        // Ensure duration doesn't exceed maximum
        let duration = expiry_time - current_time;
        if (duration > emergency_manager.max_emergency_duration) {
            expiry_time = current_time + emergency_manager.max_emergency_duration;
        };

        let emergency_lock = EmergencyLock {
            patient_address,
            doctor_address,
            start_time: current_time,
            expiry_time,
            status: EMERGENCY_STATUS_ACTIVE,
            access_count: 0,
            last_access_time: current_time,
        };

        table::add(&mut emergency_manager.emergency_locks, patient_address, emergency_lock);

        // Emit events
        event::emit(EmergencyAccessInitiated {
            patient_address,
            doctor_address,
            start_time: current_time,
            expiry_time,
            emergency_signature,
        });

        event::emit(EmergencyAuditLog {
            patient_address,
            doctor_address,
            action_type: 1, // INITIATE
            timestamp: current_time,
            emergency_signature,
            access_count: 0,
        });
    }

    /// Check if emergency access is active for a patient
    public fun is_emergency_access_active(
        emergency_manager: &EmergencyAccessManager,
        patient_address: address,
        clock: &Clock
    ): bool {
        if (!table::contains(&emergency_manager.emergency_locks, patient_address)) {
            return false
        };

        let emergency_lock = table::borrow(&emergency_manager.emergency_locks, patient_address);
        let current_time = clock::timestamp_ms(clock);
        
        emergency_lock.status == EMERGENCY_STATUS_ACTIVE && current_time <= emergency_lock.expiry_time
    }

    /// Get emergency access details
    public fun get_emergency_access_details(
        emergency_manager: &EmergencyAccessManager,
        patient_address: address
    ): (address, u64, u64, u8, u64) {
        assert!(table::contains(&emergency_manager.emergency_locks, patient_address), EEmergencyAccessNotActive);
        
        let emergency_lock = table::borrow(&emergency_manager.emergency_locks, patient_address);
        (
            emergency_lock.doctor_address,
            emergency_lock.start_time,
            emergency_lock.expiry_time,
            emergency_lock.status,
            emergency_lock.access_count
        )
    }

    /// Record emergency data access
    public entry fun record_emergency_data_access(
        emergency_manager: &mut EmergencyAccessManager,
        patient_address: address,
        data_object_id: ID,
        access_type: u8,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let doctor_address = tx_context::sender(ctx);
        
        // Verify emergency access is active
        assert!(is_emergency_access_active(emergency_manager, patient_address, clock), EEmergencyAccessNotActive);
        
        let current_time = clock::timestamp_ms(clock);
        
        // Update access count and last access time
        let emergency_lock = table::borrow_mut(&mut emergency_manager.emergency_locks, patient_address);
        emergency_lock.access_count = emergency_lock.access_count + 1;
        emergency_lock.last_access_time = current_time;

        // Emit access event
        event::emit(EmergencyDataAccess {
            patient_address,
            doctor_address,
            access_time: current_time,
            access_type,
            data_object_id,
        });

        event::emit(EmergencyAuditLog {
            patient_address,
            doctor_address,
            action_type: 2, // ACCESS
            timestamp: current_time,
            emergency_signature: vector::empty(), // No signature for data access
            access_count: emergency_lock.access_count,
        });
    }

    /// Revoke emergency access (can be called by patient or doctor)
    public entry fun revoke_emergency_access(
        emergency_manager: &mut EmergencyAccessManager,
        patient_address: address,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        let caller_address = tx_context::sender(ctx);
        
        // Verify emergency access exists
        assert!(table::contains(&emergency_manager.emergency_locks, patient_address), EEmergencyAccessNotActive);
        
        let emergency_lock = table::borrow(&emergency_manager.emergency_locks, patient_address);
        
        // Verify caller is either the patient or the emergency doctor
        assert!(
            caller_address == patient_address || caller_address == emergency_lock.doctor_address,
            EPatientNotAuthorized
        );

        let current_time = clock::timestamp_ms(clock);
        let total_access_count = emergency_lock.access_count;

        // Remove the emergency lock
        let emergency_lock = table::remove(&mut emergency_manager.emergency_locks, patient_address);
        emergency_lock.status = EMERGENCY_STATUS_REVOKED;

        // Emit revocation event
        event::emit(EmergencyAccessRevoked {
            patient_address,
            doctor_address: emergency_lock.doctor_address,
            revoke_time: current_time,
            total_access_count,
        });

        event::emit(EmergencyAuditLog {
            patient_address,
            doctor_address: emergency_lock.doctor_address,
            action_type: 3, // REVOKE
            timestamp: current_time,
            emergency_signature: vector::empty(),
            access_count: total_access_count,
        });
    }

    /// Check if a doctor has emergency access to a patient's data
    public fun has_emergency_access(
        emergency_manager: &EmergencyAccessManager,
        patient_address: address,
        doctor_address: address,
        clock: &Clock
    ): bool {
        if (!is_emergency_access_active(emergency_manager, patient_address, clock)) {
            return false
        };

        let emergency_lock = table::borrow(&emergency_manager.emergency_locks, patient_address);
        emergency_lock.doctor_address == doctor_address
    }

    /// Get all authorized emergency doctors
    public fun get_authorized_doctors(emergency_manager: &EmergencyAccessManager): &vector<address> {
        vec_set::keys(&emergency_manager.authorized_doctors)
    }

    /// Update maximum emergency duration (admin only)
    public entry fun set_max_emergency_duration(
        emergency_manager: &mut EmergencyAccessManager,
        new_duration_ms: u64,
        _ctx: &mut TxContext
    ) {
        emergency_manager.max_emergency_duration = new_duration_ms;
    }
}
