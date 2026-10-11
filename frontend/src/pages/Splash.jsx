import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { HeartPulse, Activity } from "lucide-react";
import logo from "../assets/logo/medivoice-logo.png";

function Splash() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/welcome");
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-cyan-700 flex items-center justify-center px-6 overflow-hidden relative">

      {/* Background glow */}
      <div className="absolute w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl -top-32 -left-32" />
      <div className="absolute w-96 h-96 bg-blue-500/20 rounded-full blur-3xl -bottom-32 -right-32" />

      {/* Decorative pulse line */}
      <div className="absolute top-20 left-0 right-0 opacity-20">
        <div className="flex items-center justify-center gap-3 text-cyan-300">
          <Activity size={24} />
          <div className="w-40 h-px bg-cyan-300" />
          <HeartPulse size={30} />
          <div className="w-40 h-px bg-cyan-300" />
          <Activity size={24} />
        </div>
      </div>

      <div className="relative z-10 text-center max-w-3xl">

        {/* Logo */}
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-cyan-400/30 blur-2xl rounded-full animate-pulse" />

          <img
            src={logo}
            alt="MediVoice AI"
            className="relative w-36 h-36 sm:w-44 sm:h-44 mx-auto rounded-full bg-white p-3 shadow-2xl animate-pulse"
          />
        </div>

        {/* Brand */}
        <h1 className="mt-8 text-5xl sm:text-7xl font-black tracking-tight text-white">
          Medi<span className="text-cyan-300">Voice</span> AI
        </h1>

        <p className="mt-4 text-base sm:text-xl font-medium text-blue-100 tracking-wide">
          AI-Powered Voice Triage & Smart Hospital Routing
        </p>

        {/* Loading */}
        <div className="mt-12 flex flex-col items-center">

          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 bg-cyan-300 rounded-full animate-bounce" />
            <div className="w-2.5 h-2.5 bg-cyan-300 rounded-full animate-bounce [animation-delay:150ms]" />
            <div className="w-2.5 h-2.5 bg-cyan-300 rounded-full animate-bounce [animation-delay:300ms]" />
          </div>

          <p className="mt-4 text-sm font-semibold tracking-[0.25em] text-cyan-100 uppercase">
            Initializing Healthcare AI
          </p>

        </div>

      </div>

      {/* Bottom label */}
      <div className="absolute bottom-8 text-center text-xs text-blue-200/70 tracking-[0.3em] font-semibold">
        INTELLIGENT • ACCESSIBLE • PATIENT-FIRST
      </div>

    </div>
  );
}

export default Splash;