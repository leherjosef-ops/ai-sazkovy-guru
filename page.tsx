'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Home() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    }
    getUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-950 text-slate-100 selection:bg-emerald-500 selection:text-black">
      
      {/* 🚀 HEADER (Stejný jako v aplikaci) */}
      <header className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur-xl border-b border-emerald-500/10 px-4 py-4 shadow-2xl">
        <div className="max-w-6xl mx-auto flex flex-col items-center gap-4">
          
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl blur opacity-30 group-hover:opacity-75 transition duration-500"></div>
              <div className="relative w-11 h-11 rounded-2xl bg-gray-950 border border-emerald-500/30 flex items-center justify-center text-2xl shadow-inner">
                🤖
              </div>
            </div>
            <div className="text-center">
              <h1 className="font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-emerald-300 to-teal-400 text-2xl tracking-wider uppercase font-mono">
                AI Sázkový Guru
              </h1>
              <p className="text-[10px] text-gray-400 tracking-widest uppercase font-semibold">Smart Predictive Engine</p>
            </div>
          </div>

          <nav className="bg-gray-950/90 border border-gray-800/80 p-1.5 rounded-full flex flex-wrap items-center justify-center gap-1 shadow-inner">
            <Link 
              href="/tips" 
              className="text-gray-400 hover:text-white hover:bg-gray-900/80 font-medium px-4 py-2 rounded-full text-xs transition-all flex items-center gap-2"
            >
              <span className="text-sm">🎯</span> Tipy & Zápasy
            </Link>

            <Link 
              href="/risk-bombs" 
              className="text-gray-400 hover:text-white hover:bg-gray-900/80 font-medium px-4 py-2 rounded-full text-xs transition-all flex items-center gap-2"
            >
              <span className="text-sm">💣</span> Riskantní Bomby
            </Link>

            <Link 
              href="/generator" 
              className="text-gray-400 hover:text-white hover:bg-gray-900/80 font-medium px-4 py-2 rounded-full text-xs transition-all flex items-center gap-2"
            >
              <span className="text-sm">⚡</span> AI Generátor
            </Link>

            <Link 
              href="/history" 
              className="text-gray-400 hover:text-white hover:bg-gray-900/80 font-medium px-4 py-2 rounded-full text-xs transition-all flex items-center gap-2"
            >
              <span className="text-sm">📊</span> Historie
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3 bg-gray-950 border border-gray-800/90 px-4 py-1.5 rounded-full shadow-inner">
                <div className="relative flex items-center justify-center">
                  <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </div>

                <span className="text-gray-300 text-xs font-mono">{user.email}</span>
                
                <Link 
                  href="/profile" 
                  className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold px-3 py-1 rounded-full transition-all flex items-center gap-1.5"
                >
                  <span>👤</span> Profil
                </Link>

                <button 
                  onClick={handleLogout}
                  className="text-gray-500 hover:text-red-400 text-xs font-medium transition-all px-1.5"
                >
                  Odhlásit
                </button>
              </div>
            ) : (
              <Link 
                href="/login" 
                className="relative group overflow-hidden rounded-full p-[1px] focus:outline-none"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 rounded-full group-hover:opacity-100 transition duration-300 opacity-75"></span>
                <span className="relative px-6 py-2 rounded-full bg-gray-950 flex items-center gap-2 text-xs font-bold text-white transition duration-300 group-hover:bg-opacity-0">
                  <span>🔑</span> Přihlásit se
                </span>
              </Link>
            )}
          </div>

        </div>
      </header>

      {/* 🏷️ CENÍK A PŘEDPLATNÉ (HLAVNÍ OBSAH) */}
      <main className="max-w-5xl mx-auto px-4 py-16 space-y-12 text-center">
        
        <div className="space-y-3">
          <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
            Transparentní ceník
          </span>
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">
            Jedno předplatné. Kompletní přístup.
          </h2>
          <p className="text-xs md:text-sm text-gray-400 max-w-lg mx-auto">
            Začněte bezplatně s denními tipy zdarma nebo si aktivujte plný matematický engine.
          </p>
        </div>

        {/* Ceníkové karty */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left max-w-4xl mx-auto">
          
          {/* Free balíček */}
          <div className="bg-gray-900/80 border border-gray-800 p-8 rounded-3xl space-y-6 shadow-xl flex flex-col justify-between">
            <div className="space-y-4">
              <div>
                <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Startovací balíček</span>
                <h3 className="text-2xl font-black text-white mt-1">Free Guru</h3>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-white">0 Kč</span>
                <span className="text-xs text-gray-400">/ navždy</span>
              </div>

              <ul className="space-y-3 pt-2 text-xs text-gray-300">
                <li className="flex items-center gap-2.5">
                  <span className="text-emerald-400">✔</span> 3 denní jistější tipy zdarma (kurzy ~1.30)
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="text-emerald-400">✔</span> Základní přehled vybraných zápasů
                </li>
                <li className="flex items-center gap-2.5 text-gray-500">
                  <span className="text-red-400">✖</span> Riskantní bomby a AI generátor
                </li>
                <li className="flex items-center gap-2.5 text-gray-500">
                  <span className="text-red-400">✖</span> Ukládání tiketů do profilu
                </li>
              </ul>
            </div>

            <Link
              href="/tips"
              className="w-full bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 rounded-xl text-xs transition-all text-center block"
            >
              Aktivovat Free Plán Zdarma
            </Link>
          </div>

          {/* VIP balíček */}
          <div className="bg-gradient-to-b from-gray-900 via-gray-900 to-emerald-950/40 border border-emerald-500/50 p-8 rounded-3xl space-y-6 shadow-2xl relative flex flex-col justify-between">
            <div className="absolute -top-3 right-8 bg-emerald-500 text-black text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-lg">
              Nejoblíbenější
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-xs text-emerald-400 font-semibold uppercase tracking-wider">Kompletní algoritmický balíček</span>
                <h3 className="text-2xl font-black text-white mt-1">VIP Guru Členství</h3>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-emerald-400">69 Kč</span>
                <span className="text-xs text-gray-400">/ měsíc</span>
              </div>

              <ul className="space-y-3 pt-2 text-xs text-gray-300">
                <li className="flex items-center gap-2.5">
                  <span className="text-emerald-400">✔</span> Přístup k 85%+ doporučeným tipům (Sure Bets)
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="text-emerald-400">✔</span> Fotbalové analýzy (Poissonův model)
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="text-emerald-400">✔</span> LoL Esports analýzy (LCK, LEC, LPL)
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="text-emerald-400">✔</span> Riskantní bomby (Kurzy 1.40+)
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="text-emerald-400">✔</span> Ukládání vlastních tiketů do profilu
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="text-emerald-400">✔</span> Přístup k historické paměti a statistikám
                </li>
              </ul>
            </div>

            <div className="space-y-2">
              <Link
                href="/tips"
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-black py-3 rounded-xl text-xs transition-all shadow-lg shadow-emerald-950/50 block text-center"
              >
                Aktivovat Členství za 69 Kč
              </Link>
              <p className="text-[10px] text-gray-500 text-center">Bez závazků. Předplatné lze kdykoliv zrušit.</p>
            </div>

          </div>

        </div>

      </main>
    </div>
  );
}