// Indian-locale formatting helpers

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

const inrCompact = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const num = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

export function formatINR(amount) {
  const n = Number(amount) || 0;
  return inr.format(n);
}

export function formatINRCompact(amount) {
  const n = Number(amount) || 0;
  return inrCompact.format(n);
}

// "1,23,456" style without symbol — for inputs / CSV
export function formatNum(amount) {
  return num.format(Number(amount) || 0);
}

// Words approximation (Lakh / Crore) — handy on big totals
export function inWords(amount) {
  const n = Math.abs(Number(amount) || 0);
  if (n >= 1e7) return `${(n / 1e7).toFixed(2)} Cr`;
  if (n >= 1e5) return `${(n / 1e5).toFixed(2)} L`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)} K`;
  return num.format(n);
}

export function formatDate(d) {
  if (!d) return "";
  const date = new Date(d);
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(d) {
  if (!d) return "";
  const date = new Date(d);
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// yyyy-mm-dd for <input type=date>
export function toDateInput(d) {
  const date = d ? new Date(d) : new Date();
  const off = date.getTimezoneOffset();
  const local = new Date(date.getTime() - off * 60000);
  return local.toISOString().slice(0, 10);
}

export function todayInput() {
  return toDateInput(new Date());
}

export function uid(prefix = "id") {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return `${prefix}_${crypto.randomUUID().slice(0, 8)}`;
  }
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}
