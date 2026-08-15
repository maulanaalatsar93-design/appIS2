# Design System — Dashboard Enterprise (PKT-Inspired Palette)

Dokumen ini adalah panduan desain (design system) berbasis palet warna Black, Oxford Blue, Orange, Platinum, White. Tujuannya agar seluruh routes/halaman pada dashboard punya tampilan yang konsisten, clean, dan terasa enterprise — bukan default AI-generated look.

---

## 1. Color Tokens

| Token | Hex | Peran |
|---|---|---|
| `--color-black` | `#000000` | Teks utama (heading berat), aksen gelap, ikon kontras tinggi |
| `--color-navy` (Oxford Blue) | `#14131D` | Warna utama brand (primary) — sidebar, header, tombol primary, elemen navigasi |
| `--color-orange` | `#FCA311` | Warna aksen (accent) — CTA penting, badge status, highlight data, angka kritikal |
| `--color-platinum` | `#E5E5E5` | Background section, border, divider, elemen non-aktif |
| `--color-white` | `#FFFFFF` | Background utama (card, page), teks di atas navy/orange |

### Implementasi sebagai CSS variables (Tailwind-ready)

```css
:root {
  --color-black: #000000;
  --color-navy: #14131D;
  --color-orange: #FCA311;
  --color-platinum: #E5E5E5;
  --color-white: #FFFFFF;

  /* Derivasi untuk kebutuhan UI (state, feedback) */
  --color-navy-soft: #1F1E2E;     /* hover state di atas navy */
  --color-orange-soft: #FFD98F;   /* background badge/alert ringan */
  --color-platinum-dark: #C9C9C9; /* border lebih tegas */
  --color-success: #2E7D32;
  --color-warning: #FCA311;       /* reuse accent untuk warning */
  --color-danger: #D32F2F;
  --color-info: #14131D;
}
```

### Tailwind config (opsional, jika pakai Tailwind CSS)

```js
// tailwind.config.js
theme: {
  extend: {
    colors: {
      navy: { DEFAULT: '#14131D', soft: '#1F1E2E' },
      accent: { DEFAULT: '#FCA311', soft: '#FFD98F' },
      platinum: { DEFAULT: '#E5E5E5', dark: '#C9C9C9' },
      ink: '#000000',
    },
  },
},
```

---

## 2. Prinsip Penggunaan Warna

1. **Navy = identitas, bukan dekorasi.** Dipakai konsisten di sidebar, top navbar, tombol primary, dan judul halaman/section penting. Jangan dipakai untuk background body — terlalu berat untuk halaman data-dense.
2. **Orange = perhatian, bukan hiasan.** Maksimal dipakai untuk: CTA utama, status "perlu tindakan" (overdue, pending approval), angka KPI penting, aksen chart. Jangan dipakai untuk teks panjang atau background luas — silau dan melelahkan mata untuk halaman yang dibuka berjam-jam (dashboard internal).
3. **Platinum & White = ruang bernapas.** Background utama page = white. Background card/section sekunder (misal filter panel, table header) = platinum. Ini yang membuat UI terasa "clean" dan tidak padat.
4. **Black hanya untuk teks berat**, bukan background besar (background besar pakai navy).
5. **Rasio penggunaan disarankan (per halaman):** ~60% white/platinum (ruang & struktur), ~30% navy (navigasi & heading), ~10% orange (aksen & CTA). Jangan biarkan orange mendominasi.

---

## 3. Layout & Struktur Halaman (berlaku di semua routes)

```
┌─────────────────────────────────────────────┐
│ Topbar (navy, h-16, logo + user menu)        │
├───────────┬─────────────────────────────────┤
│ Sidebar   │  Page Header                     │
│ (navy,    │  (judul halaman + breadcrumb,    │
│ w-64,     │   background white/platinum)     │
│ collapse  ├─────────────────────────────────┤
│ pada      │  Content Area (white bg)         │
│ mobile)   │  - Cards: white, border platinum,│
│           │    shadow tipis, radius 8-12px   │
│           │  - Table: header platinum,       │
│           │    row hover platinum/50%        │
│           │  - KPI angka penting: orange     │
└───────────┴─────────────────────────────────┘
```

- **Konsistensi wajib**: sidebar, topbar, dan struktur breadcrumb harus sama persis di semua routes (pakai shared layout component, bukan copy-paste per halaman).
- **Card**: `bg-white border border-platinum-dark rounded-xl shadow-sm p-6`
- **Spacing**: gunakan skala 4px (4, 8, 12, 16, 24, 32, 48) — jangan angka acak.

---

## 4. Tipografi

