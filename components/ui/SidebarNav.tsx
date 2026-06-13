"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Search, 
  FileText, 
  Send, 
  MessageSquare, 
  CreditCard, 
  ShieldCheck, 
  Sparkles,
  Users
} from "lucide-react";

interface SidebarNavProps {
  role: "student" | "counselor" | "partner" | "admin" | "superadmin";
}

export const SidebarNav: React.FC<SidebarNavProps> = ({ role }) => {
  const pathname = usePathname();

  const getNavItems = () => {
    switch (role) {
      case "student":
        return [
          { name: "Overview Dashboard", path: "/student/dashboard", icon: LayoutDashboard },
          { name: "University Finder", path: "/student/search", icon: Search },
          { name: "AI Assistant", path: "/student/ai-assistant", icon: Sparkles },
          { name: "Document Vault", path: "/student/documents", icon: FileText },
          { name: "Application Status", path: "/student/applications", icon: Send },
          { name: "Visa & NOC Check", path: "/student/visa", icon: ShieldCheck },
          { name: "Service & Payments", path: "/student/payments", icon: CreditCard },
          { name: "Counselor chat", path: "/student/chat", icon: MessageSquare },
        ];
      case "counselor":
        return [
          { name: "Counselor Workspace", path: "/counselor/dashboard", icon: LayoutDashboard },
        ];
      case "partner":
        return [
          { name: "Partner Workspace", path: "/partner/dashboard", icon: LayoutDashboard },
        ];
      case "admin":
        return [
          { name: "Admin CRM Panel", path: "/admin/dashboard", icon: LayoutDashboard },
          { name: "User Management", path: "/admin/dashboard/users", icon: Users },
        ];
      case "superadmin":
        return [
          { name: "SuperAdmin Workspace", path: "/superadmin/dashboard", icon: LayoutDashboard },
          { name: "User Management", path: "/superadmin/dashboard/users", icon: Users },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  return (
    <nav className="space-y-1">
      {navItems.map((item, idx) => {
        const isActive = pathname === item.path || pathname.startsWith(item.path + "/");
        const Icon = item.icon;

        return (
          <Link
            key={idx}
            href={item.path}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition duration-200 border cursor-pointer ${
              isActive
                ? "bg-indigo-600/20 text-white border border-indigo-500/40 shadow-sm font-semibold"
                : "border-transparent text-slate-300 hover:bg-slate-800 hover:text-white"
            }`}
          >
            <Icon 
              className={`h-4 w-4 transition duration-200 ${
                isActive 
                  ? "text-indigo-300" 
                  : "text-slate-400 group-hover:text-white"
              }`} 
            />
            <span>{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
};
