# ATURAN IMPORT DATA SAP WORK ORDER & REKOMENDASI

Dokumen ini menjelaskan aturan resmi pengunggahan (import) data SAP Work Order dan Rekomendasi (Notifikasi), logika pencocokan unik, penanganan performa bulk import, serta penanganan baris kosong SAP.

---

## 1. Format & Kunci Pencocokan Unik (Composite Key)

### A. Work Order (WO)
Data SAP Work Order tidak boleh dicocokkan hanya dengan `Order` saja. Kunci unik pencocokan wajib menggunakan kombinasi komposit:

$$\text{Composite Key (Work Order)} = \text{Order} + \text{Operation/Activity}$$

* Contoh:
  * `Order`: `40012345`
  * `Activity`: `0010`
  * **Unique Composite Key**: `40012345-0010`

### B. Rekomendasi (Notifikasi SAP)
Data Rekomendasi menggunakan kombinasi kunci komposit:

$$\text{Composite Key (Rekomendasi)} = \text{Notification} + \text{Reported by}$$

* Contoh:
  * `Notification`: `10098765`
  * `Reported by`: `BAMBANG`
  * **Unique Composite Key**: `10098765` + `BAMBANG` (jika `Reported by` kosong, otomatis diisi `-`).

---

## 2. Pemetaan Status Operasional & Tipe PM SAP

### Work Order Status
- **CRTD (Created)**: Work Order baru dibuat.
- **REL (Released)**: Work Order siap dieksekusi.
- **CNF (Confirmed)**: Pekerjaan telah dikonfirmasi selesai.
- **TECO (Technically Completed)**: Pekerjaan selesai secara teknis.
- **PCNF (Partially Confirmed)**: Konfirmasi sebagian.

### Tipe Order PM (Berdasarkan Awalan Nomor Order)
- `10000...` = PM01
- `200...` = PM02
- `300...` = PM03
- `400...` = PM04
- `500...` = PM05
- `600...` = PM06
- `700...` = PM07
- `800...` = PM08
- `911...` = PM09
- Lainnya = PM10

---

## 3. Rumus Pencapaian CNF %
$$\text{CNF \%} = \frac{\text{Jumlah WO (CNF/TECO tanpa PCNF)}}{\text{Jumlah WO (Bukan CRTD)}} \times 100$$

---

## 4. Logika Performa Bulk Import (High-Speed Bulk Upsert)

Untuk mencegah kemacetan koneksi pool Supabase (`P2024`) dan mempercepat waktu upload dari menit ke hitungan detik (~10-15 detik untuk 4.600+ baris):

1. **Bulk SQL Query**: Menggunakan raw SQL PostgreSQL `INSERT ... ON CONFLICT DO UPDATE` melalui `prisma.$executeRawUnsafe`.
2. **Ukuran Batch (Batch Size)**: 500 baris per query bulk, mengurangi jumlah round-trip jaringan dari 9.280 query menjadi hanya ~10 query bulk.
3. **Fallback Otomatis**: Jika query bulk mengalami masalah pada satu batch, sistem secara otomatis beralih ke pencocokan per baris (*row-by-row fallback*) khusus untuk batch tersebut.

---

## 5. Penanganan Baris Kosong & Alias Header Kolom SAP

File ekspor mentah dari SAP (*RAW Export*) biasanya memiliki baris judul grup, subtotal, dan footer kosong di akhir file.

1. **Pengabaian Baris Kosong (*Skipped Rows*)**:
   Baris yang seluruh selnya kosong (*empty row*) di-skip secara otomatis tanpa dihitung sebagai kegagalan (`skippedCount`). Response API mengembalikan 3 angka: `success`, `failed`, dan `skipped`.
2. **Alias Header Kolom**:
   Sistem mendukung berbagai variasi nama header dari ekspor SAP:
   - **Notification**: `Notification`, `Notifikasi`, `Notification No`, `Notification Number`, `No Notifikasi`, `No. Notif`, `Notif. No.`, `Notif No`, `Notif`
   - **Date**: `Created on`, `Created On`, `Notification Date`, `Notification date`, `NotificationDate`, `Date`, `Tanggal`, `Tgl`, `Entry Date`
   - **Reported by**: `Reported by`, `Reported By`, `Author`, `Pelapor`, `Created by`, `Created By`, `Create By`
   - **Status**: `System status`, `System Status`, `User Status`, `Status`, `User status`

---

## 6. Sprint 5 SAP Work Order to Task Linkage & Backward Compatibility
- **Single Source of Truth SAP**: Data asal SAP tetap disimpan pada `work_orders` melalui mekanisme `ON CONFLICT DO UPDATE`.
- **Penautan ke Task (`tasks`)**: Pendaftaran task menyertakan kolom `order_no`, `operationActivity`, dan `notifNo`.
- **Pencegahan Penugasan Ganda (Duplicate Active Assignment Prevention)**: Satu pasangan `(order_no, operationActivity)` hanya boleh terikat pada **satu active task** (`status != 'CANCELLED'`).
- **Pengecualian Task CANCELLED**: Jika sebuah task dibatalkan (`status = 'CANCELLED'`), pasangan `(order_no, operationActivity)` kembali berstatus *UNASSIGNED* dan dapat digunakan oleh Work Program lain.
- **Backward Compatibility**: Task lama dengan `order_no IS NULL` dan `operationActivity IS NULL` tetap valid.

---

## 7. Penghapusan / Pengosongan Data (Clear Data)
Sistem menyediakan fitur untuk menghapus data secara massal (Work Order atau Rekomendasi) berdasarkan tanggal upload data (mengacu pada field `updatedAt`).
- **Pelacakan Tanggal**: Sistem menggunakan `updatedAt` sebagai indikator "kapan data di-upload/diperbarui".
- **Endpoint History**: `/api/upload/history` digunakan untuk menarik daftar tanggal unik kapan data pernah di-upload.
- **Mekanisme Hapus**: Saat pengguna memilih tanggal dan menghapus data, sistem akan mengeksekusi penghapusan semua record (Work Order atau Rekomendasi) yang nilai `updatedAt`-nya jatuh pada rentang waktu `00:00:00` hingga `23:59:59` di tanggal yang dipilih.

---

## 8. Penanganan Timezone Tanggal SAP (`12:00:00 UTC`)
- **Normalisasi Parser Impor (`parseDate`)**: Semua string tanggal dari ekspor SAP yang di-parse oleh parser wajib diset jamnya secara persis ke `12:00:00 UTC` (`new Date(Date.UTC(year, month, day, 12, 0, 0))`).
- **Pencegahan Pergeseran Bulan (Boundary Shift)**: Mengingat pergeseran Waktu Indonesia Barat/Tengah (UTC+7 / UTC+8) terhadap UTC, penetapan jam siang UTC ini mencegah tanggal 1 di suatu bulan bergeser ke jam `15:59:24 UTC` / `16:00:00 UTC` tanggal terakhir bulan sebelumnya, sehingga kalkulasi per bulan (seperti capaian CNF %) selalu 100% konsisten dan tepat di bulan sasaran.