"use client";

import { useEffect, useState } from "react";
import { 
  Users, 
  UserPlus, 
  Trash2, 
  Copy, 
  Check, 
  Lock, 
  Unlock, 
  Loader2, 
  Mail, 
  UserCheck 
} from "lucide-react";
import { Input, Label, Select, Button, Card } from "@/components/ui/FormElements";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [invites, setInvites] = useState<any[]>([]);
  const [universities, setUniversities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Invitation Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "COUNSELOR",
    universityId: "",
  });
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [generatedLink, setGeneratedLink] = useState("");
  const [inviting, setInviting] = useState(false);
  const [copied, setCopied] = useState(false);

  // Row states
  const [actionId, setActionId] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const usersRes = await fetch("/api/admin/users");
      const invitesRes = await fetch("/api/admin/invitations");
      
      if (usersRes.ok && invitesRes.ok) {
        const usersData = await usersRes.json();
        const invitesData = await invitesRes.json();
        
        setUsers(usersData.users || []);
        setUniversities(usersData.universities || []);
        // Admins can only see counselor or partner invites for simplicity, or we can filter it:
        const rawInvites = invitesData.invites || [];
        setInvites(rawInvites.filter((inv: any) => inv.role === "COUNSELOR" || inv.role === "PARTNER"));
      }
    } catch (err) {
      console.error("Failed to load user management data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");
    setGeneratedLink("");
    setInviting(true);

    try {
      const res = await fetch("/api/admin/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error || "Failed to create invitation.");
      } else {
        setFormSuccess(`Invitation created successfully for ${formData.name}.`);
        
        // Construct acceptance link
        const origin = window.location.origin;
        const link = `${origin}/signup/invite?token=${data.invite.token}`;
        setGeneratedLink(link);

        // Reset form except role
        setFormData({
          name: "",
          email: "",
          role: formData.role,
          universityId: "",
        });
        
        // Reload list
        loadData();
      }
    } catch (err) {
      setFormError("An unexpected error occurred. Please try again.");
    } finally {
      setInviting(false);
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
        await loadData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionId(null);
    }
  };

  const handleRevokeInvite = async (inviteId: string) => {
    setActionId(inviteId);
    try {
      const res = await fetch(`/api/admin/invitations?inviteId=${inviteId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        await loadData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionId(null);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mb-2" />
        <span>Loading User Directory...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold mb-2 text-white flex items-center gap-2">
          <Users className="h-6 w-6 text-indigo-600" /> Staff Directory & Invitations
        </h1>
        <p className="text-sm text-slate-400">
          Invite Counselor Guides or University Partners, copy secure registration links, and manage active system staff.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column: Create Invitation */}
        <div className="space-y-6">
          <Card className="border border-slate-800">
            <h2 className="text-base font-bold mb-4 text-white flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-indigo-600" /> Send Staff Invitation
            </h2>

            {formError && (
              <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/50 text-rose-600 dark:text-rose-400 text-xs font-semibold p-3 rounded-xl mb-4">
                {formError}
              </div>
            )}

            {formSuccess && (
              <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/50 text-emerald-600 dark:text-emerald-400 text-xs font-semibold p-3 rounded-xl mb-4">
                {formSuccess}
              </div>
            )}

            {generatedLink && (
              <div className="bg-indigo-950/30 border border-indigo-900/50 dark:border-indigo-900/50 p-4 rounded-xl mb-4 space-y-2">
                <p className="text-xs text-indigo-800 dark:text-indigo-300 font-bold leading-normal">
                  ⚠️ Copy this link and share it securely. It will be shown only once:
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={generatedLink}
                    className="w-full bg-slate-950 text-white border border-slate-800 text-xxs px-2.5 py-1.5 rounded-lg focus:outline-none"
                  />
                  <button
                    onClick={copyToClipboard}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white p-2 rounded-lg transition cursor-pointer"
                    title="Copy to clipboard"
                  >
                    {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={handleInviteSubmit} className="space-y-4">
              <div>
                <Label>Full Name</Label>
                <Input
                  type="text"
                  placeholder="Ram Bahadur"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <Label>Email Address</Label>
                <Input
                  type="email"
                  placeholder="ram@vidyarthiconnect.com"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div>
                <Label>Assigned Role</Label>
                <Select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value, universityId: "" })}
                >
                  <option value="COUNSELOR">Counselor Guide (COUNSELOR)</option>
                  <option value="PARTNER">University Partner (PARTNER)</option>
                </Select>
              </div>

              {formData.role === "PARTNER" && (
                <div>
                  <Label>Associated University</Label>
                  <Select
                    required
                    value={formData.universityId}
                    onChange={(e) => setFormData({ ...formData, universityId: e.target.value })}
                  >
                    <option value="">-- Select University --</option>
                    {universities.map((uni) => (
                      <option key={uni.id} value={uni.id}>{uni.name}</option>
                    ))}
                  </Select>
                </div>
              )}

              <Button
                type="submit"
                disabled={inviting}
                className="w-full flex items-center justify-center gap-2 mt-4"
              >
                {inviting ? "Creating link..." : "Create Invitation Link"}
              </Button>
            </form>
          </Card>
        </div>

        {/* Right column (Span 2): Users lists and Pending invites */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Active Users directory */}
          <Card className="border border-slate-800">
            <h2 className="text-base font-bold mb-4 text-white flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-indigo-600" /> Active Staff Directory
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase font-extrabold tracking-wider">
                    <th className="pb-3 pr-4">User</th>
                    <th className="pb-3 pr-4">Role</th>
                    <th className="pb-3 pr-4">Contact</th>
                    <th className="pb-3 pr-4">Status</th>
                    <th className="pb-3 pr-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-800/10">
                      <td className="py-3 pr-4 font-semibold text-white">
                        {u.name}
                        <div className="text-[10px] text-slate-400 font-normal">{u.email}</div>
                      </td>
                      <td className="py-3 pr-4">
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                          u.role === "ADMIN"
                            ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/20 border border-indigo-200"
                            : u.role === "COUNSELOR"
                            ? "bg-sky-50 text-sky-700 dark:bg-sky-950/20 border border-sky-200"
                            : u.role === "PARTNER"
                            ? "bg-emerald-950/40 text-emerald-400 border border-emerald-500/20 dark:bg-emerald-950/20 border border-emerald-200"
                            : "bg-slate-50 text-slate-700"
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-slate-400 font-mono">{u.phone || "N/A"}</td>
                      <td className="py-3 pr-4">
                        <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${
                          u.isBlocked 
                            ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300" 
                            : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                        }`}>
                          {u.isBlocked ? "BLOCKED" : "ACTIVE"}
                        </span>
                      </td>
                      <td className="py-3 pr-4">
                        {u.role !== "ADMIN" && u.role !== "SUPERADMIN" && (
                          <button
                            onClick={() => handleToggleBlock(u.id, u.isBlocked)}
                            disabled={actionId === u.id}
                            className={`font-semibold p-1.5 rounded-lg border transition flex items-center gap-1 cursor-pointer ${
                              u.isBlocked 
                                ? "bg-rose-950/40 text-rose-400 border border-rose-500/20 border-rose-200 hover:bg-rose-100" 
                                : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 dark:bg-zinc-800 dark:border-zinc-700 dark:text-slate-200"
                            }`}
                          >
                            {actionId === u.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : u.isBlocked ? (
                              <>
                                <Unlock className="h-3.5 w-3.5" /> Activate
                              </>
                            ) : (
                              <>
                                <Lock className="h-3.5 w-3.5" /> Block
                              </>
                            )}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Pending Invitations list */}
          <Card className="border border-slate-800">
            <h2 className="text-base font-bold mb-4 text-white flex items-center gap-2">
              <Mail className="h-5 w-5 text-indigo-600" /> Staff Invitations Ledger
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase font-extrabold tracking-wider">
                    <th className="pb-3 pr-4">Invitee</th>
                    <th className="pb-3 pr-4">Target Role</th>
                    <th className="pb-3 pr-4">Expiry Date</th>
                    <th className="pb-3 pr-4">Status</th>
                    <th className="pb-3 pr-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {invites.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-4 text-center text-slate-400 dark:text-zinc-500">No invitations issued yet.</td>
                    </tr>
                  ) : (
                    invites.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-800/10">
                        <td className="py-3 pr-4 font-semibold text-white">
                          {inv.name}
                          <div className="text-[10px] text-slate-400 font-normal">{inv.email}</div>
                        </td>
                        <td className="py-3 pr-4">
                          <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase">{inv.role}</span>
                        </td>
                        <td className="py-3 pr-4 text-slate-400 dark:text-zinc-400 font-mono">
                          {new Date(inv.expiresAt).toLocaleString()}
                        </td>
                        <td className="py-3 pr-4">
                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                            inv.status === "PENDING"
                              ? "bg-amber-950/40 text-amber-400 border border-amber-500/20 dark:bg-amber-900/20 border border-amber-200"
                              : inv.status === "ACCEPTED"
                              ? "bg-emerald-950/40 text-emerald-400 border border-emerald-500/20 dark:bg-emerald-950/20 border border-emerald-200"
                              : "bg-slate-50 text-slate-300 border border-slate-800"
                          }`}>
                            {inv.status}
                          </span>
                        </td>
                        <td className="py-3 pr-4">
                          {inv.status === "PENDING" && (
                            <button
                              onClick={() => handleRevokeInvite(inv.id)}
                              disabled={actionId === inv.id}
                              className="bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-900/40 text-rose-700 dark:text-rose-400 p-1.5 rounded-lg border border-rose-200 dark:border-rose-800 transition flex items-center gap-1 cursor-pointer"
                              title="Revoke invitation link"
                            >
                              {actionId === inv.id ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <>
                                  <Trash2 className="h-3.5 w-3.5" /> Revoke
                                </>
                              )}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
