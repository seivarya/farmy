# Farmy

An integrated crop procurement and Minimum Support Price (MSP) operations platform. Designed for state and national agricultural workflows, **Farmy** streamlines farmer registration, produce intake intake verification, weighbridge slot scheduling, and administrative governance.

---

## Key Features

- **Farmer Identification & Verification**: OTP-based mobile authentication paired with encrypted identity verification.
- **Produce Intake Desk**: Guided submission for produce delivery, generating traceable procurement tickets.
- **Smart Slot Scheduling**: Time-slot reservation engine with capacity tracking and oversubscription prevention.
- **Token & Ticket Tracker**: Status discovery for weighbridge arrivals, moisture checks, and MSP settlement.
- **Multi-Language Portal**: Live translation for **29 Indian regional & official languages**, prioritizing English, Telugu, and Hindi.
- **Administrative Console**: Role-based access control (RBAC) for procurement officers to verify submissions and manage intake quotas.

---

## System Architecture

```text
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React 19 + Vite)                │
│    • Farmer Portal  • Slot Scheduler  • Admin Console        │
│    • i18n Engine (29 Indian Languages)  • Status Tracker    │
└──────────────────────────────┬──────────────────────────────┘
                               │ JSON REST API
┌──────────────────────────────▼──────────────────────────────┐
│                    Backend (Node.js + Express)              │
│    • Auth & Token Service       • Slot Reservation Service  │
│    • Identity Registry (Crypto) • SMS / OTP Provider Hub    │
│    • RBAC Role Middleware       • Procurement Orchestrator  │
└──────────────────────────────┬──────────────────────────────┘
                               │ Mongoose ODM
┌──────────────────────────────▼──────────────────────────────┐
│                         MongoDB                             │
│    • Farmers   • Slots   • Tickets   • Settings   • Admins  │
└─────────────────────────────────────────────────────────────┘
```

---

## Core Modules

| Module | Location | Purpose |
| --- | --- | --- |
| **`frontend/`** | `React + Vite` | Farmer UI, service desk tiles, slot booking interface, multi-language switcher, admin portal. |
| **`backend/`** | `Node + Express + Mongoose` | REST API, AES-256 identity security, SMS dispatching, slot capacity controls, MongoDB models. |

---

## Quick Start

### Prerequisites
- **Node.js** (v18.0 or higher)
- **MongoDB** (v6.0 or higher running locally or a MongoDB Atlas URI)
- **npm** or **pnpm**

---

### 1. Clone & Configure

```bash
git clone https://github.com/seivarya/farmy.git
cd farmy
```

Set up environment variables:

```bash
# Backend configuration
cp backend/.env.example backend/.env

# Frontend configuration
cp frontend/.env.example frontend/.env
```

---

### 2. Start the Backend

```bash
cd backend
npm install
npm run dev
```

*The API server starts at `http://localhost:6767`.*

---

### 3. Start the Frontend

In a separate terminal:

```bash
cd frontend
npm install
npm run dev
```

*The client app opens at `http://localhost:5173`.*

---

## Directory Structure

```text
farmy/
├── backend/
│   ├── src/
│   │   ├── config/          # Database connection, CORS settings
│   │   ├── controllers/     # Route request handlers
│   │   ├── middleware/      # Auth, RBAC roles, rate limiting, error handling
│   │   ├── models/          # Mongoose schemas with compound & partial indexes
│   │   ├── routes/          # Express route definitions
│   │   ├── services/        # Business logic (OTP, slots, tickets, tokens)
│   │   └── utils/           # AES encryption, identity hashing, formatters
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/             # Axios API clients (farmer & admin)
│   │   ├── components/      # UI modules (auth, slots, demand, admin, layout)
│   │   ├── context/         # AuthContext, LanguageContext
│   │   ├── data/            # MSP matrix, crop demand data, 29 Indian languages
│   │   ├── pages/           # Route views (Landing, Slots, Tickets, Admin)
│   │   └── styles/          # Design system tokens and global CSS
│   └── package.json
│
├── README.md
└── .env.example
```

---

## Security & Concurrency Design

- **Aadhaar Protection**: Aadhaar numbers are encrypted at rest using AES-256-GCM. Uniqueness is enforced via deterministic SHA-256 identity fingerprints across farmer and admin registries.
- **Slot Race Condition Prevention**: Center time slots enforce sequential capacity indexes in MongoDB to prevent double-booking or oversubscription under concurrent load.
- **Duplicate Ticket Guard**: Partial unique indexes prevent concurrent active intake tickets for the same crop and farmer.

---

## License

This project is licensed under the ISC License.