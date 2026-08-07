# DASHBOARD SPECIFICATION

> **Spesifikasi Dashboard Operasional (Industrial Operations Dashboard)**
> Berkas ini merupakan spesifikasi teknis resmi untuk tampilan, pengukuran KPI, visualisasi grafik, dan mekanisme filter pada modul Dashboard & Monitoring.

---

## DAFTAR ISI

1. Overview & Tujuan
2. Hierarki Tampilan & Tata Letak Menurut Autentikasi
3. Tampilan Tanpa Login (Public Executive Dashboard — Selain Departemen ISTEK 2)
4. Tampilan Setelah Login (Internal Department Dashboard — Khusus Departemen ISTEK 2)
5. Komponen Scorecard & Mini Sparkline Charts
6. Spesifikasi Floating Collapsible Filter Bar
7. Spesifikasi Grafik & Visualisasi ApexCharts
8. Integrasi Sumber Data SAP

---

## 1. OVERVIEW & TUJUAN

Dashboard berfungsi sebagai pusat pemantauan operasional keandalan peralatan industri (*reliability engineering*), status pekerjaan *Work Order* (SAP PM), serta konversi notifikasi rekomendasi inspeksi menjadi perintah kerja.

### Prinsip Desain Utama
* **Source of Truth Visual:** Mengikuti `DESIGN-SYSTEM.md` (Restrained Industrial Design, Tanpa Neonglow/Glassmorphism berlebih, Font `Plus Jakarta Sans`).
* **Source of Truth Rumus & Bisnis:** Mengikuti `BUSINESS_RULES.md` (Formula CNF %, Total WO, Tipe PM01–PM10, Pemetaan Maintenance Plant 7 Pabrik Resmi).
* **Source of Truth Istilah SAP:** Mengikuti `Kamus_SAP.md` (System Status `CRTD`, `REL`, `CNF`, `TECO`, `PCNF` dan User Status Notifikasi).
* **Integritas Data:** Seluruh angka dihitung dinamis dari data asli hasil impor SAP tanpa manipulasi *mock data override*.

---

## 2. HIERARKI TAMPILAN & TATA LETAK MENURUT AUTENTIKASI

Sistem membedakan tampilan Dashboard menjadi 2 mode tampilan utama:

---

## 3. TAMPILAN TANPA LOGIN (PUBLIC EXECUTIVE DASHBOARD — SELAIN DEPARTEMEN ISTEK 2)

Ditampilkan secara default saat pengguna belum login / mengakses sebagai pihak luar/eksekutif selain departemen ISTEK 2.

```
+-------------------+-----------------------------------+-----------------------------------+
| SCORECARD KIRI    | CHART 1: Work Order               | CHART 2: Work Order               |
| (STACK VERTICAL)  | (PM 04 dan selain PM 02)          | (Order berdasarkan Pabrik)        |
|                   |                                   | (P1A, P2, P3, P4, P5, P6, P7)     |
| • Work Order:     +-----------------------------------+-----------------------------------+
|   - Total: 19,068 | CHART 3: Job Load & Output                                            |
|   - PM 04: 17,969 | (Tren Line Chart Bulanan Jan - Des: Total WO vs Total Rekomendasi)|
|   - PM02+:  1,099 |                                                                   |
|                   +-----------------------------------+-----------------------------------+
| • Rekomendasi:    | CHART 4: Rekomendasi              | CHART 5: Rekomendasi              |
|   - Total:  2,138 | (M4 dan M7)                       | (Rilis berdasarkan Pabrik)        |
|   - M04:   1,307  |                                   | (P1A, P2, P3, P4, P5, P6, P7)     |
|   - M07:     831  |                                   |                                   |
+-------------------+-----------------------------------+-----------------------------------+
```

### Rincian Elemen Mode Public:
1. **Vertical Stack Cards (Kiri)**:
   - **Work Order**: Total Order (**19,068** hasil deduplikasi unik), PM 04 (17,969), PM02+ (1,099) dilengkapi mini sparkline chart.
   - **Rekomendasi**: Total Rekomendasi (2,138), M04 (1,307), M07 (832) dilengkapi mini sparkline chart.
2. **Floating Collapsible Filter Bar**:
   - Tombol melayang *Filter Tampilan* di pojok kanan atas yang dapat di-collapse / expand.
   - Opsi filter: **Bagian / Work Center** (D0179, D0180, D0225, D0171, D0169, D0170), **Bulan** (01-12), dan **Tahun**.
