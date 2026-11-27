# Panduan Penggunaan (Walkthrough) — HapHapNyam

Aplikasi **HapHapNyam** memudahkan keluarga memantau nutrisi, mencatat reaksi makan, dan merencanakan menu MPASI harian si kecil dengan sinkronisasi cloud instan antar perangkat keluarga.

---

## 1. Konsep "1 Keluarga 1 Akses"

- **Satu Akun Bersama:** Ayah dan Ibu mendaftarkan 1 akun email & kata sandi keluarga.
- **Akses Lintas Perangkat:**
  - Ayah membuka HapHapNyam dari laptop/HP miliknya.
  - Ibu membuka HapHapNyam dari smartphone miliknya.
  - Keduanya masuk menggunakan email & kata sandi yang sama.
- **Tersinkronisasi Otomatis:** Setiap kali salah satu mencatat makan pagi, menambahkan resep baru, atau mencentang belanjaan, datanya langsung ter-update di Supabase dan tampil di perangkat pasangan.

---

## 2. Masuk & Mendaftar Akun Keluarga

1. Buka aplikasi di peramban:
   - **Lokal:** `http://localhost:5173/`
   - **Live Publik:** `https://yosafat14.github.io/mpasi-marley/`
2. **Daftar Akun Baru (Jika Baru Pertama Kali):**
   - Pilih tab **Daftar Akun Baru**.
   - Masukkan **Nama Si Kecil** (contoh: *Marley*).
   - Masukkan **Email Keluarga** dan **Kata Sandi** (minimal 6 karakter).
   - Klik **Daftar Akun Keluarga**.
3. **Masuk (Login):**
   - Pilih tab **Masuk**, isi email dan kata sandi, lalu klik **Masuk ke HapHapNyam**.
4. **Keluar (Logout):**
   - Untuk keluar, klik tombol **Keluar** (ikon pintu keluar) di sudut kanan atas topbar.

---

## 3. Fitur Utama HapHapNyam

### Tab 1: Jurnal Harian
- **Indikator Usia & Tekstur:** Otomatis menghitung usia si kecil dan menampilkan anjuran tekstur (bubur saring kental, cincang halus/kasar, hingga *finger food*).
- **Tracker 5 Unsur Gizi:** Menampilkan kemajuan kelengkapan gizi harian (*Karbohidrat, Protein Hewani, Protein Nabati, Sayur/Buah, Lemak Tambahan*).
- **Mencatat Menu:** Klik **+ Catat** pada slot yang sesuai (Sarapan, Snack Pagi, Siang, Snack Sore, Malam). Tersedia tombol favorit (hati) dan opsi isi otomatis dari Bank Resep.

### Tab 2: Jadwal & Belanja
- **Rencana Menu 7 Hari:** Mengatur jadwal makan seminggu dari Senin hingga Minggu agar waktu memasak lebih efisien.
- **Tarik dari Jadwal ke Belanja:** Klik tombol **Tarik dari Jadwal** untuk otomatis mengumpulkan semua bahan resep minggu ini ke dalam daftar belanja.
- **Checklist Belanja:** Centang barang yang sudah dibeli di pasar/supermarket secara bersamaan.

### Tab 3: Bank Resep MPASI
- Berisi resep gizi seimbang lengkap dengan takaran bahan, langkah memasak, dan catatan tekstur.
- Tersedia tombol filter usia (`6–8`, `9–11`, `12+` bulan) dan pencarian bahan.
- Klik **Catat ke Jurnal** untuk langsung memasukkan resep ke jurnal makan hari ini.
- Tambahkan resep andalan keluarga Anda sendiri melalui tombol **+ Tambah Resep**.

### Tab 4: Alergi & Bahan Baru
- Menerapkan prinsip uji coba bahan baru selama 3 hari (*3-day wait rule*).
- Status bahan: **Pantau (Uji 3 Hari)**, **Aman**, atau **Alergi / Sensitif**.
- Membantu kedua orang tua mengetahui bahan apa saja yang sudah aman dikonsumsi si kecil.

### Tab 5: Profil & Cloud
- Ubah nama anak, tanggal lahir, dan perbarui Berat Badan (kg) serta Tinggi Badan (cm) berkala.
- Setiap perubahan langsung di-upsert ke tabel `data_keluarga` di Supabase.
- Tersedia tombol cadangan manual **Export Backup (.json)** untuk arsip pribadi.

---

## 4. Status Indikator Cloud (Topbar)
Di samping profil anak di bagian atas terdapat pil status sinkronisasi:
- ☁️ **Tersinkron:** Data saat ini telah tersimpan aman di database Supabase.
- 🔄 **Menyimpan...:** Sedang mengirim perubahan terbaru ke server.
- ☁️ **Offline:** Terjadi gangguan jaringan; periksa koneksi internet Anda.
