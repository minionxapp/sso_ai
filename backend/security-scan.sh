#!/bin/bash
# Milestone 6: Security Scan & VA Script Simulation

echo "Memulai proses Vulnerability Assessment (VA) & Security Check..."

# 1. Mengecek dependensi modul Node.js dari kerentanan umum (OWASP)
echo "[1/3] Menjalankan NPM Audit (Mengecek vulnerable packages)..."
npm audit --audit-level=high

# 2. Mengecek file terkait secret / sensitive data yang tidak tersimpan dengan aman
echo "[2/3] Menjalankan Gitleaks (Scanning hardcoded secrets)..."
if command -v gitleaks &> /dev/null
then
    gitleaks detect --source . -v
else
    echo "Gitleaks tidak ditemukan. Silakan install gitleaks untuk memindai repository dari hardcoded secrets."
fi

# 3. Sonarqube / SAST simulasi
echo "[3/3] Memeriksa code-smells dan kerentanan injeksi..."
# Dalam environment CI/CD sebenarnya, kita akan menjalankan: 
# sonar-scanner -Dsonar.projectKey=sso-identity-provider
echo "[OK] Static Application Security Testing dilewati atau diserahkan pada pipeline."

echo "Proses pengujian keamanan selesai. Pastikan semua isu High & Critical telah di-resolve (Remediation) sebelum Go-Live."
