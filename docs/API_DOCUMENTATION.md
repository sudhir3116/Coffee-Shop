# BeanBuddy – API Documentation

**Base URL:** `http://localhost:8000/api`  
**Content-Type:** `application/json`

> 🔐 Routes marked **[Admin]** require `Authorization: Bearer <token>` header.

---

## Health

### `GET /health`
Returns server health status.

**Response:**
```json
{ "status": "ok" }
```

---

## Auth – `/auth`

### `POST /auth/login`
Authenticate an administrator and receive a JWT.

**Body:**
```json
{ "email": "admin@beanbuddy.com", "password": "yourpassword" }
```

**Success `200`:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "admin": { "id": "...", "name": "...", "email": "...", "role": "Admin" }
}
```

**Errors:** `400` Validation | `401` Invalid credentials | `403` Locked / Deactivated

---

### `GET /auth/profile` 🔐 [Admin]
Get the current admin's profile.

**Success `200`:**
```json
{
  "success": true,
  "data": { "id": "...", "name": "...", "email": "...", "role": "...", "lastLogin": "..." }
}
```

---

### `PATCH /auth/change-password` 🔐 [Admin]
Change the authenticated admin's password.

**Body:**
```json
{ "currentPassword": "oldpass", "newPassword": "newpass123" }
```

**Success `200`:** `{ "success": true, "message": "Password changed successfully" }`

---

### `POST /auth/logout` 🔐 [Admin]
Invalidate session client-side. Server acknowledges logout.

**Success `200`:** `{ "success": true, "message": "Logged out successfully" }`

---

### `POST /auth/register` 🔐 [Super Admin Only]
Create a new admin account.

**Body:**
```json
{ "name": "Jane Admin", "email": "jane@beanbuddy.com", "password": "securepass", "role": "Admin" }
```

**Success `201`:**
```json
{
  "success": true,
  "message": "Admin registered successfully",
  "data": { "id": "...", "name": "...", "email": "...", "role": "Admin" }
}
```

**Errors:** `400` Validation | `409` Email already exists

---

## Menu – `/menu`

### `GET /menu`
Fetch all available (non-deleted) menu items. Public.

**Query Parameters:**

| Param | Type | Description |
|---|---|---|
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 10) |
| `search` | string | Search name, description, ingredients |
| `category` | string | Filter: Coffee, Tea, Dessert, Snacks, Combo, Cold Beverage |
| `isAvailable` | boolean | Filter by availability |
| `isFeatured` | boolean | Filter by featured status |
| `sort` | string | Sort field: `price` or `createdAt` (default) |
| `order` | string | `asc` or `desc` (default) |

**Success `200`:**
```json
{
  "success": true,
  "totalDocuments": 20,
  "currentPage": 1,
  "totalPages": 2,
  "data": [{ "_id": "...", "name": "Cappuccino", "price": 150, ... }]
}
```

---

### `GET /menu/:id`
Get a single menu item by ID. Public.

**Success `200`:** `{ "success": true, "data": { ... } }`  
**Error `404`:** Not found

---

### `POST /menu` 🔐 [Admin]
Create a new menu item.

**Body:**
```json
{
  "name": "Mocha Latte",
  "description": "A rich blend of espresso and chocolate.",
  "category": "Coffee",
  "price": 180,
  "image": "/images/mocha.jpg",
  "ingredients": ["espresso", "milk", "chocolate syrup"]
}
```

**Success `201`:** `{ "success": true, "data": { ... } }`  
**Errors:** `400` Validation | `409` Duplicate name

---

### `PATCH /menu/:id` 🔐 [Admin]
Update a menu item (partial update supported).

---

### `PATCH /menu/:id/availability` 🔐 [Admin]
Toggle availability status.

**Body:** `{ "isAvailable": false }`

---

### `PATCH /menu/:id/featured` 🔐 [Admin]
Toggle featured status.

**Body:** `{ "isFeatured": true }`

---

### `DELETE /menu/:id` 🔐 [Admin]
Soft-delete a menu item (`isDeleted: true`).

---

## Reservations – `/reservations`

### `POST /reservations`
Create a new table reservation. Public.

**Body:**
```json
{
  "customerName": "Sudhir Kumar",
  "email": "sudhir@email.com",
  "phone": "9876543210",
  "reservationDate": "2025-12-25",
  "reservationTime": "19:00",
  "numberOfGuests": 4,
  "specialRequest": "Window seat preferred"
}
```

**Success `201`:**
```json
{
  "success": true,
  "message": "Reservation created successfully",
  "data": { "bookingReference": "CS-20251225-001", ... }
}
```

**Errors:** `400` Validation | `409` Duplicate (same email + date + time)

---

### `GET /reservations` 🔐 [Admin]
Get all reservations (paginated).

**Query Parameters:** `page`, `limit`, `search` (name/email/phone/ref), `status`, `reservationDate`

---

### `GET /reservations/:id` 🔐 [Admin]
Get a single reservation.

---

### `PATCH /reservations/:id/status` 🔐 [Admin]
Update reservation status.

**Body:** `{ "status": "Confirmed" }`  
**Valid values:** `Pending`, `Confirmed`, `Cancelled`, `Completed`

---

### `PATCH /reservations/:id/table` 🔐 [Admin]
Assign a table number.

**Body:** `{ "tableNumber": 5 }`  
**Error `409`:** Table already booked at same date/time

---

### `DELETE /reservations/:id` 🔐 [Admin]
Soft-delete a reservation.

---

## Contact – `/contact`

### `POST /contact`
Submit a contact message. Public.

**Body:**
```json
{
  "name": "John Doe",
  "email": "john@email.com",
  "subject": "Feedback about the latte",
  "message": "Absolutely loved the coffee experience!"
}
```

**Success `201`:** `{ "success": true, "message": "Message sent successfully", "data": { ... } }`  
**Error `409`:** Duplicate message (same email + subject + message within 10 minutes)

---

### `GET /contact` 🔐 [Admin]
Get all contact messages (paginated).

**Query Parameters:** `page`, `limit`, `search`, `status`, `priority`

---

### `GET /contact/:id` 🔐 [Admin]
Get a single contact message.

---

### `PATCH /contact/:id/status` 🔐 [Admin]
Update message status.

**Body:** `{ "status": "Read" }`  
**Valid values:** `New`, `Read`, `Replied`, `Archived`

---

### `PATCH /contact/:id/reply` 🔐 [Admin]
Send an admin reply. Automatically sets status to `Replied`.

**Body:** `{ "adminReply": "Thank you for contacting us!" }`

---

### `DELETE /contact/:id` 🔐 [Admin]
Soft-delete a contact message.

---

## Reviews – `/reviews`

### `POST /reviews`
Submit a new customer review. Public.

**Body:**
```json
{
  "customerName": "Alice",
  "email": "alice@email.com",
  "rating": 5,
  "title": "Best latte in town!",
  "comment": "The atmosphere is great and the coffee is amazing.",
  "menuItem": "<optional_menu_item_id>"
}
```

**Success `201`:** `{ "success": true, "data": { ... } }`  
**Error `409`:** Duplicate review (same email + title + menuItem)

---

### `GET /reviews`
Get all reviews (paginated). Public.

**Query Parameters:** `page`, `limit`, `search`, `rating`, `isApproved`, `isFeatured`, `menuItem`, `sort` (createdAt/rating/likes), `order`

---

### `GET /reviews/:id`
Get a single review. Public.

---

### `PATCH /reviews/:id` 🔐 [Admin]
Update a review.

---

### `PATCH /reviews/:id/approve` 🔐 [Admin]
Approve a review for public display.

---

### `PATCH /reviews/:id/feature` 🔐 [Admin]
Toggle featured status.

**Body:** `{ "isFeatured": true }`

---

### `PATCH /reviews/:id/reply` 🔐 [Admin]
Post an admin reply to a review.

**Body:** `{ "adminReply": "We're so glad you enjoyed it!" }`

---

### `PATCH /reviews/:id/like`
Atomically increment the like count. Public.

---

### `DELETE /reviews/:id` 🔐 [Admin]
Soft-delete a review.

---

## Standard Error Response Format

```json
{
  "success": false,
  "message": "Human-readable error description",
  "errors": [{ "field": "email", "message": "Invalid email address format" }]
}
```

| Status | Meaning |
|---|---|
| 400 | Validation error |
| 401 | Not authenticated |
| 403 | Forbidden (wrong role or account locked) |
| 404 | Resource not found |
| 409 | Conflict (duplicate) |
| 500 | Internal server error |
