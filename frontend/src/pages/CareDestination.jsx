import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  HeartPulse,
  MapPin,
  Phone,
  Stethoscope,
  UserRound,
} from "lucide-react";
import logo from "../assets/logo/medivoice-logo.png";

function getStatusLabel(status) {
  const labels = {
    WAITING_FOR_DOCTOR: "Waiting for Doctor",
    DOCTOR_ACCEPTED: "Doctor Accepted",
    IN_CONSULTATION: "Consultation in Progress",
    CONSULTATION_COMPLETED: "Consultation Completed",
  };
  return labels[status] || "Waiting for Doctor";
}

function getStatusStep(status) {
  const steps = [
    "WAITING_FOR_DOCTOR",
    "DOCTOR_ACCEPTED",
    "IN_CONSULTATION",
    "CONSULTATION_COMPLETED",
  ];
  const index = steps.indexOf(status);
  return index === -1 ? 0 : index;
}

export default function CareDestination() {
  const navigate = useNavigate();
  const [patientCase, setPatientCase] = useState(null);

  useEffect(() => {
    const loadCase = () => {
      try {
        const savedCase = localStorage.getItem("medivoice_patient_case");
        if (savedCase) setPatientCase(JSON.parse(savedCase));
      } catch (error) {
        console.error("Care Destination Error:", error);
      }
    };

    loadCase();
    window.addEventListener("storage", loadCase);
    window.addEventListener("medivoice-case-updated", loadCase);

    const refreshTimer = window.setInterval(loadCase, 1000);

    return () => {
      window.removeEventListener("storage", loadCase);
      window.removeEventListener("medivoice-case-updated", loadCase);
      window.clearInterval(refreshTimer);
    };
  }, []);

  const patient = patientCase?.patient;
  const destination = patientCase?.careDestination;
  const doctor = destination?.doctor;
  const tokenNumber = patientCase?.tokenNumber || "—";
const caseSheetNumber = patientCase?.caseSheetNumber || "—";

  if (!patientCase || !patient || !destination) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#e9f8ff] via-white to-[#dff8f8] flex items-center justify-center px-5">
        <div className="w-full max-w-md rounded-3xl bg-white border border-slate-100 shadow-xl p-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-50">
            <MapPin className="h-8 w-8 text-cyan-600" />
          </div>

          <h1 className="mt-5 text-2xl font-black text-[#12213d]">
            Care destination not available
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Please complete your symptom assessment and send your case first.
          </p>

          <button
            type="button"
            onClick={() => navigate("/voice")}
            className="mt-6 w-full rounded-2xl bg-slate-900 px-5 py-3.5 text-sm font-black text-white transition hover:bg-cyan-600"
          >
            Go to Voice Assessment
          </button>
        </div>
      </div>
    );
  }

  const isEmergency =
    String(destination.department).toLowerCase().includes("emergency") ||
    String(patientCase.aiAnalysis?.severity).toUpperCase() === "CRITICAL";

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e9f8ff] via-white to-[#dff8f8] px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <header className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={logo}
              alt="MediVoice AI"
              className="h-14 w-14 rounded-2xl bg-white p-1 shadow-md"
            />

            <div>
              <h1 className="text-2xl font-black text-[#12213d] sm:text-3xl">
                Medi<span className="text-blue-600">Voice</span> AI
              </h1>
              <p className="text-xs font-semibold tracking-wider text-slate-400">
                CARE ROUTING
              </p>
            </div>
          </div>

          <div className="hidden items-center gap-2 rounded-full border border-emerald-100 bg-white px-4 py-2 shadow-sm sm:flex">
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-500" />
            <span className="text-xs font-black tracking-wider text-slate-500">
              SYSTEM READY
            </span>
          </div>
        </header>

        <main className="overflow-hidden rounded-[2rem] border border-white bg-white/95 shadow-2xl">
          <section
            className={`px-6 py-10 text-white sm:px-10 ${
              isEmergency
                ? "bg-gradient-to-r from-red-600 to-orange-500"
                : "bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500"
            }`}
          >
            <div className="mx-auto max-w-3xl text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15">
                {isEmergency ? (
                  <HeartPulse size={34} />
                ) : (
                  <MapPin size={34} />
                )}
              </div>

              <p className="mt-5 text-xs font-black tracking-[0.2em] text-white/80">
                YOUR CARE DESTINATION
              </p>

              <h2 className="mt-2 text-3xl font-black sm:text-5xl">
                {isEmergency
                  ? "Proceed to Emergency Care"
                  : "Your care team is ready."}
              </h2>

              <p className="mt-3 text-sm leading-6 text-white/85 sm:text-base">
                Based on your preliminary AI triage, please go to the assigned
                doctor and room below.
              </p>
            </div>
          </section>

          <section className="p-5 sm:p-8">

            {/* Live Case Status */}
            <div className="mb-6 grid gap-4 sm:grid-cols-2">
  <div className="rounded-[1.75rem] bg-gradient-to-br from-blue-600 to-cyan-500 p-6 text-white shadow-lg">
    <p className="text-xs font-black uppercase tracking-[0.18em] text-white/70">
      Your Token Number
    </p>

    <div className="mt-2 text-5xl font-black tracking-tight">
      #{tokenNumber}
    </div>

    <p className="mt-2 text-sm font-bold text-white/80">
      Please wait for your turn
    </p>
  </div>

  <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6">
    <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
      Case Sheet Number
    </p>

    <div className="mt-2 text-3xl font-black tracking-tight text-[#12213d]">
      {caseSheetNumber}
    </div>

    <p className="mt-2 text-sm font-bold text-slate-500">
      Your medical case reference
    </p>
  </div>
</div>
            <div className="mb-6 rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-600">
                    Live Case Status
                  </p>
                  <h3
                    className={`font-black ${
                      isEmergency ? "text-red-800" : "text-emerald-800"
                    }`}
                  >
                    {patientCase.status === "CONSULTATION_COMPLETED"
                      ? "Consultation completed"
                      : patientCase.status === "IN_CONSULTATION"
                      ? `Consultation in progress at ${doctor?.room || "the assigned room"}`
                      : patientCase.status === "DOCTOR_ACCEPTED"
                      ? `${doctor?.name || "Your doctor"} has accepted your case`
                      : isEmergency
                      ? `Go directly to ${doctor?.room || "Emergency Room"}`
                      : `Please proceed to ${doctor?.room || "the assigned room"}`}
                  </h3>
                </div>
                <span className="inline-flex w-fit items-center gap-2 rounded-full bg-cyan-50 px-3.5 py-2 text-xs font-black text-cyan-700">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-600" />
                  LIVE
                </span>
              </div>

              <div className="mt-6 grid grid-cols-4 gap-1 sm:gap-3">
                {[
                  ["WAITING_FOR_DOCTOR", "Case Sent"],
                  ["DOCTOR_ACCEPTED", "Doctor Accepted"],
                  ["IN_CONSULTATION", "Consultation"],
                  ["CONSULTATION_COMPLETED", "Completed"],
                ].map(([step, label], index) => {
                  const currentStep = getStatusStep(patientCase.status);
                  const isComplete = index <= currentStep;
                  const isCurrent = index === currentStep;

                  return (
                    <div key={step} className="relative text-center">
                      {index < 3 && (
                        <div
                          className={`absolute left-[58%] top-5 hidden h-0.5 w-[84%] sm:block ${
                            index < currentStep ? "bg-cyan-500" : "bg-slate-200"
                          }`}
                        />
                      )}
                      <div
                        className={`relative mx-auto flex h-10 w-10 items-center justify-center rounded-full border-2 text-xs font-black ${
                          isComplete
                            ? "border-cyan-600 bg-cyan-600 text-white"
                            : "border-slate-200 bg-white text-slate-400"
                        } ${isCurrent ? "ring-4 ring-cyan-100" : ""}`}
                      >
                        {isComplete ? <CheckCircle2 className="h-5 w-5" /> : index + 1}
                      </div>
                      <p className={`mt-2 text-[10px] font-black leading-4 sm:text-xs ${
                        isCurrent ? "text-cyan-700" : "text-slate-400"
                      }`}>
                        {label}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-3xl border border-cyan-100 bg-cyan-50/60 p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm">
                    <Stethoscope className="h-6 w-6 text-cyan-600" />
                  </div>

                  <div>
                    <p className="text-xs font-black uppercase tracking-wider text-cyan-700">
                      Assigned Doctor
                    </p>
                    <h3 className="mt-1 text-2xl font-black text-[#12213d]">
                      {doctor?.name || "Doctor assignment pending"}
                    </h3>
                  </div>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl bg-white p-4">
                    <p className="text-[10px] font-black uppercase text-slate-400">
                      Department
                    </p>
                    <p className="mt-1 text-sm font-black text-slate-800">
                      {destination.department}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white p-4">
                    <p className="text-[10px] font-black uppercase text-slate-400">
                      Room
                    </p>
                    <p className="mt-1 text-lg font-black text-slate-800">
                      {doctor?.room || "TBD"}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-white p-4">
                    <p className="text-[10px] font-black uppercase text-slate-400">
                      Floor
                    </p>
                    <p className="mt-1 text-sm font-black text-slate-800">
                      {doctor?.floor || "TBD"}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2 rounded-2xl bg-white px-4 py-3">
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      doctor?.status === "AVAILABLE"
                        ? "bg-emerald-500"
                        : "bg-amber-500"
                    }`}
                  />
                  <span className="text-sm font-bold text-slate-700">
                    Doctor status: {doctor?.status || "ASSIGNMENT PENDING"}
                  </span>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100">
                    <UserRound className="h-5 w-5 text-slate-600" />
                  </div>

                  <div>
                    <p className="text-xs font-black uppercase tracking-wider text-slate-400">
                      Patient
                    </p>
                    <h3 className="text-lg font-black text-[#12213d]">
                      {patient.name}
                    </h3>
                  </div>
                </div>

                <div className="mt-5 space-y-3 text-sm">
                  <div className="flex justify-between gap-4">
                    <span className="text-slate-400">Age</span>
                    <span className="font-bold">{patient.age || "N/A"}</span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-slate-400">Gender</span>
                    <span className="font-bold">
                      {patient.gender || "Not provided"}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-slate-400">Blood Group</span>
                    <span className="font-bold">
                      {patient.bloodGroup || "Not provided"}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4">
                    <span className="text-slate-400">Contact</span>
                    <span className="font-bold">
                      {patient.phone || "Not provided"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div
              className={`mt-5 rounded-3xl border p-5 ${
                isEmergency
                  ? "border-red-200 bg-red-50"
                  : "border-emerald-100 bg-emerald-50"
              }`}
            >
              <div className="flex items-start gap-3">
                <CheckCircle2
                  className={`mt-0.5 h-5 w-5 shrink-0 ${
                    isEmergency ? "text-red-600" : "text-emerald-600"
                  }`}
                />

                <div>
                  <h3
                    className={`font-black ${
                      isEmergency ? "text-red-800" : "text-emerald-800"
                    }`}
                  >
                    {isEmergency
                      ? `Go directly to ${doctor?.room || "Emergency Room"}`
                      : `Please proceed to ${doctor?.room || "the assigned room"}`}
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    {doctor
                      ? `${doctor.name} • ${doctor.department} • ${doctor.room} • ${doctor.floor}`
                      : "A doctor has not been assigned yet."}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => navigate("/voice")}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-black text-slate-700 transition hover:bg-slate-50"
              >
                <ArrowLeft size={18} />
                Back to Assessment
              </button>

              {patient.phone && (
                <a
                  href={`tel:${patient.phone}`}
                  className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3.5 text-sm font-black text-white transition hover:bg-cyan-600"
                >
                  <Phone size={18} />
                  Contact Patient
                </a>
              )}
            </div>

            <p className="mt-5 text-center text-xs leading-5 text-slate-400">
              MediVoice AI provides preliminary routing support. Follow the
              hospital's clinical instructions and seek emergency help when
              needed.
            </p>
          </section>
        </main>
      </div>
    </div>
  );
}
