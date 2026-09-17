# RYZORA Inventory

A modern mobile-first inventory & business management frontend built with Next.js, TypeScript and Supabase.

## Included
- Responsive dashboard
- Inventory/product list
- Stock overview and low-stock indicators
- Sales, purchases, customers, accounts, reports and settings module shells
- Supabase connection using the existing `public.products` table
- RYZORA premium-style UI
- Mobile bottom navigation

## Run on PC

1. Install Node.js LTS.
2. Extract this ZIP.
3. Open the project folder in Terminal/CMD.
4. Run:
   `npm install`
5. Copy `.env.example` to `.env.local`.
6. Put your Supabase URL and publishable key in `.env.local`.
7. Run:
   `npm run dev`
8. Open `http://localhost:3000`.

## Supabase
This starter uses the existing `public.products` table and expects these fields:
`id, name, sku, category, stock, minimum_stock, buy_price, sell_price, active`.

The database should also have the inventory stock movement table created previously.

## Next steps
- Add Supabase Auth login/logout
- Add Product create/edit forms
- Add atomic stock-in/stock-out RPC
- Build POS checkout and invoice
- Add purchases and supplier ledger
- Add customer due/ledger
- Add reports and export
- Add role/permission management
