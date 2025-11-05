# 🏠 StayFinder - Property Renting Webb App

![React](https://img.shields.io/badge/React-18.2.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-strict)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC)
![Vite](https://img.shields.io/badge/Vite-Build-646CFF)

<div align="center">
  <img src="https://drive.google.com/uc?export=view&id=1bxNI2b3K-FOZPH3nT0NkwwC5VeH4U8Bj" alt="StayFinder App Screenshot" width="700" style="border-radius: 10px; border: 1px solid #eaeaea;" />
</div>

---

## 🌟 Tentang Proyek

**StayFinder** adalah aplikasi web modern dan responsif untuk penyewaan properti. Dibangun dengan **React** dan **TypeScript**, proyek ini bertujuan untuk menyediakan *platform* yang intuitif bagi pengguna untuk menjelajahi, mencari, dan melihat detail berbagai jenis properti (rumah, apartemen, kamar).

---

## ✨ Fitur Utama

* **🏡 Listing Properti:** Tampilkan daftar properti yang tersedia dengan detail visual.
* **🔍 Pencarian Lanjutan:** Filter dan cari properti berdasarkan lokasi, harga, jenis, dan fasilitas.
* **📱 Fully Responsive:** Dioptimalkan untuk pengalaman mulus di semua ukuran perangkat (Mobile, Tablet, Desktop).
* **🎨 Modern UI/UX:** Antarmuka pengguna yang bersih dan *user-friendly* dengan komponen interaktif.
* **⚡ Fast Performance:** Dibangun dengan **Vite** untuk *bundling* cepat dan kinerja optimal.
* **🎯 Type Safety:** Implementasi **TypeScript** penuh untuk pengembangan yang terstruktur dan minim *bug*.
* **👤 Autentikasi Dasar:** (Jika ada) Fitur *login/register* untuk pengguna dan pemilik properti.

---

## 🚀 Quick Start

### Prasyarat

Pastikan Anda memiliki versi berikut terinstal:

* **Node.js** (versi 18 atau lebih tinggi)
* **npm** atau **yarn**

### Instalasi dan Menjalankan Proyek

1.  **Clone repositori:**
    ```bash
    git clone https://github.com/AzkiZulham/Fe-FinalProject.git
    cd Fe-FinalProject
    ```

2.  **Install dependensi:**
    ```bash
    npm install
    # atau
    yarn install
    ```

3.  **Mulai development server:**
    ```bash
    npm run dev
    # atau
    yarn dev
    ```

4.  **Akses aplikasi:**
    Buka *browser* Anda dan navigasikan ke `http://localhost:5173`.

### 🛠️ Build untuk Produksi

```bash
# Build project
npm run build
# atau
yarn build

# Preview hasil build produksi
npm run preview
# atau
yarn preview
```
## 🏗️ Struktur Proyek
```
src/
├── components/     # Komponen UI yang dapat digunakan kembali (PropertyCard, SearchFilter, Header, dll.)
├── pages/         # Komponen utama halaman (Home, Listing, Detail Properti, Profile)
├── hooks/         # Custom React hooks (useAuth, useFilter, dll.)
├── types/         # Definisi tipe TypeScript (IProperty, IUser, dll.)
├── utils/         # Fungsi-fungsi utility dan helper
├── styles/        # Global styles dan konfigurasi Tailwind
└── assets/        # Gambar dan file statis lainnya
```
## 🎯 Komponen Kunci
 1. **PropertyCard**: Menampilkan ringkasan properti dengan gambar dan harga.
 2. **SearchFilter**: Panel pencarian dengan berbagai opsi.
 3. **filter.PropertyDetail**: Menampilkan informasi lengkap.
 4. **properti.AuthForm**: Komponen untuk Login dan Register.

## 💻 Teknologi yang Digunakan
```
Kategori        Teknologi              Deskripsi
Frontend        React 18               Framework JavaScript untuk membangun UI.
Bahasa          TypeScript 5.0         Bahasa super-set JavaScript yang kuat dan type-safe.
Styling         Tailwind CSS           Framework CSS utility-first untuk desain cepat dan responsif.
Build Tool      ViteNext-Generation    Frontend Tooling untuk bundling cepat.
IkonLucide      ReactPustaka           ikon yang ringan dan dapat disesuaikan.
```

---

## 🤝 Kontribusi
Kontribusi Anda sangat kami hargai! Silakan ajukan pull request atau buka issue jika Anda memiliki saran atau menemukan bug.

1. **Fork** proyek ini.
2. Buat *feature branch* Anda (git checkout -b feature/NewFeature).
3. **Commit** perubahan Anda (git commit -m 'feat: Add New Feature').
4. **Push** ke branch Anda (git push origin feature/NewFeature).
5. Buka **Pull Request**.

## 📄 Lisensi
Proyek ini dilisensikan di bawah **Lisensi MIT**. Lihat file [`LICENSE`](LICENSE) untuk detail lebih lanjut..

