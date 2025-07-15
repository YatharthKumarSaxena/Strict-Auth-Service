# 🌐 Prisma Public Schema - User-Facing Authentication Tables

This folder defines the **public-facing data schema** for the authentication service. These models represent the **core of user identity**, their **devices**, **OTP verification**, and **block/unblock workflows**. It connects directly to your sign-up, login, and session lifecycle.

---

## 📖 **Introduction**

The `public` schema is the **backbone of all authentication operations**. It tracks:
- 🔐 Registered users and their credentials  
- 📱 Devices and usage patterns  
- 🔄 OTP flow for phone/email verification  
- 🚫 Block/unblock logic for abuse prevention

This schema powers the **external user-facing routes**, unlike the `private/` schema which supports internal admin and logging utilities.

---

## ⚙️ **Prisma Generator & Datasource**

```prisma
generator client {
  provider = "prisma-client-js"
  output   = "../../node_modules/.prisma/public"
}

datasource db {
  provider = "postgresql"
  url      = env("PUBLIC_DB_URL")
}
```

---

## 🧩 Enum Definitions

Enums ensure type safety and consistent naming across services:

### 👥 `UserType`
Defines who the user is:
- `CUSTOMER` – General end-user  
- `ADMIN` – Elevated privilege user  

### 🧭 `ViaType`
Used to mark **how** a block or unblock event occurred:
- `USER_ID`, `EMAIL`, `PHONE`

### 💻 `DeviceType`
Specifies device from which request was made:
- `MOBILE`, `LAPTOP`, `TABLET`

### 🚫 `BlockReason`
Why a user account was blocked:
- `POLICY_VIOLATION`, `SPAM_ACTIVITY`, `FRAUDULENT_BEHAVIOR`, etc.

### ✅ `UnblockReason`
Why a user account was unblocked:
- `MANUAL_REVIEW_PASSED`, `USER_APPEAL_GRANTED`, `SYSTEM_ERROR`, etc.

---

## 🗂️ Model Descriptions

---

### 📄 `User`

Main entity storing all user data and status flags.

| Field               | Type           | Description                                      |
|--------------------|----------------|--------------------------------------------------|
| `id`               | `String`       | Primary UUID, internal only                     |
| `name`             | `String?`      | Optional full name                              |
| `fullPhoneNumber`  | `String`       | Unique contact number (countryCode + number)    |
| `password`         | `String`       | Hashed password                                 |
| `userID`           | `String`       | Unique public identifier                        |
| `emailID`          | `String`       | Unique email address                            |
| `isActive`         | `Boolean`      | Can perform actions or not                      |
| `isBlocked`        | `Boolean`      | Temporarily suspended by system/admin           |
| `isVerified`       | `Boolean`      | Has completed OTP & identity validation         |
| `userType`         | `UserType`     | CUSTOMER or ADMIN                               |
| `loginCount`       | `Int`          | Tracks logins                                   |
| `blockedVia`       | `ViaType?`     | How block occurred (userID/email/phone)         |
| `unblockedVia`     | `ViaType?`     | How unblock occurred                            |
| `blockReason`      | `BlockReason?` | Reason for block                                |
| `blockCount`       | `Int`          | Total number of times blocked                   |
| `unblockCount`     | `Int`          | Times unblocked                                 |
| `unblockReason`    | `UnblockReason?`| Why the user was unblocked                      |
| `blockedBy`        | `String?`      | Admin who blocked                               |
| `unblockedBy`      | `String?`      | Admin who unblocked                             |
| `blockedAt`        | `DateTime?`    | When blocked                                    |
| `unblockedAt`      | `DateTime?`    | When unblocked                                  |
| `lastActivatedAt`  | `DateTime`     | Last time user became active                    |
| `lastDeactivatedAt`| `DateTime?`    | When account was deactivated                    |
| `lastLogin`        | `DateTime?`    | Last login time                                 |
| `lastLogout`       | `DateTime?`    | Last logout time                                |
| `jwtTokenIssuedAt` | `DateTime?`    | For token refresh security                      |
| `passwordChangedAt`| `DateTime?`    | Useful to invalidate older tokens               |
| `phoneNumber`      | `PhoneNumber?` | One-to-one relation with phone number           |
| `device`           | `Device?`      | One-to-one relation with registered device      |
| `otp`              | `OTP?`         | One-to-one OTP relation                         |
| `createdAt`        | `DateTime`     | Auto-created timestamp                          |
| `updatedAt`        | `DateTime`     | Updated when any field changes                  |

---

### 📄 `PhoneNumber`

Stores country code and number separately for validation and search.

| Field       | Type     | Description                    |
|-------------|----------|--------------------------------|
| `userID`    | `String` | Foreign key from User          |
| `countryCode`| `String`| Like "+91", "+1", etc          |
| `number`    | `String` | Just the numeric part          |
| `user`      | `User`   | Relation back to User          |

---

### 📄 `Device`

Tracks the user's login device.

| Field        | Type         | Description                                 |
|--------------|--------------|---------------------------------------------|
| `deviceID`   | `String`     | Unique UUID for the device                  |
| `deviceName` | `String?`    | Device alias like "John's iPhone"           |
| `deviceType` | `DeviceType?`| Mobile, Laptop, or Tablet                   |
| `requestCount`| `Int`       | Number of times used                        |
| `addedAt`    | `DateTime`   | When the device was first used              |
| `lastUsedAt` | `DateTime?`  | Latest API call from this device            |
| `userID`     | `String`     | Foreign key to user                         |
| `user`       | `User`       | Back relation                               |

---

### 📄 `OTP`

Stores OTP metadata for user verification.

| Field       | Type      | Description                         |
|-------------|-----------|-------------------------------------|
| `id`        | `Int`     | Primary key                         |
| `code`      | `String`  | OTP code                            |
| `expiresAt` | `DateTime`| Validity period                     |
| `verified`  | `Boolean` | Whether user has verified OTP       |
| `resendCount`| `Int`    | To prevent abuse                    |
| `userID`    | `String`  | Tied to the user                    |
| `user`      | `User`    | Relation to User                    |

---

## 🔐 Integrity & Security Notes

✅ All sensitive fields are hashed or obfuscated  
✅ One-to-one relations ensure no duplication  
✅ Blocking and device data allow for high security policies  
✅ JWT issue timestamps support session invalidation  

---

## 🎯 **Final Takeaway**

This schema holds the **core logic** of user management:
- Clean and normalized design  
- All account lifecycle states are tracked  
- OTP and device flow is tightly coupled  
- Ready to scale for both admin and user scenarios

By splitting public and private schemas, I achieved:
- Better **modularity**
- Strong **security enforcement**
- Easier **maintenance** and **audit**

This `public` schema is the **identity engine** behind the entire authentication system.

---
