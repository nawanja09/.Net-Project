"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../lib/auth-context";
import { IconGrid, IconUsers, IconFolder, IconClock, IconCalendar } from "../../components/icons";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", icon: IconGrid },
  { href: "/dashboard/employees", label: "Employees", icon: IconUsers },
  { href: "/dashboard/departments", label: "Departments", icon: IconFolder },
  { href: "/dashboard/attendance", label: "Attendance", icon: IconClock },
  { href: "/dashboard/leave", label: "Leave", icon: IconCalendar },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper">
        <p className="font-mono text-sm text-ink-soft tracking-wide">Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-paper">
      <aside className="w-64 shrink-0 bg-cover text-oncover flex flex-col">
        <div className="px-6 pt-8 pb-6 border-b border-white/10">
          <p className="font-mono text-[11px] tracking-[0.2em] text-oncover/50 uppercase mb-1">
            Personnel Ledger
          </p>
          <h1 className="font-display text-xl font-semibold leading-tight">
            {user.companyName}
          </h1>
        </div>

        <nav className="flex-1 px-3 py-6 space-y-1">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors ${
                  active
                    ? "bg-stamp-amber/15 text-oncover font-medium border border-stamp-amber/30"
                    : "text-oncover/70 hover:bg-cover-hover hover:text-oncover"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-4 py-5 border-t border-white/10">
          <div className="mb-3">
            <p className="text-sm font-medium truncate">{user.email}</p>
            <p className="font-mono text-[11px] uppercase tracking-wide text-oncover/50">
              {user.role}
            </p>
          </div>
          <button
            onClick={logout}
            className="w-full text-left text-sm text-oncover/70 hover:text-oncover border border-white/15 rounded-md px-3 py-2 hover:border-white/30 transition-colors"
          >
            Sign out
          </button>
        </div>
      </aside>

      <div className="flex-1 min-w-0">
        <header className="border-b border-line px-8 py-4 flex items-center justify-between bg-paper/80 backdrop-blur-sm sticky top-0 z-10">
          <p className="font-mono text-xs uppercase tracking-[0.15em] text-ink-soft">
            {new Date().toLocaleDateString(undefined, {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-stamp-teal" />
            <span className="text-xs text-ink-soft">Connected</span>
          </div>
        </header>
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}