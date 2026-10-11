// frontend/src/services/nlp.js

// ============================================================
// MEDIVOICE AI - LOCAL NLP TRIAGE ENGINE
// ============================================================

const symptomPatterns = [

  // ----------------------------------------------------------
  // FEVER
  // ----------------------------------------------------------
  {
    patterns: [
      /\bfever\b/i,
      /\brunning a fever\b/i,
      /\bhigh temperature\b/i,
      /\btemperature is high\b/i,
      /\bbody feels hot\b/i,
      /\bfeeling hot\b/i,
    ],
    symptom: "Fever",
    severity: "MODERATE",
    department: "General Medicine",
  },
  // ----------------------------------------------------------
// SENSITIVE SKIN AREA
// ----------------------------------------------------------
{
  patterns: [
    /\bprivate area\b/i,
    /\bgenital area\b/i,
    /\bgenitals\b/i,
    /\bgroin\b/i,
    /\bgenital itching\b/i,
    /\bgenital rash\b/i,
    /\bprivate parts\b/i,
    /\bprivate part\b/i,
  ],
  symptom: "Sensitive Skin Area",
  severity: "MODERATE",
  department: "Dermatologist",
  sensitiveArea: true,
},

  // ----------------------------------------------------------
  // HEADACHE
  // ----------------------------------------------------------
  {
    patterns: [
      /\bheadache\b/i,
      /\bhead pain\b/i,
      /\bpain in my head\b/i,
      /\bmy head hurts\b/i,
      /\bhead is hurting\b/i,
      /\bpain around my head\b/i,
    ],
    symptom: "Headache",
    severity: "MODERATE",
    department: "General Medicine",
  },

  // ----------------------------------------------------------
  // COUGH
  // ----------------------------------------------------------
  {
    patterns: [
      /\bcough\b/i,
      /\bcoughing\b/i,
      /\bkeep coughing\b/i,
      /\bcontinuous cough\b/i,
    ],
    symptom: "Cough",
    severity: "LOW",
    department: "Pulmonologist",
  },

  // ----------------------------------------------------------
  // COLD
  // ----------------------------------------------------------
  {
    patterns: [
      /\bcold\b/i,
      /\brunny nose\b/i,
      /\bblocked nose\b/i,
      /\bnose is blocked\b/i,
      /\bsneezing\b/i,
      /\bconstant sneezing\b/i,
    ],
    symptom: "Cold",
    severity: "LOW",
    department: "General Medicine",
  },

  // ----------------------------------------------------------
  // VOMITING
  // ----------------------------------------------------------
  {
    patterns: [
      /\bvomiting\b/i,
      /\bvomit\b/i,
      /\bthrowing up\b/i,
      /\bkeep throwing up\b/i,
      /\bfeeling like vomiting\b/i,
      /\bfeel like throwing up\b/i,
    ],
    symptom: "Vomiting",
    severity: "MODERATE",
    department: "General Medicine",
  },

  // ----------------------------------------------------------
  // STOMACH PAIN
  // ----------------------------------------------------------
  {
    patterns: [
      /\bstomach pain\b/i,
      /\bstomach ache\b/i,
      /\bmy stomach hurts\b/i,
      /\bpain in my stomach\b/i,
      /\babdominal pain\b/i,
      /\bpain in my abdomen\b/i,
    ],
    symptom: "Stomach Pain",
    severity: "MODERATE",
    department: "General Medicine",
  },

  // ----------------------------------------------------------
  // CHEST PAIN
  // ----------------------------------------------------------
  {
    patterns: [
      /\bchest pain\b/i,
      /\bpain in my chest\b/i,
      /\bmy chest hurts\b/i,
      /\bchest is hurting\b/i,
      /\bpressure in my chest\b/i,
      /\bchest pressure\b/i,
      /\bheavy feeling in my chest\b/i,
      /\btightness in my chest\b/i,
      /\bchest tightness\b/i,
    ],
    symptom: "Chest Pain",
    severity: "CRITICAL",
    department: "Cardiologist",
  },

  // ----------------------------------------------------------
  // BREATHING DIFFICULTY
  // ----------------------------------------------------------
  {
    patterns: [
      /\bdifficulty breathing\b/i,
      /\bbreathing difficulty\b/i,
      /\bhaving trouble breathing\b/i,
      /\btrouble breathing\b/i,
      /\bshortness of breath\b/i,
      /\bshort of breath\b/i,
      /\bbreathlessness\b/i,
      /\bcan't breathe\b/i,
      /\bcannot breathe\b/i,
      /\bhard to breathe\b/i,
      /\bhaving difficulty breathing\b/i,
    ],
    symptom: "Difficulty Breathing",
    severity: "CRITICAL",
    department: "Pulmonologist",
  },

  // ----------------------------------------------------------
  // DIZZINESS
  // ----------------------------------------------------------
  {
    patterns: [
      /\bdizziness\b/i,
      /\bdizzy\b/i,
      /\bfeel dizzy\b/i,
      /\bfeeling dizzy\b/i,
      /\blightheaded\b/i,
      /\blight headed\b/i,
      /\broom is spinning\b/i,
      /\bhead is spinning\b/i,
    ],
    symptom: "Dizziness",
    severity: "MODERATE",
    department: "General Medicine",
  },

  // ----------------------------------------------------------
  // DENTAL
  // ----------------------------------------------------------
  {
    patterns: [
      /\btooth pain\b/i,
      /\btoothache\b/i,
      /\bmy tooth hurts\b/i,
      /\bpain in my tooth\b/i,
      /\bteeth pain\b/i,
      /\bpain in my teeth\b/i,
      /\bgum pain\b/i,
      /\bpain in my gums\b/i,
    ],
    symptom: "Dental Pain",
    severity: "MODERATE",
    department: "Endodontist",
  },

  // ----------------------------------------------------------
  // SKIN
  // ----------------------------------------------------------
  {
    patterns: [
      /\bskin rash\b/i,
      /\brash\b/i,
      /\bskin problem\b/i,
      /\bskin irritation\b/i,
      /\birritation in my skin\b/i,
      /\birritation on my skin\b/i,
      /\birritation of my skin\b/i,
      /\birritated skin\b/i,
      /\bmy skin is irritated\b/i,
      /\bitching\b/i,
      /\bitchy skin\b/i,
      /\bmy skin is itchy\b/i,
      /\bskin is itchy\b/i,
      /\bacne\b/i,
      /\bpimple\b/i,
      /\bpimples\b/i,
      /\bskin lesion\b/i,
      /\bred patch\b/i,
      /\bred patches\b/i,
      /\bskin damage\b/i,
      /\bskin infection\b/i,
    ],
    symptom: "Skin Problem",
    severity: "MODERATE",
    department: "Dermatologist",
  },

  // ----------------------------------------------------------
  // GYNECOLOGY
  // ----------------------------------------------------------
  {
    patterns: [
      /\bpregnant\b/i,
      /\bpregnancy\b/i,
      /\bperiod pain\b/i,
      /\bperiod cramps\b/i,
      /\bmenstrual pain\b/i,
      /\bmenstrual cramps\b/i,
    ],
    symptom: "Gynecological Concern",
    severity: "MODERATE",
    department: "Gynacologist",
  },

  // ----------------------------------------------------------
  // ACCIDENT / INJURY
  // ----------------------------------------------------------
  {
    patterns: [
      /\baccident\b/i,
      /\broad accident\b/i,
      /\btraffic accident\b/i,
      /\bcar accident\b/i,
      /\bbike accident\b/i,
      /\bmotorcycle accident\b/i,
      /\broad crash\b/i,
      /\bcar crash\b/i,
      /\bbike crash\b/i,
      /\bfallen\b/i,
      /\bfell down\b/i,
      /\bfall\b/i,
      /\binjury\b/i,
      /\binjured\b/i,
      /\bmajor injury\b/i,
      /\bsevere injury\b/i,
      /\bhead injury\b/i,
      /\bhead wound\b/i,
    ],
    symptom: "Accident / Injury",
    severity: "CRITICAL",
    department: "Emergency Medicine",
  },

  // ----------------------------------------------------------
  // LOSS OF CONSCIOUSNESS
  // ----------------------------------------------------------
  {
    patterns: [
      /\bunconscious\b/i,
      /\bunresponsive\b/i,
      /\bpassed out\b/i,
      /\bfainted\b/i,
      /\bfainting\b/i,
      /\bloss of consciousness\b/i,
    ],
    symptom: "Loss of Consciousness",
    severity: "CRITICAL",
    department: "Emergency Medicine",
  },

  // ----------------------------------------------------------
  // BLEEDING
  // ----------------------------------------------------------
  {
    patterns: [
      /\bheavy bleeding\b/i,
      /\bbleeding heavily\b/i,
      /\bbleeding\b/i,
      /\bblood loss\b/i,
      /\blosing blood\b/i,
    ],
    symptom: "Bleeding",
    severity: "HIGH",
    department: "Emergency Medicine",
  },
];


