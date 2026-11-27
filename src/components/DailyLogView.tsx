import React, { useState } from 'react';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Heart,
  Plus,
  Sparkles,
  Trash2,
  Utensils,
  X,
} from 'lucide-react';
import { BabyProfile, MealLog, MealSlot, NutritionTag, PortionResult, Recipe } from '../types';
import {
  calculateAgeInfo,
  formatDateID,
  getStageGuidance,
  getTodayISO,
  MEAL_SLOTS,
  NUTRITION_META,
  offsetDateISO,
  PORTION_META,
} from '../utils/mpasi';

interface DailyLogViewProps {
  profile: BabyProfile;
  logs: MealLog[];
  recipes: Recipe[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
  onAddLog: (log: Omit<MealLog, 'id'>) => void;
  onDeleteLog: (id: string) => void;
}

const ALL_NUTRITION: NutritionTag[] = ['karbo', 'prohe', 'prona', 'sayur_buah', 'lemak'];

export const DailyLogView: React.FC<DailyLogViewProps> = ({
  profile,
  logs,
  recipes,
  selectedDate,
  onSelectDate,
  onAddLog,
  onDeleteLog,
}) => {
  const [modalSlot, setModalSlot] = useState<MealSlot | null>(null);
  const [menuName, setMenuName] = useState('');
  const [texture, setTexture] = useState('');
  const [portion, setPortion] = useState<PortionResult>('habis');
  const [nutrition, setNutrition] = useState<NutritionTag[]>(['karbo', 'prohe', 'lemak']);
  const [reaction, setReaction] = useState('Aman, lahap');
  const [loved, setLoved] = useState(true);
  const [notes, setNotes] = useState('');

  const age = calculateAgeInfo(profile.birthDate);
  const guidance = getStageGuidance(age.stage);

  const dayLogs = logs.filter((l) => l.date === selectedDate);

  // Hitung kelengkapan 5 unsur gizi hari ini
  const coveredNutrition = new Set<NutritionTag>();
  dayLogs.forEach((l) => l.nutrition.forEach((n) => coveredNutrition.add(n)));
  const nutritionPct = Math.round((coveredNutrition.size / ALL_NUTRITION.length) * 100);

  const openModalForSlot = (slot: MealSlot) => {
    setModalSlot(slot);
    setMenuName('');
    setTexture(guidance.texture.split(',')[0]);
    setPortion('habis');
    setNutrition(['karbo', 'prohe', 'sayur_buah', 'lemak']);
    setReaction('Aman, tidak ada ruam');
    setLoved(true);
    setNotes('');
  };

  const toggleNutrition = (tag: NutritionTag) => {
    setNutrition((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const applyRecipe = (recipe: Recipe) => {
    setMenuName(recipe.title);
    setNutrition(recipe.nutrition);
    setTexture(recipe.textureNote);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalSlot || !menuName.trim()) return;
    onAddLog({
      date: selectedDate,
      slot: modalSlot,
      menuName: menuName.trim(),
      texture: texture.trim() || guidance.texture,
      portion,
      nutrition,
      reaction: reaction.trim() || 'Aman',
      loved,
      notes: notes.trim() || undefined,
    });
    setModalSlot(null);
  };

  const todayISO = getTodayISO();

  return (
    <div className="stack-lg">
      {/* Banner Tahap Usia Marley */}
      <div className="stage-banner">
        <div className="row-between">
          <div className="stack-sm" style={{ gap: 4 }}>
            <div className="row-gap">
              <Sparkles size={18} color="#3b7a57" />
              <strong>{guidance.title}</strong>
              <span className="tag badge-aman">{age.label}</span>
            </div>
            <p style={{ margin: 0, fontSize: '0.9rem' }}>
              <strong>Tekstur:</strong> {guidance.texture} &bull; <strong>Porsi:</strong> {guidance.portion}
            </p>
            <p className="muted" style={{ margin: 0 }}>
              {guidance.tip}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>BB / TB Terkini</div>
            <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--primary)' }}>
              {profile.weightKg} kg &bull; {profile.heightCm} cm
            </div>
          </div>
        </div>
      </div>

      {/* Kontrol Tanggal & Ringkasan Gizi Harian */}
      <div className="grid-2">
        <div className="card stack-sm">
          <div className="row-between">
            <span className="muted" style={{ fontWeight: 600 }}>
              <Calendar size={15} style={{ verticalAlign: '-2px', marginRight: 6 }} />
              Tanggal Jurnal
            </span>
            {selectedDate !== todayISO && (
              <button className="btn btn-sm btn-outline" onClick={() => onSelectDate(todayISO)}>
                Ke Hari Ini
              </button>
            )}
          </div>
          <div className="row-between">
            <button
              className="btn btn-outline btn-sm"
              onClick={() => onSelectDate(offsetDateISO(selectedDate, -1))}
              aria-label="Hari sebelumnya"
            >
              <ChevronLeft size={16} />
            </button>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 700, fontSize: '1rem' }}>{formatDateID(selectedDate)}</div>
              <input
                type="date"
                className="input"
                style={{ marginTop: 6, padding: '4px 8px', fontSize: '0.8rem', width: 'auto' }}
                value={selectedDate}
                onChange={(e) => e.target.value && onSelectDate(e.target.value)}
              />
            </div>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => onSelectDate(offsetDateISO(selectedDate, 1))}
              aria-label="Hari berikutnya"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div className="card stack-sm">
          <div className="row-between">
            <span style={{ fontWeight: 700 }}>Kelengkapan Gizi Harian</span>
            <span style={{ fontWeight: 700, color: 'var(--primary)' }}>
              {coveredNutrition.size}/5 Unsur ({nutritionPct}%)
            </span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${nutritionPct}%` }} />
          </div>
          <div className="chip-group">
            {ALL_NUTRITION.map((tag) => {
              const active = coveredNutrition.has(tag);
              return (
                <span
                  key={tag}
                  className={`tag ${active ? NUTRITION_META[tag].colorClass : ''}`}
                  style={!active ? { background: 'var(--surface-soft)', color: 'var(--text-muted)' } : undefined}
                >
                  {active ? '✓ ' : '○ '}
                  {NUTRITION_META[tag].short}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* Daftar Slot Makan */}
      <div className="card stack-md">
        <div className="row-between">
          <div>
            <h3>Catatan Makan {profile.name}</h3>
            <p className="muted" style={{ margin: 0 }}>
              {dayLogs.length} kali makan tercatat pada tanggal ini
            </p>
          </div>
        </div>

        <div className="stack-sm">
          {MEAL_SLOTS.map((slot) => {
            const slotLogs = dayLogs.filter((l) => l.slot === slot.key);
            return (
              <div key={slot.key} className={slotLogs.length > 0 ? 'slot-card' : 'slot-empty'}>
                <div className="row-between">
                  <div>
                    <div className="row-gap">
                      <strong>{slot.label}</strong>
                      <span className="muted" style={{ fontSize: '0.78rem' }}>
                        ({slot.timeHint})
                      </span>
                    </div>
                  </div>
                  <button className="btn btn-sm btn-outline" onClick={() => openModalForSlot(slot.key)}>
                    <Plus size={14} /> Catat
                  </button>
                </div>

                {slotLogs.length > 0 && (
                  <div className="stack-sm" style={{ marginTop: 12 }}>
                    {slotLogs.map((item) => (
                      <div
                        key={item.id}
                        style={{
                          background: 'var(--bg)',
                          borderRadius: 'var(--radius-sm)',
                          padding: '12px 14px',
                          border: '1px solid var(--border)',
                        }}
                      >
                        <div className="row-between">
                          <div className="row-gap">
                            <Utensils size={15} color="#3b7a57" />
                            <strong style={{ fontSize: '0.95rem' }}>{item.menuName}</strong>
                            {item.loved && (
                              <span className="tag badge-aman" title="Marley suka menu ini">
                                <Heart size={12} fill="#166534" /> Suka
                              </span>
                            )}
                          </div>
                          <button
                            className="btn btn-danger-ghost btn-sm"
                            onClick={() => onDeleteLog(item.id)}
                            title="Hapus catatan"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>

                        <div className="row-gap" style={{ marginTop: 8, fontSize: '0.82rem' }}>
                          <span className="tag" style={{ background: '#e5e7eb', color: '#374151' }}>
                            Porsi: {PORTION_META[item.portion].label}
                          </span>
                          <span className="tag" style={{ background: '#f3efe6', color: '#4b5563' }}>
                            Tekstur: {item.texture}
                          </span>
                          <span className="muted">Reaksi: {item.reaction}</span>
                        </div>

                        {item.nutrition.length > 0 && (
                          <div className="chip-group" style={{ marginTop: 8 }}>
                            {item.nutrition.map((n) => (
                              <span key={n} className={`tag ${NUTRITION_META[n].colorClass}`}>
                                {NUTRITION_META[n].short}
                              </span>
                            ))}
                          </div>
                        )}

                        {item.notes && (
                          <p className="muted" style={{ margin: '8px 0 0', fontSize: '0.82rem' }}>
                            Catatan: {item.notes}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal Tambah Catatan Makan */}
      {modalSlot && (
        <div className="modal-backdrop" onClick={() => setModalSlot(null)}>
          <div className="modal-card stack-md" onClick={(e) => e.stopPropagation()}>
            <div className="row-between">
              <h3>
                Catat {MEAL_SLOTS.find((s) => s.key === modalSlot)?.label} ({profile.name})
              </h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setModalSlot(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="field">
              <label>Isi Cepat dari Bank Resep (Opsional)</label>
              <select
                className="select"
                defaultValue=""
                onChange={(e) => {
                  const found = recipes.find((r) => r.id === e.target.value);
                  if (found) applyRecipe(found);
                }}
              >
                <option value="" disabled>
                  -- Pilih resep untuk isi otomatis --
                </option>
                {recipes.map((r) => (
                  <option key={r.id} value={r.id}>
                    [{r.stage} bln] {r.title}
                  </option>
                ))}
              </select>
            </div>

            <form onSubmit={handleSubmit} className="stack-md">
              <div className="field">
                <label>Nama Menu *</label>
                <input
                  className="input"
                  required
                  placeholder="Contoh: Bubur Hati Ayam & Wortel"
                  value={menuName}
                  onChange={(e) => setMenuName(e.target.value)}
                />
              </div>

              <div className="grid-2">
                <div className="field">
                  <label>Tekstur</label>
                  <input
                    className="input"
                    placeholder="Saring / Cincang halus / Finger food"
                    value={texture}
                    onChange={(e) => setTexture(e.target.value)}
                  />
                </div>
                <div className="field">
                  <label>Porsi Habis</label>
                  <select
                    className="select"
                    value={portion}
                    onChange={(e) => setPortion(e.target.value as PortionResult)}
                  >
                    {Object.entries(PORTION_META).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="field">
                <label>Unsur Gizi (4 Bintang + Lemak)</label>
                <div className="chip-group">
                  {ALL_NUTRITION.map((tag) => (
                    <button
                      type="button"
                      key={tag}
                      className={`chip ${nutrition.includes(tag) ? 'selected' : ''}`}
                      onClick={() => toggleNutrition(tag)}
                    >
                      {NUTRITION_META[tag].label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid-2">
                <div className="field">
                  <label>Reaksi / Respon</label>
                  <input
                    className="input"
                    placeholder="Lahap, aman, tidak ruam"
                    value={reaction}
                    onChange={(e) => setReaction(e.target.value)}
                  />
                </div>
                <div className="field">
                  <label>Favorit Marley?</label>
                  <button
                    type="button"
                    className={`btn ${loved ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setLoved(!loved)}
                  >
                    <Heart size={15} fill={loved ? '#fff' : 'none'} />
                    {loved ? 'Ya, Marley Suka!' : 'Biasa Saja'}
                  </button>
                </div>
              </div>

              <div className="field">
                <label>Catatan Tambahan</label>
                <textarea
                  className="textarea"
                  rows={2}
                  placeholder="Misal: ditambah keju belcube, dimakan sambil duduk tegak..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <div className="row-between">
                <button type="button" className="btn btn-outline" onClick={() => setModalSlot(null)}>
                  Batal
                </button>
                <button type="submit" className="btn btn-primary">
                  Simpan Catatan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
