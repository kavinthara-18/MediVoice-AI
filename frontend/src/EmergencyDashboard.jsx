import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BedDouble,
  CheckCircle2,
  HeartPulse,
  UserRound,
} from "lucide-react";

import logo from "./assets/logo/medivoice-logo.png";
import doctors from "./data/doctor";

const API_BASE = "http://localhost:5000";
const CASE_STORAGE_KEY = "medivoice_patient_case";
const BED_STORAGE_KEY = "medivoice_emergency_beds";

const INITIAL_BEDS = [
  { id: "ER-BED-01", status: "AVAILABLE" },
  { id: "ER-BED-02", status: "AVAILABLE" },
  { id: "ER-BED-03", status: "AVAILABLE" },
  { id: "ER-BED-04", status: "AVAILABLE" },
];

function readStoredBeds() {
  try {
    const saved = localStorage.getItem(BED_STORAGE_KEY);
    if (!saved) return INITIAL_BEDS;

    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : INITIAL_BEDS;
  } catch (error) {
    console.error("Emergency bed storage error:", error);
    return INITIAL_BEDS;
  }
}

function saveBeds(beds) {
  localStorage.setItem(BED_STORAGE_KEY, JSON.stringify(beds));
}

function readStoredCase() {
  try {
    const saved = localStorage.getItem(CASE_STORAGE_KEY);
    if (!saved) return null;

    const parsed = JSON.parse(saved);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch (error) {
    console.error("Emergency case storage error:", error);
    return null;
  }
}

export default function EmergencyDashboard() {
  const [emergencyCases, setEmergencyCases] = useState([]);
  const [beds, setBeds] = useState(() => readStoredBeds());

  const [showAllocationPanel, setShowAllocationPanel] = useState(false);
  const [selectedEmergencyCase, setSelectedEmergencyCase] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedBed, setSelectedBed] = useState(null);

  const [showDetailsForm, setShowDetailsForm] = useState(false);
  const [savingEmergencyCase, setSavingEmergencyCase] = useState(false);
  const [creatingEmergencyCase, setCreatingEmergencyCase] = useState(false);

  const [patientDetails, setPatientDetails] = useState({
    name: "",
    age: "",
    gender: "",
    phone: "",
    bloodGroup: "",
    conditions: "",
  });

  const availableEmergencyDoctors = useMemo(
    () =>
      doctors.filter(
        (doctor) =>
          doctor.department === "Emergency Medicine" &&
          doctor.status === "AVAILABLE"
      ),
    []
  );

  const availableBeds = useMemo(
    () => beds.filter((bed) => bed.status === "AVAILABLE"),
    [beds]
  );

  function loadEmergencyCase() {
    const patientCase = readStoredCase();

    if (!patientCase) {
      setEmergencyCases([]);
      setSelectedEmergencyCase(null);
      return;
    }

    const isEmergency =
      patientCase.isEmergency === true ||
      String(patientCase.aiAnalysis?.severity).toUpperCase() === "CRITICAL" ||
      patientCase.status === "EMERGENCY_WAITING_FOR_BED" ||
      patientCase.status === "EMERGENCY_ALLOCATED" ||
      patientCase.status === "EMERGENCY_DETAILS_COMPLETED";

    if (!isEmergency) {
      setEmergencyCases([]);
      setSelectedEmergencyCase(null);
      return;
    }

    setEmergencyCases([patientCase]);

    if (
      patientCase.status === "EMERGENCY_ALLOCATED" ||
      patientCase.status === "EMERGENCY_DETAILS_COMPLETED"
    ) {
      setSelectedEmergencyCase(patientCase);

      if (patientCase.emergencyBed?.id) {
        setSelectedBed({
          id: patientCase.emergencyBed.id,
          status: "RESERVED",
        });
      }

      if (patientCase.careDestination?.doctor) {
        setSelectedDoctor(patientCase.careDestination.doctor);
      }
    }
  }

  useEffect(() => {
    loadEmergencyCase();

    const handleCaseUpdated = () => loadEmergencyCase();

    window.addEventListener("storage", handleCaseUpdated);
    window.addEventListener("medivoice-case-updated", handleCaseUpdated);

    const timer = window.setInterval(loadEmergencyCase, 1000);

    return () => {
      window.removeEventListener("storage", handleCaseUpdated);
      window.removeEventListener("medivoice-case-updated", handleCaseUpdated);
      window.clearInterval(timer);
    };
  }, []);

  async function createEmergencyCase() {
    if (creatingEmergencyCase) return;

    setCreatingEmergencyCase(true);

    try {
      const now = Date.now();
      const caseSheetNumber = `CS-C-${String(now).slice(-5)}`;

      const emergencyCase = {
        id: now,
        caseSheetNumber,
        patient: {
          name: "Emergency Patient",
          phone: "",
          age: "",
          gender: "",
          bloodGroup: "Not provided",
          conditions: ["Not provided"],
          otherCondition: "",
        },
        symptomsText: "Emergency case received at hospital.",
        aiAnalysis: {
          symptoms: [],
          conditions: [],
          severity: "CRITICAL",
          nextStep: "Immediate emergency care required.",
          emergency: "CRITICAL EMERGENCY",
        },
        isEmergency: true,
        status: "EMERGENCY_WAITING_FOR_BED",
        createdAt: new Date().toISOString(),
      };

      try {
        const response = await fetch(`${API_BASE}/api/cases`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            caseSheetNumber,
            symptomsText: emergencyCase.symptomsText,
            severity: "CRITICAL",
            recommendedDepartment: "Emergency Medicine",
            status: "EMERGENCY_WAITING_FOR_BED",
            isEmergency: true,
            patientId: null,
          }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Failed to create emergency case");
        }

        emergencyCase.backendCaseId = data.case?._id || null;
        console.log("✅ Emergency case saved to MongoDB:", data.case);
      } catch (backendError) {
        console.error("Emergency MongoDB create error:", backendError);
        console.warn("Continuing in prototype mode with localStorage.");
      }

      localStorage.setItem(CASE_STORAGE_KEY, JSON.stringify(emergencyCase));

      setEmergencyCases([emergencyCase]);
      setSelectedEmergencyCase(emergencyCase);
      setSelectedBed(null);
      setSelectedDoctor(null);
      setShowDetailsForm(false);
      setShowAllocationPanel(true);

      window.dispatchEvent(new Event("medivoice-case-updated"));
    } catch (error) {
      console.error("Emergency Case Creation Error:", error);
      alert(error.message || "Unable to create emergency case.");
    } finally {
      setCreatingEmergencyCase(false);
    }
  }

  function openAllocationPanel(patientCase) {
    if (!patientCase) return;

    setSelectedEmergencyCase(patientCase);
    setSelectedBed(null);
    setSelectedDoctor(null);
    setShowDetailsForm(false);
    setShowAllocationPanel(true);
  }

  async function confirmAllocation() {
    if (!selectedEmergencyCase) {
      alert("Emergency case not found.");
      return;
    }

    if (!selectedBed) {
      alert("Please select an emergency bed.");
      return;
    }

    if (!selectedDoctor) {
      alert("Please select an emergency doctor.");
      return;
    }

    setSavingEmergencyCase(true);

    try {
      const now = new Date().toISOString();
      const updatedCase = {
        ...selectedEmergencyCase,
        emergencyBed: {
          id: selectedBed.id,
          status: "RESERVED",
        },
        careDestination: {
          doctor: selectedDoctor,
          department: "Emergency Medicine",
        },
        status: "EMERGENCY_ALLOCATED",
        statusUpdatedAt: now,
      };

      // The backend does not yet expose an update route in the current project.
      // Keep the allocation immediately functional in the prototype using localStorage.
      localStorage.setItem(CASE_STORAGE_KEY, JSON.stringify(updatedCase));

      const updatedBeds = beds.map((bed) =>
        bed.id === selectedBed.id
          ? { ...bed, status: "RESERVED" }
          : bed
      );

      setBeds(updatedBeds);
      saveBeds(updatedBeds);

      setEmergencyCases([updatedCase]);
      setSelectedEmergencyCase(updatedCase);
      setShowAllocationPanel(false);
      setShowDetailsForm(false);

      window.dispatchEvent(new Event("medivoice-case-updated"));

      alert(
        `${selectedBed.id} reserved and ${selectedDoctor.name} assigned successfully.`
      );
    } finally {
      setSavingEmergencyCase(false);
    }
  }

  function openDetailsForm(patientCase) {
    if (!patientCase) return;

    if (patientCase.status !== "EMERGENCY_ALLOCATED") {
      alert("Please allocate the emergency bed and doctor first.");
      return;
    }

    const patient = patientCase.patient || {};

    setSelectedEmergencyCase(patientCase);
    setPatientDetails({
      name: patient.name || "",
      age: patient.age || "",
      gender: patient.gender || "",
      phone: patient.phone || "",
      bloodGroup: patient.bloodGroup || "",
      conditions: Array.isArray(patient.conditions)
        ? patient.conditions.join(", ")
        : patient.conditions || "",
    });

    setShowAllocationPanel(false);
    setShowDetailsForm(true);
  }

  function handlePatientDetailChange(field, value) {
    setPatientDetails((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function savePatientDetails() {
    if (!selectedEmergencyCase) {
      alert("Emergency case not found.");
      return;
    }

    if (
      !patientDetails.name.trim() ||
      !patientDetails.age ||
      !patientDetails.gender
    ) {
      alert("Please enter Name, Age and Gender.");
      return;
    }

    const updatedCase = {
      ...selectedEmergencyCase,
      patient: {
        ...selectedEmergencyCase.patient,
        name: patientDetails.name.trim(),
        age: patientDetails.age,
        gender: patientDetails.gender,
        phone: patientDetails.phone.trim(),
        bloodGroup: patientDetails.bloodGroup.trim() || "Not provided",
        conditions: patientDetails.conditions.trim()
          ? patientDetails.conditions
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean)
          : ["Not provided"],
      },
      status: "EMERGENCY_DETAILS_COMPLETED",
      statusUpdatedAt: new Date().toISOString(),
    };

    localStorage.setItem(CASE_STORAGE_KEY, JSON.stringify(updatedCase));

    setEmergencyCases([updatedCase]);
    setSelectedEmergencyCase(updatedCase);
    setShowDetailsForm(false);

    window.dispatchEvent(new Event("medivoice-case-updated"));
    alert("Emergency patient details saved successfully.");
  }

  function resetDemoBeds() {
    const resetBeds = INITIAL_BEDS.map((bed) => ({ ...bed }));

    setBeds(resetBeds);
    saveBeds(resetBeds);
    setSelectedBed(null);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 text-slate-900">
      <header className="border-b border-red-100 bg-white/95 px-5 py-4 shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src={logo}
              alt="MediVoice AI"
              className="h-12 w-12 rounded-2xl bg-white p-1 shadow"
            />

            <div>
              <h1 className="text-2xl font-black text-[#12213d]">
                Medi<span className="text-blue-600">Voice</span> AI
              </h1>
              <p className="text-xs font-black tracking-widest text-red-500">
                EMERGENCY CONTROL CENTER
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-full bg-red-50 px-4 py-2">
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-red-500" />
            <span className="text-xs font-black text-red-700">
              EMERGENCY MODE
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-8">
        <section className="mb-8 rounded-[2rem] bg-gradient-to-r from-red-600 to-orange-500 p-7 text-white shadow-xl">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="rounded-2xl bg-white/15 p-4">
                <AlertTriangle size={34} />
              </div>

              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-white/70">
                  Fast Track Emergency
                </p>
                <h2 className="mt-1 text-3xl font-black sm:text-4xl">
                  Immediate Care Management
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-white/90">
                  Emergency patients bypass the normal queue and move directly
                  to bed and emergency doctor allocation.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={createEmergencyCase}
                disabled={creatingEmergencyCase}
                className="rounded-2xl bg-white px-7 py-4 text-sm font-black text-red-600 shadow-xl transition hover:-translate-y-0.5 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {creatingEmergencyCase
                  ? "CREATING..."
                  : "+ NEW EMERGENCY CASE"}
              </button>

              <button
                type="button"
                onClick={resetDemoBeds}
                className="rounded-2xl border border-white/30 bg-white/10 px-6 py-4 text-sm font-black text-white transition hover:bg-white/15"
              >
                RESET DEMO BEDS
              </button>
            </div>
          </div>
        </section>

        <section className="mb-6 grid gap-5 sm:grid-cols-3">
          <div className="rounded-3xl border border-red-100 bg-white p-6 shadow-sm">
            <HeartPulse className="text-red-500" size={25} />
            <p className="mt-4 text-xs font-black uppercase tracking-wider text-slate-400">
              Active Emergencies
            </p>
            <p className="mt-1 text-4xl font-black text-red-600">
              {emergencyCases.length}
            </p>
          </div>

          <div className="rounded-3xl border border-blue-100 bg-white p-6 shadow-sm">
            <BedDouble className="text-blue-600" size={25} />
            <p className="mt-4 text-xs font-black uppercase tracking-wider text-slate-400">
              Available Beds
            </p>
            <p className="mt-1 text-4xl font-black text-[#12213d]">
              {availableBeds.length}
            </p>
          </div>

          <div className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm">
            <UserRound className="text-emerald-600" size={25} />
            <p className="mt-4 text-xs font-black uppercase tracking-wider text-slate-400">
              Available Emergency Doctor(s)
            </p>
            <p className="mt-1 text-3xl font-black text-[#12213d]">
              {availableEmergencyDoctors.length}
            </p>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
          <section className="rounded-[2rem] border border-red-100 bg-white p-6 shadow-lg">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-red-500">
                  Critical Cases
                </p>
                <h3 className="mt-1 text-2xl font-black text-[#12213d]">
                  Emergency Patients
                </h3>
              </div>
              <AlertTriangle className="text-red-500" />
            </div>

            <div className="mt-6 space-y-4">
              {emergencyCases.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-200 p-10 text-center">
                  <CheckCircle2
                    className="mx-auto text-emerald-500"
                    size={38}
                  />
                  <p className="mt-3 font-black text-slate-700">
                    No active emergency cases
                  </p>
                  <p className="mt-1 text-sm text-slate-400">
                    Click &ldquo;New Emergency Case&rdquo; to start.
                  </p>
                </div>
              ) : (
                emergencyCases.map((item) => {
                  const allocated = item.status === "EMERGENCY_ALLOCATED";
                  const detailsCompleted =
                    item.status === "EMERGENCY_DETAILS_COMPLETED";

                  return (
                    <article
                      key={item.id || item.caseSheetNumber}
                      className="rounded-3xl border-2 border-red-200 bg-red-50 p-5"
                    >
                      <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-red-600 px-3 py-1 text-xs font-black text-white">
                              CRITICAL
                            </span>
                            <span className="text-xs font-black text-red-600">
                              NO TOKEN REQUIRED
                            </span>
                          </div>

                          <h4 className="mt-3 text-xl font-black text-[#12213d]">
                            {item.patient?.name || "Emergency Patient"}
                          </h4>

                          <p className="mt-1 text-sm font-bold text-slate-500">
                            Case Sheet: {item.caseSheetNumber || "N/A"}
                          </p>

                          <p className="mt-1 text-xs font-black uppercase tracking-wide text-slate-500">
                            Status: {String(item.status || "").replaceAll("_", " ")}
                          </p>
                        </div>

                        {!allocated && !detailsCompleted ? (
                          <button
                            type="button"
                            onClick={() => openAllocationPanel(item)}
                            disabled={availableBeds.length === 0}
                            className="rounded-2xl bg-red-600 px-5 py-3 text-sm font-black text-white shadow-md transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                          >
                            {availableBeds.length > 0
                              ? "ALLOCATE BED & DOCTOR"
                              : "NO BED AVAILABLE"}
                          </button>
                        ) : detailsCompleted ? (
                          <span className="rounded-2xl bg-emerald-100 px-5 py-3 text-sm font-black text-emerald-700">
                            DETAILS SAVED
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => openDetailsForm(item)}
                            className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white shadow-md transition hover:bg-blue-700"
                          >
                            ENTER PATIENT DETAILS
                          </button>
                        )}
                      </div>

                      <div className="mt-5 grid gap-3 sm:grid-cols-3">
                        <div className="rounded-2xl bg-white p-4">
                          <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
                            Doctor
                          </p>
                          <p className="mt-1 font-black text-slate-800">
                            {item.careDestination?.doctor?.name || "Not Assigned"}
                          </p>
                        </div>

                        <div className="rounded-2xl bg-white p-4">
                          <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
                            Department
                          </p>
                          <p className="mt-1 font-black text-slate-800">
                            {item.careDestination?.department || "Emergency Medicine"}
                          </p>
                        </div>

                        <div className="rounded-2xl bg-white p-4">
                          <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
                            Bed
                          </p>
                          <p className="mt-1 font-black text-slate-800">
                            {item.emergencyBed?.id || "Not Allocated"}
                          </p>
                        </div>
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          </section>

          <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-blue-50 p-3">
                <BedDouble className="text-blue-600" />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-blue-600">
                  Bed Management
                </p>
                <h3 className="text-xl font-black text-[#12213d]">
                  Emergency Beds
                </h3>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {beds.map((bed) => (
                <div
                  key={bed.id}
                  className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4"
                >
                  <div className="flex items-center gap-3">
                    <BedDouble
                      className={
                        bed.status === "AVAILABLE"
                          ? "text-slate-500"
                          : "text-orange-500"
                      }
                      size={20}
                    />
                    <span className="font-black text-slate-700">{bed.id}</span>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-[10px] font-black ${
                      bed.status === "AVAILABLE"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-orange-100 text-orange-700"
                    }`}
                  >
                    {bed.status}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {showAllocationPanel && selectedEmergencyCase && (
          <section className="mt-6 rounded-[2rem] border-2 border-red-200 bg-white p-6 shadow-xl">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-red-500">
                  Emergency Allocation
                </p>
                <h3 className="mt-1 text-2xl font-black text-[#12213d]">
                  Assign Bed & Emergency Doctor
                </h3>
                <p className="mt-1 text-sm font-bold text-slate-500">
                  Select one bed and one available emergency doctor.
                </p>
              </div>

              <div className="rounded-2xl bg-red-50 px-4 py-3 text-right">
                <p className="text-[10px] font-black uppercase tracking-wider text-red-400">
                  Case
                </p>
                <p className="text-sm font-black text-red-700">
                  {selectedEmergencyCase.caseSheetNumber || "N/A"}
                </p>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <div>
                <h4 className="mb-3 text-sm font-black uppercase tracking-wide text-slate-500">
                  Available Beds
                </h4>

                <div className="space-y-3">
                  {availableBeds.length === 0 ? (
                    <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
                      <p className="font-black text-red-600">No beds available</p>
                    </div>
                  ) : (
                    availableBeds.map((bed) => {
                      const isSelected = selectedBed?.id === bed.id;

                      return (
                        <button
                          key={bed.id}
                          type="button"
                          onClick={() => setSelectedBed(bed)}
                          aria-pressed={isSelected}
                          className={`w-full rounded-2xl border-2 p-4 text-left transition ${
                            isSelected
                              ? "border-blue-600 bg-blue-50 shadow-md"
                              : "border-slate-200 bg-slate-50 hover:border-blue-300 hover:bg-blue-50/40"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="font-black text-slate-800">{bed.id}</p>
                              <p className="mt-1 text-xs font-bold text-emerald-600">
                                AVAILABLE
                              </p>
                            </div>

                            {isSelected && (
                              <span className="rounded-full bg-blue-600 px-3 py-1 text-[10px] font-black text-white">
                                SELECTED
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              <div>
                <h4 className="mb-3 text-sm font-black uppercase tracking-wide text-slate-500">
                  Available Emergency Doctors
                </h4>

                <div className="space-y-3">
                  {availableEmergencyDoctors.length === 0 ? (
                    <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
                      <p className="font-black text-red-600">
                        No emergency doctor available
                      </p>
                    </div>
                  ) : (
                    availableEmergencyDoctors.map((doctor) => {
                      const isSelected = selectedDoctor?.id === doctor.id;

                      return (
                        <button
                          key={doctor.id}
                          type="button"
                          onClick={() => setSelectedDoctor(doctor)}
                          aria-pressed={isSelected}
                          className={`w-full rounded-2xl border-2 p-4 text-left transition ${
                            isSelected
                              ? "border-emerald-600 bg-emerald-50 shadow-md"
                              : "border-slate-200 bg-slate-50 hover:border-emerald-300 hover:bg-emerald-50/40"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="font-black text-slate-800">
                                {doctor.name}
                              </p>
                              <p className="mt-1 text-xs font-bold text-slate-500">
                                {doctor.department}
                              </p>
                              <p className="mt-1 text-xs font-black text-emerald-600">
                                AVAILABLE
                              </p>
                            </div>

                            {isSelected && (
                              <span className="rounded-full bg-emerald-600 px-3 py-1 text-[10px] font-black text-white">
                                SELECTED
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div
                className={`rounded-2xl border p-4 ${
                  selectedBed
                    ? "border-blue-200 bg-blue-50"
                    : "border-slate-200 bg-slate-50"
                }`}
              >
                <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
                  Selected Bed
                </p>
                <p className="mt-1 font-black text-slate-800">
                  {selectedBed?.id || "Please select a bed"}
                </p>
              </div>

              <div
                className={`rounded-2xl border p-4 ${
                  selectedDoctor
                    ? "border-emerald-200 bg-emerald-50"
                    : "border-slate-200 bg-slate-50"
                }`}
              >
                <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
                  Selected Doctor
                </p>
                <p className="mt-1 font-black text-slate-800">
                  {selectedDoctor?.name || "Please select a doctor"}
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs font-bold text-slate-400">
                {selectedBed && selectedDoctor
                  ? "Both resources selected. Allocation is ready."
                  : "Select both resources to continue."}
              </p>

              <button
                type="button"
                onClick={confirmAllocation}
                disabled={!selectedBed || !selectedDoctor || savingEmergencyCase}
                className="rounded-2xl bg-red-600 px-8 py-4 text-sm font-black text-white shadow-lg transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {savingEmergencyCase ? "ALLOCATING..." : "CONFIRM ALLOCATION"}
              </button>
            </div>
          </section>
        )}

        {showDetailsForm && selectedEmergencyCase && (
          <section className="mt-6 rounded-[2rem] border-2 border-blue-200 bg-white p-6 shadow-xl">
            <div className="mb-6">
              <p className="text-xs font-black uppercase tracking-widest text-blue-600">
                Registration After Allocation
              </p>
              <h3 className="mt-1 text-2xl font-black text-[#12213d]">
                Enter Patient Details
              </h3>
              <p className="mt-1 text-sm font-bold text-slate-500">
                Bed and emergency doctor are already allocated.
              </p>
            </div>

            <div className="mb-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-blue-50 p-4">
                <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
                  Bed
                </p>
                <p className="mt-1 font-black text-blue-700">
                  {selectedEmergencyCase.emergencyBed?.id || "Not allocated"}
                </p>
              </div>

              <div className="rounded-2xl bg-emerald-50 p-4">
                <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
                  Doctor
                </p>
                <p className="mt-1 font-black text-emerald-700">
                  {selectedEmergencyCase.careDestination?.doctor?.name ||
                    "Not assigned"}
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                ["name", "Full Name", "text"],
                ["age", "Age", "number"],
                ["phone", "Phone", "text"],
                ["bloodGroup", "Blood Group", "text"],
              ].map(([field, label, type]) => (
                <label key={field} className="block">
                  <span className="mb-2 block text-xs font-black uppercase tracking-wide text-slate-500">
                    {label}
                  </span>
                  <input
                    type={type}
                    value={patientDetails[field]}
                    onChange={(event) =>
                      handlePatientDetailChange(field, event.target.value)
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-bold text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white"
                  />
                </label>
              ))}

              <label className="block">
                <span className="mb-2 block text-xs font-black uppercase tracking-wide text-slate-500">
                  Gender
                </span>
                <select
                  value={patientDetails.gender}
                  onChange={(event) =>
                    handlePatientDetailChange("gender", event.target.value)
                  }
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-bold text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </label>

              <label className="block sm:col-span-2">
                <span className="mb-2 block text-xs font-black uppercase tracking-wide text-slate-500">
                  Previous Conditions
                </span>
                <textarea
                  rows={3}
                  value={patientDetails.conditions}
                  onChange={(event) =>
                    handlePatientDetailChange("conditions", event.target.value)
                  }
                  placeholder="Example: Diabetes, hypertension"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-bold text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white"
                />
              </label>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={savePatientDetails}
                className="rounded-2xl bg-blue-600 px-8 py-4 text-sm font-black text-white shadow-lg transition hover:bg-blue-700"
              >
                SAVE PATIENT DETAILS
              </button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
