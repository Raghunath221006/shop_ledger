"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useStore, supplierTotal } from "@/components/StoreProvider";
import { Money, Avatar, EmptyState } from "@/components/ui";
import Modal from "@/components/Modal";
import { formatINR, formatDate, todayInput } from "@/lib/format";

export default function SupplierPage() {
  const { id } = useParams();
  const router = useRouter();
  const { ready, suppliers, purchases, addPurchase, deletePurchase, updateSupplier, deleteSupplier } = useStore();

  const supplier = suppliers.find((s) => s.id === id);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);

  const entries = useMemo(
    () => purchases.filter((p) => p.supplierId === id).sort((a, b) => new Date(b.date) - new Date(a.date)),
    [purchases, id]
  );
  const total = supplier ? supplierTotal(purchases, id) : 0;

  if (ready && !supplier) {
    return <EmptyState icon="🔍" title="Supplier not found" hint="It may have been deleted." action={<Link href="/" className="btn-primary">Back</Link>} />;
  }

  return (
    <div className="space-y-5">
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-ink">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="m15 18-6-6 6-6" /></svg>
        All suppliers
      </Link>

      <div className="card p-5">
        <div className="flex items-start gap-4">
          <Avatar name={supplier?.name || "?"} size={56} />
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-xl text-ink truncate">{supplier?.name}</h1>
            <div className="mt-1 text-sm text-muted">{supplier?.phone || "No phone"}</div>
          </div>
          <button className="rounded-lg p-2 text-muted hover:bg-paper hover:text-ink" onClick={() => setShowEdit(true)} aria-label="Edit supplier">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" /></svg>
          </button>
        </div>
        <div className="mt-5 flex items-center justify-between rounded-xl bg-brand-tint px-4 py-3">
          <span className="text-sm font-medium text-brand-dark">Total purchased</span>
          <Money value={total} className="text-xl font-semibold text-brand-dark" />
        </div>
      </div>

      {entries.length === 0 ? (
        <EmptyState icon="🧮" title="No purchases yet" hint="Record what you bought from this supplier." />
      ) : (
        <div className="card overflow-hidden">
          <div className="border-b border-line bg-paper/60 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-muted">
            {entries.length} purchase{entries.length > 1 ? "s" : ""}
          </div>
          <div className="divide-y divide-line">
            {entries.map((p) => (
              <div key={p.id} className="group flex items-center gap-3 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <div className="text-sm text-ink truncate">{p.note || "Stock purchase"}</div>
                  <div className="flex items-center gap-2 text-[11px] text-muted">
                    <span>{formatDate(p.date)}</span>
                    <button onClick={() => deletePurchase(p.id)} className="opacity-0 group-hover:opacity-100 text-give hover:underline">delete</button>
                  </div>
                </div>
                <Money value={p.amount} className="font-semibold text-ink" />
              </div>
            ))}
          </div>
        </div>
      )}

      <button className="btn-primary w-full" onClick={() => setShowAdd(true)}>+ Add purchase</button>
      <button onClick={() => setConfirmDel(true)} className="text-sm text-muted hover:text-give">Delete this supplier</button>

      <AddPurchaseModal open={showAdd} onClose={() => setShowAdd(false)} onSave={(payload) => { addPurchase({ ...payload, supplierId: id }); setShowAdd(false); }} />
      <EditSupplierModal open={showEdit} supplier={supplier} onClose={() => setShowEdit(false)} onSave={(patch) => { updateSupplier(id, patch); setShowEdit(false); }} />

      <Modal
        open={confirmDel}
        onClose={() => setConfirmDel(false)}
        title="Delete supplier?"
        footer={
          <>
            <button className="btn-ghost flex-1" onClick={() => setConfirmDel(false)}>Keep</button>
            <button className="btn-give flex-1" onClick={() => { deleteSupplier(id); router.push("/"); }}>Delete</button>
          </>
        }
      >
        <p className="text-sm text-muted">This removes <span className="font-semibold text-ink">{supplier?.name}</span> and all their purchase records. This cannot be undone.</p>
      </Modal>
    </div>
  );
}

function AddPurchaseModal({ open, onClose, onSave }) {
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(todayInput());
  const [note, setNote] = useState("");
  const reset = () => { setAmount(""); setDate(todayInput()); setNote(""); };
  const close = () => { reset(); onClose(); };
  const save = () => { if (!Number(amount)) return; onSave({ amount, date: new Date(date).toISOString(), note }); reset(); };
  return (
    <Modal open={open} onClose={close} title="Add purchase"
      footer={<><button className="btn-ghost flex-1" onClick={close}>Cancel</button><button className="btn-primary flex-1" onClick={save} disabled={!Number(amount)}>Save</button></>}
    >
      <div className="space-y-4">
        <div><label className="label">Purchase amount (₹)</label><input className="field font-mono text-lg" inputMode="decimal" placeholder="0" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))} autoFocus /></div>
        <div><label className="label">Date</label><input type="date" className="field" value={date} max={todayInput()} onChange={(e) => setDate(e.target.value)} /></div>
        <div><label className="label">Note (optional)</label><input className="field" placeholder="e.g. rice bags, monthly stock" value={note} onChange={(e) => setNote(e.target.value)} /></div>
      </div>
    </Modal>
  );
}

function EditSupplierModal({ open, supplier, onClose, onSave }) {
  const [form, setForm] = useState(null);
  if (open && form === null && supplier) setForm({ name: supplier.name, phone: supplier.phone || "" });
  if (!open && form !== null) setForm(null);
  if (!form) return <Modal open={open} onClose={onClose} title="Edit supplier"><div /></Modal>;
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  return (
    <Modal open={open} onClose={onClose} title="Edit supplier"
      footer={<><button className="btn-ghost flex-1" onClick={onClose}>Cancel</button><button className="btn-primary flex-1" onClick={() => onSave(form)} disabled={!form.name.trim()}>Save</button></>}
    >
      <div className="space-y-4">
        <div><label className="label">Name</label><input className="field" value={form.name} onChange={set("name")} /></div>
        <div><label className="label">Phone</label><input className="field" value={form.phone} onChange={set("phone")} inputMode="numeric" /></div>
      </div>
    </Modal>
  );
}
