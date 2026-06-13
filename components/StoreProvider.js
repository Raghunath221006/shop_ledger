"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { uid } from "@/lib/format";

const KEY = "purchase-khata-v1";

const DEFAULT_DATA = {
  shop: { name: "My Business" },
  suppliers: [],
  purchases: [], // { id, supplierId, amount, date, note, createdAt }
};

function loadData() {
  if (typeof window === "undefined") return DEFAULT_DATA;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return DEFAULT_DATA;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_DATA,
      ...parsed,
      shop: { ...DEFAULT_DATA.shop, ...(parsed.shop || {}) },
    };
  } catch {
    return DEFAULT_DATA;
  }
}

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const [data, setData] = useState(DEFAULT_DATA);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setData(loadData());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(KEY, JSON.stringify(data));
    } catch {
      /* storage disabled — still works in-session */
    }
  }, [data, ready]);

  const updateShop = useCallback((patch) => {
    setData((d) => ({ ...d, shop: { ...d.shop, ...patch } }));
  }, []);

  const addSupplier = useCallback((supplier) => {
    const id = uid("s");
    setData((d) => ({
      ...d,
      suppliers: [
        ...d.suppliers,
        {
          id,
          name: supplier.name?.trim() || "Unnamed",
          phone: supplier.phone?.trim() || "",
          createdAt: new Date().toISOString(),
        },
      ],
    }));
    return id;
  }, []);

  const updateSupplier = useCallback((id, patch) => {
    setData((d) => ({
      ...d,
      suppliers: d.suppliers.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    }));
  }, []);

  const deleteSupplier = useCallback((id) => {
    setData((d) => ({
      ...d,
      suppliers: d.suppliers.filter((s) => s.id !== id),
      purchases: d.purchases.filter((p) => p.supplierId !== id),
    }));
  }, []);

  const addPurchase = useCallback((purchase) => {
    const id = uid("pu");
    setData((d) => ({
      ...d,
      purchases: [
        ...d.purchases,
        {
          id,
          supplierId: purchase.supplierId,
          amount: Math.max(0, Number(purchase.amount) || 0),
          note: purchase.note?.trim() || "",
          date: purchase.date || new Date().toISOString(),
          createdAt: new Date().toISOString(),
        },
      ],
    }));
    return id;
  }, []);

  const deletePurchase = useCallback((id) => {
    setData((d) => ({ ...d, purchases: d.purchases.filter((p) => p.id !== id) }));
  }, []);

  const exportData = useCallback(() => JSON.stringify(data, null, 2), [data]);
  const importData = useCallback((json) => {
    try {
      const parsed = typeof json === "string" ? JSON.parse(json) : json;
      setData({
        ...DEFAULT_DATA,
        ...parsed,
        shop: { ...DEFAULT_DATA.shop, ...(parsed.shop || {}) },
      });
      return true;
    } catch {
      return false;
    }
  }, []);
  const resetData = useCallback(() => setData(DEFAULT_DATA), []);

  const value = {
    ready,
    data,
    shop: data.shop,
    suppliers: data.suppliers,
    purchases: data.purchases,
    updateShop,
    addSupplier,
    updateSupplier,
    deleteSupplier,
    addPurchase,
    deletePurchase,
    exportData,
    importData,
    resetData,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}

// total purchased from a supplier
export function supplierTotal(purchases, supplierId) {
  return purchases
    .filter((p) => p.supplierId === supplierId)
    .reduce((acc, p) => acc + p.amount, 0);
}

export function isSameMonth(iso, ref = new Date()) {
  const d = new Date(iso);
  return d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth();
}
