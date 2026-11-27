# Dokumentasi Implementasi — MPASI Marley

Aplikasi pencatatan, perencana menu, dan pemantau gizi MPASI (Makanan Pendamping ASI) untuk si kecil Marley yang berjalan **100% lokal** di peramban (offline-first) tanpa ketergantungan server/cloud pihak ketiga.

---

## 1. Arsitektur & Teknologi

| Komponen | Pilihan Teknologi | Alasan Pemilihan |
| :--- | :--- | :--- |
| **Frontend Framework** | React 18 + TypeScript | Komponen modular, type-safety kuat untuk data nutrisi & jadwal |
| **Build Tool & Bundler** | Vite 6 | Waktu kompilasi dan HMR instan di lingkungan lokal Windows |
| **Ikon UI** | Lucide React | Ikon modern, ringan, dan ramah pengguna |
| **Styling** | Vanilla CSS Variable Design System | Tidak memerlukan runtime CSS berat; palet warna lembut ramah anak |
| **Penyimpanan Data** | LocalStorage API (`mpasi_marley_store_v1`) | Data aman di perangkat lokal, offline tanpa internet |
| **Backup & Migrasi** | JSON File Export / Import API | Cadangan data dapat dipindahkan antar perangkat atau disimpan rapi |

---

## 2. Struktur Proyek

```text
d:\YOSAFAT\MPASI MARLEY\
├── index.html                  # HTML entry point dengan font Nunito & Plus Jakarta Sans
├── package.json                # Dependensi & script proyek
├── tsconfig.json               # Konfigurasi TypeScript bundler mode
├── vite.config.ts              # Konfigurasi dev server & build Vite
├── dist/                       # Output build produksi (siap hosting statis)
└── src/
    ├── main.tsx                # React DOM render entry
    ├── vite-env.d.ts           # Deklarasi tipe Vite client
    ├── index.css               # Tema warna, token CSS, tata letak responsif & modal
    ├── types.ts                # Model data & antarmuka TypeScript
    ├── App.tsx                 # Root component: navigasi tab, state sinkronisasi, toast
    ├── data/
    │   └── seed.ts             # Data inisialisasi awal (resep, jurnal, jadwal, alergi)
    ├── utils/
    │   ├── mpasi.ts            # Logika hitung usia, panduan tekstur IDAI/WHO, slot makan
    │   └── storage.ts          # Sinkronisasi LocalStorage, validasi, dan export/import JSON
    └── components/
        ├── DailyLogView.tsx    # Jurnal makan harian & kelengkapan 5 unsur gizi
        ├── WeeklyPlannerView.tsx # Perencana menu 7 hari & checklist belanja otomatis
        ├── RecipesView.tsx     # Bank resep, filter usia, pembuat resep kustom, log cepat
        ├── AllergyTrackerView.tsx # Tracker uji bahan baru 3 hari & status alergi
        └── ProfileDataView.tsx # Profil si kecil, panduan fase usia, & backup/restore
```

---

## 3. Skema Data (`types.ts`)

### a. Profil Anak (`BabyProfile`)
```typescript
export interface BabyProfile {
  name: string;        // Nama si kecil (contoh: Marley)
  birthDate: string;   // YYYY-MM-DD untuk kalkulasi usia real-time
  weightKg: number;    // Berat badan terkini (kg)
  heightCm: number;    // Tinggi badan terkini (cm)
  notes: string;       // Catatan kebiasaan / tekstur favorit
}
```

### b. Jurnal Makan (`MealLog`)
- Slot waktu: `sarapan`, `snack_pagi`, `siang`, `snack_sore`, `malam`.
- Porsi: `habis` (100%), `3/4`, `1/2`, `1/4`, `menolak` (GTM).
- 5 Unsur Gizi: `karbo`, `prohe`, `prona`, `sayur_buah`, `lemak`.
- Indikator kesukaan (`loved`) & respon reaksi fisik/kulit.

### c. Bank Resep (`Recipe`)
- Pengelompokan usia: `6-8`, `9-11`, `12+` bulan.
- Waktu masak (`prepMinutes`), komposisi gizi, bahan-bahan, langkah pembuatan, dan catatan tekstur khusus.

### d. Jadwal & Belanja (`WeeklyPlan`, `ShoppingItem`)
- Jadwal berbasis matriks hari (`senin` .. `minggu`) dan slot makan.
- Fitur otomatis: **Tarik dari Jadwal** mengekstraksi bahan resep yang sudah dijadwalkan langsung ke daftar belanja tanpa duplikasi.

### e. Uji Coba Bahan Baru & Alergi (`IngredientTrial`)
- Mengakomodasi panduan medis pengenalan bahan baru (*3-day wait rule*).
- Status pengawasan: `pantau` (dalam pengamatan), `aman` (lolos uji), `alergi` (sensitif/reaksi ruam).

---

## 4. Mekanisme Penyimpanan & Keamanan Data Lokal

1. **Auto-Persist**: Setiap perubahan state pada `App.tsx` langsung disinkronkan ke peramban menggunakan `localStorage.setItem('mpasi_marley_store_v1', ...)`.
2. **Offline Total**: Tidak ada data yang dikirim ke jaringan luar. Privasi data tumbuh kembang Marley terjamin di komputer lokal.
3. **Ekspor & Impor Cadangan**:
   - Fungsi `exportStoreJSON` membuat file `mpasi-marley-backup-YYYY-MM-DD.json`.
   - Fungsi `FileReader` memvalidasi skema sebelum menimpa state untuk menghindari kerusakan struktur data.
4. **Pembersihan & Reset**: Opsi reset satu tombol mengembalikan state ke default resep dan konfigurasi awal.
