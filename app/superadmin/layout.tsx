import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { LogOut } from "lucide-react";
import { SidebarNav } from "@/components/ui/SidebarNav";

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session || session.role !== "SUPERADMIN") {
    redirect("/login");
  }

  return (
    <div className="dark min-h-screen bg-slate-950 bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950/20 text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 h-16 border-b border-slate-800 bg-slate-900/95 px-6 flex items-center justify-between shadow-sm backdrop-blur">
        <div className="flex items-center gap-2">
          <Link href="/" className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-sky-500 bg-clip-text text-transparent">
            Vidyarthii<span className="text-sky-500 font-extrabold">Connect</span>
          </Link>
          <span className="bg-rose-500/10 text-rose-400 text-xs px-2 py-0.5 rounded-full font-semibold border border-rose-500/20">
            SuperAdmin Panel
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-sm font-semibold text-white">{session.name}</div>
            <div className="text-xs text-slate-400">{session.email}</div>
          </div>
          
          <a
            href="/api/auth/logout"
            className="text-slate-400 hover:text-rose-500 p-2 rounded-lg transition-colors duration-200"
            title="Sign Out"
          >
            <LogOut className="h-5 w-5" />
          </a>
        </div>
      </header>

      {/* Body wrapper */}
      <div className="min-h-[calc(100vh-4rem)] md:grid" style={{ gridTemplateColumns: "256px minmax(0, 1fr)" }}>
        {/* Sidebar */}
        <aside className="border-b border-slate-800 bg-slate-900/80 px-4 py-6 md:border-b-0 md:border-r">
          <SidebarNav role="superadmin" />
        </aside>

        {/* Content Area */}
        <main className="min-w-0 overflow-y-auto">
          <div className="mx-auto w-full max-w-7xl px-6 py-8 lg:px-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
