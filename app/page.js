"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useStore, supplierTotal, isSameMonth } from "@/components/StoreProvider";
import { Money, Avatar, EmptyState, Stat } from "@/components/ui";
import Modal from "@/components/Modal";
import { formatINR, todayInput } from "@/lib/format";

export default function HomePage() {
  const { ready, suppliers, purchases, addSupplier, addPurchase } = useStore();
  const [q, setQ] = useState("");
  const [showPurchase, setShowPurchase] = useState(false);
  const [showSupplier, setShowSupplier] = useState(false);

  const grandTotal = useMemo(() => purchases.reduce((a, p) => a + p.amount, 0), [purchases]);
  const monthTotal = useMemo(
    () => purchases.filter((p) => isSameMonth(p.date)).reduce((a, p) => a + p.amount, 0),
    [purchases]
  );

  const rows = useMemo(
    () =>
      suppliers
        .filter((s) => s.name.toLowerCase().includes(q.toLowerCase()) || s.phone.includes(q))
        .map((s) => ({ ...s, total: supplierTotal(purchases, s.id) }))
        .sort((a, b) => b.total - a.total),
    [suppliers, purchases, q]
  );

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl text-ink">Purchases</h1>
          <p className="text-sm text-muted mt-0.5">How much stock you bought, supplier-wise</p>
        </div>
        <button className="btn-primary hidden sm:inline-flex" onClick={() => setShowPurchase(true)}>
          <PlusIcon /> Add purchase
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <Stat label="Total purchased" tone="brand" sub={`${suppliers.length} suppliers`}>{formatINR(grandTotal)}</Stat>
        <Stat label="This month" sub="Purchases this month">{formatINR(monthTotal)}</Stat>
      </div>

      <div className="flex gap-3">
        <input className="field flex-1" placeholder="Search supplier" value={q} onChange={(e) => setQ(e.target.value)} />
        <button className="btn-ghost shrink-0" onClick={() => setShowSupplier(true)}>+ Supplier</button>
      </div>

      {!ready ? (
        <div className="space-y-2">{[0, 1, 2].map((i) => <div key={i} className="card h-16 animate-pulse opacity-60" />)}</div>
      ) : rows.length === 0 ? (
        <EmptyState
          icon="🧾"
          title={suppliers.length === 0 ? "Start your purchase book" : "No matching suppliers"}
          hint={suppliers.length === 0 ? "Add a supplier (trader) and record how much stock you purchased from them." : "Try a different name."}
          action={
            suppliers.length === 0 && (
              <button className="btn-primary" onClick={() => setShowSupplier(true)}><PlusIcon /> Add first supplier</button>
            )
          }
        />
      ) : (
        <div className="card divide-y divide-line overflow-hidden">
          {rows.map((s) => (
            <Link key={s.id} href={`/supplier/${s.id}`} className="flex items-center gap-3 px-4 py-3.5 transition hover:bg-paper/70">
              <Avatar name={s.name} />
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium text-ink">{s.name}</div>
                <div className="text-xs text-muted">{s.phone || "Tap to see purchases"}</div>
              </div>
              <div className="text-right">
                <Money value={s.total} className="font-semibold text-ink" />
                <div className="text-[11px] text-muted">purchased</div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Floating add button on mobile */}
      <button onClick={() => setShowPurchase(true)} className="sm:hidden fixed bottom-5 right-5 z-30 btn-primary shadow-pop rounded-full h-14 w-14 p-0" aria-label="Add purchase">
        <PlusIcon big />
      </button>

      <PurchaseModal
        open={showPurchase}
        onClose={() => setShowPurchase(false)}
        suppliers={suppliers}
        addSupplier={addSupplier}
        addPurchase={addPurchase}
      />
      <SupplierModal open={showSupplier} onClose={() => setShowSupplier(false)} addSupplier={addSupplier} />
    </div>
  );
}

function PurchaseModal({ open, onClose, suppliers, addSupplier, addPurchase }) {
  const [supplierId, setSupplierId] = useState("");
  const [newName, setNewName] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(todayInput());
  const [note, setNote] = useState("");

  const reset = () => { setSupplierId(""); setNewName(""); setAmount(""); setDate(todayInput()); setNote(""); };
  const close = () => { reset(); onClose(); };

  const usingNew = supplierId === "__new__" || suppliers.length === 0;
  const canSave = Number(amount) > 0 && (usingNew ? newName.trim() : supplierId);

  const save = () => {
    if (!canSave) return;
    let sid = supplierId;
    if (usingNew) sid = addSupplier({ name: newName });
    addPurchase({ supplierId: sid, amount, date: new Date(date).toISOString(), note });
    reset();
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={close}
      title="Add purchase"
      footer={
        <>
          <button className="btn-ghost flex-1" onClick={close}>Cancel</button>
          <button className="btn-primary flex-1" onClick={save} disabled={!canSave}>Save</button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="label">Supplier</label>
          {suppliers.length > 0 ? (
            <select className="field" value={usingNew ? "__new__" : supplierId} onChange={(e) => setSupplierId(e.target.value)}>
              <option value="">Select supplier…</option>
              {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              <option value="__new__">+ New supplier</option>
            </select>
          ) : (
            <p className="text-xs text-muted">No suppliers yet — enter a new one below.</p>
          )}
          {usingNew && (
            <input className="field mt-2" placeholder="New supplier name (e.g. A Traders)" value={newName} onChange={(e) => setNewName(e.target.value)} autoFocus />
          )}
        </div>
        <div>
          <label className="label">Purchase amount (₹)</label>
          <input className="field font-mono text-lg" inputMode="decimal" placeholder="0" value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))} />
        </div>
        <div>
          <label className="label">Date</label>
          <input type="date" className="field" value={date} max={todayInput()} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div>
          <label className="label">Note (optional)</label>
          <input className="field" placeholder="e.g. rice bags, monthly stock" value={note} onChange={(e) => setNote(e.target.value)} />
        </div>
      </div>
    </Modal>
  );
}

function SupplierModal({ open, onClose, addSupplier }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const close = () => { setName(""); setPhone(""); onClose(); };
  const save = () => { if (!name.trim()) return; addSupplier({ name, phone }); close(); };
  return (
    <Modal
      open={open}
      onClose={close}
      title="Add supplier"
      footer={
        <>
          <button className="btn-ghost flex-1" onClick={close}>Cancel</button>
          <button className="btn-primary flex-1" onClick={save} disabled={!name.trim()}>Save</button>
        </>
      }
    >
      <div className="space-y-4">
        <div><label className="label">Supplier / trader name</label><input className="field" placeholder="e.g. A Traders" value={name} onChange={(e) => setName(e.target.value)} autoFocus /></div>
        <div><label className="label">Phone (optional)</label><input className="field" placeholder="Mobile number" inputMode="numeric" value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
      </div>
    </Modal>
  );
}

function PlusIcon({ big = false }) {
  const s = big ? 26 : 18;
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
  );
}
