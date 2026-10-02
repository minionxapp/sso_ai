# Milestone 6: Pengujian Keamanan (VA & Pen Test), Optimasi & Peluncuran

* **Tujuan:** Menjamin keandalan, stabilitas, dan keamanan sistem sebelum peluncuran resmi.
* **Tugas Spesifik:**
  1. **Vulnerability Assessment (VA):** Pemindaian otomatis terhadap celah keamanan (OWASP Dependency Check, SonarQube, pemindaian port dan konfigurasi TLS).
  2. **Penetration Testing (Pen Test):** Simulasi pengujian penetrasi terhadap kerentanan OWASP Top 10 (SQL Injection, XSS, Broken Access Control, CSRF, Session Hijacking, Brute Force).
  3. Perbaikan (*remediation*) terhadap setiap temuan kerentanan hasil VA dan Pen Test.
  4. *Load Testing & Stress Testing* untuk memastikan latensi otentikasi tetap di bawah 300ms pada beban puncak.
  5. Penyusunan dokumentasi operasional, panduan integrasi bagi developer aplikasi klien, dan *Go-Live*.
* **Kriteria Selesai:** Laporan hasil Pen Test berstatus *Passed/Low Risk*, sistem berhasil dideploy ke lingkungan produksi dengan monitoring aktif.
