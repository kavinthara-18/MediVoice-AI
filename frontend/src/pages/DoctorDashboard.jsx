import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock3,
  FileText,
  HeartPulse,
  Image as ImageIcon,
  LogOut,
  Stethoscope,
  UserRound,
  X,
} from "lucide-react";
import doctors from "../data/doctor";

function getPatientCase() {
  try {
    const savedCase = localStorage.getItem("medivoice_patient_case");

    if (!savedCase) return null;

    const parsed = JSON.parse(savedCase);

    if (!parsed || typeof parsed !== "object") {
      return null;
    }

    return parsed;
  } catch (error) {
    console.error("Doctor Dashboard Case Error:", error);
    return null;
  }
}

function severityStyle(severity) {
  const value = String(severity || "LOW").toUpperCase();

  if (value === "CRITICAL") {
    return {
      badge: "bg-red-50 text-red-700 border-red-200",
      card: "border-red-200",
      icon: "text-red-600",
    };
  }

  if (value === "HIGH") {
    return {
      badge: "bg-orange-50 text-orange-700 border-orange-200",
      card: "border-orange-200",
      icon: "text-orange-600",
    };
  }

  if (value === "MODERATE") {
    return {
      badge: "bg-amber-50 text-amber-700 border-amber-200",
      card: "border-amber-200",
      icon: "text-amber-600",
    };
  }

  return {
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    card: "border-emerald-200",
    icon: "text-emerald-600",
  };
}

function getSeverity(patientCase) {
  return String(
    patientCase?.severity ||
      patientCase?.aiAnalysis?.severity ||
      "LOW"
  ).toUpperCase();
}

function getDepartment(patientCase) {
  return (
    patientCase?.careDestination?.department ||
    patientCase?.recommendedDepartment ||
    "General Medicine"
  );
}

function getDoctor(patientCase) {
  return patientCase?.careDestination?.doctor || null;
}

function getPatient(patientCase) {
  return patientCase?.patient || {};
}

function getCaseStatus(patientCase) {
  return patientCase?.status || "WAITING_FOR_DOCTOR";
}

function getSymptoms(patientCase) {
  if (
    patientCase?.symptomsText &&
    typeof patientCase.symptomsText === "string"
  ) {
    return patientCase.symptomsText;
  }

  if (Array.isArray(patientCase?.aiAnalysis?.symptoms)) {
    return patientCase.aiAnalysis.symptoms
      .map((item) => {
        if (typeof item === "string") return item;

        if (item && typeof item === "object") {
          return item.symptom || item.name || "";
        }

        return "";
      })
      .filter(Boolean)
      .join(", ");
  }

  return "No symptom description available.";
}

