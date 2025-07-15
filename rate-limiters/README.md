# 🚦 `rate-limiters/` — Centralized API Rate Limiting Middleware

This folder implements a **robust rate limiting system** to control how frequently clients can hit your API.  
Built using the **Factory Design Pattern**, the logic is divided into general and special-purpose middleware:

- ✅ `userID + deviceID` → for **authenticated** APIs
- ✅ `deviceID only` → for **unauthenticated** or **public** APIs

---

## 📖 **Introduction**

Rate limiting is critical for:

- Preventing abuse and brute-force attacks
- Throttling sensitive actions (like password change, account deactivation)
- Protecting public endpoints from spamming or botting

This system uses Prisma with `public.prisma` and `private.prisma` clients to track request metadata.

---

## 🗂️ **Folder Structure**
This folder contains 3 files in total:

| 📄 File Name                     | 🧠 Description                                                                 |
|----------------------------------|-------------------------------------------------------------------------------|
| `create-rate-limiter-factory.js` | 📦 Factory logic to create rate limiters based on user/device or device only |
| `general-api.rate-limiter.js`    | 🔐 Rate limiters for access-token-protected APIs (userID + deviceID)         |
| `special-api.rate-limiter.js`    | 📴 Rate limiters for public-facing APIs like signup/signin (deviceID only)    |

---

## 📄 **File: create-rate-limiter-factory.js**

### ✅ `createRateLimiter(maxRequests, timeWindowInMs)`
Used in **authenticated** routes (where `userID` and `deviceID` are both available).

- Ensures user is valid and device belongs to them.
- Tracks `requestCount` and `lastUsedAt` from `public.prisma.device`.
- If request count exceeds `maxRequests` within `timeWindowInMs`, user is blocked temporarily.
- Headers like `X-RateLimit-Remaining`, `Retry-After` are returned.

### ✅ `createDeviceBasedRateLimiter(maxRequests, timeWindowInMs)`
Used in **unauthenticated** or **open** routes (like login or signup).

- Only `deviceID` is tracked.
- Uses `private.prisma.deviceRateLimit` table.
- Manages fields: `attempts` and `lastAttemptAt`.
- Helps avoid abuse before authentication happens.

Both functions return an **Express middleware function**.

---

## 📄 **File: general-api.rate-limiter.js**

Used for **access-token protected routes**, where `req.user.userID` and `req.deviceID` are both validated.

Each route pulls its limit config from `rate-limit.config.js > perUserAndDevice`.

### 🧪 Common APIs using this:
- Sign Out
- Change Password
- Block/Unblock User/Device
- Deactivate Account
- View Devices or Auth Logs
- Update User Profile
- Admin User Detail Fetch

### 📦 Sample Usage:
```js
const signOutRateLimiter = createRateLimiter(config.signout.maxRequests, config.signout.windowMs);
const changePasswordRateLimiter = createRateLimiter(config.changePassword.maxRequests, config.changePassword.windowMs);
```

---

## 📄 **File: special-api.rate-limiter.js**

Used for **unauthenticated routes** or sensitive open routes, where only `deviceID` is tracked.

These APIs usually do not have access tokens (or userIDs), so device-level tracking is enforced.

### 🧪 Common APIs using this:
- Sign Up
- Sign In
- Activate Account
- Malformed/Wrong Request Protection (custom rule: 3 requests per 15s)

### 📦 Sample Usage:
```js
const signUpRateLimiter = createDeviceBasedRateLimiter(config.signup.maxRequests, config.signup.windowMs);
const malformedAndWrongRequestRateLimiter = createDeviceBasedRateLimiter(3, 15_000);
```

---

## 🧠 **Design Summary**

| Component                        | Tracks By         | Applies On                  |
|----------------------------------|-------------------|-----------------------------|
| `createRateLimiter()`            | `userID + deviceID` | Authenticated APIs        |
| `createDeviceBasedRateLimiter()` | `deviceID only`     | Unauthenticated/Public APIs|

---

## 🛡️ **Rate Limiting Tables Used**

| 📚 Database        | 🗃️ Table             | 🧩 Fields Tracked                          |
|--------------------|----------------------|--------------------------------------------|
| `public.prisma`    | `device`             | `requestCount`, `lastUsedAt`               |
| `private.prisma`   | `deviceRateLimit`    | `attempts`, `lastAttemptAt`                |

---

## 🧾 **Rate Limiter Headers Set**

Each limiter sets the following headers in the response:

| Header                  | Description                                         |
|--------------------------|-----------------------------------------------------|
| `X-RateLimit-Limit`     | Total allowed requests in the current time window   |
| `X-RateLimit-Remaining` | Remaining requests before hitting the limit         |
| `X-RateLimit-Reset`     | Time in seconds until the window resets             |
| `Retry-After`           | Sent **only** when user has exceeded the request cap|

---

## 🎯 **Final Takeaway**

This `rate-limiters/` folder modularizes and scales your security layer through:

- 🔒 Smart user-device-based protection for authenticated routes
- 🔐 Device-only throttling for sensitive open APIs
- 🏭 Factory Pattern for DRY, reusable middleware
- 💾 Prisma-based persistent request tracking

> This isn’t just rate-limiting — it’s your **first defense layer**  
> against bots, brute-force attacks, and abusive API usage.

---
