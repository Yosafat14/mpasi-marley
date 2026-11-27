import { useEffect, useState } from 'react';
import {
  Baby,
  BookOpen,
  CalendarDays,
  ClipboardList,
  ShieldAlert,
  UserCog,
} from 'lucide-react';
import { AllergyTrackerView } from './components/AllergyTrackerView';
import { DailyLogView } from './components/DailyLogView';
import { ProfileDataView } from './components/ProfileDataView';
import { RecipesView } from './components/RecipesView';
import { WeeklyPlannerView } from './components/WeeklyPlannerView';
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
import { loadStore, resetStore, saveStore } from './utils/storage';

type TabKey = 'jurnal' | 'jadwal' | 'resep' | 'alergi' | 'profil';

export default function App() {
  const [store, setStore] = useState<MpasiStore>(() => loadStore());
  const [activeTab, setActiveTab] = useState<TabKey>('jurnal');
  const [selectedDate, setSelectedDate] = useState<string>(getTodayISO());
  const [toast, setToast] = useState<string>('');

  useEffect(() => {
    saveStore(store);
  }, [store]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2800);
  };

  const age = calculateAgeInfo(store.profile.birthDate);

  const handleAddLog = (newLog: Omit<MealLog, 'id'>) => {
    const entry: MealLog = { ...newLog, id: `log-${Date.now()}` };
    setStore((prev) => ({ ...prev, logs: [entry, ...prev.logs] }));
    showToast(`Tercatat: ${newLog.menuName}`);
  };

  const handleDeleteLog = (id: string) => {
    setStore((prev) => ({ ...prev, logs: prev.logs.filter((l) => l.id !== id) }));
  };

  const handleUpdateWeeklySlot = (day: DayKey, slot: MealSlot, menuName: string, recipeId?: string) => {
    setStore((prev) => ({
      ...prev,
      weeklyPlan: {
        ...prev.weeklyPlan,
        [day]: {
          ...prev.weeklyPlan[day],
          [slot]: { menuName, recipeId },
        },
      },
    }));
    showToast('Jadwal mingguan diperbarui');
  };

  const handleClearWeeklySlot = (day: DayKey, slot: MealSlot) => {
    setStore((prev) => {
      const nextDay = { ...prev.weeklyPlan[day] };
      delete nextDay[slot];
      return {
        ...prev,
        weeklyPlan: { ...prev.weeklyPlan, [day]: nextDay },
      };
    });
  };

  const handleAddShoppingItem = (name: string) => {
    setStore((prev) => ({
      ...prev,
      shoppingList: [...prev.shoppingList, { id: `shop-${Date.now()}`, name, checked: false }],
    }));
  };

  const handleToggleShoppingItem = (id: string) => {
    setStore((prev) => ({
      ...prev,
      shoppingList: prev.shoppingList.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      ),
    }));
  };

  const handleDeleteShoppingItem = (id: string) => {
    setStore((prev) => ({
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

    setStore((prev) => ({
      ...prev,
      shoppingList: [...prev.shoppingList, ...newItems],
    }));
    showToast(`${newItems.length} bahan ditambahkan ke daftar belanja!`);
  };

  const handleAddRecipe = (recipe: Omit<Recipe, 'id'>) => {
    const entry: Recipe = { ...recipe, id: `rec-${Date.now()}` };
    setStore((prev) => ({ ...prev, recipes: [entry, ...prev.recipes] }));
    showToast(`Resep "${recipe.title}" ditambahkan!`);
  };

  const handleDeleteRecipe = (id: string) => {
    setStore((prev) => ({ ...prev, recipes: prev.recipes.filter((r) => r.id !== id) }));
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
    setStore((prev) => ({ ...prev, trials: [entry, ...prev.trials] }));
    showToast(`Bahan "${trial.name}" dicatat!`);
  };

  const handleUpdateTrialStatus = (id: string, status: AllergyStatus) => {
    setStore((prev) => ({
      ...prev,
      trials: prev.trials.map((t) => (t.id === id ? { ...t, status } : t)),
    }));
  };

  const handleDeleteTrial = (id: string) => {
    setStore((prev) => ({ ...prev, trials: prev.trials.filter((t) => t.id !== id) }));
  };

  const handleUpdateProfile = (profile: BabyProfile) => {
    setStore((prev) => ({ ...prev, profile }));
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-inner">
          <div className="brand">
            <div className="brand-badge">
              <Baby size={24} />
            </div>
            <div>
              <div className="brand-title">MPASI {store.profile.name}</div>
              <div className="brand-sub">Jurnal Makan, Jadwal & Tracker Gizi Lokal</div>
            </div>
          </div>

          <button className="profile-pill" onClick={() => setActiveTab('profil')}>
            <span>{store.profile.name}</span>
            <span>&bull;</span>
            <span>{age.label}</span>
          </button>
        </div>
      </header>

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
            <UserCog size={17} /> Profil & Backup
          </button>
        </div>
      </nav>

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
          }}
        >
          {toast}
        </div>
      )}

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
              setStore(imported);
              showToast('Backup berhasil dipulihkan!');
            }}
            onResetStore={() => {
              setStore(resetStore());
              showToast('Data direset ke contoh awal.');
            }}
          />
        )}
      </main>

      <footer className="local-footer">
        MPASI {store.profile.name} &bull; Berjalan 100% Lokal (LocalStorage) &bull; Data aman tersimpan di browser Anda
      </footer>
    </div>
  );
}
