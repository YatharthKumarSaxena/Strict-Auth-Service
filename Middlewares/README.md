# 🧱 Middlewares Folder - Custom Authentication Service

This folder serves as the **guardian layer** between the **Router** and **Controller** layers. It ensures that every incoming request is **validated**, **authorized**, and **sanitized** before hitting the core logic. If any rule is violated, the middleware short-circuits the request with a precise error response, preventing security loopholes and unstable behavior.

---

## 📖 **Introduction**

Throughout my custom authentication service, I followed a **middleware-first architecture** inspired by large-scale backend systems. These middlewares control all aspects of:

* 🔐 Session Management  
* 🛡️ Authorization Checks  
* 🔍 Request Body Validation  
* 🧠 Device Identity Verification  
* ⚙️ Admin & Internal API Routing

> 🧰 This approach gave me deeper understanding of how **Express**, **JWT**, and custom token/session lifecycles come together to build secure and reliable APIs.

---

## 🧠 **Applied Design Principles & Patterns**

### ✅ SOLID Principles:

* **Single Responsibility**: Each middleware does one thing—nothing more.
* **Open/Closed**: New checks can be added without rewriting core logic.
* **Liskov Substitution**: Each function can replace another in chain without breaking behavior.
* **Interface Segregation**: Functions are decoupled and minimal.
* **Dependency Inversion**: Common tools (e.g., `throwError`, `logWithTime`) are used via utilities.

### ✅ DRY & KISS

* Shared logic (like error handling, device checks) is abstracted into utility files.
* Code avoids over-engineering by focusing only on required validation.

### ✅ Design Patterns:

* **Singleton Pattern** – All config/constants are centralized and reused.
* **Factory Pattern** – Errors are thrown using factory-style custom handlers.
* **Template Pattern** – All middlewares follow the same try-catch-validate-next format.

---

## 🗂️ Folder Structure (Total Files: 5)

| 📄 File Name                 | 🧩 Purpose                                                                |
| ---------------------------- | ------------------------------------------------------------------------- |
| `auth.middleware.js`         | Validates user inputs for auth-related operations (sign up, login, etc.)  |
| `common-used.middleware.js`  | Core middlewares for token verification, session check, and account state |
| `helper.middleware.js`       | Shared logic utilities to fetch user from DB and sanitize responses       |
| `admin.middleware.js`        | Restricts access to admin-only routes and cookie setup                    |
| `internal-api.middleware.js` | Secures internal APIs used for system-level services                      |

---

## 📂 File-by-File Breakdown

---

### 📁 1. `auth.middleware.js`

#### 📌 Purpose:

Handles validation of request bodies for:

* `Sign Up`
* `Sign In`
* `Sign Out`
* `Activate / Deactivate Account`
* `Change Password`

#### ✅ Core Features:

* Verifies field lengths using config constants.
* Uses regex for strict pattern checks (`emailRegex`, `numberRegex`, etc).
* Ensures required fields (like password, device ID) are present.
* Differentiates between active vs inactive accounts.
* Ensures passwords are strong (min length, special chars, etc).
* Handles identity conflicts (e.g., user trying to deactivate someone else's account).

#### 🛡️ Security Implication:

Prevents malformed or malicious inputs from reaching database queries or business logic.

---

### 📁 2. `common-used.middleware.js`

#### 📌 Purpose:

This is the **backbone middleware** file containing logic for:

* Token validation  
* Admin user checks  
* Blocked/Deactivated account restrictions  
* Device ID and name validations  

#### ✅ Core Functions:

* `verifyToken()`: Checks access token validity using JWT.  
* `checkUserIsVerified()`: Ensures session has not expired.  
* `isUserBlocked()`: Denies access for blocked users.  
* `isUserAccountActive()`: Stops actions from deactivated accounts.  
* `verifyDeviceField()`: Validates `x-device-uuid`, `x-device-name`, and `x-device-type` headers.  
* `checkDeviceIsNotBlocked()`: Rejects requests from blacklisted devices.  
* `verifySetAdminCookieBody()`: Validates if admin is authorized to set cookies.  

#### 🧠 Design Notes:

* Embedded device field validation eliminates need for a separate middleware file.  
* All token/device operations use centralized config, regex, and enums.  
* Logging and error throwing is consistent via shared utilities.

---

### 📁 3. `helper.middleware.js`

#### 📌 Purpose:

Utility middlewares to be reused across routes:

* `fetchUser()`: Finds user based on provided email, phone, or userID.

#### 🧰 Reusability:

This file was created to avoid repeated DB queries and validation logic across multiple middlewares.

#### 🛡️ Security Impact:

Attaches validated user to request to avoid repeated queries and prevent identity spoofing.

---

### 📁 4. `admin.middleware.js`

#### 📌 Purpose:

Strictly protects routes that should only be used by **system admins**. Primarily used for:

* Setting cookies manually via admin panel  
* Verifying if user is truly admin before giving route access  

#### ✅ Middleware:

* `isAdmin()`: Ensures only admins can proceed.  
* `verifySetAdminCookieBody()`: Validates admin’s access token for cookie setup.  

#### 🔒 Security Guarantee:

Only users with `userType === "ADMIN"` can perform elevated system actions.

---

### 📁 5. `internal-api.middleware.js`

#### 📌 Purpose:

Secures internal routes that are not meant for public clients. These APIs are typically:

* Called by internal systems (cron jobs, dashboards)  
* Used for restricted internal operations  

#### ✅ Middleware:

* `verifyAdminUserViewRequest()`: Validates that a proper reason and identifier are provided to view another user’s profile.  
* `checkUpdateMyProfileRequest()`: Prevents illegal or sensitive field updates like `userID`, `emailID`, etc.  

---

## 🔄 Middleware Request Flow

```
Client ⬅️➡️ Router ➡️ Middleware ➡️ Controller ➡️ DB/Service ➡️ Response
          ⬆️ if error ⬅️
```

* If any validation, token, or session check fails, the middleware layer throws a structured error.  
* Controllers **never run** if middleware conditions are not met.

---

## 🛡️ Responsibilities of Middleware Layer

✅ Validate all fields (lengths, regex, presence)  
✅ Authenticate using both `accessToken` and `refreshToken`  
✅ Track device-level login session (`lastUsedAt`, `requestCount`)  
✅ Check user account states (`isBlocked`, `isActive`, `jwtTokenIssuedAt`)  
✅ Differentiate **admin** vs **normal** user privileges  
✅ Block suspicious/stale requests before controller logic  
✅ Handle errors with exact log context (userID, deviceID, action)

---

## 🎯 **Final Takeaway**

Building this middleware layer was a deep dive into how real-world systems:

* Enforce security at every route entry  
* Track user activity per device  
* Rotate tokens securely  
* Separate admin/internal traffic from general users  

I now understand why large systems **modularize middleware logic** instead of cluttering controllers. It enforces **consistency**, improves **readability**, and creates a **single source of truth** for validation and access control logic.

These 5 files form the **defensive wall** of the entire Custom Auth Service backend.

---
