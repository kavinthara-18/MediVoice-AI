const express = require("express");
const Patient = require("../models/Patient");

const router = express.Router();

// CREATE PATIENT
router.post("/", async (req, res) => {
  try {
    const patient = await Patient.create(req.body);

    res.status(201).json({
      success: true,
      message: "Patient created successfully",
      patient,
    });
  } catch (error) {
    console.error("Create Patient Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// GET ALL PATIENTS
router.get("/", async (req, res) => {
  try {
    const patients = await Patient.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      patients,
    });
  } catch (error) {
    console.error("Get Patients Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;