import React, { useEffect, useRef, useState } from "react";
import {
  Camera,
  RotateCcw,
  CheckCircle2,
  Upload,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const SkinCamera = () => {
  const navigate = useNavigate();

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [cameraReady, setCameraReady] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  // =========================================================
  // START CAMERA
  // =========================================================
  useEffect(() => {
    startCamera();

    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      setError("");
      setCameraReady(false);

      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Camera is not supported in this browser.");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      setCameraReady(true);
    } catch (err) {
      console.error("❌ Camera error:", err);

      setError(
        err.message ||
          "Camera access denied. Please allow camera permission."
      );
    }
  };

  // =========================================================
  // STOP CAMERA
  // =========================================================
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });

      streamRef.current = null;
    }

    setCameraReady(false);
  };

  // =========================================================
  // CAPTURE PHOTO
  // =========================================================
  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) {
      alert("Camera is not ready.");
      return;
    }

    if (!video.videoWidth || !video.videoHeight) {
      alert("Camera is still loading. Please wait a moment.");
      return;
    }

    const maxWidth = 1024;

    const originalWidth = video.videoWidth;
    const originalHeight = video.videoHeight;

    const scale =
      originalWidth > maxWidth
        ? maxWidth / originalWidth
        : 1;

    const width = Math.round(originalWidth * scale);
    const height = Math.round(originalHeight * scale);

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");

    if (!ctx) {
      alert("Unable to capture image.");
      return;
    }

    ctx.drawImage(video, 0, 0, width, height);

    // Compress image to keep MongoDB request manageable
    const imageData = canvas.toDataURL("image/jpeg", 0.7);

    setPhoto(imageData);

    stopCamera();
  };

  // =========================================================
  // RETAKE
  // =========================================================
  const retakePhoto = async () => {
    setPhoto(null);
    setError("");

    await startCamera();
  };

  // =========================================================
  // UPLOAD PHOTO TO SAME CASE
  // =========================================================
  const skipPhoto = async () => {
  try {
    const savedCase = localStorage.getItem("medivoice_patient_case");

    if (!savedCase) {
      alert("Case information not found.");
      return;
    }

    const patientCase = JSON.parse(savedCase);

    const backendCaseId =
      patientCase.backendCaseId ||
      patientCase._id ||
      patientCase.backendId ||
      null;

    if (!backendCaseId) {
      alert("Case ID not found.");
      return;
    }

    const response = await fetch(
      `http://localhost:5000/api/cases/${backendCaseId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "WAITING_FOR_DOCTOR",
        }),
      }
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Failed to send case");
    }

    const updatedCase = {
      ...patientCase,
      status: "WAITING_FOR_DOCTOR",
    };

    localStorage.setItem(
      "medivoice_patient_case",
      JSON.stringify(updatedCase)
    );

    window.dispatchEvent(new Event("medivoice-case-updated"));

    navigate("/care-destination");
  } catch (error) {
    console.error("Skip photo error:", error);
    alert(error.message || "Unable to send case.");
  }
};
const continueWithPhoto = async () => {
    if (uploading) return;

    try {
      if (!photo) {
        alert("Please take a photo first.");
        return;
      }

      setUploading(true);
      setError("");

      // -----------------------------------------------------
      // GET CURRENT CASE
      // -----------------------------------------------------
      const savedCase = localStorage.getItem(
        "medivoice_patient_case"
      );

      if (!savedCase) {
        throw new Error(
          "Case details not found. Please create the case again."
        );
      }

      const patientCase = JSON.parse(savedCase);

      console.log("📋 Current case:", patientCase);

      // -----------------------------------------------------
      // CHECK MONGODB CASE ID
      // -----------------------------------------------------
      const backendCaseId =
        patientCase.backendCaseId ||
        patientCase._id ||
        patientCase.backendId ||
        null;

      if (!backendCaseId) {
        console.error(
          "❌ MongoDB Case ID missing:",
          patientCase
        );

        throw new Error(
          "Case ID not found. Please create a new case and try again."
        );
      }

      console.log(
        "✅ MongoDB Case ID:",
        backendCaseId
      );

      // -----------------------------------------------------
      // SEND IMAGE TO BACKEND
      // -----------------------------------------------------
      const response = await fetch(
        `http://localhost:5000/api/cases/${backendCaseId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            skinImage: photo,
            status: "WAITING_FOR_DOCTOR",
          }),
        }
      );

      // Read response only once
      const responseText = await response.text();

      console.log(
        "📡 PATCH Status:",
        response.status
      );

      console.log(
        "📡 PATCH Response:",
        responseText
      );

      let data = {};

      try {
        data = responseText
          ? JSON.parse(responseText)
          : {};
      } catch (parseError) {
        console.error(
          "❌ Invalid backend JSON:",
          parseError
        );

        throw new Error(
          "Backend returned an invalid response."
        );
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            `Failed to save skin image. Server returned ${response.status}.`
        );
      }

      console.log(
        "✅ Skin image saved to MongoDB:",
        data
      );

      // -----------------------------------------------------
      // UPDATE SAME CASE IN LOCAL STORAGE
      // -----------------------------------------------------
      const updatedCase = {
        ...patientCase,
        backendCaseId,
        skinImage: photo,
        skinImageUploaded: true,
        skinImageUploadedAt:
          new Date().toISOString(),
      };

      localStorage.setItem(
        "medivoice_patient_case",
        JSON.stringify(updatedCase)
      );

      // Notify other dashboard components
      window.dispatchEvent(
        new Event("medivoice-case-updated")
      );

      // -----------------------------------------------------
      // SUCCESS
      // -----------------------------------------------------
      alert(
        "Skin image uploaded successfully to the case sheet!"
      );

      navigate("/care-destination");
    } catch (error) {
      console.error(
        "❌ Skin image upload error:",
        error
      );

      setError(
        error.message ||
          "Unable to upload skin image. Please try again."
      );
    } finally {
      setUploading(false);
    }
  };

  // =========================================================
  // GO BACK
  // =========================================================
  const goBack = () => {
    stopCamera();
    navigate("/voice");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4 sm:p-6">

      <div className="w-full max-w-4xl">

        {/* =================================================
            HEADER
        ================================================= */}
        <div className="mb-6">

          <button
            type="button"
            onClick={goBack}
            className="mb-5 flex items-center gap-2 text-sm font-semibold text-slate-400 transition hover:text-white"
          >
            <ArrowLeft size={18} />
            Back to Voice Assistant
          </button>

          <div className="text-center">

            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-cyan-500/15 border border-cyan-400/30 mb-4">
              <Camera
                size={32}
                className="text-cyan-400"
              />
            </div>

            <p className="text-xs font-black uppercase tracking-[0.25em] text-cyan-400">
              Dermatology Assessment
            </p>

            <h1 className="mt-2 text-3xl sm:text-4xl font-black">
              Skin Image Capture
            </h1>

            <p className="text-slate-400 mt-2 text-sm sm:text-base">
              Take one clear photo of the affected skin area
            </p>

          </div>
        </div>

        {/* =================================================
            CAMERA CARD
        ================================================= */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-4 sm:p-7 shadow-2xl">

          {/* Camera preview */}
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black border border-white/10">

            {!photo ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            ) : (
              <img
                src={photo}
                alt="Captured skin condition"
                className="w-full h-full object-contain bg-black"
              />
            )}

            {/* Camera status */}
            {!photo && cameraReady && (
              <div className="absolute top-4 left-4 flex items-center gap-2 rounded-full bg-black/60 backdrop-blur-md px-3 py-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />

                <span className="text-xs font-bold">
                  CAMERA READY
                </span>
              </div>
            )}

          </div>

          {/* Hidden canvas */}
          <canvas
            ref={canvasRef}
            className="hidden"
          />

          {/* =================================================
              ERROR
          ================================================= */}
          {error && (
            <div className="mt-4 flex items-start gap-3 rounded-2xl bg-red-500/10 border border-red-400/30 p-4 text-red-300">

              <AlertCircle
                size={20}
                className="mt-0.5 shrink-0"
              />

              <div>
                <p className="font-bold">
                  Something went wrong
                </p>

                <p className="mt-1 text-sm leading-5">
                  {error}
                </p>
              </div>

            </div>
          )}

          {/* =================================================
              INSTRUCTION
          ================================================= */}
          {!photo && (
            <div className="mt-5 rounded-2xl border border-cyan-400/10 bg-cyan-400/5 p-4">

              <p className="text-sm font-bold text-cyan-300">
                📷 Capture Instructions
              </p>

              <p className="mt-2 text-xs sm:text-sm leading-6 text-slate-400">
                Keep the affected skin area clearly visible,
                use sufficient lighting, and hold the camera
                steady before taking the photo.
              </p>

            </div>
          )}

          {/* =================================================
              TAKE PHOTO
          ================================================= */}
         <div className="mt-6 space-y-3">
  <button
    type="button"
    onClick={capturePhoto}
    className="w-full py-4 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-black transition"
  >
    <Camera size={24} className="inline mr-2" />
    📷 Take Photo
  </button>

  <div className="text-center text-sm font-bold text-slate-400">
    OR
  </div>

  <button
    type="button"
    onClick={skipPhoto}
    className="w-full py-4 rounded-2xl border-2 border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-black transition"
  >
    Skip Photo
  </button>
</div>

          {/* =================================================
              CAMERA LOADING
          ================================================= */}
          {!photo &&
            !cameraReady &&
            !error && (
              <div className="mt-6 flex items-center justify-center gap-3 rounded-2xl bg-white/5 border border-white/10 py-4">

                <div className="h-5 w-5 rounded-full border-2 border-cyan-400/30 border-t-cyan-400 animate-spin" />

                <span className="text-sm font-semibold text-slate-400">
                  Starting camera...
                </span>

              </div>
            )}

          {/* =================================================
              PHOTO PREVIEW
          ================================================= */}
          {photo && (

            <div className="mt-6 space-y-4">

              <div className="flex items-center gap-2 text-emerald-400 font-bold">

                <CheckCircle2 size={21} />

                <span>
                  Photo captured successfully
                </span>

              </div>

              <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-4">

                <p className="text-xs sm:text-sm text-emerald-300">
                  This photo will be attached to the
                  <span className="font-black">
                    {" "}same patient case sheet
                  </span>
                  {" "}and sent to the dermatologist.
                </p>

              </div>

              {/* Retake */}
              <button
                type="button"
                onClick={retakePhoto}
                disabled={uploading}
                className="w-full py-3 rounded-xl border border-white/15 bg-white/5 hover:bg-white/10 flex items-center justify-center gap-2 font-bold transition disabled:opacity-50"
              >
                <RotateCcw size={20} />
                RETAKE PHOTO
              </button>

              {/* Upload */}
              <button
                type="button"
                onClick={continueWithPhoto}
                disabled={uploading}
                className="w-full py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-lg flex items-center justify-center gap-3 transition disabled:cursor-not-allowed disabled:opacity-60"
              >

                {uploading ? (
                  <>
                    <div className="h-5 w-5 rounded-full border-2 border-slate-950/30 border-t-slate-950 animate-spin" />

                    UPLOADING...
                  </>
                ) : (
                  <>
                    <Upload size={22} />

                    UPLOAD & CONTINUE
                  </>
                )}

              </button>

            </div>

          )}

        </div>

        {/* =================================================
            FOOTER
        ================================================= */}
        <div className="mt-5 text-center">

          <p className="text-xs text-slate-500">
            Only one image will be captured for this case.
          </p>

          <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-slate-600">
            MediVoice AI • Dermatology Module
          </p>

        </div>

      </div>
    </div>
  );
};

export default SkinCamera;