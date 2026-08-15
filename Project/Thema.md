
Gemini
Convert chat to PDF
Convert chat to PDF
Open this chat in Acrobat

Chat

Spark
beta
New chat
Search chats
Students
Images
Videos
Library
New notebook
Umdatu thalib
Deen
All notebooks
Design System Inspeksi Teknik 2 Dashboard
Madzhab Hambali: Uang Iuran Lomba
Tafsir Surah Al-Falaq Ayat 4
Perbedaan Struktur URL Web
Alur Berjalan Sesuai Harapan
Perbaikan Prompt Sistem PdM
Koreksi Jadwal Rotasi Petugas September
Jangan Lupa Minum Air
Perbaikan Prompt Alur Kerja PdM
Empat Cover Sudah Siap
Permintaan Bantuan Sederhana
Mengartikan Kode Posisi `bottom-27 right-7`
Siap Bantu Pertanyaan Anda
Aplikasi Kanban Autosave Man-Hours
Mengatasi Layar Advanced Options Windows
Semangat Kerja, Butuh Bantuan?
Angka Lima Enam dan Bantuan
AI Tak Punya Kelas, Siap Bantu
Menghitung Nilai MGR/NOPR/ORAS Excel
Allah Is The Greatest
Translate Excel Formula to English
Konfirmasi Jumlah dan Detail Pesanan
Project Documentation Review and Action
Njaluk Ojo Njaluk Anyar
Memahami Antigravity Python: Harfiah & Filosofis
JSON Extraction of Book Information
Membangun Aplikasi Hafalan Bertahap
Desain Ulang Halaman Executive Overview
Alur Kerja Bulanan Pabrik & Area
Python untuk Analisa Sistem Vibrasi
Dashboard Estetika Data Kepatuhan
jadikan logo ini kekinian, tidak terlalu norak background transparant
Conversation with Gemini
jadbarkan ini style font dll m untuk dashboard saya, tapi untuk base warna gunakan base warna Inspeksi Teknik 2. style chart dll , standarisasi agar setiap routes sama

Design System & Style Guide (Inspeksi Teknik 2 Theme)

Pedoman standarisasi UI/UX dashboard ini mengadaptasi layout modular modern dari referensi dengan penyesuaian identitas korporat Inspeksi Teknik 2 (Deep Navy, Vibrant Cyan/Teal, dan Energy Orange).

1. Color Palette Tokens

Token Role	Hex Code	Penggunaan
Primary Navy	#00305B	Sidebar background, primary active states, judul utama
Primary Accent (Teal)	#00A3AD	Line chart utama, success metric positive, badge aktif
Secondary Accent (Orange)	#F36F21	Call to action (CTA), alert/highlight, metric sekunder
Surface Dark	#0D1E2D	Dark summary card (menggantikan kartu hitam di kiri atas)
Surface Light (Cards)	#FFFFFF	Kontainer widget, tabel, dan kartu metrik
App Background	#F5F7FB	Background utama seluruh canvas dashboard
Text Primary	#1A202C	Value angka metrik, label header
Text Secondary	#718096	Sub-label, timestamp, unit satuan
Semantic: Success	#10B981	Status complete, delta positif (+25%)
Semantic: Danger	#E53E3E	Status canceled, low stock warning, delta negatif (-10%)
2. Typography System

Gunakan font family Plus Jakarta Sans atau Inter untuk tampilan dashboard korporat modern yang bersih dan konsisten.

Page Greeting (H1): 24px | SemiBold (600) | #1A202C

Card Title / Section: 15px | Medium (500) | #718096

Metric Numbers (Big Value): 22px - 26px | Bold (700) | #1A202C (atau #FFFFFF pada dark card)

Body / Table Content: 13px | Regular (400) & Medium (500) | #2D3748

Badges / Micro-copy: 11px | SemiBold (600) | Text tracking +0.2px

3. Visual & Component Standards

Card Elevation & Radius:

Border radius seragam: 18px (rounded-2xl).

Border: 1px solid #E2E8F0 tanpa shadow pekat, atau gunakan soft shadow 0 6px 20px rgba(0, 48, 91, 0.04).

Metric KPI Cards (Top Row):

