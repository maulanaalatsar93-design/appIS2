# DATA-MODEL.md — Struktur Data Utama

Tujuan file ini: mendefinisikan entitas data dan relasinya SEBELUM
agen membuat schema Prisma, supaya tidak menebak struktur sendiri.

## Entitas Utama

### 1. Pabrik
- id
- nama_pabrik
- [ISI: kode/singkatan pabrik kalau ada, misal dari SAP]

### 2. WorkOrder
[ISI kolom yang dibutuhkan, misal:]
- id
- nomor_wo (dari SAP)
- deskripsi
- tanggal_dibuat
- status (enum resmi, dari DESIGN-SYSTEM.md): CNF TECO, CNF REL,
  REL, CRTD, TECO
- tipe_pm (enum resmi, dari DESIGN-SYSTEM.md): PM01 (Breakdown
  Maintenance), PM02 (Corrective Maintenance), PM03 (Preventive
  Maintenance), PM04 (Predictive Maintenance), PM05 (Improvement/
  Modification), PM06 (Refurbishment Order), PM07 (Calibration
  Order), PM08 (Standing Order), PM09 (Turn Around Order), PM10
  (General Maintenance)
- pabrik_id → relasi ke Pabrik (WAJIB — dipakai untuk perbandingan
  jumlah WO per pabrik di dashboard)
- pic (person in charge, opsional/informatif saja — TIDAK dipakai
  untuk hitung beban kerja, karena data assignment dari SAP tidak
  akurat)
- prioritas

### 3. Rekomendasi
- id
- notification (String, nomor notifikasi SAP)
- notification_type (String: M4, M7, M04, M07)
- created_on (DateTime, tanggal buat notifikasi)
- order (String, nomor work order terkait)
- equipment (String)
- description (String)
- reported_by (String)
- functional_loc (String)
- work_center (String)
- pabrik_id → relasi ke Pabrik
- status (System Status SAP: OSNO, NOPR, NOPR ORAS, NOCO ORAS, dst. Default: "Diajukan")
- user_status (User Status SAP: MGR, NOPR, ORAS, dst.)
- createdAt / updatedAt

### 4. ManPower
- id
- npk — WAJIB tipe TEKS/STRING (bukan angka), karena NPK Organik
  berupa angka murni (contoh: `4033496`), tapi NPK Non Organik
  berupa alfanumerik campuran (contoh: `K225716`, `KNE-B-20.103`)
- name
- employee_type (enum): `Organik`, `Non Organik`
- division_id → relasi ke Divisi (lihat Bagian 4a di bawah)
- position — teks bebas, berisi jabatan (contoh: "Vice President",
  "AVP Rotating 1", "Rotating 1", "Bengkel", "QC", "Sekretaris").
  Awalan "AVP" pada position menandakan posisi kepala/atasan divisi
  tsb, TAPI ini bukan sumber kebenaran untuk role RBAC login (lihat
  Bagian 5 — User) — cuma label jabatan struktural.
- is_active (boolean, 1/0) — status KEPEGAWAIAN (aktif bekerja di
  perusahaan atau tidak). BEDA dari StatusKehadiran (Bagian 6) yang
  mencatat status harian (Cuti/Sakit/dst.) — is_active TIDAK
  berubah harian, cuma berubah kalau karyawan resign/berhenti.
- Catatan: ManPower TIDAK dipakai untuk hitung beban kerja/assignment
  WO (karena data SAP tidak akurat untuk itu). Entitas ini dipakai
  untuk data kepegawaian & fitur absensi.

### 4a. Divisi (referensi division_id di atas)
Berdasarkan contoh data personil riil, terlihat pola mirip Work Center SAP
(Bagian 4, BUSINESS_RULES.md) tapi TIDAK 100% identik — ada Divisi
"Sekretaris" yang tidak punya padanan Work Center SAP.

| division_id | Nama Divisi | Padanan Work Center SAP (kalau ada) |
|---|---|---|
| 1 | Rotating 1 | D0179 |
| 2 | Rotating 2 | D0180 |
| 3 | PPHS & OSBL | D0225 |
| 4 | Bengkel | D0169 |
| 5 | Metalurgi | D0171 |
| 6 | QC | D0170 |
| 7 | Sekretaris | (tidak ada padanan SAP) |

