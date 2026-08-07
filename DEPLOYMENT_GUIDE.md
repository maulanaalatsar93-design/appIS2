# Panduan Deployment Cloud (Vercel & Render)

Karena Anda telah memilih **Opsi A (Cloud Modern)**, kita akan meng-hosting *Frontend* di **Vercel** dan *Backend* di **Render**. Keuntungan utama dari setup ini adalah gratis (untuk tahap awal), sangat cepat, dan terhubung langsung ke GitHub (CI/CD Otomatis).

## 1. Persiapan Repositori (GitHub)
Langkah pertama sebelum deploy adalah menyimpan kode sumber Anda ke GitHub.
1. Buka [GitHub.com](https://github.com/) dan buat repositori baru (contoh: `istek2-app`).
2. Buka terminal proyek Anda (pastikan berada di *root* folder `d:\apIS2`).
3. Jalankan perintah berikut untuk nge-*push* ke GitHub:
   ```bash
   git remote add origin https://github.com/username-anda/istek2-app.git
   git branch -M main
   git push -u origin main
   ```

## 2. Deploy Backend ke Render
1. Buka [Render.com](https://render.com/) dan buat akun menggunakan GitHub Anda.
2. Di dashboard Render, klik **"New +"** dan pilih **"Web Service"**.
3. Hubungkan repositori GitHub Anda (`istek2-app`).
4. **Konfigurasi Web Service:**
   - **Root Directory:** `backend` *(sangat penting karena backend ada di dalam folder terpisah)*
   - **Environment:** `Node`
   - **Build Command:** `npm install && npx prisma generate`
   - **Start Command:** `npm start`
5. **Environment Variables:**
   - Masukkan *Environment Variables* (lihat isi file `.env` di folder backend Anda, khususnya `DATABASE_URL` dan `JWT_SECRET`).
6. Klik **"Create Web Service"**. Tunggu hingga statusnya berubah menjadi *Live*.
7. Simpan URL Backend Anda (misal: `https://istek2-backend.onrender.com`).

## 3. Deploy Frontend ke Vercel
1. Buka file `frontend/vercel.json` di proyek Anda.
2. Ganti teks `https://<GANTI_DENGAN_URL_RENDER_ANDA>/api/$1` dengan URL Render yang Anda dapatkan di Langkah 2.
3. Commit dan push perubahan file `vercel.json` tersebut ke GitHub:
   ```bash
   git add frontend/vercel.json
   git commit -m "fix: update production backend URL in vercel.json"
   git push
   ```
4. Buka [Vercel.com](https://vercel.com/) dan login dengan akun GitHub Anda.
5. Klik **"Add New Project"** dan pilih repositori `istek2-app`.
6. **Konfigurasi Project:**
   - **Framework Preset:** `Vite`
   - **Root Directory:** Edit dan pilih folder `frontend`
7. Klik **"Deploy"**. Vercel akan otomatis menjalankan `npm run build` dan mempublikasikan aplikasi Anda ke internet!

Setelah Vercel selesai, Anda akan mendapatkan URL web publik (contoh: `https://istek2.vercel.app`). Buka URL tersebut, dan selamat, Dashboard Internal Anda sudah live di internet! 🚀
