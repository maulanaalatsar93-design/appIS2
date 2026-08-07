# AGENTS.md — Project Rules & Context

## Status Project
INI PROJECT BARU DARI NOL (Greenfield). Arsitektur split: folder
`frontend/` (React + Vite) dan `backend/` (Express REST API),
KEDUANYA ditulis ulang dari nol dengan kode baru. Dokumen di sini
(AGENTS.md, DATA-MODEL.md, dst.) adalah PANDUAN STRUKTUR & PENCEGAH
DRIFT.

⛔ PERINGATAN — JANGAN GUNAKAN VERSI LAMA/LEGACY ("ISTEK"):
Ada versi project LAMA yang HARUS DIABAIKAN TOTAL kalau ditemukan di
mana pun (riwayat kerja, cache, folder lain, upload lain) — JANGAN
disalin/direuse kodenya, walau strukturnya (frontend/backend split)
kelihatan mirip dengan project sekarang. Ciri-ciri versi lama:
- Nama project "ISTEK" / "Inspeksi Teknik 2"
- **Database MySQL** (project sekarang WAJIB PostgreSQL — ini beda
  paling penting, arsitektur folder boleh mirip tapi DB-nya HARUS
  Postgres, jangan pernah pakai MySQL)
- Font Inter + Poppins (dua font) — SALAH, yang benar cuma Plus
  Jakarta Sans (satu font, lihat DESIGN-SYSTEM.md)
- Format CSV import generik untuk workorder dan rekomendasi dari SAP 
 sama dengan format CSV asli SAP yang ada di INTEGRATION-SAP.md

Kalau agen menemukan salah satu ciri di atas (terutama MySQL) di
kode/dokumen manapun, STOP dan laporkan ke user — jangan pakai
sebagai referensi kode, walau boleh dilihat sebagai contoh pola
struktur folder saja.

ATURAN WAJIB SEBELUM AGEN MENGERJAKAN APAPUN:
1. Cek `package.json` di `frontend/` dan `backend/` (masing-masing
   punya package.json sendiri, dua project Node terpisah).
2. Backend TIDAK render UI apapun — murni REST API (JSON response).
3. Frontend TIDAK connect langsung ke database — semua data lewat
   fetch ke backend API.
4. Selalu sinkronkan perubahan struktur database dengan `DATA-MODEL.md`.

## Tujuan Project
Dashboard/admin panel internal (Inspeksi Teknik 2) untuk mengelola data Laporan Inspeksi Teknik (Work Order & Rekomendasi dari SAP), monitoring man power, Perencanaan manpower dari peta calendar anggota yang sudah terdata hadir atau tidak.

## Fitur yang DITUNDA (dinonaktifkan sementara, jangan dikerjakan dulu)
- Menu PdM Vibrasi (AMS CSI2140): seluruh fitur upload/analisa/approval
  data vibrasi AMS DITUNDA dulu. Dokumentasinya tetap ada di
  DATA-MODEL.md/BUSINESS_RULES.md untuk referensi nanti, TAPI jangan
  dibangun sekarang. Kalau agen menemukan bagian ini di dokumen lain,
  abaikan dan jangan kerjakan sampai ada instruksi lanjut.

## Tech Stack (WAJIB, jangan diganti tanpa persetujuan)
- Bahasa: JavaScript (React `.jsx` / `.js`)
- Frontend: React + Vite (folder `frontend/`)
- Backend: Express REST API (folder `backend/`)
- Database: PostgreSQL
- ORM/DB access: Prisma ORM
- Styling: Tailwind CSS
- Komponen UI: shadcn/ui (berbasis Tailwind + Radix UI)
- Chart: ApexCharts (`react-apexcharts`) — WAJIB
- Hosting: Dioptimalkan untuk deployment murah/gratis (misal Vercel untuk aplikasi, Supabase/Aiven/Render untuk PostgreSQL).

## Penggunaan Bahasa
- Keputusan: SEMUA kode ditulis menggunakan JavaScript, BUKAN TypeScript.

