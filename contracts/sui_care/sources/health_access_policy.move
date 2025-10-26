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
    public struct UserRole has copy, drop, store {
        role_type: u8,
        user_address: String,
        verified: bool,
        created_at: u64,
    }
    
    /// Represents a health data type
    public struct HealthDataType has copy, drop, store {
        data_type: u8,
        name: String,
        description: String,
    }
    
    /// Represents a permission for a specific role and data type
    public struct Permission has copy, drop, store {
        role_type: u8,
        data_type: u8,
        permissions: u8, // Bitmask of allowed operations
    }
    
    /// Main access policy object that contains all role-based access rules
    public struct HealthAccessPolicy has key {
        id: UID,
        version: u64,
        permissions: vector<Permission>,
        created_at: u64,
        updated_at: u64,
        admin: String, // Address of the policy administrator
    }
    
    /// Event emitted when permissions are checked
    public struct PermissionChecked has copy, drop {
        user_address: String,
        role_type: u8,
        data_type: u8,
        operation: u8,
        granted: bool,
        timestamp: u64,
    }
    
    /// Event emitted when access is denied
    public struct AccessDenied has copy, drop {
        user_address: String,
        role_type: u8,
        data_type: u8,
        operation: u8,
        reason: u64,
        timestamp: u64,
    }

    // ===== INITIALIZATION =====
    
    /// Initialize the health access policy module
    public fun init(ctx: &mut TxContext) {
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
        user_address: String,
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
        user_address: String,
        data_owner_address: String,
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
        authorizer_address: String,
        target_user_address: String,
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
    public fun get_policy_admin(policy: &HealthAccessPolicy): String {
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
