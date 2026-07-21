"use client";

import { useEffect, useState } from "react";
import { api } from "../../../lib/api";
import { useAuth } from "../../../lib/auth-context";
import { StatusStamp } from "../../../components/status-stamp";
import type { AttendanceRecord } from "../../../lib/types";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export default function AttendancePage() {
  const { user } = useAuth();
  const isManager = user?.role === "Admin" || user?.role === "HRManager";

  const [myRecords, setMyRecords] = useState<AttendanceRecord[]>([]);
  const [companyRecords, setCompanyRecords] = useState<AttendanceRecord[]>([]);
  const [selectedDate, setSelectedDate] = useState(todayStr());
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  const todayRecord = myRecords.find((r) => r.date.slice(0, 10) === todayStr());
  const hasCheckedIn = !!todayRecord?.checkIn;
  const hasCheckedOut = !!todayRecord?.checkOut;

  function loadMine() {
    return api.get<AttendanceRecord[]>("/Attendance/my").then(setMyRecords);
  }

  function loadCompany(date: string) {
    return api
      .get<AttendanceRecord[]>(`/Attendance?date=${date}`)
      .then(setCompanyRecords)
      .catch(() => setCompanyRecords([]));
  }

  useEffect(() => {
    setLoading(true);
    const tasks = [loadMine()];
    if (isManager) tasks.push(loadCompany(selectedDate));
    Promise.all(tasks)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load attendance"))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isManager) loadCompany(selectedDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  async function handleCheckIn() {
    setError("");
    setActionLoading(true);
    try {
      await api.post("/Attendance/check-in", {});
      await loadMine();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Check-in failed");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleCheckOut() {
    setError("");
    setActionLoading(true);
    try {
      await api.post("/Attendance/check-out", {});
      await loadMine();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Check-out failed");
    } finally {
      setActionLoading(false);
    }
  }

  function formatTime(time: string | null) {
    if (!time) return "—";
    // backend returns TimeSpan like "08:32:27.1576918"
    const [h, m] = time.split(":");
    return `${h}:${m}`;
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="font-display text-3xl font-semibold text-ink mb-1">Attendance</h2>
        <p className="text-ink-soft text-sm">
          {new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
        </p>
      </div>

      {error && (
        <p className="bg-stamp-rust/10 text-stamp-rust text-sm p-3 rounded-md mb-4 border border-stamp-rust/20">
          {error}
        </p>
      )}

      {/* Self check-in/out card */}
      <div className="bg-surface border border-line rounded-lg p-6 mb-8 flex items-center justify-between max-w-2xl">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-wide text-ink-soft mb-1">Today</p>
          <div className="flex items-center gap-4 font-mono text-sm">
            <span>
              In: <span className="text-ink font-medium">{formatTime(todayRecord?.checkIn ?? null)}</span>
            </span>
            <span>
              Out: <span className="text-ink font-medium">{formatTime(todayRecord?.checkOut ?? null)}</span>
            </span>
          </div>
        </div>

        {!hasCheckedIn && (
          <button
            onClick={handleCheckIn}
            disabled={actionLoading}
            className="bg-cover text-oncover text-sm font-medium px-5 py-2.5 rounded-md hover:bg-cover-hover transition-colors disabled:opacity-50"
          >
            {actionLoading ? "…" : "Check in"}
          </button>
        )}
        {hasCheckedIn && !hasCheckedOut && (
          <button
            onClick={handleCheckOut}
            disabled={actionLoading}
            className="bg-stamp-amber text-oncover text-sm font-medium px-5 py-2.5 rounded-md hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {actionLoading ? "…" : "Check out"}
          </button>
        )}
        {hasCheckedIn && hasCheckedOut && (
          <StatusStamp status="Present" />
        )}
      </div>

      {/* My history */}
      <div className="mb-10">
        <h3 className="font-display text-lg font-semibold text-ink mb-3">My history</h3>
        <div className="bg-surface border border-line rounded-lg overflow-hidden max-w-2xl">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line bg-paper/50">
                <th className="text-left font-mono text-[11px] uppercase tracking-wide text-ink-soft px-5 py-3">Date</th>
                <th className="text-left font-mono text-[11px] uppercase tracking-wide text-ink-soft px-5 py-3">In</th>
                <th className="text-left font-mono text-[11px] uppercase tracking-wide text-ink-soft px-5 py-3">Out</th>
                <th className="text-left font-mono text-[11px] uppercase tracking-wide text-ink-soft px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {!loading && myRecords.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-ink-soft text-sm">
                    No attendance recorded yet.
                  </td>
                </tr>
              )}
              {myRecords.map((r) => (
                <tr key={r.id} className="border-b border-line last:border-0">
                  <td className="px-5 py-3 font-mono text-xs text-ink-soft">
                    {new Date(r.date).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-3 font-mono text-xs">{formatTime(r.checkIn)}</td>
                  <td className="px-5 py-3 font-mono text-xs">{formatTime(r.checkOut)}</td>
                  <td className="px-5 py-3">
                    <StatusStamp status={r.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Admin/HR: whole-company view for a chosen date */}
      {isManager && (
        <div>
          <div className="flex items-center justify-between mb-3 max-w-2xl">
            <h3 className="font-display text-lg font-semibold text-ink">Company-wide</h3>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border border-line rounded-md px-3 py-1.5 text-sm bg-surface focus:outline-none focus:ring-2 focus:ring-stamp-amber/40"
            />
          </div>
          <div className="bg-surface border border-line rounded-lg overflow-hidden max-w-2xl">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line bg-paper/50">
                  <th className="text-left font-mono text-[11px] uppercase tracking-wide text-ink-soft px-5 py-3">Employee</th>
                  <th className="text-left font-mono text-[11px] uppercase tracking-wide text-ink-soft px-5 py-3">In</th>
                  <th className="text-left font-mono text-[11px] uppercase tracking-wide text-ink-soft px-5 py-3">Out</th>
                  <th className="text-left font-mono text-[11px] uppercase tracking-wide text-ink-soft px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {companyRecords.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-5 py-8 text-center text-ink-soft text-sm">
                      No records for this date.
                    </td>
                  </tr>
                )}
                {companyRecords.map((r) => (
                  <tr key={r.id} className="border-b border-line last:border-0">
                    <td className="px-5 py-3 font-medium text-ink">{r.employeeName}</td>
                    <td className="px-5 py-3 font-mono text-xs">{formatTime(r.checkIn)}</td>
                    <td className="px-5 py-3 font-mono text-xs">{formatTime(r.checkOut)}</td>
                    <td className="px-5 py-3">
                      <StatusStamp status={r.status} />
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