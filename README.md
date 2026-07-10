# ☕ BeanBuddy – Full-Stack Coffee Shop Application

A production-ready, full-stack Coffee Shop web application with a customer-facing website, REST API backend, and an Admin Dashboard.

---

## 🌐 Live Features

- **Customer Website** – Hero, About, Dynamic Menu, Gallery, Contact Form, Reservation Booking
- **REST API** – Contact, Reservation, Menu, Review, Auth endpoints
- **Admin Dashboard** – Login, Menu CRUD, Reservation management, Contact inbox, Review moderation

---

## 🗂️ Project Structure

```
Coffee-Shop/
├── client/                     # Frontend web application
│   ├── admin/                  # Admin control panel
│   │   ├── css/admin.css
│   │   ├── js/
│   │   │   ├── api/authApi.js
│   │   │   ├── admin.js        # Auth guard & login logic
│   │   │   └── dashboard.js    # Dashboard tab logic
│   │   ├── login.html
│   │   └── dashboard.html
│   ├── assets/                 # Images, icons, fonts
│   ├── css/style.css           # Global stylesheet
│   ├── js/
│   │   ├── api/
│   │   │   ├── api.js          # Generic fetch wrapper
│   │   │   ├── contactApi.js
│   │   │   └── reservationApi.js
│   │   ├── main.js             # Form submission interceptors
│   │   └── menu.js             # Dynamic menu rendering
│   └── index.html              # Customer-facing entry point
│
├── server/                     # Express.js backend
│   ├── config/db.js            # MongoDB connection
│   ├── controllers/            # Request/response logic
│   ├── middleware/             # Auth & error middleware
│   ├── models/                 # Mongoose schemas
│   ├── routes/                 # API route definitions
│   ├── services/               # Business logic layer
│   ├── utils/generateToken.js  # JWT helper
│   ├── validators/             # express-validator chains
│   ├── .env.example            # Environment variable template
│   ├── app.js                  # Express application setup
│   └── server.js               # Entry point
│
├── .gitignore
├── LICENSE
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18
- MongoDB (Atlas or local)

### Backend Setup

```bash
cd server
npm install

# Copy and fill in your environment variables
cp .env.example .env

# Development
npm run dev

# Production
npm start
```

### Frontend Setup

Open `client/index.html` in a browser or use [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer).  
For the Admin Panel, open `client/admin/login.html`.

---

## ⚙️ Environment Variables

See [`server/.env.example`](server/.env.example) for all required keys:

| Variable | Description |
|---|---|
| `PORT` | Server port (default: 8000) |
| `MONGODB_URI` | MongoDB connection string |
| `NODE_ENV` | `development` or `production` |
| `JWT_SECRET` | Secret key for signing JWT tokens |
| `JWT_EXPIRE` | Token lifespan (e.g., `7d`) |
| `ALLOWED_ORIGINS` | Comma-separated CORS allowed origins |

---

## 📡 API Endpoints

See [`API_DOCUMENTATION.md`](docs/API_DOCUMENTATION.md) for full details.

| Base Path | Description |
|---|---|
| `/api/health` | Health check |
| `/api/auth` | Admin authentication |
| `/api/menu` | Menu management |
| `/api/reservations` | Table reservations |
| `/api/contact` | Contact messages |
| `/api/reviews` | Customer reviews |

---

## 🔒 Security

- JWT-protected admin routes
- bcrypt password hashing (12 salt rounds)
- Account lockout after 5 failed logins (2-hour window)
- CORS origin whitelist
- Request body size limits (10kb)
- Security headers (X-Frame-Options, X-XSS-Protection, etc.)
- NoSQL injection protection via express-validator

---

## 📚 Documentation

| File | Description |
|---|---|
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | System architecture overview |
| [`docs/API_DOCUMENTATION.md`](docs/API_DOCUMENTATION.md) | Full API reference |
| [`docs/DATABASE_SCHEMA.md`](docs/DATABASE_SCHEMA.md) | All Mongoose schema details |
| [`docs/DEPLOYMENT_GUIDE.md`](docs/DEPLOYMENT_GUIDE.md) | Production deployment steps |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML5, Vanilla CSS, Vanilla JavaScript |
| Backend | Node.js, Express.js v5 |
| Database | MongoDB, Mongoose |
| Auth | JWT, bcryptjs |
| Validation | express-validator |
| Logging | morgan |

---

## 📄 License

MIT © 2025 BeanBuddy
