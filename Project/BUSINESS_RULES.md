# BUSINESS_RULES.md — Aturan & Formula Bisnis

> Source of truth untuk SEMUA perhitungan/formula bisnis di aplikasi.
> Referensi visual: `DESIGN-SYSTEM.md`. Referensi istilah SAP:
> `Kamus_SAP.md`. Referensi format import: `INTEGRATION-SAP.md`.
> Jangan taruh business calculation di file lain — semua formula
> harus bersumber dari file ini.

---

## 1. Formula CNF % (Confirmation Rate)

CNF % = (Jumlah WO berstatus CNF TECO atau TECO, TANPA PCNF)
        ÷ (Jumlah WO dengan status BUKAN CRTD)
        × 100

Catatan: field status yang dipakai untuk formula ini adalah field
5-nilai hasil import (`CNF TECO`, `CNF REL`, `REL`, `CRTD`, `TECO`) —
BUKAN System Status SAP mentah di `Kamus_SAP.md` (yang punya lebih
banyak kode seperti PCNF, GMPS, CLSD, dll). Field 5-nilai ini sudah
merupakan hasil ringkasan/derivasi dari sistem SAP asal.

---

## 2. Deteksi Tipe PM dari Nomor Order

Tipe PM (PM01–PM09, PM10 belum ada aturan prefix — [ISI kalau ada])
ditentukan dari awalan digit kolom `Order`:

| Awalan Order | Tipe PM |
|---|---|
| `10000` | PM01 |
| `200` | PM02 |
| `300` | PM03 |
| `400` | PM04 |
| `500` | PM05 |
| `600` | PM06 |
| `700` | PM07 |
| `800` | PM08 |
| `911` | PM09 |

Aturan ini berlaku SAMA untuk file import Work Order maupun
Rekomendasi (lihat `INTEGRATION-SAP.md` Bagian 2, kedua tabel).

Referensi nama & warna resmi tiap PM Type: lihat `DESIGN-SYSTEM.md`
Bagian 5.2.

---

## 3. Mapping Kode Pabrik (Maintenance Plant)

| Kode SAP | Pabrik |
|---|---|
| `D001` | Pabrik 6 |
| `D002` | Pabrik 2 |
| `D003` | Pabrik 3 |
| `D004` | Pabrik 4 |
| `D005` | Pabrik 5 |
| `D006` | Pabrik 6 |
| `D007` | Pabrik 7 |
| `D008` | Pabrik 1A |
| `D009` | Pabrik 1A |

**PENTING:** `D001`/`D006` sama-sama Pabrik 6, dan `D008`/`D009`
sama-sama Pabrik 1A — ini SENGAJA (dua kode SAP untuk satu pabrik
fisik yang sama), BUKAN kesalahan data. Total pabrik valid: **7**
(Pabrik 1A, 2, 3, 4, 5, 6, 7). Jangan asumsikan "Pabrik 1" polos itu
ada — yang ada adalah "Pabrik 1A".

Untuk data Rekomendasi, kode pabrik diambil dari `Functional Loc`
(4 karakter mulai karakter ke-6), lalu di-mapping dengan tabel yang
sama. Lihat `INTEGRATION-SAP.md` Bagian 2 (tabel Rekomendasi).

---

## 4. Mapping Kode Work Center

| Kode SAP | Work Center |
|---|---|
| `D0169` | Inspeksi Bengkel |
| `D0170` | Inspeksi QC |
| `D0171` | Inspeksi Metalurgi |
| `D0179` | Inspeksi Rotating 1 |
| `D0180` | Inspeksi Rotating 2 |
| `D0225` | Inspeksi PPHS & OSBL |

---

## 5. Logika Upsert saat Import

Work Order: kunci unik = kombinasi `Order` + `Operation/Activity`.
- Kombinasi belum ada → INSERT baris baru.
- Kombinasi sudah ada → UPDATE data yang sudah ada.
- Kalau salah satu dari `Order`/`Operation/Activity` kosong,
  walau ada baris lain yang mirip (duplikat sebagian) → tetap INSERT
  baris baru (jangan di-update ke baris lama).

Rekomendasi: kunci unik = `Notification`.
- Belum ada → INSERT.
- Sudah ada → UPDATE.

Baris yang gagal validasi (format tanggal salah, kode pabrik tidak
dikenal, status di luar daftar sah) di-skip, dicatat di laporan hasil
import (format: "X Sukses, Y Gagal").

---

## 6. Formula Progress Program (Work Program)

Completion % = (Jumlah Task berstatus Completed) ÷ (Total Task) × 100

---

## 7. Logika Status Kehadiran Harian (Absensi)

