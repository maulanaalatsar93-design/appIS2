# Panduan Deployment Vercel (Backend & Frontend)

Panduan ini menjelaskan cara mempublikasikan **Backend (Express API)** dan **Frontend (React + Vite)** ke **Vercel** secara 100% Gratis, tanpa kartu kredit, dengan latensi sangat rendah (Server Region Singapore).

---

## 1. Simpan Perubahan ke GitHub

Buka terminal di komputer Anda (`d:\appIS2`) dan jalankan perintah berikut:

```bash
git add .
git commit -m "feat: persiapkan konfigurasi deployment backend & frontend di Vercel"
git push origin main
```

---

## 2. Deploy BAGIAN 1: Backend ke Vercel

1. Buka [Vercel.com](https://vercel.com/) dan Login dengan akun GitHub Anda.
2. Di Dashboard Vercel, klik tombol **"Add New..."** ➡️ pilih **"Project"**.
3. Cari repositori GitHub Anda (`istek2-app`) lalu klik **"Import"**.
4. **Konfigurasi Project Backend:**
   - **Project Name:** `istek2-backend`
   - **Framework Preset:** Pilih **Other**
   - **Root Directory:** Klik Edit, lalu pilih folder **`backend`**
   - **Environment Variables:** Masukkan 2 variabel berikut:
     - `DATABASE_URL` = `postgresql://postgres.wthtnimlkdhnvkhnyssl:719394Malang@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres?pgbouncer=true&connection_limit=15&pool_timeout=0`
     - `JWT_SECRET` = `istek2_super_secret_key_2026`
5. Klik **"Deploy"**. 
6. Setelah selesai (~30 detik), Vercel akan memberikan URL Backend Anda (contoh: `https://istek2-backend.vercel.app`). **Salin URL ini!**

---

## 3. Hubungkan Frontend ke Backend Vercel

1. Buka file `frontend/vercel.json` di VS Code / editor Anda.
2. Ganti nilai `destination` dengan URL Backend Vercel Anda tadi:
   ```json
   {
     "rewrites": [
       {
         "source": "/api/(.*)",
         "destination": "https://istek2-backend.vercel.app/api/$1"
       },
       {
         "source": "/(.*)",
         "destination": "/index.html"
       }
     ]
   }
   ```
3. Commit dan push perubahan ini ke GitHub:
   ```bash
   git add frontend/vercel.json
   git commit -m "fix: update backend production URL to Vercel"
   git push origin main
   ```

---

## 4. Deploy BAGIAN 2: Frontend ke Vercel

1. Kembali ke Dashboard [Vercel.com](https://vercel.com/).
2. Klik tombol **"Add New..."** ➡️ pilih **"Project"**.
3. Import repositori yang sama (`istek2-app`).
4. **Konfigurasi Project Frontend:**
   - **Project Name:** `istek2-frontend` (atau `istek2-app`)
   - **Framework Preset:** Pilih **Vite**
   - **Root Directory:** Klik Edit, lalu pilih folder **`frontend`**
5. Klik **"Deploy"**!

---

🎉 **Selamat!** Aplikasi Anda kini sudah 100% Live di Internet!
- **Frontend URL:** `https://istek2-frontend.vercel.app`
- **Backend URL:** `https://istek2-backend.vercel.app`
