# Product Requirements Document (PRD)
# Sistem Single Sign-On (SSO) & Identity Provider Terpusat

---

## 1. Ringkasan Eksekutif & Tujuan Proyek

Aplikasi **Single Sign-On (SSO)** ini dirancang sebagai platform **Identity Provider (IdP)** terpusat, aman, dan berkinerja tinggi yang mendukung arsitektur **Multi-Tenant**. Sistem ini bertindak sebagai gerbang tunggal autentikasi dan otorisasi untuk berbagai aplikasi internal organisasi maupun aplikasi pihak ketiga (*SaaS eksternal*).

### Tujuan Utama:
1. **Peningkatan Pengalaman Pengguna (User Experience):** Mengurangi *password fatigue* dengan memungkinkan pengguna mengakses seluruh aplikasi yang berhak mereka akses hanya dengan sekali proses login (*Single Sign-On*).
2. **Sentralisasi Keamanan & Akses:** Mengontrol hak akses, izin (*Role-Based Access Control / RBAC*), dan masa aktif sesi secara terpusat.
3. **Otomatisasi Siklus Hidup Identitas (Identity Lifecycle):** Mengintegrasikan sistem dengan *HR Information System (HRIS)* untuk memproses *onboarding* dan *offboarding* karyawan secara otomatis secara *real-time*.
4. **Kepatuhan & Keamanan Tingkat Tinggi:** Menyediakan pencatatan *log audit* yang komprehensif serta siap menghadapi audit keamanan seperti *Penetration Testing (Pen Test)* dan *Vulnerability Assessment (VA)*.

---

## 2. Arsitektur Teknis & Standar Teknologi

Sistem dikembangkan dengan pemisahan tegas antara antarmuka (*frontend*) dan lapisan layanan (*backend*):