Urutan pengecekan (lihat juga `DATA-MODEL.md` Bagian StatusKehadiran):
1. Sabtu/Minggu → "Libur Akhir Pekan"
2. Ada di tabel HariLibur → "Libur Nasional"
3. Ada baris StatusKehadiran mencakup tanggal tsb → pakai jenis yang
   tercatat (Cuti/Sakit/Dinas/dst.)
4. Tidak ada satupun di atas → default "Hadir"

---

## 8. Penanganan Timezone Boundary Tanggal Import SAP & Query Bulanan

Untuk mencegah terjadinya *boundary date shift* (pergeseran tanggal & bulan) akibat perbedaan perlakuan timezone lokal (WIB/WITA) dengan UTC:
1. **Noon UTC Standardization (`12:00:00 UTC`)**: Semua data tanggal dari file SAP yang hanya menyertakan informasi tanggal (tanpa jam) wajib di-parse dan diset jamnya ke `12:00:00 UTC`. Ini menjamin tanggal lokal dan UTC selalu jatuh pada tanggal dan bulan yang persis sama.
2. **Koreksi Data Boundary Historis**: Jika data mentah tersimpan dengan jam boundary `15:xx` s/d `20:xx UTC` (akibat offset selisih 7-8 jam dari midnight lokal `00:00:00`), sistem secara otomatis mengoreksi nilai tersebut dengan menambah 1 hari ke jam `12:00:00 UTC` hari yang dimaksud.
3. **Query Range Bulanan**: Query filter per bulan wajib menggunakan rentang jam UTC penuh:
   - UTC Start: `YYYY-MM-01T00:00:00.000Z`
   - UTC End: `YYYY-MM-[30/31]T23:59:59.999Z`

---

## 9. Pengelompokan & Metric Kehadiran Manpower

Menu **Man Power & Kalender** menyatukan tabel daftar personil dan kalender presensi dalam satu modul dengan kontrol *segmented toggle*. Metric kehadiran pada dashboard dikelompokkan menjadi 7 kategori resmi:
1. **Absen**: Ketidakhadiran tanpa keterangan resmi.
2. **Cuti**: Personil yang sedang mengambil hak cuti.
3. **Izin**: Personil yang mengajukan izin resmi.
4. **Sakit / Referal**: Personil yang tidak hadir karena alasan kesehatan/sakit.
5. **Dinas Dalam Negeri**: Penugasan kerja di dalam negeri di luar unit kerja utama.
6. **Dinas Luar Negeri**: Penugasan kerja luar negeri.
7. **Training**: Keikutsertaan dalam pelatihan atau sertifikasi.

---

## 10. Formula Perhitungan KPI Realisasi & Tindak Lanjut Rekomendasi (M04 & M07)

Tabel **Realisasi & Tindak Lanjut Rekomendasi (M04 & M07)** dihitung berdasarkan filter rentang tanggal `created_on` (atau fallback `createdAt` jika `created_on` null) untuk notifikasi berjenis `M4`, `M7`, `M04`, `M07`:

### 10.1 Pemisahan Kolom Status
* **`status` (System Status)**: Menyimpan status sistem SAP (contoh: `OSNO`, `NOPR`, `NOPR ORAS`, `NOCO ORAS`).
* **`user_status` (User Status)**: Menyimpan status pengguna SAP (contoh: `MGR`, `NOPR`, `ORAS`).

### 10.2 Formula Kolom KPI
1. **Realisasi Rekomendasi (User Status)**:
   $$\text{User Status} = \text{COUNTIF}(\text{User Status}, \text{"MGR"}) + \text{COUNTIF}(\text{User Status}, \text{"NOPR"}) + \text{COUNTIF}(\text{User Status}, \text{"ORAS"})$$
   *Pencocokan kata persis (exact word matching) pada kolom `user_status`.*

2. **Pending (System Status)**:
   $$\text{Pending} = \text{COUNTIF}(\text{System Status}, \text{"OSNO"}) + \text{COUNTIF}(\text{System Status}, \text{"NOPR"})$$
   *System Status mengandung kata "OSNO" atau "NOPR", tetapi BUKAN frasa "NOPR ORAS" atau "NOCO ORAS".*

3. **I/P (System Status)**:
   $$\text{I/P} = \text{COUNTIF}(\text{System Status}, \text{"NOPR ORAS"})$$
   *System Status mengandung frasa "NOPR ORAS".*

4. **Selesai (System Status)**:
   $$\text{Selesai} = \text{COUNTIF}(\text{System Status}, \text{"NOCO ORAS"})$$
   *System Status mengandung frasa "NOCO ORAS".*
