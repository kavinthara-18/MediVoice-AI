import { useEffect, useMemo, useState } from "react";
import doctors from "../data/doctor";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Brain,
  CheckCircle2,
  Clock3,
  HeartPulse,
  ShieldAlert,
  UserRound,
  X,
} from "lucide-react";

function severityStyle(severity) {
  const value = String(severity || "LOW").toUpperCase();

  if (value === "CRITICAL") {
    return {
      badge: "bg-red-50 text-red-700 border-red-200",
      icon: "text-red-600",
      card: "border-red-200",
    };
  }

  if (value === "HIGH") {
    return {
      badge: "bg-orange-50 text-orange-700 border-orange-200",
      icon: "text-orange-600",
      card: "border-orange-200",
    };
  }

  if (value === "MODERATE") {
    return {
      badge: "bg-amber-50 text-amber-700 border-amber-200",
      icon: "text-amber-600",
      card: "border-amber-200",
    };
  }

  return {
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: "text-emerald-600",
    card: "border-emerald-200",
  };
}

function formatTime(isoTime) {
  if (!isoTime) return "Just now";

  const date = new Date(isoTime);
  if (Number.isNaN(date.getTime())) return "Just now";

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function normalizeSymptoms(symptoms) {
  if (!Array.isArray(symptoms)) return [];

  return symptoms
    .map((item) => {
      if (typeof item === "string") return item;

      if (item && typeof item === "object") {
        return item.symptom || item.name || "";
      }

      return "";
    })
    .filter(Boolean);
}

function getRecommendedDepartment(nextStep, severity, symptoms) {
  const text = `${nextStep || ""} ${severity || ""} ${(symptoms || []).join(" ")}`.toLowerCase();

  if (
    String(severity).toUpperCase() === "CRITICAL" ||
    text.includes("emergency") ||
    text.includes("critical")
  ) {
    return "Emergency Medicine";
  }

  if (
    text.includes("cardio") ||
    text.includes("chest pain") ||
    text.includes("heart")
  ) {
    return "Cardiologist";
  }

  if (
    text.includes("pulmon") ||
    text.includes("breath") ||
    text.includes("cough") ||
    text.includes("asthma")
  ) {
    return "Pulmonologist";
  }

  if (
    text.includes("dental") ||
    text.includes("tooth") ||
    text.includes("teeth") ||
    text.includes("gum") ||
    text.includes("endodont")
  ) {
    return "Endodontist";
  }

  if (
    text.includes("gynec") ||
    text.includes("gynac") ||
    text.includes("pregnan") ||
    text.includes("period") ||
    text.includes("menstrual")
  ) {
    return "Gynacologist";
  }

  // No Neurologist or Dermatologist is currently present in the doctor
  // database, so these cases fall back to General Medicine.
  if (
    text.includes("neuro") ||
    text.includes("headache") ||
    text.includes("migraine") ||
    text.includes("dizziness") ||
    text.includes("dermat") ||
    text.includes("skin") ||
    text.includes("rash") ||
    text.includes("itch")
  ) {
    return "General Medicine";
  }

  return "General Medicine";
}

function findAvailableDoctor(department) {
  return (
    doctors.find(
      (doctor) =>
        doctor.department.toLowerCase() === department.toLowerCase() &&
        doctor.status === "AVAILABLE"
    ) ||
    doctors.find(
      (doctor) => doctor.department.toLowerCase() === department.toLowerCase()
    ) ||
    null
  );
}

function getPatientCase() {
  try {
    const savedCase = localStorage.getItem("medivoice_patient_case");

    if (!savedCase) return null;

    const parsedCase = JSON.parse(savedCase);

    if (!parsedCase || typeof parsedCase !== "object") return null;

    return parsedCase;
  } catch (error) {
    console.error("Doctor Dashboard Case Error:", error);
    return null;
  }
}

function updateCaseStatus(nextStatus) {
  try {
    const savedCase = localStorage.getItem("medivoice_patient_case");
    if (!savedCase) return;

    const parsedCase = JSON.parse(savedCase);
    const now = new Date().toISOString();

    const updatedCase = {
      ...parsedCase,
      status: nextStatus,
      statusUpdatedAt: now,
    };

    // When consultation is completed, archive the case for Admin and
    // release the doctor/room from the active queue.
    if (nextStatus === "CONSULTATION_COMPLETED") {
      const existingCompleted = JSON.parse(
        localStorage.getItem("medivoice_completed_cases") || "[]"
      );

      const completedCase = {
        ...updatedCase,
        completedAt: now,
        releasedDoctor: updatedCase.careDestination?.doctor || null,
      };

      const withoutDuplicate = existingCompleted.filter(
        (item) => String(item.id) !== String(completedCase.id)
      );

      localStorage.setItem(
        "medivoice_completed_cases",
        JSON.stringify([...withoutDuplicate, completedCase])
      );

      // Keep the current case briefly available for the patient status screen,
      // while the Doctor Dashboard filters completed cases out of its queue.
    }

    localStorage.setItem(
      "medivoice_patient_case",
      JSON.stringify(updatedCase)
    );

    window.dispatchEvent(new Event("medivoice-case-updated"));
    window.dispatchEvent(new Event("medivoice-admin-updated"));
  } catch (error) {
    console.error("Case Status Update Error:", error);
  }
}

function getStatusLabel(status) {
  return String(status || "WAITING_FOR_DOCTOR")
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function DoctorSelection() {
  const [patientCase, setPatientCase] = useState(null);
  const [selectedCase, setSelectedCase] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  useEffect(() => {
    const loadCase = () => {
      setPatientCase(getPatientCase());

      try {
        const savedDoctor = localStorage.getItem("medivoice_selected_doctor");
        setSelectedDoctor(savedDoctor ? JSON.parse(savedDoctor) : null);
      } catch (error) {
        console.error("Selected Doctor Error:", error);
        setSelectedDoctor(null);
      }
    };

    loadCase();

    window.addEventListener("storage", loadCase);
    window.addEventListener("medivoice-case-updated", loadCase);

    return () => {
      window.removeEventListener("storage", loadCase);
      window.removeEventListener("medivoice-case-updated", loadCase);
    };
  }, []);

  const patients = useMemo(() => {
    if (!patientCase) return [];

    const aiAnalysis = patientCase.aiAnalysis || {};
    const patient = patientCase.patient || {};

    const symptoms = normalizeSymptoms(aiAnalysis.symptoms);

    return [
      {
        id: patientCase.id || Date.now(),
        name: patient.name || "Unknown Patient",
        age: patient.age || "N/A",
        gender: patient.gender || "Not provided",
        phone: patient.phone || "Not provided",
        bloodGroup: patient.bloodGroup || "Not provided",
        conditions: Array.isArray(patient.conditions)
          ? patient.conditions
          : ["Not provided"],
        otherCondition: patient.otherCondition || "",
        symptoms,
        spokenSymptoms:
          patientCase.symptomsText || "No symptom description provided.",
        severity: String(aiAnalysis.severity || "LOW").toUpperCase(),
        nextStep:
          aiAnalysis.nextStep ||
          "Clinical assessment recommended.",
        emergency:
          aiAnalysis.emergency ||
          "No emergency warning provided.",
        conditionsDetected: Array.isArray(aiAnalysis.conditions)
          ? aiAnalysis.conditions
          : [],
        recommendedDepartment: getRecommendedDepartment(
          aiAnalysis.nextStep,
          aiAnalysis.severity,
          symptoms
        ),
        time: formatTime(patientCase.createdAt),
        status: patientCase.status || "WAITING_FOR_DOCTOR",
      },
    ];
  }, [patientCase]);

  const routedPatients = useMemo(() => {
    if (!selectedDoctor) return [];

    return patients
      .map((patient) => {
        const storedAssignment = patientCase?.careDestination?.doctor || null;

        const assignedDoctor =
          storedAssignment ||
          findAvailableDoctor(patient.recommendedDepartment);

        return {
          ...patient,
          assignedDoctor,
        };
      })
      .filter(
        (patient) =>
          patient.assignedDoctor &&
          String(patient.assignedDoctor.id) === String(selectedDoctor.id) &&
          patient.status !== "CONSULTATION_COMPLETED"
      );
  }, [patients, patientCase, selectedDoctor]);

  const criticalCases = routedPatients.filter(
    (patient) => patient.severity === "CRITICAL"
  ).length;

  const highCases = routedPatients.filter(
    (patient) => patient.severity === "HIGH"
  ).length;

  const priorityCases = routedPatients.filter(
    (patient) =>
      patient.severity === "CRITICAL" ||
      patient.severity === "HIGH" ||
      patient.severity === "MODERATE"
  ).length;

  return (
    <div className="min-h-screen bg-[#f4fbfc] text-slate-900">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-50">
              <HeartPulse className="h-6 w-6 text-cyan-600" />
            </div>

            <div>
              <h1 className="text-xl font-black tracking-tight sm:text-2xl">
                MediVoice <span className="text-cyan-600">AI</span>
              </h1>
              <p className="text-xs font-medium text-slate-500">
                Intelligent Healthcare Routing
              </p>
            </div>
          </div>

          <div className="hidden items-center gap-3 sm:flex">
            <div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              System Online
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5">
              <UserRound className="h-4 w-4 text-slate-500" />
              <span className="text-sm font-semibold">{selectedDoctor?.name || "Doctor Desk"}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto w-full max-w-6xl px-4 py-7 sm:px-6 lg:px-8 lg:py-9">
        {/* Title */}
        <section className="mb-7">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-cyan-700">
            <Activity className="h-3.5 w-3.5" />
            Live Patient Queue
          </div>

          <h2 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl lg:text-[2.6rem]">
            {selectedDoctor ? `Good morning, ${selectedDoctor.name}.` : "Good morning, Doctor."}
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
            Review AI-triaged patient cases and prioritize care based on
            clinical urgency.
          </p>
        </section>

        {/* Stats */}
        <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="mb-4 flex items-center justify-between">
              <div className="rounded-2xl bg-slate-100 p-3">
                <UserRound className="h-5 w-5 text-slate-600" />
              </div>
              <span className="text-xs font-bold text-emerald-600">
                Live
              </span>
            </div>

            <p className="text-3xl font-black">{patients.length}</p>
            <p className="mt-1 text-sm font-medium text-slate-500">
              Total patients
            </p>
          </div>

          <div className="rounded-[1.5rem] border border-red-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="mb-4 flex items-center justify-between">
              <div className="rounded-2xl bg-red-50 p-3">
                <ShieldAlert className="h-5 w-5 text-red-600" />
              </div>
              <span className="text-xs font-bold text-red-600">
                Immediate
              </span>
            </div>

            <p className="text-3xl font-black">{criticalCases}</p>
            <p className="mt-1 text-sm font-medium text-slate-500">
              Critical cases
            </p>
          </div>

          <div className="rounded-[1.5rem] border border-orange-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="mb-4 flex items-center justify-between">
              <div className="rounded-2xl bg-orange-50 p-3">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
              </div>
              <span className="text-xs font-bold text-orange-600">
                High Priority
              </span>
            </div>

            <p className="text-3xl font-black">{highCases}</p>
            <p className="mt-1 text-sm font-medium text-slate-500">
              High cases
            </p>
          </div>

          <div className="rounded-[1.5rem] border border-cyan-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="mb-4 flex items-center justify-between">
              <div className="rounded-2xl bg-cyan-50 p-3">
                <Brain className="h-5 w-5 text-cyan-600" />
              </div>
              <span className="text-xs font-bold text-cyan-600">
                AI Assisted
              </span>
            </div>

            <p className="text-3xl font-black">{priorityCases}</p>
            <p className="mt-1 text-sm font-medium text-slate-500">
              Cases requiring review
            </p>
          </div>
        </section>

        {/* Queue */}
        <section>
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-black sm:text-2xl">
                Patient Cases
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Patient cases assigned to your doctor profile
              </p>
            </div>

            <div className="hidden items-center gap-2 text-sm font-semibold text-slate-500 sm:flex">
              <Clock3 className="h-4 w-4" />
              Live queue
            </div>
          </div>

          {!selectedDoctor ? (
            <div className="rounded-3xl border border-dashed border-amber-300 bg-amber-50 px-6 py-16 text-center shadow-sm">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-white">
                <UserRound className="h-8 w-8 text-amber-600" />
              </div>

              <h4 className="mt-5 text-xl font-black text-amber-900">
                No doctor profile selected
              </h4>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-amber-800">
                Return to Doctor Access and select your doctor profile to open your personal patient queue.
              </p>
            </div>
          ) : routedPatients.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-cyan-50">
                <UserRound className="h-8 w-8 text-cyan-600" />
              </div>

              <h4 className="mt-5 text-xl font-black">
                No cases assigned to you
              </h4>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Once a patient completes the voice assessment and sends their
                case to the doctor, it will appear here automatically.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {routedPatients.map((patient) => {
                const style = severityStyle(patient.severity);

                return (
                  <article
                    key={patient.id}
                    className={`overflow-hidden rounded-[1.75rem] border ${style.card} bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-lg sm:p-6`}
                  >
                    <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
                      {/* Patient info */}
                      <div className="flex min-w-0 gap-4">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-cyan-100 bg-cyan-50 shadow-sm">
                          <UserRound className="h-7 w-7 text-cyan-600" />
                        </div>

                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="text-lg font-black">
                              {patient.name}
                            </h4>

                            <span className="text-sm text-slate-400">
                              Age {patient.age}
                            </span>

                            <span
                              className={`rounded-full border px-2.5 py-1 text-[10px] font-black tracking-wider ${style.badge}`}
                            >
                              {patient.severity}
                            </span>
                          </div>

                          <p className="mt-1 text-xs font-medium text-slate-400">
                            Received {patient.time}
                          </p>

                          {/* Symptoms */}
                          <div className="mt-4 flex flex-wrap gap-2">
                            {patient.symptoms.length > 0 ? (
                              patient.symptoms.map((symptom, index) => (
                                <span
                                  key={`${symptom}-${index}`}
                                  className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700"
                                >
                                  {symptom}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-slate-400">
                                Symptoms not parsed
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right side */}
                      <div className="w-full min-w-0">
                        {patient.assignedDoctor ? (
                          <div className="mb-4 rounded-[1.35rem] border border-cyan-100 bg-gradient-to-br from-cyan-50 to-white p-4 shadow-sm">
                            <div className="mb-3 flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2">
                                <UserRound className="h-4 w-4 text-cyan-600" />
                                <span className="text-xs font-black uppercase tracking-wider text-cyan-700">
                                  Care Destination
                                </span>
                              </div>

                              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-black uppercase text-emerald-600">
                                {patient.assignedDoctor.status}
                              </span>
                            </div>

                            <p className="text-sm font-black text-slate-800">
                              {patient.assignedDoctor.name}
                            </p>

                            <p className="mt-1 text-xs font-semibold text-slate-500">
                              {patient.assignedDoctor.department}
                            </p>

                            <div className="mt-3 grid grid-cols-2 gap-2">
                              <div className="rounded-xl bg-white p-2.5">
                                <p className="text-[10px] font-bold uppercase text-slate-400">
                                  Room
                                </p>
                                <p className="mt-0.5 text-sm font-black text-slate-800">
                                  {patient.assignedDoctor.room}
                                </p>
                              </div>

                              <div className="rounded-xl bg-white p-2.5">
                                <p className="text-[10px] font-bold uppercase text-slate-400">
                                  Floor
                                </p>
                                <p className="mt-0.5 text-sm font-black text-slate-800">
                                  {patient.assignedDoctor.floor}
                                </p>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="mb-4 rounded-2xl border border-amber-100 bg-amber-50 p-4">
                            <p className="text-xs font-bold text-amber-700">
                              No available doctor found for this department.
                            </p>
                          </div>
                        )}

                        <div className="space-y-3">
                          <button
                            type="button"
                            onClick={() => setSelectedCase(patient)}
                            className="group flex min-h-14 w-full items-center justify-center gap-3 rounded-[1.1rem] bg-slate-950 px-5 py-4 text-sm font-black text-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-cyan-700 hover:shadow-lg sm:text-base"
                          >
                            View Patient Case
                            <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
                          </button>

                          {patient.status === "WAITING_FOR_DOCTOR" && (
                            <button
                              type="button"
                              onClick={() => updateCaseStatus("DOCTOR_ACCEPTED")}
                              className="flex min-h-14 w-full items-center justify-center rounded-[1.1rem] border-2 border-cyan-200 bg-cyan-600 px-5 py-4 text-base font-black text-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-cyan-700 hover:shadow-lg"
                            >
                              Accept Case
                            </button>
                          )}

                          {patient.status === "DOCTOR_ACCEPTED" && (
                            <button
                              type="button"
                              onClick={() => updateCaseStatus("IN_CONSULTATION")}
                              className="flex min-h-14 w-full items-center justify-center rounded-[1.1rem] border-2 border-indigo-200 bg-indigo-600 px-5 py-4 text-base font-black text-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-indigo-700 hover:shadow-lg"
                            >
                              Start Consultation
                            </button>
                          )}

                          {patient.status === "IN_CONSULTATION" && (
                            <button
                              type="button"
                              onClick={() => updateCaseStatus("CONSULTATION_COMPLETED")}
                              className="flex min-h-14 w-full items-center justify-center rounded-[1.1rem] border-2 border-emerald-200 bg-emerald-600 px-5 py-4 text-base font-black text-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-lg"
                            >
                              Mark Consultation Completed
                            </button>
                          )}

                          {patient.status === "CONSULTATION_COMPLETED" && (
                            <div className="flex min-h-14 w-full items-center justify-center rounded-2xl border-2 border-emerald-200 bg-emerald-50 px-5 py-4 text-base font-black text-emerald-700">
                              ✓ Consultation Completed
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* Footer note */}
        <div className="mt-7 flex items-start gap-3 rounded-2xl border border-cyan-100 bg-cyan-50/60 p-4">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-cyan-600" />

          <p className="text-xs leading-5 text-slate-600 sm:text-sm">
            <span className="font-bold text-slate-800">
              AI-assisted triage:
            </span>{" "}
            These recommendations are preliminary and should support—not
            replace—professional clinical judgment.
          </p>
        </div>
      </main>

      {/* Patient Case Modal */}
      {selectedCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
            <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4 sm:px-7">
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-cyan-600">
                  Patient Case
                </p>
                <h3 className="mt-1 text-xl font-black">
                  {selectedCase.name}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setSelectedCase(null)}
                className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                aria-label="Close patient case"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-5 p-5 sm:p-7">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-bold text-slate-400">Age</p>
                  <p className="mt-1 font-black">{selectedCase.age}</p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-bold text-slate-400">Gender</p>
                  <p className="mt-1 font-black">{selectedCase.gender}</p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-bold text-slate-400">
                    Blood Group
                  </p>
                  <p className="mt-1 font-black">
                    {selectedCase.bloodGroup}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs font-bold text-slate-400">Phone</p>
                  <p className="mt-1 break-all font-black">
                    {selectedCase.phone}
                  </p>
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs font-black uppercase tracking-wider text-slate-400">
                  Existing Medical Conditions
                </p>

                <div className="flex flex-wrap gap-2">
                  {selectedCase.conditions.map((condition, index) => (
                    <span
                      key={`${condition}-${index}`}
                      className="rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700"
                    >
                      {condition}
                    </span>
                  ))}

                  {selectedCase.otherCondition && (
                    <span className="rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700">
                      {selectedCase.otherCondition}
                    </span>
                  )}
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <p className="text-xs font-black uppercase tracking-wider text-slate-400">
                    AI Severity
                  </p>

                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-black ${severityStyle(
                      selectedCase.severity
                    ).badge}`}
                  >
                    {selectedCase.severity}
                  </span>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="mb-2 text-xs font-black uppercase tracking-wider text-slate-400">
                  Patient's Reported Symptoms
                </p>
                <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">
                  {selectedCase.spokenSymptoms}
                </p>
              </div>

              {selectedCase.conditionsDetected.length > 0 && (
                <div className="rounded-2xl border border-cyan-100 bg-cyan-50/50 p-4">
                  <p className="mb-2 text-xs font-black uppercase tracking-wider text-cyan-700">
                    Possible Conditions
                  </p>

                  <ul className="space-y-1 text-sm text-slate-700">
                    {selectedCase.conditionsDetected.map(
                      (condition, index) => (
                        <li key={`${condition}-${index}`}>• {condition}</li>
                      )
                    )}
                  </ul>
                </div>
              )}

              {selectedCase.assignedDoctor && (
                <div className="rounded-2xl border border-cyan-200 bg-cyan-50 p-4">
                  <p className="mb-3 text-xs font-black uppercase tracking-wider text-cyan-700">
                    Doctor & Room Assignment
                  </p>

                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-xl bg-white p-3">
                      <p className="text-[10px] font-bold uppercase text-slate-400">
                        Doctor
                      </p>
                      <p className="mt-1 text-sm font-black text-slate-800">
                        {selectedCase.assignedDoctor.name}
                      </p>
                    </div>

                    <div className="rounded-xl bg-white p-3">
                      <p className="text-[10px] font-bold uppercase text-slate-400">
                        Department
                      </p>
                      <p className="mt-1 text-sm font-black text-slate-800">
                        {selectedCase.assignedDoctor.department}
                      </p>
                    </div>

                    <div className="rounded-xl bg-white p-3">
                      <p className="text-[10px] font-bold uppercase text-slate-400">
                        Room
                      </p>
                      <p className="mt-1 text-sm font-black text-slate-800">
                        {selectedCase.assignedDoctor.room}
                      </p>
                    </div>

                    <div className="rounded-xl bg-white p-3">
                      <p className="text-[10px] font-bold uppercase text-slate-400">
                        Floor
                      </p>
                      <p className="mt-1 text-sm font-black text-slate-800">
                        {selectedCase.assignedDoctor.floor}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-wider text-slate-400">
                      Case Status
                    </p>
                    <p className="mt-1 text-sm font-black text-slate-800">
                      {getStatusLabel(selectedCase.status)}
                    </p>
                  </div>

                  {selectedCase.status === "WAITING_FOR_DOCTOR" && (
                    <button
                      type="button"
                      onClick={() => {
                        updateCaseStatus("DOCTOR_ACCEPTED");
                        setSelectedCase((current) =>
                          current
                            ? { ...current, status: "DOCTOR_ACCEPTED" }
                            : current
                        );
                      }}
                      className="rounded-2xl bg-cyan-600 px-5 py-3 text-sm font-black text-white transition hover:bg-cyan-700"
                    >
                      Accept Case
                    </button>
                  )}

                  {selectedCase.status === "DOCTOR_ACCEPTED" && (
                    <button
                      type="button"
                      onClick={() => {
                        updateCaseStatus("IN_CONSULTATION");
                        setSelectedCase((current) =>
                          current
                            ? { ...current, status: "IN_CONSULTATION" }
                            : current
                        );
                      }}
                      className="rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-black text-white transition hover:bg-indigo-700"
                    >
                      Start Consultation
                    </button>
                  )}

                  {selectedCase.status === "IN_CONSULTATION" && (
                    <button
                      type="button"
                      onClick={() => {
                        updateCaseStatus("CONSULTATION_COMPLETED");
                        setSelectedCase((current) =>
                          current
                            ? { ...current, status: "CONSULTATION_COMPLETED" }
                            : current
                        );
                      }}
                      className="rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-black text-white transition hover:bg-emerald-700"
                    >
                      Mark Completed
                    </button>
                  )}

                  {selectedCase.status === "CONSULTATION_COMPLETED" && (
                    <span className="rounded-full bg-emerald-50 px-4 py-2 text-xs font-black text-emerald-700">
                      ✓ Completed
                    </span>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-red-100 bg-red-50 p-4">
                <p className="mb-2 text-xs font-black uppercase tracking-wider text-red-700">
                  Emergency Warning
                </p>
                <p className="text-sm leading-6 text-red-800">
                  {selectedCase.emergency}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
