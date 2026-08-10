# ☀️ SolarGrid — Mini ERP + CRM Operations Portal

> **Hiring Assignment Implementation**: Mini ERP + CRM Operations Portal built for Solar Equipment Wholesale & Distribution.

---

## 📁 Workspace Architecture & Folder Structure

The application is structured into two main modules: `backend` and `frontend`.

```
solargrid/
├── backend/                          # Express.js REST API Server
│   ├── src/
│   │   ├── config/env.ts             # JWT & Server Config
│   │   ├── db/                       # Database Store Engine & Seed Script
│   │   ├── middleware/               # Auth, Error Handling & Audit Middleware
│   │   ├── services/                 # Pure Business Logic & DB Transactions
│   │   ├── controllers/              # HTTP Request/Response Controllers
│   │   ├── routes/index.ts           # REST API Routes
│   │   └── types/index.ts            # Backend Domain Types
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                         # React 18 + Vite SPA
│   ├── src/
│   │   ├── components/               # Maps, Topbar, Sidebar, UI Components
│   │   ├── lib/                      # API Client & Auth Context
│   │   ├── pages/                    # Auth, Customer, Admin, Sales, Warehouse & Technician Pages
│   │   ├── types/                    # Frontend Data Models
│   │   └── App.tsx                   # Master App Router
│   ├── package.json
│   ├── vite.config.ts
│   └── index.html
│
├── postman/                          # Postman API Test Collection
│   └── SolarGrid_API.postman_collection.json
├── .env.example                      # Environment variables template
├── README.md                         # Complete project documentation
└── package.json                      # Monorepo root launcher
```

---

## 🚀 Live Demo & Test Login Credentials

| Role Profile | Test Email | Password | Access Rights |
| :--- | :--- | :--- | :--- |
| **ADMIN** | `admin@solargrid.com` | `password123` | Full access to Users, Stock, Orders, Challans, Crews, & Audit Logs. |
| **SALES** | `sales@solargrid.com` | `password123` | Customer CRM, Follow-ups, Product Catalog, Orders & Draft Challans. |
| **WAREHOUSE** | `warehouse@solargrid.com` | `password123` | Stock Level Management, Stock Movements (IN/OUT), Min-Stock Alerts. |
| **ACCOUNTS** | `accounts@solargrid.com` | `password123` | Confirmed Sales Challans & Customer Transaction Records. |
| **TECHNICIAN** | `tech@solargrid.com` | `password123` | Assigned Installation & Service Route, Field Checklist, Parts Usage. |
| **CUSTOMER** | `aarav@mehtagroup.in` | `password123` | Equipment Store, Cart, Installation Option, Warranties & Service Booking. |

---

## 💻 Local Execution Commands

### 1. Backend REST API
```bash
cd backend
npm install
npm run seed     # Seed database with sample test accounts & products
npm run dev      # Start Express REST server on http://localhost:5000/api
```

### 2. Frontend React Application
```bash
cd frontend
npm install
npm run dev      # Start Vite dev server on http://localhost:5173
```

### 3. Root Workspace Commands
```bash
npm run dev:backend     # Start backend REST API
npm run dev:frontend    # Start frontend SPA
npm run build:frontend  # Build production bundle
```

---

## 🗄️ Database Architecture & Data Security

SolarGrid uses **PostgreSQL** as its primary production relational database engine.

- **PostgreSQL Connection**: Configured via `DATABASE_URL` in `backend/.env` (e.g. `postgresql://postgres:password@localhost:5432/solargrid`).
- **Data Security & Privacy**: Local database file snapshots (`solargrid_db.json`) and `.env` credentials are listed in [.gitignore](file:///.gitignore) to ensure sensitive customer data, user accounts, and credentials are never exposed or committed to public code repositories.

---

## 🌐 Deployment Guide (Render & Vercel)

### 🖥️ 1. Backend Deployment on Render
1. Go to **[Render Dashboard](https://dashboard.render.com)** -> **New Web Service**.
2. Connect your GitHub repository and set **Root Directory** to `backend`.
3. Configure build settings:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
4. Add **Environment Variables**:
   - `DATABASE_URL`: `postgresql://neondb_owner:npg_lBwyQaR2YVk7@ep-super-cell-ayw0d0wf.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require`
   - `JWT_SECRET`: `solargrid_production_jwt_secret_key_2026`
   - `NODE_ENV`: `production`
5. Click **Create Web Service**. Your backend live URL will be generated (e.g. `https://solargrid-api.onrender.com`).

---

### 🎨 2. Frontend Deployment on Vercel
1. Go to **[Vercel Dashboard](https://vercel.com/new)** -> **Import Git Repository**.
2. Set **Root Directory** to `frontend`.
3. Framework Preset: **Vite**.
4. Add **Environment Variables**:
   - `VITE_API_URL`: `https://solargrid-api.onrender.com/api` (your Render backend API URL).
5. Click **Deploy**. Vercel will build and serve your global production web application!
