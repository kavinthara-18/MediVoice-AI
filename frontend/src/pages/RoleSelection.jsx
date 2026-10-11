import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  HeartPulse,
  UserRound,
  Stethoscope,
  ShieldCheck,
  Siren,
} from "lucide-react";
import logo from "../assets/logo/medivoice-logo.png";

function RoleSelection() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full bg-[#a8e0ed] relative overflow-hidden">

      {/* ================= BACKGROUND DECORATION ================= */}

      <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full bg-white/10 blur-3xl" />

      <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-cyan-300/20 blur-3xl" />

      <div className="absolute top-24 -left-20 w-[400px] h-8 bg-blue-500/55 rotate-[-32deg] rounded-full" />

      <div className="absolute top-40 right-[-120px] w-[430px] h-10 bg-blue-500/45 rotate-[-32deg] rounded-full" />

      <div className="absolute bottom-16 left-[-120px] w-[380px] h-9 bg-blue-500/45 rotate-[-32deg] rounded-full" />

      <div className="absolute bottom-20 right-[22%] w-52 h-3 bg-pink-300/50 rotate-[-32deg] rounded-full" />


      {/* ================= CENTER MAIN AREA ================= */}

      <main className="relative z-10 min-h-screen w-full flex items-center justify-center px-4 sm:px-8 py-8">

        {/* ================= WHITE DASHBOARD ================= */}

        <div className="relative w-full max-w-[1200px] mx-auto bg-white rounded-[2rem] sm:rounded-[3rem] shadow-[0_25px_80px_rgba(25,90,120,0.20)] overflow-hidden">

          {/* Soft background glow */}

          <div className="absolute -top-40 -right-40 w-[450px] h-[450px] bg-cyan-100/70 rounded-full blur-3xl pointer-events-none" />

          <div className="absolute -bottom-40 -left-40 w-[450px] h-[450px] bg-blue-50 rounded-full blur-3xl pointer-events-none" />


          {/* ===================================================== */}
          {/* HEADER */}
          {/* ===================================================== */}

          <header className="relative z-20 px-6 sm:px-10 lg:px-14 py-6">

            <div className="flex items-center justify-between">

              {/* LOGO + BRAND */}

              <div className="flex items-center gap-3">

                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white shadow-lg border border-slate-100 p-1.5">

                  <img
                    src={logo}
                    alt="MediVoice AI"
                    className="w-full h-full object-contain"
                  />

                </div>

                <div>

                  <h2 className="text-xl sm:text-2xl font-black text-[#12213d]">

                    Medi
                    <span className="text-blue-600">
                      Voice
                    </span>

                    <span className="text-cyan-500">
                      {" "}AI
                    </span>

                  </h2>

                  <p className="text-[8px] sm:text-[9px] tracking-[0.25em] font-bold text-slate-400">
                    HEALTHCARE INTELLIGENCE
                  </p>

                </div>

              </div>


              {/* HEADER RIGHT */}

              <div className="hidden sm:flex items-center gap-2">

                <HeartPulse
                  size={17}
                  className="text-blue-500"
                />

                <span className="text-xs font-bold tracking-wider text-slate-400">
                  SECURE HEALTHCARE ACCESS
                </span>

              </div>

            </div>

          </header>


          {/* ===================================================== */}
          {/* CENTERED HEADING SECTION */}
          {/* ===================================================== */}

          <section className="relative z-10 px-6 sm:px-10 pt-7 sm:pt-10">

            <div className="w-full max-w-4xl mx-auto text-center">

              {/* PERSONALIZED ACCESS */}

              <div className="inline-flex items-center gap-2 bg-cyan-50 border border-cyan-100 px-4 py-2 rounded-full">

                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />

                <span className="text-xs font-black tracking-wider text-blue-600">
                  PERSONALIZED ACCESS
                </span>

              </div>


              {/* MAIN HEADING */}

              <h1 className="mt-5 mx-auto text-center w-full text-4xl sm:text-5xl lg:text-6xl font-black leading-[1] tracking-[-0.04em] text-[#12213d]">

                How can we help

                <br />

                <span className="text-blue-600">
                  you?
                </span>

              </h1>


              {/* SUBTITLE */}

              <p className="mt-4 text-center text-base sm:text-lg text-slate-500 font-medium">

                Select your role to continue with MediVoice AI.

              </p>

            </div>

          </section>


          {/* ===================================================== */}
          {/* ROLE CARDS — CENTERED 2 × 2 */}
          {/* ===================================================== */}

          <section className="relative z-10 px-6 sm:px-10 lg:px-14 mt-10 sm:mt-12">

            <div className="w-full max-w-[900px] mx-auto">

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">


                {/* ================================================= */}
                {/* PATIENT */}
                {/* ================================================= */}

                <button
                  onClick={() => navigate("/patient-login")}
                  className="group relative min-h-[235px] bg-white border-2 border-blue-200 hover:border-blue-500 rounded-[2rem] p-6 sm:p-7 flex flex-col items-center text-center shadow-[0_15px_40px_rgba(30,100,180,0.10)] hover:shadow-[0_20px_50px_rgba(30,100,180,0.20)] hover:-translate-y-1 transition-all duration-300"
                >

                  {/* AVAILABLE */}

                  <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-emerald-50 px-2.5 py-1 rounded-full">

                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />

                    <span className="text-[8px] font-black text-emerald-600 uppercase">
                      Available
                    </span>

                  </div>


                  {/* ICON */}

                  <div className="mt-3 w-20 h-20 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center group-hover:bg-blue-600 group-hover:scale-105 transition-all duration-300">

                    <UserRound
                      size={38}
                      strokeWidth={1.8}
                      className="text-blue-600 group-hover:text-white transition-colors duration-300"
                    />

                  </div>


                  {/* TITLE */}

                  <h2 className="mt-5 text-2xl font-black text-[#12213d]">
                    Patient
                  </h2>


                  {/* DESCRIPTION */}

                  <p className="mt-2 text-sm leading-5 text-slate-500 font-medium">
                    Voice-based symptom assessment
                  </p>


                  {/* CONTINUE */}

                  <div className="mt-auto pt-4 flex items-center gap-2 text-sm font-black text-blue-600">

                    Continue

                    <ArrowRight
                      size={17}
                      className="group-hover:translate-x-1 transition-transform"
                    />

                  </div>

                </button>


                {/* ================================================= */}
                {/* DOCTOR */}
                {/* ================================================= */}

                <button
                  type="button"
                  onClick={() => navigate("/doctor-selection")}
                  className="group relative min-h-[235px] bg-white border-2 border-cyan-200 hover:border-cyan-500 rounded-[2rem] p-6 sm:p-7 flex flex-col items-center text-center shadow-[0_15px_40px_rgba(30,100,180,0.10)] hover:shadow-[0_20px_50px_rgba(30,100,180,0.20)] hover:-translate-y-1 transition-all duration-300"
                >

                  {/* AVAILABLE */}

                  <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-emerald-50 px-2.5 py-1 rounded-full">

                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />

                    <span className="text-[8px] font-black text-emerald-600 uppercase">
                      Available
                    </span>

                  </div>


                  {/* ICON */}

                  <div className="mt-3 w-20 h-20 rounded-full bg-cyan-50 border border-cyan-100 flex items-center justify-center group-hover:bg-cyan-600 group-hover:scale-105 transition-all duration-300">

                    <Stethoscope
                      size={38}
                      strokeWidth={1.8}
                      className="text-cyan-600 group-hover:text-white transition-colors duration-300"
                    />

                  </div>


                  <h2 className="mt-5 text-2xl font-black text-[#12213d]">
                    Doctor
                  </h2>


                  <p className="mt-2 text-sm leading-5 text-slate-500 font-medium">
                    Patient queue & consultations
                  </p>


                  <div className="mt-auto pt-4 flex items-center gap-2 text-sm font-black text-cyan-600">

                    Continue

                    <ArrowRight
                      size={17}
                      className="group-hover:translate-x-1 transition-transform"
                    />

                  </div>

                </button>


                {/* ================================================= */}
                {/* ADMIN */}
                {/* ================================================= */}

                <button
                  type="button"
                  onClick={() => navigate("/admin-dashboard")}
                  className="group relative min-h-[235px] bg-white/80 border border-slate-200 rounded-[2rem] p-6 sm:p-7 flex flex-col items-center text-center shadow-[0_10px_30px_rgba(30,100,180,0.06)]">

                  {/* ICON */}

                  <div className="mt-3 w-20 h-20 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center">

                    <ShieldCheck
                      size={38}
                      strokeWidth={1.8}
                      className="text-indigo-500"
                    />

                  </div>


                  <h2 className="mt-5 text-2xl font-black text-[#12213d]">
                    Admin
                  </h2>


                  <p className="mt-2 text-sm leading-5 text-slate-500 font-medium">
                    Hospital operations management
                  </p>




                  <div className="mt-auto pt-4 flex items-center gap-2 text-sm font-black text-indigo-600">
                    Open Admin Dashboard <ArrowRight size={17} className="group-hover:translate-x-1 transition-transform" />
                  </div>

                </button>


                {/* ================================================= */}
                {/* EMERGENCY */}
                {/* ================================================= */}

               {/* ================================================= */}
{/* EMERGENCY */}
{/* ================================================= */}

<button
  type="button"
  onClick={() => navigate("/emergency-dashboard")}
  className="group relative min-h-[235px] w-full bg-white border-2 border-red-200 hover:border-red-500 rounded-[2rem] p-6 sm:p-7 flex flex-col items-center text-center shadow-[0_15px_40px_rgba(220,38,38,0.08)] hover:shadow-[0_20px_50px_rgba(220,38,38,0.18)] hover:-translate-y-1 transition-all duration-300"
>
  {/* STATUS */}
  <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-red-50 px-2.5 py-1 rounded-full">
    <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />

    <span className="text-[8px] font-black text-red-600 uppercase">
      Emergency
    </span>
  </div>

  {/* ICON */}
  <div className="mt-3 w-20 h-20 rounded-full bg-red-50 border border-red-100 flex items-center justify-center group-hover:bg-red-600 group-hover:scale-105 transition-all duration-300">
    <Siren
      size={38}
      strokeWidth={1.8}
      className="text-red-500 group-hover:text-white transition-colors duration-300"
    />
  </div>

  {/* TITLE */}
  <h2 className="mt-5 text-2xl font-black text-[#12213d]">
    Emergency
  </h2>

  {/* DESCRIPTION */}
  <p className="mt-2 text-sm leading-5 text-slate-500 font-medium">
    Emergency fast-track & resource allocation
  </p>

  {/* CONTINUE */}
  <div className="mt-auto pt-4 flex items-center gap-2 text-sm font-black text-red-600">
    Open Emergency Dashboard

    <ArrowRight
      size={17}
      className="group-hover:translate-x-1 transition-transform"
    />
  </div>
</button>


              </div>

            </div>

          </section>


          {/* ===================================================== */}
          {/* BOTTOM SECURITY INFORMATION */}
          {/* ===================================================== */}

          <section className="relative z-10 px-6 sm:px-10 lg:px-14 mt-9 pb-8">

            <div className="w-full max-w-[900px] mx-auto bg-[#f7fbfd] border border-slate-100 rounded-2xl px-5 py-4">

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">


                {/* LEFT SIDE */}

                <div className="flex items-center gap-3">

                  <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">

                    <ShieldCheck
                      size={20}
                      className="text-emerald-500"
                    />

                  </div>


                  <div>

                    <p className="text-sm font-black text-[#12213d]">
                      Designed for secure healthcare access
                    </p>

                    <p className="text-xs text-slate-400 font-medium">
                      Your selected role determines the available experience.
                    </p>

                  </div>

                </div>


                {/* RIGHT SIDE */}

                <div className="flex items-center gap-2">

                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />

                  <span className="text-xs font-black text-emerald-600">
                    SYSTEM READY
                  </span>

                </div>


              </div>

            </div>

          </section>


        </div>

      </main>

    </div>
  );
}

export default RoleSelection;