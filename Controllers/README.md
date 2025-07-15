# 🎮 `controllers/` — Central Nervous System for Executing Business Logic

> **I’m the command center of your system.** I take in validated requests, perform logic-heavy decisions, and return consistent responses — while orchestrating all middle layers like a pro.

---

## 📖 **Introduction**

The `controllers/` folder is the **brain** of the entire backend system. Everything that a user or admin **intends to perform** — be it registration, login, password change, device detection, or account status checks — it all flows through this hub.

Here, I applied my learnings of design patterns like **Template Method**, **Factory**, and **Singleton**, and design principles such as **SRP** and **DRY**, and saw them in action when I built this controller-driven structure. These aren't just REST handlers — they are policy enforcers and orchestrators.

---

## 🗂️ **Folder Structure**

> 📦 Total: **3 controller files**

| 🧩 Controller File            | 📄 Purpose                                                                       |
| ----------------------------- | -------------------------------------------------------------------------------- |
| `auth.controller.js`          | 🔑 Handles user registration, login, logout with device + token logic            |
| `internal-api.controllers.js` | 🔁 Internal-safe handlers like setting cookies, user stats, and profile update   |
| `admin.controllers.js`        | 🛡️ Admin-only capabilities like block/unblock, access logs, and device tracking |

Each file has its own `SRP` and a well-defined role in the system. All are powered by consistent error handling and logging.

---

## ⚙️ **Controller Responsibilities**

### 🔐 `auth.controller.js`

Handles **end-to-end authentication**, enforcing identity and device-level trust:

* 🧠 `signUp`:
  * Structured registration flow using **Template Method Pattern**
  * Generates user ID via **Factory Pattern**
  * Encrypts password and saves user with activity log
  * Performs auto-login with **token + device link + cookie**

* 🔑 `signIn`:
  * Checks session validity (`jwtTokenIssuedAt`)
  * Verifies password, enforces device threshold
  * Logs in and issues token securely

* 🚪 `signOut`:
  * Terminates all sessions and clears cookies
  * Differentiates behavior for blocked/deactivated users

* 🧠 `checkUserIsNotVerified`:
  * Validates JWT freshness
  * Logs out user if token expired or compromised

* 🔁 `changePassword`:
  * Verifies old password, encrypts new one
  * Logs out from all devices to reset state

* 🟢 `activateUserAccount`:
  * Reactivates deactivated users (password required)

* 🔴 `deactivateUserAccount`:
  * Deactivates account + logs out from all devices

* 🖥️ `getMyActiveDevices`:
  * Fetches session device info (name, type, last used)

* 🧾 `provideUserAccountDetails`:
  * Shares full user profile + history like `lastLogin`, `passwordChangedAt`, `createdAt`, etc.

---

### 🧠 `internal-api.controllers.js`

Handles **backend-safe APIs** meant for internal triggers and dashboards:

* 🔄 `updateUserProfile`: Updates public fields of user (name, phone, email)
* 🍪 `setRefreshCookieForAdmin`: Sets secure JWT cookie (admin sessions only)
* 📊 `getTotalRegisteredUsers`: Returns total user/admin count for stats

---

### 👨‍💼 `admin.controllers.js`

Holds all **admin capabilities** and is guarded against abuse:

* 🚫 `blockUserAccount`:
  * Validates & blocks user accounts (only non-admins)
  * Logs reason and action timestamp via enums

* 🔓 `unblockUserAccount`:
  * Unblocks user with reversal log and validation

* 📟 `blockDevice`:
  * Blocks a specific device (identified via `deviceID`) from being used again
  * Requires a valid reason from `DEVICE_BLOCK_REASONS` enum
  * Uses `upsert()` to handle both first-time and repeat attempts
  * Logs action with admin traceability and timestamp

* 🔓 `unblockDevice`:
  * Unblocks a previously restricted device
  * Requires proper reason via `DEVICE_UNBLOCK_REASONS` enum
  * Prevents unblocking of already active/unblocked devices
  * Full admin activity logged into `auth.logs`

* 📁 `getUserAuthLogs`:
  * Retrieves log trail for any user — full audit view

* 🧾 `checkUserAccountStatus`:
  * Returns user status snapshot: active, blocked, verified, login activity

* 🧭 `getUserActiveDevicesForAdmin`:
  * Lists active sessions for a target user

---

## 🧠 **Design Principles & Patterns**

| 🧱 Principle / Pattern          | ✅ Where Applied                                                                |
| ------------------------------- | ------------------------------------------------------------------------------ |
| **SRP** (Single Responsibility) | Each controller handles exactly **one category** of behavior                   |
| **DRY** (Don’t Repeat Yourself) | Validations, error handling, logging reused via shared configs/utilities       |
| **Template Method Pattern**     | `signUp` performs fixed steps: input → ID → password → DB → login              |
| **Factory Design Pattern**      | `makeUserID()` encapsulates scalable machine-specific ID generation            |
| **Singleton Pattern**           | Session logic for users is treated as a **singleton per user-device combo**    |
| **Enum-Based Design**           | Block/unblock reasons, auth log types are stored in centralized enums          |
| **Open/Closed Principle**       | Adding new features like `getMyActiveDevices` didn’t alter existing logic      |
| **Trust Boundaries**            | Admins can't modify each other; user access routes are scoped to their session |

---

## 🔐 **Security & Session Governance**

* JWT tokens are generated with machine-safe timestamps
* Tokens are refreshed and reissued upon login or password change
* Device threshold is respected: one user can’t take over another's device
* Every session is linked to `deviceID` and is logged with context

---

## 📈 **Logging & Observability**

Every action, including success and failure, is captured using:

* `logWithTime()`: Timestamped logs for terminal visibility
* `logAuthEvent()`: Centralized persistent auth logs for audit tracking
* `errorMessage()`: Standardized error console printing
* Admin actions are logged with **role-based restrictions**

---

## 🎯 **Final Takeaway**

Your `controllers/` directory is the **backbone of intelligence** for your system. From enforcing **authentication protocols** to enabling **admin moderation**, this module demonstrates:

> 💡 **"Business logic isn't just about data — it's about governance, trust, and design."**

The learnings I applied here—from **SOLID** to **patterns**—weren’t just theory anymore. They manifested in real architectural choices.

🎮 *I didn’t just write routes. I wrote policies.*  
— Powered & Engineered by **Yatharth Kumar Saxena**
