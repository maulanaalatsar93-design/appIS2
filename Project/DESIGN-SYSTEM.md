# DESIGN SYSTEM
## Industrial Operations & Reliability Dashboard

> Palet warna (Navy + Orange) terinspirasi dari identitas korporat
> PKT (Pupuk Kaltim) — biru & jingga. Ini SENGAJA, bukan kebetulan.
> Jangan ganti warna dasar ini ke skema lain.

> Dokumen ini menjadi pedoman visual/UI aplikasi.
> Tujuannya menjaga konsistensi tampilan antar halaman dan mencegah
> setiap menu memiliki gaya visual yang berbeda.

---

# 1. DESIGN PRINCIPLES

Aplikasi harus terlihat:

- Professional
- Industrial
- Clean
- Operational
- Informative
- Compact
- Easy to scan
- Human-designed
- Tidak terlalu dekoratif
- Tidak terlihat seperti template AI/SaaS generik

Prioritas:

1. Readability
2. Information hierarchy
3. Consistency
4. Business usefulness
5. Visual aesthetics

Jangan mengorbankan keterbacaan hanya demi tampilan visual.

---

# 2. EXISTING VISUAL BASELINE

Visual baseline aplikasi saat ini:

- Navy primary KPI card
- Blue / indigo PM04 card
- Orange PM02+ card
- White content panels
- Subtle gray border
- Compact tables
- Horizontal progress bars
- Small status indicators
- Restrained chart colors
- Clear operational labels

Perubahan visual di masa depan harus memperhalus visual identity ini,
bukan menggantinya dengan design system yang sama sekali berbeda.

---

# 3. TYPOGRAPHY

## Primary Font

Gunakan:

Plus Jakarta Sans

Fallback:

Plus Jakarta Sans, sans-serif

Gunakan satu keluarga font secara konsisten di seluruh aplikasi.

Jangan menggunakan font berbeda pada setiap menu.

---

## 3.1 Typography Hierarchy

### Page Title

- Font: Plus Jakarta Sans
- Size: 22–28px
- Weight: 700

### Section Title

- Font: Plus Jakarta Sans
- Size: 16–18px
- Weight: 600

### Chart Title

- Font: Plus Jakarta Sans
- Size: 14–16px
- Weight: 600

### Subtitle / Description

- Font: Plus Jakarta Sans
- Size: 12–13px
- Weight: 400–500

### Body

- Font: Plus Jakarta Sans
- Size: 13–14px
- Weight: 400–500

### Table Header

- Font: Plus Jakarta Sans
- Size: 11–12px
- Weight: 600

### Table Body

- Font: Plus Jakarta Sans
- Size: 12–13px
- Weight: 400–500

### KPI Number

- Font: Plus Jakarta Sans
- Weight: 700

---

# 4. COLOR SYSTEM

## 4.1 General UI Colors

| Purpose | Color |
|---|---|
| Primary Navy | `#193B8F` |
| Primary Blue / Indigo | `#3047D8` |
| Orange | `#FF7410` |
| Green | `#168477` |
| Red | `#D92D20` |
| Amber | `#F2B705` |
| White | `#FFFFFF` |
| Light Background | `#F8FAFC` |
| Border | `#E5E7EB` |
| Dark Text | `#172033` |
| Muted Text | `#64748B` |

---

# 5. CHART COLOR SYSTEM

Chart colors harus menggunakan semantic color mapping yang konsisten.

JANGAN membuat warna chart secara random.

---

## 5.1 Work Order Status Colors

| Status | Meaning | Hex |
|---|---|---|
| CNF TECO | Confirmed / Technically Completed | `#193B8F` |
| CNF REL | Confirmed / Released | `#FF7410` |
| REL | Released | `#263238` |
| CRTD | Created | `#168477` |
| TECO | Technically Completed | `#F2B705` |

Warna harus konsisten pada:

- Bar chart
- Column chart
- Legend
- Status badge
- Table
- KPI
- Tooltip

Satu warna tidak boleh memiliki arti berbeda di halaman lain.

---

# 5.2 PM Type Colors

| PM Type | Name | Hex |
|---|---|---|
| PM01 | Breakdown Maintenance | `#D92D20` |
| PM02 | Corrective Maintenance | `#FF7410` |
| PM03 | Preventive Maintenance | `#168477` |
| PM04 | Predictive Maintenance | `#3047D8` |
| PM05 | Improvement/Modification | `#8B3FC7` |
| PM06 | Refurbishment Order | `#008C95` |
| PM07 | Calibration Order | `#1597C8` |
| PM08 | Standing Order | `#64748B` |
| PM09 | Turn Around Order | `#F2B705` |
| PM10 | General Maintenance | `#374151` |

---

# 6. MODULE ACCENT COLORS

Module accent berbeda dengan semantic status color.

| Module | Accent |
|---|---|
| Overview | Purple |
| Monitoring | Blue |
| Work Order | Orange |
| Man Power | Green |

Module accent hanya digunakan sebagai aksen.

Jangan mewarnai seluruh halaman berdasarkan warna module.

---

