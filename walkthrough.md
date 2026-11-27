# Panduan Penggunaan (Walkthrough) — MPASI Marley

Panduan langkah-demi-langkah mengoperasikan aplikasi **MPASI Marley** untuk mendampingi tumbuh kembang dan perjalanan makan si kecil.

---

## 1. Menjalankan Aplikasi di Komputer Lokal

1. Buka PowerShell atau Terminal di direktori proyek:
   ```powershell
   cd "d:\YOSAFAT\MPASI MARLEY"
   ```
2. Pastikan dependensi sudah terpasang, lalu jalankan server pengembangan:
   ```powershell
   npm.cmd run dev
   ```
3. Buka peramban (Chrome, Edge, Firefox, dll) di alamat:
   ```text
   http://localhost:5173/
   ```

*(Opsional)* Untuk membuat bundle file statis siap produksi:
```powershell
npm.cmd run build
```

---

## 2. Alur Penggunaan Fitur Utama

### Tab 1: Jurnal Harian (`DailyLogView`)
Digunakan untuk mencatat makanan Marley setiap hari secara cepat dan memantau kelengkapan gizinya.

1. **Banner Usia & Pedoman Tekstur**:
   - Di bagian atas, aplikasi langsung menghitung usia Marley berdasarkan tanggal lahirnya.
   - Menampilkan anjuran tekstur (misal: *puree saring kental* vs *cincang kasar* vs *finger food*), porsi yang disarankan, dan catatan BB/TB terkini.
2. **Navigasi Tanggal**:
   - Gunakan panah `◀` atau `▶` untuk berpindah hari, atau klik kalender kecil untuk memilih tanggal tertentu.
   - Klik tombol **Ke Hari Ini** untuk kembali ke tanggal saat ini.
3. **Kelengkapan Gizi Harian (Progress Bar)**:
   - Terhitung otomatis dari makanan yang dicatat hari itu:
     - 🌾 **Karbo**: Beras, kentang, jagung, oat
     - 🍗 **Prohe**: Daging ayam, hati, sapi, telur, ikan kembung, salmon
     - 🫘 **Prona**: Tahu, tempe, edamame
     - 🥦 **Sayur/Buah**: Bayam, wortel, brokoli, labu, alpukat
     - 🧈 **Lemak**: Unsalted butter, santan, EVOO, minyak kanola, keju
4. **Mencatat Menu Makan**:
   - Klik tombol **+ Catat** pada slot yang diinginkan (Sarapan, Snack Pagi, Siang, Snack Sore, Malam).
   - *Tips Cepat:* Pilih dari dropdown **"Isi Cepat dari Bank Resep"** agar nama, tekstur, dan unsur gizi terisi otomatis.
   - Tandai apakah Marley menghabiskannya (*100%, 3/4, 1/2, 1/4, atau GTM*), reaksi, serta klik ikon hati bila ini menjadi menu favoritnya.

---

### Tab 2: Jadwal & Belanja (`WeeklyPlannerView`)
Membantu orang tua merencanakan menu makan seminggu ke depan agar tidak bingung di pagi hari dan belanja bahan lebih teratur.

1. **Menyusun Jadwal 7 Hari**:
   - Pilih hari (Senin s/d Minggu).
   - Klik **+ Pilih** pada slot makan.
   - Anda bisa memilih dari resep yang sudah ada atau mengetik nama menu buatan sendiri.
2. **Mengelola Daftar Belanja**:
   - Tambahkan bahan belanjaan harian melalui form input cepat.
   - Klik kotak centang untuk menandai bahan yang sudah dibeli di pasar/supermarket.
   - Klik ikon tong sampah untuk menghapus item.
3. **Fitur "Tarik dari Jadwal" (Satu Klik)**:
   - Klik tombol **Tarik dari Jadwal**. Aplikasi akan membaca semua resep yang dijadwalkan pada minggu tersebut dan otomatis memasukkan daftar bahannya ke daftar belanjaan Anda tanpa membuat item ganda.

