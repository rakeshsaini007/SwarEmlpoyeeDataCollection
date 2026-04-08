/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent } from 'react';
import { Search, Save, RefreshCw, User, School, CreditCard, Calendar, Hash, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Types for our form data
interface EmployeeData {
  "EHRMS CODE": string;
  "EMPLOYEE NAME": string;
  "GENDER": string;
  "FATHER NAME": string;
  "DESIGNATION": string;
  "UDISE CODE": string;
  "SCHOOL NAME": string;
  "NYAY PANCHAYAT": string;
  "PAN NUMBER": string;
  "AADHAR NUMBER": string;
  "MOBILE NUMBER": string;
  "EMAIL Address": string;
  "ACCOUNT NUMBER": string;
  "IFSC CODE": string;
  "Employee Type": string;
  "Date of Birth": string;
  "Joining Date in Service": string;
  "Date of Retirement": string;
  "Timestamp"?: string;
}

const INITIAL_DATA: EmployeeData = {
  "EHRMS CODE": "",
  "EMPLOYEE NAME": "",
  "GENDER": "",
  "FATHER NAME": "",
  "DESIGNATION": "",
  "UDISE CODE": "",
  "SCHOOL NAME": "",
  "NYAY PANCHAYAT": "",
  "PAN NUMBER": "",
  "AADHAR NUMBER": "",
  "MOBILE NUMBER": "",
  "EMAIL Address": "",
  "ACCOUNT NUMBER": "",
  "IFSC CODE": "",
  "Employee Type": "",
  "Date of Birth": "",
  "Joining Date in Service": "",
  "Date of Retirement": "",
};

// Regex patterns for validation
const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
const AADHAR_REGEX = /^\d{12}$/;
const IFSC_REGEX = /^[A-Z]{4}\d[A-Z0-9]{6}$/;
const MOBILE_REGEX = /^\d{10}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function App() {
  const [formData, setFormData] = useState<EmployeeData>(INITIAL_DATA);
  const [searchCode, setSearchCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isExists, setIsExists] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [scriptUrl, setScriptUrl] = useState("https://script.google.com/macros/s/AKfycbyH6faFA2UT0pEwXLPKKPFjkJlIYEj_9Yenx4szLw5Cq8j6NXUYk0VPbsLnFaLZKiKD/exec");

  // Readonly fields as specified
  const readonlyFields = [
    "EMPLOYEE NAME", "DESIGNATION", "UDISE CODE", "SCHOOL NAME", "NYAY PANCHAYAT", "Employee Type"
  ];

  const handleFetch = async () => {
    if (!searchCode) {
      setMessage({ type: 'error', text: "Please enter EHRMS CODE" });
      return;
    }
    if (!scriptUrl) {
      setMessage({ type: 'error', text: "Please provide the Google Apps Script Web App URL first." });
      return;
    }

    setIsLoading(true);
    setMessage(null);
    try {
      const response = await fetch(`${scriptUrl}?ehrmsCode=${searchCode}`);
      const result = await response.json();

      if (result.status === "success") {
        if (result.exists) {
          const fetchedData = result.data;
          setFormData({
            ...INITIAL_DATA,
            ...fetchedData,
            "EHRMS CODE": searchCode
          });
          setIsExists(true);
          setMessage({ type: 'success', text: "Data fetched successfully!" });
        } else {
          setFormData({ ...INITIAL_DATA, "EHRMS CODE": searchCode });
          setIsExists(false);
          setMessage({ type: 'error', text: "Employee not found. You can enter details to save." });
        }
      } else {
        setMessage({ type: 'error', text: result.message || "Failed to fetch data" });
      }
    } catch (error) {
      setMessage({ type: 'error', text: "Error connecting to server. Check your Script URL and CORS settings." });
    } finally {
      setIsLoading(false);
    }
  };

  const validate = () => {
    if (!formData["AADHAR NUMBER"] || !AADHAR_REGEX.test(formData["AADHAR NUMBER"])) {
      return "Aadhar number must be exactly 12 digits.";
    }
    if (!formData["PAN NUMBER"] || !PAN_REGEX.test(formData["PAN NUMBER"])) {
      return "Invalid PAN format (e.g., ABCDE1234F).";
    }
    if (!formData["ACCOUNT NUMBER"] || formData["ACCOUNT NUMBER"].length <= 10 || isNaN(Number(formData["ACCOUNT NUMBER"]))) {
      return "Account number must be numeric and greater than 10 digits.";
    }
    if (!formData["IFSC CODE"] || !IFSC_REGEX.test(formData["IFSC CODE"])) {
      return "Invalid IFSC format (4 letters, 1 digit, 6 alphanumeric).";
    }
    if (!formData["MOBILE NUMBER"] || !MOBILE_REGEX.test(formData["MOBILE NUMBER"])) {
      return "Mobile number must be 10 digits.";
    }
    if (!formData["EMAIL Address"] || !EMAIL_REGEX.test(formData["EMAIL Address"])) {
      return "Please enter a valid email address.";
    }

    // Check mandatory fields
    for (const key in formData) {
      if (key !== 'Timestamp' && !formData[key as keyof EmployeeData]) {
        return `${key} is mandatory.`;
      }
    }
    return null;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const error = validate();
    if (error) {
      setMessage({ type: 'error', text: error });
      return;
    }

    if (!scriptUrl) {
      setMessage({ type: 'error', text: "Please provide the Google Apps Script Web App URL." });
      return;
    }

    setIsLoading(true);
    try {
      await fetch(scriptUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      setMessage({ type: 'success', text: isExists ? "Data updated successfully!" : "Data saved successfully!" });
      setIsExists(true);
    } catch (error) {
      setMessage({ type: 'error', text: "Failed to save data." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof EmployeeData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] text-[#1A1A1A] font-sans p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-light tracking-tight text-gray-900 mb-2">
            Employee Data Management
          </h1>
          <p className="text-sm text-gray-500 uppercase tracking-widest font-medium">
            Google Sheets Integration System
          </p>
        </header>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                Google Apps Script Web App URL
              </label>
              <input
                type="text"
                value={scriptUrl}
                onChange={(e) => setScriptUrl(e.target.value)}
                placeholder="https://script.google.com/macros/s/.../exec"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                Enter EHRMS CODE to Fetch Details
              </label>
              <div className="relative">
                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchCode}
                  onChange={(e) => setSearchCode(e.target.value)}
                  placeholder="e.g. 655173"
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                />
              </div>
            </div>
            <button
              onClick={handleFetch}
              disabled={isLoading}
              className="w-full md:w-auto px-8 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
              Fetch Details
            </button>
          </div>
        </div>

        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`mb-8 p-4 rounded-xl flex items-center gap-3 ${
                message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
              }`}
            >
              {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              <span className="text-sm font-medium">{message.text}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-lg font-semibold">Personal Details</h2>
              </div>
              
              <div className="space-y-5">
                <FormField
                  label="Employee Name"
                  value={formData["EMPLOYEE NAME"]}
                  onChange={(v) => handleInputChange("EMPLOYEE NAME", v)}
                  readonly={readonlyFields.includes("EMPLOYEE NAME")}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    label="Gender"
                    value={formData["GENDER"]}
                    onChange={(v) => handleInputChange("GENDER", v)}
                    type="select"
                    options={["Male", "Female", "Other"]}
                  />
                  <FormField
                    label="Date of Birth"
                    value={formData["Date of Birth"]}
                    onChange={(v) => handleInputChange("Date of Birth", v)}
                    type="date"
                  />
                </div>
                <FormField
                  label="Father Name"
                  value={formData["FATHER NAME"]}
                  onChange={(v) => handleInputChange("FATHER NAME", v)}
                />
                <FormField
                  label="Mobile Number"
                  value={formData["MOBILE NUMBER"]}
                  onChange={(v) => handleInputChange("MOBILE NUMBER", v)}
                  placeholder="10 digits"
                />
                <FormField
                  label="EMAIL Address"
                  value={formData["EMAIL Address"]}
                  onChange={(v) => handleInputChange("EMAIL Address", v)}
                  placeholder="example@mail.com"
                />
              </div>
            </section>

            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-purple-50 rounded-lg">
                  <School className="w-5 h-5 text-purple-600" />
                </div>
                <h2 className="text-lg font-semibold">Professional Details</h2>
              </div>
              
              <div className="space-y-5">
                <FormField
                  label="Designation"
                  value={formData["DESIGNATION"]}
                  onChange={(v) => handleInputChange("DESIGNATION", v)}
                  readonly={readonlyFields.includes("DESIGNATION")}
                />
                <FormField
                  label="Employee Type"
                  value={formData["Employee Type"]}
                  onChange={(v) => handleInputChange("Employee Type", v)}
                  readonly={readonlyFields.includes("Employee Type")}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    label="UDISE Code"
                    value={formData["UDISE CODE"]}
                    onChange={(v) => handleInputChange("UDISE CODE", v)}
                    readonly={readonlyFields.includes("UDISE CODE")}
                  />
                  <FormField
                    label="Nyay Panchayat"
                    value={formData["NYAY PANCHAYAT"]}
                    onChange={(v) => handleInputChange("NYAY PANCHAYAT", v)}
                    readonly={readonlyFields.includes("NYAY PANCHAYAT")}
                  />
                </div>
                <FormField
                  label="School Name"
                  value={formData["SCHOOL NAME"]}
                  onChange={(v) => handleInputChange("SCHOOL NAME", v)}
                  readonly={readonlyFields.includes("SCHOOL NAME")}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    label="Joining Date"
                    value={formData["Joining Date in Service"]}
                    onChange={(v) => handleInputChange("Joining Date in Service", v)}
                    type="date"
                  />
                  <FormField
                    label="Retirement Date"
                    value={formData["Date of Retirement"]}
                    onChange={(v) => handleInputChange("Date of Retirement", v)}
                    type="date"
                  />
                </div>
              </div>
            </section>

            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-emerald-50 rounded-lg">
                  <CreditCard className="w-5 h-5 text-emerald-600" />
                </div>
                <h2 className="text-lg font-semibold">Financial & Identity Details</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <FormField
                  label="PAN Number"
                  value={formData["PAN NUMBER"]}
                  onChange={(v) => handleInputChange("PAN NUMBER", v.toUpperCase())}
                  placeholder="ABCDE1234F"
                />
                <FormField
                  label="Aadhar Number"
                  value={formData["AADHAR NUMBER"]}
                  onChange={(v) => handleInputChange("AADHAR NUMBER", v)}
                  placeholder="12 digits"
                />
                <FormField
                  label="Account Number"
                  value={formData["ACCOUNT NUMBER"]}
                  onChange={(v) => handleInputChange("ACCOUNT NUMBER", v)}
                  placeholder="Min 11 digits"
                />
                <FormField
                  label="IFSC Code"
                  value={formData["IFSC CODE"]}
                  onChange={(v) => handleInputChange("IFSC CODE", v.toUpperCase())}
                  placeholder="ABCD0123456"
                />
              </div>
            </section>
          </div>

          <div className="flex flex-col items-center gap-4 py-8">
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full max-w-md py-4 rounded-2xl font-semibold text-lg shadow-lg transition-all flex items-center justify-center gap-3 ${
                isExists 
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200' 
                : 'bg-gray-900 hover:bg-black text-white shadow-gray-200'
              } disabled:opacity-50`}
            >
              {isLoading ? <RefreshCw className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
              {isExists ? "Update Employee Data" : "Submit Employee Data"}
            </button>
            {formData.Timestamp && (
              <p className="text-xs text-gray-400 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Last updated: {formData.Timestamp}
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

function FormField({ 
  label, 
  value, 
  onChange, 
  readonly = false, 
  type = "text", 
  placeholder = "",
  options = []
}: { 
  label: string; 
  value: string; 
  onChange: (v: string) => void; 
  readonly?: boolean;
  type?: "text" | "date" | "select";
  placeholder?: string;
  options?: string[];
}) {
  return (
    <div className="w-full">
      <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1.5 ml-1">
        {label}
      </label>
      {type === "select" ? (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={readonly}
          className={`w-full px-4 py-2.5 rounded-xl border transition-all outline-none appearance-none bg-gray-50 ${
            readonly 
            ? 'bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed' 
            : 'border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500'
          }`}
        >
          <option value="">Select {label}</option>
          {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          readOnly={readonly}
          placeholder={placeholder}
          className={`w-full px-4 py-2.5 rounded-xl border transition-all outline-none ${
            readonly 
            ? 'bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed' 
            : 'bg-gray-50 border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500'
          }`}
        />
      )}
    </div>
  );
}