3. **5 Panel Grafik Utama (ApexCharts)**:
   - **Chart 1**: `Work Order ( PM 04 dan selain PM 02 )`
   - **Chart 2**: `Work Order ( Order berdasarkan Pabrik )` (P1A s/d P7)
   - **Chart 3**: `Job Load & Output` (Line Chart Jan–Des: Total Work Order vs Total Rekomendasi)
   - **Chart 4**: `Rekomendasi ( M4 dan M7 )`
   - **Chart 5**: `Rekomendasi ( Rilis berdasarkan Pabrik )` (P1A s/d P7)

---

## 4. TAMPILAN SETELAH LOGIN (INTERNAL DEPARTMENT DASHBOARD — KHUSUS DEPARTEMEN ISTEK 2)

Ditampilkan setelah pengguna berhasil login sebagai staf/manajerial departemen ISTEK 2.

### 4 Scorecard Utama:
1. **Scorecard Personil**:
   - Total Manpower (41 Personil), Ketersediaan/Kehadiran Hari Ini, Organik (28) vs Non-Organik (13).
2. **Scorecard Pabrik**:
   - Ringkasan 7 Unit Pabrik (Pabrik 1A, 2, 3, 4, 5, 6, 7) & Rata-rata CNF % Rate.
3. **Scorecard Work Order**:
   - Total Work Order & Kalkulasi CNF % Rate Sesuai `BUSINESS_RULES.md`.
4. **Scorecard Rekomendasi**:
   - Ringkasan Notifikasi Inspeksi Keandalan M4 & M7.

### Tabel Realisasi & Tindak Lanjut Rekomendasi (M04 & M07):
- **Struktur Kolom**:
  1. `No`
  2. `Bagian` (Work Center)
  3. `Realisasi Rekomendasi (User Status)` (`MGR/NOPR/ORAS`)
  4. `Pending` (`OSNO/NOPR`)
  5. `I/P` (`NOPR ORAS`)
  6. `Selesai` (`NOCO ORAS`)
- *Catatan: Kolom "Target <5 hari" dan "Realisasi" lama telah dihapus sesuai arahan pengembang.*

---

## 5. SPESIFIKASI FLOATING COLLAPSIBLE FILTER BAR

- Position: `fixed top-20 right-8 z-40` / `fixed bottom-6 left-1/2 -translate-x-1/2 z-[100]`
- Collapse Toggle: Tombol pill melayang berlatar `#0F172A` (slate-900) dengan icon filter.
- Filter Fields & Quick Nav:
  1. Bagian / Work Center (D0179, D0180, D0225, D0171, D0169, D0170)
  2. Bulan (01 s/d 12) & Quick Prev/Next Month Navigator (`ChevronLeft` / `ChevronRight`)
  3. Tahun (2026, 2025, dst.) & Tombol Reset ke bulan berjalan

---

## 6. FITUR EKSPOR LAPORAN EKSEKUTIF (EXECUTIVE REPORT TOOLBAR)

- **Toolbar Akses Cepat**: Menyediakan tombol pengunduhan laporan multi-format (PDF & Excel) pada bagian atas dashboard.
- **Modul Laporan**:
  1. **Laporan Dashboard** (PDF & Excel)
  2. **Laporan Program Kerja** (PDF & Excel)
  3. **Laporan Data SAP Work Order** (PDF & Excel)
  4. **Laporan Presensi / Attendance** (PDF & Excel)
- **Role Permission Check**: Akses ekspor dibatasi hanya untuk role `Administrator`, `Admin`, `VP`, `Manager`, `Supervisor`, `AVP`.
- **Toast Feedback**: Notifikasi interaktif saat membuat laporan (`Generating Report...`, `Report generated successfully`).

---

## 7. MODAL RINCIAN DISTRIBUSI TIPE PM (PM01 - PM10)

- **Modal Trigger**: Tombol info (`InfoIcon`) pada Scorecard Total Work Order.
- **Konten Popup**:
  - Ringkasan total PM04 vs PM02+ (Non-PM04).
  - Rincian distribusi jumlah dan persentase (%) Work Order untuk seluruh kode PM resmi (`PM01` Breakdown, `PM02` Corrective, `PM03` Preventive, `PM04` Predictive, `PM05` Improvement, `PM06` Refurbishment, `PM07` Calibration, `PM08` Standing, `PM09` Turn Around, `PM10` General).

---