---

### Tab 3: Bank Resep MPASI (`RecipesView`)
Koleksi resep MPASI bergizi seimbang yang sudah disesuaikan dengan pedoman tekstur usia anak.

1. **Menjelajah & Memfilter Resep**:
   - Filter berdasarkan kelompok usia: **6–8 Bulan**, **9–11 Bulan**, atau **12+ Bulan**.
   - Gunakan bilah pencarian untuk mencari bahan (misal: *"salmon"*, *"keju"*, *"hati ayam"*).
2. **Melihat Detail Resep**:
   - Klik **Lihat Resep** untuk membaca daftar takaran bahan dan langkah memasak langkah-demi-langkah.
3. **Catat 1-Klik ke Jurnal**:
   - Klik tombol **Catat** pada kartu resep. Menu akan langsung dimasukkan ke jurnal harian pada jam makan terdekat.
4. **Membuat Resep Sendiri**:
   - Klik tombol **+ Tambah Resep** di pojok kanan atas untuk menyimpan kreasi masakan keluarga Anda.

---

### Tab 4: Alergi & Bahan Baru (`AllergyTrackerView`)
Mencegah dan mendeteksi alergi makanan sejak dini sesuai prinsip uji 3 hari (*3-day wait rule*).

1. **Mencatat Bahan yang Baru Pertama Kali Dicoba**:
   - Klik **+ Catat Bahan Baru** (contoh: udang, telur putih, santan kental, stroberi).
   - Pilih kategori dan set status awal ke **Pantau (Uji 3 Hari)**.
2. **Memperbarui Status Reaksi**:
   - Jika setelah 3 hari berturut-turut tidak muncul reaksi kemerahan/gatal/diare, klik tombol **Aman**.
   - Jika muncul ruam atau reaksi sensitivitas, tandai sebagai **Alergi** dan catat detail reaksinya pada kolom catatan.
3. **Filter Pantauan**:
   - Filter berdasarkan tab *Aman*, *Pantau*, atau *Alergi* untuk memeriksa bahan apa saja yang aman dikombinasikan.

---

### Tab 5: Profil & Backup (`ProfileDataView`)
Pusat kontrol data anak dan manajemen penyimpanan lokal.

1. **Pembaruan Pertumbuhan Marley**:
   - Perbarui Berat Badan (kg) dan Tinggi Badan (cm) saat kontrol rutin ke Posyandu/Dokter Spesialis Anak.
   - Ubah tanggal lahir jika perlu; semua rekomendasi tahap MPASI akan otomatis menyesuaikan.
2. **Export Backup (.json)**:
   - Klik tombol **Export Backup (.json)** untuk mengunduh cadangan seluruh catatan makan, resep, dan jadwal ke file JSON di komputer Anda.
3. **Import / Pulihkan Backup**:
   - Jika Anda berganti komputer atau peramban, cukup klik **Import / Pulihkan Backup** dan pilih file cadangan sebelumnya. Semua data akan langsung pulih seketika.
4. **Reset Data**:
   - Tersedia tombol reset jika Anda ingin mengembalikan data ke contoh setelan awal pabrik.

---

## 3. Ringkasan Tips Praktis untuk Marley
- **Cegah Stunting & Booster BB:** Prioritaskan variasi protein hewani (ayam, telur, hati ayam, ikan berminyak sehat) dan beri lemak tambahan (santan/butter/minyak sayur) di setiap porsi.
- **Hindari GTM Berlarut:** Cek catatan tekstur di tab Jurnal jika Marley mulai menolak makanan; bisa jadi Marley sudah siap naik tekstur atau sedang tumbuh gigi (*teething*).
- **Semua Data Milik Anda:** Data tidak pernah dikirim ke internet, sepenuhnya tersimpan di browser komputer lokal Anda.
