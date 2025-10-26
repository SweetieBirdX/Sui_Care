# Sui Care - Healthcare Access Policy Contract

This Move smart contract implements role-based access control (RBAC) for healthcare data management on the Sui blockchain.

## Features

### 🔐 Role-Based Access Control
- **Doctor**: Full access to all health data types (READ/WRITE/DELETE/SHARE)
- **Pharmacist**: READ access to prescriptions only
- **Patient**: READ access to their own data only

### 🏥 Health Data Types
- Prescription
- Lab Result
- General Record
- Medical Record
- Diagnosis
- Treatment Plan
- Vital Signs
- Imaging Result
- Medication History

### 🛡️ Security Features
- **Self-Authorization Prevention**: Users cannot authorize themselves
- **Self-Modification Prevention**: Users cannot modify their own data
- **On-Chain Policy Enforcement**: All permissions checked on-chain
- **Event Logging**: All access attempts are logged

## Contract Structure

### Main Structs
- `HealthAccessPolicy`: Main policy object containing all permissions
- `UserRole`: Represents a user's role in the system
- `Permission`: Defines what a role can do with specific data types

### Key Functions
- `check_permission()`: Verify if a user can perform an operation
- `can_modify_data()`: Check if user can modify specific data (with restrictions)
- `can_authorize_access()`: Check if user can authorize others

## Deployment

1. **Deploy the contract**:
   ```bash
   sui move build
   sui client publish --gas-budget 100000000
   ```

2. **Initialize the policy**:
   ```bash
   sui client call --package <PACKAGE_ID> --module health_access_policy --function init --gas-budget 10000000
   ```

3. **Get the policy object ID**:
   ```bash
   sui client objects
   ```

## Usage

### TypeScript Integration

```typescript
import { PolicyService } from './services/policyService';

// Initialize the service
const policyService = new PolicyService(
  suiClient,
  '0x<PACKAGE_ID>',
  '0x<POLICY_OBJECT_ID>'
);

// Check permissions
const canRead = await policyService.checkPermission(
  userAddress,
  ROLE_TYPES.DOCTOR,
  DATA_TYPES.PRESCRIPTION,
  PERMISSIONS.READ
);

// Check if user can modify data
const canModify = await policyService.canModifyData(
  userAddress,
  dataOwnerAddress,
  ROLE_TYPES.DOCTOR,
  DATA_TYPES.PRESCRIPTION
);
```

## Permission Matrix

| Role | Prescription | Lab Result | Medical Record | Other Data |
|------|-------------|------------|----------------|------------|
| **Doctor** | R/W/D/S | R/W/D/S | R/W/D/S | R/W/D/S |
| **Pharmacist** | R | ❌ | ❌ | ❌ |
| **Patient** | R | R | R | R |

- R = Read, W = Write, D = Delete, S = Share
- ❌ = No Access

## Security Constraints

1. **Self-Authorization Forbidden**: No user can authorize themselves
2. **Self-Modification Forbidden**: Users cannot modify their own data
3. **Role-Based Restrictions**: Each role has specific data access patterns
4. **On-Chain Validation**: All permissions are validated on-chain

## Events

The contract emits events for all permission checks:
- `PermissionChecked`: When a permission is verified
- `AccessDenied`: When access is denied with reason

## Error Codes

- `E_INVALID_ROLE`: Invalid role type
- `E_INVALID_DATA_TYPE`: Invalid data type
- `E_INSUFFICIENT_PERMISSIONS`: User lacks required permissions
- `E_SELF_AUTHORIZATION_FORBIDDEN`: Self-authorization attempt
- `E_SELF_MODIFICATION_FORBIDDEN`: Self-modification attempt
- `E_UNAUTHORIZED_ACCESS`: Unauthorized access attempt

## Testing

```bash
# Run tests
sui move test

# Test specific function
sui move test --filter check_permission
```

## Integration with Seal

This contract works with Seal's identity-based encryption by:
1. Validating user permissions before encryption/decryption
2. Ensuring only authorized users can access encrypted data
3. Preventing unauthorized data modification
4. Logging all access attempts for audit trails

## Future Enhancements

- Dynamic policy updates
- Time-based access controls
- Multi-signature authorization
- Audit trail improvements
- Integration with external KYC providers
