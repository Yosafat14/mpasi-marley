import { AgeStage, BabyProfile, DayKey, MealSlot, NutritionTag, PortionResult } from '../types';

export const MEAL_SLOTS: { key: MealSlot; label: string; timeHint: string }[] = [
  { key: 'sarapan', label: 'Sarapan', timeHint: '07.00 - 08.00' },
  { key: 'snack_pagi', label: 'Snack Pagi', timeHint: '10.00' },
  { key: 'siang', label: 'Makan Siang', timeHint: '12.00 - 13.00' },
  { key: 'snack_sore', label: 'Snack Sore', timeHint: '15.30' },
  { key: 'malam', label: 'Makan Malam', timeHint: '17.30 - 18.30' },
];

export const DAYS_OF_WEEK: { key: DayKey; label: string; short: string }[] = [
  { key: 'senin', label: 'Senin', short: 'Sen' },
  { key: 'selasa', label: 'Selasa', short: 'Sel' },
  { key: 'rabu', label: 'Rabu', short: 'Rab' },
  { key: 'kamis', label: 'Kamis', short: 'Kam' },
  { key: 'jumat', label: 'Jumat', short: 'Jum' },
  { key: 'sabtu', label: 'Sabtu', short: 'Sab' },
  { key: 'minggu', label: 'Minggu', short: 'Min' },
];

export const NUTRITION_META: Record<NutritionTag, { label: string; short: string; colorClass: string }> = {
  karbo: { label: 'Karbohidrat', short: 'Karbo', colorClass: 'tag-karbo' },
  prohe: { label: 'Protein Hewani', short: 'Prohe', colorClass: 'tag-prohe' },
  prona: { label: 'Protein Nabati', short: 'Prona', colorClass: 'tag-prona' },
  sayur_buah: { label: 'Sayur & Buah', short: 'Sayur/Buah', colorClass: 'tag-sayur' },
  lemak: { label: 'Lemak Tambahan', short: 'Lemak', colorClass: 'tag-lemak' },
};

export const PORTION_META: Record<PortionResult, { label: string; score: number }> = {
  habis: { label: 'Habis (100%)', score: 100 },
  '3/4': { label: '3/4 Porsi', score: 75 },
  '1/2': { label: '1/2 Porsi', score: 50 },
  '1/4': { label: '1/4 Porsi', score: 25 },
  menolak: { label: 'Menolak / GTM', score: 0 },
};

export function getTodayISO(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function offsetDateISO(baseISO: string, days: number): string {
  const [y, m, d] = baseISO.split('-').map(Number);
  const dt = new Date(y, m - 1, d + days);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
}

export function formatDateID(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function calculateAgeInfo(birthDateISO: string): {
  months: number;
  days: number;
  stage: AgeStage;
  label: string;
} {
  const [by, bm, bd] = birthDateISO.split('-').map(Number);
  const birth = new Date(by, bm - 1, bd);
  const now = new Date();

  let months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
  let days = now.getDate() - birth.getDate();

  if (days < 0) {
    months -= 1;
    const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    days += prevMonth.getDate();
  }

  if (months < 0) months = 0;
  if (days < 0) days = 0;

  let stage: AgeStage = '6-8';
  if (months >= 12) stage = '12+';
  else if (months >= 9) stage = '9-11';

  return {
    months,
    days,
    stage,
    label: `${months} bulan ${days} hari`,
  };
}

export function getStageGuidance(stage: AgeStage) {
  switch (stage) {
    case '6-8':
      return {
        title: 'Tahap Awal (6–8 Bulan)',
        texture: 'Bubur kental / lumat (puree & saring)',
        frequency: '2–3x makan utama + 1–2x snack',
        portion: '2–3 sdm hingga 1/2 mangkuk (125 ml)',
        tip: 'Prioritaskan protein hewani & lemak tambahan (EVOO/ub/santan) sejak hari pertama untuk cegah stunting & dukung BB.',
      };
    case '9-11':
      return {
        title: 'Tahap Lanjutan (9–11 Bulan)',
        texture: 'Cincang halus, cincang kasar, & finger food',
        frequency: '3–4x makan utama + 1–2x snack',
        portion: '1/2 hingga 3/4 mangkuk (125–200 ml)',
        tip: 'Latih kemampuan mengunyah & menjimpit (pincer grasp) dengan finger food kukus yang lembut.',
      };
    case '12+':
      return {
        title: 'Makanan Keluarga (12–23 Bulan)',
        texture: 'Makanan keluarga (dipotong sesuai genggaman)',
        frequency: '3–4x makan utama + 1–2x snack',
        portion: '3/4 hingga 1 mangkuk penuh (200–250 ml)',
        tip: 'Kurangi garam & gula berlebih, tetap jaga variasi 4 bintang di setiap piring Marley.',
      };
  }
}

export function getDefaultProfile(): BabyProfile {
  // Default ~8 months old relative to current date so Marley's stage feels realistic
  const today = new Date();
  const birth = new Date(today.getFullYear(), today.getMonth() - 8, today.getDate() - 5);
  const birthISO = `${birth.getFullYear()}-${String(birth.getMonth() + 1).padStart(2, '0')}-${String(birth.getDate()).padStart(2, '0')}`;
  return {
    name: 'Marley',
    birthDate: birthISO,
    weightKg: 8.4,
    heightCm: 70.5,
    notes: 'Suka tekstur agak hangat, lahap kalau pakai kaldu ayam kampung & keju.',
  };
}