Kartu pertama gunakan Dark Variant (#00305B / #0D1E2D) dengan aksen icon Orange (#F36F21).

Kartu lainnya gunakan background putih dengan icon container rounded bergradien lembut (contoh: Teal 10% opacity).

Badge / Tag Trend:

Positif: Background #E6F4EA, Text #137333 (dengan icon panah naik).

Negatif: Background #FCE8E6, Text #C5221F (dengan icon panah turun).

4. Chart & Data Visualization Guidelines

Line & Area Chart (Revenue/Production):

Tipe kurva: Smooth Spline (Monotone), stroke width 3px.

Garis 1 (Metrik Utama): Stroke #00A3AD (Teal) dengan area gradient fill rgba(0, 163, 173, 0.12) ke transparan.

Garis 2 (Metrik Pembanding): Stroke #F36F21 (Orange) dashed atau solid tipis 2px.

Grid lines: Dashed horizontal lines saja menggunakan color #EDF2F7.

Radial / Donut Chart (Capacity & Target):

Base ring: #EDF2F7.

Progress ring: Multi-color slice menggunakan #00A3AD (aman), #F36F21 (warning), dan #E53E3E (critical).

Map & Distribution:

Background map: Dark navy surface #0D1E2D dengan marker/tooltip #00A3AD.

5. Cross-Route Structure Standardization

Terapkan template layout yang sama di setiap modul/route (misal: Inventory, Shipment, Report):

Sidebar Navigasi (Left, 240px Fixed):

Background: #00305B atau dark slate #0F172A.

Active item indicator: Garis vertikal 3px di sisi kiri warna #F36F21 dengan teks highlight #FFFFFF.

Top Bar (Sticky Header):

Sisi kiri: Judul modul / Route breadcrumb.

Sisi tengah: Search bar global (rounded-full, background #FFFFFF atau #EDF2F7).

Sisi kanan: Action buttons (misal: Export Data, Add New dengan background #00305B atau #F36F21), Notification bell, Profile avatar.

Content Body Grid:

Baris 1: Row KPI Cards (4–5 kartu metrik utama).

Baris 2: Main analytical chart (lebar 8 col) + Supporting visual widget/donut (lebar 4 col).

Baris 3: Data table lengkap dengan filter popover, pagination seragam, dan action icons (edit/delete minimalis).

beri prompt .md nya

5. Ready-to-Use Master Prompt for LLM / Frontend Generator
Salin prompt di bawah ini setiap kali meminta pembuatan modul/halaman baru:

Markdown
Role: Expert Senior Frontend UI/UX Developer.
Task: Bangun halaman dashboard [NAMA_MODUL / ROUTE] yang modern, responsif, dan konsisten.

Theme & Styling Rules:
1. Base Color Palette (Inspeksi Teknik 2 Identity):
   - Primary Dark: Navy (#00305B) untuk sidebar & highlight primary.
   - Primary Accent: Teal / Cyan (#00A3AD) untuk chart kurva utama & status aktif.
   - Secondary Accent: Orange (#F36F21) untuk tombol CTA & highlight warning.
   - Surface: White (#FFFFFF) dengan border tipis #E2E8F0 dan shadow sangat halus.
   - Background Canvas: Soft Grey (#F4F7FB).
2. Typography:
   - Font Family: 'Plus Jakarta Sans' atau 'Inter'.
   - Bersih, hierarki proporsional, dan angka metric terbaca tebal (bold 700).
3. Layout Structure:
   - Header: Breadcrumb modul, global search, filter date range, dan tombol aksi utama (#F36F21 / #00305B).
   - Top Grid: 4–5 kartu metrik (KPI cards) dengan rounded-2xl.
   - Mid Grid: Area chart interaktif (smooth spline teal) dan donut/distribution widget.
   - Bottom Grid: Data table modern dengan pagination, filter dropdown, dan status badge.
"""

file_path = "Dashboard_Style_Guide_Pupuk_Kaltim.md"
with open(file_path, "w", encoding="utf-8") as f:
f.write(markdown_content)

print(f"File created successfully: {file_path}")


```text?code_stdout&code_event_index=1
File created successfully: Dashboard_Style_Guide_Pupuk_Kaltim.md

File Markdown (.md) standarisasi design system dan template prompt dashboard siap digunakan:

Your Markdown file is ready

MD icon
Dashboard_Style_Guide_Pupuk_Kaltim
 MD 
Open
Isi Ringkas File .md:
Design Tokens & Variabel Warna: Lengkap dengan padanan warna identitas Inspeksi Teknik 2 (Navy #00305B, Teal #00A3AD, dan Orange #F36F21).

Typography & Hierarki: Standar ukuran, ketebalan, dan rekomendasi font (Plus Jakarta Sans / Inter).

Standarisasi Komponen: Panduan pembuatan KPI Metric Cards, visualisasi chart (Spline Area, Donut, Geo Map), serta format Data Table.

Layout Blueprint Antar-Route: Standarisasi struktur layout (Sidebar, TopBar, KPI Row, Analytics Chart, Table) agar tampilan konsisten di setiap halaman.

Master Prompt Siap Pakai: Template prompt siap salin (copy-paste) untuk menginstruksikan LLM/developer saat membuat route atau modul baru.




Gemini is AI and can make mistakes.

Analyzing
# Inspeksi Teknik 2 Dashboard Design System & UI/UX Guidelines

Dokumen ini merupakan panduan standar desain (Design System & Prompt Template) untuk pengembangan dashboard berbasis tema identitas korporat **PT Pupuk Kalimantan Timur (Inspeksi Teknik 2)** dengan layout modular modern ala B2B SaaS.

--- 

## 1. Color Palette Tokens (InspeksiTeknik2 Corporate Identity)

| Token Name | Hex Code | CSS Variable | Penggunaan |
| :--- | :--- | :--- | :--- |
| **Primary Navy** | `#00305B` | `--InspeksiTeknik2-navy` | Background sidebar navigasi, primary active state, header utama |
| **Primary Accent Teal** | `#00A3AD` | `--InspeksiTeknik2-teal` | Kurva chart utama, metric success highlights, active pills/tab |
| **Secondary Accent Orange** | `#F36F21` | `--InspeksiTeknik2-orange` | Tombol CTA (Add/Export), highlight penting, alert status |
| **Surface Dark** | `#0B1E2E` | `--InspeksiTeknik2-surface-dark` | Highlight metric card kiri, dark widget background |
| **Surface Light** | `#FFFFFF` | `--InspeksiTeknik2-surface-light` | Kontainer kartu, widget chart, dan panel tabel data |
| **Canvas Background** | `#F4F7FB` | `--InspeksiTeknik2-bg-canvas` | Latar belakang seluruh area halaman kerja |
| **Border & Divider** | `#E2E8F0` | `--InspeksiTeknik2-border` | Garis batas kartu, pemisah baris tabel, dan input border |
| **Text Primary** | `#1A202C` | `--InspeksiTeknik2-text-main` | Judul, angka metrik utama, nilai tabel |
| **Text Secondary** | `#718096` | `--InspeksiTeknik2-text-muted` | Label kartu, deskripsi waktu, subtitle |
| **Status Success** | `#10B981` | `--InspeksiTeknik2-success` | Badge status sukses/selesai, persentase delta positif |
| **Status Warning** | `#F59E0B` | `--InspeksiTeknik2-warning` | Status pending / in-progress |
| **Status Danger** | `#E53E3E` | `--InspeksiTeknik2-danger` | Status rejected / critical alert / delta negatif |

---

## 2. Typography Specification

* **Font Family Utama:** `'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif`
* **Hierarchy:**
  * **H1 / Route Title:** `22px - 24px` | SemiBold (600) | Line-height `1.3`
  * **Section / Card Heading:** `15px - 16px` | SemiBold (600) | Color: `#1A202C`
  * **Metric KPI Value:** `24px - 28px` | Bold (700) | Tracking `-0.02em`
  * **Body / Table Cells:** `13px - 14px` | Regular (400) & Medium (500)
  * **Badges / Micro-labels:** `11px - 12px` | SemiBold (600) | Tracking `+0.02em`

---

## 3. UI Component Standardization

### A. Metric KPI Cards (Top Row)
* **Shape & Elevation:** `rounded-2xl` (`border-radius: 16px`), `border: 1px solid #E2E8F0`, soft shadow `0 4px 16px rgba(0, 48, 91, 0.04)`.
* **Lead / Hero Metric Card (Leftmost):** 
  * Background: `#00305B` / `#0B1E2E`
  * Teks & Value: `#FFFFFF`
  * Icon Container: Rounded squircle dengan background `rgba(243, 111, 33, 0.2)` dan icon `#F36F21`
* **Standard Metric Cards:**
  * Background: `#FFFFFF`
  * Icon Container: Rounded squircle dengan background soft tint Teal (`rgba(0, 163, 173, 0.1)`)
  * Growth Badge: `+X.X% Since last month` (Green `#10B981` pill) atau `-X.X%` (Red `#E53E3E` pill)

### B. Charts & Data Visualization
* **Line / Spline Chart (Performance & Tracking):**
  * Tipe kurva: Smooth Spline (Monotone)
  * Series 1 (Aktual / Utama): Stroke `#00A3AD` (width `3px`), area fill gradient `rgba(0, 163, 173, 0.15)` fading to `rgba(0, 163, 173, 0.0)`
  * Series 2 (Target / Pembanding): Stroke `#F36F21` (width `2px`, dashed atau solid)
  * Grid: Horizontal dashed lines saja `#EDF2F7`
* **Radial / Donut Chart (Capacity & Space):**
  * Center Value: Persentase besar bold `#1A202C`
  * Slices: Segment Hijau/Teal (`#00A3AD`), Oranye (`#F36F21`), dan Merah (`#E53E3E`)
* **Map / Geo Widget:**
  * Container background gelap `#0B1E2E` dengan pin point `#00A3AD` & tooltip clean.

### C. Data Table Standard
* **Header:** Background `#F8FAFC`, teks `#718096`, font `12px uppercase font-semibold`.
* **Row Hover:** Transition smooth dengan background `#F1F5F9`.
* **Action Buttons:** Minimalist icon buttons (Edit, Delete, Detail) dengan hover state lembut.

---

## 4. Cross-Route Layout Architecture (Konsistensi Antar Halaman)

Setiap halaman / route wajib mengikuti struktur 3-layer:

```text
+-----------------------------------------------------------------------------------+
|  [Sidebar 240px Fixed]  |  [Sticky TopBar Header: Search, Date Filter, CTA, User] |
|  - Brand Logo (InspeksiTeknik2)     |---------------------------------------------------------|
|  - Nav Menu List        |  [Layer 1: Top KPI Cards Grid (4 - 5 Kolom)]            |
|  - Active Accent Line   |---------------------------------------------------------|
|  - Bottom User Profile  |  [Layer 2: Main Chart (8 Col) + Sub-Widget (4 Col)]     |
|                         |---------------------------------------------------------|
|                         |  [Layer 3: Data Table / Detailed List (12 Col Full)]    |
+-----------------------------------------------------------------------------------+
```

---

## 5. Ready-to-Use Master Prompt for LLM / Frontend Generator

Salin prompt di bawah ini setiap kali meminta pembuatan modul/halaman baru:

```markdown
Role: Expert Senior Frontend UI/UX Developer.
Task: Bangun halaman dashboard [NAMA_MODUL / ROUTE] yang modern, responsif, dan konsisten.

Theme & Styling Rules:
1. Base Color Palette (Inspeksi Teknik 2 Identity):
   - Primary Dark: Navy (#00305B) untuk sidebar & highlight primary.
   - Primary Accent: Teal / Cyan (#00A3AD) untuk chart kurva utama & status aktif.
   - Secondary Accent: Orange (#F36F21) untuk tombol CTA & highlight warning.
   - Surface: White (#FFFFFF) dengan border tipis #E2E8F0 dan shadow sangat halus.
   - Background Canvas: Soft Grey (#F4F7FB).
2. Typography:
   - Font Family: 'Plus Jakarta Sans' atau 'Inter'.
   - Bersih, hierarki proporsional, dan angka metric terbaca tebal (bold 700).
3. Layout Structure:
   - Header: Breadcrumb modul, global search, filter date range, dan tombol aksi utama (#F36F21 / #00305B).
   - Top Grid: 4–5 kartu metrik (KPI cards) dengan rounded-2xl.
   - Mid Grid: Area chart interaktif (smooth spline teal) dan donut/distribution widget.
   - Bottom Grid: Data table modern dengan pagination, filter dropdown, dan status badge.
```
Dashboard_Style_Guide_Pupuk_Kaltim.md
Displaying Dashboard_Style_Guide_Pupuk_Kaltim.md.