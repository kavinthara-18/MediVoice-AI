import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";

import {
  Mic,
  Square,
  Trash2,
  Brain,
  Activity,
  AlertTriangle,
  ShieldCheck,
  Send,
} from "lucide-react";

import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";

import { analyzeSymptomsWithNLP } from "../services/nlp"; 
import doctors from "../data/doctor";

import logo from "../assets/logo/medivoice-logo.png";


function getRecommendedDepartment(nextStep, severity, symptoms) {
  const text = `${nextStep || ""} ${severity || ""} ${(symptoms || [])
    .map((item) => item.name || item)
    .join(" ")}`.toLowerCase();

  // Emergency cases always go to Emergency Medicine.
  if (
    String(severity).toUpperCase() === "CRITICAL" ||
    text.includes("emergency") ||
    text.includes("critical")
  ) {
    return "Emergency Medicine";
  }

  // Match the department names to the actual doctor database.
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

  // No Neurologist or Dermatologist is currently in the doctor list.
  // Route those cases to General Medicine instead of creating an
  // unassigned case.
 if (
  text.includes("dermat") ||
  text.includes("skin") ||
  text.includes("rash") ||
  text.includes("itch") ||
  text.includes("acne") ||
  text.includes("pimple") ||
  text.includes("lesion") ||
  text.includes("skin damage") ||
  text.includes("red patch") ||
  text.includes("skin irritation")
) {
  return "Dermatologist";
}

if (
  text.includes("neuro") ||
  text.includes("headache") ||
  text.includes("migraine") ||
  text.includes("dizziness")
) {
  return "General Medicine";
}

  return "General Medicine";
}

function findAvailableDoctor(department) {
  if (!department) return null;

  const target = String(department).toLowerCase().trim();

  // Emergency cases go directly to DR. THARA
  if (target === "emergency medicine") {
    return (
      doctors.find(
        (doctor) =>
          doctor.name === "DR. THARA" &&
          doctor.department === "Emergency Medicine" &&
          doctor.status === "AVAILABLE"
      ) || null
    );
  }

  const aliases = {
    cardiology: "cardiologist",
    pulmonology: "pulmonologist",
    general: "general medicine",
    "general physician": "general physician",
  };

  const normalizedTarget = aliases[target] || target;

  return (
    doctors.find((doctor) => {
      const doctorDepartment = String(doctor.department || "")
        .toLowerCase()
        .trim();

      return (
        doctorDepartment === normalizedTarget &&
        doctor.status === "AVAILABLE"
      );
    }) ||
    doctors.find((doctor) => {
      const doctorDepartment = String(doctor.department || "")
        .toLowerCase()
        .trim();

      return doctorDepartment === normalizedTarget;
    }) ||
    null
  );
}

