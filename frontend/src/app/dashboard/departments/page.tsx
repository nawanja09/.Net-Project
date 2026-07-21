"use client";

import { useEffect, useState } from "react";
import { api } from "../../../lib/api";
import { useAuth } from "../../../lib/auth-context";
import type { Department } from "../../../lib/types";

export default function DepartmentsPage() {
  const { user } = useAuth();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");

  const canManage = user?.role === "Admin" || user?.role === "HRManager";
  const canDelete = user?.role === "Admin";

  function loadDepartments() {
    setLoading(true);
    api
      .get<Department[]>("/Departments")
      .then(setDepartments)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load departments"))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadDepartments();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    setError("");
    setCreating(true);
    try {
      await api.post("/Departments", { name: newName.trim() });
      setNewName("");
      loadDepartments();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create department");
    } finally {
      setCreating(false);
    }
  }

  function startEdit(dept: Department) {
    setEditingId(dept.id);
    setEditName(dept.name);
  }

  async function handleUpdate(id: number) {
    if (!editName.trim()) return;
    setError("");
    try {
      await api.put(`/Departments/${id}`, { name: editName.trim() });
      setEditingId(null);
      loadDepartments();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update department");
    }
  }

  async function handleDelete(dept: Department) {
    if (dept.employeeCount > 0) {
      alert(`Reassign the ${dept.employeeCount} employee(s) in ${dept.name} before removing it.`);
      return;
    }
    if (!confirm(`Remove "${dept.name}"?`)) return;
    setError("");
    try {
      await api.delete(`/Departments/${dept.id}`);
      loadDepartments();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove department");
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h2 className="font-display text-3xl font-semibold text-ink mb-1">Departments</h2>
        <p className="text-ink-soft text-sm">
          {loading ? "Loading…" : `${departments.length} on record`}
        </p>
      </div>

      {error && (
        <p className="bg-stamp-rust/10 text-stamp-rust text-sm p-3 rounded-md mb-4 border border-stamp-rust/20">
          {error}
        </p>
      )}

      {canManage && (
        <form onSubmit={handleCreate} className="flex gap-3 mb-6">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="New department name"
            className="flex-1 border border-line rounded-md px-3 py-2 text-sm bg-surface focus:outline-none focus:ring-2 focus:ring-stamp-amber/40"
          />
          <button
            type="submit"
            disabled={creating || !newName.trim()}
            className="bg-cover text-oncover text-sm font-medium px-5 py-2.5 rounded-md hover:bg-cover-hover transition-colors disabled:opacity-50"
          >
            {creating ? "Adding…" : "Add"}
          </button>
        </form>
      )}

      <div className="bg-surface border border-line rounded-lg overflow-hidden">
        {!loading && departments.length === 0 && (
          <p className="px-5 py-8 text-center text-ink-soft text-sm">
            No departments yet. {canManage && "Add one above to get started."}
          </p>
        )}

        {departments.map((dept, i) => (
          <div
            key={dept.id}
            className={`flex items-center justify-between px-5 py-3.5 ${
              i !== departments.length - 1 ? "border-b border-line" : ""
            }`}
          >
            {editingId === dept.id ? (
              <div className="flex-1 flex items-center gap-3">
                <input
                  autoFocus
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="flex-1 border border-line rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-stamp-amber/40"
                />
                <button
                  onClick={() => handleUpdate(dept.id)}
                  className="text-sm text-stamp-teal font-medium hover:underline"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingId(null)}
                  className="text-sm text-ink-soft hover:underline"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <>
                <div>
                  <p className="font-medium text-ink text-sm">{dept.name}</p>
                  <p className="font-mono text-[11px] text-ink-soft uppercase tracking-wide mt-0.5">
                    {dept.employeeCount} employee{dept.employeeCount !== 1 ? "s" : ""}
                  </p>
                </div>
                {canManage && (
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => startEdit(dept)}
                      className="text-sm text-ink-soft hover:text-ink"
                    >
                      Rename
                    </button>
                    {canDelete && (
                      <button
                        onClick={() => handleDelete(dept)}
                        className="text-sm text-stamp-rust hover:underline"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}