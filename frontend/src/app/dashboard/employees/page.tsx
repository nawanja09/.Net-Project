"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "../../../lib/api";
import { useAuth } from "../../../lib/auth-context";
import type { Employee } from "../../../lib/types";

export default function EmployeesPage() {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const canManage = user?.role === "Admin" || user?.role === "HRManager";

  useEffect(() => {
    api
      .get<Employee[]>("/Employees")
      .then(setEmployees)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load employees"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="font-display text-3xl font-semibold text-ink mb-1">Employees</h2>
          <p className="text-ink-soft text-sm">
            {loading ? "Loading…" : `${employees.length} on record`}
          </p>
        </div>
        {canManage && (
          <Link
            href="/dashboard/employees/new"
            className="bg-cover text-oncover text-sm font-medium px-4 py-2.5 rounded-md hover:bg-cover-hover transition-colors"
          >
            + Add employee
          </Link>
        )}
      </div>

      {error && (
        <p className="bg-stamp-rust/10 text-stamp-rust text-sm p-3 rounded-md mb-4 border border-stamp-rust/20">
          {error}
        </p>
      )}

      <div className="bg-surface border border-line rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line bg-paper/50">
              <th className="text-left font-mono text-[11px] uppercase tracking-wide text-ink-soft px-5 py-3">
                Name
              </th>
              <th className="text-left font-mono text-[11px] uppercase tracking-wide text-ink-soft px-5 py-3">
                Email
              </th>
              <th className="text-left font-mono text-[11px] uppercase tracking-wide text-ink-soft px-5 py-3">
                Department
              </th>
              <th className="text-left font-mono text-[11px] uppercase tracking-wide text-ink-soft px-5 py-3">
                Designation
              </th>
              <th className="text-left font-mono text-[11px] uppercase tracking-wide text-ink-soft px-5 py-3">
                Joined
              </th>
            </tr>
          </thead>
          <tbody>
            {!loading && employees.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-ink-soft text-sm">
                  No employees yet. {canManage && "Add your first one to get started."}
                </td>
              </tr>
            )}
            {employees.map((emp) => (
              <tr key={emp.id} className="border-b border-line last:border-0 hover:bg-paper/40">
                <td className="px-5 py-3.5">
                  <Link
                    href={`/dashboard/employees/${emp.id}`}
                    className="font-medium text-ink hover:text-stamp-amber transition-colors"
                  >
                    {emp.fullName}
                  </Link>
                </td>
                <td className="px-5 py-3.5 text-ink-soft font-mono text-xs">{emp.email}</td>
                <td className="px-5 py-3.5 text-ink-soft">{emp.departmentName || "—"}</td>
                <td className="px-5 py-3.5 text-ink-soft">{emp.designationTitle || "—"}</td>
                <td className="px-5 py-3.5 text-ink-soft font-mono text-xs">
                  {new Date(emp.joinDate).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}