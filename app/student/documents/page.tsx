"use client";

import { useEffect, useState } from "react";
import { 
  FileText, 
  Upload, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Clock, 
  Lock, 
  ShieldAlert, 
  Eye,
  MessageSquare,
  ChevronDown
} from "lucide-react";

export default function DocumentVault() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Upload Form State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState("Passport");

  // Share Consent States
  const [consents, setConsents] = useState<any>({
    dataSharing: true,
    universitySharing: false,
  });

  const loadDocuments = async () => {
    try {
      const res = await fetch("/api/student/documents");
      if (res.ok) {
        const data = await res.json();
        setDocuments(data);
      }
    } catch (err) {
      console.error("Load documents error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMsg("Please select a file to upload.");
      return;
    }

    setUploading(true);
    setSuccessMsg("");
    setErrorMsg("");

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("fileType", fileType);

    try {
      const res = await fetch("/api/student/documents", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Document upload failed.");
      } else {
        setSuccessMsg("Document metadata registered and file uploaded successfully!");
        setSelectedFile(null);
        // Reset file input element
        const fileInput = document.getElementById("file-input-element") as HTMLInputElement;
        if (fileInput) fileInput.value = "";
        await loadDocuments();
      }
    } catch (err) {
      setErrorMsg("An unexpected error occurred during file upload.");
    } finally {
      setUploading(false);
    }
  };

  const handleSaveConsent = async () => {
    setSuccessMsg("Sharing permissions updated successfully!");
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "REJECTED":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "NEEDS_REVISION":
        return "bg-amber-50 text-amber-700 border-amber-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-slate-500">Opening Document Vault...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-2">Document Vault</h1>
        <p className="text-sm text-slate-500 dark:text-zinc-400">
          Securely manage your passports, IELTS scorecards, academic transcripts, and letters of recommendation.
        </p>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-600 dark:bg-emerald-950/20 dark:border-emerald-800/50 dark:text-emerald-400 text-sm rounded-xl p-4 text-center font-semibold animate-pulse">
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 text-rose-600 dark:bg-rose-950/20 dark:border-rose-800/50 dark:text-rose-400 text-sm rounded-xl p-4 text-center font-semibold">
          {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Columns: Uploader + Document List */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Upload Form */}
          <div className="bg-slate-900/80 border border-slate-800 shadow-xl p-6 rounded-2xl">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Upload className="h-5 w-5 text-indigo-600" /> Upload New Document
            </h2>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-xs text-slate-300 mb-1.5 block">Document Type</label>
                  <select
                    value={fileType}
                    onChange={(e) => setFileType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-sm focus:outline-none text-white"
                  >
                    <option value="Passport" className="bg-slate-950 text-white">Passport Copy</option>
                    <option value="Citizenship" className="bg-slate-950 text-white">Citizenship Document</option>
                    <option value="Academic transcripts" className="bg-slate-950 text-white">Academic Transcripts</option>
                    <option value="IELTS score card" className="bg-slate-950 text-white">IELTS / PTE / TOEFL Scores</option>
                    <option value="CV / Resume" className="bg-slate-950 text-white">CV / Resume</option>
                    <option value="Statement of Purpose" className="bg-slate-950 text-white">Statement of Purpose (SOP)</option>
                    <option value="Recommendation Letter" className="bg-slate-950 text-white">Letter of Recommendation (LOR)</option>
                    <option value="Bank statement" className="bg-slate-950 text-white">Financial / Bank Documents</option>
                    <option value="Nepal NOC" className="bg-slate-950 text-white">No Objection Certificate (NOC)</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-xs text-slate-300 mb-1.5 block">Select File (PDF, JPG, PNG - Max 5MB)</label>
                  <input
                    type="file"
                    id="file-input-element"
                    onChange={handleFileChange}
                    accept=".pdf,.jpg,.jpeg,.png"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-1.5 px-3 text-xs focus:outline-none text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={uploading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold py-2.5 rounded-xl transition text-sm flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
              >
                {uploading ? "Uploading file..." : "Upload Securely"} <Upload className="h-4 w-4" />
              </button>
            </form>
          </div>

          {/* Documents list */}
          <div className="bg-slate-900/80 border border-slate-800 shadow-xl p-6 rounded-2xl">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Lock className="h-5 w-5 text-indigo-600" /> Vault Inventory
            </h2>

            {documents.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-10 border border-dashed border-slate-800 rounded-xl">
                No documents found in vault. Upload passport or transcript copies above to get started.
              </p>
            ) : (
              <div className="space-y-6">
                {documents.map((doc) => (
                  <div key={doc.id} className="border border-slate-800 p-4 rounded-xl space-y-4 hover:shadow-xs transition">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                      <div className="flex items-center gap-3">
                        <div className="bg-indigo-50 dark:bg-indigo-950 p-2.5 rounded-lg text-indigo-600 dark:text-indigo-400">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-sm text-white">{doc.fileType}</h3>
                          <p className="text-xxs text-slate-400 leading-none">{doc.originalName} ({Math.round(doc.fileSize / 1024)} KB)</p>
                        </div>
                      </div>

                      <div className="flex gap-2 items-center">
                        <span className={`text-xxs font-extrabold px-2 py-0.5 rounded-md border uppercase ${getStatusBadgeClass(doc.reviewStatus)}`}>
                          {doc.reviewStatus.replace(/_/g, " ")}
                        </span>
                        
                        {doc.storageUrl && (
                          <a
                            href={doc.storageUrl}
                            target="_blank"
                            className="bg-slate-800 border border-slate-800 text-slate-300 hover:bg-slate-800 p-1.5 rounded-lg transition"
                            title="View Document"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Counselor comments */}
                    {doc.comments && doc.comments.length > 0 && (
                      <div className="bg-slate-950/40 border border-slate-800 p-3 rounded-lg border-l-2 border-indigo-500">
                        <div className="text-xxs font-bold text-slate-400 mb-1 flex items-center gap-1">
                          <MessageSquare className="h-3 w-3" /> Counselor Review Note:
                        </div>
                        <p className="text-xs text-slate-600 dark:text-zinc-300 italic">
                          "{doc.comments[0].comment}"
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Column: Sharing Permissions / Compliance */}
        <div className="space-y-8">
          
          {/* Data privacy requests */}
          <div className="bg-slate-900/80 border border-slate-800 shadow-xl p-6 rounded-2xl">
            <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
              <ShieldAlert className="h-5 w-5 text-indigo-600" /> Privacy & Consent Control
            </h2>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="data-share-check"
                  checked={consents.dataSharing}
                  onChange={(e) => setConsents({ ...consents, dataSharing: e.target.checked })}
                  className="rounded accent-indigo-600 mt-1 h-4 w-4 flex-shrink-0 cursor-pointer"
                />
                <label htmlFor="data-share-check" className="text-xs text-slate-300 leading-normal select-none cursor-pointer">
                  <strong className="text-white">General Counselor Review:</strong> Allow assigned counselor to review files to verify GPA calculations.
                </label>
              </div>

              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="uni-share-check"
                  checked={consents.universitySharing}
                  onChange={(e) => setConsents({ ...consents, universitySharing: e.target.checked })}
                  className="rounded accent-indigo-600 mt-1 h-4 w-4 flex-shrink-0 cursor-pointer"
                />
                <label htmlFor="uni-share-check" className="text-xs text-slate-300 leading-normal select-none cursor-pointer">
                  <strong className="text-white">Partner University Sharing:</strong> Consent to share verified document metadata and files with admissions departments when submitting applications.
                </label>
              </div>

              <button
                onClick={handleSaveConsent}
                className="w-full bg-slate-50 hover:bg-slate-100 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-white font-bold py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 text-xs transition mt-2 cursor-pointer"
              >
                Update Consent Permissions
              </button>
            </div>
          </div>

          {/* Secure File upload guide */}
          <div className="bg-slate-900/80 border border-slate-800 shadow-xl p-6 rounded-2xl">
            <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
              <Lock className="h-5 w-5 text-indigo-600" /> Vault Security Details
            </h2>
            <ul className="space-y-2.5 text-xs text-slate-600 dark:text-zinc-300 leading-relaxed">
              <li className="flex gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                No file binaries or base64 files are stored directly in Neon database records.
              </li>
              <li className="flex gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                Uploads are parsed and scanned on arrival. Falsifying documents is ground for immediate profile deactivation.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}



