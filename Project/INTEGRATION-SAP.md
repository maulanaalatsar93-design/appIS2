# INTEGRATION-SAP.md

## Panduan Import Data Work Order & Rekomendasi dari SAP

Sistem mendukung integrasi data dari sistem SAP perusahaan melalui mekanisme unggah (upload) file berekstensi `.csv` atau `.xlsx`. File ini berisi rincian Work Order (WO) dan Rekomendasi yang ditarik dari modul PM SAP.

---

### 1. Standar Format File CSV/Excel Work Order dari SAP
- **Header Kolom Wajib**: Baris pertama file CSV/Excel memuat header yang dikenali sistem (seperti `Order`, `Operation/Activity`, `Notification Date`, `Oper. System Status`, `Operation WorkCenter`, `Equipment`, `type order`, `Maintenance plant`).
- **Pemisah (Delimiter CSV)**: Koma `,`, Semicolon `;`, atau Tab `\t`.
- **Kunci Unik Pencocokan**: `Order` + `Operation/Activity`

### 2. Aturan Tipe Data & Validasi (Work Order)

| Nama Kolom | Keterangan & Validasi |
| :--- | :--- |
| `Order` | Wajib diisi, Format unik (cth: `400000753877`). Awalan nomor menentukan `tipe_pm`: `10000` = PM01, `200` = PM02, `300` = PM03, `400` = PM04, `500` = PM05, `600` = PM06, `700` = PM07, `800` = PM08, `911` = PM09. |
| `Description` | Teks bebas. Penjelasan instruksi perawatan. |
| `Operation/Activity` | Kode aktivitas operasi (cth: `0010`, `0020`, `1`). Format komposit: `Order-Activity`. |
| `Operation short text` | Informasi detail per-operasi pekerjaan yang diminta. |
| `Notification Date` / `Created on` | Format tanggal `DD-MM-YYYY`, `DD.MM.YYYY`, `YYYY-MM-DD`. |
| `Oper. System Status` | Status pekerjaan SAP (`CNF TECO`, `CNF REL`, `REL`, `CRTD`, `TECO`). Default jika kosong: `CRTD`. |
| `Operation WorkCenter` | WorkCenter penerima pekerjaan (`D0169`, `D0170`, `D0171`, `D0179`, `D0180`, `D0225`). |
| `Equipment` | Nomor ID peralatan/mesin. |
| `Maintenance plant` | Kode pabrik SAP (`D001`-`D009`). Di-mapping otomatis ke ID Pabrik 1-7. |

### 3. Logika Import High-Speed Bulk Upsert (Work Order)
Sistem menggunakan metode PostgreSQL Raw Bulk SQL `INSERT ... ON CONFLICT (nomor_wo, operation_activity) DO UPDATE` per 500 baris. Waktu eksekusi sangat cepat (~10-15 detik untuk 5.000+ data).

---

### 4. Standar Format File CSV/Excel Rekomendasi (Notifikasi SAP)
- **Header Kolom Wajib**: Memuat header SAP seperti `Notification type`, `Created on` / `Notification date`, `Notification`, `Order`, `Equipment`, `Description`, `Reported by` / `Create By`, `Functional Loc`, `System status`.
- **Kunci Unik Pencocokan**: `Notification` + `Reported by`

### 5. Aturan Tipe Data & Validasi (Rekomendasi)

| Nama Kolom | Keterangan & Validasi |
| :--- | :--- |
| `Notification type` | Tipe notifikasi SAP (cth: M1, M2, M4, M7). |
| `Created on` / `Notification date` | Tanggal pembuatan notifikasi. |
| `Notification` | Nomor unik Notifikasi SAP (8-12 digit angka). |
| `Order` | Nomor Work Order terkait (jika ada). |
| `Equipment` | ID peralatan/mesin terkait. |
| `Description` | Teks deskripsi masalah atau rekomendasi temuan inspeksi. |
| `Reported by` / `Create By` | Nama pelapor temuan. Jika kosong otomatis terisi `-`. |
| `Functional Loc` | Kode Lokasi Fungsional. Memuat informasi kode pabrik (karakter ke-6 s/d 9). |
| `System status` / `User Status` | Status notifikasi SAP (cth: OSNO, NOPR, ORAS, NOCO). |

### 6. Logika Import High-Speed Bulk Upsert (Rekomendasi)
1. **Bulk Upsert SQL**: Menggunakan `INSERT ... ON CONFLICT (notification, reported_by) DO UPDATE` per 500 baris.
2. **Pengabaian Baris Kosong (*Empty Row Skip*)**: Baris kosong total dari ekspor SAP otomatis di-skip dan dihitung sebagai `skippedCount` tanpa dianggap sebagai error/gagal.
3. **Response Summary**: Mengembalikan `{ success, failed, skipped }`.
