"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Button, Card, CardBody, Chip, Tabs, Tab,
  Table, TableHeader, TableColumn, TableBody, TableRow, TableCell,
  Input, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure,
} from "@nextui-org/react";
import {
  ShieldCheck, Users, Stethoscope, FileText, Trash2, Database,
  Plus, AlertTriangle, CheckCircle, Clock, Activity,
  UserX, UserCheck, RefreshCw, Download,
} from "lucide-react";
import type { Patient, Doctor, AuditLog } from "@/types";
import {
  getAllPatients, getAllDoctors, getAuditLogs, getStats, savePatient,
  saveDoctor, deletePatient, deleteDoctor, injectMockData, clearAllData,
  exportData, addAuditLog, getAllRecords,
} from "@/lib/storage";
import { generateId, cn } from "@/lib/utils";

export default function AdminPortal() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [stats, setStats] = useState({ totalParsed: 0, totalPatients: 0, totalDoctors: 0, lastUpdated: "" });
  const [totalRecords, setTotalRecords] = useState(0);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const { isOpen: isPatientOpen, onOpen: onPatientOpen, onClose: onPatientClose } = useDisclosure();
  const { isOpen: isDoctorOpen, onOpen: onDoctorOpen, onClose: onDoctorClose } = useDisclosure();
  const { isOpen: isClearOpen, onOpen: onClearOpen, onClose: onClearClose } = useDisclosure();
  const [patientForm, setPatientForm] = useState<Partial<Patient>>({ gender: "Male", status: "active" });
  const [doctorForm, setDoctorForm] = useState<Partial<Doctor>>({ status: "active" });

  const refresh = useCallback(() => {
    setPatients(getAllPatients());
    setDoctors(getAllDoctors());
    setLogs(getAuditLogs());
    setStats(getStats());
    setTotalRecords(getAllRecords().length);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleInjectMock = () => { injectMockData(); refresh(); showToast("Mock data injected!"); };
  const handleClearAll = () => { clearAllData(); refresh(); onClearClose(); showToast("All data cleared.", "error"); };
  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "mediscript-export.json"; a.click();
    URL.revokeObjectURL(url); showToast("Data exported!");
  };

  const handleSavePatient = () => {
    if (!patientForm.name || !patientForm.age) return showToast("Name and age required", "error");
    const patient: Patient = {
      patientId: generateId("PAT"), name: patientForm.name!, age: Number(patientForm.age),
      gender: (patientForm.gender as Patient["gender"]) || "Other",
      bloodGroup: patientForm.bloodGroup, phone: patientForm.phone,
      email: patientForm.email, address: patientForm.address,
      createdAt: new Date().toISOString(), status: "active",
    };
    savePatient(patient);
    addAuditLog({ logId: crypto.randomUUID(), action: "PATIENT_REGISTERED", target: patient.patientId, timestamp: new Date().toISOString(), success: true });
    refresh(); onPatientClose(); setPatientForm({ gender: "Male", status: "active" });
    showToast("Patient " + patient.patientId + " registered!");
  };

  const handleSaveDoctor = () => {
    if (!doctorForm.name || !doctorForm.specialization) return showToast("Name and specialization required", "error");
    const doctor: Doctor = {
      doctorId: generateId("DOC"), name: doctorForm.name!, specialization: doctorForm.specialization!,
      licenseNumber: doctorForm.licenseNumber || generateId("LIC"),
      phone: doctorForm.phone, email: doctorForm.email,
      createdAt: new Date().toISOString(), status: "active",
    };
    saveDoctor(doctor);
    addAuditLog({ logId: crypto.randomUUID(), action: "DOCTOR_REGISTERED", target: doctor.doctorId, timestamp: new Date().toISOString(), success: true });
    refresh(); onDoctorClose(); setDoctorForm({ status: "active" });
    showToast("Doctor " + doctor.doctorId + " registered!");
  };

  const handleTogglePatient = (p: Patient) => {
    const updated = { ...p, status: p.status === "active" ? "suspended" : "active" } as Patient;
    savePatient(updated);
    addAuditLog({ logId: crypto.randomUUID(), action: updated.status === "active" ? "PATIENT_ACTIVATED" : "PATIENT_SUSPENDED", target: p.patientId, timestamp: new Date().toISOString(), success: true });
    refresh(); showToast("Patient " + p.patientId + " " + updated.status);
  };

  const handleDeletePatient = (p: Patient) => {
    deletePatient(p.patientId);
    addAuditLog({ logId: crypto.randomUUID(), action: "PATIENT_DELETED", target: p.patientId, timestamp: new Date().toISOString(), success: true });
    refresh(); showToast("Patient " + p.patientId + " deleted", "error");
  };

  const handleToggleDoctor = (d: Doctor) => {
    const updated = { ...d, status: d.status === "active" ? "suspended" : "active" } as Doctor;
    saveDoctor(updated); refresh(); showToast("Doctor " + d.doctorId + " " + updated.status);
  };

  const handleDeleteDoctor = (d: Doctor) => {
    deleteDoctor(d.doctorId); refresh(); showToast("Doctor " + d.doctorId + " deleted", "error");
  };

  const statCards = [
    { label: "Patients", value: patients.length, icon: <Users className="w-5 h-5" />, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
    { label: "Doctors", value: doctors.length, icon: <Stethoscope className="w-5 h-5" />, color: "text-sky-400", bg: "bg-sky-500/10", border: "border-sky-500/20" },
    { label: "Total Records", value: totalRecords, icon: <FileText className="w-5 h-5" />, color: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/20" },
    { label: "AI Parsed Docs", value: stats.totalParsed, icon: <Activity className="w-5 h-5" />, color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20" },
  ];

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {toast && (
        <div className={cn("fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium shadow-xl",
          toast.type === "success" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-red-500/10 border-red-500/30 text-red-400")}>
          {toast.type === "success" ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-rose-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Admin Portal</h1>
            <p className="text-sm text-white/40">System control · User management · Audit logs</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="flat" onClick={refresh} className="bg-white/5 text-white/50 border border-white/10">
            <RefreshCw className="w-3.5 h-3.5 mr-1" /> Refresh
          </Button>
          <Button size="sm" variant="flat" onClick={handleExport} className="bg-white/5 text-white/50 border border-white/10">
            <Download className="w-3.5 h-3.5 mr-1" /> Export JSON
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-6">
        {statCards.map((s) => (
          <div key={s.label} className={cn("rounded-xl border p-4", s.bg, s.border)}>
            <div className={cn("mb-2", s.color)}>{s.icon}</div>
            <p className={cn("text-3xl font-bold", s.color)}>{s.value}</p>
            <p className="text-white/30 text-xs mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2 mb-6">
        <Button size="sm" onClick={handleInjectMock} className="bg-violet-500/10 border border-violet-500/30 text-violet-400 hover:bg-violet-500/20" startContent={<Database className="w-3.5 h-3.5" />}>
          Inject Mock Data
        </Button>
        <Button size="sm" onClick={onClearOpen} className="bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20" startContent={<Trash2 className="w-3.5 h-3.5" />}>
          Clear All Data
        </Button>
      </div>

      <Tabs classNames={{ tabList: "bg-white/5 border border-white/10 p-1 rounded-xl", cursor: "bg-rose-500/20 border border-rose-500/30", tab: "text-white/40 data-[selected=true]:text-rose-400" }}>
        <Tab key="patients" title={"Patients (" + patients.length + ")"}>
          <div className="pt-4">
            <div className="flex justify-end mb-3">
              <Button size="sm" onClick={onPatientOpen} className="bg-emerald-500 text-white" startContent={<Plus className="w-3.5 h-3.5" />}>Register Patient</Button>
            </div>
            {patients.length === 0 ? (
              <div className="text-center py-12 text-white/20"><Users className="w-10 h-10 mx-auto mb-3 opacity-30" /><p>No patients yet. Inject mock data to start.</p></div>
            ) : (
              <Table classNames={{ base: "bg-transparent", th: "bg-white/5 text-white/40 text-xs", td: "text-white/70 text-sm border-t border-white/5" }}>
                <TableHeader>
                  <TableColumn>ID</TableColumn><TableColumn>NAME</TableColumn>
                  <TableColumn>AGE / GENDER</TableColumn><TableColumn>PHONE</TableColumn>
                  <TableColumn>STATUS</TableColumn><TableColumn>ACTIONS</TableColumn>
                </TableHeader>
                <TableBody>
                  {patients.map((p) => (
                    <TableRow key={p.patientId}>
                      <TableCell><span className="font-mono text-xs text-sky-400">{p.patientId}</span></TableCell>
                      <TableCell>{p.name}</TableCell>
                      <TableCell>{p.age}y · {p.gender}{p.bloodGroup ? " · " + p.bloodGroup : ""}</TableCell>
                      <TableCell>{p.phone || "—"}</TableCell>
                      <TableCell>
                        <Chip size="sm" className={p.status === "active" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"} variant="flat">{p.status}</Chip>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <button onClick={() => handleTogglePatient(p)} className="p-1.5 rounded-lg hover:bg-white/10 text-white/30 hover:text-white">
                            {p.status === "active" ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                          </button>
                          <button onClick={() => handleDeletePatient(p)} className="p-1.5 rounded-lg hover:bg-red-500/20 text-white/30 hover:text-red-400">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </Tab>

        <Tab key="doctors" title={"Doctors (" + doctors.length + ")"}>
          <div className="pt-4">
            <div className="flex justify-end mb-3">
              <Button size="sm" onClick={onDoctorOpen} className="bg-sky-500 text-white" startContent={<Plus className="w-3.5 h-3.5" />}>Register Doctor</Button>
            </div>
            {doctors.length === 0 ? (
              <div className="text-center py-12 text-white/20"><Stethoscope className="w-10 h-10 mx-auto mb-3 opacity-30" /><p>No doctors registered yet.</p></div>
            ) : (
              <Table classNames={{ base: "bg-transparent", th: "bg-white/5 text-white/40 text-xs", td: "text-white/70 text-sm border-t border-white/5" }}>
                <TableHeader>
                  <TableColumn>ID</TableColumn><TableColumn>NAME</TableColumn>
                  <TableColumn>SPECIALIZATION</TableColumn><TableColumn>LICENSE</TableColumn>
                  <TableColumn>STATUS</TableColumn><TableColumn>ACTIONS</TableColumn>
                </TableHeader>
                <TableBody>
                  {doctors.map((d) => (
                    <TableRow key={d.doctorId}>
                      <TableCell><span className="font-mono text-xs text-sky-400">{d.doctorId}</span></TableCell>
                      <TableCell>{d.name}</TableCell>
                      <TableCell>{d.specialization}</TableCell>
                      <TableCell className="font-mono text-xs text-white/40">{d.licenseNumber}</TableCell>
                      <TableCell>
                        <Chip size="sm" className={d.status === "active" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"} variant="flat">{d.status}</Chip>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <button onClick={() => handleToggleDoctor(d)} className="p-1.5 rounded-lg hover:bg-white/10 text-white/30 hover:text-white">
                            {d.status === "active" ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                          </button>
                          <button onClick={() => handleDeleteDoctor(d)} className="p-1.5 rounded-lg hover:bg-red-500/20 text-white/30 hover:text-red-400">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </Tab>

        <Tab key="logs" title={"Audit Logs (" + logs.length + ")"}>
          <div className="pt-4 space-y-2 max-h-[500px] overflow-y-auto">
            {logs.length === 0 ? (
              <div className="text-center py-12 text-white/20"><Clock className="w-10 h-10 mx-auto mb-3 opacity-30" /><p>No audit logs yet.</p></div>
            ) : (
              logs.map((log) => (
                <div key={log.logId} className={cn("flex items-start gap-3 p-3 rounded-xl border text-xs", log.success ? "bg-emerald-500/5 border-emerald-500/10" : "bg-red-500/5 border-red-500/10")}>
                  <div className={cn("mt-0.5 flex-shrink-0", log.success ? "text-emerald-400" : "text-red-400")}>
                    {log.success ? <CheckCircle className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={cn("font-mono font-semibold", log.success ? "text-emerald-400" : "text-red-400")}>{log.action}</span>
                      <span className="text-white/30">·</span>
                      <span className="text-white/50">{log.target}</span>
                    </div>
                    {log.details && <p className="text-white/30 mt-0.5 truncate">{log.details}</p>}
                  </div>
                  <span className="text-white/20 flex-shrink-0 font-mono">{new Date(log.timestamp).toLocaleTimeString()}</span>
                </div>
              ))
            )}
          </div>
        </Tab>
      </Tabs>

      {/* Register Patient Modal */}
      <Modal isOpen={isPatientOpen} onClose={onPatientClose} classNames={{ base: "bg-[#0d1626] border border-white/10", header: "border-b border-white/5", footer: "border-t border-white/5" }}>
        <ModalContent>
          <ModalHeader className="text-white">Register New Patient</ModalHeader>
          <ModalBody className="space-y-3">
            <Input label="Full Name *" placeholder="Rahim Uddin" classNames={{ input: "bg-transparent text-white", inputWrapper: "bg-white/5 border-white/10" }} onChange={(e) => setPatientForm((p) => ({ ...p, name: e.target.value }))} />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Age *" type="number" classNames={{ input: "bg-transparent text-white", inputWrapper: "bg-white/5 border-white/10" }} onChange={(e) => setPatientForm((p) => ({ ...p, age: parseInt(e.target.value) }))} />
              <Input label="Blood Group" placeholder="B+" classNames={{ input: "bg-transparent text-white", inputWrapper: "bg-white/5 border-white/10" }} onChange={(e) => setPatientForm((p) => ({ ...p, bloodGroup: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Phone" classNames={{ input: "bg-transparent text-white", inputWrapper: "bg-white/5 border-white/10" }} onChange={(e) => setPatientForm((p) => ({ ...p, phone: e.target.value }))} />
              <Input label="Email" classNames={{ input: "bg-transparent text-white", inputWrapper: "bg-white/5 border-white/10" }} onChange={(e) => setPatientForm((p) => ({ ...p, email: e.target.value }))} />
            </div>
            <Input label="Address" classNames={{ input: "bg-transparent text-white", inputWrapper: "bg-white/5 border-white/10" }} onChange={(e) => setPatientForm((p) => ({ ...p, address: e.target.value }))} />
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onClick={onPatientClose} className="text-white/50">Cancel</Button>
            <Button className="bg-emerald-500 text-white" onClick={handleSavePatient}>Register</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Register Doctor Modal */}
      <Modal isOpen={isDoctorOpen} onClose={onDoctorClose} classNames={{ base: "bg-[#0d1626] border border-white/10", header: "border-b border-white/5", footer: "border-t border-white/5" }}>
        <ModalContent>
          <ModalHeader className="text-white">Register New Doctor</ModalHeader>
          <ModalBody className="space-y-3">
            <Input label="Full Name *" placeholder="Dr. Karim Ahmed" classNames={{ input: "bg-transparent text-white", inputWrapper: "bg-white/5 border-white/10" }} onChange={(e) => setDoctorForm((d) => ({ ...d, name: e.target.value }))} />
            <Input label="Specialization *" placeholder="Cardiology" classNames={{ input: "bg-transparent text-white", inputWrapper: "bg-white/5 border-white/10" }} onChange={(e) => setDoctorForm((d) => ({ ...d, specialization: e.target.value }))} />
            <Input label="License Number" placeholder="BMDC-001234" classNames={{ input: "bg-transparent text-white", inputWrapper: "bg-white/5 border-white/10" }} onChange={(e) => setDoctorForm((d) => ({ ...d, licenseNumber: e.target.value }))} />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Phone" classNames={{ input: "bg-transparent text-white", inputWrapper: "bg-white/5 border-white/10" }} onChange={(e) => setDoctorForm((d) => ({ ...d, phone: e.target.value }))} />
              <Input label="Email" classNames={{ input: "bg-transparent text-white", inputWrapper: "bg-white/5 border-white/10" }} onChange={(e) => setDoctorForm((d) => ({ ...d, email: e.target.value }))} />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onClick={onDoctorClose} className="text-white/50">Cancel</Button>
            <Button className="bg-sky-500 text-white" onClick={handleSaveDoctor}>Register</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Clear Confirm Modal */}
      <Modal isOpen={isClearOpen} onClose={onClearClose} classNames={{ base: "bg-[#0d1626] border border-red-500/20", header: "border-b border-white/5", footer: "border-t border-white/5" }}>
        <ModalContent>
          <ModalHeader className="text-red-400 flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Confirm Clear All</ModalHeader>
          <ModalBody><p className="text-white/60 text-sm">This will permanently delete all patients, doctors, records, and logs. Cannot be undone.</p></ModalBody>
          <ModalFooter>
            <Button variant="light" onClick={onClearClose} className="text-white/50">Cancel</Button>
            <Button className="bg-red-500 text-white" onClick={handleClearAll}>Yes, Clear Everything</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
