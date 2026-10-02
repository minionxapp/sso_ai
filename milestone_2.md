# Milestone 2: Layanan Autentikasi & Identity Provider (OAuth 2.0 / OIDC)

* **Tujuan:** Membangun mesin utama SSO dan manajemen token identitas yang aman.
* **Tugas Spesifik:**
  1. Implementasi autentikasi kredensial lokal (hashing password dengan Argon2/Bcrypt).
  2. Pembuatan mekanisme OAuth 2.0 *Authorization Code Flow with PKCE*.
  3. Endpoint standar OIDC: `/.well-known/openid-configuration`, `/oauth/authorize`, `/oauth/token`, dan `/oauth/userinfo`.
  4. Mekanisme pembuatan dan penandatanganan JWT (Access Token & ID Token) menggunakan kunci privat (RS256).
  5. Fitur *Self-Service Password Reset (SSPR)* via tautan token email sekali pakai.
* **Kriteria Selesai:** Aplikasi klien sampel berhasil melakukan login SSO dan memvalidasi ID Token pengguna.
