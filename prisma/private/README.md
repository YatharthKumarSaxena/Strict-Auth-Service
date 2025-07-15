# 🔒 Prisma Private Schema - Internal System Tables

This folder contains the **internal system schema** used by the backend to manage admin-only operations, logs, rate limits, and block controls. These tables are **never exposed to clients directly** and are only accessed through system services or admin-verified routes.

The private schema helps enforce **security**, **traceability**, and **control** across the system.

---

## 📖 **Introduction**

As my backend system matured, I separated internal logic (like logs, rate limits, device blocks) from public-facing user tables. This allowed for:

- Reduced risk of data leaks  
- Clear role separation between users and admins  
- Scalable enforcement of rate limits and device safety

This private schema runs with its own client and uses a separate environment variable `PRIVATE_DB_URL`.

---

## ⚙️ **Prisma Generator & Datasource**

```prisma
generator client {
  provider = "prisma-client-js"
  output   = "../../node_modules/.prisma/private"
}

datasource db {
  provider = "postgresql"
  url      = env("PRIVATE_DB_URL")
}
```

---

## 🧩 Enum Definitions

Enums make the schema type-safe and strictly controlled. Here's what each enum controls:

### 🔐 `AuthLogEvent`
Defines all actions that are logged for auditing:
- `LOGIN`, `LOGOUT`, `BLOCKED_USER`, `REGISTER`, `ACCESS_TOKEN`, etc.
- Also includes cleanup and admin-triggered actions.

### 💻 `DeviceType`
Specifies which device initiated the request:
- `LAPTOP`, `MOBILE`, `TABLET`

### 🧑‍⚖️ `PerformedBy`
Who performed the action:
- `CUSTOMER`, `ADMIN`, `SYSTEM`

### 🚫 `DeviceBlockReason`
Why a device was blocked:
- `SUSPICIOUS_ACTIVITY`, `UNKNOWN_DEVICE_LOGIN`, etc.

### ✅ `DeviceUnblockReason`
Why a device was unblocked:
- `FALSE_POSITIVE`, `MANUAL_REVIEW_CLEARED`, etc.

---

## 🗂️ Model Descriptions

---

### 📄 `AuthLog`

Stores all auth-related events. Helps with traceability and auditing.

| Field         | Type         | Description                                    |
|---------------|--------------|------------------------------------------------|
| `id`          | `Int`        | Primary key (autoincrement)                    |
| `userID`      | `String`     | User involved in event                         |
| `eventType`   | `AuthLogEvent` | Type of event (e.g., LOGIN, LOGOUT)         |
| `deviceID`    | `String`     | Device UUID                                    |
| `deviceName`  | `String?`    | Optional device name                           |
| `deviceType`  | `DeviceType?`| Laptop/Mobile/Tablet                           |
| `performedBy` | `PerformedBy`| Who performed the action                       |
| `timestamp`   | `DateTime`   | When the action occurred                       |
| `adminAction` | `AdminAction?`| Optional admin details for the event         |

---

### 📄 `AdminAction`

Extra metadata if an `AuthLog` was triggered by an admin.

| Field         | Type     | Description                                     |
|---------------|----------|-------------------------------------------------|
| `id`          | `Int`    | Same as corresponding `AuthLog.id`              |
| `authLog`     | `AuthLog`| Relation to AuthLog                             |
| `targetUserID`| `String?`| Which user was targeted                         |
| `reason`      | `String?`| Admin's reason for the action                   |
| `filter`      | `Json`   | Query filters or payload context (if any)       |

---

### 📄 `DeviceRateLimit`

Stores how many requests a device made (for device-level rate limiting).

| Field         | Type       | Description                         |
|---------------|------------|-------------------------------------|
| `deviceID`    | `String`   | Primary key - device UUID           |
| `attempts`    | `Int`      | How many attempts made              |
| `lastAttemptAt`| `DateTime`| Timestamp of last attempt           |
| `createdAt`   | `DateTime` | Created at                          |
| `updatedAt`   | `DateTime` | Updated at                          |

---

### 📄 `RateLimit`

Stores **route-specific** rate limits for a device.

| Field           | Type       | Description                       |
|------------------|------------|-----------------------------------|
| `deviceID`       | `String`   | Composite key with `routeKey`     |
| `routeKey`       | `String`   | API route identifier              |
| `requestCount`   | `Int`      | Number of times it was called     |
| `lastRequestAt`  | `DateTime` | When it was last accessed         |

---

### 📄 `DeviceBlock`

Tracks device block status, reason, and unblock information.

| Field             | Type                  | Description                         |
|-------------------|-----------------------|-------------------------------------|
| `deviceID`        | `String`              | Primary key - Device UUID           |
| `isBlocked`       | `Boolean`             | Whether it’s currently blocked      |
| `blockedAt`       | `DateTime?`           | When blocked                        |
| `unblockedAt`     | `DateTime?`           | When unblocked                      |
| `blockedBy`       | `String?`             | Admin ID who blocked it             |
| `unblockedBy`     | `String?`             | Admin ID who unblocked it           |
| `blockReason`     | `DeviceBlockReason?`  | Why it was blocked                  |
| `unblockReason`   | `DeviceUnblockReason?`| Why it was unblocked                |
| `createdAt`       | `DateTime`            | Audit field                         |
| `updatedAt`       | `DateTime`            | Audit field                         |

---

### 📄 `Counter`

Simple key-based counter to maintain auto-incremented sequences (used if needed for atomic counts).

| Field | Type     | Description       |
|-------|----------|-------------------|
| `id`  | `String` | Counter key       |
| `seq` | `Int`    | Current sequence  |

---

## 🛡️ Security Strategy

✅ No user can access these tables directly  
✅ All insert/update operations are done by middlewares or system scripts  
✅ Helps trace all admin-level activities with full logs and metadata  
✅ Ensures auditability for rate limits, token issues, and user actions  

---

## 🎯 **Final Takeaway**

This `private` schema serves as the **nervous system** of the backend, ensuring:

- Admin actions are tracked
- Devices can be blacklisted in real-time
- No client bypasses security controls
- Every event is logged and audit-ready

By separating internal logic here, my backend remains **clean**, **secure**, and **future-proof**.

---