Mapping di atas dikonfirmasi benar berdasarkan 41 data personil riil
yang tersedia (lihat Bagian 4b).

### 4b. Contoh Data / Seed Data ManPower (41 personil)
Data riil ini bisa dipakai langsung sebagai seed data untuk testing,
dan jadi acuan pasti untuk format `npk`, `employee_type`, `division_id`,
`position`.

| npk | name | employee_type | division_id | position | is_active |
|---|---|---|---|---|---|
| 4033496 | Febryan Bagus P | Organik | 1 | Vice President | 1 |
| 4114064 | Heri Kurniawan | Organik | 1 | AVP Rotating 1 | 1 |
| 4093894 | Rostam | Organik | 3 | AVP PPHS & OSBL | 1 |
| 4254883 | Amir Salim | Organik | 1 | Rotating 1 | 1 |
| 4244822 | Teguh Pambudi | Organik | 1 | Rotating 1 | 1 |
| 4244786 | Farhan Alrosad Munir | Organik | 1 | Rotating 1 | 1 |
| 4093895 | Supriadi | Organik | 2 | AVP Rotating 2 | 1 |
| 4124201 | Grymen Paembonan | Organik | 2 | Rotating 2 | 1 |
| 4164506 | Aang Wisnugraha | Organik | 2 | Rotating 2 | 1 |
| 4244820 | Shofwan Jaharulfalah | Organik | 2 | Rotating 2 | 1 |
| 4254882 | Alvarizqi Abdullah | Organik | 2 | Rotating 2 | 1 |
| 4254891 | Krispinus | Organik | 2 | Rotating 2 | 1 |
| K225716 | Padil Sulhat | Non Organik | 1 | Rotating 1 | 1 |
| K257607 | Taufik Hidayat | Non Organik | 1 | Rotating 1 | 1 |
| KNE-B-20.103 | Syaharuddin | Non Organik | 1 | Rotating 1 | 1 |
| K257616 | Abdul Ghofur | Non Organik | 1 | Rotating 1 | 1 |
| K257612 | Yoga Pratama | Non Organik | 2 | Rotating 2 | 1 |
| K257615 | Novri Andri | Non Organik | 2 | Rotating 2 | 1 |
| K257611 | Muhammad Ardian | Non Organik | 2 | Rotating 2 | 1 |
| K227517 | Dicky Bastian | Non Organik | 2 | Rotating 2 | 1 |
| K257608 | Ibnu Kustriadi | Non Organik | 2 | Rotating 2 | 1 |
| K12162 | Faisal Dani P. | Non Organik | 3 | PPHS & OSBL | 1 |
| K225718 | Maulana Cipta P | Non Organik | 2 | Rotating 2 | 1 |
| 4093896 | Zulkifli | Organik | 4 | AVP Bengkel | 1 |
| 4114066 | Darmawan | Organik | 4 | Bengkel | 1 |
| 4244811 | Muhammad Ilham N. | Organik | 4 | Bengkel | 1 |
| K257613 | Windy Ferdiansyah | Non Organik | 4 | Bengkel | 1 |
| K257614 | Fauzan Al Hafiz | Non Organik | 4 | Bengkel | 1 |
| K257617 | Azhary Meril | Non Organik | 4 | Bengkel | 1 |
| K257618 | Maulana Wafdullah | Non Organik | 4 | Bengkel | 1 |
| K257609 | Arikson | Non Organik | 4 | Bengkel | 1 |
| 4144334 | Ridwan Sunarya | Organik | 5 | AVP Metalurgi | 1 |
| 4234743 | Fajar Adi Prasetya | Organik | 5 | Metalurgi | 1 |
| 4244788 | Fitian Syauqi Firdaus F. | Organik | 5 | Metalurgi | 1 |
| 4124213 | D.G. Pasarella | Organik | 6 | QC | 1 |
| KNE-B-25.1859 | Nurdiansyah | Non Organik | 5 | Metalurgi | 1 |
| KNE-B-23.1258 | Muhammad D.M. | Non Organik | 5 | Metalurgi | 1 |
| KNE-B-22.684 | Joko Purnomo | Non Organik | 6 | QC | 1 |
| KNE-B-25.1928 | Dani Yuwana | Non Organik | 5 | Metalurgi | 1 |
| KNE-B-25.1974 | Tabah Triananto | Non Organik | 5 | Metalurgi | 1 |
| K268492 | Anggit Dwi Yanti | Non Organik | 7 | Sekretaris | 1 |

