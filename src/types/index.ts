export interface Medicine {
  name: string;
  dosage: string;
  duration: string;
  category: MedicineCategory;
}

export type MedicineCategory =
  | "Antibiotic"
  | "Vitamin"
  | "Calcium"
  | "Gastric"
  | "Painkiller"
  | "Antihypertensive"
  | "Antidiabetic"
  | "Antihistamine"
  | "Other";

export interface TestResult {
  testName: string;
  value: string;
  unit?: string;
  referenceRange?: string;
}

export interface VitalSigns {
  respiratoryRate?: string;
  bloodPressure?: string;
  heartRate?: string;
  temperature?: string;
  oxygenSaturation?: string;
}

export interface MedicalRecord {
  recordId: string;
  patientId: string;
  date: string;
  doctorName: string;
  patientCase: string;
  vitalSigns: VitalSigns;
  medicines: Medicine[];
  testResults: TestResult[];
  rawText?: string;
  uploadedAt: string;
}

export interface Patient {
  patientId: string;
  name: string;
  age: number;
  gender: "Male" | "Female" | "Other";
  bloodGroup?: string;
  phone?: string;
  email?: string;
  address?: string;
  createdAt: string;
  status: "active" | "suspended";
}

export interface Doctor {
  doctorId: string;
  name: string;
  specialization: string;
  licenseNumber: string;
  phone?: string;
  email?: string;
  createdAt: string;
  status: "active" | "suspended";
}

export interface AuditLog {
  logId: string;
  action: string;
  target: string;
  timestamp: string;
  success: boolean;
  details?: string;
}

export interface SystemStats {
  totalParsed: number;
  totalPatients: number;
  totalDoctors: number;
  lastUpdated: string;
}

export interface LocalStorageSchema {
  patients: Patient[];
  doctors: Doctor[];
  records: MedicalRecord[];
  auditLogs: AuditLog[];
  stats: SystemStats;
}