// ============================================================
// SEVERITY RANK
// ============================================================

const severityRank = {
  LOW: 1,
  MODERATE: 2,
  HIGH: 3,
  CRITICAL: 4,
};


// ============================================================
// NEGATION DETECTION
// Example:
// "I don't have chest pain"
// → Chest Pain should NOT be detected
// ============================================================

function isNegated(text, matchIndex) {

  const previousText = text.slice(
    Math.max(0, matchIndex - 40),
    matchIndex
  );

  const negationPatterns = [
    /\bno\b/i,
    /\bnot\b/i,
    /\bdon't\b/i,
    /\bdont\b/i,
    /\bdoesn't\b/i,
    /\bdoesnt\b/i,
    /\bwithout\b/i,
    /\bnever\b/i,
  ];

  return negationPatterns.some((pattern) =>
    pattern.test(previousText)
  );
}


// ============================================================
// FIND MATCH
// ============================================================

function findPatternMatch(text, patterns) {

  for (const pattern of patterns) {

    const match = pattern.exec(text);

    if (match && !isNegated(text, match.index)) {
      return match;
    }
  }

  return null;
}


// ============================================================
// MAIN NLP ANALYSIS
// ============================================================

export function analyzeSymptomsWithNLP(text) {

  const input = String(text || "")
    .toLowerCase()
    .replace(/[^\w\s']/g, " ")
    .replace(/\s+/g, " ")
    .trim();


  if (!input) {

    return {
      symptoms: [],
      conditions: [],
      severity: "",
      nextStep: "",
      emergency: "",
      department: "General Medicine",
      source: "Local NLP",
    };
  }


  const detectedSymptoms = [];


  // ----------------------------------------------------------
  // SYMPTOM EXTRACTION
  // ----------------------------------------------------------

  for (const rule of symptomPatterns) {

    const match = findPatternMatch(
      input,
      rule.patterns
    );

    if (match) {

      detectedSymptoms.push({
        name: rule.symptom,
        severity: rule.severity,
        department: rule.department,
      });
    }
  }


  // ----------------------------------------------------------
  // REMOVE DUPLICATES
  // ----------------------------------------------------------

  const uniqueSymptoms =
    detectedSymptoms.filter(
      (item, index, array) =>
        index ===
        array.findIndex(
          (x) => x.name === item.name
        )
    );


  // ----------------------------------------------------------
  // NOTHING DETECTED
  // ----------------------------------------------------------

  if (uniqueSymptoms.length === 0) {

    return {

      symptoms: [],

      conditions: [],

      severity: "LOW",

      nextStep:
        "Please describe your symptoms in more detail so the system can perform triage.",

      emergency:
        "No emergency warning signs were identified from the reported speech.",

      department: "General Medicine",

      source: "Local NLP",
    };
  }


  // ----------------------------------------------------------
  // OVERALL SEVERITY
  // ----------------------------------------------------------

  let overallSeverity = "LOW";


  for (const symptom of uniqueSymptoms) {

    if (
      severityRank[symptom.severity] >
      severityRank[overallSeverity]
    ) {

      overallSeverity =
        symptom.severity;
    }
  }


  // ----------------------------------------------------------
  // DEPARTMENT
  // ----------------------------------------------------------

  let department =
    uniqueSymptoms[0].department;


  // Emergency override
  if (
    overallSeverity === "CRITICAL"
  ) {

    department =
      "Emergency Medicine";
  }


  // ----------------------------------------------------------
  // CONDITIONS
  // ----------------------------------------------------------

  const conditions = [
    "Clinical evaluation recommended based on the reported symptoms",
  ];


  // ----------------------------------------------------------
  // NEXT STEP
  // ----------------------------------------------------------

  let nextStep;


  if (
    overallSeverity === "CRITICAL"
  ) {

    nextStep =
      "Immediate emergency medical evaluation is recommended.";

  } else if (
    overallSeverity === "HIGH"
  ) {

    nextStep =
      `Prompt medical evaluation is recommended through ${department}.`;

  } else {

    nextStep =
      `Consult ${department} for further medical evaluation.`;
  }


  // ----------------------------------------------------------
  // EMERGENCY WARNING
  // ----------------------------------------------------------

  let emergency;


  if (
    overallSeverity === "CRITICAL"
  ) {

    emergency =
      "Potential emergency warning signs were reported. Immediate medical attention is recommended.";

  } else if (
    overallSeverity === "HIGH"
  ) {

    emergency =
      "The reported symptoms may require prompt medical evaluation.";

  } else {

    emergency =
      "No immediate emergency warning signs were identified from the reported symptoms.";
  }


  // ----------------------------------------------------------
  // FINAL RESULT
  // ----------------------------------------------------------

  return {

    symptoms: uniqueSymptoms,

    conditions,

    severity: overallSeverity,

    nextStep,

    emergency,

    department,

    source: "Local NLP",
  };
}
