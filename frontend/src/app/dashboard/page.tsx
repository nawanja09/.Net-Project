"use client";

import { useEffect, useState } from "react";
import { api } from "../../lib/api";
import { useAuth } from "../../lib/auth-context";
import type { Employee, Department, AttendanceRecord, LeaveRequestItem } from "../../lib/types";

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-surface border border-line rounded-lg p-5">
      <p className="font-mono text-[11px] uppercase tracking-wide text-ink-soft mb-2">{label}</p>
      <p className="font-display text-2xl font-semibold text-ink">{value}</p>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const isManager = user?.role === "Admin" || user?.role === "HRManager";

  const [employeeCount, setEmployeeCount] = useState<number | null>(null);
  const [departmentCount, setDepartmentCount] = useState<number | null>(null);
  const [presentToday, setPresentToday] = useState<number | null>(null);
  const [pendingLeave, setPendingLeave] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);

    const tasks: Promise<unknown>[] = [
      api.get<Employee[]>("/Employees").then((data) => setEmployeeCount(data.length)),
      api.get<Department[]>("/Departments").then((data) => setDepartmentCount(data.length)),
    ];

    if (isManager) {
      tasks.push(
        api
          .get<AttendanceRecord[]>(`/Attendance?date=${today}`)
          .then((data) => setPresentToday(data.filter((r) => r.status === "Present").length))
          .catch(() => setPresentToday(0)),
        api
          .get<LeaveRequestItem[]>("/Leave?status=Pending")
          .then((data) => setPendingLeave(data.length))
          .catch(() => setPendingLeave(0))
      );
    }

    Promise.all(tasks).finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!user) return null;

  return (
    <div>
      <div className="mb-8">
        <h2 className="font-display text-3xl font-semibold text-ink mb-1">Overview</h2>
        <p className="text-ink-soft text-sm">A quick look at where things stand today.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Employees" value={loading ? "…" : employeeCount ?? 0} />
        <StatCard
          label="Present today"
          value={isManager ? (loading ? "…" : presentToday ?? 0) : "—"}
        />
        <StatCard
          label="Pending leave"
          value={isManager ? (loading ? "…" : pendingLeave ?? 0) : "—"}
        />
        <StatCard label="Departments" value={loading ? "…" : departmentCount ?? 0} />
      </div>

      <div className="bg-surface border border-line rounded-lg p-6">
        <p className="text-sm text-ink-soft">
          {isManager
            ? "Use the sidebar to manage employees, review attendance, and approve leave requests."
            : "Use the sidebar to check in for the day, view your attendance history, and request time off."}
        </p>
      </div>
    </div>
  );
}