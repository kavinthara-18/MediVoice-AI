import { useNavigate } from "react-router-dom";
import { ArrowRight, HeartPulse, Sparkles } from "lucide-react";
import logo from "../assets/logo/medivoice-logo.png";

function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#a8e0ed] relative overflow-hidden">

      {/* ================= BACKGROUND ================= */}

      <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full bg-white/10 blur-3xl" />

      <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full bg-cyan-300/20 blur-3xl" />

      {/* Decorative diagonal shapes */}

      <div className="absolute top-24 -left-16 w-[430px] h-8 bg-blue-500/65 rotate-[-32deg] rounded-full" />

      <div className="absolute top-40 right-[-100px] w-[420px] h-10 bg-blue-500/50 rotate-[-32deg] rounded-full" />

      <div className="absolute bottom-20 left-[-100px] w-[380px] h-10 bg-blue-500/50 rotate-[-32deg] rounded-full" />

      <div className="absolute bottom-16 left-[25%] w-64 h-3 bg-pink-300/60 rotate-[-32deg] rounded-full" />


      {/* ================= MAIN WHITE PANEL ================= */}

      <main className="relative z-10 min-h-screen flex items-center justify-center px-4 sm:px-8 py-6 sm:py-8">

        <div className="relative w-full max-w-6xl min-h-[650px] sm:min-h-[700px] bg-white rounded-[2rem] sm:rounded-[3rem] shadow-[0_25px_80px_rgba(25,90,120,0.20)] overflow-hidden">


          {/* Soft inner glow */}

          <div className="absolute -top-40 -right-40 w-[450px] h-[450px] bg-cyan-100/70 rounded-full blur-3xl" />

          <div className="absolute -bottom-40 -left-40 w-[450px] h-[450px] bg-blue-50 rounded-full blur-3xl" />


          {/* ================= HEADER ================= */}

          <header className="relative z-20 px-6 sm:px-10 lg:px-14 py-6">

            <div className="flex items-center gap-3">

              {/* Logo */}

              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white shadow-lg border border-slate-100 p-1.5">

                <img
                  src={logo}
                  alt="MediVoice AI"
                  className="w-full h-full object-contain"
                />

              </div>


              {/* Brand */}

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

          </header>


          {/* ================= HERO ================= */}

          <section className="relative z-10 grid lg:grid-cols-2 gap-6 lg:gap-0 items-center px-6 sm:px-10 lg:px-14 pt-6 sm:pt-10">


            {/* ================= LEFT CONTENT ================= */}

            <div className="relative max-w-xl text-center lg:text-left mx-auto lg:mx-0">

              {/* Small label */}

              <div className="inline-flex items-center gap-2 bg-cyan-50 border border-cyan-100 px-4 py-2 rounded-full">

                <Sparkles
                  size={14}
                  className="text-cyan-500"
                />

                <span className="text-xs font-black tracking-wider text-blue-600">
                  SMART HEALTHCARE
                </span>

              </div>


              {/* Main Heading */}

              <h1 className="mt-6 text-5xl sm:text-6xl lg:text-[4.3rem] font-black leading-[0.98] tracking-[-0.04em] text-[#12213d]">

                Your health,

                <br />

                <span className="text-blue-600">
                  our priority.
                </span>

              </h1>


              {/* Description */}

              <p className="mt-6 max-w-lg mx-auto lg:mx-0 text-base sm:text-lg leading-8 text-slate-500 font-medium">

                Speak naturally about your symptoms.
                MediVoice AI listens, understands and
                helps connect you with the right care.

              </p>


              {/* ================= BIG CENTER GET STARTED ================= */}

              <div className="flex justify-center lg:justify-start">

                <button
                  onClick={() => navigate("/roles")}
                  className="group mt-10 inline-flex items-center justify-center gap-5 bg-blue-600 hover:bg-blue-700 text-white px-10 sm:px-14 py-5 sm:py-6 rounded-full font-black text-xl sm:text-2xl shadow-[0_15px_35px_rgba(37,99,235,0.30)] hover:shadow-[0_20px_45px_rgba(37,99,235,0.38)] hover:-translate-y-1 transition-all duration-300"
                >

                  <span>
                    Get Started
                  </span>

                  <span className="w-11 h-11 sm:w-12 sm:h-12 bg-white/15 rounded-full flex items-center justify-center">

                    <ArrowRight
                      size={24}
                      className="group-hover:translate-x-1 transition-transform duration-300"
                    />

                  </span>

                </button>

              </div>

            </div>


            {/* ================= RIGHT MEDICAL VISUAL ================= */}

            <div className="relative min-h-[360px] sm:min-h-[440px] flex items-center justify-center">


              {/* Large aqua circle */}

              <div className="absolute w-[270px] h-[270px] sm:w-[380px] sm:h-[380px] rounded-full bg-gradient-to-br from-cyan-100 to-blue-100" />


              {/* Outer ring */}

              <div className="absolute w-[310px] h-[310px] sm:w-[430px] sm:h-[430px] rounded-full border-2 border-cyan-100" />


              {/* ================= HEART ================= */}

              <div className="absolute top-[18%] left-[5%] sm:left-[2%] z-20">

                <div className="relative">

                  <div className="absolute inset-0 bg-red-300/30 blur-xl rounded-full" />

                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-red-400 to-rose-600 flex items-center justify-center shadow-xl">

                    <HeartPulse
                      size={45}
                      className="text-white"
                      strokeWidth={2}
                    />

                  </div>

                </div>

              </div>


              {/* ================= ECG LINE ================= */}

              <div className="absolute top-[43%] left-[-10px] sm:left-[-35px] z-20">

                <svg
                  width="250"
                  height="90"
                  viewBox="0 0 250 90"
                  fill="none"
                >

                  <path
                    d="M0 45 H45 L55 45 L66 18 L80 72 L95 40 L108 45 H250"
                    stroke="#1769ff"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                </svg>

              </div>


              {/* ================= CENTRAL LOGO ================= */}

              <div className="relative z-10 w-56 h-56 sm:w-72 sm:h-72 rounded-full bg-white shadow-[0_25px_70px_rgba(30,100,180,0.18)] flex items-center justify-center">

                <div className="w-44 h-44 sm:w-56 sm:h-56 rounded-full bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center">

                  <div className="relative">

                    <div className="absolute inset-0 bg-cyan-300/30 blur-2xl rounded-full" />

                    <img
                      src={logo}
                      alt="MediVoice AI"
                      className="relative w-32 h-32 sm:w-40 sm:h-40 object-contain"
                    />

                  </div>

                </div>

              </div>


            </div>

          </section>


          {/* ================= BOTTOM DECORATIVE SPACE ================= */}

          <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-blue-50/40 to-transparent pointer-events-none" />

        </div>

      </main>

    </div>
  );
}

export default Welcome;