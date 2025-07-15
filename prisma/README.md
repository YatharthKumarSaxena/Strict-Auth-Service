# 🗄️ Prisma Folder - Database Schemas & Migrations

This folder holds the entire **database schema**, **migration strategies**, and **client configurations** for my custom backend services. I've adopted a **domain separation model** by splitting all Prisma logic into two isolated environments:

- 🔒 `private/` – Internal system tables for admin, logging, and auth-related metadata.
- 🌐 `public/` – End-user-facing tables like users, sessions, tokens, etc.

---

## 📖 **Introduction**

While building this authentication system, I realized that bundling all tables into a single schema becomes hard to scale and maintain. That’s why I created two Prisma environments:

| Folder    | Responsibility |
|-----------|----------------|
| `public/` | All tables used by clients (e.g., users, devices, sessions) |
| `private/` | System-exclusive tables (e.g., admin metadata, logs, internal tokens) |

This setup makes the **codebase modular**, the **permissions more manageable**, and the **migrations much cleaner**.

---

## 🗂️ Folder Structure (Total Folders: 2)

| 📁 Folder Name   | 🧩 Purpose                                                                 |
|------------------|---------------------------------------------------------------------------|
| `🌐 public/`      | Contains `schema.prisma`, `migrations/`, and `README.md` for user-facing tables |
| `🔒 private/`     | Contains `schema.prisma`, `migrations/`, and `README.md` for internal system tables |

Each folder includes its own:

- `schema.prisma` – Defines data models specific to that domain.
- `migrations/` – Prisma-generated SQL changesets for that schema.
- `README.md` – File-specific documentation on what each table and field represents.

---

## 🧠 **Design Philosophy**

- 🧩 **Domain Isolation**: Separates public and private logic to reduce accidental access and enforce strong boundaries.
- ⚙️ **Parallel Migrations**: Each environment runs its own migration lifecycle, preventing accidental overwrite.
- 🛡️ **Security Control**: Keeps admin-only tables inaccessible from public-facing APIs.
- 🔁 **Scalable Schema**: Easier to add microservices or APIs for either side independently.

---

## 🛡️ Responsibilities of `prisma/` Folder

✅ Define type-safe models for all backend operations  
✅ Keep public and private schemas isolated  
✅ Maintain reliable and audited migrations  
✅ Connect Prisma Client to appropriate database connections  
✅ Act as the foundation for validations, enums, and relationships  

---

## 📚 Navigate to Subfolders

- 🔗 [📂 `public/`](./public/README.md): Understand how user data, tokens, sessions, and devices are modeled.
- 🔗 [📂 `private/`](./private/README.md): Understand internal metadata like admin logs, secret keys, etc.

---

## 🎯 **Final Takeaway**

Prisma isn't just an ORM—it's a **schema-first thinking tool**. By modularizing the public and private domains, I was able to:

- Gain **clarity** over user vs system data.
- Simplify **access control** and internal-only validations.
- Prevent **migration conflicts** and accidental leaks.

This folder serves as the **foundation of data integrity** across my entire authentication system.

---
