# Milestone 4: Pengembangan Antarmuka Frontend (Vue 3)

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
