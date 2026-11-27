import React, { useState } from 'react';
import { CheckSquare, Plus, ShoppingBag, Square, Trash2, X } from 'lucide-react';
import { DayKey, MealSlot, Recipe, ShoppingItem, WeeklyPlan } from '../types';
import { DAYS_OF_WEEK, MEAL_SLOTS } from '../utils/mpasi';

interface WeeklyPlannerViewProps {
  weeklyPlan: WeeklyPlan;
  recipes: Recipe[];
  shoppingList: ShoppingItem[];
  onUpdateSlot: (day: DayKey, slot: MealSlot, menuName: string, recipeId?: string) => void;
  onClearSlot: (day: DayKey, slot: MealSlot) => void;
  onAddShoppingItem: (name: string) => void;
  onToggleShoppingItem: (id: string) => void;
  onDeleteShoppingItem: (id: string) => void;
  onGenerateShoppingFromPlan: () => void;
}

export const WeeklyPlannerView: React.FC<WeeklyPlannerViewProps> = ({
  weeklyPlan,
  recipes,
  shoppingList,
  onUpdateSlot,
  onClearSlot,
  onAddShoppingItem,
  onToggleShoppingItem,
  onDeleteShoppingItem,
  onGenerateShoppingFromPlan,
}) => {
  const [selectedDay, setSelectedDay] = useState<DayKey>('senin');
  const [editingSlot, setEditingSlot] = useState<MealSlot | null>(null);
  const [customMenu, setCustomMenu] = useState('');
  const [pickedRecipeId, setPickedRecipeId] = useState<string>('');
  const [newShopItem, setNewShopItem] = useState('');

  const openEdit = (slot: MealSlot) => {
    const existing = weeklyPlan[selectedDay]?.[slot];
    setEditingSlot(slot);
    setCustomMenu(existing?.menuName ?? '');
    setPickedRecipeId(existing?.recipeId ?? '');
  };

  const handleSaveSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSlot || !customMenu.trim()) return;
    onUpdateSlot(selectedDay, editingSlot, customMenu.trim(), pickedRecipeId || undefined);
    setEditingSlot(null);
  };

  const handleAddShop = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newShopItem.trim()) return;
    onAddShoppingItem(newShopItem.trim());
    setNewShopItem('');
  };

  const dayPlan = weeklyPlan[selectedDay] ?? {};

  return (
    <div className="grid-2" style={{ alignItems: 'start' }}>
      {/* Kolom Kiri: Jadwal Menu Mingguan */}
      <div className="card stack-md">
        <div>
          <h3>Jadwal Menu Mingguan</h3>
          <p className="muted" style={{ margin: 0 }}>
            Rencanakan menu Marley agar belanja & masak lebih tenang.
          </p>
        </div>

        <div className="chip-group">
          {DAYS_OF_WEEK.map((d) => {
            const count = Object.keys(weeklyPlan[d.key] ?? {}).length;
            return (
              <button
                key={d.key}
                className={`chip ${selectedDay === d.key ? 'selected' : ''}`}
                onClick={() => setSelectedDay(d.key)}
              >
                {d.label} {count > 0 ? `(${count})` : ''}
              </button>
            );
          })}
        </div>

        <div className="stack-sm">
          {MEAL_SLOTS.map((slot) => {
            const entry = dayPlan[slot.key];
            return (
              <div key={slot.key} className={entry ? 'slot-card' : 'slot-empty'}>
                <div className="row-between">
                  <div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                      {slot.label} ({slot.timeHint})
                    </div>
                    <div style={{ fontWeight: 600, marginTop: 2 }}>
                      {entry ? entry.menuName : <span className="muted">Belum dijadwalkan</span>}
                    </div>
                  </div>
                  <div className="row-gap" style={{ gap: 4 }}>
                    <button className="btn btn-sm btn-outline" onClick={() => openEdit(slot.key)}>
                      {entry ? 'Ubah' : '+ Pilih'}
                    </button>
                    {entry && (
                      <button
                        className="btn btn-sm btn-danger-ghost"
                        onClick={() => onClearSlot(selectedDay, slot.key)}
                        title="Hapus dari jadwal"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Kolom Kanan: Daftar Belanja Lokal */}
      <div className="card stack-md">
        <div className="row-between">
          <div>
            <h3>Daftar Belanja MPASI</h3>
            <p className="muted" style={{ margin: 0 }}>
              Tersimpan otomatis di perangkat ini.
            </p>
          </div>
          <button
            className="btn btn-sm btn-outline"
            onClick={onGenerateShoppingFromPlan}
            title="Tambahkan bahan dari resep yang ada di jadwal mingguan"
          >
            <ShoppingBag size={14} /> Tarik dari Jadwal
          </button>
        </div>

        <form onSubmit={handleAddShop} className="row-gap" style={{ flexWrap: 'nowrap' }}>
          <input
            className="input"
            placeholder="Tambah bahan (misal: Telur puyuh, labu kuning)..."
            value={newShopItem}
            onChange={(e) => setNewShopItem(e.target.value)}
          />
          <button type="submit" className="btn btn-primary">
            <Plus size={16} />
          </button>
        </form>

        <div className="stack-sm">
          {shoppingList.length === 0 ? (
            <p className="muted" style={{ textAlign: 'center', padding: '16px 0' }}>
              Daftar belanja masih kosong.
            </p>
          ) : (
            shoppingList.map((item) => (
              <div
                key={item.id}
                className="row-between"
                style={{
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)',
                  background: item.checked ? 'var(--surface-soft)' : 'var(--surface)',
                }}
              >
                <button
                  type="button"
                  onClick={() => onToggleShoppingItem(item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    color: item.checked ? 'var(--text-muted)' : 'var(--text)',
                    textDecoration: item.checked ? 'line-through' : 'none',
                    fontWeight: 500,
                    flex: 1,
                  }}
                >
                  {item.checked ? (
                    <CheckSquare size={18} color="#3b7a57" />
                  ) : (
                    <Square size={18} color="#6b7280" />
                  )}
                  <span>{item.name}</span>
                </button>
                <button
                  className="btn btn-danger-ghost btn-sm"
                  onClick={() => onDeleteShoppingItem(item.id)}
                  aria-label="Hapus item belanja"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal Pilih Menu Jadwal */}
      {editingSlot && (
        <div className="modal-backdrop" onClick={() => setEditingSlot(null)}>
          <div className="modal-card stack-md" onClick={(e) => e.stopPropagation()}>
            <div className="row-between">
              <h3>
                Menu {DAYS_OF_WEEK.find((d) => d.key === selectedDay)?.label} —{' '}
                {MEAL_SLOTS.find((s) => s.key === editingSlot)?.label}
              </h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setEditingSlot(null)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveSlot} className="stack-md">
              <div className="field">
                <label>Pilih dari Bank Resep</label>
                <select
                  className="select"
                  value={pickedRecipeId}
                  onChange={(e) => {
                    const id = e.target.value;
                    setPickedRecipeId(id);
                    const rec = recipes.find((r) => r.id === id);
                    if (rec) setCustomMenu(rec.title);
                  }}
                >
                  <option value="">-- Menu kustom / tulis manual --</option>
                  {recipes.map((r) => (
                    <option key={r.id} value={r.id}>
                      [{r.stage} bln] {r.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label>Nama Menu *</label>
                <input
                  className="input"
                  required
                  placeholder="Tulis nama menu MPASI..."
                  value={customMenu}
                  onChange={(e) => {
                    setCustomMenu(e.target.value);
                    if (pickedRecipeId) setPickedRecipeId('');
                  }}
                />
              </div>

              <div className="row-between">
                <button type="button" className="btn btn-outline" onClick={() => setEditingSlot(null)}>
                  Batal
                </button>
                <button type="submit" className="btn btn-primary">
                  Simpan ke Jadwal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
