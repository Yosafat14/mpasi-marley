import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Baby,
  BookOpen,
  CalendarDays,
  CheckCircle,
  ClipboardList,
  Cloud,
  LogOut,
  RefreshCw,
  ShieldAlert,
  UserCog,
} from 'lucide-react';
import { AllergyTrackerView } from './components/AllergyTrackerView';
import { AuthView } from './components/AuthView';
import { DailyLogView } from './components/DailyLogView';
import { ProfileDataView } from './components/ProfileDataView';
import { RecipesView } from './components/RecipesView';
import { WeeklyPlannerView } from './components/WeeklyPlannerView';
import { createSeedStore } from './data/seed';
import { supabase } from './supabaseClient';
import {
  AllergyStatus,
  BabyProfile,
  DayKey,
  IngredientTrial,
  MealLog,
  MealSlot,
  MpasiStore,
  Recipe,
} from './types';
import { calculateAgeInfo, getTodayISO } from './utils/mpasi';
import {
  loadFamilyStoreFromSupabase,
  syncFamilyStoreToSupabase,
} from './utils/storage';

type TabKey = 'jurnal' | 'jadwal' | 'resep' | 'alergi' | 'profil';

export default function App() {
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);

  const [store, setStore] = useState<MpasiStore>(() => createSeedStore());
  const [activeTab, setActiveTab] = useState<TabKey>('jurnal');
  const [selectedDate, setSelectedDate] = useState<string>(getTodayISO());
  const [toast, setToast] = useState<string>('');
  const [syncState, setSyncState] = useState<'synced' | 'saving' | 'error'>('synced');

  // Menandai apakah data awal dari cloud sudah selesai dimuat agar tidak menimpa cloud dengan initial state
  const isDataLoadedRef = useRef(false);
  const syncTimeoutRef = useRef<number | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  // 1. Cek sesi login Supabase + tangani hash token dari verifikasi email
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Tangani redirect verifikasi email: URL hash berisi #access_token=...
        // Supabase JS SDK v2 otomatis mendeteksi hash ini saat getSession() dipanggil
        const hash = window.location.hash;
        if (hash && hash.includes('access_token')) {
          // Biarkan Supabase parse hash secara internal lewat onAuthStateChange
          // Bersihkan hash dari URL agar tidak terlihat di address bar
          window.history.replaceState(null, '', window.location.pathname + window.location.search);
        }

        const { data } = await supabase.auth.getSession();
        if (data.session?.user) {
          setUserId(data.session.user.id);
          setUserEmail(data.session.user.email || null);
        }
      } catch (err) {
        console.error('Error saat inisialisasi sesi:', err);
      } finally {
        setAuthLoading(false);
      }
    };

    initAuth();

    // Pantau semua perubahan status auth (login / logout / verifikasi email)
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUserId(session.user.id);
        setUserEmail(session.user.email || null);
        // Bersihkan hash dari URL setelah token berhasil dibaca (kasus SIGNED_IN dari email link)
        if (event === 'SIGNED_IN' && window.location.hash.includes('access_token')) {
          window.history.replaceState(null, '', window.location.pathname + window.location.search);
        }
      } else {
        setUserId(null);
        setUserEmail(null);
        isDataLoadedRef.current = false;
      }
      setAuthLoading(false);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // 2. Muat data keluarga dari tabel data_keluarga saat user terautentikasi
  const loadUserData = useCallback(async (uid: string, initialBabyName?: string) => {
    setDataLoading(true);
    try {
      const existing = await loadFamilyStoreFromSupabase(uid);
      if (existing) {
        setStore(existing);
      } else {
        // Akun keluarga baru: inisialisasi dengan seed store dan nama anak yang dipilih
        const newStore = createSeedStore();
        if (initialBabyName && initialBabyName.trim()) {
          newStore.profile.name = initialBabyName.trim();
        }
        setStore(newStore);
        await syncFamilyStoreToSupabase(uid, newStore.profile.name, newStore);
      }
      isDataLoadedRef.current = true;
    } catch (err) {
      console.error('Gagal memuat data keluarga dari Supabase:', err);
      showToast('Gagal memuat data dari cloud. Silakan segarkan halaman.');
    } finally {
      setDataLoading(false);
    }
  }, []);

  useEffect(() => {
    if (userId) {
      loadUserData(userId);
    }
  }, [userId, loadUserData]);

  // 3. Sinkronkan ke Supabase tabel data_keluarga setiap kali ada mutasi state
  const pushSync = useCallback(
    async (nextStore: MpasiStore) => {
      if (!userId || !isDataLoadedRef.current) return;
      setSyncState('saving');
      const res = await syncFamilyStoreToSupabase(userId, nextStore.profile.name, nextStore);
      if (res.success) {
        setSyncState('synced');
      } else {
        setSyncState('error');
        showToast('Gagal menyinkronkan data ke cloud. Periksa koneksi internet.');
      }
    },
    [userId]
  );

  // Debounced auto-sync
  const updateStoreAndSync = useCallback(
    (updater: (prev: MpasiStore) => MpasiStore, customToast?: string) => {
      setStore((prev) => {
        const next = updater(prev);
        if (syncTimeoutRef.current) {
          window.clearTimeout(syncTimeoutRef.current);
        }
        syncTimeoutRef.current = window.setTimeout(() => {
          pushSync(next);
        }, 350);
        return next;
      });
      if (customToast) showToast(customToast);
    },
    [pushSync]
  );

  const handleLogout = async () => {
    if (window.confirm('Yakin ingin keluar dari akun keluarga ini?')) {
      await supabase.auth.signOut();
      setUserId(null);
      setUserEmail(null);
      isDataLoadedRef.current = false;
      showToast('Berhasil keluar.');
    }
  };

  const age = calculateAgeInfo(store.profile.birthDate);

  // Handlers mutasi data
  const handleAddLog = (newLog: Omit<MealLog, 'id'>) => {
    const entry: MealLog = { ...newLog, id: `log-${Date.now()}` };
    updateStoreAndSync((prev) => ({ ...prev, logs: [entry, ...prev.logs] }), `Tercatat: ${newLog.menuName}`);
  };

  const handleDeleteLog = (id: string) => {
    updateStoreAndSync((prev) => ({ ...prev, logs: prev.logs.filter((l) => l.id !== id) }));
  };

  const handleUpdateWeeklySlot = (day: DayKey, slot: MealSlot, menuName: string, recipeId?: string) => {
    updateStoreAndSync(
      (prev) => ({
        ...prev,
        weeklyPlan: {
          ...prev.weeklyPlan,
          [day]: {
            ...prev.weeklyPlan[day],
            [slot]: { menuName, recipeId },
          },
        },
      }),
      'Jadwal mingguan diperbarui'
    );
  };

  const handleClearWeeklySlot = (day: DayKey, slot: MealSlot) => {
    updateStoreAndSync((prev) => {
      const nextDay = { ...prev.weeklyPlan[day] };
      delete nextDay[slot];
      return {
        ...prev,
        weeklyPlan: { ...prev.weeklyPlan, [day]: nextDay },
      };
    });
  };

  const handleAddShoppingItem = (name: string) => {
    updateStoreAndSync((prev) => ({
      ...prev,
      shoppingList: [...prev.shoppingList, { id: `shop-${Date.now()}`, name, checked: false }],
    }));
  };

  const handleToggleShoppingItem = (id: string) => {
    updateStoreAndSync((prev) => ({
      ...prev,
      shoppingList: prev.shoppingList.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      ),
    }));
  };

  const handleDeleteShoppingItem = (id: string) => {
    updateStoreAndSync((prev) => ({
      ...prev,
      shoppingList: prev.shoppingList.filter((item) => item.id !== id),
    }));
  };

  const handleGenerateShoppingFromPlan = () => {
    const recipeIds = new Set<string>();
    Object.values(store.weeklyPlan).forEach((day) => {
      Object.values(day).forEach((entry) => {
        if (entry?.recipeId) recipeIds.add(entry.recipeId);
      });
    });

    const existingNames = new Set(store.shoppingList.map((i) => i.name.toLowerCase()));
    const newItems: { id: string; name: string; checked: boolean }[] = [];

    store.recipes.forEach((rec) => {
      if (recipeIds.has(rec.id)) {
        rec.ingredients.forEach((ing, idx) => {
          if (!existingNames.has(ing.toLowerCase())) {
            existingNames.add(ing.toLowerCase());
            newItems.push({ id: `shop-${Date.now()}-${rec.id}-${idx}`, name: ing, checked: false });
          }
        });
      }
    });

    if (newItems.length === 0) {
      showToast('Semua bahan dari jadwal sudah ada di daftar belanja.');
      return;
    }

    updateStoreAndSync(
      (prev) => ({
        ...prev,
        shoppingList: [...prev.shoppingList, ...newItems],
      }),
      `${newItems.length} bahan ditambahkan ke daftar belanja!`
    );
  };

  const handleAddRecipe = (recipe: Omit<Recipe, 'id'>) => {
    const entry: Recipe = { ...recipe, id: `rec-${Date.now()}` };
    updateStoreAndSync(
      (prev) => ({ ...prev, recipes: [entry, ...prev.recipes] }),
      `Resep "${recipe.title}" ditambahkan!`
    );
  };

  const handleDeleteRecipe = (id: string) => {
    updateStoreAndSync((prev) => ({ ...prev, recipes: prev.recipes.filter((r) => r.id !== id) }));
  };

  const handleQuickLogRecipe = (recipe: Recipe) => {
    const today = getTodayISO();
    const hour = new Date().getHours();
    let slot: MealSlot = 'siang';
    if (hour < 10) slot = 'sarapan';
    else if (hour < 12) slot = 'snack_pagi';
    else if (hour < 15) slot = 'siang';
    else if (hour < 17) slot = 'snack_sore';
    else slot = 'malam';

    handleAddLog({
      date: today,
      slot,
      menuName: recipe.title,
      texture: recipe.textureNote,
      portion: 'habis',
      nutrition: recipe.nutrition,
      reaction: 'Aman',
      loved: true,
    });
    setSelectedDate(today);
    setActiveTab('jurnal');
  };

  const handleAddTrial = (trial: Omit<IngredientTrial, 'id'>) => {
    const entry: IngredientTrial = { ...trial, id: `trial-${Date.now()}` };
    updateStoreAndSync(
      (prev) => ({ ...prev, trials: [entry, ...prev.trials] }),
      `Bahan "${trial.name}" dicatat!`
    );
  };

  const handleUpdateTrialStatus = (id: string, status: AllergyStatus) => {
    updateStoreAndSync((prev) => ({
      ...prev,
      trials: prev.trials.map((t) => (t.id === id ? { ...t, status } : t)),
    }));
  };

  const handleDeleteTrial = (id: string) => {
    updateStoreAndSync((prev) => ({ ...prev, trials: prev.trials.filter((t) => t.id !== id) }));
  };

  const handleUpdateProfile = (profile: BabyProfile) => {
    updateStoreAndSync((prev) => ({ ...prev, profile }), 'Profil si kecil diperbarui dan tersinkron');
  };

  // Tampilan Loading Awal
  if (authLoading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '14px',
          background: 'var(--bg)',
        }}
      >
        <div className="brand-badge" style={{ animation: 'spin 2s linear infinite' }}>
          <Baby size={28} />
        </div>
        <p style={{ fontWeight: 600, color: 'var(--text-muted)' }}>Memuat HapHapNyam...</p>
      </div>
    );
  }

  // Tampilan Login / Register jika belum login
  if (!userId) {
    return (
      <AuthView
        onAuthSuccess={(uid, initialBabyName) => {
          setUserId(uid);
          loadUserData(uid, initialBabyName);
        }}
      />
    );
  }

  // Tampilan saat data keluarga sedang diunduh dari Supabase
  if (dataLoading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '14px',
          background: 'var(--bg)',
        }}
      >
        <div style={{ color: 'var(--primary)' }}>
          <RefreshCw size={36} className="spin-icon" style={{ animation: 'spin 1.5s linear infinite' }} />
        </div>
        <p style={{ fontWeight: 700, color: 'var(--text)' }}>Menyinkronkan Data Keluarga...</p>
        <p className="muted" style={{ margin: 0 }}>
          Mengambil catatan MPASI dari cloud Supabase
        </p>
      </div>
    );
  }

  return (
    <div className="app-shell">
      {/* Topbar Header */}
      <header className="topbar">
        <div className="topbar-inner">
          <div className="brand">
            <div className="brand-badge">
              <Baby size={24} />
            </div>
            <div>
              <div className="brand-title">HapHapNyam</div>
              <div className="brand-sub">Jurnal Makan, Jadwal & Tracker MPASI Keluarga</div>
            </div>
          </div>

          <div className="row-gap" style={{ gap: '10px' }}>
            {/* Status Sinkronisasi Cloud */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.78rem',
                fontWeight: 600,
                padding: '6px 10px',
                borderRadius: '999px',
                background:
                  syncState === 'synced'
                    ? 'var(--primary-soft)'
                    : syncState === 'saving'
                    ? 'var(--warning-soft)'
                    : 'var(--danger-soft)',
                color:
                  syncState === 'synced'
                    ? 'var(--primary)'
                    : syncState === 'saving'
                    ? 'var(--warning)'
                    : 'var(--danger)',
              }}
              title={
                syncState === 'synced'
                  ? 'Data tersimpan otomatis di cloud Supabase'
                  : syncState === 'saving'
                  ? 'Menyimpan perubahan ke cloud...'
                  : 'Gagal sinkron'
              }
            >
              {syncState === 'synced' && <Cloud size={14} />}
              {syncState === 'saving' && <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} />}
              {syncState === 'error' && <Cloud size={14} />}
              <span>{syncState === 'synced' ? 'Tersinkron' : syncState === 'saving' ? 'Menyimpan...' : 'Offline'}</span>
            </div>

            {/* Pill Profil Anak */}
            <button className="profile-pill" onClick={() => setActiveTab('profil')} title="Lihat Profil Si Kecil">
              <span>{store.profile.name}</span>
              <span>&bull;</span>
              <span>{age.label}</span>
            </button>

            {/* Tombol Logout */}
            <button
              className="btn btn-outline btn-sm"
              onClick={handleLogout}
              title={`Keluar (${userEmail || 'Akun'})`}
              style={{ padding: '6px 10px', gap: '5px' }}
            >
              <LogOut size={14} />
              <span style={{ fontSize: '0.8rem' }}>Keluar</span>
            </button>
          </div>
        </div>
      </header>

      {/* Navigasi Tab */}
      <nav className="nav-bar">
        <div className="nav-inner">
          <button
            className={`nav-tab ${activeTab === 'jurnal' ? 'active' : ''}`}
            onClick={() => setActiveTab('jurnal')}
          >
            <ClipboardList size={17} /> Jurnal Harian
          </button>
          <button
            className={`nav-tab ${activeTab === 'jadwal' ? 'active' : ''}`}
            onClick={() => setActiveTab('jadwal')}
          >
            <CalendarDays size={17} /> Jadwal & Belanja
          </button>
          <button
            className={`nav-tab ${activeTab === 'resep' ? 'active' : ''}`}
            onClick={() => setActiveTab('resep')}
          >
            <BookOpen size={17} /> Bank Resep
          </button>
          <button
            className={`nav-tab ${activeTab === 'alergi' ? 'active' : ''}`}
            onClick={() => setActiveTab('alergi')}
          >
            <ShieldAlert size={17} /> Alergi & Bahan
          </button>
          <button
            className={`nav-tab ${activeTab === 'profil' ? 'active' : ''}`}
            onClick={() => setActiveTab('profil')}
          >
            <UserCog size={17} /> Profil & Cloud
          </button>
        </div>
      </nav>

      {/* Notifikasi Toast */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            background: '#1f2937',
            color: '#fff',
            padding: '10px 16px',
            borderRadius: '10px',
            fontSize: '0.88rem',
            fontWeight: 600,
            zIndex: 60,
            boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <CheckCircle size={16} color="#34d399" />
          <span>{toast}</span>
        </div>
      )}

      {/* Konten Halaman */}
      <main className="main-content">
        {activeTab === 'jurnal' && (
          <DailyLogView
            profile={store.profile}
            logs={store.logs}
            recipes={store.recipes}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            onAddLog={handleAddLog}
            onDeleteLog={handleDeleteLog}
          />
        )}

        {activeTab === 'jadwal' && (
          <WeeklyPlannerView
            weeklyPlan={store.weeklyPlan}
            recipes={store.recipes}
            shoppingList={store.shoppingList}
            onUpdateSlot={handleUpdateWeeklySlot}
            onClearSlot={handleClearWeeklySlot}
            onAddShoppingItem={handleAddShoppingItem}
            onToggleShoppingItem={handleToggleShoppingItem}
            onDeleteShoppingItem={handleDeleteShoppingItem}
            onGenerateShoppingFromPlan={handleGenerateShoppingFromPlan}
          />
        )}

        {activeTab === 'resep' && (
          <RecipesView
            recipes={store.recipes}
            onAddRecipe={handleAddRecipe}
            onDeleteRecipe={handleDeleteRecipe}
            onQuickLogRecipe={handleQuickLogRecipe}
          />
        )}

        {activeTab === 'alergi' && (
          <AllergyTrackerView
            trials={store.trials}
            onAddTrial={handleAddTrial}
            onUpdateStatus={handleUpdateTrialStatus}
            onDeleteTrial={handleDeleteTrial}
          />
        )}

        {activeTab === 'profil' && (
          <ProfileDataView
            store={store}
            onUpdateProfile={handleUpdateProfile}
            onImportStore={(imported) => {
              updateStoreAndSync(() => imported, 'Data cadangan berhasil dipulihkan!');
            }}
            onResetStore={() => {
              const resetData = createSeedStore();
              updateStoreAndSync(() => resetData, 'Data direset ke contoh awal.');
            }}
          />
        )}
      </main>

      <footer className="local-footer">
        HapHapNyam &bull; 1 Keluarga 1 Akses &bull; Tersinkronisasi Otomatis ke Cloud Supabase (Tabel <code>data_keluarga</code>)
      </footer>
    </div>
  );
}
