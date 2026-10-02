# Single Sign-On (SSO) & Identity Provider Platform

Platform sistem **Single Sign-On (SSO)** dan **Identity Provider (IdP)** terpusat berbasis **OAuth 2.0 / OpenID Connect (OIDC)** dengan dukungan **Multi-Tenant**, otomatisasi siklus identitas karyawan melalui integrasi **HRIS**, serta dirancang siap menghadapi audit keamanan **Vulnerability Assessment (VA)** dan **Penetration Testing (Pen Test)**.

---

## 📚 Navigasi Dokumentasi Proyek

Seluruh dokumentasi perancangan sistem telah disusun secara komprehensif ke dalam file-file spesifik berikut:

| Dokumen | Deskripsi | Tautan Berkas |
| :--- | :--- | :--- |
| **Aturan Proyek** | Dokumen sumber kebutuhan dan daftar fitur yang disyaratkan. | [Aturan.md](file:///Users/macbook/Mugi_data/workspace/riset/sso_ai/Aturan.md) |
| **Product Requirements Document (PRD)** | Spesifikasi kebutuhan fungsional, non-fungsional, user flow, dan NFR. | [prd_sso.md](file:///Users/macbook/Mugi_data/workspace/riset/sso_ai/prd_sso.md) |
| **Arsitektur Backend** | Desain arsitektur Node.js REST API (pola `minionxapp/rest-api`), Skema Prisma ORM, Katalog Endpoint, dan mitigasi keamanan. | [arsitektur_backend.md](file:///Users/macbook/Mugi_data/workspace/riset/sso_ai/arsitektur_backend.md) |
| **Arsitektur Frontend** | Desain antarmuka Vue 3 (Vite + Pinia + Vue Router), Layouting, Interceptors, Navigation Guards, dan proteksi XSS. | [arsitektur_frontend.md](file:///Users/macbook/Mugi_data/workspace/riset/sso_ai/arsitektur_frontend.md) |
| **Roadmap Pengembangan** | Tahapan implementasi bertahap (*Milestone 1 s/d 6*) dari inisialisasi basis data hingga *Go-Live*. | [roadmap_pengembangan.md](file:///Users/macbook/Mugi_data/workspace/riset/sso_ai/roadmap_pengembangan.md) |

---

## 🛠️ Ringkasan Tech Stack

```text
┌────────────────────────────────────────────────────────┐
│                   FRONTEND (SPA)                       │
│    Vue 3 (Composition API) • Vite • Pinia • Axios      │
│     Tailwind CSS / PrimeVue • Vue Router 4 (RBAC)      │
└───────────────────────────┬────────────────────────────┘
                            │ (REST API & OAuth2 OIDC)
┌───────────────────────────▼────────────────────────────┐
│                    BACKEND (API)                       │
│      Node.js • Express.js (minionxapp/rest-api)        │
│       Prisma ORM • Joi Validation • Winston Log        │
│         Argon2/Bcrypt • JWT (RS256) • Helmet           │
└───────────────────────────┬────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────┐
│                DATABASE & INFRASTRUKTUR                │
│    PostgreSQL / MySQL (Multi-Tenant Schema Isolation)  │
│    HRIS Webhook Integration • SaaS (OAuth 2.0 Clients) │
└────────────────────────────────────────────────────────┘
```

---

## 🌟 Fitur Utama Sistem

1. **Autentikasi & Identity Provider:**
   * Single Sign-On (SSO) & Single Logout (SLO).
   * Standar OAuth 2.0 dan OpenID Connect (OIDC) dengan *Authorization Code Flow + PKCE*.
   * Self-Service Password Reset (SSPR) aman via email verifikasi.
   * Multi-Tenant Isolation untuk multi-organisasi dalam satu platform.
2. **Dashboard & Manajemen Pengguna (CRUD):**
   * Manajemen Pengguna lengkap (*Create, Read, Update, Delete*).
   * Fitur instan **Enable / Disable User** (pembatalan sesi secara *real-time*).
   * Penugasan & Manajemen Role dan Permission (RBAC).
   * Reset password pengguna oleh Admin & Halaman Profil Pengguna Mandiri.
3. **Dashboard & Manajemen Aplikasi (CRUD):**
   * Pendaftaran aplikasi internal dan integrasi pihak ketiga (*SaaS eksternal*).
   * Pengelolaan `client_id`, `client_secret`, whitelist `redirect_uris`, dan rotasi kunci rahasia.
4. **Log & Keamanan (Audit, VA & Pen Test):**
   * Pencatatan log aktivitas sensitif secara terstruktur (*Winston Logger*).
   * Dasbor dan Ekspor Laporan Log Audit (CSV/PDF) untuk kebutuhan kepatuhan.
   * Pertahanan terhadap OWASP Top 10 (validasi Joi keras, Helmet headers, Rate Limiting, sanitasi data).
5. **Otomatisasi HRIS:**
   * **Otomasi Onboarding:** Pembuatan akun dan penugasan peran otomatis saat ada karyawan baru.
   * **Otomasi Offboarding:** Penonaktifan akun dan pencabutan seluruh token aktif secara instan saat karyawan berhenti.

---

## 🚀 Ringkasan Tahapan Pengembangan (Milestones)

* **Milestone 1:** Fondasi Backend & Skema Prisma (Multi-Tenant).
* **Milestone 2:** Layanan Autentikasi Inti & Identity Provider (OAuth 2.0 / OIDC).
* **Milestone 3:** Modul Manajemen Pengguna, Aplikasi & RBAC.
* **Milestone 4:** Antarmuka Frontend Vue 3 (Portal SSO & Dashboard Admin).
* **Milestone 5:** Integrasi Webhook HRIS & SaaS Eksternal.
* **Milestone 6:** Audit Keamanan (VA / Pen Test), Load Test & Peluncuran Resmi.

*(Rincian lengkap setiap milestone dapat dilihat di [roadmap_pengembangan.md](file:///Users/macbook/Mugi_data/workspace/riset/sso_ai/roadmap_pengembangan.md))*
