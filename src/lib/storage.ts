import type {
  LocalStorageSchema,
  MedicalRecord,
  Patient,
  Doctor,
  AuditLog,
} from "@/types";

const KEYS = {
  PATIENTS: "mediscript_patients",
  DOCTORS: "mediscript_doctors",
  RECORDS: "mediscript_records",
  AUDIT_LOGS: "mediscript_audit_logs",
  STATS: "mediscript_stats",
} as const;

function safeGet<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function safeSet<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error("localStorage write failed", e);
  }
}

// -- Records--
export function getAllRecords(): MedicalRecord[] {
  return safeGet<MedicalRecord[]>(KEYS.RECORDS, []);
}

export function getRecordsByPatient(patientId: string): MedicalRecord[] {
  return getAllRecords()
    .filter((r) => r.patientId === patientId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function saveRecord(record: MedicalRecord): void {
  const existing = getAllRecords();
  const idx = existing.findIndex((r) => r.recordId === record.recordId);
  if (idx >= 0) {
    existing[idx] = record;
  } else {
    existing.push(record);
  }
  safeSet(KEYS.RECORDS, existing);
  incrementParsedCount();
  addAuditLog({
    logId: crypto.randomUUID(),
    action: "RECORD_SAVED",
    target: record.patientId,
    timestamp: new Date().toISOString(),
    success: true,
    details: `Record ${record.recordId} saved`,
  });
}

export function deleteRecord(recordId: string): void {
  const updated = getAllRecords().filter((r) => r.recordId !== recordId);
  safeSet(KEYS.RECORDS, updated);
}

// ── Patients ──
export function getAllPatients(): Patient[] {
  return safeGet<Patient[]>(KEYS.PATIENTS, []);
}

export function getPatientById(id: string): Patient | undefined {
  return getAllPatients().find((p) => p.patientId === id);
}

export function savePatient(patient: Patient): void {
  const existing = getAllPatients();
  const idx = existing.findIndex((p) => p.patientId === patient.patientId);
  if (idx >= 0) {
    existing[idx] = patient;
  } else {
    existing.push(patient);
  }
  safeSet(KEYS.PATIENTS, existing);
}

export function deletePatient(patientId: string): void {
  const updated = getAllPatients().filter((p) => p.patientId !== patientId);
  safeSet(KEYS.PATIENTS, updated);
}

// ── Doctors ──
export function getAllDoctors(): Doctor[] {
  return safeGet<Doctor[]>(KEYS.DOCTORS, []);
}

export function saveDoctor(doctor: Doctor): void {
  const existing = getAllDoctors();
  const idx = existing.findIndex((d) => d.doctorId === doctor.doctorId);
  if (idx >= 0) {
    existing[idx] = doctor;
  } else {
    existing.push(doctor);
  }
  safeSet(KEYS.DOCTORS, existing);
}

export function deleteDoctor(doctorId: string): void {
  const updated = getAllDoctors().filter((d) => d.doctorId !== doctorId);
  safeSet(KEYS.DOCTORS, updated);
}

// ── Audit Logs ───
export function getAuditLogs(): AuditLog[] {
  return safeGet<AuditLog[]>(KEYS.AUDIT_LOGS, []);
}

export function addAuditLog(log: AuditLog): void {
  const existing = getAuditLogs();
  existing.unshift(log);
  safeSet(KEYS.AUDIT_LOGS, existing.slice(0, 200));
}

// ── Stats ──
function incrementParsedCount(): void {
  const stats = safeGet(KEYS.STATS, {
    totalParsed: 0,
    totalPatients: 0,
    totalDoctors: 0,
    lastUpdated: new Date().toISOString(),
  });
  safeSet(KEYS.STATS, {
    ...stats,
    totalParsed: stats.totalParsed + 1,
    lastUpdated: new Date().toISOString(),
  });
}

export function getStats() {
  return safeGet(KEYS.STATS, {
    totalParsed: 0,
    totalPatients: 0,
    totalDoctors: 0,
    lastUpdated: new Date().toISOString(),
  });
}

// ── Mock Data Injection ─
export function injectMockData(): void {
  const mockPatients: Patient[] = [
    {
      patientId: "PAT-001",
      name: "Rahim Uddin",
      age: 45,
      gender: "Male",
      bloodGroup: "B+",
      phone: "01711000001",
      email: "rahim@example.com",
      address: "Dhaka, Bangladesh",
      createdAt: new Date().toISOString(),
      status: "active",
    },
    {
      patientId: "PAT-002",
      name: "Fatima Begum",
      age: 32,
      gender: "Female",
      bloodGroup: "O+",
      phone: "01811000002",
      email: "fatima@example.com",
      address: "Chittagong, Bangladesh",
      createdAt: new Date().toISOString(),
      status: "active",
    },
  ];

  const mockRecords: MedicalRecord[] = [
    {
      recordId: "REC-001",
      patientId: "PAT-001",
      date: "2024-11-15",
      doctorName: "Dr. Karim Ahmed",
      patientCase: "Patient presented with fever and throat infection",
      vitalSigns: {
        respiratoryRate: "18 breaths/min",
        bloodPressure: "120/80 mmHg",
        heartRate: "88 bpm",
        temperature: "38.5°C",
      },
      medicines: [
        {
          name: "Amoxicillin",
          dosage: "500mg",
          duration: "7 days",
          category: "Antibiotic",
        },
        {
          name: "Vitamin C",
          dosage: "1000mg",
          duration: "14 days",
          category: "Vitamin",
        },
        {
          name: "Omeprazole",
          dosage: "20mg",
          duration: "7 days",
          category: "Gastric",
        },
      ],
      testResults: [
        {
          testName: "CBC - WBC",
          value: "11.2",
          unit: "×10³/μL",
          referenceRange: "4.5-11.0",
        },
        {
          testName: "CRP",
          value: "24",
          unit: "mg/L",
          referenceRange: "<10",
        },
      ],
      uploadedAt: new Date().toISOString(),
    },
    {
      recordId: "REC-002",
      patientId: "PAT-001",
      date: "2025-02-20",
      doctorName: "Dr. Nasrin Sultana",
      patientCase: "Routine checkup with mild hypertension",
      vitalSigns: {
        respiratoryRate: "16 breaths/min",
        bloodPressure: "145/92 mmHg",
        heartRate: "76 bpm",
      },
      medicines: [
        {
          name: "Amlodipine",
          dosage: "5mg",
          duration: "30 days",
          category: "Antihypertensive",
        },
        {
          name: "Calcium Carbonate",
          dosage: "500mg",
          duration: "30 days",
          category: "Calcium",
        },
      ],
      testResults: [
        {
          testName: "Fasting Blood Sugar",
          value: "5.8",
          unit: "mmol/L",
          referenceRange: "3.9-6.1",
        },
        {
          testName: "Total Cholesterol",
          value: "210",
          unit: "mg/dL",
          referenceRange: "<200",
        },
      ],
      uploadedAt: new Date().toISOString(),
    },
  ];

  mockPatients.forEach(savePatient);
  mockRecords.forEach((r) => {
    const records = getAllRecords();
    if (!records.find((x) => x.recordId === r.recordId)) {
      records.push(r);
      safeSet(KEYS.RECORDS, records);
    }
  });

  addAuditLog({
    logId: crypto.randomUUID(),
    action: "MOCK_DATA_INJECTED",
    target: "SYSTEM",
    timestamp: new Date().toISOString(),
    success: true,
    details: "Mock dataset loaded by Admin",
  });
}

export function clearAllData(): void {
  Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
  addAuditLog({
    logId: crypto.randomUUID(),
    action: "DATA_CLEARED",
    target: "SYSTEM",
    timestamp: new Date().toISOString(),
    success: true,
    details: "All localStorage data cleared by Admin",
  });
}

export function exportData(): LocalStorageSchema {
  return {
    patients: getAllPatients(),
    doctors: getAllDoctors(),
    records: getAllRecords(),
    auditLogs: getAuditLogs(),
    stats: getStats(),
  };
}