# 7. CHART DESIGN

Chart harus mengikuti visual language aplikasi.

## Distribusi Status WO

Gunakan:

- CNF TECO → Deep Navy
- CNF REL → Orange
- REL → Dark Charcoal
- CRTD → Teal
- TECO → Amber

## Distribusi Tipe Order

Gunakan:

- PM04 → Blue / Indigo
- PM02 → Orange
- PM03 → Green
- PM09 → Amber
- PM01 → Red
- PM05 → Purple

Jangan menentukan warna berdasarkan posisi series.

---

# 8. CHART TITLES

Gunakan:

- Plus Jakarta Sans
- 14–16px
- Weight 600

Judul harus singkat dan operational.

### Preferred

- Distribusi Status WO
- Distribusi Tipe Order
- Progress PM04
- Progress PM02+
- WO berdasarkan Work Center
- Completion Trend

### Avoid

- Analytics
- Performance
- Insights
- Overview
- Data Analysis
- Smart Analytics

kecuali istilah tersebut memang memiliki makna bisnis khusus.

---

# 9. CHART CONTAINER

Gunakan:

- Background: `#FFFFFF`
- Border: `1px solid #E5E7EB`
- Border Radius: `10–12px`
- Shadow: none atau sangat subtle
- Padding: `16–20px`

Chart harus terasa sebagai bagian dari sistem UI yang sama
dengan KPI card, table, filter, dan detail panel.

---

# 10. CHART LEGEND

Legend harus:

- Compact
- Easy to scan
- Consistent
- Dekat dengan chart
- Logical ordering

Jangan menggunakan icon legend yang terlalu besar.

Warna legend harus sama dengan series chart.

---

# 11. PROGRESS BAR

Gunakan semantic meaning:

| Kondisi | Warna |
|---|---|
| 100% / Completed | Green |
| Normal Progress | Primary Blue |
| Attention / Low Completion | Orange |
| Critical / Overdue | Red |

Hindari gradient yang tidak diperlukan.

---

# 12. KPI CARD

Hierarchy:

1. Icon / Label
2. Main KPI Number
3. Unit
4. Comparison / Trend
5. Optional Sparkline

KPI number harus tetap menjadi elemen paling dominan.

---

# 13. KPI SPARKLINE

Sparkline harus subtle.

Tujuannya memberikan context,
bukan menjadi dekorasi.

---

# 14. TABLE

Table harus compact dan readable.

### Header

- Font size: 11–12px
- Weight: 600

### Body

- Font size: 12–13px
- Weight: 400–500

### Row Height

- 40–48px

Jangan membuat row terlalu tinggi tanpa kebutuhan.

---

# 15. STATUS BADGES

Status badge harus:

- Compact
- Semantic
- Readable
- Tidak berlebihan menggunakan pill shape

Gunakan semantic color dari dokumen ini.

---

# 16. BORDER RADIUS

| Component | Radius |
|---|---|
| Card | 10–12px |
| Button | 8px |
| Input | 8px |
| Badge | 6–8px |

Gunakan radius secara konsisten.

---

# 17. SHADOW

Gunakan:

- No shadow
- atau very subtle shadow

Hindari:

- Strong floating shadow
- Neon glow
- Glassmorphism berlebihan
- Excessive elevation

Dashboard harus terasa seperti professional industrial application.

---

# 18. SPACING

Gunakan spacing scale:

- 4px
- 8px
- 12px
- 16px
- 20px
- 24px
- 32px

Hindari arbitrary spacing jika tidak diperlukan.

---

# 19. AI / DEVELOPER RULE

Saat membuat component baru:

1. Cek component yang sudah ada.
2. Reuse style yang sudah ada.
3. Cek color system.
4. Cek typography.
5. Cek spacing.
6. Cek border radius.
7. Cek chart style.
8. Jangan membuat visual pattern baru tanpa alasan.

Jangan membuat setiap halaman terlihat seperti aplikasi berbeda.

---

# 20. NO RANDOM COLORS

Jangan menentukan warna secara random untuk:

- PM Type
- Work Order Status
- Notification Status
- Work Center
- Factory
- Area

Jika kategori sudah memiliki warna,
wajib menggunakan warna yang telah ditetapkan.

Jika belum ada mapping:
gunakan neutral color sampai mapping ditetapkan secara resmi.

---

# 21. NO GENERIC AI DASHBOARD

Hindari:

- Gradient background berlebihan
- Glassmorphism berlebihan
- Giant rounded cards
- Excessive decorative icons
- Strong shadows
- Random gradients
- Terlalu banyak warna
- Typography terlalu besar
- Empty whitespace berlebihan
- Generic "AI analytics" visual

Dashboard harus memprioritaskan informasi operasional.

---

# 22. RESPONSIVENESS

Interface harus usable pada:

- Desktop
- Laptop
- Tablet

Desktop merupakan primary environment.

Jangan mengurangi information density secara berlebihan pada desktop.

---

# 23. SOURCE OF TRUTH

Dokumen ini mengatur visual/UI.

Business meaning mengikuti:

