# 🧠 `clients/` — Prisma Clients for Private & Public Schemas

> **I’m the `README.md` file of this folder to assist you.**  
> My job is to introduce the dual-database access architecture — a clean split between internal (`private`) and external (`public`) data models for secure, scalable access in your authentication system.

---

## 📖 **Introduction**

In a strict-auth environment, schema isolation isn't just a choice — it’s a necessity. The `clients/` folder embodies this architectural mindset by exporting **two separate Prisma clients**:

- `privatePrisma` → for internal use only (users, logs, devices, etc.)
- `publicPrisma` → for exposed/public data models (like banners, marketing, etc.)

Each Prisma client is connected to its respective `.prisma/` schema, allowing your services to maintain **least-privilege access**, cleaner logs, and better separation of concerns.

> 🧬 We’re not just building services. We’re engineering secure data boundaries.

---

## 🗂️ **Folder Structure**

> 📦 Total: **2 files**

| 🧩 Client File             | 📄 Purpose                                                                 |
| ------------------------- | -------------------------------------------------------------------------- |
| `private.prisma.js`       | 🛡️ Initializes Prisma client for the `private` schema via `.prisma/private` |
| `public.prisma.js`        | 🌐 Initializes Prisma client for the `public` schema via `.prisma/public`   |

---

## 🧠 **Design Principles & Practices**

| 🧱 Principle / Practice         | ✅ Applied Here                                                           |
| ------------------------------ | ------------------------------------------------------------------------- |
| **SRP (Single Responsibility)** | Each file handles exactly one client — `private` or `public`             |
| **Separation of Concerns**      | Schemas and queries are isolated based on domain sensitivity             |
| **Least Privilege Access**      | Public Prisma client cannot access sensitive user/auth-related data      |
| **Scalability-Oriented Design** | Multiple DBs or schemas can be handled without touching business logic   |
| **Clean Code Philosophy**       | Minimal exports, clear intent, easy to inject in services/controllers     |

---

## 🎯 **Final Takeaway**

The `clients/` folder is a **silent yet strategic player** in your backend’s security and maintainability.

> By keeping Prisma clients modular and schema-aware:
> 
> * You ensure **strict access control**
> * You boost **code readability and testability**
> * And you future-proof your services against schema bloat

🧠 *This is how scalable and secure systems are truly built.*

— Engineered precisely by **Yatharth Kumar Saxena**
