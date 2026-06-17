"use client";

import { useState } from "react";
import {
  Input,
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Tabs,
  Tab,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@nextui-org/react";
import {
  Search,
  Stethoscope,
  Pill,
  TestTube,
  ShieldAlert,
  Sun,
  Zap,
  Flame,
  Activity,
  Calendar,
  ChevronDown,
  ChevronUp,
  User,
} from "lucide-react";
import type { MedicalRecord, Patient, Medicine, MedicineCategory } from "@/types";
import { getRecordsByPatient, getPatientById } from "@/lib/storage";
import { formatDate, CATEGORY_COLORS, cn } from "@/lib/utils";

interface CategoryStat {
  name: MedicineCategory;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
  meds: Medicine[];
}

export default function DoctorPortal() {
  const [searchId, setSearchId] = useState("");
  const [patient, setPatient] = useState<Patient | null>(null);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [notFound, setNotFound] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleSearch = () => {
    const id = searchId.trim().toUpperCase();
    if (!id) return;
    const p = getPatientById(id);
    if (!p) {
      setPatient(null);
      setRecords([]);
      setNotFound(true);
      return;
    }
    setPatient(p);
    setRecords(getRecordsByPatient(id));
    setNotFound(false);
  };

  // Compute analytics
  const allMeds: Medicine[] = records.flatMap((r) => r.medicines);
  const antibiotics = allMeds.filter((m) => m.category === "Antibiotic");
  const vitamins = allMeds.filter((m) => m.category === "Vitamin");
  const calciums = allMeds.filter((m) => m.category === "Calcium");
  const gastrics = allMeds.filter((m) => m.category === "Gastric");
  const allTests = records.flatMap((r) =>
    r.testResults.map((t) => ({ ...t, date: r.date }))
  );

  const categoryStats: CategoryStat[] = [
    {
      name: "Antibiotic",
      icon: <ShieldAlert className="w-4 h-4" />,
      color: "text-red-400",
      bgColor: "bg-red-500/10",
      borderColor: "border-red-500/20",
      meds: antibiotics,
    },
    {
      name: "Vitamin",
      icon: <Sun className="w-4 h-4" />,
      color: "text-yellow-400",
      bgColor: "bg-yellow-500/10",
      borderColor: "border-yellow-500/20",
      meds: vitamins,
    },
    {
      name: "Calcium",
      icon: <Zap className="w-4 h-4" />,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20",
      meds: calciums,
    },
    {
      name: "Gastric",
      icon: <Flame className="w-4 h-4" />,
      color: "text-purple-400",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/20",
      meds: gastrics,
    },
  ];

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center">
            <Stethoscope className="w-5 h-5 text-sky-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Doctor Portal</h1>
            <p className="text-sm text-white/40">Search patient · View lifetime health analytics</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="flex gap-3 mb-6">
        <Input
          placeholder="Enter Patient ID (e.g. PAT-001)"
          value={searchId}
          onChange={(e) => setSearchId(e.target.value.toUpperCase())}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          classNames={{
            input: "bg-transparent text-white placeholder:text-white/20",
            inputWrapper: "bg-white/5 border border-white/10 hover:border-white/20 focus-within:border-sky-500/50",
          }}
          startContent={<Search className="w-4 h-4 text-white/30" />}
        />
        <Button
          onClick={handleSearch}
          className="bg-sky-500 hover:bg-sky-600 text-white font-semibold px-6"
        >
          Search
        </Button>
      </div>

      {notFound && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-6">
          <User className="w-4 h-4" />
          Patient <strong className="mx-1">{searchId}</strong> not found in the system.
        </div>
      )}

      {patient && (
        <div className="space-y-6">
          {/* Patient Card */}
          <Card className="bg-white/3 border border-white/8 rounded-2xl">
            <CardBody className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center">
                    <User className="w-6 h-6 text-sky-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">{patient.name}</h2>
                    <p className="text-white/40 text-sm">
                      {patient.patientId} · {patient.age}y · {patient.gender} · {patient.bloodGroup || "Blood group unknown"}
                    </p>
                    {patient.phone && (
                      <p className="text-white/30 text-xs">{patient.phone}</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-white">{records.length}</p>
                  <p className="text-white/30 text-xs">Consultations</p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-3">
            {categoryStats.map((cat) => (
              <div
                key={cat.name}
                className={cn("rounded-xl border p-4", cat.bgColor, cat.borderColor)}
              >
                <div className={cn("flex items-center gap-2 mb-2", cat.color)}>
                  {cat.icon}
                  <span className="text-xs font-semibold uppercase tracking-wider">{cat.name}</span>
                </div>
                <p className={cn("text-3xl font-bold", cat.color)}>{cat.meds.length}</p>
                <p className="text-white/30 text-xs mt-0.5">lifetime doses</p>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <Tabs
            classNames={{
              tabList: "bg-white/5 border border-white/10 p-1 rounded-xl",
              cursor: "bg-sky-500/20 border border-sky-500/30",
              tab: "text-white/40 data-[selected=true]:text-sky-400",
            }}
          >
            <Tab key="antibiotic" title="Antibiotic Tracker">
              <div className="pt-4 space-y-2">
                {antibiotics.length === 0 ? (
                  <p className="text-white/20 text-sm text-center py-8">No antibiotic history found</p>
                ) : (
                  <>
                    <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/15 text-xs text-red-400/70 mb-4">
                      ⚠️ Total {antibiotics.length} antibiotic doses across {records.filter((r) => r.medicines.some((m) => m.category === "Antibiotic")).length} consultations
                    </div>
                    {records
                      .filter((r) => r.medicines.some((m) => m.category === "Antibiotic"))
                      .map((rec) => (
                        <div key={rec.recordId} className="flex items-start justify-between p-3 rounded-xl bg-white/3 border border-white/8">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 text-white/30 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-white/60 text-xs">{formatDate(rec.date)}</p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {rec.medicines
                                  .filter((m) => m.category === "Antibiotic")
                                  .map((m, i) => (
                                    <Chip key={i} size="sm" className="bg-red-500/10 text-red-400 border border-red-500/20 text-[10px]" variant="flat">
                                      {m.name} {m.dosage}
                                    </Chip>
                                  ))}
                              </div>
                            </div>
                          </div>
                          <p className="text-white/30 text-xs">{rec.doctorName}</p>
                        </div>
                      ))}
                  </>
                )}
              </div>
            </Tab>

            <Tab key="medications" title="All Medications">
              <div className="pt-4 space-y-4">
                {categoryStats.map((cat) => (
                  <div key={cat.name}>
                    <div className={cn("flex items-center gap-2 mb-2 text-sm font-semibold", cat.color)}>
                      {cat.icon} {cat.name}s ({cat.meds.length})
                    </div>
                    {cat.meds.length === 0 ? (
                      <p className="text-white/20 text-xs pl-6 mb-3">None prescribed</p>
                    ) : (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {cat.meds.map((m, i) => (
                          <Chip key={i} size="sm" className={cn("border text-[10px]", CATEGORY_COLORS[m.category])} variant="flat">
                            {m.name} — {m.dosage}
                          </Chip>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Tab>

            <Tab key="tests" title="Test History">
              <div className="pt-4">
                {allTests.length === 0 ? (
                  <p className="text-white/20 text-sm text-center py-8">No test results found</p>
                ) : (
                  <Table
                    classNames={{
                      base: "bg-transparent",
                      th: "bg-white/5 text-white/40 text-xs font-medium",
                      td: "text-white/70 text-sm border-t border-white/5",
                    }}
                  >
                    <TableHeader>
                      <TableColumn>DATE</TableColumn>
                      <TableColumn>TEST</TableColumn>
                      <TableColumn>VALUE</TableColumn>
                      <TableColumn>UNIT</TableColumn>
                      <TableColumn>REFERENCE</TableColumn>
                    </TableHeader>
                    <TableBody>
                      {allTests.map((t, i) => (
                        <TableRow key={i}>
                          <TableCell>{formatDate(t.date)}</TableCell>
                          <TableCell>{t.testName}</TableCell>
                          <TableCell>
                            <span className="font-mono text-sky-400">{t.value}</span>
                          </TableCell>
                          <TableCell>{t.unit || "—"}</TableCell>
                          <TableCell className="text-white/30">{t.referenceRange || "—"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </Tab>

            <Tab key="timeline" title="Consultation Log">
              <div className="pt-4 space-y-3">
                {records.map((rec) => (
                  <Card key={rec.recordId} className="bg-white/3 border border-white/8 rounded-2xl">
                    <CardBody className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center flex-shrink-0">
                            <Activity className="w-4 h-4 text-sky-400" />
                          </div>
                          <div>
                            <p className="text-white font-medium text-sm">{formatDate(rec.date)}</p>
                            <p className="text-white/40 text-xs">{rec.doctorName}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setExpandedId(expandedId === rec.recordId ? null : rec.recordId)}
                          className="p-1 rounded-lg hover:bg-white/10 text-white/30 hover:text-white"
                        >
                          {expandedId === rec.recordId ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>

                      {expandedId === rec.recordId && (
                        <div className="mt-4 pt-4 border-t border-white/5 space-y-3">
                          <p className="text-white/60 text-sm">{rec.patientCase}</p>
                          <div className="grid grid-cols-3 gap-2">
                            {rec.vitalSigns.bloodPressure && (
                              <div className="bg-white/5 rounded-lg p-2 text-center">
                                <p className="text-[10px] text-white/30">BP</p>
                                <p className="text-xs text-white">{rec.vitalSigns.bloodPressure}</p>
                              </div>
                            )}
                            {rec.vitalSigns.respiratoryRate && (
                              <div className="bg-white/5 rounded-lg p-2 text-center">
                                <p className="text-[10px] text-white/30">RR</p>
                                <p className="text-xs text-white">{rec.vitalSigns.respiratoryRate}</p>
                              </div>
                            )}
                            {rec.vitalSigns.heartRate && (
                              <div className="bg-white/5 rounded-lg p-2 text-center">
                                <p className="text-[10px] text-white/30">HR</p>
                                <p className="text-xs text-white">{rec.vitalSigns.heartRate}</p>
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="text-xs text-white/30 mb-2 flex items-center gap-1"><Pill className="w-3 h-3" /> Medications</p>
                            <div className="space-y-1">
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
                          {rec.testResults.length > 0 && (
                            <div>
                              <p className="text-xs text-white/30 mb-2 flex items-center gap-1"><TestTube className="w-3 h-3" /> Tests</p>
                              <div className="space-y-1">
                                {rec.testResults.map((t, i) => (
                                  <div key={i} className="flex justify-between text-xs">
                                    <span className="text-white/70">{t.testName}</span>
                                    <span className="text-sky-400 font-mono">{t.value} {t.unit}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </CardBody>
                  </Card>
                ))}
              </div>
            </Tab>
          </Tabs>
        </div>
      )}

      {!patient && !notFound && (
        <div className="text-center py-20 text-white/15">
          <Stethoscope className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <p className="text-lg">Enter a Patient ID to view their health analytics</p>
          <p className="text-sm mt-1">Try PAT-001 after loading mock data from Admin panel</p>
        </div>
      )}
    </div>
  );
}
