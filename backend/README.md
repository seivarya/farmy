# Farmy Backend

The REST API engine for **Farmy** — handles identity authentication, crop intake tickets, weighbridge slot scheduling, role-based administration, and tamper-resistant audit trails.

---

## Tech Stack

- **Runtime**: [Node.js](https://nodejs.org/) (v18+)
- **Server Framework**: [Express 5](https://expressjs.com/)
- **Database & ODM**: [MongoDB](https://www.mongodb.com/) via [Mongoose 9](https://mongoosejs.com/)
- **Authentication**: JWT (`jsonwebtoken`) & bcrypt password hashing
- **Cryptography**: Node `crypto` (AES-256-GCM authenticated encryption + SHA-256 deterministic fingerprinting)
- **SMS Integration**: Pluggable provider architecture (`mock`, `twilio`, `twilio_verify`, `fast2sms`)

---

## Architecture & Design Patterns

### 1. Identity Registry & Aadhaar Encryption
- Aadhaar numbers are encrypted at rest using **AES-256-GCM** with unique initialization vectors (IV) and authentication tags.
- Cross-collection uniqueness is guaranteed by an `IdentityRegistry` containing a one-way **SHA-256 fingerprint** of the Aadhaar number, preventing duplicate registrations without exposing plaintext identifiers.

### 2. Concurrency & Oversubscription Protection
- **Slot Capacity Guard**: Slots use booking sequence indexes to atomically increment reservations up to configured limits, preventing overbooking during concurrent booking spikes.
- **Active Ticket Constraints**: Partial unique indexes prevent farmers from creating multiple pending intake tickets for the same crop simultaneously.

### 3. Role-Based Access Control (RBAC)
Administrator routes enforce fine-grained role privileges:
- `super_admin`: Full system control, role updates, identity corrections, procurement settings.
- `procurement_officer`: Produce intake review, ticket status transitions (accept, reject, complete).
- `support_officer`: Farmer communications, SMS notifications, read-only inspection.
- `viewer`: Read-only statistics and reporting.

---

## API Reference

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
| --- | --- | --- | --- |
| `POST` | `/api/auth/send-otp` | Dispatch 6-digit OTP to farmer mobile | No |
| `POST` | `/api/auth/verify-otp` | Validate OTP against transient store | No |
| `POST` | `/api/auth/register` | Register new farmer with encrypted Aadhaar | No |
| `POST` | `/api/auth/login` | Log in existing farmer via verified mobile OTP | No |
| `GET` | `/api/auth/me` | Fetch authenticated farmer profile | Yes (Bearer Token) |

### Produce Intake & Tickets (`/api/procurements` & `/api/tickets`)
| Method | Endpoint | Description | Auth Required |
| --- | --- | --- | --- |
| `POST` | `/api/procurements` | Submit crop intake details & generate ticket | Yes |
| `GET` | `/api/tickets/my` | Retrieve all tickets for logged-in farmer | Yes |
| `GET` | `/api/tickets/:id` | Look up ticket details by ticket ID | Yes / Public Lookup |

### Slot Scheduling (`/api/slots`)
| Method | Endpoint | Description | Auth Required |
| --- | --- | --- | --- |
| `GET` | `/api/slots/availability` | Get available time slots and remaining capacity | Yes |
| `POST` | `/api/slots/book` | Reserve procurement time slot for accepted ticket | Yes |
| `GET` | `/api/slots/my-bookings` | List active and historical slot reservations | Yes |
| `PATCH` | `/api/slots/cancel/:id` | Cancel booked procurement slot | Yes |

### Administrator Operations (`/api/admin`)
| Method | Endpoint | Description | Role Required |
| --- | --- | --- | --- |
| `POST` | `/api/admin/signup` | Create administrator account | Admin Auth |
| `POST` | `/api/admin/login` | Authenticate admin via email & password | None |
| `GET` | `/api/admin/me` | Fetch authenticated admin details | Any Admin |
| `GET` | `/api/admin/tickets` | List procurement tickets with filters | Any Admin |
| `GET` | `/api/admin/tickets/:id` | Get comprehensive ticket inspection data | Any Admin |
| `PATCH` | `/api/admin/tickets/:id/status` | Update ticket status (`accepted`, `rejected`, etc.) | `procurement_officer`, `super_admin` |
| `GET/PUT` | `/api/admin/settings` | Retrieve or update slot configuration | `super_admin` |

---

## Directory Layout

```text
backend/src/
├── config/
│   ├── cors.js              # Allowed origin headers configuration
│   └── db.js                # MongoDB connection lifecycle & connection pooling
│
├── controllers/             # Express route controllers
│   ├── adminController.js
│   ├── authController.js
│   ├── procurementController.js
│   ├── slotController.js
│   └── ticketController.js
│
├── middleware/
│   ├── adminAuth.js         # JWT validator for admin requests
│   ├── auth.js              # JWT validator for farmer requests
│   ├── errorHandler.js      # Centralized error response serializer
│   ├── rateLimiter.js       # IP-based rate limiting (auth & API)
│   └── requireRole.js       # RBAC role authorization check
│
├── models/                  # Mongoose schemas with compound indexes
│   ├── Admin.js
│   ├── Farmer.js
│   ├── FarmerNotification.js
│   ├── IdentityRegistry.js
│   ├── Otp.js
│   ├── ProcurementSettings.js
│   ├── ProcurementSubmission.js
│   ├── ProcurementTicket.js
│   └── Slot.js
│
├── routes/                  # Express route routers
├── services/                # Business logic (OTP, SMS, slots, tickets, tokens)
├── utils/                   # Encryption, identity hashing, response formatters
├── app.js                   # Express application setup and middleware pipeline
└── server.js                # Server entry point & graceful shutdown hooks
```

---

## Getting Started

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Key environment variables:
- `PORT`: Server port (default `6767`).
- `MONGO_URI`: MongoDB connection string.
- `JWT_SECRET`: Secret key for JWT signing.
- `IDENTITY_ENCRYPTION_KEY`: 32-byte hex key for AES-256 identity encryption.
- `SMS_PROVIDER`: `mock` (for local development) or `twilio` / `fast2sms`.

### 3. Run the Server

```bash
# Development (with nodemon auto-restart)
npm run dev

# Production
npm start

# Identity registry integrity audit
npm run audit:identities
```

---

## Testing

Run the automated test suite using the Node.js native test runner:

```bash
npm test
```
