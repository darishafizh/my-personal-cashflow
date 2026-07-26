'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function GatePage() {
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode.trim()) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: passcode }),
      });

      const data = await res.json();

      if (res.ok) {
        setUnlocked(true);
        setTimeout(() => router.push('/'), 600);
      } else {
        setError(data.error || 'Passcode salah');
        setPasscode('');
      }
    } catch {
      setError('Gagal terhubung ke server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh flex items-center justify-center p-4">
      <div className={`w-full max-w-sm transition-all duration-500 ${unlocked ? 'scale-95 opacity-0' : 'animate-scale-in'}`}>
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3 animate-bounce-in">💰</div>
          <h1 className="text-3xl font-extrabold gradient-text mb-1">CashFlow</h1>
          <p className="text-text-secondary text-sm">Masukkan passcode untuk melanjutkan</p>
        </div>

        {/* Card */}
        <div className="glass p-6">
          <form onSubmit={handleSubmit}>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              🔐 Passcode
            </label>
            <input
              type="password"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              className="input-dark text-center text-lg tracking-widest mb-4"
              placeholder="• • • • • •"
              autoFocus
              disabled={loading}
              id="gate-passcode-input"
            />

            {error && (
              <div className="text-danger text-sm text-center mb-4 animate-fade-in">
                ⚠️ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !passcode.trim()}
              className="w-full btn-gradient-primary py-3 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              id="gate-submit-button"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                  Memverifikasi...
                </span>
              ) : (
                'Masuk 🚀'
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-text-muted text-xs text-center mt-6">
          Single-user app • Data terproteksi
        </p>
      </div>

      {/* Unlock animation overlay */}
      {unlocked && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-fade-in">
          <div className="text-center animate-bounce-in">
            <div className="text-6xl mb-3">🔓</div>
            <p className="text-primary font-semibold">Selamat datang!</p>
          </div>
        </div>
      )}
    </div>
  );
}
