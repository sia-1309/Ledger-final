# Accounts Ledger

Multi-user financial management app for shops. Built with React 19 + Supabase + Tailwind CSS.

## Features

- **Auth**: Email/password signup & login with Supabase
- **Dashboard**: KPI cards, alerts, quick actions, recent transactions
- **Suppliers**: CRUD, transactions, payments, balance tracking
- **Customers**: CRUD, sales invoices, receipts, balance tracking
- **Expenses**: CRUD, category breakdown, monthly trends, CSV export
- **Inventory**: CRUD, stock status, valuation, low stock alerts
- **Reports**: 5 tabs (Executive Summary, Supplier, Customer, Expense, Inventory), CSV export
- **Settings**: Shop config, theme toggle, backup/restore, data reset
- **3D Animations**: Loading spinner, card flip, floating cube, hover tilt (Three.js + Framer Motion)

## Setup

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Environment

Copy `.env.example` to `.env` and fill in your Supabase credentials.

## Database

The SQL schema is in `supabase/schema.sql`. Run it in the Supabase SQL Editor.

## Build

```bash
npm run build
npm run preview
```

## Test

```bash
npm test
```
