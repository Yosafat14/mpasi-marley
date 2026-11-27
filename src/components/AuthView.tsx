import React, { useEffect, useState } from 'react';
import { AlertCircle, Baby, CheckCircle, HeartHandshake, Lock, Mail, RefreshCw, Sparkles, User } from 'lucide-react';
import { supabase } from '../supabaseClient';

interface AuthViewProps {
  onAuthSuccess: (userId: string, initialBabyName?: string) => void;
}

/** Baca error/info dari URL hash yang dikirim balik oleh Supabase */
function parseHashError(): { errorCode: string; errorDescription: string } | null {
  const hash = window.location.hash.slice(1); // hapus '#'
  if (!hash) return null;
  const params = new URLSearchParams(hash);
  const errorCode = params.get('error_code') || '';
  const errorDescription = params.get('error_description') || '';
  if (errorCode || errorDescription) {
    // Bersihkan hash dari URL setelah dibaca
    window.history.replaceState(null, '', window.location.pathname + window.location.search);
    return { errorCode, errorDescription };
  }
  return null;
}

export const AuthView: React.FC<AuthViewProps> = ({ onAuthSuccess }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [babyName, setBabyName] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');
  const [showResend, setShowResend] = useState(false);

  // Deteksi error dari URL hash saat komponen pertama kali di-mount
  useEffect(() => {
    const hashError = parseHashError();
    if (hashError) {
      const { errorCode, errorDescription } = hashError;
      if (errorCode === 'otp_expired' || errorDescription.toLowerCase().includes('expired')) {
        setErrorMsg(
          'Link verifikasi email sudah kadaluarsa. Silakan masukkan email Anda lalu klik "Kirim Ulang Email Verifikasi" di bawah, atau langsung coba Login jika akun sudah aktif.'
        );
        setShowResend(true);
      } else if (errorCode === 'access_denied') {
        setErrorMsg('Akses ditolak: ' + errorDescription.replace(/\+/g, ' '));
      } else {
        setErrorMsg(errorDescription.replace(/\+/g, ' ') || 'Terjadi kesalahan autentikasi.');
      }
    }
  }, []);

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
          setInfoMsg(
            `Pendaftaran berhasil! Cek kotak masuk email ${email.trim()} untuk link verifikasi, lalu kembali ke sini dan klik "Masuk".`
          );
          setShowResend(true);
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
      if (message.includes('Invalid login credentials')) {
        setErrorMsg('Email atau kata sandi tidak cocok. Silakan periksa kembali.');
      } else if (message.includes('User already registered')) {
        setErrorMsg('Email ini sudah terdaftar. Silakan pilih "Masuk" dengan akun yang sama.');
        setShowResend(false);
      } else if (message.includes('Email not confirmed')) {
        setErrorMsg('Email belum dikonfirmasi. Silakan kirim ulang link verifikasi di bawah.');
        setShowResend(true);
      } else if (message.includes('Password should be at least')) {
        setErrorMsg('Kata sandi minimal harus 6 karakter.');
      } else {
        setErrorMsg(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!email.trim()) {
      setErrorMsg('Isi dulu Email Keluarga di kolom di atas, lalu klik tombol ini.');
      return;
    }
    setResendLoading(true);
    setErrorMsg('');
    setInfoMsg('');
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email.trim(),
      });
      if (error) throw error;
      setInfoMsg(`Link verifikasi baru telah dikirim ke ${email.trim()}. Cek kotak masuk (dan folder Spam).`);
      setShowResend(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal mengirim ulang email.';
      setErrorMsg('Gagal kirim ulang: ' + message);
    } finally {
      setResendLoading(false);
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
              setShowResend(false);
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
              setShowResend(false);
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

        {/* Pesan Error */}
        {errorMsg && (
          <div
            style={{
              background: 'var(--danger-soft)',
              color: 'var(--danger)',
              padding: '10px 12px',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '14px',
              fontSize: '0.84rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px',
            }}
          >
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Pesan Info / Sukses */}
        {infoMsg && (
          <div
            style={{
              background: '#ecfdf5',
              color: '#065f46',
              padding: '10px 12px',
              borderRadius: 'var(--radius-sm)',
              marginBottom: '14px',
              fontSize: '0.84rem',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px',
            }}
          >
            <CheckCircle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
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
            style={{ width: '100%', padding: '12px', fontSize: '0.95rem', marginTop: '4px' }}
          >
            {loading ? (
              'Sedang Memproses...'
            ) : isRegister ? (
              <><Sparkles size={16} /> Daftar Akun Keluarga</>
            ) : (
              'Masuk ke HapHapNyam'
            )}
          </button>
        </form>

        {/* Tombol Kirim Ulang Verifikasi — tampil saat link expired */}
        {showResend && (
          <div
            style={{
              marginTop: '14px',
              padding: '14px',
              background: 'var(--warning-soft)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(217, 119, 6, 0.2)',
            }}
          >
            <p style={{ margin: '0 0 10px', fontSize: '0.83rem', color: '#92400e', fontWeight: 600 }}>
              Butuh link verifikasi baru?
            </p>
            <p style={{ margin: '0 0 10px', fontSize: '0.8rem', color: '#78350f' }}>
              Isi email di kolom di atas, lalu klik tombol di bawah. Link baru akan dikirim ke kotak masuk Anda.
            </p>
            <button
              type="button"
              onClick={handleResendVerification}
              disabled={resendLoading}
              className="btn btn-outline"
              style={{
                width: '100%',
                borderColor: '#d97706',
                color: '#92400e',
                fontSize: '0.88rem',
                gap: '8px',
              }}
            >
              <RefreshCw size={14} style={resendLoading ? { animation: 'spin 1s linear infinite' } : undefined} />
              {resendLoading ? 'Mengirim...' : 'Kirim Ulang Email Verifikasi'}
            </button>
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          HapHapNyam • Tersinkronisasi Aman di Cloud Supabase
        </div>
      </div>
    </div>
  );
};
