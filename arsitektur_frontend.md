# Arsitektur Frontend (Vue 3)
# Sistem Single Sign-On (SSO) & Identity Provider

---

Dokumen ini mendefinisikan arsitektur frontend untuk sistem SSO dan Dasbor Manajemen terpusat berbasis **Vue 3**. Arsitektur ini dirancang menggunakan standar modern industri: **Vite**, **Composition API (`<script setup>`)**, **Pinia**, dan **Vue Router 4** dengan prinsip modularitas, reaktivitas tinggi, dan keamanan sisi klien.

---

## 1. Tech Stack & Dependensi Utama

| Library / Tool | Versi / Tipe | Peran & Alasan Penggunaan |
| :--- | :--- | :--- |
| **Framework Inti** | Vue 3 (v3.4+) | *Composition API* dengan `<script setup>` untuk keterbacaan kode, modularitas logic (*Composables*), dan performa optimal. |
| **Build Tool** | Vite | *Build tool* generasi baru dengan *instant server start* dan *Hot Module Replacement (HMR)* super cepat. |
| **State Management** | Pinia | Manajemen *state* terpusat, reaktif, modular, dan ramah *TypeScript / Autocomplete*. |
| **Routing** | Vue Router 4 | Penanganan rute SPA, *nested layouts*, dan *Navigation Guards* untuk proteksi hak akses (RBAC). |
| **HTTP Client** | Axios | Komunikasi dengan API backend, konfigurasi *interceptors* untuk token injeksi dan *silent token refresh*. |
| **UI Styling** | Tailwind CSS / PrimeVue | Desain antarmuka responsif, modern, mendukung *Dark Mode*, dan komponen data-table interaktif. |
| **Form & Validasi** | Vee-Validate + Yup / Zod | Validasi formulir di sisi klien sebelum data dikirim ke backend. |

---

## 2. Struktur Direktori Proyek

```text
.
├── public/
│   ├── favicon.ico
│   └── logo.svg                     # Logo default portal SSO
├── src/
│   ├── assets/                      # File statis dan style global
│   │   ├── styles/main.css          # Setup Tailwind CSS & CSS variables
│   │   └── images/
│   ├── components/                  # Komponen UI Reusable
│   │   ├── common/                  # Komponen dasar (Button, Input, Modal, Badge, Dropdown)
│   │   │   ├── BaseButton.vue
│   │   │   ├── BaseInput.vue
│   │   │   ├── BaseModal.vue
│   │   │   ├── BaseBadge.vue
│   │   │   └── DataTable.vue        # Tabel dinamis untuk User, App, dan Audit Log
│   │   └── layout/                  # Elemen kerangka antarmuka
│   │       ├── Navbar.vue           # Header, Tenant Switcher, Notifikasi, Profile Menu
│   │       ├── Sidebar.vue          # Navigasi menu dinamis berbasis Role/Permission
│   │       └── Breadcrumb.vue
│   ├── composables/                 # Reusable Business Logic (Vue Composables)
│   │   ├── useAuth.js               # Helper fungsi autentikasi & perizinan (hasPermission)
│   │   ├── useNotification.js       # Toast & Feedback alert
│   │   └── useExport.js             # Helper unduh file laporan (CSV/PDF)
│   ├── layouts/                     # Template Layout Berbasis Rute
│   │   ├── AuthLayout.vue           # Layout khusus halaman SSO Login, Consent, dan Reset Password
│   │   ├── AdminLayout.vue          # Layout aplikasi utama: Sidebar + Navbar + Content Area
│   │   └── ErrorLayout.vue          # Layout minimalis untuk halaman error (404, 403, 500)
│   ├── router/
│   │   ├── index.js                 # Definisi konfigurasi routes
│   │   └── guards.js                # Router Navigation Guards (Pengecekan auth & RBAC)
│   ├── services/                    # Layer Komunikasi HTTP (API Client)
│   │   ├── api.js                   # Inisialisasi Axios & Interceptor (Request & Response)
│   │   ├── auth.service.js          # API Login, SSPR, OIDC Consent
│   │   ├── user.service.js          # API CRUD User, Status Toggle, Password Reset
│   │   ├── role.service.js          # API CRUD Role & Permission Matrix
│   │   ├── app.service.js           # API CRUD Aplikasi Klien & Rotasi Secret
│   │   ├── audit.service.js         # API Log Audit & Ekspor Laporan
│   │   └── setting.service.js       # API Kebijakan Keamanan Tenant
│   ├── store/                       # Pinia State Management
│   │   ├── authStore.js             # State: User info, Access Token, Session Status, Tenant
│   │   ├── userStore.js             # State: List pengguna, filter, pagination
│   │   ├── appStore.js              # State: List aplikasi terdaftar
│   │   └── auditStore.js            # State: Riwayat log audit dan status filter
│   ├── views/                       # Halaman Tampilan (Screens)
│   │   ├── auth/
│   │   │   ├── LoginView.vue        # Portal Login SSO Terpusat
│   │   │   ├── ForgotPassword.vue   # Form Permintaan Self-Service Password Reset
│   │   │   ├── ResetPassword.vue    # Form Set Password Baru via Token Link
│   │   │   └── ConsentView.vue      # Halaman Persetujuan Izin Aplikasi Klien (OAuth2 Consent)
│   │   ├── dashboard/
│   │   │   └── DashboardView.vue    # Statistik total user, aplikasi, login rate, alert keamanan
│   │   ├── users/
│   │   │   ├── UserListView.vue     # Tabel Manajemen User (CRUD, Filter, Enable/Disable)
│   │   │   ├── UserDetailView.vue   # Detail & Form Edit User
│   │   │   ├── UserProfileView.vue  # Halaman Profil Mandiri Pengguna
│   │   │   └── RoleListView.vue     # Halaman Manajemen Role & Matriks Permission
│   │   ├── apps/
│   │   │   ├── AppListView.vue      # Daftar Aplikasi Klien & Integrasi SaaS Eksternal
│   │   │   └── AppDetailView.vue    # Form Pendaftaran/Pengaturan Client ID & Redirect URI
│   │   ├── audit/
│   │   │   └── AuditLogView.vue     # Dasbor Laporan Log Audit & Tombol Ekspor
│   │   ├── settings/
│   │   │   └── SecuritySettingView.vue # Form Pengaturan Keamanan (Password Policy, Lockout)
│   │   └── error/
│   │       ├── 403View.vue          # Akses Ditolak (Forbidden)
│   │       └── 404View.vue          # Halaman Tidak Ditemukan
│   ├── App.vue                      # Root Component
│   └── main.js                      # Entry point: Inisialisasi Vue, Pinia, Router, Plugins
├── index.html
├── vite.config.js
└── package.json
```