function formatTime(value) {
  if (!value) return "Just now";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Just now";
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function DoctorDashboard() {
  const navigate = useNavigate();

  const [patientCase, setPatientCase] = useState(null);
  const [selectedCase, setSelectedCase] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [loadingStatus, setLoadingStatus] = useState(false);

  useEffect(() => {
    const loadData = () => {
      setPatientCase(getPatientCase());

      try {
        const savedDoctor = localStorage.getItem(
          "medivoice_selected_doctor"
        );

        setSelectedDoctor(
          savedDoctor ? JSON.parse(savedDoctor) : null
        );
      } catch (error) {
        console.error("Doctor load error:", error);
        setSelectedDoctor(null);
      }
    };

    loadData();

    window.addEventListener("storage", loadData);
    window.addEventListener("medivoice-case-updated", loadData);

    return () => {
      window.removeEventListener("storage", loadData);
      window.removeEventListener("medivoice-case-updated", loadData);
    };
  }, []);

  const routedCase = useMemo(() => {
    if (!patientCase) return null;

    const assignedDoctor = getDoctor(patientCase);

    if (!selectedDoctor) {
      return patientCase;
    }

    if (
      assignedDoctor &&
      String(assignedDoctor.id) === String(selectedDoctor.id)
    ) {
      return patientCase;
    }

    // For prototype fallback:
    // if no doctor assignment is stored, match using department.
    const department = getDepartment(patientCase);

    const matchingDoctor = doctors.find(
      (doctor) =>
        String(doctor.department).toLowerCase() ===
        String(department).toLowerCase() &&
        String(doctor.id) === String(selectedDoctor.id)
    );

    return matchingDoctor ? patientCase : null;
  }, [patientCase, selectedDoctor]);

  const patient = getPatient(routedCase);
  const severity = getSeverity(routedCase);
  const department = getDepartment(routedCase);
  const assignedDoctor = getDoctor(routedCase);
  const status = getCaseStatus(routedCase);
  const symptoms = getSymptoms(routedCase);

  const aiAnalysis = routedCase?.aiAnalysis || {};

  const skinImage =
    routedCase?.skinImage ||
    null;

  const caseSheetNumber =
    routedCase?.caseSheetNumber || "N/A";

  const updateCaseStatus = async (nextStatus) => {
    if (!routedCase) return;

    try {
      setLoadingStatus(true);

      const now = new Date().toISOString();

      const updatedCase = {
        ...routedCase,
        status: nextStatus,
        statusUpdatedAt: now,
      };

      // Update backend
      if (routedCase.backendCaseId) {
        try {
          await fetch(
            `http://localhost:5000/api/cases/${routedCase.backendCaseId}`,
            {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                status: nextStatus,
              }),
            }
          );
        } catch (backendError) {
          console.warn(
            "Backend status update failed:",
            backendError
          );
        }
      }

      localStorage.setItem(
        "medivoice_patient_case",
        JSON.stringify(updatedCase)
      );

      setPatientCase(updatedCase);

      if (selectedCase) {
        setSelectedCase(updatedCase);
      }

      window.dispatchEvent(
        new Event("medivoice-case-updated")
      );

      if (nextStatus === "CONSULTATION_COMPLETED") {
        const existingCases = JSON.parse(
          localStorage.getItem(
            "medivoice_completed_cases"
          ) || "[]"
        );

        const withoutDuplicate = existingCases.filter(
          (item) =>
            String(item.id) !== String(updatedCase.id)
        );

        localStorage.setItem(
          "medivoice_completed_cases",
          JSON.stringify([
            ...withoutDuplicate,
            {
              ...updatedCase,
              completedAt: now,
            },
          ])
        );

        window.dispatchEvent(
          new Event("medivoice-admin-updated")
        );
      }
    } catch (error) {
      console.error(
        "Case status update error:",
        error
      );
    } finally {
      setLoadingStatus(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("medivoice_selected_doctor");
    navigate("/roles");
  };

  return (
    <div className="min-h-screen bg-[#f4fbfc] text-slate-900">

      {/* HEADER */}
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">

          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-50">
              <HeartPulse className="h-6 w-6 text-cyan-600" />
            </div>

            <div>
              <h1 className="text-xl font-black tracking-tight">
                MediVoice <span className="text-cyan-600">AI</span>
              </h1>

              <p className="text-xs font-semibold text-slate-500">
                Doctor Clinical Dashboard
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">

            <div className="hidden items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-black text-emerald-700 sm:flex">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              SYSTEM ONLINE
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
              <Stethoscope className="h-4 w-4 text-cyan-600" />

              <span className="hidden text-sm font-bold sm:block">
                {selectedDoctor?.name || "Doctor"}
              </span>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>

          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">

        {/* TITLE */}
        <section className="mb-7">

          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-3.5 py-1.5 text-xs font-black uppercase tracking-wider text-cyan-700">
            <Activity className="h-3.5 w-3.5" />
            Live Patient Queue
          </div>

          <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
            Doctor Dashboard
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
            Review AI-assisted patient intake, case details,
            severity and clinical routing information.
          </p>
        </section>

        {/* STATS */}
        <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 rounded-2xl bg-cyan-50 p-3 w-fit">
              <UserRound className="h-5 w-5 text-cyan-600" />
            </div>

            <p className="text-3xl font-black">
              {routedCase ? "01" : "00"}
            </p>

            <p className="mt-1 text-sm font-semibold text-slate-500">
              Assigned Patient
            </p>
          </div>

          <div className="rounded-[1.5rem] border border-red-200 bg-white p-5 shadow-sm">
            <div className="mb-4 rounded-2xl bg-red-50 p-3 w-fit">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>

            <p className="text-3xl font-black">
              {severity === "CRITICAL" ? "01" : "00"}
            </p>

            <p className="mt-1 text-sm font-semibold text-slate-500">
              Critical Cases
            </p>
          </div>

          <div className="rounded-[1.5rem] border border-orange-200 bg-white p-5 shadow-sm">
            <div className="mb-4 rounded-2xl bg-orange-50 p-3 w-fit">
              <Clock3 className="h-5 w-5 text-orange-600" />
            </div>

            <p className="text-3xl font-black">
              {status === "WAITING_FOR_DOCTOR" ? "01" : "00"}
            </p>

            <p className="mt-1 text-sm font-semibold text-slate-500">
              Waiting Cases
            </p>
          </div>

          <div className="rounded-[1.5rem] border border-emerald-200 bg-white p-5 shadow-sm">
            <div className="mb-4 rounded-2xl bg-emerald-50 p-3 w-fit">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            </div>

            <p className="text-3xl font-black">
              {status === "CONSULTATION_COMPLETED" ? "01" : "00"}
            </p>

            <p className="mt-1 text-sm font-semibold text-slate-500">
              Completed
            </p>
          </div>

        </section>

        {/* PATIENT CASE */}
        {!selectedDoctor ? (

          <section className="rounded-3xl border border-dashed border-amber-300 bg-amber-50 p-10 text-center">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-white">
              <UserRound className="h-8 w-8 text-amber-600" />
            </div>

            <h3 className="mt-5 text-xl font-black text-amber-900">
              No Doctor Profile Selected
            </h3>

            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-amber-800">
              Please select your doctor profile first.
            </p>

            <button
              type="button"
              onClick={() => navigate("/doctor-selection")}
              className="mt-5 rounded-2xl bg-slate-950 px-6 py-3 text-sm font-black text-white"
            >
              GO TO DOCTOR ACCESS
            </button>

          </section>

        ) : !routedCase ? (

          <section className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-cyan-50">
              <FileText className="h-8 w-8 text-cyan-600" />
            </div>

            <h3 className="mt-5 text-xl font-black">
              No Patient Cases Yet
            </h3>

            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">
              Once a patient sends a case to your department,
              it will appear here.
            </p>

          </section>

        ) : (

          <section
            className={`overflow-hidden rounded-[2rem] border-2 ${
              severityStyle(severity).card
            } bg-white shadow-lg`}
          >

            {/* CASE HEADER */}
            <div className="border-b border-slate-200 bg-gradient-to-r from-white to-cyan-50/50 p-5 sm:p-7">

              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                <div className="flex items-start gap-4">

                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-cyan-50">
                    <UserRound className="h-8 w-8 text-cyan-600" />
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-2xl font-black">
                        {patient.name || "Unknown Patient"}
                      </h3>

                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-black ${
                          severityStyle(severity).badge
                        }`}
                      >
                        {severity}
                      </span>
                    </div>

                    <p className="mt-1 text-sm font-semibold text-slate-500">
                      Case Sheet: {caseSheetNumber}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Received {formatTime(routedCase.createdAt)}
                    </p>
                  </div>

                </div>

                <div className="rounded-2xl border border-cyan-100 bg-white px-4 py-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-cyan-600">
                    Current Status
                  </p>

                  <p className="mt-1 text-sm font-black text-slate-800">
                    {status.replaceAll("_", " ")}
                  </p>
                </div>

              </div>

            </div>

            {/* DETAILS */}
            <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[1.4fr_0.8fr]">

              {/* LEFT */}
              <div className="space-y-5">

                {/* BASIC INFO */}
                <div>
                  <p className="mb-3 text-xs font-black uppercase tracking-widest text-slate-400">
                    Patient Information
                  </p>

                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-[10px] font-bold uppercase text-slate-400">
                        Age
                      </p>
                      <p className="mt-1 font-black">
                        {patient.age || "N/A"}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-[10px] font-bold uppercase text-slate-400">
                        Gender
                      </p>
                      <p className="mt-1 font-black">
                        {patient.gender || "N/A"}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-[10px] font-bold uppercase text-slate-400">
                        Blood Group
                      </p>
                      <p className="mt-1 font-black">
                        {patient.bloodGroup || "N/A"}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-[10px] font-bold uppercase text-slate-400">
                        Phone
                      </p>
                      <p className="mt-1 break-all font-black">
                        {patient.phone || "N/A"}
                      </p>
                    </div>

                  </div>
                </div>

                {/* CONDITIONS */}
                <div className="rounded-2xl border border-slate-200 p-5">
                  <p className="mb-3 text-xs font-black uppercase tracking-widest text-slate-400">
                    Existing Medical Conditions
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {Array.isArray(patient.conditions) &&
                    patient.conditions.length > 0 ? (
                      patient.conditions.map((condition, index) => (
                        <span
                          key={`${condition}-${index}`}
                          className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700"
                        >
                          {condition}
                        </span>
                      ))
                    ) : (
                      <span className="text-sm text-slate-400">
                        No conditions provided
                      </span>
                    )}
                  </div>

                  {patient.otherCondition && (
                    <p className="mt-3 text-sm text-slate-600">
                      <span className="font-bold">
                        Other:
                      </span>{" "}
                      {patient.otherCondition}
                    </p>
                  )}
                </div>

                {/* VOICE SYMPTOMS */}
                <div className="rounded-2xl border border-cyan-100 bg-cyan-50/50 p-5">
                  <div className="mb-3 flex items-center gap-2">
                    <Activity className="h-5 w-5 text-cyan-600" />

                    <p className="text-xs font-black uppercase tracking-widest text-cyan-700">
                      Voice Reported Symptoms
                    </p>
                  </div>

                  <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700">
                    {symptoms}
                  </p>
                </div>

                {/* AI ANALYSIS */}
                <div className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-5">

                  <p className="mb-4 text-xs font-black uppercase tracking-widest text-indigo-700">
                    AI Analysis
                  </p>

                  <div className="grid gap-4 sm:grid-cols-2">

                    <div className="rounded-2xl bg-white p-4">
                      <p className="text-[10px] font-bold uppercase text-slate-400">
                        Detected Conditions
                      </p>

                      {Array.isArray(aiAnalysis.conditions) &&
                      aiAnalysis.conditions.length > 0 ? (
                        <div className="mt-2 space-y-1">
                          {aiAnalysis.conditions.map(
                            (condition, index) => (
                              <p
                                key={`${condition}-${index}`}
                                className="text-sm font-bold text-slate-700"
                              >
                                • {condition}
                              </p>
                            )
                          )}
                        </div>
                      ) : (
                        <p className="mt-2 text-sm text-slate-400">
                          No conditions detected
                        </p>
                      )}
                    </div>

                    <div className="rounded-2xl bg-white p-4">
                      <p className="text-[10px] font-bold uppercase text-slate-400">
                        Recommended Next Step
                      </p>

                      <p className="mt-2 text-sm font-bold leading-6 text-slate-700">
                        {aiAnalysis.nextStep ||
                          "Clinical assessment recommended."}
                      </p>
                    </div>

                  </div>

                  {aiAnalysis.emergency && (
                    <div className="mt-4 rounded-2xl border border-red-100 bg-red-50 p-4">
                      <p className="text-[10px] font-black uppercase tracking-widest text-red-700">
                        Emergency Warning
                      </p>

                      <p className="mt-2 text-sm leading-6 text-red-800">
                        {aiAnalysis.emergency}
                      </p>
                    </div>
                  )}

                </div>

              </div>

              {/* RIGHT */}
              <div className="space-y-5">

                {/* ROUTING */}
                <div className="rounded-[1.5rem] border border-cyan-200 bg-gradient-to-br from-cyan-50 to-white p-5">

                  <p className="mb-4 text-xs font-black uppercase tracking-widest text-cyan-700">
                    Care Destination
                  </p>

                  <div className="space-y-3">

                    <div className="rounded-2xl bg-white p-4 shadow-sm">
                      <p className="text-[10px] font-bold uppercase text-slate-400">
                        Department
                      </p>

                      <p className="mt-1 font-black text-slate-800">
                        {department}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-white p-4 shadow-sm">
                      <p className="text-[10px] font-bold uppercase text-slate-400">
                        Assigned Doctor
                      </p>

                      <p className="mt-1 font-black text-slate-800">
                        {assignedDoctor?.name ||
                          selectedDoctor?.name ||
                          "Not Assigned"}
                      </p>
                    </div>

                    {assignedDoctor?.room && (
                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-2xl bg-white p-4 shadow-sm">
                          <p className="text-[10px] font-bold uppercase text-slate-400">
                            Room
                          </p>

                          <p className="mt-1 font-black">
                            {assignedDoctor.room}
                          </p>
                        </div>

                        <div className="rounded-2xl bg-white p-4 shadow-sm">
                          <p className="text-[10px] font-bold uppercase text-slate-400">
                            Floor
                          </p>

                          <p className="mt-1 font-black">
                            {assignedDoctor.floor}
                          </p>
                        </div>
                      </div>
                    )}

                  </div>
                </div>

                {/* SKIN IMAGE */}
                {skinImage && (
                  <div className="rounded-[1.5rem] border border-purple-200 bg-purple-50/40 p-5">

                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ImageIcon className="h-5 w-5 text-purple-600" />

                        <p className="text-xs font-black uppercase tracking-widest text-purple-700">
                          Skin Image
                        </p>
                      </div>

                      <span className="rounded-full bg-white px-3 py-1 text-[10px] font-black text-purple-600">
                        ATTACHED
                      </span>
                    </div>

                    <div className="overflow-hidden rounded-2xl border border-purple-100 bg-white">
                      <img
                        src={skinImage}
                        alt="Patient skin condition"
                        className="max-h-[420px] w-full object-contain"
                      />
                    </div>

                    <p className="mt-3 text-xs leading-5 text-slate-500">
                      Image captured during patient intake and
                      attached to this case sheet.
                    </p>

                  </div>
                )}

                {/* NO IMAGE */}
                {!skinImage && department === "Dermatologist" && (
                  <div className="rounded-[1.5rem] border border-dashed border-purple-300 bg-purple-50 p-5">
                    <div className="flex items-center gap-3">
                      <ImageIcon className="h-6 w-6 text-purple-600" />

                      <div>
                        <p className="text-sm font-black text-purple-800">
                          No Skin Image
                        </p>

                        <p className="mt-1 text-xs text-purple-700">
                          This dermatology case does not have
                          an image attached yet.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* ACTIONS */}
                <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5">

                  <p className="mb-4 text-xs font-black uppercase tracking-widest text-slate-400">
                    Consultation Workflow
                  </p>

                  <div className="space-y-3">

                    {status === "WAITING_FOR_DOCTOR" && (
                      <button
                        type="button"
                        disabled={loadingStatus}
                        onClick={() =>
                          updateCaseStatus("DOCTOR_ACCEPTED")
                        }
                        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-600 px-5 py-4 text-sm font-black text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        ACCEPT CASE
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    )}

                    {status === "DOCTOR_ACCEPTED" && (
                      <button
                        type="button"
                        disabled={loadingStatus}
                        onClick={() =>
                          updateCaseStatus("IN_CONSULTATION")
                        }
                        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 py-4 text-sm font-black text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        START CONSULTATION
                        <Stethoscope className="h-4 w-4" />
                      </button>
                    )}

                    {status === "IN_CONSULTATION" && (
                      <button
                        type="button"
                        disabled={loadingStatus}
                        onClick={() =>
                          updateCaseStatus(
                            "CONSULTATION_COMPLETED"
                          )
                        }
                        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-4 text-sm font-black text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        COMPLETE CONSULTATION
                        <CheckCircle2 className="h-4 w-4" />
                      </button>
                    )}

                    {status === "CONSULTATION_COMPLETED" && (
                      <div className="flex w-full items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-black text-emerald-700">
                        <CheckCircle2 className="h-5 w-5" />
                        CONSULTATION COMPLETED
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => setSelectedCase(routedCase)}
                      className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-slate-200 bg-white px-5 py-4 text-sm font-black text-slate-800 transition hover:bg-slate-50"
                    >
                      <FileText className="h-4 w-4" />
                      OPEN FULL CASE SHEET
                    </button>

                  </div>
                </div>

              </div>
            </div>
          </section>
        )}

        {/* FOOTER */}
        <div className="mt-7 flex items-start gap-3 rounded-2xl border border-cyan-100 bg-cyan-50/60 p-4">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-cyan-600" />

          <p className="text-xs leading-5 text-slate-600 sm:text-sm">
            <span className="font-bold text-slate-800">
              AI-assisted triage:
            </span>{" "}
            Patient information is presented to support
            professional clinical review.
          </p>
        </div>

      </main>

      {/* FULL CASE SHEET MODAL */}
      {selectedCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">

          <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-white shadow-2xl">

            {/* MODAL HEADER */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4 sm:px-7">

              <div>
                <p className="text-xs font-black uppercase tracking-widest text-cyan-600">
                  Full Case Sheet
                </p>

                <h3 className="mt-1 text-xl font-black">
                  {selectedCase.patient?.name ||
                    "Unknown Patient"}
                </h3>

                <p className="mt-1 text-xs font-bold text-slate-400">
                  Case Sheet:{" "}
                  {selectedCase.caseSheetNumber || "N/A"}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedCase(null)}
                className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              >
                <X className="h-5 w-5" />
              </button>

            </div>

            <div className="space-y-5 p-5 sm:p-7">

              {/* SUMMARY */}
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-[10px] font-bold uppercase text-slate-400">
                    Patient
                  </p>

                  <p className="mt-1 font-black">
                    {selectedCase.patient?.name ||
                      "N/A"}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-[10px] font-bold uppercase text-slate-400">
                    Age
                  </p>

                  <p className="mt-1 font-black">
                    {selectedCase.patient?.age ||
                      "N/A"}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-[10px] font-bold uppercase text-slate-400">
                    Severity
                  </p>

                  <span
                    className={`mt-1 inline-flex rounded-full border px-3 py-1 text-xs font-black ${
                      severityStyle(
                        getSeverity(selectedCase)
                      ).badge
                    }`}
                  >
                    {getSeverity(selectedCase)}
                  </span>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-[10px] font-bold uppercase text-slate-400">
                    Department
                  </p>

                  <p className="mt-1 font-black">
                    {getDepartment(selectedCase)}
                  </p>
                </div>

              </div>

              {/* VOICE */}
              <div className="rounded-2xl border border-cyan-100 bg-cyan-50/50 p-5">

                <p className="mb-2 text-xs font-black uppercase tracking-widest text-cyan-700">
                  Voice Transcript / Symptoms
                </p>

                <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700">
                  {getSymptoms(selectedCase)}
                </p>

              </div>

              {/* AI */}
              <div className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-5">

                <p className="mb-3 text-xs font-black uppercase tracking-widest text-indigo-700">
                  AI Analysis
                </p>

                <div className="grid gap-4 sm:grid-cols-2">

                  <div className="rounded-2xl bg-white p-4">
                    <p className="text-[10px] font-bold uppercase text-slate-400">
                      Possible Conditions
                    </p>

                    {Array.isArray(
                      selectedCase.aiAnalysis?.conditions
                    ) &&
                    selectedCase.aiAnalysis.conditions
                      .length > 0 ? (
                      <div className="mt-2 space-y-1">
                        {selectedCase.aiAnalysis.conditions.map(
                          (condition, index) => (
                            <p
                              key={`${condition}-${index}`}
                              className="text-sm font-bold"
                            >
                              • {condition}
                            </p>
                          )
                        )}
                      </div>
                    ) : (
                      <p className="mt-2 text-sm text-slate-400">
                        No conditions detected
                      </p>
                    )}
                  </div>

                  <div className="rounded-2xl bg-white p-4">
                    <p className="text-[10px] font-bold uppercase text-slate-400">
                      Next Step
                    </p>

                    <p className="mt-2 text-sm font-bold leading-6">
                      {selectedCase.aiAnalysis
                        ?.nextStep ||
                        "Clinical assessment recommended."}
                    </p>
                  </div>

                </div>

              </div>

              {/* SKIN IMAGE */}
              {selectedCase.skinImage && (
                <div className="rounded-2xl border border-purple-200 bg-purple-50/50 p-5">

                  <div className="mb-4 flex items-center gap-2">
                    <ImageIcon className="h-5 w-5 text-purple-600" />

                    <p className="text-xs font-black uppercase tracking-widest text-purple-700">
                      Attached Skin Image
                    </p>
                  </div>

                  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                    <img
                      src={selectedCase.skinImage}
                      alt="Attached skin"
                      className="max-h-[550px] w-full object-contain"
                    />
                  </div>

                </div>
              )}

              {/* DOCTOR */}
              <div className="rounded-2xl border border-cyan-200 bg-cyan-50 p-5">

                <p className="mb-3 text-xs font-black uppercase tracking-widest text-cyan-700">
                  Assigned Care
                </p>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

                  <div className="rounded-xl bg-white p-3">
                    <p className="text-[10px] font-bold uppercase text-slate-400">
                      Doctor
                    </p>
                    <p className="mt-1 text-sm font-black">
                      {getDoctor(selectedCase)?.name ||
                        selectedDoctor?.name ||
                        "N/A"}
                    </p>
                  </div>

                  <div className="rounded-xl bg-white p-3">
                    <p className="text-[10px] font-bold uppercase text-slate-400">
                      Department
                    </p>
                    <p className="mt-1 text-sm font-black">
                      {getDepartment(selectedCase)}
                    </p>
                  </div>

                  <div className="rounded-xl bg-white p-3">
                    <p className="text-[10px] font-bold uppercase text-slate-400">
                      Room
                    </p>
                    <p className="mt-1 text-sm font-black">
                      {getDoctor(selectedCase)?.room ||
                        "N/A"}
                    </p>
                  </div>

                  <div className="rounded-xl bg-white p-3">
                    <p className="text-[10px] font-bold uppercase text-slate-400">
                      Floor
                    </p>
                    <p className="mt-1 text-sm font-black">
                      {getDoctor(selectedCase)?.floor ||
                        "N/A"}
                    </p>
                  </div>

                </div>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}