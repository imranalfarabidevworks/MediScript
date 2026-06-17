"use client";

import { useState, useCallback, useRef } from "react";
import {
  Button,
  Input,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Divider,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Progress,
  Tabs,
  Tab,
} from "@nextui-org/react";
import {
  Upload,
  FileText,
  X,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Pill,
  TestTube,
  Activity,
  Calendar,
  User,
  ChevronDown,
  ChevronUp,
  Trash2,
} from "lucide-react";
import type { MedicalRecord, Patient } from "@/types";
import { saveRecord, getRecordsByPatient, savePatient, getPatientById, getAllPatients, addAuditLog } from "@/lib/storage";
import { parsePrescriptionFromBase64 } from "@/lib/gemini";
import { fileToBase64, generateId, formatDate, CATEGORY_COLORS, cn } from "@/lib/utils";

type ProcessStep = "idle" | "uploading" | "parsing" | "done" | "error";

export default function PatientPortal() {
  const [apiKey, setApiKey] = useState("");
  const [patientId, setPatientId] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [step, setStep] = useState<ProcessStep>("idle");
  const [progress, setProgress] = useState(0);
  const [parsedRecord, setParsedRecord] = useState<Partial<MedicalRecord> | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("upload");
  const [patientForm, setPatientForm] = useState<Partial<Patient>>({});
  const { isOpen, onOpen, onClose } = useDisclosure();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadRecords = useCallback((pid: string) => {
    setRecords(getRecordsByPatient(pid));
  }, []);

  const handleFile = (file: File) => {
    const allowed = ["image/png", "image/jpeg", "image/webp", "application/pdf"];
    if (!allowed.includes(file.type)) {
      setErrorMsg("Only PNG, JPEG, WEBP, or PDF files are allowed.");
      return;
    }
    setSelectedFile(file);
    setErrorMsg("");
    setParsedRecord(null);
    setStep("idle");
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, []);

  const handleParse = async () => {
    if (!selectedFile) return setErrorMsg("Please select a file first.");
    if (!apiKey.trim()) return setErrorMsg("Please enter your Gemini API key.");
    if (!patientId.trim()) return setErrorMsg("Please enter your Patient ID.");

    setStep("uploading");
    setProgress(20);
    setErrorMsg("");

    try {
      const base64 = await fileToBase64(selectedFile);
      setProgress(50);
      setStep("parsing");

      const result = await parsePrescriptionFromBase64(base64, selectedFile.type, apiKey.trim());
      setProgress(90);

      setParsedRecord(result);
      setStep("done");
      setProgress(100);
    } catch (e) {
      setStep("error");
      setErrorMsg(e instanceof Error ? e.message : "Parsing failed. Please try again.");
      addAuditLog({
        logId: crypto.randomUUID(),
        action: "PARSE_FAILED",
        target: patientId,
        timestamp: new Date().toISOString(),
        success: false,
        details: e instanceof Error ? e.message : "Unknown error",
      });
    }
  };

  const handleSaveRecord = () => {
    if (!parsedRecord || !patientId) return;

    const record: MedicalRecord = {
      recordId: generateId("REC"),
      patientId: patientId.trim().toUpperCase(),
      date: parsedRecord.date || new Date().toISOString().split("T")[0],
      doctorName: parsedRecord.doctorName || "Unknown",
      patientCase: parsedRecord.patientCase || "",
      vitalSigns: parsedRecord.vitalSigns || {},
      medicines: parsedRecord.medicines || [],
      testResults: parsedRecord.testResults || [],
      uploadedAt: new Date().toISOString(),
    };

    // Auto-register patient if not exists
    const existing = getPatientById(patientId.trim().toUpperCase());
    if (!existing) {
      const newPatient: Patient = {
        patientId: patientId.trim().toUpperCase(),
        name: patientForm.name || "Unknown Patient",
        age: patientForm.age || 0,
        gender: patientForm.gender || "Other",
        bloodGroup: patientForm.bloodGroup,
        phone: patientForm.phone,
        email: patientForm.email,
        address: patientForm.address,
        createdAt: new Date().toISOString(),
        status: "active",
      };
      savePatient(newPatient);
    }

    saveRecord(record);
    loadRecords(patientId.trim().toUpperCase());
    setSelectedFile(null);
    setParsedRecord(null);
    setStep("idle");
    setProgress(0);
    setActiveTab("history");
    onClose();
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <Activity className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Patient Portal</h1>
            <p className="text-sm text-white/40">Upload prescriptions · AI extracts everything</p>
          </div>
        </div>
      </div>

      {/* Patient ID + API Key */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="text-xs text-white/40 mb-1.5 block uppercase tracking-wider">Patient ID</label>
          <Input
            placeholder="e.g. PAT-001"
            value={patientId}
            onChange={(e) => {
              setPatientId(e.target.value.toUpperCase());
              if (e.target.value) loadRecords(e.target.value.toUpperCase());
            }}
            classNames={{
              input: "bg-transparent text-white placeholder:text-white/20",
              inputWrapper: "bg-white/5 border border-white/10 hover:border-white/20 focus-within:border-emerald-500/50",
            }}
            startContent={<User className="w-4 h-4 text-white/30" />}
          />
        </div>
         <div>
          <label className="text-xs text-white/40 mb-1.5 block uppercase tracking-wider">Gemini API Key</label>
          <Input
            type="password"
            placeholder="AIza..."
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            classNames={{
              input: "bg-transparent text-white placeholder:text-white/20",
              inputWrapper: "bg-white/5 border border-white/10 hover:border-white/20 focus-within:border-emerald-500/50",
            }}
            startContent={<Sparkles className="w-4 h-4 text-white/30" />}
          />
        </div> 
      </div>

      <Tabs
        selectedKey={activeTab}
        onSelectionChange={(k) => setActiveTab(k as string)}
        classNames={{
          tabList: "bg-white/5 border border-white/10 p-1 rounded-xl",
          cursor: "bg-emerald-500/20 border border-emerald-500/30",
          tab: "text-white/40 data-[selected=true]:text-emerald-400",
        }}
      >
        <Tab key="upload" title="Upload Document">
          <div className="pt-5 space-y-4">
            {/* Drop Zone */}
            <div
              className={cn(
                "relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-200",
                dragOver
                  ? "border-emerald-400/60 bg-emerald-500/5"
                  : "border-white/10 hover:border-white/20 hover:bg-white/2"
              )}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/png,image/jpeg,image/webp,application/pdf"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              />
              {selectedFile ? (
                <div className="flex items-center justify-center gap-3">
                  <FileText className="w-8 h-8 text-emerald-400" />
                  <div className="text-left">
                    <p className="text-white font-medium">{selectedFile.name}</p>
                    <p className="text-white/40 text-sm">
                      {(selectedFile.size / 1024).toFixed(1)} KB · {selectedFile.type}
                    </p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); setSelectedFile(null); setStep("idle"); }}
                    className="ml-4 p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <Upload className="w-10 h-10 text-white/20 mx-auto mb-3" />
                  <p className="text-white/60 font-medium">Drop your prescription here</p>
                  <p className="text-white/25 text-sm mt-1">PNG, JPEG, WEBP, or PDF · Max 10MB</p>
                </>
              )}
            </div>

            {/* Progress */}
            {step !== "idle" && step !== "error" && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-white/40">
                  <span>{step === "uploading" ? "Reading file..." : step === "parsing" ? "AI extracting data..." : "Complete!"}</span>
                  <span>{progress}%</span>
                </div>
                <Progress
                  value={progress}
                  classNames={{
                    base: "w-full",
                    track: "bg-white/5",
                    indicator: step === "done" ? "bg-emerald-500" : "bg-sky-500",
                  }}
                />
              </div>
            )}

            {/* Error */}
            {errorMsg && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {errorMsg}
              </div>
            )}

            {/* Parse Result Preview */}
            {step === "done" && parsedRecord && (
              <div className="border border-emerald-500/20 rounded-2xl bg-emerald-500/5 p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-semibold text-emerald-400">Extraction Complete</h3>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-white/30 text-xs mb-1">Doctor</p>
                    <p className="text-white">{parsedRecord.doctorName}</p>
                  </div>
                  <div>
                    <p className="text-white/30 text-xs mb-1">Date</p>
                    <p className="text-white">{parsedRecord.date}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-white/30 text-xs mb-1">Diagnosis</p>
                    <p className="text-white/80">{parsedRecord.patientCase}</p>
                  </div>
                </div>
                <div>
                  <p className="text-white/30 text-xs mb-2">
                    Medicines ({parsedRecord.medicines?.length ?? 0})
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {parsedRecord.medicines?.map((m, i) => (
                      <Chip
                        key={i}
                        size="sm"
                        className={cn("border text-xs", CATEGORY_COLORS[m.category])}
                        variant="flat"
                      >
                        {m.name} — {m.dosage}
                      </Chip>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                onClick={handleParse}
                isDisabled={!selectedFile || step === "parsing" || step === "uploading"}
                isLoading={step === "parsing" || step === "uploading"}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold"
                startContent={<Sparkles className="w-4 h-4" />}
              >
                {step === "parsing" ? "Analyzing..." : "Analyze with AI"}
              </Button>

              {step === "done" && parsedRecord && (
                <Button
                  onClick={() => {
                    const pid = patientId.trim().toUpperCase();
                    if (pid && !getPatientById(pid)) {
                      onOpen();
                    } else {
                      handleSaveRecord();
                    }
                  }}
                  className="flex-1 bg-sky-500 hover:bg-sky-600 text-white font-semibold"
                  startContent={<CheckCircle className="w-4 h-4" />}
                >
                  Save to Records
                </Button>
              )}
            </div>
          </div>
        </Tab>

        <Tab key="history" title={`History (${records.length})`}>
          <div className="pt-5 space-y-3">
            {records.length === 0 ? (
              <div className="text-center py-16 text-white/20">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No records found for this Patient ID</p>
                <p className="text-sm mt-1">Upload a prescription to get started</p>
              </div>
            ) : (
              records.map((rec) => (
                <Card
                  key={rec.recordId}
                  className="bg-white/3 border border-white/8 rounded-2xl"
                >
                  <CardBody className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center flex-shrink-0">
                          <Calendar className="w-4 h-4 text-sky-400" />
                        </div>
                        <div>
                          <p className="font-medium text-white text-sm">{formatDate(rec.date)}</p>
                          <p className="text-white/40 text-xs">{rec.doctorName}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Chip size="sm" className="bg-white/5 text-white/50 text-[10px]">
                          {rec.medicines.length} meds
                        </Chip>
                        <button
                          onClick={() => setExpandedId(expandedId === rec.recordId ? null : rec.recordId)}
                          className="p-1 rounded-lg hover:bg-white/10 text-white/30 hover:text-white"
                        >
                          {expandedId === rec.recordId ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {expandedId === rec.recordId && (
                      <div className="mt-4 pt-4 border-t border-white/5 space-y-4">
                        <p className="text-white/60 text-sm">{rec.patientCase}</p>

                        {Object.values(rec.vitalSigns).some(Boolean) && (
                          <div>
                            <p className="text-xs text-white/30 uppercase tracking-wider mb-2">Vital Signs</p>
                            <div className="grid grid-cols-3 gap-2">
                              {rec.vitalSigns.bloodPressure && (
                                <div className="bg-white/5 rounded-lg p-2 text-center">
                                  <p className="text-[10px] text-white/30">BP</p>
                                  <p className="text-xs text-white font-medium">{rec.vitalSigns.bloodPressure}</p>
                                </div>
                              )}
                              {rec.vitalSigns.respiratoryRate && (
                                <div className="bg-white/5 rounded-lg p-2 text-center">
                                  <p className="text-[10px] text-white/30">RR</p>
                                  <p className="text-xs text-white font-medium">{rec.vitalSigns.respiratoryRate}</p>
                                </div>
                              )}
                              {rec.vitalSigns.heartRate && (
                                <div className="bg-white/5 rounded-lg p-2 text-center">
                                  <p className="text-[10px] text-white/30">HR</p>
                                  <p className="text-xs text-white font-medium">{rec.vitalSigns.heartRate}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {rec.medicines.length > 0 && (
                          <div>
                            <p className="text-xs text-white/30 uppercase tracking-wider mb-2 flex items-center gap-1">
                              <Pill className="w-3 h-3" /> Medicines
                            </p>
                            <div className="space-y-1.5">
                              {rec.medicines.map((m, i) => (
                                <div key={i} className="flex items-center justify-between text-xs">
                                  <span className="text-white/70">{m.name}</span>
                                  <div className="flex items-center gap-2">
                                    <span className="text-white/30">{m.dosage} · {m.duration}</span>
                                    <Chip size="sm" className={cn("border text-[10px]", CATEGORY_COLORS[m.category])} variant="flat">
                                      {m.category}
                                    </Chip>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {rec.testResults.length > 0 && (
                          <div>
                            <p className="text-xs text-white/30 uppercase tracking-wider mb-2 flex items-center gap-1">
                              <TestTube className="w-3 h-3" /> Test Results
                            </p>
                            <div className="space-y-1.5">
                              {rec.testResults.map((t, i) => (
                                <div key={i} className="flex items-center justify-between text-xs">
                                  <span className="text-white/70">{t.testName}</span>
                                  <span className="text-sky-400 font-mono">
                                    {t.value} {t.unit}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </CardBody>
                </Card>
              ))
            )}
          </div>
        </Tab>
      </Tabs>

      {/* New Patient Modal */}
      <Modal isOpen={isOpen} onClose={onClose} classNames={{
        base: "bg-[#0d1626] border border-white/10",
        header: "border-b border-white/5",
        footer: "border-t border-white/5",
      }}>
        <ModalContent>
          <ModalHeader className="text-white">Register New Patient</ModalHeader>
          <ModalBody className="space-y-3">
            <p className="text-white/40 text-sm">Patient <strong className="text-white">{patientId}</strong> not found. Please fill in basic details.</p>
            <Input
              label="Full Name" placeholder="Rahim Uddin"
              classNames={{ input: "bg-transparent text-white", inputWrapper: "bg-white/5 border-white/10" }}
              onChange={(e) => setPatientForm((p) => ({ ...p, name: e.target.value }))}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Age" type="number" placeholder="25"
                classNames={{ input: "bg-transparent text-white", inputWrapper: "bg-white/5 border-white/10" }}
                onChange={(e) => setPatientForm((p) => ({ ...p, age: parseInt(e.target.value) }))}
              />
              <Input
                label="Blood Group" placeholder="B+"
                classNames={{ input: "bg-transparent text-white", inputWrapper: "bg-white/5 border-white/10" }}
                onChange={(e) => setPatientForm((p) => ({ ...p, bloodGroup: e.target.value }))}
              />
            </div>
            <Input
              label="Phone" placeholder="01711000000"
              classNames={{ input: "bg-transparent text-white", inputWrapper: "bg-white/5 border-white/10" }}
              onChange={(e) => setPatientForm((p) => ({ ...p, phone: e.target.value }))}
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onClick={onClose} className="text-white/50">Cancel</Button>
            <Button className="bg-emerald-500 text-white" onClick={handleSaveRecord}>
              Register & Save Record
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
