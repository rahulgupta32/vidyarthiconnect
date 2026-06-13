import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { 
  UserCheck, 
  FileText, 
  Send, 
  Clock, 
  AlertCircle, 
  CheckCircle,
  MessageSquare,
  Sparkles,
  CreditCard,
  User
} from "lucide-react";
import { redirect } from "next/navigation";

export default async function StudentDashboard() {
  const session = await getSession();

  if (!session || session.role !== "STUDENT") {
    redirect("/login");
  }

  // 1. Fetch Student Profile and related tables
  const profile = await db.studentProfile.findUnique({
    where: { userId: session.id },
    include: {
      user: true,
      applications: {
        include: {
          university: true,
          course: true,
          counselor: { include: { user: { select: { name: true } } } },
        },
      },
      documents: true,
      payments: {
        include: { package: true },
      },
      aiRecommendations: {
        include: {
          course: {
            include: { university: true },
          },
        },
      },
    },
  });

  if (!profile) {
    return <div>Profile error. Please contact support.</div>;
  }

  // Calculate profile completion percentage
  const fields = [
    profile.academicLevel,
    profile.gpa,
    profile.englishTestType,
    profile.englishTestScore,
    profile.intendedDegree,
    profile.preferredCountry,
    profile.budgetRange,
    profile.fundingSource,
    profile.workExperience,
    profile.passportStatus,
  ];
  const filledFieldsCount = fields.filter((f) => f !== null && f !== "").length;
  const completionPercentage = Math.round((filledFieldsCount / fields.length) * 100);

  // Fetch recent notifications
  const notifications = await db.notification.findMany({
    where: { userId: session.id },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-600 to-sky-500 text-white rounded-2xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="relative z-10 max-w-xl">
          <h1 className="text-2xl sm:text-3xl font-extrabold mb-2">Welcome Back, {session.name}!</h1>
          <p className="text-indigo-150 text-sm">
            Keep your academic profile updated to get more accurate AI course recommendations. Your path to global education starts here.
          </p>
        </div>
        <div className="absolute right-0 bottom-0 opacity-10 translate-x-12 translate-y-12">
          <Sparkles className="h-64 w-64" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Active Applications */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Send className="h-5 w-5 text-indigo-600" /> Active Applications
              </h2>
              <Link href="/student/applications" className="text-xs text-indigo-600 hover:underline font-semibold">
                View All
              </Link>
            </div>

            {profile.applications.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-slate-200 dark:border-zinc-800 rounded-xl">
                <Send className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-500">You haven't submitted any applications yet.</p>
                <Link href="/student/search" className="mt-4 inline-block bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-full">
                  Search Universities
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {profile.applications.map((app) => (
                  <div key={app.id} className="border border-slate-100 dark:border-zinc-800/80 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-slate-50 dark:hover:bg-zinc-800/30 transition">
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-zinc-100">{app.course.title}</h3>
                      <p className="text-xs text-slate-500">{app.university.name}</p>
                      <div className="flex gap-4 text-xxs text-slate-400 mt-1">
                        <span>Intake: {app.intake}</span>
                        {app.counselor && <span>Counselor: {app.counselor.user.name}</span>}
                      </div>
                    </div>
                    <div>
                      <span className={`text-xxs font-extrabold px-2.5 py-1 rounded-full uppercase ${
                        app.status === "VISA_APPROVED" || app.status === "ACCEPTED"
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400"
                          : app.status === "REJECTED" || app.status === "VISA_REJECTED"
                          ? "bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400"
                          : "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-400"
                      }`}>
                        {app.status.replace(/_/g, " ")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* AI recommendations */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-500" /> AI-Recommended Programs
              </h2>
              <Link href="/student/search" className="text-xs text-indigo-600 hover:underline font-semibold">
                Explore More
              </Link>
            </div>

            {profile.aiRecommendations.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-500">
                Generate recommendations by filling out your GPA and English scores in the profile setup.
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {profile.aiRecommendations.slice(0, 2).map((rec) => (
                  <div key={rec.id} className="border border-slate-100 dark:border-zinc-800 p-4 rounded-xl hover:shadow-md transition">
                    <div className="flex justify-between items-start mb-2">
                      <span className={`text-xxs font-bold px-2 py-0.5 rounded-full ${
                        rec.riskLevel === "SAFE"
                          ? "bg-emerald-50 text-emerald-700"
                          : rec.riskLevel === "MODERATE"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-rose-50 text-rose-700"
                      }`}>
                        {rec.riskLevel} MATCH
                      </span>
                      <span className="text-xs font-extrabold text-indigo-600">{rec.score}% match</span>
                    </div>
                    <h3 className="font-bold text-sm line-clamp-1">{rec.course.title}</h3>
                    <p className="text-xxs text-slate-500 mb-2">{rec.course.university.name}</p>
                    <p className="text-xxs text-slate-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">{rec.reason}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Column */}
        <div className="space-y-8">
          {/* Profile Completeness */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
              <UserCheck className="h-5 w-5 text-indigo-600" /> Profile Completion
            </h2>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="font-medium text-slate-500">Completed fields</span>
              <span className="font-bold text-indigo-600">{completionPercentage}%</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-zinc-850 h-2.5 rounded-full overflow-hidden mb-4">
              <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${completionPercentage}%` }} />
            </div>
            <Link href="/student/profile" className="w-full bg-slate-50 dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 text-xs font-semibold py-2 rounded-xl text-center block transition">
              Build Profile Details
            </Link>
          </div>

          {/* Document Locker Summary */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
              <FileText className="h-5 w-5 text-indigo-600" /> Document Locker
            </h2>
            <div className="grid grid-cols-3 gap-2 text-center text-xs mb-4">
              <div className="bg-slate-50 dark:bg-zinc-800/40 p-2 rounded-lg">
                <div className="font-bold text-slate-800 dark:text-zinc-100">{profile.documents.length}</div>
                <div className="text-slate-400 text-xxs">Uploaded</div>
              </div>
              <div className="bg-emerald-50/50 dark:bg-emerald-950/10 p-2 rounded-lg">
                <div className="font-bold text-emerald-600">{profile.documents.filter((d) => d.reviewStatus === "APPROVED").length}</div>
                <div className="text-emerald-500 text-xxs">Approved</div>
              </div>
              <div className="bg-amber-50/50 dark:bg-amber-950/10 p-2 rounded-lg">
                <div className="font-bold text-amber-600">{profile.documents.filter((d) => d.reviewStatus === "PENDING").length}</div>
                <div className="text-amber-500 text-xxs">Pending</div>
              </div>
            </div>
            <Link href="/student/documents" className="w-full bg-slate-50 dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 text-xs font-semibold py-2 rounded-xl text-center block transition">
              Open Document Vault
            </Link>
          </div>

          {/* Recent Notifications */}
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
              <Clock className="h-5 w-5 text-indigo-600" /> Recent Activity
            </h2>
            {notifications.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">No recent activity.</p>
            ) : (
              <div className="space-y-3.5">
                {notifications.map((notif) => (
                  <div key={notif.id} className="flex gap-2.5 items-start text-xs border-b border-slate-50 dark:border-zinc-850 pb-2.5 last:border-b-0 last:pb-0">
                    {notif.type === "SUCCESS" && <CheckCircle className="h-4 w-4 text-emerald-500 flex-shrink-0" />}
                    {notif.type === "WARNING" && <AlertCircle className="h-4 w-4 text-amber-500 flex-shrink-0" />}
                    {notif.type === "ERROR" && <AlertCircle className="h-4 w-4 text-rose-500 flex-shrink-0" />}
                    {notif.type === "INFO" && <Clock className="h-4 w-4 text-indigo-500 flex-shrink-0" />}
                    <p className="text-slate-650 dark:text-zinc-350">{notif.content}</p>
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
