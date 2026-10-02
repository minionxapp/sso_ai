# Roadmap & Tahapan Pengembangan Aplikasi SSO

---

Dokumen ini menguraikan tahapan terstruktur pelaksanaan pengembangan sistem **Single Sign-On (SSO) & Identity Provider** dari awal rancangan hingga siap produksi (*production-ready*). Tahapan ini disusun secara bertahap (*milestone/sprint-based*) agar proses pengembangan terukur, terkendali, dan meminimalkan risiko keamanan.

---

## Ringkasan Tahapan Pengembangan

| Tahap | Fokus Utama | Luaran Utama (Deliverables) |
| :---: | :--- | :--- |
| **Milestone 1** | Fondasi Backend & Database | Schema Prisma (Multi-Tenant), Express Core, Logging Winston, Error Middleware |
| **Milestone 2** | Autentikasi Inti & Identity Provider | Login SSO, OAuth 2.0 / OIDC Core, JWT Signing (RS256), Self-Service Password Reset |
| **Milestone 3** | Manajemen Admin & RBAC | CRUD Pengguna, Status Enable/Disable, CRUD Aplikasi Klien, Role & Permission |
| **Milestone 4** | Frontend Portal & Dashboard (Vue 3) | Portal Login SSO, UI Dashboard Admin, Axios Interceptors, Router Guards |
| **Milestone 5** | Integrasi Eksternal & Otomatisasi | Webhook HRIS (Onboarding/Offboarding), Integrasi SaaS Pihak Ketiga, Ekspor Log Audit |
| **Milestone 6** | Audit Keamanan & Hardening | Vulnerability Assessment (VA), Penetration Testing (Pen Test), Stress Test & Go-Live |

---

## Rincian Per Tahap

### Milestone 1: Fondasi Arsitektur Backend & Database
* **Tujuan:** Menyiapkan struktur dasar backend sesuai pola `minionxapp/rest-api` dan skema database relasional.
* **Tugas Spesifik:**
  1. Inisialisasi proyek Node.js dan setup struktur folder (`src/application`, `src/controller`, `src/service`, dll).
  2. Implementasi skema Prisma (`prisma/schema.prisma`) untuk tabel Tenant, User, Role, Permission, Application, dan AuditLog.
  3. Konfigurasi Prisma Client dan koneksi database dengan middleware Multi-Tenant.
  4. Setup logging terpusat menggunakan Winston dan middleware penangan error standar (`response-error.js` & `error-middleware.js`).
* **Kriteria Selesai:** Database terhubung, migrasi berjalan lancar, dan endpoint dasar *health-check* aktif.

---

### Milestone 2: Layanan Autentikasi & Identity Provider (OAuth 2.0 / OIDC)
* **Tujuan:** Membangun mesin utama SSO dan manajemen token identitas yang aman.
* **Tugas Spesifik:**
  1. Implementasi autentikasi kredensial lokal (hashing password dengan Argon2/Bcrypt).
  2. Pembuatan mekanisme OAuth 2.0 *Authorization Code Flow with PKCE*.
  3. Endpoint standar OIDC: `/.well-known/openid-configuration`, `/oauth/authorize`, `/oauth/token`, dan `/oauth/userinfo`.
  4. Mekanisme pembuatan dan penandatanganan JWT (Access Token & ID Token) menggunakan kunci privat (RS256).
  5. Fitur *Self-Service Password Reset (SSPR)* via tautan token email sekali pakai.
* **Kriteria Selesai:** Aplikasi klien sampel berhasil melakukan login SSO dan memvalidasi ID Token pengguna.

---

### Milestone 3: Modul Manajemen Pengguna, Aplikasi & RBAC
* **Tujuan:** Menyediakan API backend untuk seluruh kebutuhan operasional admin.
* **Tugas Spesifik:**
  1. API CRUD Pengguna lengkap dengan filter, pencarian, dan paginasi.
  2. Implementasi fungsi **Enable / Disable User** serta pencabutan sesi instan jika user dinonaktifkan.
  3. API Reset Password User oleh Admin dan halaman profil pengguna mandiri.
  4. Manajemen Role & Permission granular (penugasan role ke user dan pengaturan matriks hak akses).
  5. API CRUD Pendaftaran Aplikasi Klien (manajemen `client_id`, `client_secret`, dan whitelist `redirect_uris`).
  6. Pencatatan otomatis setiap aksi administratif ke tabel **AuditLog**.
