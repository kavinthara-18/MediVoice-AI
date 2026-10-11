import { BrowserRouter, Routes, Route } from "react-router-dom";

import Splash from "../pages/Splash";
import Welcome from "../pages/Welcome";
import RoleSelection from "../pages/RoleSelection";
import PatientLogin from "../pages/PatientLogin";
import PatientRegister from "../pages/PatientRegister";
import VoiceAssistant from "../pages/VoiceAssistant";
import DoctorSelection from "../pages/DoctorSelection";
import PatientDetails from "../pages/PatientDetails";
import CareDestination from "../pages/CareDestination";
import DoctorPortal from "../pages/DoctorPortal";
import AdminDashboard from "../AdminDashboard";
import EmergencyDashboard from "../EmergencyDashboard";
import SkinCamera from "../pages/SkinCamera";
import DoctorDashboard from "../pages/DoctorDashboard";


function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Splash />} />
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/roles" element={<RoleSelection />} />
        <Route path="/patient-login" element={<PatientLogin />} />
        <Route path="/patient-details" element={<PatientDetails />} />
        <Route path="/register" element={<PatientRegister />} />
        <Route path="/voice" element={<VoiceAssistant />} />
        <Route path="/doctor-dashboard" element={<DoctorSelection />} />
        <Route path="/care-destination" element={<CareDestination />} />
        <Route path="/doctor-selection" element={<DoctorPortal />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/emergency-dashboard" element={<EmergencyDashboard />} />
        <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
        <Route
  path="/skin-camera"
  element={<SkinCamera />}
/>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;