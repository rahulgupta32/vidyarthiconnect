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
    <div className="space-y-6">
      <section className="mb-6">
        <h1 className="text-2xl font-bold text-white">SuperAdmin Control Board</h1>
        <p className="mt-2 text-sm text-slate-400">
          Monitor real-time system logs, review brute-force block triggers, manage commission rates, and update AI algorithms.
        </p>
      </section>

      {/* Metrics overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl shadow-xl">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase">Audit Logs Recorded</span>
            <Activity className="h-5 w-5 text-indigo-400" />
          </div>
          <div className="text-2xl font-extrabold text-white">{data?.auditLogs.length || 0}</div>
          <div className="text-xxs text-slate-400 mt-1">Platform user actions logs</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl shadow-xl">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase">Suspicious Alerts</span>
            <ShieldAlert className="h-5 w-5 text-rose-500" />
          </div>
          <div className="text-2xl font-extrabold text-rose-400">{data?.suspiciousLogs.length || 0}</div>
          <div className="text-xxs text-slate-400 mt-1">IP brute-force & location lockout warnings</div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl shadow-xl">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase">Projected Commission</span>
            <DollarSign className="h-5 w-5 text-indigo-400" />
          </div>
          <div className="text-2xl font-extrabold text-indigo-400 font-extrabold">NPR {totalExpected.toLocaleString()}</div>
          <div className="text-xxs text-slate-400 mt-1">University partner recruitment revenue</div>
        </div>
      </div>

      {/* Workspace Workspace Tabs Navigation */}
      <div className="bg-slate-900/80 border border-slate-800 p-2 rounded-2xl shadow-xl flex flex-wrap gap-2">
        {[
          { id: "audit", label: "Security Audit Logs", icon: Activity },
          { id: "suspicious", label: "Suspicious Activity Logs", icon: ShieldAlert },
          { id: "commissions", label: "Commissions Ledger", icon: DollarSign },
          { id: "ai-monitor", label: "AI Monitoring & Audit", icon: Sparkles },
          { id: "settings", label: "System & AI Settings", icon: Settings },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
              activeTab === tab.id 
                ? "bg-indigo-600 text-white shadow-md" 
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Workspace Tab Contents */}
      <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl shadow-xl">
        
        {/* TAB 1: SECURITY AUDIT LOGS */}
        {activeTab === "audit" && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold">Security Audit Trail</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase font-extrabold tracking-wider">
                    <th className="pb-3 pr-4">User</th>
                    <th className="pb-3 pr-4">Action</th>
                    <th className="pb-3 pr-4">Details</th>
                    <th className="pb-3 pr-4">IP Address</th>
                    <th className="pb-3 pr-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {data?.auditLogs.map((log: any) => (
                    <tr key={log.id} className="hover:bg-slate-800/10">
                      <td className="py-3 pr-4 font-semibold">{log.user?.name || "System"}</td>
                      <td className="py-3 pr-4 font-mono font-bold text-indigo-600">{log.action}</td>
                      <td className="py-3 pr-4 text-slate-600 dark:text-zinc-300">{log.details}</td>
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
                  <tr className="border-b border-slate-800 text-slate-400 uppercase font-extrabold tracking-wider">
                    <th className="pb-3 pr-4">User</th>
                    <th className="pb-3 pr-4">Alert Type</th>
                    <th className="pb-3 pr-4">Severity</th>
                    <th className="pb-3 pr-4">Threat Details</th>
                    <th className="pb-3 pr-4">IP</th>
                    <th className="pb-3 pr-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {data?.suspiciousLogs.map((log: any) => (
                    <tr key={log.id} className="hover:bg-slate-800/10">
                      <td className="py-3 pr-4 font-semibold">{log.user?.name || "Unauthenticated"}</td>
                      <td className="py-3 pr-4 font-bold text-white">{log.type}</td>
                      <td className="py-3 pr-4">
                        <span className={`text-xxs font-extrabold px-2 py-0.5 rounded-md ${
                          log.severity === "HIGH" 
                            ? "bg-rose-950/40 text-rose-400 border border-rose-500/20" 
                            : "bg-amber-950/40 text-amber-400 border border-amber-500/20 border border-amber-200"
                        }`}>
                          {log.severity}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-slate-600 dark:text-zinc-300 leading-relaxed max-w-xs">{log.details}</td>
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
                  <tr className="border-b border-slate-800 text-slate-400 uppercase font-extrabold tracking-wider">
                    <th className="pb-3 pr-4">Student</th>
                    <th className="pb-3 pr-4">University</th>
                    <th className="pb-3 pr-4">Tuition Amount</th>
                    <th className="pb-3 pr-4">Rate (%)</th>
                    <th className="pb-3 pr-4">Expected payout</th>
                    <th className="pb-3 pr-4">Commission Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {data?.commissions.map((comm: any) => (
                    <tr key={comm.id} className="hover:bg-slate-800/10">
                      <td className="py-3 pr-4 font-semibold">{comm.application.student.user.name}</td>
                      <td className="py-3 pr-4 font-semibold">{comm.application.university.name}</td>
                      <td className="py-3 pr-4">${comm.tuitionAmount.toLocaleString()}/yr</td>
                      <td className="py-3 pr-4 font-mono font-semibold">{comm.commissionPercentage}%</td>
                      <td className="py-3 pr-4 font-bold text-indigo-600">${comm.expectedAmount.toLocaleString()}</td>
                      <td className="py-3 pr-4 uppercase font-extrabold text-xxs tracking-wider">
                        <span className={`px-2 py-0.5 rounded-md ${
                          comm.status === "RECEIVED" 
                            ? "bg-emerald-950/40 text-emerald-400 border border-emerald-500/20" 
                            : "bg-amber-950/40 text-amber-400 border border-amber-500/20"
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

        {/* TAB: AI MONITORING & AUDITING */}
        {activeTab === "ai-monitor" && (
          <div className="space-y-8">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-600 animate-pulse" /> AI Operations & Monitoring
            </h2>

            {/* AI Status Grid */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">OpenAI Key</span>
                <span className={`inline-block mt-2 text-xxs font-extrabold px-2 py-0.5 rounded-full ${
                  data?.aiStats?.aiConfigured 
                    ? "bg-emerald-950/40 text-emerald-400 border border-emerald-500/20" 
                    : "bg-rose-950/40 text-rose-400 border border-rose-500/20"
                }`}>
                  {data?.aiStats?.aiConfigured ? "CONFIGURED" : "MISSING"}
                </span>
              </div>

              <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">AI Engine Mode</span>
                <span className={`inline-block mt-2 text-xxs font-extrabold px-2 py-0.5 rounded-full ${
                  data?.aiStats?.aiEnabled 
                    ? "bg-emerald-950/40 text-emerald-400 border border-emerald-500/20" 
                    : "bg-amber-950/40 text-amber-400 border border-amber-500/20"
                }`}>
                  {data?.aiStats?.aiEnabled ? "ACTIVE (OPENAI)" : "MOCK FALLBACK"}
                </span>
              </div>

              <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Today's Tokens</span>
                <span className="text-sm font-black block mt-2 text-white">
                  {data?.aiStats?.dailyTokenUsage?.toLocaleString() || 0}
                </span>
              </div>

              <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Monthly Tokens</span>
                <span className="text-sm font-black block mt-2 text-white">
                  {data?.aiStats?.monthlyTokenUsage?.toLocaleString() || 0}
                </span>
              </div>

              <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
                <span className="text-[10px] font-bold text-slate-400 block uppercase font-bold">Handoff Alerts</span>
                <span className="text-sm font-black block mt-2 text-rose-400">
                  {data?.aiStats?.counselorHandoffCount || 0}
                </span>
              </div>
            </div>

            {/* Feature Usage Overview */}
            <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 font-bold">Top AI Features Used</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase font-extrabold tracking-wider">
                      <th className="pb-2 pr-4">Feature Name</th>
                      <th className="pb-2 pr-4">Request Calls</th>
                      <th className="pb-2 pr-4">Total Tokens Consumed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {!data?.aiStats?.topFeatures || data.aiStats.topFeatures.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="py-4 text-center text-slate-400">No feature usage recorded.</td>
                      </tr>
                    ) : (
                      data.aiStats.topFeatures.map((f: any, i: number) => (
                        <tr key={i} className="border-b border-slate-800/40">
                          <td className="py-3 pr-4 font-bold text-slate-300">{f.feature}</td>
                          <td className="py-3 pr-4 font-semibold text-indigo-600">{f.count} calls</td>
                          <td className="py-3 pr-4 text-slate-500">{f.tokens.toLocaleString()} tokens</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* AI Usage Logs */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 font-bold">AI Usage & Cost Audits</h3>
              <div className="overflow-x-auto max-h-96">
                <table className="w-full text-[11px] text-left border-collapse">
                  <thead className="sticky top-0 bg-slate-950 z-10">
                    <tr className="border-b border-slate-800 text-slate-400 uppercase font-extrabold tracking-wider">
                      <th className="pb-2 pr-2">User</th>
                      <th className="pb-2 pr-2">Feature</th>
                      <th className="pb-2 pr-2">Model</th>
                      <th className="pb-2 pr-2">Tokens (P+C)</th>
                      <th className="pb-2 pr-2">Cost (Est)</th>
                      <th className="pb-2 pr-2">Status</th>
                      <th className="pb-2 pr-2">Latency</th>
                      <th className="pb-2 pr-2">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {!data?.aiUsageLogs || data.aiUsageLogs.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-4 text-center text-slate-400">No logs found.</td>
                      </tr>
                    ) : (
                      data.aiUsageLogs.map((log: any) => (
                        <tr key={log.id} className="hover:bg-slate-800/10">
                          <td className="py-2.5 pr-2 font-semibold truncate max-w-[120px]">{log.user?.name || "System"}</td>
                          <td className="py-2.5 pr-2 font-bold text-indigo-600">{log.feature}</td>
                          <td className="py-2.5 pr-2 font-mono text-slate-500">{log.model}</td>
                          <td className="py-2.5 pr-2">{log.promptTokens} + {log.completionTokens} ({log.totalTokens})</td>
                          <td className="py-2.5 pr-2 font-mono font-semibold">${log.estimatedCost.toFixed(5)}</td>
                          <td className="py-2.5 pr-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              log.requestStatus === "SUCCESS" 
                                ? "bg-emerald-950/40 text-emerald-400 border border-emerald-500/20" 
                                : "bg-rose-950/40 text-rose-400 border border-rose-500/20"
                            }`}>
                              {log.requestStatus}
                            </span>
                          </td>
                          <td className="py-2.5 pr-2 font-mono">{log.latencyMs}ms</td>
                          <td className="py-2.5 pr-2 text-slate-400">{new Date(log.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* AI Error Logs (Only Failures) */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-rose-500 font-bold">AI Failure & Error Logs</h3>
              <div className="overflow-x-auto max-h-60">
                <table className="w-full text-[11px] text-left border-collapse">
                  <thead className="sticky top-0 bg-slate-950 z-10">
                    <tr className="border-b border-slate-800 text-rose-400 uppercase font-extrabold tracking-wider">
                      <th className="pb-2 pr-2">User</th>
                      <th className="pb-2 pr-2">Feature</th>
                      <th className="pb-2 pr-2">Error Message</th>
                      <th className="pb-2 pr-2">Latency</th>
                      <th className="pb-2 pr-2">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {!data?.aiErrorLogs || data.aiErrorLogs.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-4 text-center text-slate-400">No failure logs. AI is operating smoothly!</td>
                      </tr>
                    ) : (
                      data.aiErrorLogs.map((log: any) => (
                        <tr key={log.id} className="hover:bg-slate-800/10 text-rose-800 dark:text-rose-400">
                          <td className="py-2.5 pr-2 font-semibold truncate max-w-[120px]">{log.user?.name || "System"}</td>
                          <td className="py-2.5 pr-2 font-bold">{log.feature}</td>
                          <td className="py-2.5 pr-2 truncate max-w-xs" title={log.errorMessage}>{log.errorMessage || "Unknown error"}</td>
                          <td className="py-2.5 pr-2 font-mono">{log.latencyMs}ms</td>
                          <td className="py-2.5 pr-2 text-slate-400">{new Date(log.createdAt).toLocaleString()}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: SYSTEM & AI SETTINGS */}
        {activeTab === "settings" && (
          <div className="space-y-6 max-w-md">
            <h2 className="text-lg font-bold flex items-center gap-2 border-b border-slate-800 pb-3 text-white">
              <Settings className="h-5 w-5 text-indigo-600" /> System Settings
            </h2>

            {saveSuccess && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-600 text-xxs font-bold p-3 rounded-xl text-center">
                System parameters updated successfully! (Mock Settings Saved)
              </div>
            )}

            <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-200 mb-1.5 block">Standard Commission Rate (%)</label>
                <input
                  type="number"
                  value={settings.commissionRate}
                  onChange={(e) => setSettings({ ...settings, commissionRate: e.target.value })}
                  required
                  className="w-full bg-white dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-200 mb-1.5 block">AI Recommendation Matching Rigor</label>
                <select
                  value={settings.aiSensitivity}
                  onChange={(e) => setSettings({ ...settings, aiSensitivity: e.target.value })}
                  className="w-full bg-white dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  <option value="permissive">Permissive (Lenient Matches)</option>
                  <option value="balanced">Balanced (Standard Matching Profile)</option>
                  <option value="rigorous">Rigorous (Strict GPA & Budget Bounds)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-200 mb-1.5 block">GDPR User-Data Retention limit (Days)</label>
                <input
                  type="number"
                  value={settings.privacyRetentionDays}
                  onChange={(e) => setSettings({ ...settings, privacyRetentionDays: e.target.value })}
                  required
                  className="w-full bg-white dark:bg-slate-950 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="bg-indigo-50/50 dark:bg-indigo-950/20 p-3.5 rounded-xl leading-normal text-slate-400 flex gap-2">
                <Sparkles className="h-5 w-5 text-amber-500 flex-shrink-0" />
                <span>
                  Updating AI models triggers re-evaluation for recommendations on next student logins.
                </span>
              </div>

              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-6 rounded-xl transition shadow-xs cursor-pointer focus:outline-none focus:ring-4 focus:ring-indigo-500/40"
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
