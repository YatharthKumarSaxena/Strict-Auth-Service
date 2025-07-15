# 🛣️ `routes/` — Centralized Route Definitions for the Backend

This folder defines **all HTTP routes** for the backend API and connects each endpoint to the appropriate middleware layers and controllers.  

Each route file corresponds to a **specific domain** — such as authentication, administration, internal tools, or user profile handling — and strictly adheres to layered design principles.

---

## 📖 **Introduction**

The routing layer serves as the **entrypoint to every feature module**, applying:

- Middlewares for authentication, validation, and rate-limiting
- Controllers for business logic execution
- Role-based and device-based protection
- Smart separation between authenticated and unauthenticated flows

All routes are registered centrally via the `index.js` entrypoint.

---

## 🗂️ **Folder Structure**

This folder contains 5 files in total:

| 📄 File Name         | 📌 Purpose                                                                 |
|----------------------|---------------------------------------------------------------------------|
| `auth.routes.js`     | 🔐 Routes for public user login/signup, account control, and sessions     |
| `admin.routes.js`    | 👑 Admin-only APIs to block/unblock users/devices, fetch stats            |
| `user.routes.js`     | 👤 Authenticated user's own profile and update endpoints                  |
| `internal.routes.js` | ⚙️ Internal dev/admin-only APIs (like cookie injection)                   |
| `index.js`           | 🧩 Entry point that mounts all above routes using URI base paths          |

---

## 📄 **File: auth.routes.js** — 🔐 Public Authentication Routes

This file contains **routes for public and user-accessible features** like:

- **Sign Up / Sign In**
- **Sign Out from all devices**
- **Account Activation / Deactivation**
- **Change Password**
- **View Logged-In Device Sessions**

### 🛡️ Rate Limiting Strategy:
- `special-api.rate-limiter.js` used for public routes (sign up/in/activate)
- `general-api.rate-limiter.js` used for access-token protected APIs (sign out, deactivate, etc.)

### 🧠 Middleware Highlights:
- Device Field Verification  
- Device Block Check  
- Access Token Verification  
- User Blocked & Active Checks  
- Body Validation Middleware

---

## 📄 **File: admin.routes.js** — 👑 Admin-Controlled Operations

This file powers all **admin-only routes** for user/device control and analytics:

- ✅ Block / Unblock User
- ✅ Block / Unblock Device
- ✅ View Any User’s Account or Devices
- ✅ View Any User's Auth Logs
- ✅ Get Total Registered Users

### 🛡️ Admin Validation Includes:
- Identity check via access token
- Verified admin check
- Body validation for secure operations
- Rate limiting per API

### 🧠 Middleware Highlights:
- `verifyAdminBlockUnblockBody()` or `verifyAdminBlockUnblockDeviceBody()`
- `internal.api.middleware.js` for extra admin validations
- Fine-grained **rate limiters per route**

---

## 📄 **File: user.routes.js** — 👤 Logged-in User Profile APIs

Contains routes for **authenticated users** to manage and view their own profile:

- ✅ `GET /me` → View full profile details  
- ✅ `PATCH /me` → Update profile (with allowed fields only)

### 🧠 Middleware Highlights:
- Uses **access token** + **deviceID**
- Blocks update of restricted fields like userID/userType
- Validates request payload and current login session
- Controlled using `general-api.rate-limiter.js`

---

## 📄 **File: internal.routes.js** — ⚙️ Internal/Dev APIs

**Reserved for development or privileged admin actions.**  
Currently includes:

- ✅ Set Access Token via Cookie (for testing login state in browser)

### 🔒 Secured via:
- DeviceID & Block Check
- Access token presence
- Admin-only access
- Strict request body schema

---

## 📄 **File: index.js** — 🧩 Router Entry Point

This file **registers all modular route files** to their base URI paths:

```js
const { AUTH_BASE, ADMIN_BASE, USER_BASE, INTERNAL_BASE } = require("../configs/uri.config");

app.use(AUTH_BASE, authRoutes);
app.use(ADMIN_BASE, adminRoutes);
app.use(USER_BASE, userRoutes); 
app.use(INTERNAL_BASE, internalRoutes);
```

All constants like `/api/auth`, `/api/admin`, etc., are imported from `uri.config.js`.

---

## 🧠 **Middleware Usage Strategy**

| Type                       | Middleware Source                     | Applied On                               |
|----------------------------|----------------------------------------|-------------------------------------------|
| ✅ **Device Checks**       | `common-used.middleware.js`            | All routes — public or private            |
| ✅ **Access Token Logic**  | `common-used.middleware.js`            | Protected routes only                     |
| ✅ **Admin Validation**    | `admin.middleware.js` / `internal.api` | Admin-only routes                         |
| ✅ **Rate Limiters**       | `general-api` or `special-api`         | Route-specific depending on auth level    |
| ✅ **Body Validators**     | `auth.middleware.js` / `admin.middleware.js` | Strict schema checks                     |

---

## 🎯 **Final Takeaway**

The `routes/` folder:

- Provides a **cleanly segmented API structure**
- Adopts the **Single Responsibility Principle** — each file handles a specific API domain
- Enables **secure**, **throttled**, and **well-validated** requests
- Utilizes layered protection: device check → token verification → role check → business logic

> A truly modular and production-grade API gateway — ready to scale and easy to debug.

