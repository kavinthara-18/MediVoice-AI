import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CalendarDays,
  Check,
  ChevronDown,
  Droplets,
  HeartPulse,
  Phone,
  ShieldCheck,
  UserRound,
  VenusAndMars,
} from "lucide-react";

const medicalConditions = [
  "None",
  "Asthma",
  "Diabetes",
  "Hypertension",
  "Heart Disease",
  "Thyroid",
  "Kidney Disease",
  "Other",
];

export default function PatientDetails() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    age: "",
    gender: "",
    bloodGroup: "",
    conditions: [],
    otherCondition: "",
  });

  const [error, setError] = useState("");

  useEffect(() => {
    const savedPatient = localStorage.getItem("medivoice_patient");

    if (savedPatient) {
      try {
        const patient = JSON.parse(savedPatient);

        setForm((prev) => ({
          ...prev,
          name: patient.name || "",
          phone: patient.phone || "",
          age: patient.age || "",
          gender: patient.gender || "",
          bloodGroup:
            patient.bloodGroup && patient.bloodGroup !== "Not provided"
              ? patient.bloodGroup
              : "",
          conditions: patient.conditions || [],
          otherCondition: patient.otherCondition || "",
        }));
      } catch {
        // Ignore invalid saved data
      }
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
  };

  const toggleCondition = (condition) => {
    setError("");

    setForm((prev) => {
      if (condition === "None") {
        const isSelected = prev.conditions.includes("None");

        return {
          ...prev,
          conditions: isSelected ? [] : ["None"],
          otherCondition: "",
        };
      }

      const withoutNone = prev.conditions.filter((item) => item !== "None");

      if (withoutNone.includes(condition)) {
        return {
          ...prev,
          conditions: withoutNone.filter((item) => item !== condition),
          otherCondition:
            condition === "Other" ? "" : prev.otherCondition,
        };
      }

      return {
        ...prev,
        conditions: [...withoutNone, condition],
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const age = Number(form.age);

    if (!form.name.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!/^[6-9]\d{9}$/.test(form.phone)) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    if (!form.age || age < 1 || age > 120) {
      setError("Please enter a valid age between 1 and 120.");
      return;
    }

    if (!form.gender) {
      setError("Please select your gender.");
      return;
    }

    if (form.conditions.includes("Other") && !form.otherCondition.trim()) {
      setError("Please specify the other medical condition.");
      return;
    }

    const patientData = {
      name: form.name.trim(),
      phone: form.phone,
      age,
      gender: form.gender,
      bloodGroup: form.bloodGroup || "Not provided",
      conditions:
        form.conditions.length > 0 ? form.conditions : ["Not provided"],
      otherCondition: form.otherCondition.trim(),
    };

    try {
      setError("");

      const response = await fetch("http://localhost:5000/api/patients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(patientData),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to save patient to the database."
        );
      }

      const savedPatient = {
        ...patientData,
        backendPatientId: data.patient?._id || null,
      };

      localStorage.setItem(
        "medivoice_patient",
        JSON.stringify(savedPatient)
      );

      navigate("/voice");
    } catch (error) {
      console.error("Patient Save Error:", error);
      setError(
        "Unable to save your details. Please make sure the MediVoice backend is running."
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#f3fafb] px-4 py-5 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <header className="mb-6 flex items-center justify-between rounded-3xl border border-slate-200 bg-white px-5 py-4 shadow-sm sm:px-7">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-50">
              <HeartPulse className="h-6 w-6 text-cyan-600" />
            </div>

            <div>
              <h1 className="text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
                MediVoice <span className="text-cyan-600">AI</span>
              </h1>

              <p className="text-[10px] font-bold tracking-[0.18em] text-slate-400 sm:text-xs">
                HEALTHCARE INTELLIGENCE
              </p>
            </div>
          </div>

          <div className="hidden items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-700 sm:flex">
            <ShieldCheck className="h-4 w-4" />
            SECURE PATIENT ACCESS
          </div>
        </header>

        {/* Main Card */}
        <main className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">

          {/* Top Section */}
          <div className="border-b border-slate-100 px-6 py-8 text-center sm:px-10 sm:py-10">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-50">
              <UserRound className="h-7 w-7 text-cyan-600" />
            </div>

            <p className="mb-2 text-xs font-black uppercase tracking-[0.22em] text-cyan-600">
              Patient Profile
            </p>

            <h2 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
              Complete your health profile
            </h2>

            <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
              Help MediVoice AI understand your background so your symptoms
              can be assessed and routed more accurately.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-7 sm:px-10 sm:py-9">

            {/* Basic Information */}
            <section>
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-50">
                  <UserRound className="h-4 w-4 text-cyan-600" />
                </div>

                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Personal Information
                  </h3>

                  <p className="text-xs text-slate-400">
                    Basic details for your patient profile
                  </p>
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-2">

                {/* Name */}
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Full Name
                  </label>

                  <div className="relative">
                    <UserRound className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 !pl-14 pr-4 text-sm font-medium text-slate-800 outline-none transition focus:border-cyan-400 focus:bg-white focus:ring-4 focus:ring-cyan-50"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Mobile Number
                  </label>

                  <div className="relative">
                    <Phone className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      maxLength={10}
                      placeholder="10-digit mobile number"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 !pl-14 pr-4 text-sm font-medium text-slate-800 outline-none transition focus:border-cyan-400 focus:bg-white focus:ring-4 focus:ring-cyan-50"
                    />
                  </div>
                </div>

                {/* Age */}
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Age
                  </label>

                  <div className="relative">
                    <CalendarDays className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                    <input
                      type="number"
                      name="age"
                      value={form.age}
                      onChange={handleChange}
                      min="1"
                      max="120"
                      placeholder="Enter your age"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 !pl-14 pr-4 text-sm font-medium text-slate-800 outline-none transition focus:border-cyan-400 focus:bg-white focus:ring-4 focus:ring-cyan-50"
                    />
                  </div>
                </div>

                {/* Gender */}
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Gender
                  </label>

                  <div className="relative">
                    <VenusAndMars className="pointer-events-none absolute left-4 top-1/2 z-10 h-5 w-5 -translate-y-1/2 text-slate-400" />

                    <select
                      name="gender"
                      value={form.gender}
                      onChange={handleChange}
                      className="w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 py-3.5 !pl-14 pr-10 text-sm font-medium text-slate-700 outline-none transition focus:border-cyan-400 focus:bg-white focus:ring-4 focus:ring-cyan-50"
                    >
                      <option value="">Select gender</option>
                      <option value="Female">Female</option>
                      <option value="Male">Male</option>
                      <option value="Other">Other</option>
                      <option value="Prefer not to say">
                        Prefer not to say
                      </option>
                    </select>

                    <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  </div>
                </div>

              </div>
            </section>

            {/* Medical Information */}
            <section className="mt-9 border-t border-slate-100 pt-8">

              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-50">
                  <HeartPulse className="h-4 w-4 text-cyan-600" />
                </div>

                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Medical Information
                  </h3>

                  <p className="text-xs text-slate-400">
                    Helps our AI provide better context
                  </p>
                </div>
              </div>

              {/* Blood Group */}
              <div className="mb-7 max-w-md">
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Blood Group
                  <span className="ml-2 text-xs font-medium text-slate-400">
                    Optional
                  </span>
                </label>

                <div className="relative">
                  <Droplets className="pointer-events-none absolute left-4 top-1/2 z-10 h-5 w-5 -translate-y-1/2 text-slate-400" />

                  <select
                    name="bloodGroup"
                    value={form.bloodGroup}
                    onChange={handleChange}
                    className="w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 py-3.5 !pl-14 pr-10 text-sm font-medium text-slate-700 outline-none transition focus:border-cyan-400 focus:bg-white focus:ring-4 focus:ring-cyan-50"
                  >
                    <option value="">Select blood group</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>

                  <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </div>
              </div>

              {/* Existing Conditions */}
              <div>
                <div className="mb-3">
                  <label className="block text-sm font-bold text-slate-700">
                    Existing Medical Conditions
                  </label>

                  <p className="mt-1 text-xs text-slate-400">
                    Select all conditions that apply
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {medicalConditions.map((condition) => {
                    const selected = form.conditions.includes(condition);

                    return (
                      <button
                        key={condition}
                        type="button"
                        onClick={() => toggleCondition(condition)}
                        className={`flex items-center justify-between rounded-2xl border px-4 py-3.5 text-left text-sm font-bold transition ${
                          selected
                            ? "border-cyan-400 bg-cyan-50 text-cyan-700 shadow-sm"
                            : "border-slate-200 bg-white text-slate-600 hover:border-cyan-200 hover:bg-slate-50"
                        }`}
                      >
                        <span>{condition}</span>

                        <span
                          className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                            selected
                              ? "border-cyan-500 bg-cyan-500 text-white"
                              : "border-slate-300 bg-white"
                          }`}
                        >
                          {selected && <Check className="h-3 w-3" />}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Other Condition */}
                {form.conditions.includes("Other") && (
                  <div className="mt-4 max-w-xl">
                    <label className="mb-2 block text-sm font-bold text-slate-700">
                      Please specify
                    </label>

                    <input
                      type="text"
                      name="otherCondition"
                      value={form.otherCondition}
                      onChange={handleChange}
                      placeholder="Enter your medical condition"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-medium text-slate-800 outline-none transition focus:border-cyan-400 focus:bg-white focus:ring-4 focus:ring-cyan-50"
                    />
                  </div>
                )}
              </div>
            </section>

            {/* Error */}
            {error && (
              <div className="mt-7 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                {error}
              </div>
            )}

            {/* Bottom CTA */}
            <div className="mt-9 flex flex-col gap-4 border-t border-slate-100 pt-7 sm:flex-row sm:items-center sm:justify-between">

              <div className="flex items-center gap-2 text-xs text-slate-400">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                Your information is securely used for this assessment.
              </div>

              <button
                type="submit"
                className="group flex items-center justify-center gap-3 rounded-2xl bg-slate-900 px-7 py-4 text-sm font-black text-white shadow-lg transition hover:bg-cyan-600 hover:shadow-cyan-100"
              >
                Continue to Voice Assessment
                <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
              </button>

            </div>
          </form>
        </main>
      </div>
    </div>
  );
}