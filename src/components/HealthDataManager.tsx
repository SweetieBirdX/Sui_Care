import { useCurrentAccount } from '@mysten/dapp-kit';
import { useUserRole } from '../hooks/useUserRole';
import { DataService } from '../services/dataService';
import { useSuiClient } from '@mysten/dapp-kit';
import { useState, useEffect, useCallback } from 'react';
import { 
  type HealthData, 
  type HealthDataType, 
  type LabResult,
  type Prescription,
  type MedicalRecord 
} from '../types/healthData';

export function HealthDataManager() {
  const account = useCurrentAccount();
  const { roleData } = useUserRole();
  const suiClient = useSuiClient();
  const [dataService] = useState(() => new DataService(
    suiClient, 
    '0x0', // Package ID - should be replaced with actual deployed package ID
    '0x0'  // Policy Object ID - should be replaced with actual policy object ID
  ));
  
  const [healthData, setHealthData] = useState<HealthData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<HealthDataType>('lab_result');

  // Load health data on mount
  useEffect(() => {
    if (account?.address && roleData?.role) {
      loadHealthData();
    }
  }, [account?.address, roleData?.role]);

  const loadHealthData = useCallback(async () => {
    if (!account?.address || !roleData?.role) return;

    setLoading(true);
    setError(null);

    try {
      const response = await dataService.listHealthData(
        account.address,
        roleData.role,
        1,
        20
      );

      if (response.success) {
        setHealthData(response.data);
      } else {
        setError(response.error || 'Failed to load health data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [account?.address, roleData?.role, dataService]);

  const createSampleData = async (type: HealthDataType) => {
    if (!account?.address || !roleData?.role) return;

    setLoading(true);
    setError(null);

    try {
      let sampleData: HealthData;

      switch (type) {
        case 'lab_result':
          sampleData = createSampleLabResult(account.address);
          break;
        case 'prescription':
          sampleData = createSamplePrescription(account.address);
          break;
        case 'medical_record':
          sampleData = createSampleMedicalRecord(account.address);
          break;
        default:
          throw new Error(`Unsupported data type: ${type}`);
      }

      const response = await dataService.saveHealthData(
        sampleData,
        'default_policy',
        account.address,
        roleData.role
      );

      if (response.success) {
        await loadHealthData(); // Reload data
      } else {
        setError(response.error || 'Failed to save health data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  if (!account) {
    return (
      <div className="health-data-manager">
        <h3>🏥 Health Data Manager</h3>
        <p>Please connect your wallet to manage health data.</p>
      </div>
    );
  }

  if (!roleData) {
    return (
      <div className="health-data-manager">
        <h3>🏥 Health Data Manager</h3>
        <p>Please complete KYC verification and select your role to manage health data.</p>
      </div>
    );
  }

  return (
    <div className="health-data-manager">
      <div className="health-data-header">
        <h3>🏥 Health Data Manager</h3>
        <p>Role: <strong>{roleData.role}</strong> | Data: {healthData.length} items</p>
      </div>

      <div className="health-data-controls">
        <div className="data-type-selector">
          <label>Create Sample Data:</label>
          <select 
            value={selectedType} 
            onChange={(e) => setSelectedType(e.target.value as HealthDataType)}
          >
            <option value="lab_result">Lab Result</option>
            <option value="prescription">Prescription</option>
            <option value="medical_record">Medical Record</option>
            <option value="diagnosis">Diagnosis</option>
            <option value="treatment_plan">Treatment Plan</option>
            <option value="vital_signs">Vital Signs</option>
          </select>
          <button 
            onClick={() => createSampleData(selectedType)}
            disabled={loading}
            className="create-data-button"
          >
            {loading ? 'Creating...' : 'Create Sample Data'}
          </button>
        </div>

        <button 
          onClick={loadHealthData}
          disabled={loading}
          className="refresh-button"
        >
          {loading ? 'Loading...' : 'Refresh Data'}
        </button>
      </div>

      {error && (
        <div className="error-message">
          <span className="error-icon">❌</span>
          <span>{error}</span>
        </div>
      )}

      <div className="health-data-list">
        {healthData.length === 0 ? (
          <div className="no-data">
            <p>No health data found. Create some sample data to get started.</p>
          </div>
        ) : (
          healthData.map((data) => (
            <div key={data.id} className="health-data-item">
              <div className="data-header">
                <h4>{data.type.replace('_', ' ').toUpperCase()}</h4>
                <span className="data-status">
                  {data.metadata.encrypted ? '🔒 Encrypted' : '🔓 Unencrypted'}
                </span>
              </div>
              <div className="data-info">
                <p><strong>ID:</strong> {data.id}</p>
                <p><strong>Created:</strong> {new Date(data.createdAt).toLocaleString()}</p>
                <p><strong>Access Level:</strong> {data.metadata.accessLevel}</p>
                {data.metadata.blobId && (
                  <p><strong>Blob ID:</strong> {data.metadata.blobId.slice(0, 20)}...</p>
                )}
              </div>
              <div className="data-actions">
                <button className="view-button">View Details</button>
                <button className="share-button">Share</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// Helper functions to create sample data
function createSampleLabResult(patientId: string): LabResult {
  return {
    id: `lab_${Date.now()}`,
    type: 'lab_result',
    patientId,
    createdAt: new Date(),
    updatedAt: new Date(),
    data: {
      testName: 'Complete Blood Count',
      testCode: 'CBC',
      results: [
        {
          parameter: 'Hemoglobin',
          value: 14.2,
          unit: 'g/dL',
          status: 'normal',
          referenceRange: '12.0-16.0',
        },
        {
          parameter: 'White Blood Cells',
          value: 7.5,
          unit: 'K/μL',
          status: 'normal',
          referenceRange: '4.5-11.0',
        },
      ],
      normalRanges: {
        hemoglobin: { min: 12.0, max: 16.0, unit: 'g/dL' },
        wbc: { min: 4.5, max: 11.0, unit: 'K/μL' },
      },
      status: 'normal',
      notes: 'All values within normal range',
    },
    metadata: {
      version: '1.0',
      encrypted: false,
      policyId: 'default_policy',
      accessLevel: 'confidential',
      retentionPeriod: 2555, // 7 years
      tags: ['lab', 'blood', 'routine'],
    },
  };
}

function createSamplePrescription(patientId: string): Prescription {
  return {
    id: `prescription_${Date.now()}`,
    type: 'prescription',
    patientId,
    createdAt: new Date(),
    updatedAt: new Date(),
    data: {
      prescriptionId: `RX${Date.now()}`,
      medications: [
        {
          name: 'Amoxicillin',
          genericName: 'Amoxicillin',
          dosage: '500mg',
          form: 'Capsule',
          quantity: 21,
          instructions: 'Take one capsule three times daily with food',
        },
      ],
      instructions: 'Take with food to reduce stomach upset',
      dosage: '500mg',
      frequency: 'Three times daily',
      duration: '7 days',
      refills: 0,
      status: 'active',
      notes: 'Complete full course even if feeling better',
    },
    metadata: {
      version: '1.0',
      encrypted: false,
      policyId: 'default_policy',
      accessLevel: 'confidential',
      retentionPeriod: 365, // 1 year
      tags: ['prescription', 'antibiotic', 'active'],
    },
  };
}

function createSampleMedicalRecord(patientId: string): MedicalRecord {
  return {
    id: `medical_${Date.now()}`,
    type: 'medical_record',
    patientId,
    createdAt: new Date(),
    updatedAt: new Date(),
    data: {
      chiefComplaint: 'Chest pain and shortness of breath',
      historyOfPresentIllness: 'Patient reports chest pain that started 2 hours ago, described as pressure-like, 7/10 severity',
      pastMedicalHistory: ['Hypertension', 'Type 2 Diabetes'],
      medications: ['Metformin 500mg BID', 'Lisinopril 10mg daily'],
      allergies: ['Penicillin'],
      socialHistory: 'Non-smoker, occasional alcohol use',
      familyHistory: 'Father with heart disease, mother with diabetes',
      reviewOfSystems: {
        cardiovascular: 'Chest pain, palpitations',
        respiratory: 'Shortness of breath',
        gastrointestinal: 'No nausea or vomiting',
      },
      physicalExamination: {
        vitalSigns: 'BP 150/90, HR 95, RR 20, O2 sat 96%',
        cardiovascular: 'Regular rate and rhythm, no murmurs',
        respiratory: 'Clear to auscultation bilaterally',
      },
      assessment: 'Chest pain, rule out acute coronary syndrome',
      plan: 'ECG, cardiac enzymes, chest X-ray, cardiology consult',
    },
    metadata: {
      version: '1.0',
      encrypted: false,
      policyId: 'default_policy',
      accessLevel: 'confidential',
      retentionPeriod: 2555, // 7 years
      tags: ['medical_record', 'chest_pain', 'urgent'],
    },
  };
}
