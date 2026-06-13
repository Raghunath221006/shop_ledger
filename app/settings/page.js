"use client";

import { useRef, useState } from "react";
import { useStore, supplierTotal } from "@/components/StoreProvider";
import { formatDate } from "@/lib/format";
import Modal from "@/components/Modal";

export default function SettingsPage() {
  const { shop, updateShop, suppliers, purchases, exportData, importData, resetData } = useStore();
  const [confirmReset, setConfirmReset] = useState(false);
  const fileRef = useRef(null);

  const backup = () => {
    const blob = new Blob([exportData()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `purchase-khata-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const restore = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => alert(importData(reader.result) ? "Backup restored." : "Could not read that backup file.");
    reader.readAsText(file);
    e.target.value = "";
  };

  const exportCSV = () => {
    const name = (id) => suppliers.find((s) => s.id === id)?.name || "—";
    const header = ["Date", "Supplier", "Note", "Amount"];
    const rows = [...purchases]
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map((p) => [formatDate(p.date), `"${name(p.supplierId).replace(/"/g, '""')}"`, `"${(p.note || "").replace(/"/g, '""')}"`, p.amount].join(","));
    // append supplier totals
    rows.push("");
    rows.push("Supplier,Total Purchased");
    suppliers.forEach((s) => rows.push(`"${s.name.replace(/"/g, '""')}",${supplierTotal(purchases, s.id)}`));
    const csv = [header.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `purchases.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl text-ink">Settings</h1>
        <p className="text-sm text-muted mt-0.5">Manage your purchase book</p>
      </div>

      <div className="card p-5 space-y-4">
        <h2 className="font-display text-lg text-ink">Business</h2>
        <div>
          <label className="label">Business name</label>
          <input className="field" value={shop.name} onChange={(e) => updateShop({ name: e.target.value })} placeholder="My Business" />
          <p className="mt-1.5 text-xs text-muted">Saves automatically.</p>
        </div>
      </div>

      <div className="card p-5 space-y-4">
        <h2 className="font-display text-lg text-ink">Data</h2>
        <p className="text-sm text-muted">Your records live in this browser on this device. Export or back them up regularly.</p>
        <div className="flex flex-wrap gap-3">
          <button className="btn-ghost" onClick={exportCSV} disabled={purchases.length === 0}>Export CSV</button>
          <button className="btn-ghost" onClick={backup}>Download backup (.json)</button>
          <button className="btn-ghost" onClick={() => fileRef.current?.click()}>Restore from file</button>
          <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={restore} />
        </div>
        <div className="grid grid-cols-2 gap-3 text-center pt-2 sm:max-w-xs">
          <Counter n={suppliers.length} label="Suppliers" />
          <Counter n={purchases.length} label="Purchases" />
        </div>
      </div>

      <div className="card p-5 space-y-3 border-give/30">
        <h2 className="font-display text-lg text-give">Danger zone</h2>
        <p className="text-sm text-muted">Erase all suppliers and purchases from this device.</p>
        <button className="btn-give" onClick={() => setConfirmReset(true)}>Reset all data</button>
      </div>

      <p className="text-center text-xs text-muted pt-2">Purchase Khata · runs entirely in your browser</p>

      <Modal
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        title="Reset all data?"
        footer={<><button className="btn-ghost flex-1" onClick={() => setConfirmReset(false)}>Cancel</button><button className="btn-give flex-1" onClick={() => { resetData(); setConfirmReset(false); }}>Erase everything</button></>}
      >
        <p className="text-sm text-muted">Consider downloading a backup first. This cannot be undone.</p>
      </Modal>
    </div>
  );
}

function Counter({ n, label }) {
  return (
    <div className="rounded-xl bg-paper/70 py-3">
      <div className="font-mono text-xl font-semibold text-ink tnum">{n}</div>
      <div className="text-[11px] text-muted">{label}</div>
    </div>
  );
}
