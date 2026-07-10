# BeanBuddy – Deployment Guide

## Prerequisites

- Node.js >= 18
- MongoDB Atlas account (or self-hosted MongoDB)
- A hosting platform (Render, Railway, Heroku, AWS EC2, etc.)

---

## Step 1: Environment Setup

Copy the example env file and fill in all values:

```bash
cd server
cp .env.example .env
```

**Required Variables:**

```env
PORT=8000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/coffee-shop
NODE_ENV=production
JWT_SECRET=your_strong_random_secret_minimum_32_chars
JWT_EXPIRE=7d
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

> ⚠️ **Never commit `.env` to version control.** It is already excluded by `.gitignore`.

> ⚠️ **JWT_SECRET** must be a long, random string. Use `openssl rand -hex 32` to generate one.

---

## Step 2: Install Dependencies

```bash
cd server
npm install --production
```

---

## Step 3: Initial Admin Account

Since `/api/auth/register` requires a Super Admin token, you must seed the first admin account directly via MongoDB shell or a one-time seed script.

**Option A: MongoDB shell**
```js
db.admins.insertOne({
  name: "Super Admin",
  email: "admin@beanbuddy.com",
  password: "<bcrypt_hash_of_your_password>",  // hash using bcrypt rounds=12
  role: "Super Admin",
  isActive: true,
  isDeleted: false,
  loginAttempts: 0,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

**Option B: Seed script**
```js
// seed.js (run once: node seed.js)
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('./models/Admin');

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  const hash = await bcrypt.hash('YourSecurePassword123!', 12);
  await Admin.create({
    name: 'Super Admin',
    email: 'admin@beanbuddy.com',
    password: hash,
    role: 'Super Admin'
  });
  console.log('Seeded admin account.');
  process.exit(0);
}
seed();
```

---

## Step 4: Start the Server

```bash
# Production start
npm start

# With PM2 (recommended for always-on)
npm install -g pm2
pm2 start server.js --name "beanbuddy-api"
pm2 save
pm2 startup
```

---

## Step 5: Deploy Frontend

The frontend is a static site — no build step required.

**Option A: Serve via Express (same origin)**

Add this to `server/app.js` after routes:
```js
const path = require('path');
app.use(express.static(path.join(__dirname, '../client')));
```

**Option B: Static hosting (Netlify / Vercel / GitHub Pages)**

1. Upload the `client/` folder to your static host.
2. Update `BASE_URL` in `client/js/api/api.js` to your production API URL:
   ```js
   const BASE_URL = 'https://api.yourdomain.com/api';
   ```

---

## Step 6: Update CORS

In your `.env`, set `ALLOWED_ORIGINS` to your frontend's production URL:

```env
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

---

## Step 7: MongoDB Atlas Security

1. Go to **Network Access** → Add your server's IP (or `0.0.0.0/0` for dynamic IPs, less secure)
2. Go to **Database Access** → Create a user with `readWrite` on the `coffee-shop` database only
3. Use the connection string with the least-privileged user in `MONGODB_URI`

---

## Step 8: Health Check Verification

After deployment, verify the API is running:

```bash
curl https://api.yourdomain.com/api/health
# Expected: { "status": "ok" }
```

---

## Deployment on Render.com (Recommended for Portfolio)

1. Push code to GitHub
2. Create a new **Web Service** on Render
3. Root directory: `server`
4. Build command: `npm install`
5. Start command: `node server.js`
6. Add all environment variables in Render's dashboard
7. Deploy

---

## Production Checklist

- [ ] `NODE_ENV=production` set
- [ ] `JWT_SECRET` is a strong, random value (≥32 chars)
- [ ] `.env` is NOT committed to git
- [ ] `ALLOWED_ORIGINS` matches your frontend URL only
- [ ] MONGODB_URI uses a read-write-only user (not root)
- [ ] PM2 or equivalent process manager enabled
- [ ] HTTPS enforced on frontend (for secure JWT storage)
- [ ] First Super Admin seeded in database
- [ ] Health check endpoint responding correctly
