"use client";

import { useEffect, useState } from "react";
import { 
  Users, 
  UserPlus, 
  DollarSign, 
  Send, 
  Lock, 
  Unlock, 
  CheckCircle,
  Loader2,
  Settings
} from "lucide-react";

export default function AdminDashboard() {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);

  const loadWorkspace = async () => {
    try {
      const res = await fetch("/api/admin/workspace");
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

  const handleAssignCounselor = async (appId: string, counselorId: string) => {
    setActionId(appId);
    try {
      const res = await fetch("/api/admin/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "assignCounselor",
          applicationId: appId,
          counselorId: counselorId || null,
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

  const handleToggleBlock = async (userId: string, currentBlocked: boolean) => {
    setActionId(userId);
    try {
      const res = await fetch("/api/admin/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "toggleUserBlock",
          userId,
          isBlocked: !currentBlocked,
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
    return <div className="text-center py-20 text-slate-500">Loading admin CRM panel...</div>;
  }

  // Calc metrics
  const totalStudents = data?.students.length || 0;
  const totalCounselors = data?.counselors.length || 0;
  const totalApps = data?.applications.length || 0;
  const totalRevenue = data?.payments.reduce((acc: number, curr: any) => acc + curr.amount, 0) || 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-2">Admin CRM Panel</h1>
        <p className="text-sm text-slate-500 dark:text-zinc-400">
          Assign counselors, monitor workloads, review student applications, manage accounts, and view service packages.
        </p>
      </div>

      {/* Metrics Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 rounded-2xl shadow-xs">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase font-bold">Students Registered</span>
            <Users className="h-5 w-5 text-indigo-650" />
          </div>
          <div className="text-2xl font-extrabold">{totalStudents}</div>
          <div className="text-xxs text-slate-400 mt-1">Total Nepali candidates</div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 rounded-2xl shadow-xs">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase font-bold">Counselor Staff</span>
            <UserPlus className="h-5 w-5 text-emerald-500" />
          </div>
          <div className="text-2xl font-extrabold">{totalCounselors}</div>
          <div className="text-xxs text-slate-400 mt-1">Active advisory guides</div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 rounded-2xl shadow-xs">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase font-bold">Applications Submitted</span>
            <Send className="h-5 w-5 text-sky-500" />
          </div>
          <div className="text-2xl font-extrabold">{totalApps}</div>
          <div className="text-xxs text-slate-400 mt-1">Pending & Decided packages</div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 rounded-2xl shadow-xs">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase font-bold">Total Revenue</span>
            <DollarSign className="h-5 w-5 text-indigo-650" />
          </div>
          <div className="text-2xl font-extrabold text-indigo-650">NPR {totalRevenue.toLocaleString()}</div>
          <div className="text-xxs text-slate-400 mt-1">Verified payments received</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Columns (Span 2): Student CRM and Assignments */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Student CRM Directory */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 rounded-2xl shadow-sm">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-indigo-655" /> Student CRM Directory
            </h2>

            <div className="space-y-4">
              {data?.students.map((student: any) => (
                <div key={student.id} className="border border-slate-100 dark:border-zinc-800 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h3 className="font-bold text-sm text-slate-800 dark:text-zinc-200">
                      {student.user.name}
                    </h3>
                    <p className="text-xxs text-slate-600 dark:text-zinc-400">
                      Email: <strong className="text-slate-900 dark:text-white">{student.user.email}</strong> • GPA: <strong className="text-slate-900 dark:text-white">{student.gpa || "N/A"}</strong> • Preferred: <strong className="text-slate-900 dark:text-white">{student.preferredCountry || "N/A"}</strong>
                    </p>
                  </div>

                  <button
                    onClick={() => handleToggleBlock(student.user.id, student.user.isBlocked)}
                    disabled={actionId === student.user.id}
                    className={`text-xxs font-bold px-3 py-1.5 rounded-lg border transition flex items-center gap-1 cursor-pointer ${
                      student.user.isBlocked 
                        ? "bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-450 border-rose-250 dark:border-rose-800 hover:bg-rose-100 dark:hover:bg-rose-900/40" 
                        : "bg-slate-50 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-700"
                    }`}
                  >
                    {actionId === student.user.id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : student.user.isBlocked ? (
                      <>
                        <Unlock className="h-3 w-3" /> Activate
                      </>
                    ) : (
                      <>
                        <Lock className="h-3 w-3" /> Deactivate
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Counselor Assignments Panel */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 rounded-2xl shadow-sm">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-indigo-655" /> Counselor Assignments
            </h2>

            <div className="space-y-4">
              {data?.applications.map((app: any) => (
                <div key={app.id} className="border border-slate-100 dark:border-zinc-800 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h3 className="font-bold text-sm text-slate-800 dark:text-zinc-200">
                      {app.student.user.name}
                    </h3>
                    <p className="text-xxs text-slate-605 dark:text-zinc-400 leading-normal">
                      University: <strong className="text-slate-900 dark:text-white">{app.university.name}</strong> • Course: <strong className="text-slate-900 dark:text-white">{app.course.title}</strong>
                    </p>
                    <span className="text-xxxxs font-bold text-slate-500 dark:text-zinc-450 block mt-1 uppercase">
                      Current Counselor: {app.counselor ? app.counselor.user.name : "None Assigned"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={app.counselorId || ""}
                      disabled={actionId === app.id}
                      onChange={(e) => handleAssignCounselor(app.id, e.target.value)}
                      className="bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-900 dark:text-zinc-100 rounded-lg py-1 px-2.5 text-xxs focus:outline-none cursor-pointer"
                    >
                      <option value="" className="bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100">Select Counselor</option>
                      {data?.counselors.map((c: any) => (
                        <option key={c.id} value={c.id} className="bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100">
                          {c.user.name}
                        </option>
                      ))}
                    </select>
                    {actionId === app.id && <Loader2 className="h-4 w-4 animate-spin text-slate-450" />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Counselor Staff Workloads + Payments overview */}
        <div className="space-y-8">
          
          {/* Counselors Workload Summary */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 rounded-2xl shadow-sm">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-indigo-650" /> Counselor Staff Workloads
            </h2>

            <div className="space-y-4">
              {data?.counselors.map((c: any) => {
                const ratio = Math.min((c.activeStudentsCount / c.workloadLimit) * 100, 100);
                return (
                  <div key={c.id} className="space-y-1 text-xs">
                    <div className="flex justify-between font-semibold">
                      <span>{c.user.name}</span>
                      <span>
                        {c.activeStudentsCount} / {c.workloadLimit} Limit
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-zinc-850 h-2 rounded-full overflow-hidden">
                      <div 
                        className={`h-2 rounded-full ${ratio > 80 ? "bg-rose-500" : ratio > 50 ? "bg-amber-500" : "bg-emerald-500"}`}
                        style={{ width: `${ratio}%` }} 
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Service Payments Log */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 rounded-2xl shadow-sm">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-indigo-650" /> verified Payments
            </h2>

            {data?.payments.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">No payments logged.</p>
            ) : (
              <div className="space-y-3">
                {data?.payments.map((p: any) => (
                  <div key={p.id} className="border-b border-slate-50 dark:border-zinc-850 pb-3 last:border-b-0 last:pb-0 flex justify-between items-center text-xs">
                    <div>
                      <h4 className="font-bold">{p.student.user.name}</h4>
                      <p className="text-xxxxs text-slate-450">{p.package.name} • via {p.method}</p>
                    </div>
                    <span className="font-extrabold text-emerald-600">
                      NPR {p.amount.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
