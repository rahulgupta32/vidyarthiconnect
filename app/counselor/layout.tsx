import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { LogOut } from "lucide-react";
import { SidebarNav } from "@/components/ui/SidebarNav";

export default async function CounselorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session || session.role !== "COUNSELOR") {
    redirect("/login");
  }

  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen flex flex-col text-slate-900 dark:text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 h-16 px-6 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <Link href="/" className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-sky-500 bg-clip-text text-transparent">
            Vidyarthii<span className="text-sky-500 font-extrabold">Connect</span>
          </Link>
          <span className="bg-amber-50 text-amber-700 text-xs px-2 py-0.5 rounded-full font-semibold">
            Counselor Portal
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-sm font-semibold">{session.name}</div>
            <div className="text-xs text-slate-500">{session.email}</div>
          </div>
          
          <a
            href="/api/auth/logout"
            className="text-slate-400 hover:text-rose-500 p-2 rounded-lg transition"
            title="Sign Out"
          >
            <LogOut className="h-5 w-5" />
          </a>
        </div>
      </header>

      {/* Workspace container */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Sidebar */}
        <aside className="w-full md:w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 py-6 px-4 flex-shrink-0">
          <SidebarNav role="counselor" />
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 px-6 py-8 lg:px-10 overflow-y-auto max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
