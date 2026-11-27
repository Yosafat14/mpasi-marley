import React, { useRef, useState } from 'react';
import { Download, RotateCcw, Save, Upload } from 'lucide-react';
import { BabyProfile, MpasiStore } from '../types';
import { calculateAgeInfo, getStageGuidance } from '../utils/mpasi';
import { exportStoreJSON } from '../utils/storage';

interface ProfileDataViewProps {
  store: MpasiStore;
  onUpdateProfile: (profile: BabyProfile) => void;
  onImportStore: (newStore: MpasiStore) => void;
  onResetStore: () => void;
}

export const ProfileDataView: React.FC<ProfileDataViewProps> = ({
  store,
  onUpdateProfile,
  onImportStore,
  onResetStore,
}) => {
  const [form, setForm] = useState<BabyProfile>(store.profile);
  const [savedMsg, setSavedMsg] = useState('');
  const [dataMsg, setDataMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const age = calculateAgeInfo(form.birthDate);
  const guidance = getStageGuidance(age.stage);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(form);
    setSavedMsg(`Profil ${form.name} tersimpan dan tersinkronisasi ke cloud!`);
    setTimeout(() => setSavedMsg(''), 3000);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as MpasiStore;
        if (!parsed.profile || !Array.isArray(parsed.logs)) {
          setDataMsg('Format file JSON tidak valid.');
          return;
        }
        onImportStore(parsed);
        setForm(parsed.profile);
        setDataMsg('Backup berhasil dipulihkan!');
      } catch {
        setDataMsg('Gagal membaca file JSON.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="grid-2" style={{ alignItems: 'start' }}>
      {/* Profil Marley */}
      <div className="card stack-md">
        <div>
          <h3>Profil Si Kecil</h3>
          <p className="muted" style={{ margin: 0 }}>
            Usia dan panduan tekstur MPASI akan otomatis menyesuaikan tanggal lahir.
          </p>
        </div>

        <form onSubmit={handleSave} className="stack-md">
          <div className="field">
            <label>Nama Anak</label>
            <input
              className="input"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div className="field">
            <label>Tanggal Lahir ({age.label})</label>
            <input
              type="date"
              className="input"
              required
              value={form.birthDate}
              onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
            />
          </div>

          <div className="grid-2">
            <div className="field">
              <label>Berat Badan (kg)</label>
              <input
                type="number"
                step="0.1"
                className="input"
                value={form.weightKg}
                onChange={(e) => setForm({ ...form, weightKg: Number(e.target.value) })}
              />
            </div>
            <div className="field">
              <label>Tinggi Badan (cm)</label>
              <input
                type="number"
                step="0.1"
                className="input"
                value={form.heightCm}
                onChange={(e) => setForm({ ...form, heightCm: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="field">
            <label>Catatan Kebiasaan Makan</label>
            <textarea
              className="textarea"
              rows={3}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>

          <div className="row-between">
            <span style={{ color: 'var(--primary)', fontSize: '0.85rem', fontWeight: 600 }}>{savedMsg}</span>
            <button type="submit" className="btn btn-primary">
              <Save size={15} /> Simpan Profil
            </button>
          </div>
        </form>
      </div>

      {/* Panduan Tekstur & Backup Lokal */}
      <div className="stack-md">
        <div className="card-soft stack-sm">
          <h4>Panduan Tahap Saat Ini: {guidance.title}</h4>
          <p style={{ margin: 0, fontSize: '0.88rem' }}>
            <strong>Tekstur:</strong> {guidance.texture}
          </p>
          <p style={{ margin: 0, fontSize: '0.88rem' }}>
            <strong>Frekuensi:</strong> {guidance.frequency}
          </p>
          <p style={{ margin: 0, fontSize: '0.88rem' }}>
            <strong>Porsi:</strong> {guidance.portion}
          </p>
          <p className="muted" style={{ margin: 0 }}>
            {guidance.tip}
          </p>
        </div>

        <div className="card stack-md">
          <div>
            <h3>Penyimpanan Cloud Supabase & Cadangan</h3>
            <p className="muted" style={{ margin: 0 }}>
              Semua data makan dan tumbuh kembang {store.profile.name} otomatis tersinkronisasi ke akun keluarga Anda di cloud Supabase. Anda dan pasangan dapat mengaksesnya bersamaan.
            </p>
          </div>

          <div className="stack-sm">
            <button className="btn btn-outline" onClick={() => exportStoreJSON(store)}>
              <Download size={16} /> Export Backup (.json)
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="application/json"
              style={{ display: 'none' }}
              onChange={handleImportFile}
            />
            <button className="btn btn-outline" onClick={() => fileInputRef.current?.click()}>
              <Upload size={16} /> Import / Pulihkan Backup (.json)
            </button>

            <button
              className="btn btn-danger-ghost"
              style={{ justifyContent: 'flex-start' }}
              onClick={() => {
                if (window.confirm('Yakin ingin mereset semua data ke contoh awal?')) {
                  onResetStore();
                  setDataMsg('Data berhasil direset ke contoh awal.');
                }
              }}
            >
              <RotateCcw size={16} /> Reset ke Data Contoh Awal
            </button>
          </div>

          {dataMsg && (
            <div style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.85rem' }}>{dataMsg}</div>
          )}
        </div>
      </div>
    </div>
  );
};
