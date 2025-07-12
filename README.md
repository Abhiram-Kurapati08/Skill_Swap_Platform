# Skill_Swap_Platform

## Odoo Hackathon Problem 

## Problem Statement: Skill Swap Platform

## Team Details:

| Name               | Email                         |
|--------------------|-------------------------------|
| K. Abhiram         | yeshobhiram08@gmail.com       |
| Poloju Hrishikesh  | hrishikeshpoloju@gmail.com    |
| Harini Poloju      | harinipoloju25@gmail.com      |
| Himanshu Boora     | bt22btech11008@iith.ac.in     |





# 🔁 Skill Swap Platform – Backend

This is the **backend server** for the Skill Swap Platform — a web app that allows users to **offer skills**, **request swaps**, and **connect with others** for skill exchanges.

Built with:
- Node.js + Express
- PostgreSQL with Prisma ORM
- JWT authentication
- Role-based access control (admin)
- Modular route/controller structure

---

## 📁 Project Structure



skill-swap-backend/
├── prisma/                  # Prisma schema + migrations
├── src/
│   ├── controllers/         # All controller logic
│   ├── middlewares/         # Middleware functions (auth, admin)
│   ├── routes/              # Express routes for users, auth, admin
│   ├── utils/               # Utility functions (JWT token)
│   └── index.js             # Entry point
├── .env                     # Environment variables
├── package.json
└── README.md

`

---

## ⚙ Setup Instructions

### 1. Clone & Install Dependencies

bash
git clone <your-repo-url>
cd skill-swap-backend
npm install
`

### 2. Setup Environment Variables

Create a `.env` file in the root with:

env
DATABASE_URL=postgresql://<your-db-url>
JWT_SECRET=skillswap_secret_key_2025_hackathon
PORT=5000


---

### 3. Setup Prisma (DB)

bash
npx prisma init          # if not already done
npx prisma migrate dev   # generate & apply DB migrations
npx prisma studio        # optional: DB UI


---

### 4. Start the Server

bash
node src/index.js


Server runs at `http://localhost:5000/`

---

## 🔐 Authentication

* JWT-based auth using `Authorization: Bearer <token>`
* User token is generated at `/api/auth/signup` or `/api/auth/login`
* Protect routes using `protect` middleware (adds `req.user`)

---

## 🧠 API Overview

### Auth

| Method | Route            | Description       |
| ------ | ---------------- | ----------------- |
| POST   | /api/auth/signup | Register user     |
| POST   | /api/auth/login  | Login & get token |

---

### Users

| Method | Route           | Auth | Description             |
| ------ | --------------- | ---- | ----------------------- |
| GET    | /api/users/me   | ✅    | Get logged-in user data |
| PUT    | /api/users/\:id | ✅    | Update profile          |

---

### Admin (Protected via `isAdmin` middleware)

| Method | Route                        | Description                |
| ------ | ---------------------------- | -------------------------- |
| PUT    | /api/admin/ban/\:userId      | Ban/unban a user           |
| DELETE | /api/admin/delete-skill/\:id | Delete skill               |
| GET    | /api/admin/swaps             | View all swaps             |
| POST   | /api/admin/broadcast         | Broadcast platform message |

---

## ✅ Features Implemented (Phase-wise)

### Phase 1: Setup & Auth

* Express backend
* JWT signup & login
* Prisma + PostgreSQL DB

### Phase 2: User Profile APIs

* `/users/me` for self-profile fetch
* `/users/:id` for profile update
* Optional fields: location, profile photo, availability

### Phase 3: Admin APIs

* Ban/unban users
* Broadcast platform-wide messages
* View & moderate skill swaps

---

## 🔐 Middlewares

* `protect`: Verifies JWT, adds `req.user`
* `isAdmin`: Checks if user has admin privileges

---

## 💬 Contact / Contributions

> Built by Hrishikesh Poloju for Hackathon 2025
> Contributions, improvements, or suggestions welcome!

---



---

Let me know if you want a similar README for the *frontend* or a combined one for deployment!
```
