# 📘 Trackr Lite

_A lightweight activity & attendance tracking system for training, units, and admin management._

**Tech Stack:**

- **Frontend:** Vite + React + Chakra UI v2
- **Backend:** NestJS + TypeORM + PostgreSQL
- **Tooling:** Husky(TBD), Prettier, ESLint
- **Architecture:** Feature-based routing, clean API layers, modular Nest modules

---

## 🛠️ Backend Environment Variables

```
DB_HOST=localhost
DB_PORT=5432
DB_USER=myuser
DB_PASS=mypassword
DB_NAME=mydb

DB_SYNC=true
DB_LOGGING=false

JWT_SECRET=supersecret_dont_use_this_in_prod
JWT_EXPIRES_IN=1d
```

---

# 📁 Project Structure

```
vite-react-nest-typeorm-pg
├── backend/                 # NestJS backend
│   ├── dist/
│   ├── src/
│   ├── test/
│   ├── nest-cli.json
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
│
├── frontend/                # Vite + React + Chakra UI
│   ├── src/
│   ├── public/
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
│
├── shared/                  # Shared DTOs/types
│   └── dto/
│
├── docker-compose.yaml      # Local Postgres setup
└── README.md                # Project overview (this file)
```

---

## 🗄️ Data Model (TypeORM Entities)

## 👤 **User**

| Field             | Type           | Notes                     |
| ----------------- | -------------- | ------------------------- |
| id                | uuid           | Primary key               |
| name              | string         | Display name              |
| email             | string         | Unique (optional)         |
| identifier        | string         | Login identifier (unique) |
| role              | admin / member | RBAC                      |
| attendanceRecords | relation       | One-to-many Attendance    |
| createdAt         | timestamp      | Auto-generated            |
| updatedAt         | timestamp      | Auto-generated            |

---

## 📅 **Activity**

| Field             | Type      | Notes                  |
| ----------------- | --------- | ---------------------- |
| id                | uuid      | Primary key            |
| title             | string    | Required               |
| description       | text      | Optional               |
| date              | date      | Activity date          |
| startAt           | timestamp | Start time             |
| endAt             | timestamp | End time               |
| location          | string    | Optional               |
| createdByUserId   | uuid      | FK → User              |
| attendanceRecords | relation  | One-to-many Attendance |
| createdAt         | timestamp | Auto-generated         |

---

## 📝 **AttendanceRecord**

| Field       | Type                | Notes         |
| ----------- | ------------------- | ------------- |
| id          | uuid                | Primary key   |
| userId      | uuid                | FK → User     |
| activityId  | uuid                | FK → Activity |
| status      | present/late/absent | Required      |
| remarks     | string              | Optional      |
| checkedInAt | timestamp           | Optional      |

**Planned:** Add DB-level unique constraint on `(userId, activityId)`.

---

## 🌱 Database Seeding

The `seed.ts` script populates demo data:

- 1 admin user
- 2 members
- 2 activities
- Attendance records

Run:

```bash
cd backend
npm run seed
```

---

# ▶️ Running the App

### **Backend**

```bash
cd backend
npm run start:dev
```

### **Frontend**

```bash
cd frontend
npm run start:dev
```

The Vite proxy maps:

```
/api/*  →  http://localhost:3000/*
```

---

# 🚦 Development Progress

---

## **Phase 1 — App Shell & Routing**

**Status:** 🟢 Completed
**Branch:** `feat/app-shell-and-routing`

- [x] React Router setup (`/login`, `/activities`, `/users`, `/calendar`)
- [x] Implement AppLayout (sidebar + top bar)
- [x] Placeholder pages
- [x] Navigation working

---

## **Phase 2 — Frontend Auth (Context Only)**

**Status:** 🟢 Completed
**Branch:** `feat/auth-frontend-context`

**Status:** 🟢 _Completed_

- [x] Create `AuthContext`

  - `user`
  - `token`
  - `login()`, `logout()`

- [x] Add `<RequireAuth>` wrapper
- [x] Make `/login` public
- [x] Protect all other routes
- [x] Add logout button in AppLayout
- [x] Fake login to unblock UI flow

---

## **Phase 3 — Backend Auth (JWT)**

**Status:** 🟢 Completed
**Branch:** `feat/auth-backend-jwt`

Backend:

- [x] Identifier login
- [x] JWT issuing
- [x] JwtStrategy + AuthGuard
- [x] Protect `/users`, `/activities`, `/attendance`

Frontend:

- [x] Login calls real backend
- [x] Token stored in localStorage
- [x] Token auto-attached to API client

---

## **Phase 4 — Users CRUD**

**Status:**

- **Backend:** 🟢 Completed
- **Frontend:** ⏳ Pending
  **Branch:** `feat/users-crud`

Backend features:

- [x] GET /users
- [x] GET /users/:id
- [x] POST /users (admin only)
- [x] PUT /users/:id (admin only)
- [x] DELETE /users/:id (admin only)
- [x] Unique identifier enforcement
- [x] Full e2e test coverage

Pending (FE):

- [ ] Users table page
- [ ] User detail page
- [ ] Create user modal/form for admin

---

## **Phase 5 — Activities CRUD**

**Status:**

- **Backend:** 🟢 Completed
- **Frontend:** 🟡 Partial (list only)
  **Branch:** `feat/activities-crud`

Backend features:

- [x] GET /activities
- [x] GET /activities/:id
- [x] POST /activities (admin only)
- [x] PUT /activities/:id (admin only)
- [x] DELETE /activities/:id (blocked if attendance exists → 409)
- [x] e2e tested

Pending (FE):

- [ ] Activity detail page
- [ ] Create/edit activity UI

---

## **Phase 6 — Attendance Management**

**Status:**

- **Backend:** 🟢 Completed
- **Frontend:** ⏳ Pending
  **Branch:** `feat/attendance-management`

Backend features:

- [x] Attendance list
- [x] GET /attendance/activity/:id
- [x] GET /attendance/user/:id
- [x] POST /attendance
- [x] PUT /attendance/:id
- [x] DELETE /attendance/:id
- [x] RBAC: Members can only manage their own attendance
- [x] All e2e tests passing

Optional / Future:

- [ ] Add unique `(userId, activityId)` constraint

Pending (FE):

- [ ] Attendance table under ActivityDetailPage
- [ ] Add attendee modal (admin)
- [ ] Status & remarks editing
- [ ] Member self-check-in button

---

## **Phase 7 — Calendar View**

**Status:** ⏳ Not Started

Frontend:

- [ ] Group activities by date
- [ ] Basic schedule or calendar grid

---

## **Phase 8 — UI & Developer Experience Polish**

**Status:** ⏳ Optional / End-game\*\*

- [ ] Husky pre-commit checks
- [ ] Toast notifications
- [ ] 404 page
- [ ] Better empty/error/loading states
- [ ] README polishing

---
