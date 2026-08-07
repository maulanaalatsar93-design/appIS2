# Changelog Aplikasi Inspeksi Teknik 2

Dokumen ini berisi riwayat perubahan fitur, perbaikan bug, dan penambahan komponen pada aplikasi.

## [Unreleased]
### UI/UX Improvements
- **Sidebar**: Memperbaiki masalah transisi antar menu di mana efek *outer putih* tertinggal saat pengguna berpindah menu. 
  - Penambahan \`border-transparent\` pada *state* tidak aktif untuk menghilangkan pergeseran *layout* dan kilatan warna tepi (*border flash*).
  - Penyesuaian durasi animasi menjadi \`300ms\` dan kurva animasi \`ease-out\` untuk pergerakan transisi yang lebih mulus pada latar belakang, ukuran, dan ikon.
  - File terdampak: \`frontend/src/components/layout/Sidebar.jsx\`.
