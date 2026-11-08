'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import Navbar from '@/components/Navbar';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Home() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    }
    init();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-950 text-slate-100 selection:bg-emerald-500 selection:text-black">
      
      {/* 🚀 JEDNOTNÁ NAVIGAČNÍ LIŠTA */}
      <Navbar user={user} onLogout={handleLogout} />

      <main className="max-w-6xl mx-auto p-4 sm:p-6 space-y-20">
        
        {/* HERO SEKCE */}
        <section className="text-center py-16 px-4 space-y-8 relative overflow-hidden rounded-3xl bg-gradient-to-b from-gray-900/50 to-transparent border border-gray-900 mt-4">
          
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 rounded-full text-emerald-400 text-xs font-mono font-bold uppercase tracking-wider">
            <span>⚡</span> AUTONOMNÍ ALGORITMICKÉ SÁZENÍ 2.0
          </div>

          <div className="space-y-4 max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight">
              Sázejte na základě <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">matematiky</span>, ne pocitů.
            </h1>
            <p className="text-sm sm:text-base text-gray-400 leading-relaxed max-w-2xl mx-auto">
              AI Sázkový Guru analyzuje tisíce datových bodů, počítá pravděpodobnosti pomocí Poissonova modelu a automaticky se učí z reálných výsledků.
            </p>
          </div>

          {/* TLAČÍTKA AKCÍ */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <Link 
              href="/register" 
              className="bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs sm:text-sm px-6 py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-950/50 flex items-center gap-2"
            >
              <span>🎁</span> Vyzkoušet Free Program Zdarma
            </Link>

            <Link 
              href="#pricing" 
              className="bg-gray-900 hover:bg-gray-800 border border-emerald-500/30 text-emerald-400 font-bold text-xs sm:text-sm px-6 py-3.5 rounded-xl transition-all shadow-md flex items-center gap-2"
            >
              <span>👑</span> Získat VIP členství (69 Kč/měs)
            </Link>
          </div>

        </section>

        {/* 🏆 CENÍKOVÁ SEKCE (FREE VS VIP) */}
        <section id="pricing" className="space-y-8 pt-4">
          <div className="text-center space-y-2">
            <span className="text-[11px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full font-mono uppercase tracking-widest font-bold">
              Transparentní ceník
            </span>
            <h2 className="text-3xl font-black text-white">Jedno předplatné. Kompletní přístup.</h2>
            <p className="text-xs text-gray-400 max-w-xl mx-auto">Začněte bezplatně s denními tipy zdarma nebo si aktivujte plný matematický engine.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch max-w-4xl mx-auto">
            
            {/* 1. FREE GURU PROGRAM */}
            <div className="bg-gray-900/80 border border-gray-800 p-8 rounded-3xl shadow-xl space-y-6 flex flex-col justify-between relative">
              <div className="space-y-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Startovací balíček</span>
                  <h3 className="text-2xl font-black text-white">Free Guru</h3>
                  <div className="text-3xl font-black text-emerald-400 font-mono">0 Kč <span className="text-xs font-normal text-gray-400">/ navždy</span></div>
                </div>

                <ul className="space-y-3 text-xs text-gray-300">
                  <li className="flex items-center gap-2">✅ 3 denní jistější tipy zdarma (kurzy ~1.30)</li>
                  <li className="flex items-center gap-2">✅ Základní přehled vybraných zápasů</li>
                  <li className="flex items-center gap-2 text-gray-500">❌ Riskantní bomby a AI generátor</li>
                  <li className="flex items-center gap-2 text-gray-500">❌ Ukládání tiketů do profilu</li>
                </ul>
              </div>

              <Link 
                href="/register" 
                className="block text-center bg-gray-800 hover:bg-gray-700 text-white font-bold text-xs py-3.5 rounded-xl transition-all shadow-md"
              >
                Aktivovat Free Plán Zdarma
              </Link>
            </div>

            {/* 2. VIP GURU ČLENSTVÍ (PRO) */}
            <div className="bg-gray-900 border border-emerald-500/50 p-8 rounded-3xl shadow-2xl space-y-6 flex flex-col justify-between relative overflow-hidden ring-1 ring-emerald-500/30">
              <div className="absolute top-0 right-0 bg-emerald-500 text-black text-[10px] font-black px-3.5 py-1 rounded-bl-xl uppercase tracking-wider">
                Nejoblíbenější
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Kompletní algoritmický balíček</span>
                  <h3 className="text-2xl font-black text-white">VIP Guru Členství</h3>
                  <div className="text-3xl font-black text-emerald-400 font-mono">69 Kč <span className="text-xs font-normal text-gray-400">/ měsíc</span></div>
                </div>

                <ul className="space-y-3 text-xs text-gray-300">
                  <li className="flex items-center gap-2">✅ Přístup k 85%+ doporučeným tipům (Sure Bets)</li>
                  <li className="flex items-center gap-2">✅ Fotbalové analýzy (Poissonův model)</li>
                  <li className="flex items-center gap-2">✅ LoL Esports analýzy (LCK, LEC, LPL)</li>
                  <li className="flex items-center gap-2">✅ Riskantní bomby (Kurzy 1.40+)</li>
                  <li className="flex items-center gap-2">✅ Ukládání vlastních tiketů do profilu</li>
                  <li className="flex items-center gap-2">✅ Přístup k historické paměti a statistikám</li>
                </ul>
              </div>

              <div className="space-y-2">
                <Link 
                  href="/register?plan=vip" 
                  className="block text-center bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-black text-xs py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-950/50"
                >
                  Aktivovat Členství za 69 Kč
                </Link>
                <div className="text-center">
                  <span className="text-[10px] text-gray-500">Bez závazků. Předplatné lze kdykoliv zrušit.</span>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ARCHITEKTURA / POPIS SYSTÉMU */}
        <section className="space-y-6 pt-12 border-t border-gray-900 text-center">
          <span className="text-[10px] text-gray-500 font-mono uppercase tracking-widest font-bold">Architektura systému</span>
          <h2 className="text-xl sm:text-2xl font-black text-white">Jak AI Sázkový Guru počítá a vyhodnocuje sázky?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 text-left">
            <div className="bg-gray-900/60 border border-gray-800 p-6 rounded-2xl space-y-2">
              <div className="text-emerald-400 font-mono font-bold text-sm">01. Poissonovo rozdělení</div>
              <p className="text-xs text-gray-400 leading-relaxed">Model matematicky vyhodnocuje ofenzivní a defenzivní průměry týmů z předchozích zápasů.</p>
            </div>
            <div className="bg-gray-900/60 border border-gray-800 p-6 rounded-2xl space-y-2">
              <div className="text-emerald-400 font-mono font-bold text-sm">02. Value Betting</div>
              <p className="text-xs text-gray-400 leading-relaxed">Porovnáváme reálnou matematickou šanci s kurzy sázkovek a hledáme výhodné příležitosti.</p>
            </div>
            <div className="bg-gray-900/60 border border-gray-800 p-6 rounded-2xl space-y-2">
              <div className="text-emerald-400 font-mono font-bold text-sm">03. Riskantní Bomby</div>
              <p className="text-xs text-gray-400 leading-relaxed">Sekce pro odvážné sázkaře, kteří hledají vysoké kurzy s atraktivním matematickým potenciálem.</p>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}