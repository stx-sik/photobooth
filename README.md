# InstaBooth — Studio Foto Strip Klasik 📸✨

Aplikasi Web Fotobooth Statis premium bergaya retro-modern dengan filter kreatif, bingkai warna kustom, efek suara bip & shutter sintetis (Web Audio API), dan galeri riwayat sesi berbasis penyimpanan lokal browser (LocalStorage).

Situs ini 100% statis (hanya HTML, CSS, dan JS) sehingga bisa di-host gratis di **GitHub Pages**.

---

## 🚀 Fitur Ungkapan Kenangan
1. **Format Layout Fleksibel**: Mendukung strip 3 foto vertikal, strip 4 foto vertikal, dan grid kotak 2x2.
2. **Filter Visual Real-time**: Vintage Film, Dramatic Noir, Retro Sepia, Warm Chrome, Cool Teal, Faded Velvet, dan High Contrast.
3. **Efek Suara Sintetis**: Bip hitung mundur dan rana kamera (*shutter*) yang dibuat menggunakan kode sintesis suara Web Audio API (tidak butuh mengunduh file MP3!).
4. **Stitching Canvas**: Menggabungkan foto-foto menjadi satu gambar strip dengan cetak tanggal & branding studio yang elegan di bagian bawah.
5. **Galeri Riwayat Sesi**: Menyimpan hasil jepretan Anda secara otomatis di memori lokal browser (`localStorage`) sehingga aman dari reload dan bisa diunduh kapan saja.
6. **Mendukung Mobile & Desktop**: Responsif dan mendukung pergantian kamera depan/belakang untuk pengguna smartphone.

---

## 💻 Cara Menjalankan Secara Lokal
Karena aplikasi ini statis murni, Anda dapat membukanya dengan salah satu dari dua cara berikut:

### Cara 1: Langsung Klik Dua Kali
1. Buka folder `c:\projek\photobooth-static`.
2. Klik dua kali berkas `index.html` untuk langsung membukanya di browser Anda.

### Cara 2: Menggunakan Local Server (Sangat Direkomendasikan)
Untuk performa kamera terbaik dan menghindari batasan keamanan lokal beberapa browser, jalankan server lokal sederhana:
* **Jika menggunakan Python**:
  ```bash
  python -m http.server 8000
  ```
  Lalu buka `http://localhost:8000` di browser Anda.
* **Jika menggunakan Node.js/npm**:
  ```bash
  npx live-server
  ```

---

## 🌐 Cara Menghubungkan & Deploy ke GitHub Pages (Gratis!)

Ikuti langkah-langkah di bawah ini untuk mengunggah web fotobooth ini ke akun GitHub Anda dan mempublikasikannya agar bisa diakses oleh teman-teman lewat internet:

### Langkah 1: Inisialisasi Git dan Commit Kode Lokal
Buka Terminal atau Command Prompt, arahkan ke folder proyek, dan jalankan perintah:
```bash
git add .
git commit -m "Inisialisasi aplikasi fotobooth statis"
git branch -M main
```

### Langkah 2: Buat Repositori Baru di GitHub
1. Masuk ke akun [GitHub](https://github.com/) Anda.
2. Klik tombol **New** (Baru) untuk membuat repositori baru.
3. Beri nama repositori Anda, misalnya: `photobooth`.
4. Biarkan pengaturan lainnya default (Public, dan jangan centang "Add a README file").
5. Klik **Create repository**.

### Langkah 3: Sambungkan Git Lokal ke GitHub & Push
Jalankan perintah berikut di terminal Anda:
```bash
git remote add origin https://github.com/stx-sik/photobooth.git
git push -u origin main
```

### Langkah 4: Aktifkan GitHub Pages
1. Setelah berhasil melakukan push, buka halaman repositori `photobooth` Anda di GitHub.
2. Pergi ke tab **Settings** (Pengaturan) di bagian menu atas.
3. Di sidebar sebelah kiri, klik menu **Pages**.
4. Di bagian **Build and deployment** -> **Source**, pilih **Deploy from a branch**.
5. Di bawah **Branch**, ganti *None* menjadi **main** (biar folder defaultnya `/ (root)`), lalu klik **Save** (Simpan).
6. Tunggu sekitar 1–2 menit. Segarkan halaman tersebut.
7. Di bagian atas halaman **Pages**, Anda akan melihat tautan web Anda yang sudah live, yaitu:  
   `https://stx-sik.github.io/photobooth/`

Sekarang, Anda bisa membagikan tautan tersebut agar teman-teman Anda dapat berfoto strip ria langsung dari HP mereka! 📸🎉
