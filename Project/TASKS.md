# TASKS.md — Roadmap Kerja Bertahap

Aturan: kerjakan satu task sampai selesai & direview, baru lanjut ke
task berikutnya. Jangan minta Antigravity mengerjakan beberapa task
sekaligus dalam satu prompt besar.

## Task 1: Setup Project Dasar (Split Architecture)
- [x] Init folder `frontend/` (React + Vite + JavaScript + Tailwind CSS)
- [x] Setup shadcn/ui + Font Plus Jakarta Sans di `frontend/`
- [x] Init folder `backend/` (Express REST API + JavaScript + Prisma ORM)
- [x] Setup koneksi PostgreSQL + Prisma di `backend/`
- [x] Buat layout dasar: sidebar + topbar + content area (responsif, tampilan enterprise)
Status: selesai

## Task 2: Auth & Role Based Access Control (RBAC)
- [x] Setup Authentication di backend Express (JWT / Session)
- [x] Halaman login di frontend
- [x] Role: Admin, Vice President, Staff Inspection Engineer, Assistant Vice President
- [x] Middleware proteksi endpoint API & proteksi halaman frontend berdasarkan role
Status: selesai

## Task 3: Schema Database & Seeding (Pabrik & Manpower)
- [x] Finalisasi schema Prisma berdasarkan `DATA-MODEL.md` (PostgreSQL)
- [x] Migrasi database PostgreSQL
- [x] Seed data awal: 7 Pabrik, 7 Divisi, 41 personil ManPower riil, User awal
Status: selesai

## Task 4: Import Data SAP (Work Order & Rekomendasi)
- [x] Endpoint backend `POST /workorders/import` & `POST /recommendations/import`
- [x] Parsing file CSV asli SAP sesuai aturan `INTEGRATION-SAP.md`
- [x] Implementasi logika Upsert (Insert on Duplicate Key Update)
- [x] Halaman UI upload file CSV di frontend dengan laporan hasil import (jumlah sukses & gagal)
Status: selesai

## Task 5: Data View Work Order & Rekomendasi
- [x] Tabel data Work Order & Rekomendasi dengan filter & search (tanpa form input manual SAP)
- [x] Detail view per Work Order & Rekomendasi
Status: selesai

## Task 6: Visualisasi & Perbandingan per Pabrik (7 Pabrik)
- [x] Agregasi backend untuk WO & Rekomendasi per pabrik
- [x] Visualisasi ApexCharts perbandingan WO vs Rekomendasi per pabrik (P1A - P7)
- [x] Filter periode (Bulan/Tahun) & Work Center
Status: selesai

## Task 7: Management ManPower & Status Kehadiran (Absensi)
- [x] Sinkronisasi kalender libur nasional (otomatis via API/library `dayoffid` / `api-harilibur`)
- [x] Halaman admin untuk tambah hari libur manual (cuti bersama, dll)
- [x] Form anggota isi status: Cuti, Dinas Dalam Negeri, Dinas Luar Negeri, Training, Sakit, Izin, Referral
- [x] Logika perhitungan status harian sesuai `DATA-MODEL.md` (Sabtu/Minggu → Libur Nasional → Status tercatat → default Hadir)
- [x] Tampilan rekap presensi personil harian & Kalender Monitoring
Status: selesai

## Task 8: Dashboard Ringkasan & Tampilan Publik / Internal
- [x] Tampilan Public / Executive View (sebelum login): Scorecard kiri (mini sparkline), Collapsible Filter Bar, 5 Panel ApexCharts Utama
- [x] Tampilan Internal View (setelah login): Scorecard Personil, Scorecard Pabrik, Scorecard WO & Rekomendasi
Status: selesai

## Task 9: Menu PdM Vibrasi (AMS CSI2140) — ⛔ DITUNDA, JANGAN DIKERJAKAN DULU
Fitur ini dinonaktifkan sementara. Jangan mulai task ini sampai ada
instruksi eksplisit untuk mengaktifkan lagi.
Status: ditunda

---
Update status tiap task selesai. Kalau ada task baru yang muncul
di tengah jalan, tambahkan di sini juga — jangan biarkan Antigravity
kerja dari task yang tidak tercatat.

## Task 10: PdM Rotating — Lanjutan & Enhancement
- [x] Fix routing App.jsx: semua 4 tab PdM bisa diakses dari sidebar
- [x] Backend endpoint `GET /completion-by-pabrik` untuk chart per pabrik
- [x] PdmDashboard: filter tambahan (status, criticality, search kode/area/PIC)
- [x] PdmDashboard: bar chart ApexCharts Selesai vs Terlambat per Pabrik
- [x] PdmDashboard: detail modal klik row (info occurrence + riwayat PIC + quick action)
- [x] PdmDashboard: export CSV tabel yang sudah difilter
- [x] PdmScheduleRules: Monthly PIC Override modal per rule (tombol UserCog)
- [x] PdmScheduleRules: Generate jadwal inline (tombol Zap per rule + Generate Semua)
- [x] PdmCalendar: action buttons di detail panel (Mulai, Lanjutkan, Selesaikan)
- [x] PdmCalendar: tampilkan nama task di detail panel
- [x] `PdM_rotating.md`: diisi spesifikasi resmi lengkap
Status: selesai
