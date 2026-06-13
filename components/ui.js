"use client";

import { formatINR } from "@/lib/format";

export function Money({ value, className = "" }) {
  return <span className={`tnum font-mono ${className}`}>{formatINR(Math.abs(Number(value) || 0))}</span>;
}

const AVATAR_COLORS = [
  "bg-brand-tint text-brand-dark",
  "bg-getTint text-get",
  "bg-[#EFE7D6] text-brass",
  "bg-giveTint text-give",
];

export function Avatar({ name = "?", size = 44 }) {
  const initials = name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() || "").join("");
  const idx = Math.abs([...name].reduce((a, c) => a + c.charCodeAt(0), 0)) % AVATAR_COLORS.length;
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full font-display font-semibold ${AVATAR_COLORS[idx]}`}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {initials || "?"}
    </span>
  );
}

export function EmptyState({ icon = "📒", title, hint, action }) {
  return (
    <div className="card flex flex-col items-center justify-center px-6 py-14 text-center">
      <div className="text-4xl mb-3">{icon}</div>
      <h3 className="font-display text-lg text-ink">{title}</h3>
      {hint && <p className="mt-1 max-w-sm text-sm text-muted">{hint}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Stat({ label, children, sub, tone = "ink" }) {
  const toneClass = tone === "brand" ? "text-brand" : "text-ink";
  return (
    <div className="card p-4 sm:p-5">
      <div className="label mb-2">{label}</div>
      <div className={`font-mono text-xl sm:text-2xl font-semibold tnum ${toneClass}`}>{children}</div>
      {sub && <div className="mt-1 text-xs text-muted">{sub}</div>}
    </div>
  );
}