function VoiceAssistant() {
  const navigate = useNavigate();

  // =========================================================
  // STATE
  // =========================================================

  const [analysis, setAnalysis] = useState("");
  const [loading, setLoading] = useState(false);
  const [autoSendSkinCase, setAutoSendSkinCase] = useState(false);


  // =========================================================
  // SPEECH RECOGNITION
  // =========================================================

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();


  // =========================================================
  // BROWSER SUPPORT CHECK
  // =========================================================

  if (!browserSupportsSpeechRecognition) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#eaf8ff] via-white to-[#dff7f8] flex items-center justify-center px-6">

        <div className="bg-white rounded-3xl shadow-xl border border-red-100 p-10 max-w-md text-center">

          <div className="w-16 h-16 mx-auto rounded-2xl bg-red-50 flex items-center justify-center">
            <AlertTriangle className="text-red-500" size={30} />
          </div>

          <h1 className="text-2xl font-black text-[#12213d] mt-5">
            Speech Recognition Unavailable
          </h1>

          <p className="text-gray-500 mt-3">
            Your browser doesn't support speech recognition.
            Please use a supported browser.
          </p>

        </div>

      </div>
    );
  }


  // =========================================================
  // START LISTENING
  // =========================================================

  const startListening = () => {
    resetTranscript();

    setAnalysis("");

    SpeechRecognition.startListening({
      continuous: true,
      language: "en-GB",
    });
  };


  // =========================================================
  // STOP LISTENING
  // =========================================================

  const stopListening = () => {
    SpeechRecognition.stopListening();
  };


  // =========================================================
  // CLEAR
  // =========================================================

  const handleClear = () => {
    resetTranscript();
    setAnalysis("");
  };


  // =========================================================
  // ANALYZE SYMPTOMS
  // =========================================================

  const handleAnalyze = async () => {
  if (!transcript.trim()) {
    alert("Please speak your symptoms first.");
    return;
  }

  try {
    setLoading(true);

    console.log("🧠 Starting Local NLP Analysis...");

    const result = analyzeSymptomsWithNLP(
      transcript
    );

    console.log("✅ NLP Analysis Result:", result);
    /*
      Convert NLP result into the same format
      already expected by your existing UI.
    */

    const formattedAnalysis = `
### DETECTED SYMPTOMS

${result.symptoms.length > 0
  ? result.symptoms
      .map(
        (item) =>
          `- Symptom: ${item.name} | Severity: ${item.severity}`
      )
      .join("\n")
  : "- No symptoms detected"}

### POSSIBLE CONDITIONS

${result.conditions.length > 0
  ? result.conditions
      .map((condition) => `- ${condition}`)
      .join("\n")
  : "- None identified"}

### OVERALL SEVERITY

${result.severity}

### RECOMMENDED NEXT STEP

${result.nextStep}

### EMERGENCY WARNING

${result.emergency}
`;

    setAnalysis(formattedAnalysis);

  } catch (error) {
    console.error("❌ NLP Error:", error);

    setAnalysis(`
### DETECTED SYMPTOMS

- Unable to analyze symptoms

### OVERALL SEVERITY

LOW

### RECOMMENDED NEXT STEP

Please consult a healthcare professional for further evaluation.

### EMERGENCY WARNING

Unable to determine emergency warning signs.
`);
  } finally {
    setLoading(false);
  }
};
  const handleSendToDoctor = async () => {
    if (!analysis || !transcript.trim()) {
      
      alert("Please analyze your symptoms before sending to the doctor.");
      return;
    }
    const sensitiveSkinArea =
  /\b(private area|private parts|private part|genital area|genitals|groin|genital itching|genital rash)\b/i.test(
    transcript
  );

    const savedPatient = localStorage.getItem("medivoice_patient");

    if (!savedPatient) {
      alert("Patient details not found. Please complete your patient profile.");
      return;
    }

    try {
      const patient = JSON.parse(savedPatient);
      const patientId = patient.backendPatientId;

      if (!patientId) {
        alert(
          "Patient database record not found. Please complete patient details again."
        );
        return;
      }

      const emergencyKeywords = [
        "accident",
        "road accident",
        "traffic accident",
        "car accident",
        "bike accident",
        "motorcycle accident",
        "fall",
        "fallen",
        "major injury",
        "severe injury",
        "heavy bleeding",
        "unconscious",
        "unresponsive",
        "not breathing",
        "breathing difficulty",
        "severe chest pain",
      ];

      const transcriptLower = transcript.toLowerCase();

      const accidentEmergency = emergencyKeywords.some((keyword) =>
        transcriptLower.includes(keyword)
      );

      const severity = String(overallSeverity || "LOW").toUpperCase();
      const isEmergencyCase = accidentEmergency || severity === "CRITICAL";

      const severityPrefix = {
        CRITICAL: "C",
        HIGH: "H",
        MODERATE: "M",
        LOW: "L",
      };

      const prefix = severityPrefix[severity] || "L";
      const counterKey = `medivoice_case_counter_${severity}`;
      const currentCount =
        Number(localStorage.getItem(counterKey) || "0") + 1;

      localStorage.setItem(counterKey, String(currentCount));

      const caseSheetNumber = `CS-${prefix}-${String(currentCount).padStart(
        3,
        "0"
      )}`;

      const department = getRecommendedDepartment(
        sections.nextStep,
        severity,
        sections.symptoms
      );

      const assignedDoctor = isEmergencyCase
        ? null
        : findAvailableDoctor(department);

      if (!isEmergencyCase && !assignedDoctor) {
        throw new Error(
          `No doctor is available for the recommended department: ${department}`
        );
      }

      const patientCase = {
        id: Date.now(),
        patientId,
        caseSheetNumber,

        patient: {
          name: patient.name || "Unknown",
          phone: patient.phone || "",
          age: patient.age || "",
          gender: patient.gender || "",
          bloodGroup: patient.bloodGroup || "Not provided",
          conditions: patient.conditions || ["Not provided"],
          otherCondition: patient.otherCondition || "",
        },

        symptomsText: transcript,

        aiAnalysis: {
          symptoms: sections.symptoms,
          conditions: sections.conditions,
          severity,
          nextStep: sections.nextStep,
          emergency: sections.emergency,
        },

        careDestination: isEmergencyCase
          ? {
              department: "Emergency Medicine",
              doctor: null,
            }
          : {
              department: assignedDoctor.department,
              doctor: assignedDoctor,
            },

        status: isEmergencyCase
          ? "EMERGENCY_WAITING_FOR_BED"
          : "WAITING_FOR_DOCTOR",

        isEmergency: isEmergencyCase,
        createdAt: new Date().toISOString(),
      };

      // =========================================================
      // SAVE CASE TO MONGODB
      // =========================================================

      const casePayload = {
        patientId,
        caseSheetNumber: patientCase.caseSheetNumber,
        symptomsText: patientCase.symptomsText,
        severity,
        recommendedDepartment: department,
        status: isEmergencyCase
          ? "EMERGENCY_WAITING_FOR_BED"
          : "WAITING_FOR_DOCTOR",
        isEmergency: isEmergencyCase,
      };

      const response = await fetch("http://localhost:5000/api/cases", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(casePayload),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Failed to save case to database"
        );
      }

     console.log("✅ Case saved to MongoDB:", data.case);

// Save MongoDB Case ID into the same local case
const updatedPatientCase = {
  ...patientCase,
  backendCaseId: data.case?._id || null,
};

localStorage.setItem(
  "medivoice_patient_case",
  JSON.stringify(updatedPatientCase)
);
      window.dispatchEvent(new Event("medivoice-case-updated"));

      if (isEmergencyCase) {
  alert(
    "Emergency case sent successfully. Proceeding to Emergency Dashboard."
  );
  navigate("/emergency-dashboard");
  return;
}

if (department === "Dermatologist") {
  if (sensitiveSkinArea) {
    // Sensitive/private skin → no camera
    alert(
      "Your case has been sent to the dermatologist."
    );
    navigate("/care-destination");
  } else {
    // Normal skin → camera BEFORE doctor receives the case
    navigate("/skin-camera");
  }
} else {
  alert(
    `Your case has been sent to ${patientCase.careDestination.doctor.name}.`
  );
  navigate("/care-destination");
}
alert(
  `Your case has been sent to ${patientCase.careDestination.doctor.name}.`
);
navigate("/care-destination");
    } catch (error) {
      console.error("Patient Case Error:", error);
      alert(
        error.message || "Unable to send your case. Please try again."
      );
    }
  };


  // =========================================================
  // PARSE AI RESPONSE
  // =========================================================

  const sections = useMemo(() => {

    if (!analysis) {
      return {
        symptoms: [],
        conditions: [],
        severity: "",
        nextStep: "",
        emergency: "",
      };
    }


    // -------------------------------------------------------
    // Extract markdown sections
    // -------------------------------------------------------

    const extractSection = (title, nextTitles = []) => {

      const endPattern =
        nextTitles.length > 0
          ? nextTitles.join("|")
          : "$";


      const regex = new RegExp(
        `###\\s*${title}\\s*([\\s\\S]*?)(?=###\\s*(?:${endPattern})|$)`,
        "i"
      );


      const match = analysis.match(regex);

      return match
        ? match[1].trim()
        : "";
    };


    // -------------------------------------------------------
    // Detected symptoms
    // -------------------------------------------------------

    const symptomsText = extractSection(
      "DETECTED SYMPTOMS",
      [
        "POSSIBLE CONDITIONS",
        "OVERALL SEVERITY",
        "RECOMMENDED NEXT STEP",
        "EMERGENCY WARNING",
      ]
    );


    // -------------------------------------------------------
    // Possible conditions
    // -------------------------------------------------------

    const conditionsText = extractSection(
      "POSSIBLE CONDITIONS",
      [
        "OVERALL SEVERITY",
        "RECOMMENDED NEXT STEP",
        "EMERGENCY WARNING",
      ]
    );


    // -------------------------------------------------------
    // Overall severity
    // -------------------------------------------------------

    const severityText = extractSection(
      "OVERALL SEVERITY",
      [
        "RECOMMENDED NEXT STEP",
        "EMERGENCY WARNING",
      ]
    );


    // -------------------------------------------------------
    // Recommended next step
    // -------------------------------------------------------

    const nextStepText = extractSection(
      "RECOMMENDED NEXT STEP",
      [
        "EMERGENCY WARNING",
      ]
    );


    // -------------------------------------------------------
    // Emergency warning
    // -------------------------------------------------------

    const emergencyText = extractSection(
      "EMERGENCY WARNING"
    );


    // =======================================================
    // PARSE SYMPTOMS
    // =======================================================

    const symptoms = symptomsText
      .split("\n")
      .map((item) => {

        const clean = item
          .replace(/^[-*•]\s*/, "")
          .trim();


        if (!clean) {
          return null;
        }


        const match = clean.match(
          /Symptom:\s*(.*?)\s*\|\s*Severity:\s*(LOW|MODERATE|HIGH|CRITICAL)/i
        );


        if (match) {

          return {
            name: match[1].trim(),
            severity: match[2].toUpperCase(),
          };

        }


        // Fallback
        return {
          name: clean.replace(/\*\*/g, ""),
          severity: "LOW",
        };

      })
      .filter(Boolean);


    // =======================================================
    // PARSE CONDITIONS
    // =======================================================

    const conditions = conditionsText
      .split("\n")
      .map((item) =>
        item
          .replace(/^[-*•]\s*/, "")
          .replace(/\*\*/g, "")
          .trim()
      )
      .filter(Boolean);


    return {

      symptoms,

      conditions,

      severity: severityText
        .replace(/\*\*/g, "")
        .trim(),

      nextStep: nextStepText
        .replace(/\*\*/g, "")
        .trim(),

      emergency: emergencyText
        .replace(/\*\*/g, "")
        .trim(),

    };

  }, [analysis]);


  // =========================================================
  // SEVERITY STYLE FUNCTION
  // =========================================================

  const getSeverityStyle = (severity) => {

    const level = severity?.toUpperCase();


    if (level === "CRITICAL") {

      return {
        bg: "bg-red-100",
        border: "border-red-400",
        iconBg: "bg-red-200",
        text: "text-red-800",
        badge: "bg-red-200 text-red-800",
        dot: "bg-red-700",
        label: "CRITICAL",
      };

    }


    if (level === "HIGH") {

      return {
        bg: "bg-red-50",
        border: "border-red-200",
        iconBg: "bg-red-100",
        text: "text-red-700",
        badge: "bg-red-100 text-red-700",
        dot: "bg-red-500",
        label: "HIGH",
      };

    }


    if (level === "MODERATE") {

      return {
        bg: "bg-amber-50",
        border: "border-amber-200",
        iconBg: "bg-amber-100",
        text: "text-amber-700",
        badge: "bg-amber-100 text-amber-700",
        dot: "bg-amber-500",
        label: "MODERATE",
      };

    }


    return {

      bg: "bg-emerald-50",
      border: "border-emerald-200",
      iconBg: "bg-emerald-100",
      text: "text-emerald-700",
      badge: "bg-emerald-100 text-emerald-700",
      dot: "bg-emerald-500",
      label: "LOW",

    };

  };


  // =========================================================
  // OVERALL SEVERITY
  // =========================================================

  const overallSeverity =
    sections.severity
      ?.match(/LOW|MODERATE|HIGH|CRITICAL/i)?.[0]
      ?.toUpperCase() || "";


  const overallStyle =
    getSeverityStyle(overallSeverity);


  // =========================================================
  // UI
  // =========================================================

  return (

    <div className="min-h-screen bg-gradient-to-br from-[#e9f8ff] via-white to-[#dff8f8] px-4 sm:px-6 py-6">


      <div className="max-w-6xl mx-auto">


        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="flex items-center justify-between mb-6">

          <div className="flex items-center gap-3">

            <img
              src={logo}
              alt="MediVoice AI"
              className="w-14 h-14 rounded-2xl bg-white p-1 shadow-md"
            />

            <div>

              <h1 className="text-2xl sm:text-3xl font-black text-[#12213d]">
                Medi<span className="text-blue-600">Voice</span> AI
              </h1>

              <p className="text-xs sm:text-sm font-semibold text-slate-400 tracking-wider">
                AI HEALTHCARE INTELLIGENCE
              </p>

            </div>

          </div>


          <div className="hidden sm:flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-100">

            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />

            <span className="text-xs font-black text-slate-500 tracking-wider">
              AI SYSTEM READY
            </span>

          </div>

        </div>


        {/* ==================================================
            MAIN CARD
        ================================================== */}

        <div className="bg-white/90 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-white overflow-hidden">


          {/* =================================================
              HERO
          ================================================= */}

          <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 px-6 sm:px-10 py-10 text-white">


            <div className="max-w-3xl mx-auto text-center">

              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 border border-white/20 text-sm font-bold mb-5">

                <Activity size={16} />

                VOICE HEALTH ASSESSMENT

              </div>


              <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
                Tell us how you're feeling.
              </h2>


              <p className="mt-3 text-blue-50 text-sm sm:text-lg">
                Speak naturally. MediVoice AI will recognize your symptoms
                and assess their urgency.
              </p>


              {/* =================================================
                  MICROPHONE
              ================================================= */}

              <div className="mt-8 flex justify-center">

                <button
                  onClick={
                    listening
                      ? stopListening
                      : startListening
                  }
                  className={`
                    relative
                    w-28 h-28 sm:w-32 sm:h-32
                    rounded-full
                    flex
                    items-center
                    justify-center
                    shadow-2xl
                    transition-all
                    duration-300
                    ${
                      listening
                        ? "bg-red-500 scale-110"
                        : "bg-white hover:scale-105"
                    }
                  `}
                >

                  {listening && (
                    <>
                      <span className="absolute inset-0 rounded-full border-4 border-white/40 animate-ping" />
                      <span className="absolute -inset-3 rounded-full border border-white/20 animate-pulse" />
                    </>
                  )}


                  <Mic
                    size={52}
                    className={
                      listening
                        ? "text-white"
                        : "text-blue-600"
                    }
                  />

                </button>

              </div>


              <p className="mt-5 font-bold text-lg">

                {listening
                  ? "🎙️ Listening..."
                  : "Tap the microphone to speak"}

              </p>


              <p className="text-sm text-blue-100 mt-1">
                English & Tamil voice supported
              </p>

            </div>

          </div>


          {/* =================================================
              SPEECH RESULT
          ================================================= */}

          <div className="p-5 sm:p-8">


            <div className="bg-slate-50 rounded-2xl border border-slate-100 p-5">

              <div className="flex items-center justify-between">

                <h3 className="font-black text-xl text-[#12213d]">
                  Recognized Speech
                </h3>

                {transcript && (
                  <span className="text-xs font-bold text-emerald-600">
                    SPEECH DETECTED
                  </span>
                )}

              </div>


              <div className="mt-4 min-h-[120px]">

                {transcript ? (

                  <p className="text-slate-700 text-base sm:text-lg leading-8">
                    {transcript}
                  </p>

                ) : (

                  <div className="flex items-center justify-center min-h-[120px] text-slate-400">

                    <p className="text-center">
                      Your speech will appear here...
                    </p>

                  </div>

                )}

              </div>

            </div>


            {/* =================================================
                BUTTONS
            ================================================= */}

            <div className="flex flex-wrap justify-center gap-3 mt-6">


              <button
                onClick={stopListening}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold transition"
              >

                <Square size={17} />

                Stop

              </button>


              <button
                onClick={handleClear}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold transition"
              >

                <Trash2 size={17} />

                Clear

              </button>


              <button
                onClick={handleAnalyze}
                disabled={loading}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-black transition shadow-lg shadow-blue-100"
              >

                <Brain size={18} />

                {loading
                  ? "Analyzing..."
                  : "Analyze Symptoms"}

              </button>

            </div>


            {/* =================================================
                AI ANALYSIS
            ================================================= */}

            {analysis && !loading && (

              <div className="mt-8 space-y-6">


                {/* ============================================
                    DETECTED SYMPTOMS
                ============================================ */}

                <section className="rounded-2xl border border-slate-100 bg-white shadow-sm p-5 sm:p-6">

                  <div className="flex items-center gap-3 mb-5">

                    <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center">

                      <Activity
                        size={22}
                        className="text-blue-600"
                      />

                    </div>

                    <div>

                      <h3 className="text-xl font-black text-[#12213d]">
                        Detected Symptoms
                      </h3>

                      <p className="text-sm text-slate-400">
                        Symptom-wise urgency assessment
                      </p>

                    </div>

                  </div>


                  {sections.symptoms.length > 0 ? (

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                      {sections.symptoms.map(
                        (symptom, index) => {

                          const style =
                            getSeverityStyle(
                              symptom.severity
                            );


                          return (

                            <div
                              key={index}
                              className={`
                                ${style.bg}
                                ${style.border}
                                border
                                rounded-2xl
                                p-4
                                transition-all
                                duration-300
                                hover:-translate-y-1
                                hover:shadow-md
                              `}
                            >

                              <div className="flex items-center justify-between gap-3">


                                <div className="flex items-center gap-3 min-w-0">

                                  <div
                                    className={`
                                      w-11 h-11
                                      rounded-xl
                                      ${style.iconBg}
                                      flex
                                      items-center
                                      justify-center
                                      shrink-0
                                    `}
                                  >

                                    <Activity
                                      size={20}
                                      className={style.text}
                                    />

                                  </div>


                                  <div className="min-w-0">

                                    <p className="font-black text-[#12213d] truncate">
                                      {symptom.name}
                                    </p>


                                    <div className="flex items-center gap-2 mt-1">

                                      <span
                                        className={`
                                          w-2 h-2
                                          rounded-full
                                          ${style.dot}
                                        `}
                                      />

                                      <span
                                        className={`
                                          text-[10px]
                                          font-black
                                          tracking-wider
                                          ${style.text}
                                        `}
                                      >
                                        {style.label} SEVERITY
                                      </span>

                                    </div>

                                  </div>

                                </div>


                                <span
                                  className={`
                                    ${style.badge}
                                    px-3
                                    py-1.5
                                    rounded-full
                                    text-[10px]
                                    font-black
                                    tracking-wider
                                    shrink-0
                                  `}
                                >
                                  {style.label}
                                </span>

                              </div>

                            </div>

                          );

                        }
                      )}

                    </div>

                  ) : (

                    <p className="text-slate-500">
                      No symptoms were detected.
                    </p>

                  )}

                </section>


                {/* ============================================
                    OVERALL SEVERITY
                ============================================ */}

                {overallSeverity && (

                  <section
                    className={`
                      ${overallStyle.bg}
                      ${overallStyle.border}
                      border
                      rounded-2xl
                      p-5 sm:p-6
                    `}
                  >

                    <div className="flex items-center gap-4">

                      <div
                        className={`
                          w-14 h-14
                          rounded-2xl
                          ${overallStyle.iconBg}
                          flex
                          items-center
                          justify-center
                        `}
                      >

                        <AlertTriangle
                          size={27}
                          className={overallStyle.text}
                        />

                      </div>


                      <div className="flex-1">

                        <p className="text-xs font-black tracking-widest text-slate-400">
                          OVERALL TRIAGE LEVEL
                        </p>

                        <h3
                          className={`
                            text-2xl
                            font-black
                            ${overallStyle.text}
                          `}
                        >
                          {overallSeverity}
                        </h3>

                      </div>


                      <span
                        className={`
                          ${overallStyle.badge}
                          px-4 py-2
                          rounded-full
                          text-xs
                          font-black
                        `}
                      >
                        {overallSeverity}
                      </span>

                    </div>


                    {sections.severity && (

                      <p className="mt-4 text-slate-700 leading-7">
                        {sections.severity}
                      </p>

                    )}

                  </section>

                )}


                {/* ============================================
                    POSSIBLE CONDITIONS
                ============================================ */}

                {sections.conditions.length > 0 && (

                  <section className="bg-white border border-slate-100 rounded-2xl shadow-sm p-5 sm:p-6">

                    <h3 className="text-xl font-black text-[#12213d]">
                      Possible Conditions
                    </h3>

                    <p className="text-sm text-slate-400 mt-1">
                      AI-generated possibilities for further evaluation
                    </p>


                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">

                      {sections.conditions.map(
                        (condition, index) => (

                          <div
                            key={index}
                            className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-xl p-4"
                          >

                            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">

                              <Activity
                                size={16}
                                className="text-blue-600"
                              />

                            </div>

                            <span className="font-semibold text-slate-700">
                              {condition}
                            </span>

                          </div>

                        )
                      )}

                    </div>

                  </section>

                )}


                {/* ============================================
                    NEXT STEP
                ============================================ */}

                {sections.nextStep && (

                  <section className="bg-blue-50 border border-blue-100 rounded-2xl p-5 sm:p-6">

                    <div className="flex items-start gap-4">

                      <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">

                        <ShieldCheck
                          size={22}
                          className="text-blue-600"
                        />

                      </div>


                      <div>

                        <h3 className="text-xl font-black text-blue-800">
                          Recommended Next Step
                        </h3>

                        <p className="mt-2 text-slate-700 leading-7">
                          {sections.nextStep}
                        </p>

                      </div>

                    </div>

                  </section>

                )}


                {/* ============================================
                    EMERGENCY WARNING
                ============================================ */}

                {sections.emergency && (

                  <section className="bg-red-50 border border-red-200 rounded-2xl p-5 sm:p-6">

                    <div className="flex items-start gap-4">

                      <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center shrink-0">

                        <AlertTriangle
                          size={24}
                          className="text-red-600"
                        />

                      </div>


                      <div>

                        <h3 className="text-xl font-black text-red-700">
                          Emergency Warning
                        </h3>

                        <p className="mt-2 text-red-900/80 leading-7">
                          {sections.emergency}
                        </p>

                      </div>

                    </div>

                  </section>

                )}


                {/* ============================================
                    SEND CASE TO DOCTOR
                ============================================ */}

                <button
                  type="button"
                  onClick={handleSendToDoctor}
                  disabled={!analysis}
                  className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-slate-900 hover:bg-cyan-600 text-white font-black transition shadow-lg"
                >
                  <Send size={20} />
                  Send Case to Doctor
                </button>

                {/* ============================================
                    MEDICAL DISCLAIMER
                ============================================ */}

                <div className="text-center px-4 py-3">

                  <p className="text-xs text-slate-400 leading-5">
                    MediVoice AI provides preliminary symptom
                    assessment and triage support. It does not
                    replace professional medical diagnosis or
                    emergency medical care.
                  </p>

                </div>


              </div>

            )}


            {/* =================================================
                LOADING
            ================================================= */}

            {loading && (

              <div className="mt-8 bg-blue-50 border border-blue-100 rounded-2xl p-8 text-center">

                <div className="w-12 h-12 mx-auto rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin" />

                <p className="mt-4 font-black text-blue-700">
                  Analyzing your symptoms...
                </p>

                <p className="text-sm text-slate-500 mt-1">
                  MediVoice AI is assessing symptom urgency.
                </p>

              </div>

            )}

          </div>

        </div>


        {/* ==================================================
            FOOTER
        ================================================== */}

        <div className="text-center mt-5">

          <p className="text-xs font-black tracking-[0.25em] text-slate-400">
            MEDIVOICE AI • INTELLIGENT HEALTHCARE
          </p>

        </div>

      </div>

    </div>

  );
}


export default VoiceAssistant;


