"use client";

import { useEffect, useState } from "react";
import { api } from "../../../lib/api";
import { useAuth } from "../../../lib/auth-context";
import { StatusStamp } from "../../../components/status-stamp";
import type { LeaveRequestItem, LeaveBalanceItem } from "../../../lib/types";

export default function LeavePage() {
  const { user } = useAuth();
  const isManager = user?.role === "Admin" || user?.role === "HRManager";

  const [myRequests, setMyRequests] = useState<LeaveRequestItem[]>([]);
  const [balances, setBalances] = useState<LeaveBalanceItem[]>([]);
  const [pendingQueue, setPendingQueue] = useState<LeaveRequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    startDate: "",
    endDate: "",
    reason: "",
    leaveType: "Annual",
  });
  const [submitting, setSubmitting] = useState(false);

  function loadAll() {
    const tasks: Promise<unknown>[] = [
      api.get<LeaveRequestItem[]>("/Leave").then(setMyRequests),
      api.get<LeaveBalanceItem[]>("/Leave/balance").then(setBalances),
    ];
    if (isManager) {
      tasks.push(
        api.get<LeaveRequestItem[]>("/Leave?status=Pending").then(setPendingQueue)
      );
    }
    return Promise.all(tasks);
  }

  useEffect(() => {
    setLoading(true);
    loadAll()
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load leave data"))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);
    try {
      await api.post("/Leave", {
        startDate: new Date(form.startDate).toISOString(),
        endDate: new Date(form.endDate).toISOString(),
        reason: form.reason,
        leaveType: form.leaveType,
      });
      setForm({ startDate: "", endDate: "", reason: "", leaveType: "Annual" });
      setSuccess("Leave request submitted.");
      loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit request");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleReview(id: number, approve: boolean) {
    setError("");
    try {
      await api.put(`/Leave/${id}/review`, { approve });
      loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to review request");
    }
  }

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric" });
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="font-display text-3xl font-semibold text-ink mb-1">Leave</h2>
        <p className="text-ink-soft text-sm">Request time off and track approvals.</p>
      </div>

      {error && (
        <p className="bg-stamp-rust/10 text-stamp-rust text-sm p-3 rounded-md mb-4 border border-stamp-rust/20 max-w-2xl">
          {error}
        </p>
      )}
      {success && (
        <p className="bg-stamp-teal/10 text-stamp-teal text-sm p-3 rounded-md mb-4 border border-stamp-teal/20 max-w-2xl">
          {success}
        </p>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl">
        {/* Request form */}
        <div>
          <h3 className="font-display text-lg font-semibold text-ink mb-3">Request time off</h3>
          <form onSubmit={handleSubmit} className="bg-surface border border-line rounded-lg p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wide text-ink-soft mb-1.5">
                  Start date
                </label>
                <input
                  type="date"
                  required
                  value={form.startDate}
                  onChange={(e) => update("startDate", e.target.value)}
                  className="w-full border border-line rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stamp-amber/40"
                />
              </div>
              <div>
                <label className="block text-xs font-mono uppercase tracking-wide text-ink-soft mb-1.5">
                  End date
                </label>
                <input
                  type="date"
                  required
                  value={form.endDate}
                  onChange={(e) => update("endDate", e.target.value)}
                  className="w-full border border-line rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stamp-amber/40"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wide text-ink-soft mb-1.5">
                Leave type
              </label>
              <select
                value={form.leaveType}
                onChange={(e) => update("leaveType", e.target.value)}
                className="w-full border border-line rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stamp-amber/40"
              >
                <option value="Annual">Annual</option>
                <option value="Sick">Sick</option>
                <option value="Casual">Casual</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wide text-ink-soft mb-1.5">
                Reason
              </label>
              <textarea
                required
                rows={3}
                value={form.reason}
                onChange={(e) => update("reason", e.target.value)}
                className="w-full border border-line rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stamp-amber/40 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="bg-cover text-oncover text-sm font-medium px-5 py-2.5 rounded-md hover:bg-cover-hover transition-colors disabled:opacity-50"
            >
              {submitting ? "Submitting…" : "Submit request"}
            </button>
          </form>
        </div>

        {/* Balances */}
        <div>
          <h3 className="font-display text-lg font-semibold text-ink mb-3">My balance</h3>
          <div className="bg-surface border border-line rounded-lg overflow-hidden">
            {balances.length === 0 && (
              <p className="px-5 py-8 text-center text-ink-soft text-sm">
                No leave balance has been set for you yet.
              </p>
            )}
            {balances.map((b, i) => (
              <div
                key={b.leaveType}
                className={`flex items-center justify-between px-5 py-4 ${
                  i !== balances.length - 1 ? "border-b border-line" : ""
                }`}
              >
                <p className="font-medium text-sm text-ink">{b.leaveType}</p>
                <p className="font-mono text-sm text-ink-soft">
                  <span className="text-ink font-semibold">{b.remainingDays}</span> / {b.totalDays} days left
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* My request history */}
      <div className="mt-10 max-w-4xl">
        <h3 className="font-display text-lg font-semibold text-ink mb-3">My requests</h3>
        <div className="bg-surface border border-line rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line bg-paper/50">
                <th className="text-left font-mono text-[11px] uppercase tracking-wide text-ink-soft px-5 py-3">Dates</th>
                <th className="text-left font-mono text-[11px] uppercase tracking-wide text-ink-soft px-5 py-3">Days</th>
                <th className="text-left font-mono text-[11px] uppercase tracking-wide text-ink-soft px-5 py-3">Reason</th>
                <th className="text-left font-mono text-[11px] uppercase tracking-wide text-ink-soft px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {!loading && myRequests.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-ink-soft text-sm">
                    No leave requests yet.
                  </td>
                </tr>
              )}
              {myRequests.map((r) => (
                <tr key={r.id} className="border-b border-line last:border-0">
                  <td className="px-5 py-3 font-mono text-xs text-ink-soft">
                    {formatDate(r.startDate)} – {formatDate(r.endDate)}
                  </td>
                  <td className="px-5 py-3 font-mono text-xs">{r.daysRequested}</td>
                  <td className="px-5 py-3 text-ink-soft">{r.reason}</td>
                  <td className="px-5 py-3">
                    <StatusStamp status={r.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Admin/HR approval queue */}
      {isManager && (
        <div className="mt-10 max-w-4xl">
          <h3 className="font-display text-lg font-semibold text-ink mb-3">Pending approvals</h3>
          <div className="bg-surface border border-line rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line bg-paper/50">
                  <th className="text-left font-mono text-[11px] uppercase tracking-wide text-ink-soft px-5 py-3">Employee</th>
                  <th className="text-left font-mono text-[11px] uppercase tracking-wide text-ink-soft px-5 py-3">Dates</th>
                  <th className="text-left font-mono text-[11px] uppercase tracking-wide text-ink-soft px-5 py-3">Days</th>
                  <th className="text-left font-mono text-[11px] uppercase tracking-wide text-ink-soft px-5 py-3">Reason</th>
                  <th className="text-right font-mono text-[11px] uppercase tracking-wide text-ink-soft px-5 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {pendingQueue.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-ink-soft text-sm">
                      Nothing waiting on review.
                    </td>
                  </tr>
                )}
                {pendingQueue.map((r) => (
                  <tr key={r.id} className="border-b border-line last:border-0">
                    <td className="px-5 py-3 font-medium text-ink">{r.employeeName}</td>
                    <td className="px-5 py-3 font-mono text-xs text-ink-soft">
                      {formatDate(r.startDate)} – {formatDate(r.endDate)}
                    </td>
                    <td className="px-5 py-3 font-mono text-xs">{r.daysRequested}</td>
                    <td className="px-5 py-3 text-ink-soft">{r.reason}</td>
                    <td className="px-5 py-3 text-right space-x-3">
                      <button
                        onClick={() => handleReview(r.id, true)}
                        className="text-sm text-stamp-teal font-medium hover:underline"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReview(r.id, false)}
                        className="text-sm text-stamp-rust font-medium hover:underline"
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}