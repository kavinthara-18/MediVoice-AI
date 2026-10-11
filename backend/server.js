const patientRoutes = require("./routes/patientRoutes");
const caseRoutes = require("./routes/caseRoutes");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use("/api/patients", patientRoutes);
app.use("/api/cases", caseRoutes);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "MediVoice AI Backend is running",
  });
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");

    app.listen(5000, () => {
      console.log("🚀 Server running on http://localhost:5000");
    });
  })
  .catch((error) => {
    console.error("❌ MongoDB connection failed:", error.message);
  });