"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "../../../../lib/api";
import { useAuth } from "../../../../lib/auth-context";
import type { Employee, Department, Designation } from "../../../../lib/types";

export default function EmployeeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const id = params.id as string;

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [designations, setDesignations] = useState<Designation[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    departmentId: "",
    designationId: "",
  });

  const canManage = user?.role === "Admin" || user?.role === "HRManager";
  const canDelete = user?.role === "Admin";

  useEffect(() => {
    Promise.all([
      api.get<Employee>(`/Employees/${id}`),
      api.get<Department[]>("/Departments"),
      api.get<Designation[]>("/Designations"),
    ])
      .then(([emp, deps, desigs]) => {
        setEmployee(emp);
        setDepartments(deps);
        setDesignations(desigs);
        setForm({
          fullName: emp.fullName,
          departmentId: deps.find((d) => d.name === emp.departmentName)?.id.toString() || "",
          designationId: desigs.find((d) => d.title === emp.designationTitle)?.id.toString() || "",
        });
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load employee"))
      .finally(() => setLoading(false));
  }, [id]);

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    setSuccess(false);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await api.put(`/Employees/${id}`, {
        fullName: form.fullName,
        departmentId: form.departmentId ? Number(form.departmentId) : null,
        designationId: form.designationId ? Number(form.designationId) : null,
      });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save changes");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Remove ${employee?.fullName} from the record? This cannot be undone.`)) return;
    try {
      await api.delete(`/Employees/${id}`);
      router.push("/dashboard/employees");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete employee");
    }
  }

  if (loading) {
    return <p className="font-mono text-sm text-ink-soft">Loading…</p>;
  }

  if (error && !employee) {
    return (
      <p className="bg-stamp-rust/10 text-stamp-rust text-sm p-3 rounded-md border border-stamp-rust/20 max-w-lg">
        {error}
      </p>
    );
  }

  return (
    <div className="max-w-lg">
      <button
        onClick={() => router.push("/dashboard/employees")}
        className="text-sm text-ink-soft hover:text-ink mb-4 inline-flex items-center gap-1"
      >
        ← Back to employees
      </button>

      <h2 className="font-display text-3xl font-semibold text-ink mb-1">{employee?.fullName}</h2>
      <p className="text-ink-soft text-sm font-mono mb-8">{employee?.email}</p>

      {error && (
        <p className="bg-stamp-rust/10 text-stamp-rust text-sm p-3 rounded-md mb-4 border border-stamp-rust/20">
          {error}
        </p>
      )}
      {success && (
        <p className="bg-stamp-teal/10 text-stamp-teal text-sm p-3 rounded-md mb-4 border border-stamp-teal/20">
          Changes saved.
        </p>
      )}

      <form onSubmit={handleSave} className="bg-surface border border-line rounded-lg p-6 space-y-4">
        <div>
          <label className="block text-xs font-mono uppercase tracking-wide text-ink-soft mb-1.5">
            Full name
          </label>
          <input
            required
            disabled={!canManage}
            value={form.fullName}
            onChange={(e) => update("fullName", e.target.value)}
            className="w-full border border-line rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stamp-amber/40 disabled:bg-paper disabled:text-ink-soft"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wide text-ink-soft mb-1.5">
              Department
            </label>
            <select
              disabled={!canManage}
              value={form.departmentId}
              onChange={(e) => update("departmentId", e.target.value)}
              className="w-full border border-line rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stamp-amber/40 disabled:bg-paper disabled:text-ink-soft"
            >
              <option value="">None</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wide text-ink-soft mb-1.5">
              Designation
            </label>
            <select
              disabled={!canManage}
              value={form.designationId}
              onChange={(e) => update("designationId", e.target.value)}
              className="w-full border border-line rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stamp-amber/40 disabled:bg-paper disabled:text-ink-soft"
            >
              <option value="">None</option>
              {designations.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-mono uppercase tracking-wide text-ink-soft mb-1.5">
            Joined
          </label>
          <p className="text-sm text-ink-soft font-mono px-3 py-2">
            {employee && new Date(employee.joinDate).toLocaleDateString()}
          </p>
        </div>

        {canManage && (
          <div className="flex items-center justify-between pt-2">
            <button
              type="submit"
              disabled={saving}
              className="bg-cover text-oncover text-sm font-medium px-5 py-2.5 rounded-md hover:bg-cover-hover transition-colors disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save changes"}
            </button>

            {canDelete && (
              <button
                type="button"
                onClick={handleDelete}
                className="text-sm text-stamp-rust hover:underline"
              >
                Remove employee
              </button>
            )}
          </div>
        )}
      </form>
    </div>
  );
}