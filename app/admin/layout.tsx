"use client"

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Shield, LogOut, Activity, TrendingUp, Users, AlertTriangle, FileText, Gauge } from "lucide-react";
import { authService } from "@/src/services/auth";
import AdminHeader from "@/components/admin/AdminHeader";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [user] = useState<any>({ username: "Admin", is_staff: true });
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    authService.logout();
    router.push("/");
  }

  const navItems = [
    { icon: Gauge, label: "Dashboard", href: "/admin", exact: true },
    { icon: TrendingUp, label: "Markets", href: "/admin/markets" },
    { icon: Users, label: "Users", href: "/admin/users" },
    { icon: AlertTriangle, label: "Risk & Fraud", href: "/admin/risk" },
    { icon: FileText, label: "Resolutions", href: "/admin/resolutions" },
    { icon: FileText, label: "Disputes", href: "/admin/disputes" },
    { icon: Activity, label: "Intelligence", href: "/admin/intelligence" },
    { icon: Shield, label: "Audit Logs", href: "/admin/audit" },
  ];



  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -280 }}
        animate={{ x: sidebarOpen ? 0 : -280 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="fixed left-0 top-0 h-screen w-[280px] bg-muted/40 border-r border-border z-40 overflow-y-auto"
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-800 mt-15">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Admin Command</h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              ×
            </button>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
              {user?.username?.[0]?.toUpperCase() || "A"}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.username || "Admin"}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Super Admin</p>
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname ? (
              item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href)
            ) : false;

            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  whileHover={{ x: 4 }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors cursor-pointer ${isActive
                    ? "bg-blue-100 dark:bg-blue-600/20 text-blue-700 dark:text-blue-400 border-l-2 border-blue-500"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                    }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </motion.div>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? "lg:ml-[280px]" : "lg:ml-0"}`}>
        {/* Top Navigation Bar */}
        <AdminHeader sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <div className="min-h-screen p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

