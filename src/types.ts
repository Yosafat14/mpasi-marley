export type AgeStage = '6-8' | '9-11' | '12+';

export type MealSlot = 'sarapan' | 'snack_pagi' | 'siang' | 'snack_sore' | 'malam';

export type PortionResult = 'habis' | '3/4' | '1/2' | '1/4' | 'menolak';

export type NutritionTag = 'karbo' | 'prohe' | 'prona' | 'sayur_buah' | 'lemak';

export type AllergyStatus = 'aman' | 'pantau' | 'alergi';

export interface BabyProfile {
  name: string;
  birthDate: string; // YYYY-MM-DD
  weightKg: number;
  heightCm: number;
  notes: string;
}

export interface MealLog {
  id: string;
  date: string; // YYYY-MM-DD
  slot: MealSlot;
  menuName: string;
  texture: string;
  portion: PortionResult;
  nutrition: NutritionTag[];
  reaction: string;
  loved: boolean;
  notes?: string;
}

export interface Recipe {
  id: string;
  title: string;
  stage: AgeStage;
  prepMinutes: number;
  nutrition: NutritionTag[];
  ingredients: string[];
  steps: string[];
  textureNote: string;
  isCustom?: boolean;
}

export type DayKey = 'senin' | 'selasa' | 'rabu' | 'kamis' | 'jumat' | 'sabtu' | 'minggu';

export interface WeeklyPlanEntry {
  menuName: string;
  recipeId?: string;
}

export type WeeklyPlan = Record<DayKey, Partial<Record<MealSlot, WeeklyPlanEntry>>>;

export interface IngredientTrial {
  id: string;
  name: string;
  category: 'Prohe' | 'Prona' | 'Karbo' | 'Sayur & Buah' | 'Lemak & Lainnya';
  introducedDate: string; // YYYY-MM-DD
  status: AllergyStatus;
  notes: string;
}

export interface ShoppingItem {
  id: string;
  name: string;
  checked: boolean;
}

export interface MpasiStore {
  profile: BabyProfile;
  logs: MealLog[];
  recipes: Recipe[];
  weeklyPlan: WeeklyPlan;
  trials: IngredientTrial[];
  shoppingList: ShoppingItem[];
}
