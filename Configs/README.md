# 🛠️ `configs/` — Environment-Aware Configurations for Secure & Dynamic System Behavior

> **I’m the `README.md` for the brain of your backend.** Every config here adapts the system to run across environments, manage limits, enforce rules, and follow best practices without touching core code.

---

## 📖 **Introduction**

This folder acts as the **central nervous system** of the strict authentication service — from cookies to cron jobs, rate limits to regex. All reusable configuration values and control switches live here.

By externalizing logic into modular config files, this service becomes:

* 🔁 **Flexible across environments** (local, staging, production)
* 🔐 **More secure** (less hardcoding)
* 🧠 **Easier to maintain and scale** (centralized updates)

---

## 🗂️ **Folder Structure**

> 📦 Total: **23 files**

| 🧩 Config File                   | 📄 Purpose                                                               |
| -------------------------------- | ------------------------------------------------------------------------ |
| `admin-id.config.js`             | 👑 Combines admin ID using prefix, IP code and number from env           |
| `admin-user.config.js`           | ⚙️ Admin auto-creation logic, bcrypt password, Prisma ORM, logging       |
| `http-status.config.js`          | 🌐 Common HTTP status codes mapped for consistency                       |
| `app-limits.config.js`           | 📝 Limits like `USER_REGISTRATION_CAPACITY` pulled from `.env`           |
| `auth-log-events.config.js`      | 🔐 Enum list of allowed auth actions: LOGIN, REGISTER, etc.              |
| `cookies.config.js`              | 🍪 Config for `httpOnly`, `secure`, `domain`, `sameSite` cookie flags    |
| `cron.config.js`                 | ⏰ Scheduled jobs for cleanup: users, logs, device rate limits            |
| `db.config.js`                   | 🛢️ Exports `DB_NAME` and `DB_URL` from environment variables            |
| `device-enum-reasons.config.js`  | 🚫 Reasons for blocking/unblocking a device (suspicious, reported, etc.) |
| `device-type.config.js`          | 💻 Enum list of devices: MOBILE, LAPTOP, TABLET                          |
| `error-handler.config.js`        | 🛡️ Reusable error handling responses (access denied, invalid, blocked)  |
| `fields-length.config.js`        | ✍️ Field lengths: name, password, phone, email, OTP, device name, etc.   |
| `id-prefixes.config.js`          | 🪪 Prefixes for userID: ADM for admin, CUS for customers                 |
| `ip-address.config.js`           | 🌍 Unique IP identifier used in admin/user ID composition                |
| `performed-by.config.js`         | 🧑‍💻 Who triggered the action? USER / ADMIN / SYSTEM (enum)             |
| `rate-limit.config.js`           | 🚦 Rate limiter rules per device and per user-device                     |
| `regex.config.js`                | 🔎 All important regex: UUID, email, phone, name, password, etc.         |
| `security.config.js`             | 🔐 SALT for bcrypt, JWT secret & expiry pulled from env                  |
| `server-error-handler.config.js` | 🔥 Middleware to handle malformed JSON and uncaught exceptions           |
| `server.config.js`               | ⚙️ Safely exports port number from `.env`                                |
| `uri.config.js`                  | 📌 All route prefixes — `/auth`, `/admin`, `/users`, `/internal`         |
| `user-enums.config.js`           | 🎭 Enums for user types, immutable fields, block/unblock options         |
| `validation-rules.config.js`     | 🧪 Strong regex validation for name, email, phone, password, etc.        |

---

## 🧠 **Design Principles & Patterns**

| 🧱 Principle / Pattern               | ✅ Where Applied                                                         |
| ------------------------------------ | ----------------------------------------------------------------------- |
| **DRY** (Don’t Repeat Yourself)      | Error messages, URI constants, rate limits, enums                       |
| **YAGNI** (You Aren’t Gonna Need It) | Only essential configurations and enums included                        |
| **KISS** (Keep It Simple, Stupid)    | Modular separation of concerns, clearly scoped files                    |
| **SOLID**                            | SRP: Each config handles exactly one domain (errors, enums, routes...) |
| **Environment-Driven Configs**       | `.env` is central for ports, DB, salts, schedules, etc.                |
| **Enum-Based Design**                | Extensively used for event names, reasons, device types, and performers|

---

## 🎯 **Final Takeaway**

The `configs/` folder is your project’s **foundation of maintainability** and **operational intelligence**.

> Instead of scattering logic across code, you’ve centralized control, making your system:
>
> * Highly **adaptable**
> * Easy to **scale or patch**
> * Much **safer to operate**

🎓 *That’s how professionals build for the real world.*

— Engineered precisely by **Yatharth Kumar Saxena** 🧠