## Role / RBAC
Role manajerial yang ada: Admin, Vice President, Staff Inspection Engineer, Assistant Vice President.

## Aturan Coding
- Functional component saja, bukan class component.
- Semua endpoint API wajib validasi input.
- Semua halaman wajib dicek role/permission user sebelum render data, sesuai RBAC yang sudah ada.
- PENTING: nama field WAJIB persis sama dengan yang didefinisikan di `DATA-MODEL.md` (contoh: `pabrik_id`, bukan `pabrikId`) — konsisten di database, API, maupun frontend.
- Integritas data: dilarang keras meng-override data riil dengan mock/hardcoded value jika sudah terkoneksi DB.

## Styling & UI
- Font: Plus Jakarta Sans
- Chart: ApexCharts, warna disesuaikan dengan status/tipe.

## Dokumen Terkait
- `DATA-MODEL.md` — struktur data Work Order, Rekomendasi, Man Power (termasuk seed data 41 personil riil), PdM, Absensi.
- `INTEGRATION-SAP.md` — cara import data dari SAP (format CSV, validasi).
- `Import_Rules.md` — aturan resmi import data SAP Work Order (Composite Key Order+Activity, status SAP, CNF %, dan Sprint 5 Task Linkage).
- `BUSINESS_RULES.md` — SUMBER KEBENARAN untuk semua formula/aturan bisnis.
- `DESIGN-SYSTEM.md` — pedoman visual/UI resmi (warna, tipografi, spacing).
- `DASHBOARD-SPEC.md` — spesifikasi teknis dashboard, KPI, chart, filter.
- `Kamus_SAP.md` — istilah & kode status resmi SAP.
- `TASKS.md` — roadmap task bertahap, kerjakan urut sesuai file ini.

## Batasan Keras (hard constraints)
- Jangan ubah schema database tanpa menjelaskan alasannya dulu.
- Jangan pilih hosting/layanan berbayar tanpa persetujuan (utamakan free-tier).
- Jangan ganti library komponen UI dari shadcn/ui, atau chart dari ApexCharts, ke library lain tanpa persetujuan.

## Untuk penginputan Work order & Rules Import (Sprint 5)
Baca `INTEGRATION-SAP.md` dan `Import_Rules.md`.
1. **Composite Key**: Pencocokan unik data SAP Work Order WAJIB menggunakan kunci komposit: `Order + Operation/Activity` (contoh: `40012345-0010`).
2. **Upsert Method**: Sistem menggunakan *Insert on Duplicate Key Update* (Upsert) berdasarkan Composite Key.
3. **Pencapaian CNF %**:
   $$\text{CNF \%} = \frac{\text{Jumlah WO (CNF/TECO tanpa PCNF)}}{\text{Jumlah WO (Bukan CRTD)}} \times 100$$
4. **Penautan ke Task (`tasks`) & Single Source of Truth**:
   - Data SAP Work Order tetap bersumber dari `work_orders`.
   - Task terikat ke `order_no`, `operationActivity`, dan `notifNo`.
   - **Pencegahan Penugasan Ganda (Duplicate Active Assignment Prevention)**: Pasangan `(order_no, operationActivity)` hanya boleh terikat pada **satu active task** (`status != 'CANCELLED'`).
   - Jika task dibatalkan (`status = 'CANCELLED'`), pasangan `(order_no, operationActivity)` kembali berstatus *UNASSIGNED*.
   - Backward compatibility: Task lama dengan `order_no IS NULL` dan `operationActivity IS NULL` tetap valid.
5. **Normalisasi Jam UTC (`12:00:00 UTC`)**: Semua data tanggal SAP yang di-parse diset jamnya secara persis ke `12:00:00 UTC` untuk mencegah pergeseran boundary tanggal (boundary date shift) akibat offset selisih timezone lokal (WIB/WITA) dengan UTC.

