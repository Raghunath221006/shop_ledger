"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStore } from "@/components/StoreProvider";

function Icon({ name, className = "w-5 h-5" }) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 1.9, strokeLinecap: "round", strokeLinejoin: "round", viewBox: "0 0 24 24", className };
  switch (name) {
    case "book":
      return <svg {...common}><path d="M4 5a2 2 0 0 1 2-2h12v18H6a2 2 0 0 1-2-2z" /><path d="M8 3v18M8 8h8M8 12h8" /></svg>;
    case "gear":
      return <svg {...common}><circle cx="12" cy="12" r="3.2" /><path d="M12 2.5v2.6M12 18.9v2.6M21.5 12h-2.6M5.1 12H2.5M18.4 5.6l-1.8 1.8M7.4 16.6l-1.8 1.8M18.4 18.4l-1.8-1.8M7.4 7.4 5.6 5.6" /></svg>;
    default:
      return null;
  }
}

const NAV = [
  { href: "/", label: "Purchases", icon: "book" },
  { href: "/settings", label: "Settings", icon: "gear" },
];

export default function Shell({ children }) {
  const pathname = usePathname();
  const { shop } = useStore();
  const isActive = (href) => (href === "/" ? pathname === "/" || pathname.startsWith("/supplier") : pathname.startsWith(href));

  return (
    <div className="min-h-screen lg:flex">
      <aside className="no-print hidden lg:flex w-60 shrink-0 flex-col border-r border-line bg-surface/70 px-4 py-6">
        <div className="px-2 mb-8"><Brand shopName={shop?.name} /></div>
        <nav className="flex flex-col gap-1">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${isActive(n.href) ? "bg-brand-tint text-brand-dark" : "text-muted hover:bg-paper hover:text-ink"}`}>
              <Icon name={n.icon} />{n.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto px-3 pt-6 text-xs text-muted">Data stays on this device.</div>
      </aside>

      <header className="no-print lg:hidden sticky top-0 z-30 flex items-center justify-between border-b border-line bg-surface/90 px-4 py-3 backdrop-blur">
        <Brand shopName={shop?.name} />
        <Link href="/settings" className={`rounded-lg p-2 ${pathname.startsWith("/settings") ? "text-brand" : "text-muted"}`} aria-label="Settings">
          <Icon name="gear" />
        </Link>
      </header>

      <main className="flex-1 pb-10">
        <div className="mx-auto w-full max-w-3xl px-4 py-5 sm:py-8">{children}</div>
      </main>
    </div>
  );
}

function Brand({ shopName }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand text-white font-display text-lg shadow-card">₹</span>
      <div className="leading-tight">
        <div className="font-display text-base text-ink">{shopName || "My Business"}</div>
        <div className="text-[11px] uppercase tracking-widest text-brass">Purchase Khata</div>
      </div>
    </div>
  );
}
