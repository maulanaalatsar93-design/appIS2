# PdM_rotating.md — Spesifikasi Fitur PdM Rotating

> Dokumen resmi fitur **Predictive Maintenance (PdM) Rotating Equipment**.
> Ini adalah sumber kebenaran untuk arsitektur, business rules, dan
> UI/UX fitur ini. Sinkronkan perubahan schema dengan `DATA-MODEL.md`.

---

## 1. Ringkasan Fitur

Menu **PdM Rotating** adalah modul internal untuk mengelola jadwal
inspeksi berkala (Predictive Maintenance) peralatan rotating di 7
pabrik. Fitur ini mencakup:

- **Master Schedule Rules**: definisi jadwal per equipment (bulanan
  sekali atau dua kali, kode, sub-area, PIC default, kritikalitas).
- **Auto-generate**: sistem otomatis membuat occurrence (jadwal konkret)
  dari rules setiap bulan, dengan pergeseran otomatis jika jatuh di
  hari libur/weekend.
- **Task Board**: anggota melihat task yang di-assign ke mereka,
  mengklaim task bebas dari job board, mengubah status task.
- **Kalender Visual**: tampilan kalender bulanan semua occurrence
  yang bisa diklik untuk melihat detail dan melakukan aksi cepat.
- **Dashboard Monitoring**: KPI ringkasan (total, selesai, overdue),
  chart distribusi status, bar chart per pabrik, tabel semua task
  dengan filter & export CSV.

---

## 2. Status Task (State Machine)

```
SCHEDULED -> ASSIGNED (claim / generate dgn default PIC)
ASSIGNED  -> IN_PROGRESS (mulai kerjakan)
IN_PROGRESS -> ON_HOLD (tahan sementara)
ON_HOLD   -> IN_PROGRESS (lanjutkan)
IN_PROGRESS -> COMPLETED (selesai)
ASSIGNED   -> COMPLETED (tandai langsung selesai)
*          -> CANCELLED  (batalkan, Admin/Supervisor)
```

Keterlambatan dihitung dari `scheduledDate` hingga `now()` untuk
semua task yang belum COMPLETED/CANCELLED:
- `daysLate > 0` → Overdue (ditampilkan oranye)
- `daysLate > 4` → Overdue Critical (ditampilkan merah, Overdue +4)

---

## 3. Recurrence Types

| Value | Keterangan |
|---|---|
| `MONTHLY_ONCE` | 1 occurrence per bulan, tanggal = `dateFirst` |
| `MONTHLY_TWICE` | 2 occurrence per bulan, tanggal = `dateFirst` & `dateSecond` |
| `TENTATIVE` | Tidak di-generate otomatis, dibuat manual |

Rules dengan `isActive = false` atau `recurrence = 'TENTATIVE'`
diabaikan saat generate otomatis.

---

## 4. PIC Assignment Priority

Saat generate, urutan prioritas PIC:
1. `PdmRuleMonthlyPic` (override bulan ini) — paling tinggi
2. `defaultPicId` pada rule
3. NULL (status = `SCHEDULED`)

Jika PIC ditemukan → status awal occurrence = `ASSIGNED`.
Jika tidak ada PIC → status awal = `SCHEDULED`.

---

## 5. Holiday Shift Logic

Jika tanggal target (`dateFirst`/`dateSecond`) jatuh pada:
- Sabtu (day = 6)
- Minggu (day = 0)
- Tanggal merah di tabel `HariLibur`

Maka `scheduledDate` digeser ke hari kerja berikutnya. Flag
`wasShifted = true` disimpan dan ditampilkan di UI dengan label
"(geser)".

---

## 6. Generate Monthly Schedule

**Endpoint**: `POST /api/pdm-schedule/generate`

**Body**: `{ year, month, pabrik_id? }`

- Menggunakan Upsert: occurrence yang sudah ada tidak ditimpa
  (hanya INSERT baru yang belum ada).
- Mengembalikan jumlah dibuat & dilewati.

---