## Untuk penginputan Rekomendasi
Baca `INTEGRATION-SAP.md`
Sistem menggunakan metode *Insert on Duplicate Key Update* (Upsert).
1. Jika `Notification` & `Created on` belum ada di database, sistem akan membuat baris baru (INSERT).
2. Jika `Notification` & `Created on` sudah terdaftar, sistem akan memperbarui nilainya dengan data dari file CSV (UPDATE).
3. Jika `Notification` & `Created on` tidak terpenuhi salah satunya walau terjadi duplikat pada `Notification` atau `Created on` sistem akan membuat baris baru (INSERT).

*⛔ PERINGATAN — Untuk data SAP rekomendasi dan workorder datanya melalui upload csv, jangan input manual.*

## Untuk penginputan Absensi
Baca `DATA-MODEL.md`

## Tampilan Dashboard Menurut Status Autentikasi

### 1. Tampilan Tanpa Login (Public / Executive View untuk selain Departemen ISTEK 2)
Tampilan khusus untuk pengguna publik/eksekutif/pihak luar departemen (saat tidak/belum login):
- **Kartu Scorecard Sejajar Horisontal dengan Sparklines (2 Kolom Layout)**:
  - **Work Order Scorecard (Kiri)**: Sub-kolom horizontal Total Order, PM 04, PM02+ dilengkapi mini Sparkline chart.
  - **Rekomendasi Scorecard (Kanan)**: Sub-kolom horizontal Total Rekomendasi, M04, M07 dilengkapi mini Sparkline chart.
- **Floating Collapsible Filter Bar**:
  - Tombol melayang *Filter Tampilan* yang dapat di-collapse/expand berisi filter **Bagian/Work Center**, **Bulan**, dan **Tahun**.
- **Panel Grafik Utama (Symmetrical ApexCharts Grid)**:
  1. `Work Order per Pabrik` (Kiri) vs `Rilis Rekomendasi per Pabrik` (Kanan) — Symmetrical Bar Charts
  2. `Distribusi Tipe Order (PM04 vs PM02+)` (Kiri) vs `Rekomendasi (M4 & M7)` (Kanan) — Symmetrical Donut Charts
  3. `Job Load & Output` (Full Width Bottom) — Bar chart tren bulanan membandingkan Total Work Order vs Total Rekomendasi.

### 2. Dashboard Khusus Departemen ISTEK 2 (Internal View setelah Login)
Tampilan khusus untuk personil internal departemen ISTEK 2 (setelah login):
- **Executive Report Toolbar**: Tombol ekspor laporan (PDF & Excel) untuk modul Dashboard, Program, SAP Work Order, dan Presensi/Attendance (dibatasi role Admin/VP/Manager/Supervisor/AVP).
- **Scorecard Personil**: Manpower yang tersedia/hadir hari ini, organik/non-organik.
- **Scorecard Pabrik**: Ringkasan 7 unit pabrik & CNF % rate.
- **Scorecard Work Order**: Ringkasan Work Order, mini sparklines, pencapaian CNF %, serta tombol info modal breakdown tipe PM (PM01 - PM10).
- **Scorecard Rekomendasi**: Ringkasan Notifikasi Inspeksi Keandalan M4 & M7.

## Catatan Konteks Tambahan
- Tampilan fluid cocok untuk desktop dan gadget, maka pastikan semua tabel dan grafis Responsive.
- Hindari animasi atau transisi yang memperlambat akses data.
- Usahakan minim biaya ketika deploy.
- Buat semenarik mungkin UI/UX melebihi PowerBI atau Tableau.

# Aturan Khusus Proyek ISTEK

- **Styling UI/UX (Enterprise App):** Antarmuka harus selaras dengan standar _Enterprise App_ (bersih, padat data, profesional). Gunakan **Plus Jakarta Sans** untuk seluruh teks. Gunakan visualisasi dengan **ApexCharts**.
- **Logika Input SAP:** Jangan menambahkan menu input manual untuk data SAP. Penginputan data SAP murni menggunakan logika **Import File (Excel/CSV)** melalui endpoint `POST /workorders/import` menggunakan parameter `form-data` (key: `file`). JANGAN tambahkan logika input manual lainnya.