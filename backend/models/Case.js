const Doctor = require("./Doctor");
const mongoose = require("mongoose");

const caseSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      default: null,
    },

    caseSheetNumber: {
      type: String,
      required: true,
      unique: true,
    },

    symptomsText: {
      type: String,
      default: "",
    },

    severity: {
      type: String,
      enum: ["LOW", "MODERATE", "HIGH", "CRITICAL"],
      required: true,
    },

    recommendedDepartment: {
      type: String,
      default: "",
    },

    assignedDoctor: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    emergencyBed: {
      type: String,
      default: null,
    },

    status: {
      type: String,
      default: "WAITING",
    },

    isEmergency: {
      type: Boolean,
      default: false,
    },
    skinImage: {
  type: String,
  default: null,
},
createdAt: {
  type: Date,
  default: Date.now,
},
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Case", caseSchema);