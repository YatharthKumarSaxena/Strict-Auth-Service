# 📘 Custom Authentication Service

Welcome to the **Custom Authentication Service**, a secure and scalable backend authentication system engineered using **Node.js**, **Express.js**, and **MongoDB**, designed with industry-grade practices such as **Rate Limiting**, **Single-Device Tracking**, and **Token Rotation (JWT)**. This project is structured with modularity, reusability, and production-readiness in mind, powered by real-world system design and software engineering principles.

---

## 🧭 Table of Contents
- 📖 [Introduction](#-introduction)
- 🧪 [Features](#-features)
- 🔧 [Tech Stack](#-tech-stack)
- 🧠 [Design Principles & Patterns](#-design-principles--patterns)
- 🧱 [Folder Structure](#-folder-structure)
- 🛠️ [Environment Variables](#-environment-variables)
- 🚦 [Rate Limiting Logic](#-rate-limiting-logic)
- 🧪 [Testing Strategy](#-testing-strategy)
- 🧬 [Planned Enhancements](#-planned-enhancements)
- 🎯 [Final Takeaway](#-final-takeaway)

---

## 📖 **Introduction**

This monolithic authentication backend is engineered to support:
- Secure account creation with **single active session per user**
- Refresh and access token generation with custom expiry
- Custom JWT validation middleware
- Admin auto-creation at server start
- Per-device rate limiting for brute-force prevention
- Intelligent logging for each action (e.g., sign in, sign out, register)
- APIs to **block** or **unblock** device access manually (admin-controlled)

The **entry point** for this project is [`server.js`](./server.js), where all major components are initialized including:
- MongoDB connection
- Admin account bootstrap
- Centralized route mounting
- Global error and 404 handling
- Cron job triggers

---

## 🧪 **Features**

| 🔹 Feature                          | ✅ Implemented |
|------------------------------------|----------------|
| **Single-Device Login Enforcement**| ✔️             |
| JWT Token Generation & Rotation    | ✔️             |
| Rate Limiting per Device & Route   | ✔️             |
| Admin Auto-Creation at Startup     | ✔️             |
| Authentication Logs                | ✔️             |
| Centralized Error Handling         | ✔️             |
| Cookie Parser + JSON Body Parsing | ✔️             |
| Cron Job Integration               | ✔️             |
| Intelligent 404 Rate Monitoring    | ✔️             |
| **Block/Unblock Device API**       | ✔️             |

---

## 🔧 **Tech Stack**

- **Node.js**: Runtime
- **Express.js**: Web framework
- **MongoDB + Prisma**: NoSQL DB with schema modeling
- **JWT**: Token-based authentication
- **dotenv**: Environment config management
- **cookie-parser**: For handling cookies
- **uuid**: For generating `deviceID`

---

## 🧠 **Design Principles & Patterns**

### ✅ Design Principles

| Principle        | Full Form                                                                 | Usage                                                  |
|------------------|---------------------------------------------------------------------------|--------------------------------------------------------|
| **SOLID**        | Single Responsibility, Open-Closed, Liskov Substitution, Interface Segregation, Dependency Inversion | Modular services, controllers, utils follow SRP       |
| **DRY**          | Don’t Repeat Yourself                                                     | Reused logic across tokens, logging, error handlers    |
| **KISS**         | Keep It Simple, Stupid                                                    | Clear token logic, admin setup kept straightforward    |
| **YAGNI**        | You Aren’t Gonna Need It                                                  | Avoided premature scaling or over-engineering          |

### ✅ Design Patterns Used

| Pattern              | Purpose                                                                |
|----------------------|------------------------------------------------------------------------|
| **Singleton**        | MongoDB connection, express server bootstrap                          |
| **Factory**          | Token generation utility with expiry injection                        |
| **Template Method**  | Used in log writing & token validation flow (extendable blueprint)     |
| **Observer** (simulated) | Setup ready for future log-subscriber or event-bus design          |

---

## 🧱 **Folder Structure**

> 📦 Total **11 folders** and **5 files** are present in this project directory.

### 📁 Folders

| Folder Name            | Description |
|------------------------|-------------|
| 📁 `rate-limiters/`    | Device & route-specific rate limit services |
| 📁 `controllers/`      | Handles business logic for auth routes       |
| 📁 `configs/`          | Configuration files for DB, server, tokens   |
| 📁 `middlewares/`      | JWT auth, global error, malformed JSON etc.  |
| 📁 `utils/`            | Utility functions like token creation, logs  |
| 📁 `services/`         | Handles internal logic like limiter service  |
| 📁 `routes/`           | Route entry-point for all modules            |
| 📁 `prisma/`           | Prisma schema and database access layer      |
| 📁 `cron-jobs/`        | Server-triggered tasks on boot               |
| 📁 `internal-calls/`   | For internal microservice/API interaction    |
| 📁 `node_modules/`     | Auto-installed dependencies (ignored in Git) |

### 📄 Files

| File Name               | Description                                  |
|-------------------------|----------------------------------------------|
| `server.js`             | 🎯 Entry point — starts DB, routes, admin    |
| `.env.example`          | 🌐 Sample environment configuration          |
| `package.json`          | 📦 Project metadata and script definitions   |
| `package-lock.json`     | 🔒 Locked dependency tree for consistent build |
| `.gitignore`            | 🚫 Files/directories ignored in version control |

---

## 🛠️ **Environment Variables**

(*Same as earlier — no changes required unless new secrets are introduced for block/unblock APIs.*)

---

## 🚦 **Rate Limiting Logic**

The logic remains focused on **device-based** tracking, but now it enforces **single device session per user**. If the user tries to log in from another device, the older one is invalidated unless explicitly logged out.

Also:
- Devices can be **blocked manually** by the admin using the block device API.
- Blocked devices are prevented from making any further requests unless unblocked.

> DeviceID plays a critical role in both **rate limiting** and **access enforcement**.

---

## 🧪 **Testing Strategy**

In addition to earlier cases, following have been tested:

### 📛 Device Blocking Tests:
- ✅ Access denied from blocked device
- ✅ Unblock restores access
- ✅ Attempt to use refresh token from blocked device is rejected

---

## 🧬 **Planned Enhancements**

| 🔮 Enhancement                     | Priority | Notes |
|----------------------------------|----------|-------|
| Role-Based Access Control (RBAC) | 🔺 High   | Allow role assignment to users (e.g., ADMIN, MODERATOR, USER) |
| OTP-Based Authentication         | 🔺 High   | Add SMS/Email-based OTPs for passwordless login |
| API Rate Limits per User Tier    | 🔸 Medium | Different limits for free vs. premium accounts |
| MongoDB Index Optimization       | 🔸 Medium | Speed up query performance and reduce latency |
| Test Automation                  | 🔹 Low    | Integrate with CI/CD for robust test coverage |

---

## 🎯 **Final Takeaway**

This updated Strict Auth backend narrows down to a **single-device secure session system**, eliminating ambiguity and enabling administrators to **control device access** through direct APIs. It simulates the authentication needs of **banking apps**, **sensitive enterprise tools**, or **IoT platforms**, where **session control** and **device-level trust** are paramount.

### 💡 What You’ll Learn from This Repo:
- How to restrict user login to one device at a time
- How to implement manual device blocking logic
- How to scale secure auth systems for production
- How to track request behavior route-by-route per device
- How to enforce token validity even after logout or block

---

> 📍 Designed & Engineered with Precision by **Yatharth Kumar Saxena** 🚀
