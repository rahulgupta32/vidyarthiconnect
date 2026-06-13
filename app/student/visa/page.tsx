"use client";

import { useState } from "react";
import { 
  ShieldCheck, 
  MapPin, 
  BookOpen, 
  FileText, 
  HelpCircle, 
  CheckCircle,
  ExternalLink
} from "lucide-react";

export default function VisaNocPrep() {
  const [selectedCountry, setSelectedCountry] = useState("USA");

  const countryChecklists: Record<string, string[]> = {
    USA: [
      "Valid Passport (at least 6 months validity)",
      "Form I-20 issued by the SEVP-approved US institution",
      "SEVIS I-901 fee payment receipt",
      "DS-160 non-immigrant visa application confirmation page",
      "Visa interview appointment confirmation letter",
      "Academic records (transcripts, diplomas, English score sheets)",
      "Financial capacity proofs (bank statements, tax clearance, sponsor letters)",
      "F-1 visa fee payment receipt",
    ],
    Australia: [
      "Valid Passport copy",
      "Confirmation of Enrolment (CoE) issued by Australian university",
      "Genuine Student (GS) statement requirement document",
      "Overseas Student Health Cover (OSHC) policy certificate",
      "English language test report (IELTS/PTE)",
      "Financial funding statement (bank balance certificates, income sources)",
      "Subclass 500 student visa fee receipt",
      "Medical checkup confirmation receipt",
    ],
    Canada: [
      "Valid Passport copy",
      "Letter of Acceptance (LOA) from a Designated Learning Institution (DLI)",
      "Provincial Attestation Letter (PAL) if applicable",
      "Guaranteed Investment Certificate (GIC) receipt ($20,635 CAD)",
      "Tuition payment receipt for the first year of study",
      "English test reports (IELTS Academic / PTE)",
      "Study Permit application form (IMM 1294) and fee receipt ($150 CAD)",
      "Biometrics appointment details sheet",
    ],
    UK: [
      "Valid Passport",
      "Confirmation of Acceptance for Studies (CAS) number code",
      "Tuberculosis test clearance certificate (from approved clinic in Nepal)",
      "Financial statements demonstrating maintenance funds (£1,334/month outer London)",
      "Immigration Health Surcharge (IHS) payment receipt",
      "UK student visa fee receipt",
      "Academic certificates listed on the CAS details",
    ],
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-2">Visa & NOC Preparation</h1>
        <p className="text-sm text-slate-500 dark:text-zinc-400">
          Prepare your documentation folders for Nepal No Objection Certificate (NOC) and student visa interviews.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Columns: Visa Checklists */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 rounded-2xl shadow-sm space-y-6">
          <div className="flex justify-between items-center border-b border-slate-100 dark:border-zinc-850 pb-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-indigo-650" /> Student Visa Checklist
            </h2>
            
            {/* Country tabs */}
            <div className="flex bg-slate-100 dark:bg-zinc-800 p-1 rounded-xl">
              {Object.keys(countryChecklists).map((c) => (
                <button
                  key={c}
                  onClick={() => setSelectedCountry(c)}
                  className={`px-3 py-1 rounded-lg text-xxs font-extrabold transition ${
                    selectedCountry === c 
                      ? "bg-white text-indigo-600 shadow-xs dark:bg-zinc-900" 
                      : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-xs text-slate-500">
              Below is the comprehensive list of required documents for applying for a student visa to <strong>{selectedCountry}</strong>:
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              {countryChecklists[selectedCountry].map((item, idx) => (
                <div key={idx} className="flex gap-2.5 items-start text-xs bg-slate-50 dark:bg-zinc-800/40 p-3 rounded-xl hover:bg-slate-100/50 transition">
                  <CheckCircle className="h-4.5 w-4.5 text-indigo-600 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-650 dark:text-zinc-350 leading-relaxed">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-amber-50/50 dark:bg-amber-950/10 border border-amber-100 dark:border-amber-900/50 p-4 rounded-xl text-xxs leading-relaxed text-amber-800 dark:text-amber-400">
            <strong>Important notice:</strong> Visa regulations change frequently. Always consult with your assigned counselor before submitting your DS-160, Lodging visa profiles, or committing GIC/Tuition fees.
          </div>
        </div>

        {/* Right 1 Column: Nepal NOC MoEST Guide */}
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 rounded-2xl shadow-sm space-y-6">
          <h2 className="text-lg font-bold flex items-center gap-2 border-b border-slate-100 pb-4">
            <BookOpen className="h-5 w-5 text-indigo-650" /> Nepal NOC Checklist
          </h2>

          <p className="text-xs text-slate-500 leading-relaxed">
            Nepali students require a No Objection Certificate (NOC) from the Ministry of Education, Science and Technology (MoEST) to transfer study fees abroad.
          </p>

          <div className="space-y-3">
            {[
              "Citizenship Certificate (Scanned copy)",
              "Validated University Offer Letter / CoE",
              "Academic Transcripts & Certificates (SLC/+2/Bachelor)",
              "SWIFT / TT Payment Receipt if applicable",
              "Application Form completed on MoEST portal"
            ].map((doc, idx) => (
              <div key={idx} className="flex gap-2 items-center text-xs">
                <span className="text-indigo-600 font-bold">✓</span>
                <span className="text-slate-600 dark:text-zinc-450">{doc}</span>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-zinc-850">
            <a
              href="https://noc.moest.gov.np/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-slate-50 hover:bg-slate-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 border border-slate-200 dark:border-zinc-750 text-xs font-semibold py-2.5 rounded-xl text-center flex items-center justify-center gap-1.5 transition"
            >
              MoEST Nepal NOC Portal <ExternalLink className="h-3.5 w-3.5" />
            </a>
            <span className="text-slate-400 text-xxs block text-center mt-2 leading-tight">
              (Future API integration placeholder for MoEST auto-verifications)
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
