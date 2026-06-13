# Purchase Khata — Supplier Purchase Book

A dead-simple app for traders to track **stock purchases supplier-wise**. No products, no customers, no payment history — just each supplier and how much you've purchased from them.

Example: *A Traders → ₹4,000*, *B Traders → ₹5,000*, with a running total.

Built with **Next.js 14**, runs **entirely in the browser** (no database), and deploys to Vercel with zero config.

## Features
- Add suppliers (traders) and log purchase amounts against them.
- Per-supplier total purchased + grand total + this-month total.
- Each purchase: amount, date, optional note. Delete any entry.
- Search suppliers; quick "Add purchase" (create a new supplier on the fly).
- Export everything to **CSV**; JSON backup & restore; reset.
- ₹ amounts with Indian lakh/crore grouping. Mobile-friendly.

## Run locally
```bash
npm install
npm run dev      # http://localhost:3000
```

## Deploy to Vercel
**Git:** push to GitHub → on vercel.com: *Add New → Project* → import repo → it auto-detects Next.js → **Deploy**.

**CLI:**
```bash
npm i -g vercel
vercel --prod
```
No environment variables or database needed.

## Data
Stored in the browser's `localStorage` on the device you use it on — private, never leaves the device. Use **Settings → Download backup** to move data to another device. To sync across devices/staff, replace `components/StoreProvider.js` with a database (e.g. Vercel Postgres or Supabase).

## Tech
Next.js 14 (App Router) · React 18 · Tailwind CSS.
