# BeanBuddy – System Architecture

## Overview

BeanBuddy is a monorepo containing a decoupled client-server web application.

```
┌──────────────────────────────────────────────┐
│                   CLIENT                      │
│                                              │
│  ┌──────────────┐   ┌────────────────────┐  │
│  │  Customer    │   │   Admin Dashboard  │  │
│  │  Website     │   │  (login.html /     │  │
│  │ (index.html) │   │  dashboard.html)   │  │
│  └──────┬───────┘   └────────┬───────────┘  │
│         │                    │              │
│  ┌──────▼────────────────────▼───────────┐  │
│  │        api.js (fetch wrapper)         │  │
│  └───────────────────┬───────────────────┘  │
└──────────────────────┼───────────────────────┘
                       │ HTTP / REST
                       ▼
┌──────────────────────────────────────────────┐
│                   SERVER                     │
│                                              │
│  ┌─────────────┐   ┌────────────────────┐   │
│  │  Middleware │   │       Routes       │   │
│  │ - CORS      │──▶│ /api/auth          │   │
│  │ - Auth JWT  │   │ /api/menu          │   │
│  │ - Validator │   │ /api/reservations  │   │
│  │ - ErrorHdlr │   │ /api/contact       │   │
│  └─────────────┘   │ /api/reviews       │   │
│                     └────────┬───────────┘   │
│                              │               │
│  ┌───────────────────────────▼────────────┐  │
│  │             Controllers                │  │
│  └───────────────────────────┬────────────┘  │
│                              │               │
│  ┌───────────────────────────▼────────────┐  │
│  │              Services                  │  │
│  │  (Business Logic & DB Queries)         │  │
│  └───────────────────────────┬────────────┘  │
└──────────────────────────────┼───────────────┘
                               │
                               ▼
┌──────────────────────────────────────────────┐
│              MongoDB Atlas                   │
│                                              │
│  Collections: admins, menu, reservations,    │
│              contacts, reviews               │
└──────────────────────────────────────────────┘
```

---

## Layer Responsibilities

### Client

| Component | Responsibility |
|---|---|
| `index.html` | Customer-facing single-page website |
| `admin/login.html` | Admin authentication portal |
| `admin/dashboard.html` | Admin control panel SPA |
| `js/api/api.js` | Generic fetch wrapper, error normalization |
| `js/api/contactApi.js` | Contact form submission helper |
| `js/api/reservationApi.js` | Reservation booking helper |
| `js/main.js` | Contact and reservation form interceptors |
| `js/menu.js` | Fetches and dynamically renders menu items |
| `admin/js/admin.js` | Auth guard, login flow, token management |
| `admin/js/dashboard.js` | All dashboard tab logic, CRUD operations |
| `admin/js/api/authApi.js` | Admin auth API helper |

### Server

| Layer | Responsibility |
|---|---|
| `server.js` | App entry point, starts HTTP server |
| `app.js` | Middleware registration, route mounting |
| `config/db.js` | MongoDB connection setup |
| `routes/` | Express Router definitions, maps HTTP verbs to controllers |
| `controllers/` | Extract request data, call services, send responses |
| `services/` | Business logic, data access, database queries |
| `models/` | Mongoose schemas, indexes, virtuals, hooks |
| `validators/` | express-validator chains, validation result handler |
| `middleware/authMiddleware.js` | JWT verification, role authorization |
| `middleware/errorMiddleware.js` | 404 handler, global error formatter |
| `utils/generateToken.js` | JWT signing utility |

---

## Design Patterns

- **MVC-like Architecture**: Controllers → Services → Models
- **Singleton Services**: All service and controller classes are instantiated once (`module.exports = new FooService()`)
- **Centralized Error Handling**: Service methods throw typed errors (`err.statusCode`) which are pattern-matched in controllers
- **Soft Delete**: All user-generated data (Menu, Reservation, Contact, Review) uses `isDeleted: true` flags instead of hard deletes
- **Pre-validate Hooks**: Slug generation (Menu) and booking reference generation (Reservation) happen in Mongoose's `pre('validate')` hook to pass schema validation before save

---

## Authentication Flow

```
POST /api/auth/login
       │
       ▼
Validate email + password via express-validator
       │
       ▼
Find Admin by email (select +password)
       │
       ├─ Not found or deleted → 401
       ├─ Account inactive → 403
       ├─ Account locked → 403 (with remaining minutes)
       │
       ▼
bcrypt.compare(inputPassword, hashedPassword)
       │
       ├─ No match → incrementLoginAttempts() → 401/403
       │
       ▼
resetLoginAttempts() + update lastLogin
       │
       ▼
generateToken(admin._id) → JWT (7d expiry)
       │
       ▼
200 OK { token, admin }
```

---

## Request Authorization Flow

```
Protected Route Request (e.g. PATCH /api/reservations/:id/status)
       │
       ▼
authMiddleware.protect()
  ├─ Extract Bearer token from Authorization header
  ├─ jwt.verify(token, JWT_SECRET) → decoded.id
  ├─ Admin.findOne({ _id: decoded.id, isDeleted: false })
  ├─ Check admin.isActive
  ├─ Check passwordChangedAt > token.iat (session invalidation)
  └─ Attach req.admin, call next()
       │
       ▼
Controller handles request with authenticated context
```
