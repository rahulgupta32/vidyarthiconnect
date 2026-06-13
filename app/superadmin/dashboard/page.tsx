"use client";

import { useEffect, useState } from "react";
import { 
  ShieldAlert, 
  Activity, 
  DollarSign, 
  Settings, 
  FileText, 
  AlertTriangle,
  Lock,
  Loader2,
  Sparkles
} from "lucide-react";

export default function SuperAdminDashboard() {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("audit");
  
  // Settings State (Mock Config)
  const [settings, setSettings] = useState({
    commissionRate: "10",
    aiSensitivity: "balanced",
    privacyRetentionDays: "365",
  });
  const [saveSuccess, setSaveSuccess] = useState(false);

  const loadWorkspace = async () => {
    try {
      const res = await fetch("/api/superadmin/workspace");
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

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  if (loading) {
    return <div className="text-center py-20 text-slate-500">Loading superadmin workspace...</div>;
  }

  // Calc total expected commission
  const totalExpected = data?.commissions.reduce((acc: number, curr: any) => acc + curr.expectedAmount, 0) || 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-2">SuperAdmin Control Board</h1>
        <p className="text-sm text-slate-500 dark:text-zinc-400">
          Monitor real-time system logs, review brute-force block triggers, manage commission rates, and update AI algorithms.
        </p>
      </div>

      {/* Metrics overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 rounded-2xl shadow-xs">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase font-bold">Audit Logs Recorded</span>
            <Activity className="h-5 w-5 text-indigo-650" />
          </div>
          <div className="text-2xl font-extrabold">{data?.auditLogs.length || 0}</div>
          <div className="text-xxs text-slate-400 mt-1">Platform user actions logs</div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 rounded-2xl shadow-xs">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase font-bold">Suspicious Alerts</span>
            <ShieldAlert className="h-5 w-5 text-rose-500" />
          </div>
          <div className="text-2xl font-extrabold text-rose-600">{data?.suspiciousLogs.length || 0}</div>
          <div className="text-xxs text-slate-400 mt-1">IP brute-force & location lockout warnings</div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 rounded-2xl shadow-xs">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase font-bold">Projected Commission</span>
            <DollarSign className="h-5 w-5 text-indigo-650" />
          </div>
          <div className="text-2xl font-extrabold text-indigo-655">NPR {totalExpected.toLocaleString()}</div>
          <div className="text-xxs text-slate-400 mt-1">University partner recruitment revenue</div>
        </div>
      </div>

      {/* Workspace Tabs Navigation */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-2 rounded-2xl shadow-xs flex flex-wrap gap-2">
        {[
          { id: "audit", label: "Security Audit Logs", icon: Activity },
          { id: "suspicious", label: "Suspicious Activity Logs", icon: ShieldAlert },
          { id: "commissions", label: "Commissions Ledger", icon: DollarSign },
          { id: "settings", label: "System & AI Settings", icon: Settings },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === tab.id 
                ? "bg-indigo-600 text-white shadow-xs" 
                : "text-slate-500 hover:bg-slate-50 dark:hover:bg-zinc-850 hover:text-slate-800"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Workspace Tab Contents */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 rounded-2xl shadow-sm">
        
        {/* TAB 1: SECURITY AUDIT LOGS */}
        {activeTab === "audit" && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold">Security Audit Trail</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-zinc-800 text-slate-400 uppercase font-extrabold tracking-wider">
                    <th className="pb-3 pr-4">User</th>
                    <th className="pb-3 pr-4">Action</th>
                    <th className="pb-3 pr-4">Details</th>
                    <th className="pb-3 pr-4">IP Address</th>
                    <th className="pb-3 pr-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-850">
                  {data?.auditLogs.map((log: any) => (
                    <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/10">
                      <td className="py-3 pr-4 font-semibold">{log.user?.name || "System"}</td>
                      <td className="py-3 pr-4 font-mono font-bold text-indigo-600">{log.action}</td>
                      <td className="py-3 pr-4 text-slate-600 dark:text-zinc-350">{log.details}</td>
                      <td className="py-3 pr-4 font-mono">{log.ip}</td>
                      <td className="py-3 pr-4 text-slate-400">{new Date(log.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: SUSPICIOUS ACTIVITY LOGS */}
        {activeTab === "suspicious" && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-rose-500">Threat Alerts</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-zinc-800 text-slate-400 uppercase font-extrabold tracking-wider">
                    <th className="pb-3 pr-4">User</th>
                    <th className="pb-3 pr-4">Alert Type</th>
                    <th className="pb-3 pr-4">Severity</th>
                    <th className="pb-3 pr-4">Threat Details</th>
                    <th className="pb-3 pr-4">IP</th>
                    <th className="pb-3 pr-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-850">
                  {data?.suspiciousLogs.map((log: any) => (
                    <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/10">
                      <td className="py-3 pr-4 font-semibold">{log.user?.name || "Unauthenticated"}</td>
                      <td className="py-3 pr-4 font-bold text-slate-800 dark:text-zinc-200">{log.type}</td>
                      <td className="py-3 pr-4">
                        <span className={`text-xxs font-extrabold px-2 py-0.5 rounded-md ${
                          log.severity === "HIGH" 
                            ? "bg-rose-50 text-rose-700 border border-rose-200" 
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}>
                          {log.severity}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-slate-600 dark:text-zinc-350 leading-relaxed max-w-xs">{log.details}</td>
                      <td className="py-3 pr-4 font-mono">{log.ip}</td>
                      <td className="py-3 pr-4 text-slate-400">{new Date(log.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: COMMISSION LEDGER */}
        {activeTab === "commissions" && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold">University Commission tracking</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-zinc-800 text-slate-400 uppercase font-extrabold tracking-wider">
                    <th className="pb-3 pr-4">Student</th>
                    <th className="pb-3 pr-4">University</th>
                    <th className="pb-3 pr-4">Tuition Amount</th>
                    <th className="pb-3 pr-4">Rate (%)</th>
                    <th className="pb-3 pr-4">Expected payout</th>
                    <th className="pb-3 pr-4">Commission Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-850">
                  {data?.commissions.map((comm: any) => (
                    <tr key={comm.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/10">
                      <td className="py-3 pr-4 font-semibold">{comm.application.student.user.name}</td>
                      <td className="py-3 pr-4 font-semibold">{comm.application.university.name}</td>
                      <td className="py-3 pr-4">${comm.tuitionAmount.toLocaleString()}/yr</td>
                      <td className="py-3 pr-4 font-mono font-semibold">{comm.commissionPercentage}%</td>
                      <td className="py-3 pr-4 font-bold text-indigo-650">${comm.expectedAmount.toLocaleString()}</td>
                      <td className="py-3 pr-4 uppercase font-extrabold text-xxs tracking-wider">
                        <span className={`px-2 py-0.5 rounded-md ${
                          comm.status === "RECEIVED" 
                            ? "bg-emerald-50 text-emerald-700" 
                            : "bg-amber-50 text-amber-700"
                        }`}>
                          {comm.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: SYSTEM & AI SETTINGS */}
        {activeTab === "settings" && (
          <div className="space-y-6 max-w-md">
            <h2 className="text-lg font-bold flex items-center gap-2 border-b border-slate-100 pb-3">
              <Settings className="h-5 w-5 text-indigo-650" /> System Settings
            </h2>

            {saveSuccess && (
              <div className="bg-emerald-55 border border-emerald-250 text-emerald-600 text-xxs font-bold p-3 rounded-xl text-center">
                System parameters updated successfully! (Mock Settings Saved)
              </div>
            )}

            <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-500 mb-1.5 block">Standard Commission Rate (%)</label>
                <input
                  type="number"
                  value={settings.commissionRate}
                  onChange={(e) => setSettings({ ...settings, commissionRate: e.target.value })}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-500 mb-1.5 block">AI Recommendation Matching Rigor</label>
                <select
                  value={settings.aiSensitivity}
                  onChange={(e) => setSettings({ ...settings, aiSensitivity: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 focus:outline-none"
                >
                  <option value="permissive">Permissive (Lenient Matches)</option>
                  <option value="balanced">Balanced (Standard Matching Profile)</option>
                  <option value="rigorous">Rigorous (Strict GPA & Budget Bounds)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-500 mb-1.5 block">GDPR User-Data Retention limit (Days)</label>
                <input
                  type="number"
                  value={settings.privacyRetentionDays}
                  onChange={(e) => setSettings({ ...settings, privacyRetentionDays: e.target.value })}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 focus:outline-none"
                />
              </div>

              <div className="bg-indigo-50/50 dark:bg-indigo-950/20 p-3.5 rounded-xl leading-normal text-slate-500 flex gap-2">
                <Sparkles className="h-5 w-5 text-amber-500 flex-shrink-0" />
                <span>
                  Updating AI models triggers re-evaluation for recommendations on next student logins.
                </span>
              </div>

              <button
                type="submit"
                className="bg-indigo-650 hover:bg-indigo-755 text-white font-bold py-2 px-6 rounded-xl transition shadow-xs"
              >
                Save Settings
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