* **Kriteria Selesai:** Seluruh endpoint CRUD lulus pengujian integrasi Jest dengan cakupan pengujian (*test coverage*) memadai.

---

### Milestone 4: Pengembangan Antarmuka Frontend (Vue 3)
* **Tujuan:** Membangun portal login terpusat dan antarmuka dashboard manajemen yang responsif dan intuitif.
* **Tugas Spesifik:**
  1. Setup proyek Vue 3 dengan Vite, Tailwind CSS, Pinia, dan Vue Router 4.
  2. Pembuatan template layout: `AuthLayout.vue` (Portal SSO & Reset Password) dan `AdminLayout.vue` (Dashboard).
  3. Implementasi `authStore.js` (Pinia) dengan penanganan token dan *silent refresh* via Axios Interceptors.
  4. Pembuatan Navigation Guards untuk melindungi rute privat berdasarkan Role dan Permission.
  5. Halaman UI:
     * Halaman Login SSO & Halaman Persetujuan Izin (Consent Screen).
     * Halaman Self-Service Lupa/Reset Password.
     * Halaman Manajemen Pengguna (Tabel responsif, Modal CRUD, Switch Status Enable/Disable).
     * Halaman Manajemen Aplikasi & Konfigurasi Redirect URI.
     * Halaman Dasbor Log Audit dengan filter pencarian dan tombol ekspor laporan.
     * Halaman Security Setting & Profil Pengguna.
* **Kriteria Selesai:** Antarmuka frontend terhubung secara penuh ke Backend REST API dan dapat dioperasikan secara *end-to-end*.

---

### Milestone 5: Integrasi HRIS & Otomatisasi Siklus Karyawan
* **Tujuan:** Menghubungkan SSO dengan ekosistem luar organisasi (HRIS dan SaaS pihak ketiga).
* **Tugas Spesifik:**
  1. Pembuatan endpoint Webhook `/api/v1/webhooks/hris` dengan verifikasi tanda tangan HMAC.
  2. **Otomasi Onboarding:** Pembuatan user otomatis, penugasan role departemen, dan pengiriman email undangan ketika ada karyawan baru dari HRIS.
  3. **Otomasi Offboarding:** Penonaktifan akun secara *real-time* dan pembatalan seluruh sesi login aktif ketika status karyawan menjadi *terminated/resigned*.
  4. Integrasi dan pengujian SSO dengan aplikasi SaaS eksternal (misal: Google Workspace atau Jira).
  5. Fitur ekspor laporan Log Audit ke format CSV/PDF untuk kebutuhan audit kepatuhan.
* **Kriteria Selesai:** Event dari HRIS otomatis mengeksekusi onboarding dan offboarding tanpa intervensi manual tim IT.

---

### Milestone 6: Pengujian Keamanan (VA & Pen Test), Optimasi & Peluncuran
* **Tujuan:** Menjamin keandalan, stabilitas, dan keamanan sistem sebelum peluncuran resmi.
* **Tugas Spesifik:**
  1. **Vulnerability Assessment (VA):** Pemindaian otomatis terhadap celah keamanan (OWASP Dependency Check, SonarQube, pemindaian port dan konfigurasi TLS).
  2. **Penetration Testing (Pen Test):** Simulasi pengujian penetrasi terhadap kerentanan OWASP Top 10 (SQL Injection, XSS, Broken Access Control, CSRF, Session Hijacking, Brute Force).
  3. Perbaikan (*remediation*) terhadap setiap temuan kerentanan hasil VA dan Pen Test.
  4. *Load Testing & Stress Testing* untuk memastikan latensi otentikasi tetap di bawah 300ms pada beban puncak.
  5. Penyusunan dokumentasi operasional, panduan integrasi bagi developer aplikasi klien, dan *Go-Live*.
* **Kriteria Selesai:** Laporan hasil Pen Test berstatus *Passed/Low Risk*, sistem berhasil dideploy ke lingkungan produksi dengan monitoring aktif.