Catatan dari data ini:
- Division 1 (Rotating 1) juga menampung "Vice President" (Febryan
  Bagus P) — kemungkinan VP ini posisi tertinggi yang ditempatkan di
  bawah division_id 1 secara administratif, bukan berarti VP hanya
  membawahi Rotating 1 saja. [ISI/KONFIRMASI kalau perlu]
- Pola jabatan: "AVP {Divisi}" = kepala divisi tsb, nama divisi polos
  = staff/anggota biasa di divisi tsb.


### 5. User (untuk login/akses dashboard — beda dari ManPower)
- id
- email
- role (admin / staff)
- Catatan: User = orang yang LOGIN ke dashboard.
  ManPower = data tenaga kerja yang DIKELOLA di dashboard.
  Dua hal ini bisa saja orang yang sama, tapi datanya terpisah
  kecuali diputuskan digabung.

### 6. StatusKehadiran (Absensi)
Prinsip: default = HADIR. Baris di tabel ini HANYA dibuat untuk
hari/periode yang BUKAN hadir normal (pengecualian saja, bukan
mencatat "hadir" tiap hari).
- id
- man_power_id → relasi ke ManPower
- tanggal_mulai
- tanggal_selesai (bisa sama dengan tanggal_mulai kalau cuma 1 hari)
- jenis (enum): Cuti, DinasDalamNegeri, DinasLuarNegeri, Training,
  Sakit, Izin, Referral
- keterangan (opsional, teks bebas)
- Tidak ada proses approval — begitu anggota mengisi, langsung
  tercatat dan langsung mempengaruhi status kehadiran hari itu.

### 7. HariLibur (Kalender Libur Nasional)
Dipakai untuk menentukan hari apa saja yang BUKAN hari kerja
(selain Sabtu-Minggu yang otomatis dianggap libur oleh sistem).
- id
- tanggal
- nama_libur (misal: "Hari Kemerdekaan RI")
- sumber (enum): Otomatis, Manual
- Data dasar diambil otomatis dari API/library kalender libur
  nasional Indonesia (contoh opsi: package `dayoffid`, atau API
  publik seperti api-harilibur). Admin bisa menambahkan hari libur
  tambahan secara manual (misal: cuti bersama internal perusahaan,
  libur khusus non-nasional) — baris manual ini ditandai
  sumber=Manual supaya tidak tertimpa saat sinkronisasi otomatis
  berikutnya.

## Logika Perhitungan Status Harian (bukan tabel, tapi aturan)
Untuk menentukan status seorang ManPower di tanggal tertentu:
1. Cek apakah tanggal = Sabtu/Minggu → jika ya: "Libur Akhir Pekan"
2. Cek apakah tanggal ada di tabel HariLibur → jika ya: "Libur Nasional"
3. Cek apakah ada baris StatusKehadiran yang mencakup tanggal
   tersebut untuk ManPower ini → jika ya: pakai jenis yang tercatat
   (Cuti/Sakit/dst.)
4. Kalau tidak ada satupun di atas → default: "Hadir"

## Logika Dashboard Utama: Perbandingan WO vs Rekomendasi per Pabrik
Tujuan: memudahkan atasan membaca data, BUKAN monitoring beban kerja
individu. Tampilan berupa perbandingan jumlah per pabrik:
- Jumlah Work Order masuk per pabrik (bisa difilter per periode/status)
- Jumlah Rekomendasi per pabrik (bisa difilter per periode/status)
- Ditampilkan berdampingan (misal: bar chart per pabrik dengan 2
  bar — WO vs Rekomendasi — atau tabel ringkasan per pabrik)


