# Milestone 5: Integrasi HRIS & Otomatisasi Siklus Karyawan

* **Tujuan:** Menghubungkan SSO dengan ekosistem luar organisasi (HRIS dan SaaS pihak ketiga).
* **Tugas Spesifik:**
  1. Pembuatan endpoint Webhook `/api/v1/webhooks/hris` dengan verifikasi tanda tangan HMAC.
  2. **Otomasi Onboarding:** Pembuatan user otomatis, penugasan role departemen, dan pengiriman email undangan ketika ada karyawan baru dari HRIS.
  3. **Otomasi Offboarding:** Penonaktifan akun secara *real-time* dan pembatalan seluruh sesi login aktif ketika status karyawan menjadi *terminated/resigned*.
  4. Integrasi dan pengujian SSO dengan aplikasi SaaS eksternal (misal: Google Workspace atau Jira).
  5. Fitur ekspor laporan Log Audit ke format CSV/PDF untuk kebutuhan audit kepatuhan.
* **Kriteria Selesai:** Event dari HRIS otomatis mengeksekusi onboarding dan offboarding tanpa intervensi manual tim IT.
