# ⚙️ `services/` — Core Business Services Layer

This folder contains modular and reusable **business logic services** that power various operations like:

- API Rate Limiting  
- UserID Generation  
- Access Token Construction  

Each service in this folder **abstracts internal complexity** from the routes and controllers — enabling code reuse, separation of concerns, and testability.

---

## 🗂️ **Folder Structure**

This folder contains 3 main files:

| 📄 File Name              | 🔧 Purpose                                                                 |
|---------------------------|--------------------------------------------------------------------------|
| `rate-limiter.service.js` | Rate-limiting logic for `deviceID + routeKey` combo using Prisma         |
| `token.service.js`        | Token generation and login logging for all users                         |
| `userID.service.js`       | Responsible for generating globally unique, machine-prefixed userIDs     |

---

## 📄 `rate-limiter.service.js` — 🚦 Device + Route Based API Rate Control

### 📌 Purpose:
Implements **per-device + per-route** API throttling using Prisma. Tracks how many requests a device has made to a specific route in a defined time window.

### 🔐 Core Logic:

#### ✅ `getRateLimitMeta(deviceID, routeKey)`
- Fetches existing rate limit record from `prismaPrivate.rateLimit`
- If record doesn't exist, returns a default object (zero requests, epoch start date)

#### ✅ `shouldBlockRequest(requestCount, lastRequestAt)`
- Returns `true` if:
  - Request count exceeds `REQUEST_LIMIT` (default = 5)
  - Time since last request is within `TIME_WINDOW_MS` (default = 1 min)

#### ✅ `incrementRateLimitCount(deviceID, routeKey)`
- Either increments existing count or creates a new entry with count = 1
- Uses Prisma’s `upsert` to handle both insert/update in one query

### 🧠 Design Principles Applied:
| Principle/Pattern   | How it's applied                                                                 |
|---------------------|----------------------------------------------------------------------------------|
| **SRP**             | File handles only rate-limiting persistence and logic                           |
| **Encapsulation**   | All internal tracking logic hidden behind exported functions                    |
| **Reusable**        | Can be used by any route — just pass `deviceID` and `routeKey`                  |

---

## 📄 `token.service.js` — 🔐 Token-based Sign In Utility

### 📌 Purpose:
Logs login activity and generates **access tokens** via utility method `makeTokenWithPrismaID`.

### 🔧 Exports:

#### ✅ `signInWithToken(req, res)`
- Logs which method was used for verification (`req.verifyWith`)
- Calls token utility to issue a new access token for user
- Returns token string (or empty string if token generation fails)

### 🔥 Internally Uses:
- `makeTokenWithPrismaID()` from `utils/issue-token.utils.js`
- `logWithTime()` to time-stamp all logins

### 🧠 Design Highlights:
| Principle/Pattern | How it’s used                                                       |
|-------------------|---------------------------------------------------------------------|
| **SRP**           | Only responsible for issuing token and logging method              |
| **Abstraction**   | Token generation delegated to external utility                     |
| **Loose Coupling**| No direct DB access or business rules inside — all delegated out    |

---

## 📄 `userID.service.js` — 🆔 Unique UserID Generation System

### 📌 Purpose:
Generates **globally unique userIDs** based on machine code and a centralized counter document using `prismaPrivate.counter`.

### 💡 Process Breakdown:

1. Checks if a counter with ID `"CUS"` exists.
2. If yes, increments the counter and returns the new sequence number.
3. If no, creates the counter and sets initial `seq = 1`.
4. Combines:
   - `customerIDPrefix` (e.g., "CUS")
   - `IP_Address_Code` (machine code)
   - Total registrations (`seq`)
   - `adminUserID` base offset
5. Constructs the final UserID:  
   `CUS` + `MachineCode` + `Counter`

---

### 🔧 Exported Functions:

#### ✅ `makeUserID(res)`
- Manages counter existence
- Checks machine capacity using `userRegistrationCapacity`
- Constructs and returns final ID  
- Returns empty string on any failure or capacity breach

#### ✅ `increaseCustomerCounter(res)`
- Uses Prisma `.update()` to increment counter with ID `CUS`

#### ✅ `createCustomerCounter(res)`
- Creates new document if `CUS` doesn’t exist

---

### 🧠 Design Principles & Patterns Used:

| Principle/Pattern       | Description                                                                 |
|--------------------------|----------------------------------------------------------------------------|
| **SRP**                 | Each function has exactly one responsibility (create, increment, generate) |
| **Singleton Pattern**   | Only one counter record exists per machine (`id = "CUS"`)                  |
| **Factory Pattern**     | Final ID is generated from fixed steps using dynamic input (`makeUserID()`)|
| **Open-Closed Principle** | Easy to extend (e.g., different user types) without modifying existing code |

---

## 🔗 Dependencies Used Across Services

| Package/Module          | Role                                                             |
|--------------------------|------------------------------------------------------------------|
| `prismaPrivate`          | Database layer for private access (userID, rate limit, counter) |
| `logWithTime()`          | Timestamped logs for debugging and tracking                     |
| `throwInternalServerError()` | Graceful failover in production environments                 |
| `app-limits.config.js`  | Custom machine-level constants (limits, prefixes, etc.)          |

---

## 🎯 **Final Takeaway**

This `services/` layer centralizes **critical backend functionalities** that are:

- 🔐 Secure (rate limiting, ID uniqueness)
- 📦 Reusable (across controllers and routes)
- 📐 Pattern-aligned (Factory, Singleton, SRP)
- 🧱 Scalable (easy to extend, plug-n-play style)

> Services are the true engine room of your application.  
> With proper design, you reduce bugs, duplication, and complexity across the entire codebase.