- **Font pairing (2 font, bukan 1)**: **Plus Jakarta Sans** untuk UI/heading/body, dan **IBM Plex Mono** khusus untuk data numerik (angka KPI, kode Work Order/Rekomendasi, tanggal, NPK). Pemisahan ini penting — mono font memberi kesan "presisi teknikal" yang cocok untuk dashboard inspeksi/engineering, dan membedakan "data" dari "label" secara visual tanpa perlu warna tambahan.
- **Skala**:
  | Elemen | Size | Weight | Warna |
  |---|---|---|---|
  | Page title (H1) | 24–28px | 600–700 | navy / black |
  | Section title (H2) | 18–20px | 600 | navy |
  | Card title (H3) | 15–16px | 600 | black |
  | Body text | 14px | 400 | black/80% |
  | Label/caption | 12px | 500 | platinum-dark/60% |
  | Angka KPI besar | 28–32px | 700 | orange (jika perlu perhatian) atau navy (netral) |

---

## 5. Komponen Kunci

- **Tombol Primary**: `bg-navy text-white hover:bg-navy-soft` — untuk aksi utama (Simpan, Submit).
- **Tombol Secondary**: `bg-white text-navy border border-platinum-dark hover:bg-platinum` — untuk aksi sekunder (Batal, Filter).
- **Tombol Accent/CTA khusus**: `bg-orange text-black hover:brightness-95` — dipakai terbatas, misal "Export Report", "Ajukan Approval".
- **Badge status**:
  - Hadir/Selesai/Approved → hijau (`--color-success`)
  - Pending/Menunggu → orange (`--color-orange`)
  - Overdue/Ditolak → merah (`--color-danger`)
  - Netral/Info → navy
- **Table**: header row `bg-platinum text-navy font-semibold text-xs uppercase`, body row `hover:bg-platinum/40`, border `border-platinum-dark`.
- **Chart (ApexCharts)**: palet chart = `[navy, orange, platinum-dark, success, danger]` — konsisten di semua chart across routes.
- **Sidebar active state**: item aktif → `bg-orange/10 text-orange border-l-4 border-orange` di atas background navy, agar tetap kontras dan jelas tanpa mendominasi.

---

## 6. Aksesibilitas & Kontras

- Orange (`#FCA311`) di atas putih **cukup kontras untuk elemen besar** (tombol, badge) tapi **hindari untuk teks kecil** — gunakan navy/black untuk teks kecil di atas orange (misal tombol accent pakai teks hitam, bukan putih).
- Navy di atas white/platinum: kontras sangat baik, aman untuk teks di semua ukuran.
- Selalu pastikan rasio kontras teks ≥ 4.5:1 (WCAG AA) untuk body text.

---

## 7. Logo & Branding

Logo (ikon siklus panah orange–biru dengan bentuk pulse/heartbeat di tengah) sangat cocok dengan palet ini — warna orange di logo selaras dengan `--color-orange`, dan biru di logo selaras secara konsep dengan `--color-navy` (meski secara hex logo memakai medium blue, bukan navy gelap; ini tetap harmonis karena orange tetap jadi titik kontras utama). Bentuk pulse di tengah cocok secara makna untuk konteks monitoring/PdM (predictive maintenance) — kesan "sistem yang hidup/terus dipantau".

### Penempatan yang elegan

1. **Topbar (utama, semua routes)** — logo di kiri atas, ukuran kecil (32–40px), didampingi nama aplikasi dalam teks navy di sebelahnya. Background topbar tetap navy solid; karena logo punya banyak warna & shading, beri sedikit ruang (padding 8–12px) dan background putih/platinum berbentuk lingkaran tipis di belakang logo agar tidak "tenggelam" di atas navy gelap.
   ```
   [●Logo]  Nama Dashboard          ...   [notif] [avatar]
   ```

2. **Login / Auth page** — logo jadi fokus utama, ukuran besar (96–120px), diletakkan di tengah atas card login, di atas background putih polos. Ini satu-satunya tempat logo boleh tampil besar & dominan.

3. **Sidebar (collapsed state)** — saat sidebar diciutkan jadi ikon saja, logo (versi disederhanakan/tanpa teks) bisa dipakai sebagai ikon "home"/brand mark di posisi paling atas, ukuran 28–32px, dengan padding cukup dari platinum/navy background.

4. **Favicon & tab browser** — crop logo jadi versi square disederhanakan (hilangkan detail kecil, sisakan bentuk pulse + lingkaran panah) agar tetap terbaca di ukuran 16–32px.

5. **Empty states / loading screen** — versi outline monokrom (navy atau platinum-dark) dari logo bisa dipakai sebagai watermark halus di tengah halaman kosong (misal "belum ada data"), dengan opacity rendah (10–15%) agar tidak mengganggu.

6. **Dokumen export (PDF/Excel report)** — logo full color di header dokumen, kiri atas, didampingi judul laporan — konsisten dengan identitas di web app.

### Yang sebaiknya dihindari

