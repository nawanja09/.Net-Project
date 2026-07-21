"use client";

import { useEffect, useState } from "react";
import { api } from "../../../lib/api";
import { useAuth } from "../../../lib/auth-context";
import type { Designation } from "../../../lib/types";

export default function DesignationsPage() {
  const { user } = useAuth();
  const [designations, setDesignations] = useState<Designation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");

  const canManage = user?.role === "Admin" || user?.role === "HRManager";
  const canDelete = user?.role === "Admin";

  function loadDesignations() {
    setLoading(true);
    api
      .get<Designation[]>("/Designations")
      .then(setDesignations)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load designations"))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadDesignations();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setError("");
    setCreating(true);
    try {
      await api.post("/Designations", { title: newTitle.trim() });
      setNewTitle("");
      loadDesignations();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create designation");
    } finally {
      setCreating(false);
    }
  }

  function startEdit(desig: Designation) {
    setEditingId(desig.id);
    setEditTitle(desig.title);
  }

  async function handleUpdate(id: number) {
    if (!editTitle.trim()) return;
    setError("");
    try {
      await api.put(`/Designations/${id}`, { title: editTitle.trim() });
      setEditingId(null);
      loadDesignations();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update designation");
    }
  }

  async function handleDelete(desig: Designation) {
    if (desig.employeeCount > 0) {
      alert(`Reassign the ${desig.employeeCount} employee(s) with "${desig.title}" before removing it.`);
      return;
    }
    if (!confirm(`Remove "${desig.title}"?`)) return;
    setError("");
    try {
      await api.delete(`/Designations/${desig.id}`);
      loadDesignations();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove designation");
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h2 className="font-display text-3xl font-semibold text-ink mb-1">Designations</h2>
        <p className="text-ink-soft text-sm">
          {loading ? "Loading…" : `${designations.length} on record`}
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
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="New designation title"
            className="flex-1 border border-line rounded-md px-3 py-2 text-sm bg-surface focus:outline-none focus:ring-2 focus:ring-stamp-amber/40"
          />
          <button
            type="submit"
            disabled={creating || !newTitle.trim()}
            className="bg-cover text-oncover text-sm font-medium px-5 py-2.5 rounded-md hover:bg-cover-hover transition-colors disabled:opacity-50"
          >
            {creating ? "Adding…" : "Add"}
          </button>
        </form>
      )}

      <div className="bg-surface border border-line rounded-lg overflow-hidden">
        {!loading && designations.length === 0 && (
          <p className="px-5 py-8 text-center text-ink-soft text-sm">
            No designations yet. {canManage && "Add one above to get started."}
          </p>
        )}

        {designations.map((desig, i) => (
          <div
            key={desig.id}
            className={`flex items-center justify-between px-5 py-3.5 ${
              i !== designations.length - 1 ? "border-b border-line" : ""
            }`}
          >
            {editingId === desig.id ? (
              <div className="flex-1 flex items-center gap-3">
                <input
                  autoFocus
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="flex-1 border border-line rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-stamp-amber/40"
                />
                <button
                  onClick={() => handleUpdate(desig.id)}
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
                  <p className="font-medium text-ink text-sm">{desig.title}</p>
                  <p className="font-mono text-[11px] text-ink-soft uppercase tracking-wide mt-0.5">
                    {desig.employeeCount} employee{desig.employeeCount !== 1 ? "s" : ""}
                  </p>
                </div>
                {canManage && (
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => startEdit(desig)}
                      className="text-sm text-ink-soft hover:text-ink"
                    >
                      Rename
                    </button>
                    {canDelete && (
                      <button
                        onClick={() => handleDelete(desig)}
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