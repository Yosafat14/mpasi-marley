import { createSeedStore } from '../data/seed';
import { supabase } from '../supabaseClient';
import { MpasiStore } from '../types';

export interface DataKeluargaRow {
  user_id: string;
  nama_anak: string;
  data_mpasi: MpasiStore;
  updated_at?: string;
}

/**
 * Mengambil data MPASI keluarga dari Supabase berdasarkan user_id.
 * Jika baris belum ada di database (pengguna baru), fungsi ini mengembalikan null.
 */
export async function loadFamilyStoreFromSupabase(userId: string): Promise<MpasiStore | null> {
  try {
    const { data, error } = await supabase
      .from('data_keluarga')
      .select('nama_anak, data_mpasi')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error saat membaca data_keluarga dari Supabase:', error);
      return null;
    }

    if (data && data.data_mpasi) {
      const parsed = data.data_mpasi as Partial<MpasiStore>;
      const fallback = createSeedStore();
      return {
        profile: {
          ...fallback.profile,
          ...(parsed.profile || {}),
          name: data.nama_anak || parsed.profile?.name || fallback.profile.name,
        },
        logs: Array.isArray(parsed.logs) ? parsed.logs : fallback.logs,
        recipes: Array.isArray(parsed.recipes) && parsed.recipes.length > 0 ? parsed.recipes : fallback.recipes,
        weeklyPlan: parsed.weeklyPlan ?? fallback.weeklyPlan,
        trials: Array.isArray(parsed.trials) ? parsed.trials : fallback.trials,
        shoppingList: Array.isArray(parsed.shoppingList) ? parsed.shoppingList : fallback.shoppingList,
      };
    }

    return null;
  } catch (err) {
    console.error('Gagal mengambil data keluarga:', err);
    return null;
  }
}

/**
 * Menyimpan / menyinkronkan data MPASI keluarga (upsert) ke tabel data_keluarga di Supabase.
 */
export async function syncFamilyStoreToSupabase(
  userId: string,
  babyName: string,
  store: MpasiStore
): Promise<{ success: boolean; error?: string }> {
  try {
    const payload = {
      user_id: userId,
      nama_anak: babyName || store.profile.name || 'Si Kecil',
      data_mpasi: store,
    };

    const { error } = await supabase.from('data_keluarga').upsert(payload, {
      onConflict: 'user_id',
    });

    if (error) {
      console.error('Gagal menyinkronkan data_keluarga ke Supabase:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Gagal menyinkronkan data ke cloud';
    console.error('Exception sinkronisasi:', message);
    return { success: false, error: message };
  }
}

/**
 * Ekspor cadangan file JSON manual untuk arsip orang tua.
 */
export function exportStoreJSON(store: MpasiStore): void {
  const blob = new Blob([JSON.stringify(store, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const dateStr = new Date().toISOString().slice(0, 10);
  const safeName = (store.profile.name || 'si-kecil').toLowerCase().replace(/\s+/g, '-');
  a.href = url;
  a.download = `haphapnyam-${safeName}-backup-${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
