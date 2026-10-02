# Milestone 1: Fondasi Arsitektur Backend & Database

* **Tujuan:** Menyiapkan struktur dasar backend sesuai pola `minionxapp/rest-api` dan skema database relasional.
* **Tugas Spesifik:**
  1. Inisialisasi proyek Node.js dan setup struktur folder (`src/application`, `src/controller`, `src/service`, dll).
  2. Implementasi skema Prisma (`prisma/schema.prisma`) untuk tabel Tenant, User, Role, Permission, Application, dan AuditLog.
  3. Konfigurasi Prisma Client dan koneksi database dengan middleware Multi-Tenant.
  4. Setup logging terpusat menggunakan Winston dan middleware penangan error standar (`response-error.js` & `error-middleware.js`).
* **Kriteria Selesai:** Database terhubung, migrasi berjalan lancar, dan endpoint dasar *health-check* aktif.
