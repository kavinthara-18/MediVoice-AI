const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      required: true,
    },

    age: {
      type: Number,
    },

    gender: {
      type: String,
    },

    bloodGroup: {
      type: String,
      default: "Not provided",
    },

    conditions: {
      type: [String],
      default: [],
    },

    otherCondition: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Patient", patientSchema);