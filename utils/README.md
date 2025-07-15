# 🧰 `utils/` — Central Utility Toolkit

Welcome to the **utility engine** of the backend system. This folder houses independent, reusable modules that perform:

- Logging
- Validation
- Token & Cookie handling
- Device utilities
- Auth logging
- Rate checks

Every file here is **plug-and-play**, designed with **SRP**, **clean abstractions**, and easily testable logic. Most utilities are consumed directly in services, middlewares, or controllers.

---

## 🗂️ **Folder Structure**

Total Files: **10**

| 📄 File Name                    | 🧩 Description                                                                 |
|-------------------------------|------------------------------------------------------------------------------|
| `auth-log-utils.js`           | 📘 Logs authentication events (register, login, admin actions, etc.)        |
| `auth.utils.js`               | 🔐 Validates identifier, email, phone, and manages login/logout logic       |
| `cookie-manager.utils.js`     | 🍪 Sets and clears `accessToken` cookie securely                            |
| `device.utils.js`             | 📱 Device registration, threshold check, session expiry handling            |
| `extract-token.utils.js`      | 🪪 Extracts access token from incoming cookie payload                       |
| `field-validators.js`         | ✅ Generic validation helpers for regex and length                          |
| `issue-token.utils.js`        | 🔑 Creates signed JWT tokens and logs token events                          |
| `time-stamps.utils.js`        | 🕒 Logs everything with timestamp + duplicate suppression                   |
| `token-headers.utils.js`      | 📤 Adds token headers to HTTP response for FE sync                          |
| `user-validators.js`          | 📋 Validates user input: name, phone, email, password, country code, etc.   |

---

## 📄 `auth-log-utils.js` — 📘 Logging Authentication Events

### ✅ Purpose:
- Logs all major user events like login, logout, registration, etc.
- Automatically attaches `userID`, `deviceID`, `deviceName`, `performedBy`, and custom reasons (for admin actions)

### 🛠️ Functions:
- `logAuthEvent(req, eventType, logOptions)`
- `adminAuthLogForSetUp(user, eventType)`

### 🎯 Highlights:
- **SRP**: Each log is consistent, versioned, and properly structured.
- **Custom filter support**: Useful for auditing systems.

---

## 📄 `auth.utils.js` — 🔐 Identity, Login & Logout Logic

### ✅ Purpose:
- Verifies if the user already exists (email/phone)
- Manages login, logout (full), and identifier validation

### 🛠️ Functions:
- `checkAndAbortIfUserExists(email, phone, res)`
- `loginTheUser(user, device, res)`
- `logoutUserCompletely(user, res, req, context)`
- `validateSingleIdentifier(req, res, source)`
- `createFullPhoneNumber(req, res)`
- `checkPasswordIsValid(req, user)`
- `isAdminID(userID)`

### 📐 Design Notes:
- **SRP**: Only handles auth-related support logic
- **Fail-Safe**: Catches edge cases like partial inputs and ensures clean response exits

---

## 📄 `cookie-manager.utils.js` — 🍪 Secure Token Cookie Handling

### ✅ Purpose:
- Sets and clears the `accessToken` cookie for frontend auth handling

### 🔧 Functions:
- `setAccessTokenCookie(res, token)`
- `clearAccessTokenCookie(res)`

### 🧠 Notes:
- Secure flags handled from config (`httpOnly`, `sameSite`, `secure`)
- Logging baked in

---

## 📄 `device.utils.js` — 📱 Device Management & Session Expiry

### ✅ Purpose:
- Checks if a device is already assigned
- Logs out old sessions if they expire
- Registers device on successful login

### 🛠️ Functions:
- `getDeviceByID(user, deviceID)`
- `checkUserDeviceLimit(req, res)`
- `checkDeviceThreshold(req, res)`
- `createDevice(req, res)`

### 🎯 Design Elements:
- **SRP**: Works solely on `prisma.device`
- **Edge-Handled**: Includes session expiry check and reassignment of device

---

## 📄 `extract-token.utils.js` — 🪪 Token Extraction

### ✅ Purpose:
- Simple utility to extract JWT token from cookies

### Function:
- `extractAccessToken(req)`

---

## 📄 `field-validators.js` — ✅ Generic Validators

### ✅ Purpose:
- Tiny helpers to validate string lengths and regex compliance

### Functions:
- `validateLength(str, min, max)`
- `isValidRegex(str, regex)`

### Used In:
- `user-validators.js`
- `email`, `password`, `name` validators

---

## 📄 `issue-token.utils.js` — 🔑 Access Token Generator

### ✅ Purpose:
- Signs token using `jsonwebtoken`
- Logs successful token issuance

### Functions:
- `makeTokenWithPrismaID(req, res)`
- `makeTokenWithPrismaIDForAdmin(user)`

### 📦 Highlights:
- Logs using `logAuthEvent()` and `adminAuthLogForSetUp()`
- Signs token using `secretCodeOfAccessToken` from config

---

## 📄 `time-stamps.utils.js` — 🕒 Timestamped Logging Utility

### ✅ Purpose:
- Logs messages with ISO timestamp
- Suppresses duplicate logs within session using in-memory `Set`

### Functions:
- `logWithTime(...args)`
- `getTimeStamp()`

---

## 📄 `token-headers.utils.js` — 📤 Attach Access Token Headers

### ✅ Purpose:
- Adds refreshed token and flags to HTTP headers (used in token refresh scenarios)

### Function:
- `setAccessTokenHeaders(res, accessToken)`

---

## 📄 `user-validators.js` — 📋 User Field Validations

### ✅ Purpose:
Validates all user-specific fields:
- Name
- Email
- UserID
- Phone number
- Password
- Country code

### 🧪 Each Validator Checks:
- ❗ Correct length
- ❗ Regex match
- ❗ Throws structured error if invalid

### Validators:
- `isValidName(name, res)`
- `isValidEmail(email, res)`
- `isValidUserID(userID, res)`
- `isValidFullPhoneNumber(phone, res)`
- `isValidPassword(password, res)`
- `isValidCountryCode(code, res)`
- `isValidNumber(number, res)`

---

## 🎯 **Final Takeaway**

This `utils/` folder acts as the **silent backbone** of your entire backend. Whether it’s token issuance, field validation, device control, or auth logging — these utilities ensure:

- 🔁 Reusability
- 🧱 Maintainability
- ✅ Clean separation of concerns
- ⛔ Centralized error handling

> Utilities are where logic gets crystallized — clean, context-free, reusable.  
> This folder ensures the controllers & services remain readable and focused.

