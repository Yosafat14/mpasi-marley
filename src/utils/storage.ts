import { createSeedStore } from '../data/seed';
import { MpasiStore } from '../types';

const STORAGE_KEY = 'mpasi_marley_store_v1';

export function loadStore(): MpasiStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seeded = createSeedStore();
      saveStore(seeded);
      return seeded;
    }
    const parsed = JSON.parse(raw) as Partial<MpasiStore>;
    const fallback = createSeedStore();
    return {
      profile: parsed.profile ?? fallback.profile,
      logs: Array.isArray(parsed.logs) ? parsed.logs : fallback.logs,
      recipes: Array.isArray(parsed.recipes) && parsed.recipes.length > 0 ? parsed.recipes : fallback.recipes,
      weeklyPlan: parsed.weeklyPlan ?? fallback.weeklyPlan,
      trials: Array.isArray(parsed.trials) ? parsed.trials : fallback.trials,
      shoppingList: Array.isArray(parsed.shoppingList) ? parsed.shoppingList : fallback.shoppingList,
    };
  } catch {
    return createSeedStore();
  }
}

export function saveStore(store: MpasiStore): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch (err) {
    console.error('Gagal menyimpan data lokal:', err);
  }
}

export function resetStore(): MpasiStore {
  const seeded = createSeedStore();
  saveStore(seeded);
  return seeded;
}

export function exportStoreJSON(store: MpasiStore): void {
  const blob = new Blob([JSON.stringify(store, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const dateStr = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `mpasi-marley-backup-${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
