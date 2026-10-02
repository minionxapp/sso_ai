# Milestone 3: Modul Manajemen Pengguna, Aplikasi & RBAC

* **Tujuan:** Menyediakan API backend untuk seluruh kebutuhan operasional admin.
* **Tugas Spesifik:**
  1. API CRUD Pengguna lengkap dengan filter, pencarian, dan paginasi.
  2. Implementasi fungsi **Enable / Disable User** serta pencabutan sesi instan jika user dinonaktifkan.
  3. API Reset Password User oleh Admin dan halaman profil pengguna mandiri.
  4. Manajemen Role & Permission granular (penugasan role ke user dan pengaturan matriks hak akses).
  5. API CRUD Pendaftaran Aplikasi Klien (manajemen `client_id`, `client_secret`, dan whitelist `redirect_uris`).
  6. Pencatatan otomatis setiap aksi administratif ke tabel **AuditLog**.
* **Kriteria Selesai:** Seluruh endpoint CRUD lulus pengujian integrasi Jest dengan cakupan pengujian (*test coverage*) memadai.
