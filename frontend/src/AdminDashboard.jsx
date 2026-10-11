import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  ArrowLeft,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Search,
  ShieldCheck,
  Stethoscope,
  UserRound,
  Users,
} from "lucide-react";
import doctors from "./data/doctor";
import logo from "./assets/logo/medivoice-logo.png";

function readCompletedCases() {
  try {
    return JSON.parse(localStorage.getItem("medivoice_completed_cases") || "[]");
  } catch {
    return [];
  }
}

function archiveCurrentCompletedCase() {
  try {
    const raw = localStorage.getItem("medivoice_patient_case");
    if (!raw) return;
    const current = JSON.parse(raw);
    if (current?.status !== "CONSULTATION_COMPLETED") return;

    const existing = readCompletedCases();
    const withoutDuplicate = existing.filter(
      (item) => String(item.id) !== String(current.id)
    );
    localStorage.setItem(
      "medivoice_completed_cases",
      JSON.stringify([...withoutDuplicate, current])
    );
  } catch (error) {
    console.error("Admin Archive Error:", error);
  }
}

function formatDate(value) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

function severityClass(value) {
  const level = String(value || "LOW").toUpperCase();
  if (level === "CRITICAL") return "border-red-200 bg-red-50 text-red-700";
  if (level === "HIGH") return "border-orange-200 bg-orange-50 text-orange-700";
  if (level === "MODERATE") return "border-amber-200 bg-amber-50 text-amber-700";
  return "border-emerald-200 bg-emerald-50 text-emerald-700";
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [completedCases, setCompletedCases] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCase, setSelectedCase] = useState(null);

  const refresh = () => {
    archiveCurrentCompletedCase();
    setCompletedCases(readCompletedCases());
  };

  useEffect(() => {
    refresh();
    window.addEventListener("storage", refresh);
    window.addEventListener("medivoice-admin-updated", refresh);
    window.addEventListener("medivoice-case-updated", refresh);
    const timer = window.setInterval(refresh, 1000);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("medivoice-admin-updated", refresh);
      window.removeEventListener("medivoice-case-updated", refresh);
      window.clearInterval(timer);
    };
  }, []);

  const filteredCases = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return completedCases;
    return completedCases.filter((item) => {
      const patient = item.patient || {};
      const doctor = item.careDestination?.doctor || {};
      return [
        patient.name,
        patient.phone,
        doctor.name,
        doctor.department,
        item.careDestination?.department,
      ].some((value) => String(value || "").toLowerCase().includes(query));
    });
  }, [completedCases, search]);

  const activeDoctors = doctors.length;
  const releasedDoctors = new Set(
    completedCases
      .map((item) => item.careDestination?.doctor?.id)
      .filter(Boolean)
  ).size;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#eefaff] via-white to-[#eef8f8] px-4 py-6 text-slate-900 sm:px-6 lg:py-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex items-center justify-between gap-4">
          <button type="button" onClick={() => navigate("/roles")} className="flex items-center gap-3">
            <img src={logo} alt="MediVoice AI" className="h-12 w-12 rounded-2xl bg-white p-1 shadow-sm" />
            <div className="text-left">
              <h1 className="text-xl font-black text-[#12213d]">Medi<span className="text-blue-600">Voice</span> <span className="text-cyan-500">AI</span></h1>
              <p className="text-[9px] font-black tracking-[0.2em] text-slate-400">ADMIN OPERATIONS</p>
            </div>
          </button>
          <div className="hidden items-center gap-2 rounded-full border border-emerald-100 bg-white px-4 py-2 text-xs font-black text-emerald-700 shadow-sm sm:flex">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" /> SYSTEM ONLINE
          </div>
        </header>

        <section className="overflow-hidden rounded-[2rem] border border-white bg-white shadow-[0_25px_80px_rgba(25,90,120,0.14)]">
          <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-900 px-6 py-10 text-white sm:px-10 lg:px-12">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-2 text-xs font-black tracking-wider text-indigo-100">
                  <ShieldCheck className="h-4 w-4" /> HOSPITAL ADMIN
                </div>
                <h2 className="text-3xl font-black tracking-tight sm:text-5xl">Hospital Operations</h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
                  Completed consultations are transferred here as patient records, while the doctor queue is released for the next case.
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/10 px-5 py-4">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-indigo-200">Completed Records</p>
                <p className="mt-1 text-3xl font-black">{completedCases.length}</p>
              </div>
            </div>
          </div>

          <div className="p-5 sm:p-8 lg:p-10">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Stat icon={Users} label="Patient Records" value={completedCases.length} />
              <Stat icon={Stethoscope} label="Doctors" value={activeDoctors} />
              <Stat icon={CheckCircle2} label="Completed" value={completedCases.length} />
              <Stat icon={Activity} label="Released Doctors" value={releasedDoctors} />
            </div>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">Patient Records</p>
                <h3 className="mt-1 text-2xl font-black text-[#12213d]">Completed consultations</h3>
              </div>
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search patient or doctor" className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm font-semibold outline-none transition focus:border-indigo-300 focus:bg-white" />
              </div>
            </div>

            {filteredCases.length === 0 ? (
              <div className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-16 text-center">
                <ClipboardList className="mx-auto h-10 w-10 text-slate-400" />
                <h4 className="mt-4 text-xl font-black text-slate-800">No completed patient records</h4>
                <p className="mt-2 text-sm text-slate-500">When a doctor marks a consultation completed, the case will appear here automatically.</p>
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                {filteredCases.map((item) => {
                  const patient = item.patient || {};
                  const doctor = item.careDestination?.doctor || {};
                  const severity = item.aiAnalysis?.severity || "LOW";
                  return (
                    <article key={item.id} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex min-w-0 gap-4">
                          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600"><UserRound className="h-7 w-7" /></div>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h4 className="text-lg font-black text-[#12213d]">{patient.name || "Unknown Patient"}</h4>
                              <span className={`rounded-full border px-2.5 py-1 text-[10px] font-black uppercase ${severityClass(severity)}`}>{severity}</span>
                              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-black text-emerald-700">COMPLETED</span>
                            </div>
                            <p className="mt-1 text-sm font-semibold text-slate-500">{patient.age || "—"} yrs • {patient.gender || "—"} • {patient.bloodGroup || "Blood group not provided"}</p>
                            <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold text-slate-600">
                              <span className="rounded-xl bg-slate-100 px-3 py-2">{doctor.name || "Doctor not recorded"}</span>
                              <span className="rounded-xl bg-slate-100 px-3 py-2">{item.careDestination?.department || doctor.department || "Department —"}</span>
                              <span className="rounded-xl bg-slate-100 px-3 py-2">Room {doctor.room || "—"}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center">
                          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400"><Clock3 className="h-4 w-4" /> {formatDate(item.completedAt || item.statusUpdatedAt)}</div>
                          <button type="button" onClick={() => setSelectedCase(item)} className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white transition hover:bg-indigo-600">View Full Record</button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </div>

      {selectedCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[2rem] bg-white p-6 shadow-2xl sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-indigo-600">Medical Record</p>
                <h3 className="mt-1 text-2xl font-black text-[#12213d]">{selectedCase.patient?.name || "Unknown Patient"}</h3>
              </div>
              <button type="button" onClick={() => setSelectedCase(null)} className="rounded-xl bg-slate-100 px-3 py-2 text-sm font-black text-slate-600">Close</button>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Info label="Age / Gender" value={`${selectedCase.patient?.age || "—"} / ${selectedCase.patient?.gender || "—"}`} />
              <Info label="Blood Group" value={selectedCase.patient?.bloodGroup || "Not provided"} />
              <Info label="Mobile" value={selectedCase.patient?.phone || "Not provided"} />
              <Info label="Doctor" value={selectedCase.careDestination?.doctor?.name || "Not recorded"} />
              <Info label="Department" value={selectedCase.careDestination?.department || "Not recorded"} />
              <Info label="Room" value={selectedCase.careDestination?.doctor?.room || "Not recorded"} />
            </div>
            <div className="mt-4 rounded-2xl bg-slate-50 p-5">
              <p className="text-xs font-black uppercase tracking-wider text-slate-400">Existing Conditions</p>
              <p className="mt-2 text-sm font-semibold text-slate-700">{Array.isArray(selectedCase.patient?.conditions) ? selectedCase.patient.conditions.join(", ") : "Not provided"}</p>
            </div>
            <div className="mt-4 rounded-2xl bg-slate-50 p-5">
              <p className="text-xs font-black uppercase tracking-wider text-slate-400">Reported Symptoms</p>
              <p className="mt-2 text-sm leading-6 text-slate-700">{selectedCase.symptomsText || "No symptom description provided."}</p>
            </div>
            <div className="mt-4 rounded-2xl border border-indigo-100 bg-indigo-50/60 p-5">
              <p className="text-xs font-black uppercase tracking-wider text-indigo-600">AI Triage Summary</p>
              <p className="mt-2 text-sm leading-6 text-slate-700">{selectedCase.aiAnalysis?.nextStep || "No recommendation recorded."}</p>
              {selectedCase.aiAnalysis?.emergency && <p className="mt-3 text-sm font-bold text-red-700">{selectedCase.aiAnalysis.emergency}</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ icon: Icon, label, value }) {
  return <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><div className="flex items-center justify-between"><span className="text-xs font-black uppercase tracking-wider text-slate-400">{label}</span><Icon className="h-5 w-5 text-indigo-500" /></div><p className="mt-2 text-3xl font-black text-[#12213d]">{value}</p></div>;
}

function Info({ label, value }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-4"><p className="text-[10px] font-black uppercase tracking-wider text-slate-400">{label}</p><p className="mt-1 text-sm font-black text-slate-800">{value}</p></div>;
}
