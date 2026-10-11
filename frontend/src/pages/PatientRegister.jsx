import { User, Phone, Mail, Calendar, Droplets, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo/medivoice-logo.png";

function PatientRegister() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-700 to-cyan-500 flex justify-center items-center px-6 py-10">

      <div className="w-full max-w-3xl bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl p-10">

        <div className="flex flex-col items-center">

          <img
            src={logo}
            alt="logo"
            className="w-24 h-24 rounded-full bg-white p-2 shadow-lg"
          />

          <h1 className="text-4xl font-bold text-white mt-4">
            Patient Registration
          </h1>

          <p className="text-blue-100 mt-2">
            Please enter your details to continue
          </p>

        </div>

        <div className="grid grid-cols-2 gap-6 mt-10">

          <div>
            <label className="text-white">Full Name</label>
            <div className="flex items-center bg-white rounded-xl mt-2 px-4 py-3">
              <User className="text-blue-600 mr-3"/>
              <input
                type="text"
                placeholder="Enter Full Name"
                className="w-full outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-white">Mobile Number</label>
            <div className="flex items-center bg-white rounded-xl mt-2 px-4 py-3">
              <Phone className="text-blue-600 mr-3"/>
              <input
                type="text"
                placeholder="+91"
                className="w-full outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-white">Email</label>
            <div className="flex items-center bg-white rounded-xl mt-2 px-4 py-3">
              <Mail className="text-blue-600 mr-3"/>
              <input
                type="email"
                placeholder="example@gmail.com"
                className="w-full outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-white">Date of Birth</label>
            <div className="flex items-center bg-white rounded-xl mt-2 px-4 py-3">
              <Calendar className="text-blue-600 mr-3"/>
              <input
                type="date"
                className="w-full outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-white">Blood Group</label>
            <div className="flex items-center bg-white rounded-xl mt-2 px-4 py-3">
              <Droplets className="text-red-500 mr-3"/>
              <select className="w-full outline-none">
                <option>Select</option>
                <option>A+</option>
                <option>A-</option>
                <option>B+</option>
                <option>B-</option>
                <option>AB+</option>
                <option>AB-</option>
                <option>O+</option>
                <option>O-</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-white">Address</label>
            <div className="flex items-center bg-white rounded-xl mt-2 px-4 py-3">
              <MapPin className="text-green-600 mr-3"/>
              <input
                type="text"
                placeholder="Enter Address"
                className="w-full outline-none"
              />
            </div>
          </div>

        </div>

        <button
          onClick={() => alert("Registration Successful")}
          className="mt-10 w-full bg-white text-blue-700 font-bold py-4 rounded-xl hover:scale-105 transition"
        >
          Continue →
        </button>

      </div>

    </div>
  );
}

export default PatientRegister;