import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

let model = null;

if (apiKey) {
  const genAI = new GoogleGenerativeAI(apiKey);

  model = genAI.getGenerativeModel({
    model: "gemini-3.6-flash",
  });
}

/* =========================================================
   LOCAL NLP FALLBACK
   Works even when Gemini quota is exhausted
========================================================= */

function localNLPAnalysis(text) {
  const input = text.toLowerCase();

  const symptomRules = [
    {
      keywords: ["fever", "temperature", "hot body", "high temperature"],
      symptom: "Fever",
      severity: "MODERATE",
      department: "General Medicine",
    },
    {
      keywords: ["headache", "head pain", "pain in my head"],
      symptom: "Headache",
      severity: "MODERATE",
      department: "General Medicine",
    },
    {
      keywords: ["cough", "coughing"],
      symptom: "Cough",
      severity: "LOW",
      department: "Pulmonologist",
    },
    {
      keywords: ["cold", "runny nose", "blocked nose", "sneezing"],
      symptom: "Cold",
      severity: "LOW",
      department: "General Medicine",
    },
    {
      keywords: ["vomiting", "vomit", "throwing up"],
      symptom: "Vomiting",
      severity: "MODERATE",
      department: "General Medicine",
    },
    {
      keywords: ["stomach pain", "abdominal pain", "stomach ache"],
      symptom: "Stomach Pain",
      severity: "MODERATE",
      department: "General Medicine",
    },
    {
      keywords: ["chest pain", "chest pressure", "pain in chest"],
      symptom: "Chest Pain",
      severity: "CRITICAL",
      department: "Cardiologist",
    },
    {
      keywords: [
        "difficulty breathing",
        "breathing difficulty",
        "shortness of breath",
        "can't breathe",
        "cannot breathe",
        "breathlessness",
      ],
      symptom: "Difficulty Breathing",
      severity: "CRITICAL",
      department: "Pulmonologist",
    },
    {
      keywords: ["bleeding", "heavy bleeding", "blood loss"],
      symptom: "Bleeding",
      severity: "HIGH",
      department: "Emergency Medicine",
    },
    {
      keywords: [
        "unconscious",
        "loss of consciousness",
        "passed out",
        "fainted",
      ],
      symptom: "Loss of Consciousness",
      severity: "CRITICAL",
      department: "Emergency Medicine",
    },
    {
      keywords: ["dizziness", "dizzy", "light headed", "lightheaded"],
      symptom: "Dizziness",
      severity: "MODERATE",
      department: "General Medicine",
    },
    {
      keywords: ["tooth pain", "toothache", "teeth pain", "gum pain"],
      symptom: "Dental Pain",
      severity: "MODERATE",
      department: "Endodontist",
    },
    {
      keywords: [
        "skin rash",
        "rash",
        "skin irritation",
        "itching",
        "itchy skin",
        "acne",
        "pimple",
        "skin lesion",
        "red patch",
      ],
      symptom: "Skin Problem",
      severity: "MODERATE",
      department: "Dermatologist",
    },
    {
      keywords: ["pregnant", "pregnancy", "period pain", "menstrual pain"],
      symptom: "Gynecological Concern",
      severity: "MODERATE",
      department: "Gynacologist",
    },
    {
      keywords: [
        "accident",
        "road accident",
        "injury",
        "serious injury",
        "head injury",
        "head is broken",
        "head wound",
      ],
      symptom: "Accident / Injury",
      severity: "CRITICAL",
      department: "Emergency Medicine",
    },
  ];

  const detected = [];

  for (const rule of symptomRules) {
    const matched = rule.keywords.some((keyword) =>
      input.includes(keyword)
    );

    if (matched) {
      detected.push({
        name: rule.symptom,
        severity: rule.severity,
        department: rule.department,
      });
    }
  }

  // Remove duplicate symptoms
  const uniqueSymptoms = detected.filter(
    (item, index, array) =>
      index ===
      array.findIndex((x) => x.name === item.name)
  );

  // No symptoms recognized
  if (uniqueSymptoms.length === 0) {
    return {
      rawText: text,
      symptoms: [],
      severity: "LOW",
      possibleConditions: [],
      recommendedNextStep:
        "Please provide more details about your symptoms for further assessment.",
      emergencyWarning:
        "No emergency warning signs were identified from the reported symptoms.",
      recommendedDepartment: "General Medicine",
      source: "Local NLP",
    };
  }

  const severityOrder = {
    LOW: 1,
    MODERATE: 2,
    HIGH: 3,
    CRITICAL: 4,
  };

  const overallSeverity = uniqueSymptoms.reduce(
    (highest, current) =>
      severityOrder[current.severity] >
      severityOrder[highest]
        ? current.severity
        : highest,
    "LOW"
  );

  const criticalCase = overallSeverity === "CRITICAL";

  let department = uniqueSymptoms[0].department;

  if (criticalCase) {
    department = "Emergency Medicine";
  } else {
    department = uniqueSymptoms[0].department;
  }

  return {
    rawText: text,

    symptoms: uniqueSymptoms,

    severity: overallSeverity,

    possibleConditions: [
      "Requires clinical evaluation based on reported symptoms",
    ],

    recommendedNextStep: criticalCase
      ? "Seek immediate emergency medical evaluation."
      : "Consult the recommended department for further medical evaluation.",

    emergencyWarning: criticalCase
      ? "Potential emergency warning signs were reported. Immediate medical attention is recommended."
      : "No immediate emergency warning signs were identified from the reported symptoms.",

    recommendedDepartment: department,

    source: "Local NLP",
  };
}


