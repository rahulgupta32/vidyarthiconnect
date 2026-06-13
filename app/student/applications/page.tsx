"use client";

import { useEffect, useState } from "react";
import { 
  Send, 
  Clock, 
  MapPin, 
  User, 
  CheckCircle2, 
  AlertCircle, 
  BookOpen, 
  ChevronRight,
  ShieldCheck
} from "lucide-react";

export default function ApplicationTracker() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadApplications = async () => {
    try {
      const res = await fetch("/api/student/applications");
      if (res.ok) {
        const data = await res.json();
        setApplications(data);
      }
    } catch (err) {
      console.error("Load applications failed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "VISA_APPROVED":
      case "ACCEPTED":
      case "ENROLLED":
        return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-450 border-emerald-100";
      case "REJECTED":
      case "VISA_REJECTED":
        return "bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-450 border-rose-100";
      case "COUNSELOR_REVIEW":
        return "bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-450 border-amber-100";
      default:
        return "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-450 border-indigo-100";
    }
  };

  // Timeline stages mapping
  const timelineStages = [
    { label: "Drafting", value: "DRAFTING" },
    { label: "Counselor Review", value: "COUNSELOR_REVIEW" },
    { label: "Submitted", value: "SUBMITTED" },
    { label: "Offer Decided", value: "ACCEPTED" }, // Represents Offer Letter stage
    { label: "Visa Filed", value: "VISA_SUBMITTED" },
    { label: "Enrolled", value: "ENROLLED" }
  ];

  const getStageStatus = (currentStatus: string, stageValue: string) => {
    const statusOrder = [
      "DRAFTING", "DOCUMENTS_PENDING", "COUNSELOR_REVIEW", "SUBMITTED", 
      "AWAITING_DECISION", "CONDITIONAL_OFFER", "UNCONDITIONAL_OFFER", 
      "ACCEPTED", "VISA_PREPARATION", "VISA_SUBMITTED", "VISA_APPROVED", 
      "ENROLLED"
    ];

    const currentIdx = statusOrder.indexOf(currentStatus);
    const stageIdx = statusOrder.indexOf(stageValue);

    if (currentStatus === "REJECTED" || currentStatus === "VISA_REJECTED") {
      return "failed";
    }

    if (currentIdx >= stageIdx) {
      return "completed";
    }
    return "pending";
  };

  if (loading) {
    return <div className="text-center py-20 text-slate-500">Loading your applications tracker...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-2">My Applications Tracker</h1>
        <p className="text-sm text-slate-500 dark:text-zinc-400">
          Track the real-time submission progress and offer letter decision milestones for your applications.
        </p>
      </div>

      {applications.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-12 text-center shadow-sm max-w-lg mx-auto">
          <Send className="h-12 w-12 text-slate-350 mx-auto mb-4" />
          <h2 className="text-lg font-bold mb-2">No Active Applications</h2>
          <p className="text-sm text-slate-550 mb-6">
            Explore partnered colleges and submit your initial program draft from the university finder directory.
          </p>
          <a href="/student/search" className="bg-indigo-650 hover:bg-indigo-750 text-white font-bold py-2.5 px-6 rounded-full text-xs transition">
            Explore Universities
          </a>
        </div>
      ) : (
        <div className="space-y-8">
          {applications.map((app) => (
            <div key={app.id} className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 rounded-2xl shadow-sm space-y-6">
              
              {/* Application Details */}
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-100 dark:border-zinc-850 pb-4">
                <div>
                  <h3 className="font-extrabold text-lg text-slate-800 dark:text-zinc-200">{app.course.title}</h3>
                  <p className="text-sm text-slate-500 font-medium">{app.university.name}</p>
                  
                  <div className="flex flex-wrap gap-4 text-xxs text-slate-400 mt-2">
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> country: {app.university.partnerStatus}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> Intake: {app.intake}</span>
                    {app.counselor && (
                      <span className="flex items-center gap-1"><User className="h-3 w-3" /> Counselor: {app.counselor.user.name}</span>
                    )}
                  </div>
                </div>

                <div>
                  <span className={`text-xxs font-extrabold px-3 py-1 rounded-full uppercase border ${getStatusColor(app.status)}`}>
                    {app.status.replace(/_/g, " ")}
                  </span>
                </div>
              </div>

              {/* Progress Stepper Timeline */}
              <div className="py-4">
                <h4 className="text-xs font-extrabold uppercase text-slate-400 tracking-wider mb-6">Filing timeline status</h4>
                
                <div className="flex flex-col md:flex-row justify-between gap-6 relative">
                  {timelineStages.map((stage, sIdx) => {
                    const status = getStageStatus(app.status, stage.value);
                    const isCompleted = status === "completed";
                    const isFailed = status === "failed";

                    return (
                      <div key={sIdx} className="flex-1 flex md:flex-col items-center md:text-center gap-3 relative z-10">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs transition border ${
                          isCompleted 
                            ? "bg-emerald-500 border-emerald-600 text-white" 
                            : isFailed 
                            ? "bg-rose-500 border-rose-600 text-white" 
                            : "bg-slate-50 border-slate-200 text-slate-450 dark:bg-zinc-800 dark:border-zinc-700"
                        }`}>
                          {isCompleted ? "✓" : sIdx + 1}
                        </div>
                        <div>
                          <div className={`text-xs font-bold ${isCompleted ? "text-slate-800 dark:text-zinc-200" : "text-slate-400"}`}>
                            {stage.label}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Required Documents / Visa Checklist placeholder */}
              <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-slate-100 dark:border-zinc-850">
                <div className="bg-slate-50 dark:bg-zinc-800/40 p-4 rounded-xl">
                  <h4 className="text-xs font-extrabold uppercase text-slate-400 mb-3 flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-indigo-650" /> Visa Checklist Status
                  </h4>
                  {app.visaChecklist ? (
                    <div className="grid grid-cols-2 gap-2 text-xxs text-slate-600 dark:text-zinc-400">
                      <div className="flex items-center gap-1">
                        {app.visaChecklist.passport ? "✅" : "❌"} Passport copy
                      </div>
                      <div className="flex items-center gap-1">
                        {app.visaChecklist.offerLetter ? "✅" : "❌"} Offer Letter
                      </div>
                      <div className="flex items-center gap-1">
                        {app.visaChecklist.academicDocs ? "✅" : "❌"} Academic records
                      </div>
                      <div className="flex items-center gap-1">
                        {app.visaChecklist.englishScore ? "✅" : "❌"} IELTS/PTE scorecard
                      </div>
                      <div className="flex items-center gap-1">
                        {app.visaChecklist.financialDocs ? "✅" : "❌"} Financial proof
                      </div>
                      <div className="flex items-center gap-1">
                        {app.visaChecklist.sopGte ? "✅" : "❌"} SOP Statement
                      </div>
                    </div>
                  ) : (
                    <p className="text-xxs text-slate-400">Visa checklist not generated yet.</p>
                  )}
                </div>

                <div className="bg-slate-50 dark:bg-zinc-800/40 p-4 rounded-xl">
                  <h4 className="text-xs font-extrabold uppercase text-slate-400 mb-3 flex items-center gap-1.5">
                    <BookOpen className="h-4 w-4 text-indigo-650" /> Nepal NOC checklist
                  </h4>
                  {app.nocChecklist ? (
                    <div className="space-y-2 text-xxs text-slate-655 dark:text-zinc-400">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center gap-1">
                          {app.nocChecklist.citizenship ? "✅" : "❌"} citizenship Scan
                        </div>
                        <div className="flex items-center gap-1">
                          {app.nocChecklist.offerLetter ? "✅" : "❌"} Uni Offer Letter
                        </div>
                        <div className="flex items-center gap-1">
                          {app.nocChecklist.academicTranscripts ? "✅" : "❌"} Transcripts
                        </div>
                        <div className="flex items-center gap-1">
                          {app.nocChecklist.paymentReceipt ? "✅" : "❌"} SWIFT Receipt
                        </div>
                      </div>
                      <div className="border-t border-slate-200/50 pt-2 flex justify-between">
                        <span>NOC filing status: <strong>{app.nocChecklist.nocStatus}</strong></span>
                        {app.nocChecklist.nocNumber && <span>No: {app.nocChecklist.nocNumber}</span>}
                      </div>
                    </div>
                  ) : (
                    <p className="text-xxs text-slate-400 font-semibold">NOC checklist not generated.</p>
                  )}
                </div>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
