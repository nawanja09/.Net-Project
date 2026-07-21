const STAMP_STYLES: Record<string, string> = {
  Present: "text-stamp-teal border-stamp-teal",
  Approved: "text-stamp-teal border-stamp-teal",
  Late: "text-stamp-amber border-stamp-amber",
  HalfDay: "text-stamp-amber border-stamp-amber",
  Pending: "text-stamp-amber border-stamp-amber",
  Absent: "text-stamp-rust border-stamp-rust",
  Rejected: "text-stamp-rust border-stamp-rust",
};

export function StatusStamp({ status }: { status: string }) {
  const style = STAMP_STYLES[status] || "text-ink-soft border-ink-soft";
  return (
    <span
      className={`inline-block font-mono text-[10px] font-semibold uppercase tracking-wider border rounded px-2 py-0.5 -rotate-2 ${style}`}
    >
      {status}
    </span>
  );
}