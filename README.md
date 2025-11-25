# 📘 Trackr Lite

_A lightweight activity & attendance tracking system for training, units, and admin management._

**Tech Stack:**

- **Frontend:** Vite + React + Chakra UI v2
- **Backend:** NestJS + TypeORM + PostgreSQL
- **Tooling:** Husky(TBD), Prettier, ESLint
- **Architecture:** Feature-based routing, clean API layers, modular Nest modules

---

## 📁 Project Structure

```
.
└── vite-react-nest-typeorm-pg
    ├── backend/                 # NestJS backend (TypeORM, PostgreSQL)
    │   ├── dist/                # Compiled output
    │   ├── src/                 # Application source code
    │   ├── test/                # Backend tests
    │   ├── nest-cli.json        # Nest CLI config
    │   ├── package.json         # Backend dependencies
    │   ├── package-lock.json
    │   ├── tsconfig.json        # TypeScript config
    │   ├── tsconfig.build.json  # TS build config
    │   └── README.md

    ├── frontend/                # Vite + React frontend
    │   ├── src/                 # Application source code
    │   ├── public/              # Static assets
    │   ├── index.html           # Entry HTML
    │   ├── package.json         # Frontend dependencies
    │   ├── package-lock.json
    │   ├── tsconfig.json        # TypeScript config
    │   ├── tsconfig.app.json
    │   ├── tsconfig.node.json
    │   ├── vite.config.ts       # Vite config
    │   └── README.md

    ├── shared/                  # Shared code across FE/BE
    │   └── dto/                 # Shared DTOs for type-safe API

    ├── docker-compose.yaml      # Postgres service
    └── README.md                # Project overview

```

---

## 🎯 Project Goals

Trackr Lite is a starter project to get familiar with:

- Building full-stack features using **React + NestJS**
- Designing clean **frontend architecture** (hooks, contexts, pages)
- Building CRUD flows with **TypeORM + PostgreSQL**
- Implementing **JWT auth** and route protection
- Practising SWE best practices: modular code, clear API boundaries
- Building Activity → Attendance → User relationships
- Delivering a working, demo-ready MVP for onboarding

---

## 🗄️ Data Model (TypeORM Entities)

### **User**

| Field             | Type      | Notes            |
| ----------------- | --------- | ---------------- | ---- |
| id                | uuid      | PK               |
| name              | string    | Display name     |
| email             | string    | Unique           |
| identifier        | string    | Login identifier |
| role              | 'admin'   | 'user'           | RBAC |
| attendanceRecords | relation  | One-to-many      |
| createdAt         | timestamp | Auto             |
| updatedAt         | timestamp | Auto             |

---

### **Activity**

| Field             | Type      | Notes        |
| ----------------- | --------- | ------------ |
| id                | uuid      | PK           |
| title             | string    | Required     |
| description       | text      | Optional     |
| date              | date      | Display date |
| startAt           | timestamp | Start        |
| endAt             | timestamp | End          |
| location          | string    | Optional     |
| createdByUserId   | uuid      | FK to User   |
| attendanceRecords | relation  | One-to-many  |
| createdAt         | timestamp | Auto         |

---

### **AttendanceRecord**

| Field       | Type                 | Notes          |
| ----------- | -------------------- | -------------- |
| id          | uuid                 | PK             |
| userId      | uuid                 | FK to User     |
| activityId  | uuid                 | FK to Activity |
| status      | present/late/absent  | Required       |
| remarks     | string (optional)    | Optional       |
| checkedInAt | timestamp (optional) | Optional       |

---

## 🌱 Database Seeding

The `seed.ts` script populates demo data:

- 1 admin user
- 2 regular users
- 2 activities
- Attendance records

Run:

```bash
cd server
npm run seed
```

---

## ▶️ Running the App

### **Backend**

```bash
cd server
npm run start:dev
```

### **Frontend**

```bash
cd my-app
npm run dev
```

**Vite proxy** forwards:
`http://localhost:5173/api/...` → `http://localhost:3000/...`

---

## **Phase 1 — App Shell & Routing**

**Branch:** `feat/app-shell-and-routing`

**Status:** 🟢 _Completed_

- [x] Set up React Router

  - `/login`
  - `/activities`
  - `/activities/:activityId`
  - `/users`
  - `/users/:userId`
  - `/calendar`

- [x] Implement AppLayout (sidebar + top bar)
- [x] Placeholder pages
- [x] Navigation working

---

## **Phase 2 — Frontend Auth (Context Only)**

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

**Branch:** `feat/auth-backend-jwt`

**Status:** ⏳ _Pending_

- [ ] Add AuthModule in Nest
- [ ] `POST /auth/login` (identifier-based)
- [ ] Generate JWT token
- [ ] Implement `JwtStrategy`, `JwtAuthGuard`
- [ ] Protect `/users`, `/activities`, `/attendance`
- [ ] Frontend AuthContext: call real login endpoint
- [ ] Store token in localStorage + attach in axios

---

## **Phase 4 — Users CRUD**

**Branch:** `feat/users-crud`

### Backend

**Status:** ⏳ Pending

- [ ] `GET /users`
- [ ] `GET /users/:id`
- [ ] `POST /users`
- [ ] `PUT /users/:id`
- [ ] `DELETE /users/:id`

### Frontend

**Status:** ⏳ Pending

- [ ] UsersListPage (table)
- [ ] UserDetailPage
- [ ] “Create User” modal/form

---

## **Phase 5 — Activities CRUD**

**Branch:** `feat/activities-crud`

### Backend

**Status:** 🟢 _Partially Completed (findAll done)_

- [x] `GET /activities` (list)
- [ ] `GET /activities/:id`
- [ ] `POST /activities`
- [ ] `PUT /activities/:id`
- [ ] `DELETE /activities/:id`

### Frontend

**Status:** 🟢 _Fetching list done_

- [x] ActivitiesListPage loads real data
- [ ] Activity detail page
- [ ] Create/edit activity form

---

## **Phase 6 — Attendance Management**

**Branch:** `feat/attendance-management`

**Status:** ⏳ Pending

### Backend

- [ ] `GET /activities/:id/attendance`
- [ ] `POST /activities/:id/attendance`
- [ ] `PUT /attendance/:id`
- [ ] `DELETE /attendance/:id`
- [ ] Add unique `(activityId, userId)` constraint

### Frontend

- [ ] Attendance section on ActivityDetailPage
- [ ] Add attendee modal (select user)
- [ ] Status dropdown (present / late / absent)
- [ ] Remarks editing
- [ ] Remove attendee

---

## **Phase 7 — Calendar View**

**Branch:** `feat/calendar-view`

**Status:** ⏳ Pending

### Frontend

- [ ] Group activities by date
- [ ] Vertical schedule list OR basic calendar grid

---

## **Phase 8 — UI & Developer Experience Polish**

**Branch:** `chore/ui-polish-and-dx`

**Status:** ⏳ Optional / End-game polish

- [ ] Add Husky checks (lint/format)
- [ ] README tidy-up
- [ ] Add a 404 page

---