/* =========================================================
   GEMINI ANALYSIS
========================================================= */

async function analyzeWithGemini(text) {
  if (!model) {
    throw new Error("Gemini API key is not available.");
  }

  const prompt = `
You are MediVoice AI, a healthcare symptom recognition and triage assistant.

Analyze ONLY the symptoms reported by the patient.

Do not give a definitive medical diagnosis.
Do not invent symptoms.

Return exactly:

### DETECTED SYMPTOMS

- Symptom: [symptom name] | Severity: LOW
- Symptom: [symptom name] | Severity: MODERATE
- Symptom: [symptom name] | Severity: HIGH
- Symptom: [symptom name] | Severity: CRITICAL

### POSSIBLE CONDITIONS

- [possible condition]

### OVERALL SEVERITY

[LOW / MODERATE / HIGH / CRITICAL]

### RECOMMENDED NEXT STEP

[short recommendation]

### EMERGENCY WARNING

[state whether emergency warning signs were reported]

Patient's reported speech:

"${text}"
`;

  const result = await model.generateContent(prompt);

  const aiText = result.response.text();

  return parseGeminiResponse(aiText, text);
}


/* =========================================================
   PARSE GEMINI RESPONSE
========================================================= */

function parseGeminiResponse(aiText, originalText) {
  const symptoms = [];

  const symptomSection =
    aiText.match(
      /### DETECTED SYMPTOMS([\s\S]*?)(?=### POSSIBLE CONDITIONS|$)/i
    )?.[1] || "";

  const symptomLines = symptomSection.match(
    /- Symptom:\s*(.*?)\s*\|\s*Severity:\s*(LOW|MODERATE|HIGH|CRITICAL)/gi
  );

  if (symptomLines) {
    symptomLines.forEach((line) => {
      const match = line.match(
        /- Symptom:\s*(.*?)\s*\|\s*Severity:\s*(LOW|MODERATE|HIGH|CRITICAL)/i
      );

      if (match) {
        symptoms.push({
          name: match[1].trim(),
          severity: match[2].toUpperCase(),
        });
      }
    });
  }

  const conditions =
    aiText
      .match(
        /### POSSIBLE CONDITIONS([\s\S]*?)(?=### OVERALL SEVERITY|$)/i
      )?.[1]
      ?.split("\n")
      .map((x) => x.replace(/^-\s*/, "").trim())
      .filter(Boolean) || [];

  const severity =
    aiText
      .match(
        /### OVERALL SEVERITY\s*[\r\n]+(LOW|MODERATE|HIGH|CRITICAL)/i
      )?.[1]
      ?.toUpperCase() || "LOW";

  const nextStep =
    aiText
      .match(
        /### RECOMMENDED NEXT STEP\s*([\s\S]*?)(?=### EMERGENCY WARNING|$)/i
      )?.[1]
      ?.trim() || "";

  const emergencyWarning =
    aiText
      .match(
        /### EMERGENCY WARNING\s*([\s\S]*)/i
      )?.[1]
      ?.trim() || "";

  return {
    rawText: aiText,
    symptoms,
    severity,
    possibleConditions: conditions,
    recommendedNextStep: nextStep,
    emergencyWarning,
    source: "Gemini AI",
  };
}


/* =========================================================
   MAIN FUNCTION
   Gemini first → Local NLP fallback
========================================================= */

export async function analyzeSymptoms(text) {
  try {
    console.log("🤖 Trying Gemini AI analysis...");

    const result = await analyzeWithGemini(text);

    console.log("✅ Gemini analysis successful");

    return result;
  } catch (error) {
    console.warn(
      "⚠️ Gemini unavailable. Switching to Local NLP fallback."
    );

    console.warn(error);

    const fallback = localNLPAnalysis(text);

    console.log("🧠 Local NLP result:", fallback);

    return fallback;
  }
}