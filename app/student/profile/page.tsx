"use client";

import { useEffect, useState } from "react";
import { 
  GraduationCap, 
  MapPin, 
  FileCheck, 
  ArrowLeft, 
  ArrowRight, 
  Check 
} from "lucide-react";

export default function ProfileBuilder() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [formData, setFormData] = useState({
    academicLevel: "",
    gpa: "",
    englishTestType: "IELTS",
    englishTestScore: "",
    intendedDegree: "",
    preferredCountry: "",
    budgetRange: "",
    fundingSource: "",
    gapHistory: "",
    workExperience: "",
    passportStatus: "Valid",
    visaRefusalHistory: "No prior visa refusals",
    preferredIntake: "",
    guardianConsent: false,
  });

  // Load current profile
  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch("/api/student/profile");
        if (res.ok) {
          const data = await res.json();
          // Normalize null values
          const normalized = { ...formData };
          Object.keys(data).forEach((key) => {
            if (data[key] !== null) {
              (normalized as any)[key] = data[key];
            }
          });
          setFormData(normalized);
        }
      } catch (err) {
        console.error("Load profile failed", err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleNext = () => {
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const res = await fetch("/api/student/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          // Coerce empty strings to null or correct types for API validation
          gpa: formData.gpa === "" ? null : Number(formData.gpa),
          englishTestScore: formData.englishTestScore === "" ? null : Number(formData.englishTestScore),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Failed to save profile details.");
      } else {
        setSuccessMsg("Profile updated successfully!");
        setStep(1); // Reset step back
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch (err) {
      setErrorMsg("An unexpected error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-slate-500">Loading student profile builder...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-2">Build Student Profile</h1>
        <p className="text-sm text-slate-500 dark:text-zinc-400">
          Provide your accurate academic history and preferences to get matched with suitable global courses.
        </p>
      </div>

      {successMsg && (
        <div className="bg-emerald-55 border border-emerald-200 text-emerald-650 dark:bg-emerald-950/20 dark:border-emerald-800/50 dark:text-emerald-400 text-sm rounded-xl p-4 text-center font-semibold">
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 text-rose-600 dark:bg-rose-950/20 dark:border-rose-800/50 dark:text-rose-400 text-sm rounded-xl p-4 text-center font-semibold">
          {errorMsg}
        </div>
      )}

      {/* Stepper Progress Bar */}
      <div className="flex justify-between items-center bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-4 rounded-xl shadow-xs">
        {[
          { num: 1, label: "Academics", icon: GraduationCap },
          { num: 2, label: "Intentions", icon: MapPin },
          { num: 3, label: "History", icon: FileCheck },
        ].map((s) => {
          const isActive = step === s.num;
          const isCompleted = step > s.num;
          return (
            <div key={s.num} className="flex items-center gap-2">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition ${
                isCompleted 
                  ? "bg-indigo-600 text-white" 
                  : isActive 
                  ? "bg-indigo-50 border-2 border-indigo-600 text-indigo-600 dark:bg-indigo-950/30" 
                  : "bg-slate-50 border border-slate-200 text-slate-400 dark:bg-zinc-800 dark:border-zinc-700"
              }`}>
                {isCompleted ? <Check className="h-4 w-4" /> : s.num}
              </div>
              <span className={`text-xs font-semibold hidden sm:inline ${
                isActive ? "text-indigo-600" : "text-slate-400"
              }`}>
                {s.label}
              </span>
              {s.num < 3 && <div className="w-8 sm:w-16 h-px bg-slate-200 dark:bg-zinc-800 mx-1" />}
            </div>
          );
        })}
      </div>

      {/* Stepper Form */}
      <form onSubmit={handleSubmit} className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 sm:p-8 rounded-2xl shadow-sm space-y-6">
        
        {/* STEP 1: ACADEMICS */}
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-slate-800 dark:text-zinc-100 flex items-center gap-2 border-b border-slate-100 pb-3">
              <GraduationCap className="h-5 w-5 text-indigo-600" /> Academic & Test Scores
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="font-semibold text-xs text-slate-500 mb-1.5 block">Current Academic Level</label>
                <select
                  name="academicLevel"
                  value={formData.academicLevel}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:border-indigo-600"
                >
                  <option value="">Select Level</option>
                  <option value="+2 High School">+2 High School / A-Levels</option>
                  <option value="Bachelor">Bachelor Degree</option>
                  <option value="Master">Master Degree</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-xs text-slate-500 mb-1.5 block">Academic GPA / Percentage</label>
                <input
                  type="number"
                  step="0.01"
                  name="gpa"
                  value={formData.gpa}
                  onChange={handleChange}
                  max={4.0}
                  min={0.0}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:border-indigo-600"
                  placeholder="e.g. 3.65 (GPA out of 4.0)"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="font-semibold text-xs text-slate-500 mb-1.5 block">English Language Exam</label>
                <select
                  name="englishTestType"
                  value={formData.englishTestType}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:border-indigo-600"
                >
                  <option value="IELTS">IELTS</option>
                  <option value="PTE">PTE Academic</option>
                  <option value="TOEFL">TOEFL iBT</option>
                  <option value="Duolingo">Duolingo English Test</option>
                  <option value="None">None / Waiver Requested</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-xs text-slate-500 mb-1.5 block">Test Score (Overall)</label>
                <input
                  type="number"
                  step="0.1"
                  name="englishTestScore"
                  value={formData.englishTestScore}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:border-indigo-600"
                  placeholder="e.g. 7.5 (for IELTS) or 68 (for PTE)"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleNext}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-xl transition flex items-center gap-1.5 text-xs shadow-xs"
              >
                Next Step <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: INTENTIONS */}
        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-slate-800 dark:text-zinc-100 flex items-center gap-2 border-b border-slate-100 pb-3">
              <MapPin className="h-5 w-5 text-indigo-600" /> Study Intentions & Budget
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="font-semibold text-xs text-slate-500 mb-1.5 block">Intended Degree Level</label>
                <select
                  name="intendedDegree"
                  value={formData.intendedDegree}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:border-indigo-600"
                >
                  <option value="">Select Intended Degree</option>
                  <option value="Bachelor">Bachelor Degree</option>
                  <option value="Master">Master Degree</option>
                  <option value="PhD">PhD / Doctorate</option>
                  <option value="Diploma">Diploma / Advanced Diploma</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-xs text-slate-500 mb-1.5 block">Preferred Country</label>
                <select
                  name="preferredCountry"
                  value={formData.preferredCountry}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:border-indigo-600"
                >
                  <option value="">Select Country</option>
                  <option value="USA">United States (USA)</option>
                  <option value="Australia">Australia</option>
                  <option value="Canada">Canada</option>
                  <option value="UK">United Kingdom (UK)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="font-semibold text-xs text-slate-500 mb-1.5 block">Annual Budget Range (USD / AUD)</label>
                <select
                  name="budgetRange"
                  value={formData.budgetRange}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:border-indigo-600"
                >
                  <option value="">Select Budget Range</option>
                  <option value="Below $15,000">Below $15,000</option>
                  <option value="$15,000 - $25,000">$15,000 - $25,000</option>
                  <option value="$25,000 - $35,000">$25,000 - $35,000</option>
                  <option value="Above $35,000">Above $35,000</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-xs text-slate-500 mb-1.5 block">Funding Source</label>
                <input
                  type="text"
                  name="fundingSource"
                  value={formData.fundingSource}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:border-indigo-600"
                  placeholder="e.g. Bank Loan & Family Savings"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-xs text-slate-500 mb-1.5 block">Preferred Intake Term</label>
              <input
                type="text"
                name="preferredIntake"
                value={formData.preferredIntake}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:border-indigo-600"
                placeholder="e.g. Fall 2026 (Sept) or Semester 1 2027 (Feb)"
              />
            </div>

            <div className="flex justify-between">
              <button
                type="button"
                onClick={handleBack}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2 px-6 rounded-xl transition flex items-center gap-1.5 text-xs border border-slate-200"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-xl transition flex items-center gap-1.5 text-xs shadow-xs"
              >
                Next Step <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: HISTORY & CONSENT */}
        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-slate-800 dark:text-zinc-100 flex items-center gap-2 border-b border-slate-100 pb-3">
              <FileCheck className="h-5 w-5 text-indigo-600" /> Gap, Visa History & Consents
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="font-semibold text-xs text-slate-500 mb-1.5 block">Passport Status</label>
                <select
                  name="passportStatus"
                  value={formData.passportStatus}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:border-indigo-600"
                >
                  <option value="Valid">Valid Passport</option>
                  <option value="Applied">Applied / Awaiting</option>
                  <option value="Expired">Expired</option>
                  <option value="No Passport">No Passport yet</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-xs text-slate-500 mb-1.5 block">Visa Refusal History</label>
                <input
                  type="text"
                  name="visaRefusalHistory"
                  value={formData.visaRefusalHistory}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:border-indigo-600"
                  placeholder="e.g. None or Refused once in USA (2024)"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-xs text-slate-500 mb-1.5 block">Work Experience (if any)</label>
              <textarea
                name="workExperience"
                value={formData.workExperience}
                onChange={handleChange}
                rows={2}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-sm focus:outline-none focus:border-indigo-600"
                placeholder="Brief description of your jobs or internships"
              />
            </div>

            <div>
              <label className="font-semibold text-xs text-slate-500 mb-1.5 block">Study Gap History</label>
              <input
                type="text"
                name="gapHistory"
                value={formData.gapHistory}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-sm focus:outline-none focus:border-indigo-600"
                placeholder="Specify if there is any study gap and its reasons"
              />
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
              <input
                type="checkbox"
                name="guardianConsent"
                checked={formData.guardianConsent}
                onChange={handleChange}
                className="rounded accent-indigo-600 h-4 w-4"
              />
              <span className="text-xs text-slate-500">
                I authorize VidyarthiiConnect to review and process my academic data. (If under 18, I confirm parent/guardian approval).
              </span>
            </div>

            <div className="flex justify-between">
              <button
                type="button"
                onClick={handleBack}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2 px-6 rounded-xl transition flex items-center gap-1.5 text-xs border border-slate-200"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold py-2.5 px-8 rounded-xl transition flex items-center gap-1.5 text-xs shadow-xs"
              >
                {submitting ? "Saving Profile..." : "Save Details"}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
