# AGENTS.md — Project Rules & Context

## Status Project
INI PROJECT BARU DARI NOL (Greenfield). Arsitektur split: folder `frontend/` (React + Vite) dan `backend/` (Express REST API), KEDUANYA ditulis ulang dari nol dengan kode baru. Dokumen di `Project/` (AGENTS.md, DATA-MODEL.md, dst.) adalah PANDUAN STRUKTUR & PENCEGAH DRIFT.

⛔ PERINGATAN — JANGAN GUNAKAN VERSI LAMA/LEGACY ("ISTEK"):
Ada versi project LAMA yang HARUS DIABAIKAN TOTAL kalau ditemukan di mana pun (riwayat kerja, cache, folder lain, upload lain) — JANGAN disalin/direuse kodenya, walau strukturnya (frontend/backend split) kelihatan mirip dengan project sekarang. Ciri-ciri versi lama:
- Nama project "ISTEK" / "Inspeksi Teknik 2"
- **Database MySQL** (project sekarang WAJIB PostgreSQL — ini beda paling penting, arsitektur folder boleh mirip tapi DB-nya HARUS Postgres, jangan pernah pakai MySQL)
- Font Inter + Poppins (dua font) — SALAH, yang benar cuma Plus Jakarta Sans (satu font, lihat DESIGN-SYSTEM.md)
- Format CSV import generik untuk workorder dan rekomendasi dari SAP sama dengan format CSV asli SAP yang ada di INTEGRATION-SAP.md

Kalau agen menemukan salah satu ciri di atas (terutama MySQL) di kode/dokumen manapun, STOP dan laporkan ke user — jangan pakai sebagai referensi kode.

ATURAN WAJIB SEBELUM AGEN MENGERJAKAN APAPUN:
1. Cek `package.json` di `frontend/` dan `backend/` (masing-masing punya package.json sendiri, dua project Node terpisah).
2. Backend TIDAK render UI apapun — murni REST API (JSON response).
3. Frontend TIDAK connect langsung ke database — semua data lewat fetch ke backend API.
4. Selalu sinkronkan perubahan struktur database dengan `DATA-MODEL.md`.

## Tujuan Project
Dashboard/admin panel internal (Inspeksi Teknik 2) untuk mengelola data Laporan Inspeksi Teknik (Work Order & Rekomendasi dari SAP), monitoring man power, Perencanaan manpower dari peta calendar anggota yang sudah terdata hadir atau tidak.

## Fitur yang DITUNDA (dinonaktifkan sementara, jangan dikerjakan dulu)
- Menu PdM Vibrasi (AMS CSI2140): seluruh fitur upload/analisa/approval data vibrasi AMS DITUNDA dulu.

## Tech Stack (WAJIB)
- Bahasa: JavaScript (React `.jsx` / `.js`)
- Frontend: React + Vite (folder `frontend/`)
- Backend: Express REST API (folder `backend/`)
- Database: PostgreSQL
- ORM/DB access: Prisma ORM
- Styling: Tailwind CSS
- Komponen UI: shadcn/ui (berbasis Tailwind + Radix UI)
- Chart: ApexCharts (`react-apexcharts`) — WAJIB

## Aturan Coding & Data Model
- Functional component saja.
- Validasi input pada seluruh API endpoints.
- RBAC role check sebelum rendering data.
- Nama field WAJIB persis sama dengan yang didefinisikan di `DATA-MODEL.md` (contoh: `pabrik_id`, bukan `pabrikId`).
- Integritas data: dilarang keras meng-override data riil dengan mock/hardcoded value jika sudah terkoneksi DB.

## Dokumen Terkait
- `Project/DATA-MODEL.md` — struktur data Work Order, Rekomendasi, Man Power, PdM, Absensi.
- `Project/INTEGRATION-SAP.md` — cara import data dari SAP.
- `Project/Import_Rules.md` — aturan resmi import data SAP Work Order (Composite Key Order+Activity, status SAP, CNF %, dan Sprint 5 Task Linkage).
- `Project/BUSINESS_RULES.md` — SUMBER KEBENARAN untuk semua formula/aturan bisnis.
- `Project/DESIGN-SYSTEM.md` — pedoman visual/UI resmi.
- `Project/DASHBOARD-SPEC.md` — spesifikasi teknis dashboard, KPI, chart, filter, ekspor laporan, dan modal breakdown.
- `Project/Kamus_SAP.md` — istilah & kode status resmi SAP.
- `Project/TASKS.md` — roadmap task bertahap.

## Aturan Import & Linkage SAP (Sprint 5)
1. **Composite Key**: Pencocokan unik data SAP Work Order WAJIB menggunakan kunci komposit: `Order + Operation/Activity` (contoh: `40012345-0010`).
2. **Upsert Method**: Insert on Duplicate Key Update berdasarkan Composite Key.
3. **Rumus CNF %**:
   $$\text{CNF \%} = \frac{\text{Jumlah WO (CNF/TECO tanpa PCNF)}}{\text{Jumlah WO (Bukan CRTD)}} \times 100$$
4. **Penautan Task (`tasks`)**:
   - Single Source of Truth tetap di `work_orders`.
   - Active Task constraint: Pasangan `(order_no, operationActivity)` hanya boleh terikat pada **satu active task** (`status != 'CANCELLED'`).
   - Jika task dibatalkan (`status = 'CANCELLED'`), pasangan `(order_no, operationActivity)` kembali `UNASSIGNED`.
   - Backward compatibility: Task lama dengan `order_no IS NULL` dan `operationActivity IS NULL` tetap valid.

## Public & Internal Executive Dashboard Layout
- **Scorecards Horizontal**: Work Order (Total Order, PM 04, PM02+) & Rekomendasi (Total Rekomendasi, M04, M07) tersusun sejajar 2 kolom dengan mini sparklines.
- **Executive Report Toolbar**: Ekspor laporan PDF & Excel untuk Dashboard, Program, SAP Work Order, Presensi (Role restricted: Admin/VP/Manager/Supervisor/AVP).
- **PM Breakdown Modal**: Detail rincian PM01 s/d PM10 saat ikon info pada Total Work Order diklik.
- **Symmetrical Chart Grid**:
  - `Work Order per Pabrik` (Kiri) vs `Rilis Rekomendasi per Pabrik` (Kanan)
  - `Distribusi Tipe Order` (Kiri) vs `Rekomendasi M4 & M7` (Kanan)
  - `Job Load & Output` (Full Width Bottom)
