# Arsitektur Backend (Node.js REST API)
# Sistem Single Sign-On (SSO) & Identity Provider

---

Dokumen ini mendefinisikan arsitektur backend untuk sistem SSO dan Identity Provider. Arsitektur ini mengadopsi struktur dan konvensi dari repositori referensi **[minionxapp/rest-api](https://github.com/minionxapp/rest-api)** dengan pola **Layered Architecture (Separation of Concerns)** yang bersih, modular, dan teruji.

---

## 1. Tech Stack & Dependensi Utama

| Kategori | Library / Paket | Fungsi & Alasan Pemilihan |
| :--- | :--- | :--- |
| **Runtime & Framework** | Node.js (v20+ LTS), Express.js | Performa I/O asinkron tinggi, ekosistem luas, integrasi mudah. |
| **Database & ORM** | Prisma ORM (PostgreSQL / MySQL) | *Type-safe database client*, migrasi otomatis, query builder deklaratif, mendukung isolasi Multi-Tenant. |
| **Validasi Input** | Joi | Validasi skema ketat untuk mencegah serangan injeksi dan payload berbahaya (*VA & Pen Test*). |
| **Hashing & Enkripsi** | Argon2 / Bcrypt, crypto | Standar industri pengacakan password dan pembuatan token acak (*cryptographically secure*). |
| **Token & OIDC** | jsonwebtoken, jose | Pembuatan dan verifikasi Access Token, ID Token (JWT dengan penandatanganan RS256/ES256). |
| **Logging & Audit** | Winston, Winston Daily Rotate File | Logging terstruktur (JSON format) untuk jejak audit kepatuhan (*Audit Log Management*). |
| **Security Middleware** | Helmet, CORS, express-rate-limit | Pertahanan HTTP Header standar OWASP, pembatasan asal domain, dan mitigasi *Brute Force*. |
| **Testing** | Jest, Supertest | Pengujian unit dan integrasi (*end-to-end API testing*). |

---

## 2. Struktur Direktori Proyek

Struktur folder mengadaptasi 100% pola modular dari `minionxapp/rest-api`:

```text
.
├── prisma/
│   ├── migrations/                  # Riwayat migrasi database
│   └── schema.prisma                # Definisi skema data (Tenant, User, Role, App, AuditLog, dll.)
├── src/
│   ├── application/                 # Inti inisialisasi aplikasi & koneksi
│   │   ├── database.js              # Instance Prisma Client & Tenant Query Middleware
│   │   ├── logging.js               # Konfigurasi Winston Logger (Console & File Transport)
│   │   └── web.js                   # Setup Express, Middleware global (Helmet, CORS, BodyParser)
│   ├── controller/                  # Layer Presentasi HTTP (Request Parsing & Response Formatting)
│   │   ├── auth-controller.js       # Login SSO, Logout, Refresh Token, Self-Service Password Reset
│   │   ├── oauth-controller.js      # Endpoint OIDC: /authorize, /token, /userinfo, /.well-known/...
│   │   ├── user-controller.js       # CRUD User, Enable/Disable, User Profile, Admin Reset Password
│   │   ├── role-controller.js       # CRUD Role, Hak Akses (Permissions), Update Role User
│   │   ├── app-controller.js        # CRUD Application Client, Registrasi SaaS Eksternal
│   │   ├── audit-controller.js      # Get Log Audit, Filter, Export Laporan Log Audit
│   │   ├── setting-controller.js    # Konfigurasi Security Setting & Kebijakan Password
│   │   └── hris-controller.js       # Webhook Listener: Otomasi Onboarding & Offboarding
│   ├── error/
│   │   └── response-error.js        # Custom Error class dengan HTTP status code
│   ├── middleware/
│   │   ├── auth-middleware.js       # Validasi Bearer Token & Ekstraksi Tenant ID / User ID
│   │   ├── rbac-middleware.js       # Pengecekan Permission/Hak Akses spesifik per endpoint
│   │   ├── rate-limit-middleware.js # Proteksi brute force pada endpoint login & token
│   │   └── error-middleware.js      # Penangan error terpusat (Standarisasi response error JSON)
│   ├── route/
│   │   ├── public-api.js            # Endpoint tanpa otentikasi (Login, SSPR, OIDC Discovery)
│   │   └── api.js                   # Endpoint privat (Memerlukan token valid & pengecekan RBAC)
│   ├── service/                     # Layer Logika Bisnis (Core Business Logic)
│   │   ├── auth-service.js          # Validasi kredensial, verifikasi status user (enable/disable)
│   │   ├── oauth-service.js         # Manajemen kode otorisasi, penerbitan JWT OIDC
│   │   ├── user-service.js          # Logika CRUD Pengguna, enkripsi password
│   │   ├── role-service.js          # Logika penugasan Role dan Permission
│   │   ├── app-service.js           # Pengelolaan Client ID, Secret, Redirect URI
│   │   ├── audit-service.js         # Pencatatan event sistem ke tabel AuditLog
│   │   └── hris-service.js          # Pemrosesan event HRIS (Onboarding/Offboarding otomatis)
│   └── validation/                  # Skema Validasi Joi
│       ├── auth-validation.js       # Skema Login, Password Reset, OIDC Token Request
│       ├── user-validation.js       # Skema Create/Update User, Profil
│       ├── app-validation.js        # Skema Registrasi Aplikasi Klien
│       ├── hris-validation.js       # Skema Payload Webhook HRIS
│       └── validation.js            # Runner validasi (Throw ResponseError jika payload tidak valid)
├── test/                            # Unit & Integration Tests (Jest)
│   ├── test-util.js                 # Helper untuk seed data uji dan reset DB
│   ├── auth.test.js                 # Pengujian alur otentikasi SSO & OAuth
│   ├── user.test.js                 # Pengujian CRUD User & RBAC
│   └── hris.test.js                 # Pengujian webhook onboarding/offboarding
├── .env.example                     # Dokumentasi variabel lingkungan
├── package.json
└── README.md
```

---

## 3. Desain Skema Database (Prisma ORM)

Berikut adalah representasi rancangan model `schema.prisma` yang mencakup semua kebutuhan fitur:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

// 1. Multi-Tenant
model Tenant {
  id          String   @id @default(uuid())
  code        String   @unique
  name        String
  domain      String?  @unique
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  users       User[]
  apps        Application[]
  auditLogs   AuditLog[]
  settings    SecuritySetting?
}

// 2. Pengguna (User Management)
model User {
  id              String    @id @default(uuid())
  tenantId        String
  email           String    
  username        String
  passwordHash    String
  fullName        String
  avatarUrl       String?
  isActive        Boolean   @default(true) // Enable / Disable user
  isLocked        Boolean   @default(false)
  failedAttempts  Int       @default(0)
  lastLoginAt     DateTime?
  employeeId      String?   // Terhubung ke NIK / HRIS
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  tenant          Tenant    @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  userRoles       UserRole[]
  tokens          RefreshToken[]
  resetTokens     PasswordResetToken[]
  auditLogs       AuditLog[]

  @@unique([tenantId, email])
  @@unique([tenantId, username])
}

// 3. Role & Permission (RBAC)
model Role {
  id          String           @id @default(uuid())
  tenantId    String
  name        String
  description String?
  isSystem    Boolean          @default(false)
  userRoles   UserRole[]
  permissions RolePermission[]

  @@unique([tenantId, name])
}

model Permission {
  id          String           @id @default(uuid())
  name        String           @unique // e.g. "users:read", "apps:write", "audit:export"
  description String?
  roles       RolePermission[]
}

model RolePermission {
  roleId       String
  permissionId String
  role         Role       @relation(fields: [roleId], references: [id], onDelete: Cascade)
  permission   Permission @relation(fields: [permissionId], references: [id], onDelete: Cascade)

  @@id([roleId, permissionId])
}

model UserRole {
  userId String
  roleId String
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  role   Role   @relation(fields: [roleId], references: [id], onDelete: Cascade)

  @@id([userId, roleId])
}

// 4. Aplikasi Klien (OAuth 2.0 / OIDC Registered Clients)
model Application {
  id           String   @id @default(uuid())
  tenantId     String
  clientId     String   @unique
  clientSecret String   // Disimpan dalam bentuk hash
  name         String
  description  String?
  redirectUris String[] // Whitelist redirect URI
  postLogoutUris String[]
  isThirdParty Boolean  @default(false) // SaaS Eksternal
  isActive     Boolean  @default(true)
  createdAt    DateTime @default(now())

  tenant       Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  authCodes    AuthorizationCode[]
}

// 5. Token & OIDC Lifecycle
model AuthorizationCode {
  id            String      @id @default(uuid())
  code          String      @unique
  clientId      String
  userId        String
  redirectUri   String
  codeChallenge String      // PKCE
  codeChallengeMethod String // S256
  expiresAt     DateTime
  used          Boolean     @default(false)

  app           Application @relation(fields: [clientId], references: [clientId], onDelete: Cascade)
}

model RefreshToken {
  id        String   @id @default(uuid())
  userId    String
  tokenHash String   @unique
  isRevoked Boolean  @default(false)
  expiresAt DateTime
  createdAt DateTime @default(now())

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model PasswordResetToken {
  id        String   @id @default(uuid())
  userId    String
  tokenHash String   @unique
  expiresAt DateTime
  isUsed    Boolean  @default(false)

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

// 6. Audit Logging
model AuditLog {
  id         String   @id @default(uuid())
  tenantId   String
  actorId    String?  // ID User yang melakukan aksi
  action     String   // e.g. "AUTH_LOGIN_SUCCESS", "USER_DISABLED", "ROLE_UPDATED"
  targetType String   // e.g. "USER", "APPLICATION", "SECURITY_SETTING"
  targetId   String?
  ipAddress  String?
  userAgent  String?
  metadata   Json?    // Detail perubahan (sebelum & sesudah)
  createdAt  DateTime @default(now())

  tenant     Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  actor      User?    @relation(fields: [actorId], references: [id], onDelete: SetNull)

  @@index([tenantId, createdAt])
  @@index([action])
}

// 7. Security Setting
model SecuritySetting {
  id                   String   @id @default(uuid())
  tenantId             String   @unique
  minPasswordLength    Int      @default(8)
  requireSpecialChar   Boolean  @default(true)
  requireNumber        Boolean  @default(true)
  maxLoginAttempts     Int      @default(5)
  lockoutDurationMins  Int      @default(15)
  sessionTimeoutMins   Int      @default(60)

  tenant               Tenant   @relation(fields: [tenantId], references: [id], onDelete: Cascade)
}
```

---

## 4. Katalog Endpoint REST API

### 4.1. Public Endpoints (`src/route/public-api.js`)
| Method | Endpoint | Deskripsi |
| :--- | :--- | :--- |
| `POST` | `/api/v1/auth/login` | Login SSO (Email & Password), membuat sesi & refresh token. |
| `POST` | `/api/v1/auth/password/forgot` | Mengajukan permintaan Self-Service Password Reset (kirim email). |
| `POST` | `/api/v1/auth/password/reset` | Eksekusi reset password menggunakan token verifikasi. |
| `GET` | `/.well-known/openid-configuration` | Metadata OpenID Connect Discovery. |
| `GET` | `/.well-known/jwks.json` | Kunci publik RSA untuk verifikasi JWT signature oleh klien. |
| `GET` | `/oauth/authorize` | Endpoint otorisasi SSO (Authorization Code + PKCE). |
| `POST` | `/oauth/token` | Penukaran Authorization Code dengan Access Token, ID Token & Refresh Token. |
| `POST` | `/oauth/revoke` | Pencabutan token secara manual oleh aplikasi klien. |

### 4.2. Protected Endpoints (`src/route/api.js`)
*Seluruh endpoint di bawah ini dilindungi oleh `auth-middleware.js` dan diverifikasi hak aksesnya oleh `rbac-middleware.js`.*

| Modul | Method & Path | Keterangan / Izin Akses |
| :--- | :--- | :--- |
| **User Profile** | `GET /api/v1/profile` | Mengambil profil pengguna yang sedang login. |
| | `PUT /api/v1/profile` | Memperbarui nama, kontak, avatar. |
| | `PUT /api/v1/profile/password` | Mengganti password sendiri. |
| **User Management** | `GET /api/v1/users` | List pengguna dengan pagination, filter tenant/status (`users:read`). |
| | `POST /api/v1/users` | Membuat pengguna baru secara manual (`users:write`). |
| | `GET /api/v1/users/:id` | Detail data pengguna (`users:read`). |
| | `PUT /api/v1/users/:id` | Update data pengguna (`users:write`). |
| | `PATCH /api/v1/users/:id/status` | **Enable / Disable user** (`users:write`). |
| | `POST /api/v1/users/:id/reset-password` | **Reset password user** oleh Admin (`users:write`). |
| | `PUT /api/v1/users/:id/roles` | **Update role user** (`users:assign-role`). |
| | `DELETE /api/v1/users/:id` | Hapus pengguna permanen (`users:delete`). |
| **Role & Permission** | `GET /api/v1/roles` | List semua role dan permission (`roles:read`). |
| | `POST /api/v1/roles` | Buat role baru (`roles:write`). |
| | `PUT /api/v1/roles/:id` | Update nama & permission matriks (`roles:write`). |
| **App Management** | `GET /api/v1/apps` | List aplikasi klien terdaftar (`apps:read`). |
| | `POST /api/v1/apps` | Registrasi aplikasi internal/SaaS (`apps:write`). |
| | `PUT /api/v1/apps/:id` | Update konfigurasi URL redirect (`apps:write`). |
| | `POST /api/v1/apps/:id/rotate-secret`| Rotasi client secret baru (`apps:write`). |
| **Log Audit** | `GET /api/v1/audit-logs` | Lihat dan filter log audit (`audit:read`). |
| | `GET /api/v1/audit-logs/export` | Unduh **Laporan log audit** (CSV/PDF) (`audit:export`). |
| **Security Setting** | `GET /api/v1/settings/security` | Lihat konfigurasi keamanan tenant saat ini. |
| | `PUT /api/v1/settings/security` | Update konfigurasi kebijakan keamanan (`settings:write`). |
| **HRIS Webhook** | `POST /api/v1/webhooks/hris` | Menerima event Otomasi Onboarding/Offboarding dari HRIS. |

---

## 5. Implementasi Keamanan (VA & Penetration Testing Readiness)

1. **Anti-Injection & Validasi Input Keras (Joi):**
   * Semua input dievaluasi skemanya sebelum masuk ke lapisan logika. Karakter terlarang di-*sanitize*.
2. **Mitigasi Serangan Brute Force:**
   * `rate-limit-middleware.js` membatasi request maksimal 5 percobaan per menit per alamat IP pada endpoint login.
   * `maxLoginAttempts` pada database memicu penguncian akun sementara (*Account Lockout*) jika gagal berkali-kali.
3. **Hardened HTTP Headers (Helmet):**
   * Memasang header `Content-Security-Policy`, `Strict-Transport-Security (HSTS)`, `X-Frame-Options: DENY` (mencegah *clickjacking* pada form login).
4. **Isolasi Data Multi-Tenant:**
   * Prisma query middleware secara otomatis menyuntikkan `where: { tenantId }` pada setiap kueri database sehingga tidak ada kebocoran data antar-tenant (*Data Leakage Prevention*).
5. **Penanganan Error Terstandarisasi (`error-middleware.js`):**
   * *Stack trace* tidak pernah dibocorkan ke klien pada *production mode*, hanya menghasilkan kode error terstruktur untuk menghindari *Information Disclosure*.
