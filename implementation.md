# Dokumentasi Implementasi — HapHapNyam

Aplikasi pencatatan, perencana menu, dan pemantau gizi MPASI (Makanan Pendamping ASI) multi-keluarga dengan sistem **1 Keluarga 1 Akses** yang tersinkronisasi secara *real-time* ke **Supabase Cloud**.

---

## 1. Arsitektur & Teknologi

| Komponen | Pilihan Teknologi | Peran & Alasan Pemilihan |
| :--- | :--- | :--- |
| **Frontend Framework** | React 18 + TypeScript | UI berbasis komponen reaktif, modular, dan type-safe |
| **Backend & Database** | Supabase (PostgreSQL + Auth) | Autentikasi keluarga, database PostgreSQL realtime, penyimpanan JSONB |
| **Tabel Utama** | `data_keluarga` | Menyimpan `user_id`, `nama_anak`, dan `data_mpasi` bertipe JSONB |
| **Client SDK** | `@supabase/supabase-js` | Mengelola sesi login/register dan operasi `select` serta `upsert` |
| **Build Tool & Bundler** | Vite 6 | Kompilasi cepat, HMR instan, dan optimasi bundle |
| **Styling** | Vanilla CSS Variable Design System | Desain hangat, ramah anak, dan responsif di smartphone |
| **Ikon UI** | Lucide React | Ikon modern dan informatif untuk navigasi |

---

## 2. Struktur Proyek

```text
d:\YOSAFAT\MPASI MARLEY\
├── index.html                  # HTML entry point (Branding: HapHapNyam)
├── package.json                # Dependensi (@supabase/supabase-js, react, lucide-react, vite)
├── tsconfig.json               # Konfigurasi TypeScript bundler mode
├── vite.config.ts              # Konfigurasi dev server & build Vite
├── dist/                       # Output build produksi (siap hosting statis)
└── src/
    ├── main.tsx                # Entry point render React DOM
    ├── supabaseClient.ts       # Inisialisasi client Supabase dengan URL & anon key
    ├── vite-env.d.ts           # Deklarasi tipe Vite client
    ├── index.css               # Tema warna, layout responsif, modal, form input
    ├── types.ts                # Tipe data MPASI (BabyProfile, MealLog, Recipe, dll.)
    ├── App.tsx                 # Root component: auth check, cloud sync data_keluarga, tab navigation
    ├── data/
    │   └── seed.ts             # Bank resep bawaan & template jurnal inisialisasi awal
    ├── utils/
    │   ├── mpasi.ts            # Kalkulasi usia si kecil & rekomendasi tekstur IDAI/WHO
    │   └── storage.ts          # Integrasi Supabase: loadFamilyStoreFromSupabase, syncFamilyStoreToSupabase
    └── components/
        ├── AuthView.tsx        # Halaman Masuk & Daftar Akun Keluarga (1 keluarga 1 akun)
        ├── DailyLogView.tsx    # Jurnal makan harian & tracker 5 unsur gizi
        ├── WeeklyPlannerView.tsx # Perencana menu 7 hari & checklist belanja otomatis
        ├── RecipesView.tsx     # Bank resep MPASI bergizi & log 1-klik ke jurnal
        ├── AllergyTrackerView.tsx # Pelacak pengenalan bahan baru 3 hari (3-day wait rule)
        └── ProfileDataView.tsx # Pengaturan profil si kecil & status cloud Supabase
```

---

## 3. Konfigurasi Supabase Client (`src/supabaseClient.ts`)

```typescript
import { createClient } from '@supabase/supabase-js';

const rawUrl = 'https://wglbahwzqeocavoghbxp.supabase.co/rest/v1/';
export const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, '');
export const supabaseAnonKey = 'sb_publishable_fWsMkBsqZxrEHfktqDlVTw_Qm3IYbiV';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
```

---

## 4. Mekanisme Sinkronisasi Tabel `data_keluarga`

### Skema Tabel Supabase:
- **`user_id`** (`uuid` / `text`, Primary Key): ID pengguna Supabase Auth keluarga yang sedang login.
- **`nama_anak`** (`text`): Nama si kecil yang dipantau (misal: "Marley").
- **`data_mpasi`** (`jsonb`): Seluruh pohon data aplikasi:
  ```json
  {
    "profile": { "name": "Marley", "birthDate": "2026-03-22", "weightKg": 8.4, "heightCm": 70.5, "notes": "..." },
    "logs": [ ... ],
    "recipes": [ ... ],
    "weeklyPlan": { ... },
    "trials": [ ... ],
    "shoppingList": [ ... ]
  }
  ```

### Alur Kerja (Workflow):
1. **Autentikasi**:
   - Pengguna disambut oleh `AuthView`. Pasangan (Ayah dan Ibu) menggunakan email & kata sandi yang sama di perangkat masing-masing.
2. **Pengambilan Data (Fetch)**:
   - Setelah login, `loadFamilyStoreFromSupabase(userId)` memanggil query:
     ```typescript
     supabase.from('data_keluarga').select('nama_anak, data_mpasi').eq('user_id', userId).maybeSingle();
     ```
   - Jika akun baru (belum memiliki baris di tabel), sistem menginisialisasi template data MPASI awal dan langsung menyimpannya ke Supabase.
3. **Auto-Sync Otomatis (Upsert)**:
   - Setiap mutasi state (tambah catatan makan, ubah jadwal mingguan, tandai belanjaan, perbarui profil, tambah resep kustom) memicu sinkronisasi otomatis via `syncFamilyStoreToSupabase`:
     ```typescript
     supabase.from('data_keluarga').upsert({
       user_id: userId,
       nama_anak: store.profile.name,
       data_mpasi: store,
     }, { onConflict: 'user_id' });
     ```
   - Di bilah atas (topbar), terdapat indikator status cloud: **"Tersinkron"** (awan hijau), **"Menyimpan..."** (animasi putar), atau **"Offline"**.
