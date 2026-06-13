"use client";

import { useEffect, useState } from "react";
import { 
  Building, 
  Users, 
  CheckCircle, 
  XCircle, 
  TrendingUp, 
  Award,
  Loader2,
  Clock
} from "lucide-react";

export default function PartnerDashboard() {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);

  const loadWorkspace = async () => {
    try {
      const res = await fetch("/api/partner/workspace");
      if (res.ok) {
        const d = await res.json();
        setData(d);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkspace();
  }, []);

  const handleDecision = async (appId: string, status: string) => {
    setActionId(appId);
    try {
      const res = await fetch("/api/admin/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "updateApplicationStatus",
          applicationId: appId,
          status,
        }),
      });

      if (res.ok) {
        await loadWorkspace();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionId(null);
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-slate-500">Loading university partner workspace...</div>;
  }

  const apps = data?.applications || [];
  const totalApps = apps.length;
  const acceptedApps = apps.filter((a: any) => a.status === "ACCEPTED" || a.status === "ENROLLED").length;
  const pendingApps = apps.filter((a: any) => a.status === "SUBMITTED" || a.status === "COUNSELOR_REVIEW").length;
  const conversionRate = totalApps > 0 ? Math.round((acceptedApps / totalApps) * 100) : 0;

  return (
    <div className="space-y-8">
      {/* University banner details */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-850 p-6 rounded-2xl shadow-sm flex items-center gap-4">
        <div className="bg-emerald-50 dark:bg-emerald-950/20 p-4 rounded-xl text-emerald-700">
          <Building className="h-10 w-10" />
        </div>
        <div>
          <span className="bg-emerald-50 text-emerald-700 text-xxs font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider">
            Official Partner Institution
          </span>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-zinc-100 mt-1">
            {data?.partner.university.name}
          </h1>
          <p className="text-xxs text-slate-400">
            World Ranking: #{data?.partner.university.rankingWorld} • Verified admissions panel
          </p>
        </div>
      </div>

      {/* Metrics widgets */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 rounded-2xl shadow-xs">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase">Total Applicants</span>
            <Users className="h-5 w-5 text-indigo-650" />
          </div>
          <div className="text-2xl font-extrabold">{totalApps}</div>
          <div className="text-xxs text-slate-400 mt-1">Filed via VidyarthiiConnect</div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 rounded-2xl shadow-xs">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase">Awaiting Offer</span>
            <Clock className="h-5 w-5 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-amber-600">{pendingApps}</div>
          <div className="text-xxs text-slate-400 mt-1">Requires admissions decision</div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 rounded-2xl shadow-xs">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase">Offers Issued</span>
            <CheckCircle className="h-5 w-5 text-emerald-500" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-600">{acceptedApps}</div>
          <div className="text-xxs text-slate-400 mt-1">Unconditional/Conditional offers</div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 rounded-2xl shadow-xs">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase">Conversion Rate</span>
            <TrendingUp className="h-5 w-5 text-indigo-650" />
          </div>
          <div className="text-2xl font-extrabold text-indigo-650">{conversionRate}%</div>
          <div className="text-xxs text-slate-400 mt-1">Acceptance percentage</div>
        </div>
      </div>

      {/* Applicant pipeline list */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 rounded-2xl shadow-sm">
        <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
          <Award className="h-5 w-5 text-indigo-655" /> Applicant Pipeline
        </h2>

        {apps.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-10 border border-dashed border-slate-200 dark:border-zinc-850 rounded-xl">
            No applicants have submitted requests to your institution yet.
          </p>
        ) : (
          <div className="space-y-6">
            {apps.map((app: any) => (
              <div key={app.id} className="border border-slate-100 dark:border-zinc-800 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="font-bold text-sm text-slate-800 dark:text-zinc-200">{app.student.user.name}</h3>
                  <p className="text-xxs text-slate-500">
                    Course Preference: <strong>{app.course.title}</strong> • Academic Level: <strong>{app.student.academicLevel}</strong> • GPA: <strong>{app.student.gpa}</strong> • English: <strong>{app.student.englishTestScore} ({app.student.englishTestType})</strong>
                  </p>
                  <div className="text-xxxxs text-slate-400 mt-1">
                    Intake Term: {app.intake} • Nationality: {app.student.user.nationality}
                  </div>
                </div>

                <div className="flex gap-2 items-center w-full sm:w-auto">
                  <span className={`text-xxs font-extrabold px-2 py-0.5 rounded-md uppercase border ${
                    app.status === "ACCEPTED" || app.status === "ENROLLED"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : app.status === "REJECTED"
                      ? "bg-rose-50 text-rose-700 border-rose-200"
                      : "bg-slate-50 text-slate-700 border-slate-200"
                  }`}>
                    {app.status.replace(/_/g, " ")}
                  </span>

                  {(app.status === "SUBMITTED" || app.status === "COUNSELOR_REVIEW") && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDecision(app.id, "ACCEPTED")}
                        disabled={actionId === app.id}
                        className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xxs font-semibold px-2.5 py-1 rounded-md border border-emerald-250 transition flex items-center gap-1"
                      >
                        {actionId === app.id && <Loader2 className="h-3 w-3 animate-spin" />}
                        Accept
                      </button>
                      <button
                        onClick={() => handleDecision(app.id, "REJECTED")}
                        disabled={actionId === app.id}
                        className="bg-rose-50 text-rose-700 hover:bg-rose-100 text-xxs font-semibold px-2.5 py-1 rounded-md border border-rose-250 transition flex items-center gap-1"
                      >
                        {actionId === app.id && <Loader2 className="h-3 w-3 animate-spin" />}
                        Decline
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
