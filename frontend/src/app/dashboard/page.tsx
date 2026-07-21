"use client";

import { useAuth } from "../../lib/auth-context";

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-surface border border-line rounded-lg p-5">
      <p className="font-mono text-[11px] uppercase tracking-wide text-ink-soft mb-2">{label}</p>
      <p className="font-display text-2xl font-semibold text-ink">{value}</p>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <div>
      <div className="mb-8">
        <h2 className="font-display text-3xl font-semibold text-ink mb-1">Overview</h2>
        <p className="text-ink-soft text-sm">A quick look at where things stand today.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Employees" value="—" />
        <StatCard label="Present today" value="—" />
        <StatCard label="Pending leave" value="—" />
        <StatCard label="Departments" value="—" />
      </div>

      <div className="bg-surface border border-line rounded-lg p-6">
        <p className="text-sm text-ink-soft">
          Employee, attendance, and leave summaries will populate here once those pages are connected.
        </p>
      </div>
    </div>
  );
}