/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, FormEvent } from 'react';
import { 
  Search, Save, RefreshCw, User, School, CreditCard, 
  Hash, AlertCircle, CheckCircle2, Mail, 
  ArrowRight, ShieldCheck, Database, Phone
} from 'lucide-react';
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
  const [scriptUrl] = useState("https://script.google.com/macros/s/AKfycbyH6faFA2UT0pEwXLPKKPFjkJlIYEj_9Yenx4szLw5Cq8j6NXUYk0VPbsLnFaLZKiKD/exec");

  const readonlyFields = [
    "EMPLOYEE NAME", "DESIGNATION", "UDISE CODE", "SCHOOL NAME", "NYAY PANCHAYAT", "Employee Type"
  ];

  const handleFetch = async () => {
    if (!searchCode) {
      setMessage({ type: 'error', text: "Please enter EHRMS CODE" });
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
          setMessage({ type: 'success', text: "Employee record found and synchronized." });
        } else {
          setFormData({ ...INITIAL_DATA, "EHRMS CODE": searchCode });
          setIsExists(false);
          setMessage({ type: 'error', text: "No record found. You can initialize a new entry." });
        }
      } else {
        setMessage({ type: 'error', text: result.message || "Synchronization failed." });
      }
    } catch (error) {
      setMessage({ type: 'error', text: "Network error. Please verify your connection." });
    } finally {
      setIsLoading(false);
    }
  };

  const validate = () => {
    if (!formData["AADHAR NUMBER"] || !AADHAR_REGEX.test(formData["AADHAR NUMBER"])) return "Aadhar must be 12 digits.";
    if (!formData["PAN NUMBER"] || !PAN_REGEX.test(formData["PAN NUMBER"])) return "Invalid PAN format.";
    if (!formData["ACCOUNT NUMBER"] || formData["ACCOUNT NUMBER"].length <= 10) return "Invalid Account Number.";
    if (!formData["IFSC CODE"] || !IFSC_REGEX.test(formData["IFSC CODE"])) return "Invalid IFSC format.";
    if (!formData["MOBILE NUMBER"] || !MOBILE_REGEX.test(formData["MOBILE NUMBER"])) return "Invalid Mobile Number.";
    if (!formData["EMAIL Address"] || !EMAIL_REGEX.test(formData["EMAIL Address"])) return "Invalid Email Address.";

    for (const key in formData) {
      if (key !== 'Timestamp' && !formData[key as keyof EmployeeData]) {
        return `${key} is required.`;
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

    setIsLoading(true);
    try {
      await fetch(scriptUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      setMessage({ type: 'success', text: isExists ? "Record updated successfully." : "New record saved successfully." });
      setIsExists(true);
    } catch (error) {
      setMessage({ type: 'error', text: "Failed to persist data." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof EmployeeData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-[#F0F7FF] text-slate-900 font-sans selection:bg-blue-200 overflow-x-hidden">
      {/* Premium Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-400/20 blur-[120px] rounded-full" />
        <div className="absolute top-[20%] -right-[5%] w-[30%] h-[30%] bg-purple-400/10 blur-[100px] rounded-full" />
        <div className="absolute -bottom-[10%] left-[20%] w-[50%] h-[50%] bg-emerald-400/10 blur-[150px] rounded-full" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] mix-blend-multiply" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 py-12 md:py-20">
        {/* Header */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16 text-center"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-200 mb-6 backdrop-blur-md">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-blue-600">Secure Database Access</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4 bg-gradient-to-b from-slate-900 to-slate-700 bg-clip-text text-transparent">
            Employee Intelligence
          </h1>
        </motion.header>

        {/* Search Section */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl mx-auto mb-20"
        >
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-10 group-hover:opacity-20 transition duration-1000 group-hover:duration-200" />
            <div className="relative flex flex-col md:flex-row gap-3 p-2 bg-white/80 backdrop-blur-xl border border-blue-100 rounded-2xl shadow-xl shadow-blue-900/5">
              <div className="flex-1 relative">
                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchCode}
                  onChange={(e) => setSearchCode(e.target.value)}
                  placeholder="Enter EHRMS Code..."
                  className="w-full pl-12 pr-4 py-4 bg-transparent text-lg font-light focus:outline-none placeholder:text-slate-300 text-slate-900"
                />
              </div>
              <button
                onClick={handleFetch}
                disabled={isLoading}
                className="px-8 py-4 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95 shadow-lg shadow-slate-900/20"
              >
                {isLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                <span>Synchronize</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Status Message */}
        <AnimatePresence mode="wait">
          {message && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`max-w-2xl mx-auto mb-12 p-4 rounded-xl flex items-center gap-3 backdrop-blur-md border shadow-sm ${
                message.type === 'success' 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                : 'bg-red-50 text-red-700 border-red-100'
              }`}
            >
              {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              <span className="text-sm font-medium">{message.text}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Form */}
        <motion.form 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          onSubmit={handleSubmit} 
          className="space-y-12"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Personal Details Section */}
            <motion.section variants={itemVariants} className="group relative">
              <div className="absolute -inset-px bg-gradient-to-b from-blue-500/10 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative h-full bg-white/70 backdrop-blur-sm border border-blue-100 p-8 rounded-3xl shadow-sm">
                <div className="flex items-center justify-between mb-10">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                      <User className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold tracking-tight text-slate-900">Identity</h2>
                      <p className="text-xs text-slate-500">Personal information profile</p>
                    </div>
                  </div>
                  <div className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Section 01</div>
                </div>
                
                <div className="space-y-6">
                  <FormField
                    label="Full Employee Name"
                    value={formData["EMPLOYEE NAME"]}
                    onChange={(v) => handleInputChange("EMPLOYEE NAME", v)}
                    readonly={readonlyFields.includes("EMPLOYEE NAME")}
                    icon={<User className="w-4 h-4" />}
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
                      placeholder="DD/MM/YYYY"
                    />
                  </div>
                  <FormField
                    label="Father's Name"
                    value={formData["FATHER NAME"]}
                    onChange={(v) => handleInputChange("FATHER NAME", v)}
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <FormField
                      label="Mobile Contact"
                      value={formData["MOBILE NUMBER"]}
                      onChange={(v) => handleInputChange("MOBILE NUMBER", v)}
                      placeholder="10-digit number"
                      icon={<Phone className="w-4 h-4" />}
                    />
                    <FormField
                      label="Email Address"
                      value={formData["EMAIL Address"]}
                      onChange={(v) => handleInputChange("EMAIL Address", v)}
                      placeholder="name@domain.com"
                      icon={<Mail className="w-4 h-4" />}
                    />
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Professional Details Section */}
            <motion.section variants={itemVariants} className="group relative">
              <div className="absolute -inset-px bg-gradient-to-b from-purple-500/10 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative h-full bg-white/70 backdrop-blur-sm border border-blue-100 p-8 rounded-3xl shadow-sm">
                <div className="flex items-center justify-between mb-10">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-500/10 rounded-2xl border border-purple-500/20">
                      <School className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold tracking-tight text-slate-900">Professional</h2>
                      <p className="text-xs text-slate-500">Employment & deployment</p>
                    </div>
                  </div>
                  <div className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Section 02</div>
                </div>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <FormField
                      label="Designation"
                      value={formData["DESIGNATION"]}
                      onChange={(v) => handleInputChange("DESIGNATION", v)}
                      readonly={readonlyFields.includes("DESIGNATION")}
                    />
                    <FormField
                      label="Employment Type"
                      value={formData["Employee Type"]}
                      onChange={(v) => handleInputChange("Employee Type", v)}
                      readonly={readonlyFields.includes("Employee Type")}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
                    label="Assigned School Name"
                    value={formData["SCHOOL NAME"]}
                    onChange={(v) => handleInputChange("SCHOOL NAME", v)}
                    readonly={readonlyFields.includes("SCHOOL NAME")}
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <FormField
                      label="Joining Date"
                      value={formData["Joining Date in Service"]}
                      onChange={(v) => handleInputChange("Joining Date in Service", v)}
                      placeholder="DD/MM/YYYY"
                    />
                    <FormField
                      label="Retirement Date"
                      value={formData["Date of Retirement"]}
                      onChange={(v) => handleInputChange("Date of Retirement", v)}
                      placeholder="DD/MM/YYYY"
                    />
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Financial Details Section */}
            <motion.section variants={itemVariants} className="lg:col-span-2 group relative">
              <div className="absolute -inset-px bg-gradient-to-b from-emerald-500/10 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative bg-white/70 backdrop-blur-sm border border-blue-100 p-8 rounded-3xl shadow-sm">
                <div className="flex items-center justify-between mb-10">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                      <CreditCard className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold tracking-tight text-slate-900">Financial & Identity</h2>
                      <p className="text-xs text-slate-500">Secure banking and government IDs</p>
                    </div>
                  </div>
                  <div className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Section 03</div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
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
                    placeholder="12-digit UID"
                  />
                  <FormField
                    label="Account Number"
                    value={formData["ACCOUNT NUMBER"]}
                    onChange={(v) => handleInputChange("ACCOUNT NUMBER", v)}
                    placeholder="Banking ID"
                  />
                  <FormField
                    label="IFSC Code"
                    value={formData["IFSC CODE"]}
                    onChange={(v) => handleInputChange("IFSC CODE", v.toUpperCase())}
                    placeholder="Branch Code"
                  />
                </div>
              </div>
            </motion.section>
          </div>

          {/* Submit Button */}
          <motion.div variants={itemVariants} className="flex flex-col items-center gap-6 pt-12 pb-20">
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full max-w-md overflow-hidden rounded-2xl bg-slate-900 p-[1px] transition-all active:scale-95 disabled:opacity-50 shadow-xl shadow-slate-900/20"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative flex items-center justify-center gap-3 bg-slate-900 px-8 py-5 text-white rounded-[15px] font-bold text-lg group-hover:bg-transparent transition-all duration-300">
                {isLoading ? <RefreshCw className="w-6 h-6 animate-spin" /> : (isExists ? <RefreshCw className="w-6 h-6" /> : <Save className="w-6 h-6" />)}
                <span>{isExists ? "Update Synchronized Data" : "Initialize New Record"}</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
            
            {formData.Timestamp && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/5 border border-slate-200 text-[10px] text-slate-500 uppercase tracking-widest"
              >
                <Database className="w-3 h-3" />
                <span>Last Sync: {formData.Timestamp}</span>
              </motion.div>
            )}
          </motion.div>
        </motion.form>
      </div>

      {/* Footer Branding */}
      <footer className="relative py-10 border-t border-blue-100 text-center">
        <div className="flex items-center justify-center gap-4 opacity-30 grayscale hover:grayscale-0 transition-all duration-500">
          <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-900">Enterprise Grade</div>
          <div className="w-1 h-1 rounded-full bg-slate-900" />
          <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-900">Cloud Native</div>
        </div>
      </footer>
    </div>
  );
}

// Refined Form Field Component
function FormField({ 
  label, 
  value, 
  onChange, 
  readonly = false, 
  type = "text", 
  placeholder = "",
  options = [],
  icon
}: { 
  label: string; 
  value: string; 
  onChange: (v: string) => void; 
  readonly?: boolean;
  type?: "text" | "date" | "select";
  placeholder?: string;
  options?: string[];
  icon?: React.ReactNode;
}) {
  return (
    <div className="w-full group/field">
      <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-2.5 ml-1 group-focus-within/field:text-blue-600 transition-colors">
        {label}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/field:text-blue-600 transition-colors">
            {icon}
          </div>
        )}
        {type === "select" ? (
          <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={readonly}
            className={`w-full px-4 py-3.5 rounded-xl border transition-all outline-none appearance-none bg-white/50 ${
              readonly 
              ? 'border-slate-100 text-slate-400 cursor-not-allowed bg-slate-50/50' 
              : 'border-blue-100 focus:border-blue-500/50 focus:bg-white text-slate-900'
            } ${icon ? 'pl-11' : ''}`}
          >
            <option value="" className="bg-white">Select...</option>
            {options.map(opt => <option key={opt} value={opt} className="bg-white">{opt}</option>)}
          </select>
        ) : (
          <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            readOnly={readonly}
            placeholder={placeholder}
            className={`w-full px-4 py-3.5 rounded-xl border transition-all outline-none bg-white/50 ${
              readonly 
              ? 'border-slate-100 text-slate-400 cursor-not-allowed bg-slate-50/50' 
              : 'border-blue-100 focus:border-blue-500/50 focus:bg-white text-slate-900 placeholder:text-slate-200'
            } ${icon ? 'pl-11' : ''}`}
          />
        )}
        {readonly && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="w-1.5 h-1.5 rounded-full bg-slate-200" title="Read-only" />
          </div>
        )}
      </div>
    </div>
  );
}
