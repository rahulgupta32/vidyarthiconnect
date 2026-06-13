"use client";

import { useEffect, useState } from "react";
import { 
  Users, 
  FileText, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Plus, 
  Clock, 
  Calendar,
  Send,
  Loader2,
  Bookmark
} from "lucide-react";

export default function CounselorWorkspace() {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  
  // Review Dialog State
  const [reviewDoc, setReviewDoc] = useState<any | null>(null);
  const [reviewStatus, setReviewStatus] = useState("APPROVED");
  const [comment, setComment] = useState("");

  // Task Form State
  const [taskForm, setTaskForm] = useState({
    studentId: "",
    title: "",
    description: "",
    dueDate: "",
  });
  const [taskSuccess, setTaskSuccess] = useState(false);

  const loadWorkspace = async () => {
    try {
      const res = await fetch("/api/counselor/workspace");
      if (res.ok) {
        const d = await res.json();
        setData(d);
        if (d.applications.length > 0 && !taskForm.studentId) {
          setTaskForm((prev) => ({ ...prev, studentId: d.applications[0].studentId }));
        }
      }
    } catch (err) {
      console.error("Load counselor workspace error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkspace();
  }, []);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewDoc) return;
    
    setActionLoadingId(reviewDoc.id);
    try {
      const res = await fetch("/api/admin/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reviewDocument",
          documentId: reviewDoc.id,
          status: reviewStatus,
          comment: comment.trim() || undefined,
        }),
      });

      if (res.ok) {
        setReviewDoc(null);
        setComment("");
        await loadWorkspace();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskForm.studentId || !taskForm.title) return;

    try {
      const res = await fetch("/api/admin/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "createTask",
          ...taskForm,
        }),
      });

      if (res.ok) {
        setTaskForm({
          studentId: data?.applications[0]?.studentId || "",
          title: "",
          description: "",
          dueDate: "",
        });
        setTaskSuccess(true);
        setTimeout(() => setTaskSuccess(false), 3000);
        await loadWorkspace();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusUpdate = async (appId: string, newStatus: string) => {
    setActionLoadingId(appId);
    try {
      const res = await fetch("/api/admin/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "updateApplicationStatus",
          applicationId: appId,
          status: newStatus,
        }),
      });

      if (res.ok) {
        await loadWorkspace();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoadingId(null);
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-slate-500">Loading counselor workspace details...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-2">Counselor Workspace</h1>
        <p className="text-sm text-slate-500 dark:text-zinc-400">
          Verify uploaded academic folders, check applications, update milestones, and create checklists for students.
        </p>
      </div>

      {/* Workload Limit overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 rounded-2xl shadow-xs">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase">Assigned Students</span>
            <Users className="h-5 w-5 text-indigo-650" />
          </div>
          <div className="text-2xl font-extrabold">{data?.applications.length || 0}</div>
          <div className="text-xxs text-slate-400 mt-1">Workload limit: {data?.counselor.workloadLimit} students</div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 rounded-2xl shadow-xs">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase">Pending Review</span>
            <FileText className="h-5 w-5 text-amber-500" />
          </div>
          <div className="text-2xl font-extrabold text-amber-600">{data?.pendingDocuments.length || 0}</div>
          <div className="text-xxs text-slate-400 mt-1">Requires immediate file verification</div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 rounded-2xl shadow-xs">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase">Active Tasks</span>
            <Clock className="h-5 w-5 text-indigo-650" />
          </div>
          <div className="text-2xl font-extrabold">{data?.tasks.filter((t: any) => !t.isCompleted).length || 0}</div>
          <div className="text-xxs text-slate-400 mt-1">Assigned checklist items</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (Span 2): Document Reviews + Student CRM */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Document Verification Queue */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 rounded-2xl shadow-sm">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-indigo-655" /> File Verification Queue
            </h2>

            {data?.pendingDocuments.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">
                All student documents are verified. No pending reviews in your queue.
              </p>
            ) : (
              <div className="space-y-4">
                {data?.pendingDocuments.map((doc: any) => (
                  <div key={doc.id} className="border border-slate-100 dark:border-zinc-800 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-slate-50 dark:hover:bg-zinc-800/30 transition">
                    <div>
                      <span className="bg-amber-50 text-amber-700 text-xxxxs font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider">
                        Pending
                      </span>
                      <h3 className="font-bold text-sm text-slate-800 dark:text-zinc-200 mt-1">{doc.fileType}</h3>
                      <p className="text-xxs text-slate-500">
                        Student: <strong>{doc.student.user.name}</strong> • File: <a href={doc.storageUrl} target="_blank" className="text-indigo-600 hover:underline">{doc.fileName}</a>
                      </p>
                    </div>

                    <div className="flex gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => {
                          setReviewDoc(doc);
                          setReviewStatus("APPROVED");
                        }}
                        className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xxs font-semibold px-3 py-1.5 rounded-lg border border-emerald-250 transition"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => {
                          setReviewDoc(doc);
                          setReviewStatus("NEEDS_REVISION");
                        }}
                        className="bg-amber-50 text-amber-700 hover:bg-amber-100 text-xxs font-semibold px-3 py-1.5 rounded-lg border border-amber-250 transition"
                      >
                        Needs Revision
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Student CRM applications list */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 rounded-2xl shadow-sm">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Users className="h-5 w-5 text-indigo-655" /> Student CRM Pipeline
            </h2>

            {data?.applications.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">
                No students assigned to you yet. Ask Admin to assign student profiles.
              </p>
            ) : (
              <div className="space-y-6">
                {data?.applications.map((app: any) => (
                  <div key={app.id} className="border border-slate-100 dark:border-zinc-800 p-4 rounded-xl space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                      <div>
                        <h3 className="font-bold text-sm text-slate-800 dark:text-zinc-200">
                          {app.student.user.name}
                        </h3>
                        <p className="text-xxs text-slate-500">
                          Applied: {app.course.title} ({app.university.name}) • Intake: {app.intake}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <select
                          value={app.status}
                          disabled={actionLoadingId === app.id}
                          onChange={(e) => handleStatusUpdate(app.id, e.target.value)}
                          className="bg-slate-50 border border-slate-200 rounded-lg py-1 px-2.5 text-xxs focus:outline-none focus:border-indigo-600 font-bold"
                        >
                          <option value="DRAFTING">Drafting</option>
                          <option value="COUNSELOR_REVIEW">Counselor Review</option>
                          <option value="SUBMITTED">Submitted</option>
                          <option value="ACCEPTED">Accepted</option>
                          <option value="REJECTED">Rejected</option>
                          <option value="VISA_PREPARATION">Visa Preparation</option>
                          <option value="VISA_SUBMITTED">Visa Submitted</option>
                          <option value="VISA_APPROVED">Visa Approved</option>
                          <option value="VISA_REJECTED">Visa Rejected</option>
                          <option value="ENROLLED">Enrolled</option>
                        </select>
                        {actionLoadingId === app.id && <Loader2 className="h-4 w-4 animate-spin text-slate-400" />}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Task Creator + Task List */}
        <div className="space-y-8">
          
          {/* Create checklist task */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 rounded-2xl shadow-sm">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Plus className="h-5 w-5 text-indigo-650" /> Assign Checklist Task
            </h2>

            {taskSuccess && (
              <div className="bg-emerald-50 border border-emerald-250 text-emerald-600 text-xxs rounded-xl p-2.5 text-center mb-4 font-semibold">
                Task created and assigned successfully!
              </div>
            )}

            <form onSubmit={handleTaskSubmit} className="space-y-4">
              <div>
                <label className="font-semibold text-xs text-slate-500 mb-1.5 block">Assign To Student</label>
                <select
                  name="studentId"
                  value={taskForm.studentId}
                  onChange={(e) => setTaskForm({ ...taskForm, studentId: e.target.value })}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-none"
                >
                  {data?.applications.map((app: any) => (
                    <option key={app.id} value={app.studentId}>
                      {app.student.user.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-xs text-slate-500 mb-1.5 block">Task Title</label>
                <input
                  type="text"
                  placeholder="e.g. Re-upload transcripts"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="font-semibold text-xs text-slate-500 mb-1.5 block">Description</label>
                <textarea
                  placeholder="Details of what to submit..."
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-1.5 px-3 text-xs focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="font-semibold text-xs text-slate-500 mb-1.5 block">Due Date</label>
                <input
                  type="date"
                  value={taskForm.dueDate}
                  onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-none text-slate-500"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-xl text-xs transition"
              >
                Assign Task
              </button>
            </form>
          </div>

          {/* Assigned checklist tasks list */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 p-6 rounded-2xl shadow-sm">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Bookmark className="h-5 w-5 text-indigo-650" /> Assigned Checklist Items
            </h2>

            {data?.tasks.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">No tasks assigned yet.</p>
            ) : (
              <div className="space-y-3">
                {data?.tasks.map((task: any) => (
                  <div key={task.id} className="border border-slate-50 dark:border-zinc-850 pb-3 last:border-b-0 last:pb-0 flex items-start gap-2.5 text-xs">
                    <Clock className={`h-4 w-4 mt-0.5 flex-shrink-0 ${task.isCompleted ? "text-emerald-500" : "text-amber-500"}`} />
                    <div>
                      <h4 className="font-bold text-slate-800 dark:text-zinc-200">{task.title}</h4>
                      {task.description && <p className="text-xxs text-slate-400 mt-0.5">{task.description}</p>}
                      {task.dueDate && (
                        <span className="text-xxxxs text-slate-400 font-semibold flex items-center gap-0.5 mt-1">
                          <Calendar className="h-3 w-3" /> Due: {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Review Dialog Popup */}
      {reviewDoc && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleReviewSubmit} className="bg-white dark:bg-zinc-900 border border-slate-250 dark:border-zinc-850 rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <FileText className="h-5 w-5 text-indigo-650" /> File Review Verdict
            </h2>
            <p className="text-xs text-slate-550">
              Verifying document type <strong>{reviewDoc.fileType}</strong> for student <strong>{reviewDoc.student.user.name}</strong>.
            </p>

            <div>
              <label className="font-semibold text-xs text-slate-500 mb-1.5 block">Verdict Status</label>
              <select
                value={reviewStatus}
                onChange={(e) => setReviewStatus(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-xs focus:outline-none"
              >
                <option value="APPROVED">APPROVED (Verified Good)</option>
                <option value="REJECTED">REJECTED (Incorrect/Fraud)</option>
                <option value="NEEDS_REVISION">NEEDS REVISION (Blurry/Expiry)</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-xs text-slate-500 mb-1.5 block">Review Comment / Instructions</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                placeholder="Specify instructions or reasons..."
                required={reviewStatus !== "APPROVED"}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-indigo-600"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setReviewDoc(null)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-750 font-semibold px-4 py-2 rounded-xl text-xs border border-slate-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={actionLoadingId === reviewDoc.id}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2 rounded-xl text-xs transition"
              >
                {actionLoadingId === reviewDoc.id ? "Submitting..." : "Submit Verdict"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