| Komponen | Teknologi | Keterangan |
| :--- | :--- | :--- |
| **Backend** | Node.js (Express.js) | Mengikuti struktur proyek [minionxapp/rest-api](https://github.com/minionxapp/rest-api) dengan pola *Layered Architecture* (Controller, Service, Validation, Repository/Prisma). |
| **Database & ORM** | PostgreSQL / MySQL + Prisma ORM | Model data relasional dengan dukungan isolasi skema/kolom data *Multi-Tenant*. |
| **Frontend** | Vue 3 (Vite + Pinia + Vue Router) | Berbasis *Composition API* (`<script setup>`) dengan desain modular untuk *Auth Portal* dan *Admin Dashboard*. |
| **Protokol Standar** | OAuth 2.0 & OpenID Connect (OIDC) | Standar industri untuk pertukaran otorisasi (*token-based*) dan identitas (*ID Token / JWT*). |

---

## 3. Spesifikasi Fitur Lengkap

### 3.1. Autentikasi & Identity Provider (IdP)
* **Single Sign-On (SSO):**
  * Sesi global terpusat: jika pengguna telah berhasil login ke SSO, aplikasi lain yang terintegrasi langsung mengenali sesi pengguna tanpa meminta kredensial ulang.
  * Dukungan *Single Logout (SLO)* untuk mengakhiri sesi global di semua aplikasi.
* **OAuth 2.0 / OpenID Connect (OIDC):**
  * Mendukung *Authorization Code Flow with PKCE (Proof Key for Code Exchange)* untuk aplikasi SPA/Frontend dan mobile.
  * Penerbitan *Access Token*, *ID Token (JWT)*, dan *Refresh Token*.
  * Penyediaan endpoint standar OIDC:
    * Discovery: `/.well-known/openid-configuration`
    * Authorization: `/oauth/authorize`
    * Token: `/oauth/token`
    * UserInfo: `/oauth/userinfo`
    * Revocation: `/oauth/revoke`
    * JWKS: `/.well-known/jwks.json`
* **Identity Provider (IdP) Capabilities:**
  * Validasi kredensial pengguna terenkripsi (*Argon2* / *Bcrypt*).
  * Pengelolaan kunci privat & publik untuk penandatanganan JWT (*RS256* atau *ES256*).
* **Multi-Tenant:**
  * Dukungan isolasi multi-organisasi/cabang dalam satu sistem.
  * Setiap *tenant* memiliki konfigurasi branding sendiri, daftar pengguna terisolasi, serta pengaturan kebijakan akses tersendiri.
* **Self-Service Password Reset (SSPR):**
  * Pengguna dapat meminta reset password mandiri via tautan email atau token verifikasi berbatas waktu (*time-limited OTP/token*).
  * Validasi token satu kali pakai (*one-time use*) untuk mencegah serangan *replay*.

---

### 3.2. Dashboard & Manajemen Pengguna
* **Dashboard Manajemen Pengguna:**
  * Tampilan analitik dan visualisasi statistik pengguna (Total pengguna, pengguna aktif, pengguna nonaktif, tren login harian/mingguan).
* **Manajemen Pengguna (CRUD):**
  * Tambah, lihat, ubah, dan hapus data pengguna.
  * Filter dan pencarian dinamis (berdasarkan nama, email, tenant, role, dan status).
* **Enable / Disable User:**
  * Admin dapat membekukan sementara akses akun tanpa menghapus riwayat datanya.
  * Akun yang berstatus *disabled* akan langsung dibatalkan sesi aktifnya dan ditolak saat mencoba login.
* **Reset Password User (oleh Admin):**
  * Admin dapat memicu pembuatan password sementara atau mengirimkan tautan reset password langsung ke pengguna.
* **Update Role User & Manajemen Role dan Permission:**
  * Penugasan role kepada pengguna (*User-Role Assignment*).
  * Pembuatan dan modifikasi Role (misal: *Super Admin, Tenant Admin, Auditor, Employee*).
  * Pengaturan granular Izin (*Permissions*) berbasis matriks modul (*read, write, delete, export*).
* **User Profile:**
  * Halaman profil mandiri bagi pengguna untuk melihat data diri, mengubah informasi dasar, dan mengganti password.
* **Security Setting:**
  * Kebijakan keamanan akun (panjang minimum password, kompleksitas karakter, masa berlaku password).
  * Pengaturan proteksi *Account Lockout* setelah sejumlah percobaan login gagal beruntun.
  * Kebijakan durasi sesi (*session timeout*) dan masa berlaku *token*.

---

### 3.3. Dashboard & Manajemen Aplikasi
* **Dashboard Manajemen Aplikasi:**
  * Antarmuka untuk melihat seluruh daftar aplikasi yang terdaftar (*Registered Clients*), status koneksi, dan volume trafik otentikasi.
* **Manajemen Aplikasi (CRUD):**
  * Pendaftaran aplikasi klien baru (membuat `client_id`, `client_secret`, nama aplikasi, logo, dan deskripsi).
  * Pengaturan *Redirect URI*, *Post-Logout Redirect URI*, dan tipe *Grant Type* yang diizinkan.
  * Rotasi dan regenerasi `client_secret`.
* **Integrasi Aplikasi dengan SSO:**
  * Panduan, *SDK/Code snippets*, dan parameter konfigurasi untuk memudahkan developer menghubungkan aplikasi internal ke SSO.
* **Integrasi Pihak Ketiga (SaaS Eksternal):**
  * Dukungan integrasi SSO ke aplikasi SaaS populer (seperti Google Workspace, Jira, Notion, Slack, dsb) via standar OIDC/OAuth2.

---

### 3.4. Log & Keamanan (Security, VA & Pen Test)
* **Manajemen Log Audit & Laporan Log Audit:**
  * Pencatatan setiap *event* sensitif:
    * Percobaan login (berhasil, gagal, akun terkunci).
    * Pembuatan token dan *refresh token*.
    * Perubahan data pengguna, peran, dan hak akses.
    * Konfigurasi aplikasi dan perubahan keamanan sistem.
  * Format log terstruktur mencakup: *timestamp*, *actor_id*, *tenant_id*, *action*, *ip_address*, *user_agent*, dan *status*.
  * Filter dan ekspor laporan log audit (format CSV / PDF / Excel) untuk kebutuhan audit kepatuhan (*compliance*).
* **Vulnerability Assessment (VA) & Penetration Testing (Pen Test) Readiness:**
  * **Input Validation & Sanitization:** Menggunakan Joi di backend untuk mencegah *SQL Injection*, *NoSQL Injection*, dan *Cross-Site Scripting (XSS)*.
  * **Brute Force Protection & Rate Limiting:** Pembatasan frekuensi request ke endpoint login dan token menggunakan *express-rate-limit*.
  * **HTTP Security Headers:** Menggunakan *Helmet* untuk mengaktifkan Content Security Policy (CSP), HSTS, X-Frame-Options (mencegah *Clickjacking*).
  * **CSRF & CORS:** Kebijakan CORS ketat hanya ke domain *Redirect URI* yang terdaftar, penggunaan token anti-CSRF / *SameSite Cookie policy*.
  * **Kerahasiaan Kredensial:** Password tidak pernah disimpan dalam *plaintext*, selalu di-hash menggunakan algoritma modern berbiaya komputasi terukur (*Argon2id* atau *Bcrypt*).

---

### 3.5. Integrasi & Otomatisasi HRIS
* **HR Information System (HRIS) Integration:**
  * Endpoint Webhook yang aman (dengan verifikasi tanda tangan HMAC / Secret Token) untuk menerima notifikasi perubahan status karyawan dari sistem HRIS.
* **Otomasi Onboarding:**
  * Ketika karyawan baru ditambahkan ke HRIS, sistem SSO otomatis:
    1. Membuat akun baru pada *tenant* yang sesuai.
    2. Menentukan *default role* berdasarkan departemen/jabatan karyawan.
    3. Mengirimkan email sambutan berisi instruksi pembuatan password awal.
* **Otomasi Offboarding:**
  * Ketika status karyawan di HRIS berubah menjadi *Terminated / Resigned*, sistem SSO secara instan:
    1. Mengubah status pengguna menjadi *disabled*.
    2. Mencabut (*revoke*) seluruh *Active Refresh Tokens* dan sesi login yang sedang berjalan di seluruh aplikasi.
    3. Mencatat riwayat *offboarding* ke dalam Log Audit.

---

## 4. Alur Kerja Utama Sistem (Key User Flows)

### 4.1. Alur Single Sign-On (Authorization Code with PKCE)
```
[Pengguna]        [Aplikasi Klien]             [Portal SSO (IdP)]           [Backend SSO API]
    |                    |                              |                           |
    |-- Akses Apps ----->|                              |                           |
    |                    |-- Redirect ke SSO (PKCE) --->|                           |
    |                    |                              |-- Tampilkan Form Login -->|
    |-- Input Kredensial |----------------------------->|                           |
    |                    |                              |-- POST /auth/login ------>|
    |                    |                              |<-- Sesi Valid & Code -----|
    |                    |<-- Redirect kembali dg Code -|                           |
    |                    |                                                          |
    |                    |-- POST /oauth/token (Code + PKCE Verifier) ------------->|
    |                    |<-- Return ID Token & Access Token -----------------------|
    |<-- Tampilkan Apps -|                                                          |
```

### 4.2. Alur Otomasi Offboarding HRIS
```
[Sistem HRIS]                  [Backend SSO Webhook]                [Database & Sesi SSO]
     |                                   |                                     |
     |-- Event: Employee Terminated ---->|                                     |
     |   (HMAC Signature Header)         |-- Verifikasi Signature Webhook      |
     |                                   |-- Cari User berdasarkan NIK/Email   |
     |                                   |-- Update status user: DISABLED ---->|
     |                                   |-- Revoke semua active tokens ------>|
     |                                   |-- Tulis Log Audit Kritis ---------->|
     |<-- 200 OK (Processed) ------------|                                     |
```

---

## 5. Matriks Persyaratan Non-Fungsional (NFR)

| Aspek | Spesifikasi Target |
| :--- | :--- |
| **Kinerja (Latency)** | Response time endpoint otentikasi `< 300ms`, response endpoint verifikasi token `< 50ms`. |
| **Ketersediaan (Availability)** | Target uptime 99.9% dengan arsitektur stateless backend yang siap di-*cluster*. |
| **Skalabilitas** | Mampu menangani hingga minimal 10.000 pengguna aktif harian dengan pemisahan database read-replica. |
| **Standar Keamanan** | Memenuhi standar OWASP Top 10, lolos uji berkala Vulnerability Assessment dan Pen Test. |
| **Kesesuaian Data** | Enkripsi *data at rest* (AES-256) untuk informasi sensitif dan *data in transit* (TLS 1.3). |