## 7. Completion Rate per Pabrik

**Endpoint**: `GET /api/pdm-schedule/completion-by-pabrik?year=&month=`

Mengembalikan per pabrik:
- `total`: jumlah occurrence bulan ini
- `completed`: jumlah berstatus COMPLETED
- `overdue`: jumlah terlambat (belum COMPLETED/CANCELLED dan melewati scheduledDate)
- `completionRate`: completed/total * 100 (%)

---

## 8. Halaman Frontend

| Tab Sidebar | Komponen | Path |
|---|---|---|
| Dashboard PdM | `PdmDashboard.jsx` | `pdm-dashboard` |
| Kalender PdM | `PdmCalendar.jsx` | `pdm-calendar` |
| Task Board | `PdmTaskBoard.jsx` | `pdm-tasks` |
| Master Schedule | `PdmScheduleRules.jsx` | `pdm-rules` |

### 8.1 PdmDashboard

Filter: Pabrik, Bulan, Tahun (server-side) + Status, Kritikalitas,
Search kode/area/PIC (client-side).

Charts:
- Donut: distribusi status
- Bar horizontal: Selesai vs Terlambat per Pabrik (ApexCharts)

Fitur:
- KPI 8 kartu (Total, Selesai, In Progress, On Hold, Assigned,
  Belum PIC, Overdue, Overdue +4)
- Panel overdue list (klik buka modal detail)
- Tabel semua task (klik row buka modal detail)
- Modal detail: info occurrence + riwayat PIC + quick action
- Export CSV tabel yang sudah difilter

### 8.2 PdmCalendar

Filter: Pabrik, Status, Kritikalitas + navigasi bulan.

Fitur:
- Grid kalender 7 kolom (Senin-Minggu)
- Klik hari → panel detail kanan
- Pill task di sel hari (maks 3 + "+n lagi")
- Panel detail: info task + action button (Mulai, Lanjutkan, Selesaikan)
- Tombol "Generate" jadwal bulan ini

### 8.3 PdmTaskBoard

Tabs: "Tugas Saya" + "Job Board"

Tugas Saya: task yang di-assign ke user login (ASSIGNED/IN_PROGRESS/ON_HOLD).
Job Board: task SCHEDULED tanpa PIC, bisa di-claim.

Fitur per task card:
- Header strip warna (merah = Critical)
- Info: pabrik, equipment, sub-area, PIC, target, scheduled, status
- Riwayat PIC (collapsible)
- Action buttons sesuai status
- Ganti PIC (modal reassign dengan alasan)

### 8.4 PdmScheduleRules

Tabel semua master rules dengan CRUD lengkap.

Fitur tambahan:
- Tombol "Generate Semua" (global) → modal pilih bulan/tahun
- Per rule: tombol Generate (spesifik rule/pabrik)
- Per rule: tombol Override PIC Bulan Ini → modal override

---

## 9. Hak Akses (RBAC)

| Aksi | Role yang diizinkan |
|---|---|
| Lihat Dashboard/Kalender | Semua yang login |
| Claim task dari Job Board | Semua yang punya `man_power_id` |
| Start/Hold/Complete task | PIC task atau Admin/Supervisor |
| Create/Edit/Delete Rules | Admin, Supervisor |
| Generate jadwal | Admin, Supervisor |
| Override PIC bulan | Admin, Supervisor |
| Cancel task | Admin, Supervisor |

---

## 10. Catatan Implementasi

- Backend: `pdmScheduleController.js` (566+ baris) + `pdmScheduleRoutes.js`
- Frontend: folder `frontend/src/pages/pdm/` (4 file)
- Database: model `PdmScheduleRule`, `PdmScheduleOccurrence`,
  `PdmPicHistory`, `PdmDailyActivity`, `PdmRuleMonthlyPic`
  (lihat `DATA-MODEL.md` untuk schema lengkap)
- Chart library: ApexCharts (`react-apexcharts`)
- Semua state transition memakai Prisma `$transaction` untuk konsistensi
