// Health data types and interfaces for the healthcare system

export interface HealthData {
  id: string;
  type: HealthDataType;
  patientId: string;
  doctorId?: string;
  pharmacistId?: string;
  createdAt: Date;
  updatedAt: Date;
  data: any; // Specific data based on type
  metadata: HealthDataMetadata;
}

export type HealthDataType = 
  | 'lab_result'
  | 'prescription'
  | 'medical_record'
  | 'diagnosis'
  | 'treatment_plan'
  | 'vital_signs'
  | 'imaging_result'
  | 'medication_history';

export interface HealthDataMetadata {
  version: string;
  encrypted: boolean;
  policyId: string;
  blobId?: string;
  accessLevel: AccessLevel;
  retentionPeriod: number; // in days
  tags: string[];
}

export type AccessLevel = 'public' | 'restricted' | 'confidential' | 'secret';

// Specific health data types
export interface LabResult extends HealthData {
  type: 'lab_result';
  data: {
    testName: string;
    testCode: string;
    results: LabTestResult[];
    normalRanges: Record<string, { min: number; max: number; unit: string }>;
    status: 'normal' | 'abnormal' | 'critical';
    notes?: string;
  };
}

export interface LabTestResult {
  parameter: string;
  value: number;
  unit: string;
  status: 'normal' | 'high' | 'low' | 'critical';
  referenceRange: string;
}

export interface Prescription extends HealthData {
  type: 'prescription';
  data: {
    prescriptionId: string;
    medications: Medication[];
    instructions: string;
    dosage: string;
    frequency: string;
    duration: string;
    refills: number;
    status: 'active' | 'completed' | 'cancelled';
    notes?: string;
  };
}

export interface Medication {
  name: string;
  genericName: string;
  dosage: string;
  form: string;
  quantity: number;
  instructions: string;
}

export interface MedicalRecord extends HealthData {
  type: 'medical_record';
  data: {
    chiefComplaint: string;
    historyOfPresentIllness: string;
    pastMedicalHistory: string[];
    medications: string[];
    allergies: string[];
    socialHistory: string;
    familyHistory: string;
    reviewOfSystems: Record<string, string>;
    physicalExamination: Record<string, string>;
    assessment: string;
    plan: string;
  };
}

export interface Diagnosis extends HealthData {
  type: 'diagnosis';
  data: {
    icd10Code: string;
    description: string;
    severity: 'mild' | 'moderate' | 'severe';
    status: 'active' | 'resolved' | 'chronic';
    notes?: string;
  };
}

export interface TreatmentPlan extends HealthData {
  type: 'treatment_plan';
  data: {
    planId: string;
    goals: string[];
    interventions: TreatmentIntervention[];
    timeline: string;
    followUpRequired: boolean;
    followUpDate?: Date;
    status: 'active' | 'completed' | 'modified';
  };
}

export interface TreatmentIntervention {
  type: 'medication' | 'therapy' | 'procedure' | 'lifestyle';
  description: string;
  frequency: string;
  duration: string;
  expectedOutcome: string;
}

export interface VitalSigns extends HealthData {
  type: 'vital_signs';
  data: {
    bloodPressure: {
      systolic: number;
      diastolic: number;
    };
    heartRate: number;
    temperature: number;
    respiratoryRate: number;
    oxygenSaturation: number;
    weight?: number;
    height?: number;
    bmi?: number;
    timestamp: Date;
  };
}

export interface ImagingResult extends HealthData {
  type: 'imaging_result';
  data: {
    studyType: string;
    bodyPart: string;
    findings: string;
    impression: string;
    recommendations: string;
    imageUrls?: string[];
    radiologistId: string;
  };
}

export interface MedicationHistory extends HealthData {
  type: 'medication_history';
  data: {
    medications: MedicationHistoryEntry[];
    allergies: string[];
    adverseReactions: string[];
  };
}

export interface MedicationHistoryEntry {
  medication: string;
  startDate: Date;
  endDate?: Date;
  dosage: string;
  frequency: string;
  indication: string;
  prescriber: string;
  status: 'active' | 'discontinued' | 'completed';
}

// Policy and access control types
export interface AccessPolicy {
  id: string;
  name: string;
  description: string;
  rules: AccessRule[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AccessRule {
  role: string;
  permissions: Permission[];
  conditions?: AccessCondition[];
}

export interface Permission {
  action: 'read' | 'write' | 'delete' | 'share';
  resource: string;
  restrictions?: PermissionRestriction[];
}

export interface PermissionRestriction {
  type: 'time_based' | 'location_based' | 'data_type_based';
  value: any;
}

export interface AccessCondition {
  type: 'kyc_required' | 'role_required' | 'consent_required';
  value: any;
}

// Data service response types
export interface SaveHealthDataResponse {
  success: boolean;
  dataId: string;
  blobId: string;
  policyId: string;
  encrypted: boolean;
  error?: string;
}

export interface GetHealthDataResponse {
  success: boolean;
  data?: HealthData;
  error?: string;
}

export interface HealthDataListResponse {
  success: boolean;
  data: HealthData[];
  total: number;
  page: number;
  limit: number;
  error?: string;
}
