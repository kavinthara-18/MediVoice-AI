const express = require("express");
const Case = require("../models/Case");

const router = express.Router();

// =====================================================
// CREATE CASE
// =====================================================
router.post("/", async (req, res) => {
  try {
    console.log("📥 CREATE CASE:", req.body);

    const caseData = await Case.create(req.body);

    return res.status(201).json({
      success: true,
      message: "Case created successfully",
      case: caseData,
    });
  } catch (error) {
    console.error("❌ CREATE CASE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// =====================================================
// GET ALL CASES
// =====================================================
router.get("/", async (req, res) => {
  try {
    const cases = await Case.find()
      .populate("patientId")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      cases,
    });
  } catch (error) {
    console.error("❌ GET CASES ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// =====================================================
// GET SINGLE CASE
// =====================================================
router.get("/:id", async (req, res) => {
  try {
    const caseData = await Case.findById(req.params.id)
      .populate("patientId");

    if (!caseData) {
      return res.status(404).json({
        success: false,
        message: "Case not found",
      });
    }

    return res.status(200).json({
      success: true,
      case: caseData,
    });
  } catch (error) {
    console.error("❌ GET SINGLE CASE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// =====================================================
// UPDATE CASE
// Used for skin image + case status + doctor/bed updates
// =====================================================
router.patch("/:id", async (req, res) => {
  try {
    console.log("📥 PATCH CASE:", req.params.id);
    console.log("📦 UPDATE DATA:", Object.keys(req.body));

    const updatedCase = await Case.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedCase) {
      return res.status(404).json({
        success: false,
        message: "Case not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Case updated successfully",
      case: updatedCase,
    });
  } catch (error) {
    console.error("❌ PATCH CASE ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update case",
      error: error.message,
    });
  }
});

module.exports = router;