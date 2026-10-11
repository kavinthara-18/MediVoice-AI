import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  HeartPulse,
  MapPin,
  Stethoscope,
  UserRound,
} from "lucide-react";
import doctors from "../data/doctor";
import logo from "../assets/logo/medivoice-logo.png";

export default function DoctorPortal() {
  const navigate = useNavigate();

  const availableDoctors = useMemo(
    () => doctors.filter((doctor) => doctor.status === "AVAILABLE"),
    []
  );

  const handleDoctorSelect = (doctor) => {
    localStorage.setItem("medivoice_selected_doctor", JSON.stringify(doctor));
    navigate("/doctor-dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#eafaff] via-white to-[#e7f8f8] px-4 py-6 sm:px-6 lg:py-10">
      <div className="mx-auto w-full max-w-6xl">
        <header className="mb-7 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate("/roles")}
            className="flex items-center gap-3"
          >
            <img
              src={logo}
              alt="MediVoice AI"
              className="h-12 w-12 rounded-2xl bg-white p-1 shadow-sm"
            />
            <div className="text-left">
              <h1 className="text-xl font-black text-[#12213d]">
                Medi<span className="text-blue-600">Voice</span>{" "}
                <span className="text-cyan-500">AI</span>
              </h1>
              <p className="text-[9px] font-bold tracking-[0.2em] text-slate-400">
                DOCTOR ACCESS
              </p>
            </div>
          </button>

          <div className="hidden items-center gap-2 rounded-full border border-emerald-100 bg-white px-4 py-2 text-xs font-black text-emerald-700 shadow-sm sm:flex">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
            SECURE ACCESS
          </div>
        </header>

        <main className="overflow-hidden rounded-[2rem] border border-white bg-white shadow-[0_25px_80px_rgba(25,90,120,0.14)]">
          <section className="relative overflow-hidden bg-gradient-to-r from-slate-950 via-slate-900 to-cyan-900 px-6 py-10 text-white sm:px-10 lg:px-14">
            <div className="absolute -right-20 -top-28 h-72 w-72 rounded-full bg-cyan-400/15 blur-3xl" />

            <div className="relative max-w-3xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-2 text-xs font-black tracking-wider text-cyan-100">
                <Stethoscope className="h-4 w-4" />
                DOCTOR PORTAL
              </div>

              <h2 className="text-3xl font-black tracking-tight sm:text-5xl">
                Select your doctor profile
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
                Choose your profile to open your personal patient queue,
                consultations, and assigned care information.
              </p>
            </div>
          </section>

          <section className="p-5 sm:p-8 lg:p-10">
            <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-cyan-600">
                  Available Profiles
                </p>
                <h3 className="mt-1 text-2xl font-black text-[#12213d]">
                  Choose your account
                </h3>
              </div>

              <span className="w-fit rounded-full bg-emerald-50 px-3.5 py-2 text-xs font-black text-emerald-700">
                {availableDoctors.length} doctors available
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {availableDoctors.map((doctor) => (
                <button
                  key={doctor.id}
                  type="button"
                  onClick={() => handleDoctorSelect(doctor)}
                  className="group relative overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white p-5 text-left shadow-sm transition duration-200 hover:-translate-y-1 hover:border-cyan-300 hover:shadow-xl"
                >
                  <div className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    <span className="text-[9px] font-black uppercase text-emerald-700">
                      Available
                    </span>
                  </div>

                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600 transition group-hover:bg-cyan-600 group-hover:text-white">
                    <UserRound className="h-7 w-7" />
                  </div>

                  <h4 className="mt-5 text-xl font-black text-[#12213d]">
                    {doctor.name}
                  </h4>

                  <p className="mt-1 text-sm font-bold text-cyan-700">
                    {doctor.department}
                  </p>

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-[9px] font-black uppercase text-slate-400">
                        Room
                      </p>
                      <p className="mt-1 text-sm font-black text-slate-800">
                        {doctor.room}
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-[9px] font-black uppercase text-slate-400">
                        Floor
                      </p>
                      <p className="mt-1 text-sm font-black text-slate-800">
                        {doctor.floor}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                    <span className="text-sm font-black text-slate-700">
                      Open Doctor Desk
                    </span>
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-950 text-white transition group-hover:bg-cyan-600">
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {availableDoctors.length === 0 && (
              <div className="rounded-3xl border border-amber-200 bg-amber-50 p-8 text-center">
                <CheckCircle2 className="mx-auto h-8 w-8 text-amber-600" />
                <p className="mt-3 font-black text-amber-800">
                  No doctors are currently available.
                </p>
              </div>
            )}

            <div className="mt-7 flex items-start gap-3 rounded-2xl border border-cyan-100 bg-cyan-50/60 p-4">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-cyan-600" />
              <p className="text-xs leading-5 text-slate-600 sm:text-sm">
                Each doctor profile will open a dedicated workspace with the
                doctor’s department, room, and patient queue.
              </p>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
