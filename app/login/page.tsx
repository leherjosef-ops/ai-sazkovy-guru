'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      alert('Chyba při přihlášení: ' + error.message);
    } else {
      router.push('/');
      router.refresh();
    }
  };

  // Přihlášení přes OAuth (Google / Apple)
  const handleSocialLogin = async (provider: 'google' | 'apple') => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });

    if (error) {
      alert('Chyba při přihlášení přes ' + provider + ': ' + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-gray-900 border border-gray-800 p-8 rounded-2xl shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <span className="text-3xl">🤖</span>
          <h1 className="text-2xl font-bold text-emerald-400">AI Sázkový Guru</h1>
          <p className="text-xs text-gray-400">Přihlaste se ke svému účtu</p>
        </div>

        {/* Sociální přihlášení (Google & Apple) */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleSocialLogin('google')}
            className="flex items-center justify-center gap-2 bg-gray-950 hover:bg-gray-800 border border-gray-800 text-gray-200 text-xs font-semibold py-2.5 rounded-xl transition-all"
          >
            <span>🌐</span> Google
          </button>
          <button
            type="button"
            onClick={() => handleSocialLogin('apple')}
            className="flex items-center justify-center gap-2 bg-gray-950 hover:bg-gray-800 border border-gray-800 text-gray-200 text-xs font-semibold py-2.5 rounded-xl transition-all"
          >
            <span>🍎</span> Apple
          </button>
        </div>

        <div className="flex items-center my-4">
          <div className="flex-grow border-t border-gray-800"></div>
          <span className="px-3 text-gray-500 text-[10px] uppercase tracking-wider">nebo e-mailem</span>
          <div className="flex-grow border-t border-gray-800"></div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1">E-mailová adresa</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vas@email.cz"
              className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1">Heslo</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl text-sm transition-all shadow-lg shadow-emerald-900/40 disabled:opacity-50"
          >
            {loading ? 'Přihlašuji...' : 'Přihlásit se'}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-gray-800">
          <Link href="/" className="text-xs text-gray-400 hover:text-emerald-400 transition-all">
            ← Zpět na hlavní stránku
          </Link>
        </div>
      </div>
    </div>
  );
}