- `KAMUS_SAP.md`
- `BUSINESS_RULES.md`
- `DATA_DICTIONARY.md`
- `DASHBOARD_SPEC.md`

Jangan memasukkan business calculation ke dalam
`DESIGN_SYSTEM.md`.

---

# 24. HALAMAN LOGIN

## 24.1 Layout

- Split 2-panel: **55% Kiri (Branding Dark)** + **45% Kanan (Form Putih)**
- Kiri: dark background `#050D1F`, gradient + glowing orbs + grid lines overlay
- Kanan: background putih `#FFFFFF` dengan accent line gradient di bagian atas

## 24.2 Left Panel — Dark Branding
- Background: `linear-gradient(from #0A1A4A → #071228 → #050D1F)`
- Glow kiri atas: `#1A4BC4/20 blur-[90px]`
- Glow kanan bawah: `#D9650F/15 blur-[80px]`
- Grid overlay: `rgba(255,255,255,0.04)`, grid-size 60×60px
- Hero teks: **Plus Jakarta Sans**, font extrabold 5xl, warna putih
- Highlight kata: gradient `from-[#4A9EFF] to-[#A78BFA]`
- Feature pills: bg `white/5`, border `white/10`, icon biru, teks slate-300
- Dashboard mockup abstrak: bar chart mini dari data series prosentase dummy
- Status badge: dot emerald `animate-pulse`

## 24.3 Right Panel — Form
- Accent line atas: gradient `from-[#1A4BC4] via-[#4A9EFF] to-[#D9650F]`
- Badge heading: biru muda, `ShieldCheck` icon
- Label field: uppercase, `text-xs font-bold text-slate-700 tracking-wider`
- Input border saat idle: `border-slate-200`
- Input border saat fokus: `border-blue-500` + ring `rgba(59,130,246,0.15)`
- Tombol submit: gradient `from-[#0F2052] via-[#1A4BC4] to-[#2563EB]`, shimmer effect, `hover:-translate-y-0.5`
- Quick Access cards: Admin = navy gradient, VP = oranye gradient

## 24.4 Quick-Access Login Cards
- Admin: `from-[#0F2052] to-[#1A3580]`
- VP: `from-[#D9650F] to-[#E07820]`

---

# 25. HEADER — TOMBOL LOGIN (GUEST MODE)

Saat user belum login (public dashboard), tombol Login di header harus:

- Gradient: `linear-gradient(135deg, #0F2052 0%, #1A4BC4 100%)`
- Shape: `rounded-full`
- Hover: `-translate-y-0.5` + shadow lebih besar
- Efek: shimmer slide-through saat hover
- Indikator: dot emerald `animate-pulse` di sebelah kanan teks

---

# 26. PUBLIC DASHBOARD — KONSISTENSI VISUAL

Halaman Public Dashboard WAJIB selaras dengan Internal Dashboard dan Login:

## 26.1 Header / Navbar

- Menggunakan komponen Header yang sama (dari `components/layout/Header.jsx`)
- Tombol Login terlihat jelas, menggunakan desain dari Bagian 25

## 26.2 Tombol "Lihat Dashboard Publik" di Halaman Login

- Ditampilkan sebagai tombol **ghost/outlined** di bawah form login
- Label: `"Lihat Dashboard Publik tanpa login →"`
- Style: border `#1A4BC4`, teks biru, hover background biru transparan
- Navigasi ke: `/` (root / public dashboard)

## 26.3 Warna & Font Public Dashboard

- Font: **Plus Jakarta Sans** (sama dengan internal)
- Background halaman: `#F0F3F8` (sama dengan internal layout)
- Card background: `#FFFFFF`, border `#E2E8F0`
- Heading warna: `#172033` (industrial-text)
- Muted text: `#64748B`
- Semua chart mengikuti palette dari Bagian 5.1 dan 5.2
- Header KPI card: gunakan palet navy/biru/oranye yang sama dengan internal

## 26.4 Elemen yang HARUS Selaras

| Elemen | Internal Dashboard | Public Dashboard |
|---|---|---|
| Font | Plus Jakarta Sans | Plus Jakarta Sans |
| Bg halaman | `#F0F3F8` | `#F0F3F8` |
| Card bg | `#FFFFFF` | `#FFFFFF` |
| Card border | `#E2E8F0` | `#E2E8F0` |
| Navy accent | `#0F2052` / `#13254F` | `#0F2052` / `#13254F` |
| Orange accent | `#D9650F` | `#D9650F` |
| Header komponen | Sama | Sama |
| Chart palette | Bagian 5.1 & 5.2 | Bagian 5.1 & 5.2 |

---

# 27. NAVIGASI GUEST (BELUM LOGIN)

Pengguna yang belum login tetap bisa mengakses Public Dashboard tanpa autentikasi.

- Halaman login menampilkan tombol **"Lihat Dashboard tanpa login"** di bawah form
- Public Dashboard berjalan normal dengan data read-only
- Header tetap menampilkan tombol Login yang prominent (lihat Bagian 25)
- Tidak ada data internal / manpower / import yang diekspos ke guest

