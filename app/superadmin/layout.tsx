import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { 
  LayoutDashboard, 
  LogOut,
  Users
} from "lucide-react";

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session || session.role !== "SUPERADMIN") {
    redirect("/login");
  }

  const navItems = [
    { name: "SuperAdmin Workspace", path: "/superadmin/dashboard", icon: LayoutDashboard },
    { name: "User Management", path: "/superadmin/dashboard/users", icon: Users },
  ];

  return (
    <div className="bg-slate-50 dark:bg-zinc-950 min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 h-16 px-6 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <Link href="/" className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-sky-500 bg-clip-text text-transparent">
            Vidyarthii<span className="text-sky-500 font-extrabold">Connect</span>
          </Link>
          <span className="bg-rose-50 text-rose-700 text-xs px-2 py-0.5 rounded-full font-semibold">
            SuperAdmin Panel
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

      {/* Body wrapper */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Sidebar */}
        <aside className="w-full md:w-64 bg-white dark:bg-zinc-900 border-r border-slate-200 dark:border-zinc-800 py-6 px-4 flex-shrink-0">
          <nav className="space-y-1">
            {navItems.map((item, idx) => (
              <Link
                key={idx}
                href={item.path}
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-850 hover:text-indigo-650 transition"
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Content Area */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
