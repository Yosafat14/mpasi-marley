import React, { useState } from 'react';
import { AlertCircle, Baby, CheckCircle, HeartHandshake, Lock, Mail, Sparkles, User } from 'lucide-react';
import { supabase } from '../supabaseClient';

interface AuthViewProps {
  onAuthSuccess: (userId: string, initialBabyName?: string) => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onAuthSuccess }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [babyName, setBabyName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');
    setLoading(true);

    try {
      if (isRegister) {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              baby_name: babyName.trim() || 'Si Kecil',
            },
          },
        });

        if (error) throw error;

        if (data.session?.user) {
          onAuthSuccess(data.session.user.id, babyName.trim() || undefined);
        } else if (data.user) {
          // Jika konfirmasi email diaktifkan di Supabase
          setInfoMsg(
            'Pendaftaran berhasil! Jika konfirmasi email aktif di project Anda, silakan cek kotak masuk email untuk verifikasi, lalu masuk.'
          );
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) throw error;

        if (data.user) {
          onAuthSuccess(data.user.id);
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Terjadi kendala saat menghubungkan ke akun.';
      // Terjemahkan error umum Supabase ke Bahasa Indonesia ramah pengguna
      if (message.includes('Invalid login credentials')) {
        setErrorMsg('Email atau kata sandi tidak cocok. Silakan periksa kembali.');
      } else if (message.includes('User already registered')) {
        setErrorMsg('Email ini sudah terdaftar. Silakan pilih "Masuk" dengan akun ini.');
      } else if (message.includes('Password should be at least')) {
        setErrorMsg('Kata sandi minimal harus 6 karakter.');
      } else {
        setErrorMsg(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f7f3ea 0%, #edf6f0 50%, #fdf5f2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
      }}
    >
      <div
        className="card"
        style={{
          maxWidth: '460px',
          width: '100%',
          padding: '32px 28px',
          boxShadow: '0 12px 36px rgba(59, 122, 87, 0.12)',
          border: '1px solid #e5dfd2',
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              margin: '0 auto 14px',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, var(--primary) 0%, #529971 100%)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 20px rgba(59, 122, 87, 0.3)',
            }}
          >
            <Baby size={34} />
          </div>
          <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text)' }}>HapHapNyam</h2>
          <p className="muted" style={{ margin: '4px 0 0', fontSize: '0.9rem' }}>
            Jurnal & Perencana MPASI Keluarga
          </p>
        </div>

        {/* Info Box: 1 Keluarga 1 Akses */}
        <div
          style={{
            background: 'var(--primary-soft)',
            border: '1px solid rgba(59, 122, 87, 0.2)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 14px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
            fontSize: '0.82rem',
            color: '#22543d',
          }}
        >
          <HeartHandshake size={20} style={{ flexShrink: 0, marginTop: 2, color: 'var(--primary)' }} />
          <span>
            <strong>Satu Akun untuk Sekeluarga:</strong> Ayah dan Ibu cukup gunakan email & kata sandi yang sama di
            perangkat masing-masing agar data makan si kecil selalu tersinkronisasi otomatis.
          </span>
        </div>

        {/* Tab Toggle: Masuk vs Daftar */}
        <div
          style={{
            display: 'flex',
            background: 'var(--surface-soft)',
            borderRadius: '999px',
            padding: '4px',
            marginBottom: '20px',
          }}
        >
          <button
            type="button"
            onClick={() => {
              setIsRegister(false);
              setErrorMsg('');
              setInfoMsg('');
            }}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: '999px',
              border: 'none',
              background: !isRegister ? 'var(--surface)' : 'transparent',
              color: !isRegister ? 'var(--primary)' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: 'pointer',
              boxShadow: !isRegister ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            Masuk
          </button>
          <button
            type="button"
            onClick={() => {
              setIsRegister(true);
              setErrorMsg('');
              setInfoMsg('');
            }}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: '999px',
              border: 'none',
              background: isRegister ? 'var(--surface)' : 'transparent',
              color: isRegister ? 'var(--primary)' : 'var(--text-muted)',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: 'pointer',
              boxShadow: isRegister ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            Daftar Akun Baru
          </button>
        </div>

        {errorMsg && (
          <div
            style={{
              background: 'var(--danger-soft)',
              color: 'var(--danger)',
              padding: '10px 12px',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '16px',
              fontSize: '0.84rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {infoMsg && (
          <div
            style={{
              background: '#ecfdf5',
              color: '#065f46',
              padding: '10px 12px',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '16px',
              fontSize: '0.84rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <CheckCircle size={16} style={{ flexShrink: 0 }} />
            <span>{infoMsg}</span>
          </div>
        )}

        {/* Form Auth */}
        <form onSubmit={handleSubmit} className="stack-md">
          {isRegister && (
            <div className="field">
              <label>Nama Si Kecil</label>
              <div style={{ position: 'relative' }}>
                <User
                  size={16}
                  style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}
                />
                <input
                  className="input"
                  style={{ paddingLeft: '38px' }}
                  placeholder="Contoh: Marley"
                  value={babyName}
                  onChange={(e) => setBabyName(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="field">
            <label>Email Keluarga *</label>
            <div style={{ position: 'relative' }}>
              <Mail
                size={16}
                style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}
              />
              <input
                type="email"
                required
                className="input"
                style={{ paddingLeft: '38px' }}
                placeholder="keluarga@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="field">
            <label>Kata Sandi *</label>
            <div style={{ position: 'relative' }}>
              <Lock
                size={16}
                style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}
              />
              <input
                type="password"
                required
                minLength={6}
                className="input"
                style={{ paddingLeft: '38px' }}
                placeholder="Minimal 6 karakter"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', fontSize: '0.95rem', marginTop: '6px' }}
          >
            {loading ? (
              'Sedang Memproses...'
            ) : isRegister ? (
              <>
                <Sparkles size={16} /> Daftar Akun Keluarga
              </>
            ) : (
              'Masuk ke HapHapNyam'
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          HapHapNyam • Tersinkronisasi Aman di Cloud Supabase
        </div>
      </div>
    </div>
  );
};
