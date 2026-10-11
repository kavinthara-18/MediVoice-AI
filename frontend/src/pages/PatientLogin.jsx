import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  HeartPulse,
  ShieldCheck,
  UserRound,
  Phone,
  LockKeyhole,
} from "lucide-react";
import logo from "../assets/logo/medivoice-logo.png";

function PatientLogin() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

  const handleContinue = () => {
    setError("");

    const cleanName = name.trim();
    const cleanPhone = phone.replace(/\D/g, "");

    if (!cleanName) {
      setError("Please enter your name.");
      return;
    }

    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    localStorage.setItem(
      "medivoice_patient",
      JSON.stringify({
        name: cleanName,
        phone: cleanPhone,
      })
    );

  navigate("/patient-details");
  };

  return (
    <div className="min-h-screen w-full bg-[#a8e0ed] relative overflow-hidden">

      {/* ================= BACKGROUND ================= */}

      <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full bg-white/10 blur-3xl" />

      <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-cyan-300/20 blur-3xl" />

      <div className="absolute top-24 -left-20 w-[400px] h-8 bg-blue-500/55 rotate-[-32deg] rounded-full" />

      <div className="absolute top-40 right-[-120px] w-[430px] h-10 bg-blue-500/45 rotate-[-32deg] rounded-full" />

      <div className="absolute bottom-16 left-[-120px] w-[380px] h-9 bg-blue-500/45 rotate-[-32deg] rounded-full" />


      {/* ================= MAIN ================= */}

      <main className="relative z-10 min-h-screen w-full flex items-center justify-center px-4 sm:px-8 py-8">

        {/* WHITE DASHBOARD */}

        <div className="relative w-full max-w-[1100px] mx-auto bg-white rounded-[2rem] sm:rounded-[3rem] shadow-[0_25px_80px_rgba(25,90,120,0.20)] overflow-hidden">

          {/* Soft Glow */}

          <div className="absolute -top-40 -right-40 w-[450px] h-[450px] bg-cyan-100/70 rounded-full blur-3xl pointer-events-none" />

          <div className="absolute -bottom-40 -left-40 w-[450px] h-[450px] bg-blue-50 rounded-full blur-3xl pointer-events-none" />


          {/* ================= HEADER ================= */}

          <header className="relative z-20 px-6 sm:px-10 lg:px-14 py-6">

            <div className="flex items-center justify-between gap-4">

              {/* BRAND */}

              <div className="flex items-center gap-3 min-w-0">

                <div className="w-12 h-12 sm:w-14 sm:h-14 shrink-0 rounded-full bg-white shadow-lg border border-slate-100 p-1.5">

                  <img
                    src={logo}
                    alt="MediVoice AI"
                    className="w-full h-full object-contain"
                  />

                </div>

                <div className="min-w-0">

                  <h2 className="text-xl sm:text-2xl font-black text-[#12213d] whitespace-nowrap">

                    Medi
                    <span className="text-blue-600">
                      Voice
                    </span>

                    <span className="text-cyan-500">
                      {" "}AI
                    </span>

                  </h2>

                  <p className="text-[8px] sm:text-[9px] tracking-[0.25em] font-bold text-slate-400 whitespace-nowrap">
                    HEALTHCARE INTELLIGENCE
                  </p>

                </div>

              </div>


              {/* PATIENT ACCESS */}

              <div className="hidden sm:flex shrink-0 items-center gap-2 mr-2 lg:mr-4">

                <HeartPulse
                  size={17}
                  className="text-blue-500 shrink-0"
                />

                <span className="text-[11px] lg:text-xs font-black tracking-wider text-slate-400 whitespace-nowrap">
                  PATIENT ACCESS
                </span>

              </div>

            </div>

          </header>


          {/* ================= CONTENT ================= */}

          <section className="relative z-10 px-6 sm:px-10 lg:px-20 pb-12">

            <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center max-w-5xl mx-auto">


              {/* ================= LEFT SIDE ================= */}

              <div className="text-center lg:text-left">

                {/* Badge */}

                <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 px-4 py-2 rounded-full">

                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />

                  <span className="text-xs font-black tracking-wider text-blue-600">
                    PATIENT ACCESS
                  </span>

                </div>


                {/* Heading */}

                <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.02] tracking-[-0.04em] text-[#12213d]">

                  Welcome,

                  <br />

                  <span className="text-blue-600">
                    Patient.
                  </span>

                </h1>


                <p className="mt-5 text-base sm:text-lg leading-7 text-slate-500 font-medium max-w-md mx-auto lg:mx-0">

                  Let's get you the right care.
                  Tell us a little about yourself before
                  starting your voice assessment.

                </p>


                {/* Voice Feature */}

                <div className="mt-7 flex items-center justify-center lg:justify-start gap-3">

                  <div className="w-11 h-11 rounded-xl bg-cyan-50 flex items-center justify-center shrink-0">

                    <HeartPulse
                      size={22}
                      className="text-cyan-600"
                    />

                  </div>

                  <div className="text-left">

                    <p className="text-sm font-black text-[#12213d]">
                      Voice-first healthcare
                    </p>

                    <p className="text-xs text-slate-400">
                      Speak naturally about your symptoms
                    </p>

                  </div>

                </div>

              </div>


              {/* ================= PATIENT DETAILS CARD ================= */}

              <div className="w-full max-w-md mx-auto">

                <div className="bg-white border border-slate-100 rounded-[2rem] shadow-[0_20px_50px_rgba(30,100,180,0.10)] p-6 sm:p-8">


                  {/* CARD HEADER */}

                  <div className="text-center">

                    {/* CENTERED PATIENT ICON */}

                    <div className="mx-auto w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center">

                      <UserRound
                        size={31}
                        strokeWidth={1.8}
                        className="text-blue-600"
                      />

                    </div>


                    <h2 className="mt-5 text-2xl font-black text-[#12213d]">
                      Patient Details
                    </h2>

                    <p className="mt-2 text-sm text-slate-400 font-medium">
                      Enter your details to continue
                    </p>

                  </div>


                  {/* ================= FULL NAME ================= */}

                  <div className="mt-7">

                    <label className="block text-sm font-black text-[#12213d] mb-2">
                      Full Name
                    </label>

                    <div className="relative w-full">

                      {/* ICON */}

                      <UserRound
                        size={19}
                        strokeWidth={2}
                        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-slate-400 pointer-events-none"
                      />


                      {/* INPUT */}

                      <input
                        type="text"
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value);
                          setError("");
                        }}
                        placeholder="Enter your full name"
                        className="relative z-0 w-full h-14 !pl-14 pr-4 rounded-xl border border-slate-200 bg-slate-50/70 outline-none text-[#12213d] font-medium placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition"
                      />

                    </div>

                  </div>


                  {/* ================= MOBILE NUMBER ================= */}

                  <div className="mt-5">

                    <label className="block text-sm font-black text-[#12213d] mb-2">
                      Mobile Number
                    </label>

                    <div className="relative w-full">

                      {/* ICON */}

                      <Phone
                        size={19}
                        strokeWidth={2}
                        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-slate-400 pointer-events-none"
                      />


                      {/* INPUT */}

                      <input
                        type="tel"
                        inputMode="numeric"
                        maxLength={10}
                        value={phone}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, "");

                          if (value.length <= 10) {
                            setPhone(value);
                            setError("");
                          }
                        }}
                        placeholder="10-digit mobile number"
                        className="relative z-0 w-full h-14 !pl-14 pr-4 rounded-xl border border-slate-200 bg-slate-50/70 outline-none text-[#12213d] font-medium placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition"
                      />

                    </div>

                  </div>


                  {/* ================= ERROR ================= */}

                  {error && (

                    <div className="mt-4 bg-red-50 border border-red-100 rounded-xl px-4 py-3">

                      <p className="text-sm text-red-600 font-semibold">
                        {error}
                      </p>

                    </div>

                  )}


                  {/* ================= CONTINUE BUTTON ================= */}

                  <button
                    onClick={handleContinue}
                    className="mt-6 w-full h-14 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-base flex items-center justify-center gap-2 shadow-lg shadow-blue-200 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
                  >

                    Continue to Voice Assessment

                    <ArrowRight
                      size={19}
                    />

                  </button>


                  {/* ================= SESSION SECURITY ================= */}

                  <div className="mt-5 flex items-center justify-center gap-2 text-center">

                    <LockKeyhole
                      size={14}
                      className="text-emerald-500 shrink-0"
                    />

                    <span className="text-[11px] font-semibold text-slate-400">
                      Your information is used for this session
                    </span>

                  </div>

                </div>


                {/* SECURE ACCESS */}

                <div className="mt-4 flex items-center justify-center gap-2">

                  <ShieldCheck
                    size={17}
                    className="text-emerald-500"
                  />

                  <span className="text-xs font-bold text-slate-400">
                    Secure healthcare access
                  </span>

                </div>

              </div>

            </div>

          </section>


          {/* ================= FOOTER ================= */}

          <div className="relative z-10 border-t border-slate-100 px-6 py-4 text-center">

            <p className="text-[10px] tracking-[0.25em] font-black text-slate-300">
              MEDIVOICE AI • INTELLIGENT HEALTHCARE
            </p>

          </div>

        </div>

      </main>

    </div>
  );
}

export default PatientLogin;