import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2, Eye, Plus, Search, Trash2, X } from 'lucide-react';
import { AllergyStatus, IngredientTrial } from '../types';
import { formatDateID, getTodayISO } from '../utils/mpasi';

interface AllergyTrackerViewProps {
  trials: IngredientTrial[];
  onAddTrial: (trial: Omit<IngredientTrial, 'id'>) => void;
  onUpdateStatus: (id: string, status: AllergyStatus) => void;
  onDeleteTrial: (id: string) => void;
}

const STATUS_META: Record<AllergyStatus, { label: string; badgeClass: string }> = {
  aman: { label: 'Aman', badgeClass: 'badge-aman' },
  pantau: { label: 'Pantau (3 Hari)', badgeClass: 'badge-pantau' },
  alergi: { label: 'Alergi / Sensitif', badgeClass: 'badge-alergi' },
};

export const AllergyTrackerView: React.FC<AllergyTrackerViewProps> = ({
  trials,
  onAddTrial,
  onUpdateStatus,
  onDeleteTrial,
}) => {
  const [filter, setFilter] = useState<'all' | AllergyStatus>('all');
  const [query, setQuery] = useState('');
  const [showAdd, setShowAdd] = useState(false);

  const [name, setName] = useState('');
  const [category, setCategory] = useState<IngredientTrial['category']>('Prohe');
  const [introducedDate, setIntroducedDate] = useState(getTodayISO());
  const [status, setStatus] = useState<AllergyStatus>('pantau');
  const [notes, setNotes] = useState('');

  const filtered = trials.filter((t) => {
    const matchFilter = filter === 'all' || t.status === filter;
    const q = query.trim().toLowerCase();
    const matchQuery = !q || t.name.toLowerCase().includes(q) || t.notes.toLowerCase().includes(q);
    return matchFilter && matchQuery;
  });

  const counts = {
    aman: trials.filter((t) => t.status === 'aman').length,
    pantau: trials.filter((t) => t.status === 'pantau').length,
    alergi: trials.filter((t) => t.status === 'alergi').length,
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAddTrial({
      name: name.trim(),
      category,
      introducedDate,
      status,
      notes: notes.trim() || 'Sedang dipantau reaksinya.',
    });
    setName('');
    setNotes('');
    setStatus('pantau');
    setShowAdd(false);
  };

  return (
    <div className="stack-md">
      <div className="card stack-md">
        <div className="row-between">
          <div>
            <h3>Tracker Bahan Baru & Alergi</h3>
            <p className="muted" style={{ margin: 0 }}>
              Catat bahan baru (aturan tunggu 2–3 hari untuk alergen utama seperti telur, ikan, seafood, kacang, susu).
            </p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
            <Plus size={16} /> Catat Bahan Baru
          </button>
        </div>

        <div className="row-between">
          <div className="chip-group">
            <button className={`chip ${filter === 'all' ? 'selected' : ''}`} onClick={() => setFilter('all')}>
              Semua ({trials.length})
            </button>
            <button className={`chip ${filter === 'aman' ? 'selected' : ''}`} onClick={() => setFilter('aman')}>
              Aman ({counts.aman})
            </button>
            <button className={`chip ${filter === 'pantau' ? 'selected' : ''}`} onClick={() => setFilter('pantau')}>
              Pantau ({counts.pantau})
            </button>
            <button className={`chip ${filter === 'alergi' ? 'selected' : ''}`} onClick={() => setFilter('alergi')}>
              Alergi ({counts.alergi})
            </button>
          </div>

          <div style={{ position: 'relative', minWidth: 230 }}>
            <Search
              size={16}
              style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }}
            />
            <input
              className="input"
              style={{ paddingLeft: 34 }}
              placeholder="Cari bahan makanan..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="grid-2">
        {filtered.map((trial) => (
          <div key={trial.id} className="card stack-sm">
            <div className="row-between">
              <div className="row-gap">
                <strong style={{ fontSize: '1rem' }}>{trial.name}</strong>
                <span className="tag" style={{ background: 'var(--surface-soft)', color: 'var(--text-muted)' }}>
                  {trial.category}
                </span>
              </div>
              <span className={`tag ${STATUS_META[trial.status].badgeClass}`}>
                {trial.status === 'aman' && <CheckCircle2 size={12} />}
                {trial.status === 'pantau' && <Eye size={12} />}
                {trial.status === 'alergi' && <AlertTriangle size={12} />}
                {STATUS_META[trial.status].label}
              </span>
            </div>

            <div className="muted" style={{ fontSize: '0.8rem' }}>
              Pertama dicoba: {formatDateID(trial.introducedDate)}
            </div>
            <p style={{ margin: 0, fontSize: '0.88rem' }}>{trial.notes}</p>

            <div className="row-between" style={{ paddingTop: 10, borderTop: '1px solid var(--border)' }}>
              <div className="row-gap" style={{ gap: 6 }}>
                <button
                  className={`btn btn-sm ${trial.status === 'aman' ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => onUpdateStatus(trial.id, 'aman')}
                >
                  Aman
                </button>
                <button
                  className={`btn btn-sm ${trial.status === 'pantau' ? 'btn-accent' : 'btn-outline'}`}
                  onClick={() => onUpdateStatus(trial.id, 'pantau')}
                >
                  Pantau
                </button>
                <button
                  className={`btn btn-sm ${trial.status === 'alergi' ? 'btn-accent' : 'btn-outline'}`}
                  style={trial.status === 'alergi' ? { background: 'var(--danger)' } : undefined}
                  onClick={() => onUpdateStatus(trial.id, 'alergi')}
                >
                  Alergi
                </button>
              </div>
              <button className="btn btn-danger-ghost btn-sm" onClick={() => onDeleteTrial(trial.id)}>
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showAdd && (
        <div className="modal-backdrop" onClick={() => setShowAdd(false)}>
          <div className="modal-card stack-md" onClick={(e) => e.stopPropagation()}>
            <div className="row-between">
              <h3>Catat Pengenalan Bahan Baru</h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowAdd(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="stack-md">
              <div className="field">
                <label>Nama Bahan Makanan *</label>
                <input
                  className="input"
                  required
                  placeholder="Contoh: Ikan Salmon, Kacang Merah, Strawberry"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="grid-2">
                <div className="field">
                  <label>Kategori</label>
                  <select
                    className="select"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as IngredientTrial['category'])}
                  >
                    <option value="Prohe">Protein Hewani</option>
                    <option value="Prona">Protein Nabati</option>
                    <option value="Karbo">Karbohidrat</option>
                    <option value="Sayur & Buah">Sayur & Buah</option>
                    <option value="Lemak & Lainnya">Lemak & Lainnya</option>
                  </select>
                </div>
                <div className="field">
                  <label>Tanggal Dicoba</label>
                  <input
                    type="date"
                    className="input"
                    value={introducedDate}
                    onChange={(e) => setIntroducedDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="field">
                <label>Status Awal</label>
                <select
                  className="select"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as AllergyStatus)}
                >
                  <option value="pantau">Pantau (Uji 3 Hari)</option>
                  <option value="aman">Aman</option>
                  <option value="alergi">Alergi / Sensitif</option>
                </select>
              </div>

              <div className="field">
                <label>Catatan Reaksi</label>
                <textarea
                  className="textarea"
                  rows={2}
                  placeholder="Misal: Tidak ada ruam di pipi, BAB normal..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <div className="row-between">
                <button type="button" className="btn btn-outline" onClick={() => setShowAdd(false)}>
                  Batal
                </button>
                <button type="submit" className="btn btn-primary">
                  Simpan Bahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
