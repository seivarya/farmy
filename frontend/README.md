# Farmy Frontend

The web client for **Farmy** — a modern procurement portal and Minimum Support Price (MSP) operations interface built for farmers and procurement officers.

---

## Tech Stack

- **Framework**: [React 19](https://react.dev/)
- **Bundler & Tooling**: [Vite](https://vitejs.dev/)
- **Routing**: [React Router 7](https://reactrouter.com/) (Data router + lazy-loaded page chunks)
- **HTTP Client**: [Axios](https://axios-http.com/)
- **Styling**: Vanilla CSS Design System with CSS Custom Properties, semantic color palettes, and glassmorphism accents (no utility-class overhead).

---

## Features

### 1. Multi-Language Portal (29 Indian Languages)
- Instant access to **29 Indian regional & official languages**.
- **English**, **Telugu (తెలుగు)**, and **Hindi (हिन्दी)** pinned as primary options at the top, followed by 26+ state languages.
- Live search filter and persistent state across page reloads and route navigation.

### 2. Farmer Authentication & Onboarding
- Mobile-first OTP registration and login with SMS verification.
- Validated Aadhaar, bank account, and land holding detail forms.

### 3. Procurement Service Hub
Interactive dashboard tiles providing one-click access to:
- **Crop In Demand**: National procurement targets, deficits, and price thresholds.
- **MSP Price Matrix**: Official Minimum Support Price reference schedule.
- **Produce Intake Form**: Multi-step submission generating trackable intake tickets.
- **Slot Reservation**: Live weighbridge time-slot picker with real-time remaining capacity indicators.
- **Ticket Status Tracker**: One-time token status verification.
- **Administrator Desk**: Dedicated officer portal for inspection and intake approval.

---

## Directory Layout

```text
frontend/src/
├── api/
│   ├── admin.js             # Admin management endpoints
│   ├── adminClient.js       # Admin Axios instance with token interceptors
│   ├── auth.js              # Farmer OTP & registration endpoints
│   ├── client.js            # Farmer Axios instance
│   ├── procurements.js      # Produce intake submissions
│   ├── slots.js             # Slot reservation and capacity endpoints
│   └── tickets.js           # Ticket lifecycle queries
│
├── components/
│   ├── admin/               # Admin ticket list, detail view, settings
│   ├── auth/                # Registration & login forms, OTP inputs
│   ├── common/              # BrandLogo, Icons, InputField, LanguageSelector
│   ├── dashboard/           # DashboardHeader, ServiceGrid, service cards
│   ├── demand/              # Crop cards, target hero, filters
│   ├── layout/              # AuthLayout, panel shells
│   ├── notifications/       # Farmer in-app notification dropdown
│   ├── procurement/         # Produce intake submission form
│   ├── schedule/            # MSP rate table and matrix
│   └── slots/               # SlotBookingPanel, BookingList, SlotHeader
│
├── context/
│   ├── AuthContext.jsx      # Farmer authentication state
│   └── LanguageContext.jsx  # Multi-language translation state & cookies
│
├── data/
│   ├── crops.js             # Crop targets, MSP values, categories
│   ├── dashboardServices.js # Service desk tiles metadata
│   └── languages.js         # 29 Indian languages definitions
│
├── hooks/
│   ├── useAuth.js           # Auth context consumer hook
│   └── useLanguage.js       # Language context consumer hook
│
├── pages/                   # Route views (Landing, Dashboard, Admin, Form, etc.)
├── styles/                  # Global CSS reset and design tokens (variables.css)
├── App.jsx                  # Route definitions and route guards
└── main.jsx                 # Application entry point & context providers
```

---

## Getting Started

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

| Variable | Description | Default |
| --- | --- | --- |
| `VITE_API_URL` | Base URL for backend REST API | `http://localhost:6767/api` |

### 3. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:5173` in your browser.

---

## Build & Preview

```bash
# Compile optimized production bundle
npm run build

# Preview production build locally
npm run preview
```
