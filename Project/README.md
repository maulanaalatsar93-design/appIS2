# Inspeksi Teknik 2 (ISTEK 2) - Fullstack Architecture

Proyek ini dibangun dari awal (Greenfield) menggunakan arsitektur **Frontend** (React/Vite) dan **Backend** (Node.js/Express REST API) dengan **PostgreSQL Database** (Prisma ORM).

## Struktur Proyek

- **`frontend/`**: Berisi seluruh source code antarmuka pengguna (React, Vite, Tailwind CSS, shadcn/ui, ApexCharts). Hanya bertugas memanggil API dan merender komponen UI.
- **`backend/`**: Berisi server Express.js yang menyediakan REST API, mengatur koneksi ke database PostgreSQL via Prisma ORM, dan menyimpan _business logic_ utama.

---

## Prasyarat (Prerequisites)

- **Node.js** (v18 atau lebih baru)
- **PostgreSQL Server** (lokal, Supabase, Render, Aiven, atau PostgreSQL service bawaan OS)

---

## 1. Konfigurasi Database PostgreSQL & Prisma

1. Pastikan layanan PostgreSQL Anda sudah berjalan.
2. Konfigurasi string koneksi database di `backend/.env`:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/istek_db?schema=public"
   ```
3. Jalankan migrasi Prisma dan seed data awal:

```bash
cd backend
npm install
npx prisma migrate dev --name init
npx prisma db seed
```

---

## 2. Cara Menjalankan Backend

Buka terminal baru dan jalankan perintah:

```bash
cd backend
npm run dev
```

Server backend akan berjalan di **http://localhost:5000**.

---

## 3. Cara Menjalankan Frontend

Buka terminal baru lainnya dan jalankan perintah:

```bash
cd frontend
npm install
npm run dev
```

Aplikasi frontend akan berjalan di **http://localhost:5173**.

---

## API Documentation (Endpoints Utama)

Semua _request_ dilakukan ke _base URL_: `http://localhost:5000/api`

### ManPower / Employees
- `GET /employees` - Mengambil seluruh data personil/karyawan.
- `GET /employees/:id` - Mengambil data karyawan spesifik.

### Work Orders (SAP)
- `GET /workorders` - Mengambil seluruh Work Order dari database.
- `POST /workorders/import` - Mengunggah file CSV berisi Work Order asli dari SAP (parameter `form-data` key `file`).

### Recommendations (SAP Notifications)
- `GET /recommendations` - Mengambil seluruh rekomendasi/Notifikasi dari database.
- `POST /recommendations/import` - Mengunggah file CSV berisi Rekomendasi asli dari SAP (parameter `form-data` key `file`).

---

## UI/UX & Data Input Guidelines (Enterprise Standard)

- **Styling UI/UX (Enterprise App):** Antarmuka selaras dengan standar _Enterprise App_ (bersih, padat data, profesional).
  - Gunakan font **Plus Jakarta Sans** untuk seluruh teks.
  - Visualisasi data **wajib** menggunakan **ApexCharts**.
- **Logika Input SAP:** Dilarang keras membuat form input manual untuk data SAP Work Order & Rekomendasi. Penginputan data SAP murni menggunakan **Import File CSV**.

---
_ISTEK 2 - Greenfield Architecture Documented._