### 8. ManpowerPlan (Rencana Tenaga Kerja)
- id
- title (Nama Program)
- startDate
- endDate
- department
- area
- status (Draft, Waiting AVP Approval, Waiting VP Approval, Revision Requested, Rejected, Approved, Cancelled)
- createdById → relasi ke User (Pembuat dokumen)
- createdAt / updatedAt

### 9. ManpowerPlanMember (Personil yang Ditugaskan)
- id
- planId → relasi ke ManpowerPlan
- manPowerId → relasi ke ManPower (Personil yang dipilih)
- role (Peran dalam pekerjaan)
- notes

### 10. ManpowerPlanApproval (Alur Persetujuan)
- id
- planId → relasi ke ManpowerPlan
- approverId → relasi ke User (AVP / VP)
- role (AVP / VP)
- status (Pending, Approved, Rejected, Revision)
- notes (Catatan revisi/penolakan)
- actionDate

### 11. ManpowerPlanAudit (Jejak Rekam / Audit Trail)
- id
- planId → relasi ke ManpowerPlan
- userId → relasi ke User (Pelaku aksi)
- action (Created, Submitted, Approved, Rejected, Revision, Bypass, Cancelled)
- details (Detail perubahan/log)
- createdAt


 
 # # #   1 2 .   D a i l y T a s k   ( C a t a t a n   P e k e r j a a n   H a r i a n   &   M a n   H o u r s ) 
 -   i d 
 -   t a n g g a l   ( D a t e )      T a n g g a l   p e l a k s a n a a n   p e k e r j a a n 
 -   c o d e _ r e f e r e n s i   ( S t r i n g ,   o p s i o n a l )      K o d e   r e f e r e n s i   i n t e r n a l   ( d a r i   E x c e l ) 
 -   m a n _ p o w e r _ i d   �!  r e l a s i   k e   M a n P o w e r   ( o p s i o n a l ) .   J i k a   N U L L   b e r a r t i   U n a s s i g n e d / b e l u m   d i - t a k e . 
 -   p a b r i k _ i d   �!  r e l a s i   k e   P a b r i k   ( o p s i o n a l )      L o k a s i   P a b r i k 
 -   a r e a   ( S t r i n g ,   o p s i o n a l )      A r e a / U n i t   d i   p a b r i k 
 -   e q u i p m e n t   ( S t r i n g ,   o p s i o n a l )      N a m a   m e s i n / e q u i p m e n t 
 -   k a t e g o r i _ p r o g r a m   ( S t r i n g )      J e n i s   p e k e r j a a n   ( P d M ,   E x t r a ,   M e e t i n g ,   T A ,   d l l ) 
 -   d e s k r i p s i _ p e k e r j a a n   ( S t r i n g )      D e s k r i p s i   p e k e r j a a n 
 -   s t a t u s   ( S t r i n g )      E n u m :   U n a s s i g n e d ,   I n   P r o g r e s s ,   D o n e ,   H o l d ,   C a n c e l l e d 
 -   w o _ n o t i f   ( S t r i n g ,   o p s i o n a l )      R e f e r e n s i   W O   S A P   /   N o t i f 
 -   w a k t u _ m u l a i   ( D a t e T i m e ,   o p s i o n a l )      J a m   p e r s i s   s a a t   T a k e   J o b   /   S t a r t   d i t e k a n 
 -   w a k t u _ s e l e s a i   ( D a t e T i m e ,   o p s i o n a l )      J a m   p e r s i s   s a a t   F i n i s h   d i t e k a n 
 -   m a n _ h o u r s   ( F l o a t ,   o p s i o n a l )      D u r a s i   k e r j a   d a l a m   j a m .   D i h i t u n g   o t o m a t i s . 
 -   c r e a t e d _ b y _ i d   �!  r e l a s i   k e   U s e r   ( o p s i o n a l )      S i a p a   y a n g   m e n c a t a t   j o b   i n i 
 -   i s _ s e l f _ i n p u t   ( B o o l e a n )      T r u e   j i k a   d i i n p u t   m a n d i r i   o l e h   p e k e r j a   d i   l a p a n g a n ,   F a l s e   j i k a   d a r i   A d m i n . 
 -   c r e a t e d A t   /   u p d a t e d A t  
 