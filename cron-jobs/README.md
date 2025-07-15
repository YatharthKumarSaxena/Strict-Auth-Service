# ⏰ `cron-jobs/` — Background Automation & Scheduled Cleanups

> **I’m the `README.md` of this folder — documenting the silent janitor bots that keep your system lean and performant.** 🧹🧠

---

## 📖 **Introduction**

Welcome to the `cron-jobs/` folder — the **automated task hub** of your authentication service.  
These scripts run quietly in the background, performing periodic **cleanup operations** that protect system hygiene and resource efficiency.

By using `node-cron`, each job is **timed, scoped, and modular** — with dynamic control via `cron.config.js`.

This ensures:

- 🧼 **Old auth logs** don’t bloat your database.
- 🪦 **Inactive users** are retired gracefully.
- 🚫 **Rate limit traces** don’t accumulate forever.
- 🧠 Every deletion is **logged and auditable**.

---

## 🧭 Table of Contents

- 🗂️ [Folder Structure](#-folder-structure)
- ⚙️ [Cron Job Responsibilities](#-cron-job-responsibilities)
- 🧠 [Design Principles & Patterns](#-design-principles--patterns)
- 🎯 [Final Takeaway](#-final-takeaway)

---

## 🗂️ **Folder Structure**

> 📦 Total: **5 files**

| 📄 File Name                         | 🧾 Description |
|--------------------------------------|----------------|
| `index.js`                           | 🔁 Boots all cron jobs — imported in `server.js` to activate schedules |
| `cleanup-auth-logs.job.js`          | 🗑️ Deletes old authentication logs older than `N` days (from `auth.logs`) |
| `delete-deactivated-users.job.js`   | ⚰️ Removes `isActive: false` users who’ve been deactivated beyond retention threshold |
| `cleanup-device-rate-limiter.job.js`| 📉 Cleans `deviceRateLimit` entries that are stale or expired |
| `README.md`                          | 📚 You’re reading it — the documentation of your time-bound janitors |

---

## ⚙️ **Cron Job Responsibilities**

### 🗑️ `cleanup-auth-logs.job.js`
- Deletes old authentication logs from `authLog` table
- Triggered via `authLogCleanup.cronSchedule`
- Skips if invalid config (e.g., 0 retention days)
- Logs activity using `logAuthEvent()` with `CLEAN_UP_AUTH_LOGS`

### ⚰️ `delete-deactivated-users.job.js`
- Removes users with `isActive: false` and `userType: CUSTOMER`
- Only runs for users deactivated longer than threshold in `cron.config.js`
- Retains admin users by design
- Logs deletions with `CLEAN_UP_DEACTIVATED_USER` in system logs

### 📉 `cleanup-device-rate-limiter.job.js`
- Targets stale entries from `deviceRateLimit` table
- Frees up rate limiter memory usage over time
- Ensures cleaner rate-limiter enforcement system
- Logs cleanup using `CLEAN_UP_DEVICE_RATE_LIMIT`

### 🔁 `index.js`
- Central import/export hub for all cron jobs
- Triggered inside your main `server.js` or `startup.js`
- Ensures **modular isolation** and easy scalability

---

## 🧠 **Design Principles & Patterns**

| ✅ Principle / Pattern            | 💡 Where Applied |
|----------------------------------|------------------|
| **Factory Control via Config**   | Jobs can be turned on/off via `cron.config.js` flags |
| **Fail Fast**                    | Invalid configs (e.g., 0 days retention) halt execution early |
| **SRP (Single Responsibility)**  | Each job manages only one cleanup operation |
| **DRY**                          | Common utilities like `logAuthEvent()` and `logWithTime()` reused |
| **Auditable Design**            | Every deletion creates a corresponding `auth.logs` entry (`SYSTEM_BATCH_CRON`) |
| **TimeZone Safe**               | All jobs use `cron.schedule(..., { timezone })` for global compatibility |
| **Resilient Error Handling**     | `try-catch` structure with uniform error tracing via `errorMessage()` |

---

## 🎯 **Final Takeaway**

The `cron-jobs/` folder represents **backend maturity** — enabling automatic, secure, and monitored background jobs without relying on manual triggers.

Whether it’s:

- ✂️ Shrinking deadweight logs,  
- 🪦 Retiring stale accounts,  
- 💥 Flushing expired rate limit entries,  
- 📖 Logging system-level events for audits,  

…you’ve built a **self-healing backend** powered by **scheduled intelligence**.

> Engineered with foresight by **Yatharth Kumar Saxena**  
> Let this folder be your backend’s **janitor & guardian** — working silently but effectively. ⏳🧹
