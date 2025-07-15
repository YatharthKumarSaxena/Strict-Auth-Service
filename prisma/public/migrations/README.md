# 🗃️ Prisma Migrations Folder

This folder is automatically generated and managed by Prisma every time a schema change is introduced in your `schema.prisma` file. It is an essential part of Prisma’s migration system and ensures that your application’s database schema evolves in a **version-controlled**, **trackable**, and **reproducible** manner.

---

## 🧠 Purpose

- Maintain **a history of schema changes** in the form of timestamped migration folders.
- Enable safe application of changes to **development**, **staging**, or **production** databases.
- Ensure consistency between the codebase and the actual database structure.
- Allow developers to **roll back** to previous versions if a migration causes issues.
- Serve as a source of truth for how your database schema has evolved over time.

---

## ⚙️ When is this folder updated?

Every time you run the following command:

```bash
npx prisma migrate dev --name <meaningful-name>