---

## 3. Desain Komponen & Alur Manajemen State (Pinia)

### 3.1. `authStore.js` (Inti Sesi SSO)
Mengelola status otentikasi global di browser:
* **State:**
  * `user`: Object profil pengguna (`id`, `name`, `email`, `roles`, `permissions`, `tenantId`).
  * `token`: Access Token (JWT) di memori aplikasi.
  * `isAuthenticated`: Boolean status login.
  * `currentTenant`: Informasi identitas organisasi/tenant aktif.
* **Getters:**
  * `hasPermission(permName)`: Mengecek apakah pengguna memiliki izin tertentu.
  * `isSuperAdmin`: Mengecek apakah pengguna bertindak sebagai administrator sistem.
* **Actions:**
  * `login(credentials)`: Memanggil API login, menyimpan token, dan memuat profil.
  * `logout()`: Memanggil endpoint revoke backend, membersihkan state lokal, dan mengarahkan ke halaman login.
  * `refreshToken()`: Memperbarui token akses secara hening (*silent refresh*).

---

## 4. Mekanisme Keamanan Sisi Klien (Client-Side Security)

### 4.1. Axios Interceptor & Silent Refresh (`src/services/api.js`)
* **Request Interceptor:**
  * Secara otomatis menyisipkan header: `Authorization: Bearer <access_token>` dan `X-Tenant-ID: <tenant_id>` ke setiap pemanggilan API privat.
* **Response Interceptor:**
  * Mencegat response error `401 Unauthorized`.
  * Jika terjadi `401`, interceptor menahan request yang tertunda, memanggil `authStore.refreshToken()`, lalu mengulangi (*retry*) request asli jika token baru berhasil diperoleh.
  * Jika refresh gagal (sesi telah habis atau akun di-*disable*), pengguna otomatis dialihkan ke halaman login portal SSO.

### 4.2. Vue Router Navigation Guards (`src/router/guards.js`)
```javascript
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();

  // 1. Cek rute yang membutuhkan otentikasi
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return next({ name: 'Login', query: { redirect: to.fullPath } });
  }

  // 2. Cek rute publik (jangan izinkan user yang sudah login membuka login kembali)
  if (to.meta.guestOnly && authStore.isAuthenticated) {
    return next({ name: 'Dashboard' });
  }

  // 3. Pengecekan Izin Akses Granular (RBAC)
  if (to.meta.permission && !authStore.hasPermission(to.meta.permission)) {
    return next({ name: 'Forbidden' }); // Arahkan ke halaman 403
  }

  next();
});
```

### 4.3. Mitigasi Risiko XSS & Penyimpanan Token
* Untuk mencegah kebocoran token akibat serangan *Cross-Site Scripting (XSS)*:
  * Access Token disimpan di dalam *memory state* Pinia (bukan di `localStorage` jika menggunakan arsitektur cookie HttpOnly untuk refresh token).
  * Seluruh input data pengguna dirender menggunakan *mustache syntax* `{{ }}` standar Vue 3 yang otomatis melakukan HTML encoding, serta melarang penggunaan `v-html` untuk data yang bersumber dari input pengguna.

---

## 5. Alur Integrasi UI Terhadap Fitur Utama

1. **Self-Service Password Reset (SSPR):**
   * Pengguna mengklik "Lupa Password" di `LoginView.vue` $\rightarrow$ membuka `ForgotPassword.vue` $\rightarrow$ kirim permintaan.
   * Pengguna membuka tautan dari email $\rightarrow$ diarahkan ke `ResetPassword.vue` $\rightarrow$ submit password baru yang langsung divalidasi terhadap kebijakan *Security Setting* (panjang, simbol, angka).
2. **Dashboard Manajemen Pengguna & Toggle Status:**
   * Admin membuka `UserListView.vue` $\rightarrow$ melihat daftar pengguna dalam format tabel responsif.
   * Tombol *Switch* status memicu aksi `PATCH /users/:id/status` (Enable/Disable). Pengguna yang di-disable langsung berubah statusnya secara reaktif di tabel tanpa reload.
3. **Ekspor Laporan Log Audit:**
   * Admin membuka `AuditLogView.vue` $\rightarrow$ memasang filter tanggal, jenis aksi, atau aktor $\rightarrow$ mengklik "Export CSV/PDF" $\rightarrow$ `useExport.js` mengunduh dokumen laporan yang siap diaudit.
