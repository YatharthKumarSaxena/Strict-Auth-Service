# 🧬 `internal-calls/` — Simulated Internal API Triggers without HTTP Layer

> **I’m the internal trigger gateway.** I allow direct function-level invocation of critical logic, especially when no external API request is involved.

---

## 📖 **Introduction**

The `internal-calls/` folder serves one special purpose: **triggering controller logic internally without hitting REST endpoints**.

Instead of exposing everything to external calls, this mechanism allows controlled access for **trusted internal scripts**, **startup routines**, or **batch processes** — while still enforcing business logic and token-based control.

This is especially useful for things like:

- 🌐 Refreshing cookies on server start
- 🔒 Setting system tokens internally for ADMINs
- 🧪 During **development**, when testing login from terminal
- 🤖 Automation triggers, migrations, or dev tool hooks

---

## 🗂️ **Folder Structure**

> 📦 Total: **1 file**

| 🧩 File Name                              | 📄 Purpose                                                                 |
| ---------------------------------------- | ------------------------------------------------------------------------- |
| `set-admin-access-cookie.internal.js`   | 🍪 Internally sets refresh token cookie for the ADMIN without HTTP request |

---

## ⚙️ **How It Works**

This function simulates the process of issuing a cookie for an already-validated admin during dev/test environments — where HTTP routes aren't invoked, and everything runs from the terminal or scripts.

### ✅ Flow:

1. 🧾 **Validates** that user is of type `"ADMIN"`
2. 🧪 **Creates fake** `req` and `res` objects
3. 🔁 **Calls** `setAccessTokenInCookieForAdmin()` controller
4. 🍪 **Mocks** `res.cookie()` and `res.status().json()` to print info
5. 📡 **Logs** the entire process from start to finish

No actual HTTP involved — only internal logic reuse.

---

## 🧠 **Design Principles Applied**

| 🧱 Principle / Pattern           | ✅ Where Applied                                                  |
| ------------------------------- | ----------------------------------------------------------------- |
| **DRY**                         | Reuses controller logic (`setAccessTokenInCookieForAdmin`)        |
| **SRP** (Single Responsibility) | Only handles internal refresh token setup                         |
| **Encapsulation**               | Hides HTTP simulation inside a clean callable function            |
| **Trust Boundary Enforcement**  | Ensures only ADMINs are permitted to trigger this action          |

---

## ⚠️ **Usage Note**

This file is designed primarily for **development-phase** scenarios such as:

- Auto-login simulation from CLI  
- Testing admin routes without frontend  
- Server-side token regeneration during testing  

It should not be publicly exposed or bundled into production-facing logic.

---

## 🎯 **Final Takeaway**

The `internal-calls/` folder acts like a **bridge between business logic and server bootstrapping**, ensuring **safe, reusable, and isolated** backend flows without needing HTTP calls.

> *Sir, this is what “controlled backend intelligence” looks like — internal, powerful, and secure.*

🔐 Built and orchestrated by **Yatharth Kumar Saxena**
