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
    <div className="dark min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-900/95 border-b border-slate-800 h-16 px-6 flex items-center justify-between shadow-sm backdrop-blur">
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
      <div className="flex flex-col md:flex-row min-h-[calc(100vh-4rem)]">
        {/* Sidebar */}
        <aside className="w-full md:w-64 bg-slate-900/80 border-b md:border-r md:border-b-0 border-slate-800 py-6 px-4 flex-shrink-0">
          <SidebarNav role="superadmin" />
        </aside>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-7xl px-6 py-8 lg:px-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
