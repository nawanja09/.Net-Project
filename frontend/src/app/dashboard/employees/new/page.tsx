"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "../../../../lib/api";
import type { Department, Designation } from "../../../../lib/types";

export default function NewEmployeePage() {
  const router = useRouter();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [designations, setDesignations] = useState<Designation[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    departmentId: "",
    designationId: "",
    joinDate: new Date().toISOString().slice(0, 10),
  });

  useEffect(() => {
    Promise.all([
      api.get<Department[]>("/Departments"),
      api.get<Designation[]>("/Designations"),
    ]).then(([deps, desigs]) => {
      setDepartments(deps);
      setDesignations(desigs);
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/Employees", {
        fullName: form.fullName,
        email: form.email,
        password: form.password,
        departmentId: form.departmentId ? Number(form.departmentId) : null,
        designationId: form.designationId ? Number(form.designationId) : null,
        joinDate: new Date(form.joinDate).toISOString(),
      });
      router.push("/dashboard/employees");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create employee");
    } finally {
      setLoading(false);
    }
  }

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  return (
    <div className="max-w-lg">
      <h2 className="font-display text-3xl font-semibold text-ink mb-1">Add employee</h2>
      <p className="text-ink-soft text-sm mb-8">
        This creates their personnel record and a login for them to use.
      </p>

      {error && (
        <p className="bg-stamp-rust/10 text-stamp-rust text-sm p-3 rounded-md mb-4 border border-stamp-rust/20">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="bg-surface border border-line rounded-lg p-6 space-y-4">
        <div>
          <label className="block text-xs font-mono uppercase tracking-wide text-ink-soft mb-1.5">
            Full name
          </label>
          <input
            required
            value={form.fullName}
            onChange={(e) => update("fullName", e.target.value)}
            className="w-full border border-line rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stamp-amber/40"
          />
        </div>

        <div>
          <label className="block text-xs font-mono uppercase tracking-wide text-ink-soft mb-1.5">
            Email
          </label>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            className="w-full border border-line rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stamp-amber/40"
          />
        </div>

        <div>
          <label className="block text-xs font-mono uppercase tracking-wide text-ink-soft mb-1.5">
            Temporary password
          </label>
          <input
            type="text"
            required
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
            className="w-full border border-line rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stamp-amber/40"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wide text-ink-soft mb-1.5">
              Department
            </label>
            <select
              value={form.departmentId}
              onChange={(e) => update("departmentId", e.target.value)}
              className="w-full border border-line rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stamp-amber/40"
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
              value={form.designationId}
              onChange={(e) => update("designationId", e.target.value)}
              className="w-full border border-line rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stamp-amber/40"
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
            Join date
          </label>
          <input
            type="date"
            required
            value={form.joinDate}
            onChange={(e) => update("joinDate", e.target.value)}
            className="w-full border border-line rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stamp-amber/40"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="bg-cover text-oncover text-sm font-medium px-5 py-2.5 rounded-md hover:bg-cover-hover transition-colors disabled:opacity-50"
          >
            {loading ? "Creating…" : "Create employee"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/dashboard/employees")}
            className="text-sm text-ink-soft px-5 py-2.5 rounded-md hover:bg-paper transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}