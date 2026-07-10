# BeanBuddy – Database Schema

MongoDB database: `coffee-shop`

---

## Collection: `admins`

Stores admin user accounts with lockout tracking.

| Field | Type | Required | Notes |
|---|---|---|---|
| `name` | String | ✅ | 3–100 chars |
| `email` | String | ✅ | Unique, lowercase, validated |
| `password` | String | ✅ | bcrypt hashed, `select: false` |
| `role` | String | — | `Admin` (default) or `Super Admin` |
| `profileImage` | String | — | URL or path |
| `phone` | String | — | 10-digit Indian format |
| `isActive` | Boolean | — | Default: `true` |
| `lastLogin` | Date | — | Updated on every login |
| `passwordChangedAt` | Date | — | Used to invalidate old JWTs |
| `loginAttempts` | Number | — | Default: 0 |
| `lockUntil` | Date | — | Set to 2h future after 5 failures |
| `isDeleted` | Boolean | — | Soft delete flag |
| `createdAt` | Date | — | Auto (timestamps) |
| `updatedAt` | Date | — | Auto (timestamps) |

**Virtuals:** `isLocked` (boolean) — `lockUntil > Date.now()`

**Methods:**
- `incrementLoginAttempts()` — increments counter, locks at 5 failures
- `resetLoginAttempts()` — resets counter and removes lockUntil

**Indexes:** `email` (unique), `role`, `isActive`

---

## Collection: `menu`

Menu items served at the coffee shop.

| Field | Type | Required | Notes |
|---|---|---|---|
| `name` | String | ✅ | Unique, 2–100 chars |
| `slug` | String | ✅ | Auto-generated from name, unique |
| `description` | String | ✅ | 10–500 chars |
| `category` | String | ✅ | Enum: Coffee, Tea, Dessert, Snacks, Combo, Cold Beverage |
| `price` | Number | ✅ | Min: 0 |
| `currency` | String | — | Default: `INR` |
| `image` | String | ✅ | URL or file path |
| `ingredients` | [String] | — | Array of ingredient strings |
| `isAvailable` | Boolean | — | Default: `true` |
| `isFeatured` | Boolean | — | Default: `false` |
| `isDeleted` | Boolean | — | Soft delete flag |
| `rating` | Number | — | Default: 0, range 0–5 |
| `totalReviews` | Number | — | Default: 0 |
| `createdAt` | Date | — | Auto |
| `updatedAt` | Date | — | Auto |

**Hooks:** `pre('validate')` — auto-generates `slug` from `name`, resolves collisions with random suffix

**Indexes:** `name` (unique), `slug` (unique), `category`

---

## Collection: `reservations`

Table reservation bookings.

| Field | Type | Required | Notes |
|---|---|---|---|
| `bookingReference` | String | ✅ | Auto-generated: `CS-YYYYMMDD-XXX`, unique |
| `customerName` | String | ✅ | 3–100 chars |
| `email` | String | ✅ | Validated, lowercase |
| `phone` | String | ✅ | 10-digit Indian mobile |
| `reservationDate` | Date | ✅ | Cannot be in the past |
| `reservationTime` | String | ✅ | 24-hour `HH:MM` format |
| `numberOfGuests` | Number | ✅ | 1–20 |
| `specialRequest` | String | — | Max 500 chars |
| `notes` | String | — | Admin-only internal notes |
| `status` | String | — | Enum: Pending (default), Confirmed, Cancelled, Completed |
| `tableNumber` | Number | — | Min: 1 |
| `isDeleted` | Boolean | — | Soft delete |
| `createdAt` | Date | — | Auto |
| `updatedAt` | Date | — | Auto |

**Hooks:** `pre('validate')` — validates date not in past, generates `bookingReference`

**Business Rules:**
- No duplicate: same email + date + time is rejected (409)
- No table conflict: same table + date + time in Confirmed status (409)

**Indexes:** `bookingReference` (unique), `reservationDate`, `status`, `email`

---

## Collection: `contacts`

Customer contact/inquiry messages.

| Field | Type | Required | Notes |
|---|---|---|---|
| `name` | String | ✅ | 3–100 chars |
| `email` | String | ✅ | Validated, lowercase |
| `subject` | String | ✅ | 5–150 chars |
| `message` | String | ✅ | 10–1000 chars |
| `status` | String | — | Enum: New (default), Read, Replied, Archived |
| `priority` | String | — | Enum: Low, Medium (default), High |
| `adminReply` | String | — | Admin response text |
| `repliedAt` | Date | — | Timestamp of admin reply |
| `isDeleted` | Boolean | — | Soft delete |
| `createdAt` | Date | — | Auto |
| `updatedAt` | Date | — | Auto |

**Virtuals:** `isReplied` (boolean) — true if `adminReply` is non-empty

**Business Rules:**
- Duplicate guard: same email + subject + message within 10 minutes → 409

**Indexes:** `email`, `status`, `priority`

---

## Collection: `reviews`

Customer reviews (with optional menu item reference).

| Field | Type | Required | Notes |
|---|---|---|---|
| `customerName` | String | ✅ | 3–100 chars |
| `email` | String | ✅ | Validated, lowercase |
| `menuItem` | ObjectId | — | Ref: `Menu` |
| `rating` | Number | ✅ | 1–5 |
| `title` | String | ✅ | 5–100 chars |
| `comment` | String | ✅ | 10–1000 chars |
| `isApproved` | Boolean | — | Default: `false` (must be approved by admin) |
| `isFeatured` | Boolean | — | Default: `false` |
| `likes` | Number | — | Default: 0, atomic $inc update |
| `adminReply` | String | — | Admin response |
| `repliedAt` | Date | — | Timestamp of admin reply |
| `isDeleted` | Boolean | — | Soft delete |
| `createdAt` | Date | — | Auto |
| `updatedAt` | Date | — | Auto |

**Virtuals:** `shortComment` — first 100 chars of `comment` with `...` suffix

**Business Rules:**
- Duplicate guard: same email + title + menuItem → 409

**Indexes:** `rating`, `isApproved`, `menuItem`

---

## Relationships

```
Review ──────→ Menu (optional, menuItem: ObjectId ref)
```

All other collections are independent. Soft delete (`isDeleted: true`) is used across all collections to preserve audit history.

---

## Index Strategy

| Collection | Indexed Fields | Reason |
|---|---|---|
| admins | email, role, isActive | Fast auth lookups |
| menu | name, slug, category | Fast search + routing |
| reservations | bookingReference, reservationDate, status, email | Pagination, conflict checks |
| contacts | email, status, priority | Admin inbox filtering |
| reviews | rating, isApproved, menuItem | Analytics, moderation |