- Jangan taruh logo full-color di atas background orange — dua orange akan bertabrakan dan detail logo hilang.
- Jangan perkecil logo di bawah ~24px untuk versi full-detail (pulse line akan pecah/tidak terbaca) — gunakan versi simplified untuk ukuran sangat kecil (favicon, sidebar collapsed).
- Jangan taruh teks di atas logo langsung (misal overlay nama app di atas gambar logo) — sandingkan di samping, bukan menumpuk.

---

## 8. Referensi Implementasi Konkret (dari mockup `istek-ui-mockup.html`)

Section ini menerjemahkan mockup yang sudah dibuat menjadi spesifikasi pasti, supaya Antigravity membangun struktur yang sama persis, bukan versi tafsirannya sendiri. **Serahkan file mockup ini bersamaan dengan design-system.md** — mockup adalah acuan visual utama, dokumen ini acuan aturan/token saat membangun halaman baru yang belum ada di mockup.

- **Sidebar**: lebar tetap `240px`, background navy solid, padding `22px 16px`, gap antar section `26px`. Nav item aktif: `bg-orange/10`, `text-orange`, `border-left: 3px solid orange`, `font-weight:700`. Nav item non-aktif: `text-platinum-dark`, hover `bg-white/6`.
- **Topbar**: tinggi konten `~14px` padding vertikal, background **putih** (bukan navy) dengan `border-bottom: 1px solid platinum-dark`, sticky top. Isi: breadcrumb kiri, search box + bell + user chip kanan.
- **Login page**: layout split 2 kolom — panel kiri `44%` lebar, background navy solid dengan logo, headline, dan aksen garis waveform tipis (opacity rendah) di background; panel kanan sisanya, background putih, form login di-center secara vertikal & horizontal, max-width card `380px`.
- **KPI card**: padding `18px 18px 14px`, radius `14px`, border `1px solid platinum-dark`. Anatomi: label kecil uppercase (11px, text-dim) → angka besar mono (28px) → delta kecil (hijau/merah) → aksen garis pulse tipis (SVG polyline, opacity ~0.5) di pojok kanan bawah card sebagai signature motif yang echo dari bentuk logo.
- **Chart**: bar chart grouped (navy = Work Order, orange = Rekomendasi) per pabrik, tanpa gridline berlebihan, label sumbu pakai font mono. Donut chart pakai `stroke-dasharray` pada SVG circle, bukan library berat, untuk konsistensi visual dengan bar chart.
- **Table**: header `bg-platinum`, `text-navy`, `font-weight:700`, `uppercase`, `font-size:10.5px`; body row `padding:14px 20px`; status pakai pill/badge rounded-full dengan dot kecil di kiri teks.
- **Signature motif**: garis pulse/waveform tipis (terinspirasi bentuk logo) dipakai berulang di 3 tempat — background login, pojok KPI card, dan bisa dipakai juga sebagai divider halus antar section. Ini elemen pembeda utama dashboard ini dari template generic.

### Cara menyerahkan ke Antigravity

Berikan **kedua file sekaligus** dengan urutan prompt seperti ini (atau serupa):
> "Ikuti struktur visual di `istek-ui-mockup.html` ini persis (sidebar, topbar, KPI card, chart, table, login page). Gunakan token warna & aturan di `design-system.md` untuk halaman-halaman lain yang belum ada di mockup, supaya seluruh routes tetap konsisten dengan pola yang sama."

Tanpa mockup, Antigravity hanya punya aturan warna — hasilnya bisa tetap "on-brand" tapi struktur (lebar sidebar, rasio login split, anatomi card) kemungkinan besar akan berbeda dari yang sudah kita desain.

---

## 9. Checklist Implementasi ke Semua Routes

- [ ] Definisikan CSS variables/Tailwind config di satu tempat (global), jangan hardcode hex per komponen.
- [ ] Buat shared layout (`Sidebar`, `Topbar`, `PageHeader`) yang dipakai semua routes — jangan duplikasi.
- [ ] Buat komponen dasar reusable: `Button`, `Card`, `Badge`, `Table`, `KPIStat` sesuai token di atas.
- [ ] Terapkan skala tipografi yang sama di semua halaman (jangan atur font size manual per halaman).
- [ ] Review tiap halaman baru: apakah rasio warna masih ~60/30/10 (white-platinum/navy/orange)? Jika orange terasa "ramai", kurangi.
- [ ] Konsisten radius (`rounded-xl` untuk card, `rounded-md` untuk button/input) dan shadow (`shadow-sm`) di seluruh app.
- [ ] Siapkan 3 versi logo: full-color (topbar, login, dokumen), simplified/monokrom (sidebar collapsed, watermark), dan favicon square.
- [ ] Pastikan logo tidak pernah diletakkan langsung di atas background orange.

---

*Palet warna: Black `#000000`, Oxford Blue `#14131D`, Orange `#FCA311`, Platinum `#E5E5E5`, White `#FFFFFF` — terinspirasi warna korporat perusahaan.*