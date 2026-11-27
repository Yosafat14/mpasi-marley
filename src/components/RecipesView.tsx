import React, { useState } from 'react';
import { BookOpen, Clock, Plus, Search, Trash2, Utensils, X } from 'lucide-react';
import { AgeStage, NutritionTag, Recipe } from '../types';
import { NUTRITION_META } from '../utils/mpasi';

interface RecipesViewProps {
  recipes: Recipe[];
  onAddRecipe: (recipe: Omit<Recipe, 'id'>) => void;
  onDeleteRecipe: (id: string) => void;
  onQuickLogRecipe: (recipe: Recipe) => void;
}

const ALL_NUTRITION: NutritionTag[] = ['karbo', 'prohe', 'prona', 'sayur_buah', 'lemak'];

export const RecipesView: React.FC<RecipesViewProps> = ({
  recipes,
  onAddRecipe,
  onDeleteRecipe,
  onQuickLogRecipe,
}) => {
  const [stageFilter, setStageFilter] = useState<'all' | AgeStage>('all');
  const [query, setQuery] = useState('');
  const [activeRecipe, setActiveRecipe] = useState<Recipe | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  // Form states for new recipe
  const [title, setTitle] = useState('');
  const [stage, setStage] = useState<AgeStage>('6-8');
  const [prepMinutes, setPrepMinutes] = useState(20);
  const [nutrition, setNutrition] = useState<NutritionTag[]>(['karbo', 'prohe', 'sayur_buah', 'lemak']);
  const [textureNote, setTextureNote] = useState('');
  const [ingredientsText, setIngredientsText] = useState('');
  const [stepsText, setStepsText] = useState('');

  const filtered = recipes.filter((r) => {
    const matchStage = stageFilter === 'all' || r.stage === stageFilter;
    const q = query.trim().toLowerCase();
    const matchQuery =
      !q ||
      r.title.toLowerCase().includes(q) ||
      r.ingredients.some((i) => i.toLowerCase().includes(q));
    return matchStage && matchQuery;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAddRecipe({
      title: title.trim(),
      stage,
      prepMinutes: Number(prepMinutes) || 15,
      nutrition,
      textureNote: textureNote.trim() || 'Sesuaikan tekstur dengan usia Marley.',
      ingredients: ingredientsText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
      steps: stepsText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
      isCustom: true,
    });
    setTitle('');
    setTextureNote('');
    setIngredientsText('');
    setStepsText('');
    setShowAdd(false);
  };

  return (
    <div className="stack-md">
      <div className="card stack-md">
        <div className="row-between">
          <div>
            <h3>Bank Resep MPASI Marley</h3>
            <p className="muted" style={{ margin: 0 }}>
              Kumpulan resep gizi seimbang 4 bintang + lemak tambahan.
            </p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
            <Plus size={16} /> Tambah Resep
          </button>
        </div>

        <div className="row-between">
          <div className="chip-group">
            {(['all', '6-8', '9-11', '12+'] as const).map((s) => (
              <button
                key={s}
                className={`chip ${stageFilter === s ? 'selected' : ''}`}
                onClick={() => setStageFilter(s)}
              >
                {s === 'all' ? 'Semua Usia' : `${s} Bulan`}
              </button>
            ))}
          </div>
          <div style={{ position: 'relative', minWidth: 240 }}>
            <Search
              size={16}
              style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }}
            />
            <input
              className="input"
              style={{ paddingLeft: 34 }}
              placeholder="Cari menu atau bahan..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="grid-3">
        {filtered.map((recipe) => (
          <div key={recipe.id} className="card stack-sm" style={{ justifyContent: 'space-between' }}>
            <div className="stack-sm">
              <div className="row-between">
                <span className="tag badge-aman">{recipe.stage} bln</span>
                <span className="muted" style={{ fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Clock size={13} /> {recipe.prepMinutes} mnt
                </span>
              </div>
              <h4 style={{ fontSize: '1.02rem' }}>{recipe.title}</h4>
              <p className="muted" style={{ margin: 0, fontSize: '0.82rem' }}>
                {recipe.textureNote}
              </p>
              <div className="chip-group">
                {recipe.nutrition.map((n) => (
                  <span key={n} className={`tag ${NUTRITION_META[n].colorClass}`}>
                    {NUTRITION_META[n].short}
                  </span>
                ))}
              </div>
            </div>

            <div className="row-between" style={{ paddingTop: 10, borderTop: '1px solid var(--border)' }}>
              <button className="btn btn-sm btn-outline" onClick={() => setActiveRecipe(recipe)}>
                <BookOpen size={14} /> Lihat Resep
              </button>
              <div className="row-gap" style={{ gap: 4 }}>
                <button
                  className="btn btn-sm btn-primary"
                  onClick={() => onQuickLogRecipe(recipe)}
                  title="Catat ke Jurnal Hari Ini"
                >
                  <Utensils size={14} /> Catat
                </button>
                {recipe.isCustom && (
                  <button
                    className="btn btn-sm btn-danger-ghost"
                    onClick={() => onDeleteRecipe(recipe.id)}
                    title="Hapus resep kustom"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Detail Resep */}
      {activeRecipe && (
        <div className="modal-backdrop" onClick={() => setActiveRecipe(null)}>
          <div className="modal-card stack-md" onClick={(e) => e.stopPropagation()}>
            <div className="row-between">
              <div className="row-gap">
                <span className="tag badge-aman">{activeRecipe.stage} bln</span>
                <span className="muted">{activeRecipe.prepMinutes} menit</span>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setActiveRecipe(null)}>
                <X size={18} />
              </button>
            </div>
            <h3>{activeRecipe.title}</h3>
            <p className="muted" style={{ margin: 0 }}>
              {activeRecipe.textureNote}
            </p>

            <div className="stack-sm">
              <strong>Bahan-bahan:</strong>
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                {activeRecipe.ingredients.map((ing, i) => (
                  <li key={i} style={{ marginBottom: 4 }}>
                    {ing}
                  </li>
                ))}
              </ul>
            </div>

            <div className="stack-sm">
              <strong>Cara Membuat:</strong>
              <ol style={{ margin: 0, paddingLeft: 20 }}>
                {activeRecipe.steps.map((st, i) => (
                  <li key={i} style={{ marginBottom: 6 }}>
                    {st}
                  </li>
                ))}
              </ol>
            </div>

            <div className="row-between">
              <button className="btn btn-outline" onClick={() => setActiveRecipe(null)}>
                Tutup
              </button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  onQuickLogRecipe(activeRecipe);
                  setActiveRecipe(null);
                }}
              >
                <Utensils size={15} /> Catat ke Jurnal Hari Ini
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Tambah Resep Kustom */}
      {showAdd && (
        <div className="modal-backdrop" onClick={() => setShowAdd(false)}>
          <div className="modal-card stack-md" onClick={(e) => e.stopPropagation()}>
            <div className="row-between">
              <h3>Tambah Resep MPASI Baru</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowAdd(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="stack-md">
              <div className="field">
                <label>Nama Resep *</label>
                <input
                  className="input"
                  required
                  placeholder="Contoh: Bubur Udang Tofu & Labu Kuning"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="grid-2">
                <div className="field">
                  <label>Tahap Usia</label>
                  <select className="select" value={stage} onChange={(e) => setStage(e.target.value as AgeStage)}>
                    <option value="6-8">6–8 Bulan</option>
                    <option value="9-11">9–11 Bulan</option>
                    <option value="12+">12+ Bulan</option>
                  </select>
                </div>
                <div className="field">
                  <label>Estimasi Masak (menit)</label>
                  <input
                    type="number"
                    className="input"
                    min={5}
                    value={prepMinutes}
                    onChange={(e) => setPrepMinutes(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="field">
                <label>Unsur Gizi</label>
                <div className="chip-group">
                  {ALL_NUTRITION.map((tag) => (
                    <button
                      type="button"
                      key={tag}
                      className={`chip ${nutrition.includes(tag) ? 'selected' : ''}`}
                      onClick={() =>
                        setNutrition((prev) =>
                          prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
                        )
                      }
                    >
                      {NUTRITION_META[tag].label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="field">
                <label>Catatan Tekstur</label>
                <input
                  className="input"
                  placeholder="Saring halus / cincang kasar..."
                  value={textureNote}
                  onChange={(e) => setTextureNote(e.target.value)}
                />
              </div>

              <div className="field">
                <label>Bahan-bahan (satu per baris)</label>
                <textarea
                  className="textarea"
                  rows={3}
                  placeholder={'3 sdm nasi putih\n40 gr daging ayam\n1 sdt EVOO'}
                  value={ingredientsText}
                  onChange={(e) => setIngredientsText(e.target.value)}
                />
              </div>

              <div className="field">
                <label>Langkah Memasak (satu per baris)</label>
                <textarea
                  className="textarea"
                  rows={3}
                  placeholder={'Tumis bumbu hingga harum\nMasak hingga lembut'}
                  value={stepsText}
                  onChange={(e) => setStepsText(e.target.value)}
                />
              </div>

              <div className="row-between">
                <button type="button" className="btn btn-outline" onClick={() => setShowAdd(false)}>
                  Batal
                </button>
                <button type="submit" className="btn btn-primary">
                  Simpan Resep
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
