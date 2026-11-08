'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Home() {
  const [activeSport, setActiveSport] = useState<'football' | 'lol'>('football');
  
  const [footballMatches, setFootballMatches] = useState<any[]>([]);
  const [lolMatches, setLolMatches] = useState<any[]>([]);
  
  const [loadingFootball, setLoadingFootball] = useState<boolean>(true);
  const [loadingLol, setLoadingLol] = useState<boolean>(false);
  const [lolLoaded, setLolLoaded] = useState<boolean>(false);

  const [user, setUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedLeague, setSelectedLeague] = useState<string>('Všechny');
  const [dayFilter, setDayFilter] = useState<'all' | 'today' | 'tomorrow'>('all');
  const [savingKey, setSavingKey] = useState<string | null>(null);

  useEffect(() => {
    async function initFootball() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);

        const res = await fetch('/api/calculate-poisson');
        if (!res.ok) {
          setFootballMatches([]);
          setLoadingFootball(false);
          return;
        }

        const json = await res.json();
        if (json.success) {
          setFootballMatches(json.data || []);
        } else {
          setFootballMatches([]);
        }
      } catch (err) {
        setFootballMatches([]);
      } finally {
        setLoadingFootball(false);
      }
    }

    initFootball();
  }, []);

  const handleSwitchSport = async (sport: 'football' | 'lol') => {
    setActiveSport(sport);
    setSelectedLeague('Všechny');

    if (sport === 'lol' && !lolLoaded) {
      setLoadingLol(true);
      try {
        const res = await fetch('/api/lol-matches');
        if (!res.ok) {
          setLolMatches([]);
          setLoadingLol(false);
          return;
        }

        const json = await res.json();
        if (json.success) {
          setLolMatches(json.data || []);
          setLolLoaded(true);
        } else {
          setLolMatches([]);
        }
      } catch (err) {
        setLolMatches([]);
      } finally {
        setLoadingLol(false);
      }
    }
  };

  const handleSaveTicket = async (match: any, tip: any) => {
    if (!user) {
      alert('Pro uložení tiketu se musíte nejdříve přihlásit.');
      return;
    }

    const uniqueKey = match.id + '-' + tip.name;
    setSavingKey(uniqueKey);

    const { error } = await supabase.from('saved_tickets').insert([
      {
        user_id: user.id,
        match_info: `${match.home_team} vs ${match.away_team}`,
        tip_name: tip.name,
        odds: tip.bookmakerOdds,
        probability: tip.probability
      }
    ]);

    setSavingKey(null);

    if (error) {
      alert('Chyba při ukládání tiketu: ' + error.message);
    } else {
      alert('Tiket byl úspěšně uložen do vašeho profilu!');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    window.location.reload();
  };

  const currentMatches = activeSport === 'football' ? footballMatches : lolMatches;
  const isLoading = activeSport === 'football' ? loadingFootball : loadingLol;

  const filteredMatches = currentMatches.filter((match) => {
    const leagueLower = match.league.toLowerCase();
    const homeLower = match.home_team.toLowerCase();
    const awayLower = match.away_team.toLowerCase();

    if (activeSport === 'football') {
      if (
        leagueLower.includes('chance') || 
        leagueLower.includes('czech') || 
        homeLower.includes('sparta') || 
        homeLower.includes('slavia') ||
        awayLower.includes('sparta') || 
        awayLower.includes('slavia')
      ) {
        return false;
      }
    }

    const matchesLeague = selectedLeague === 'Všechny' || leagueLower.includes(selectedLeague.toLowerCase());
    const matchesSearch = homeLower.includes(searchQuery.toLowerCase()) || awayLower.includes(searchQuery.toLowerCase());
    
    // OPRAVENÁ LOGIKA FILTROVÁNÍ DNŮ PODLE UTC DATE
    let matchesDay = true;
    if (match.utcDate) {
      const matchDate = new Date(match.utcDate);
      const today = new Date();
      const tomorrow = new Date();
      tomorrow.setDate(today.getDate() + 1);

      if (dayFilter === 'today') {
        matchesDay = matchDate.toDateString() === today.toDateString();
      } else if (dayFilter === 'tomorrow') {
        matchesDay = matchDate.toDateString() === tomorrow.toDateString();
      }
    }

    return matchesLeague && matchesSearch && matchesDay;
  });

  return (
    <div className="min-h-screen bg-gray-950 text-slate-100 selection:bg-emerald-500 selection:text-black">
      
      {/* 🚀 HEADER */}
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
              href="/" 
              className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold px-4 py-2 rounded-full text-xs transition-all shadow-lg shadow-emerald-900/40 flex items-center gap-2"
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

      {/* OBSAH STRÁNKY */}
      <main className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
        
        <div className="bg-gray-900/90 border border-gray-800 p-2 rounded-2xl shadow-xl backdrop-blur">
          <div className="flex items-center gap-2 w-full">
            <button
              onClick={() => handleSwitchSport('football')}
              className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2.5 ${
                activeSport === 'football'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-900/40'
                  : 'bg-gray-950 text-gray-400 hover:bg-gray-800/80 hover:text-gray-200'
              }`}
            >
              <span className="text-base">⚽</span> Fotbalové analýzy
            </button>
            <button
              onClick={() => handleSwitchSport('lol')}
              className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2.5 ${
                activeSport === 'lol'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-900/40'
                  : 'bg-gray-950 text-gray-400 hover:bg-gray-800/80 hover:text-gray-200'
              }`}
            >
              <span className="text-base">🎮</span> League of Legends (LoL)
            </button>
          </div>
        </div>

        <div className="bg-gradient-to-r from-gray-900 via-gray-900/90 to-emerald-950/30 border border-gray-800 p-6 rounded-2xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative overflow-hidden">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-2xl flex-shrink-0">
              ⚡
            </div>
            <div className="space-y-1">
              <h2 className="text-sm sm:text-base font-extrabold text-emerald-400 tracking-wide uppercase">
                {activeSport === 'football' ? 'Poissonův model pro fotbalové trávníky' : 'Analýza sérií, draftů a map pro LoL'}
              </h2>
              <p className="text-xs text-gray-400 max-w-2xl leading-relaxed">
                {activeSport === 'football' 
                  ? 'Pokročilé matematické vyhodnocení gólových průměrů, vzájemných zápasů a aktuální formy.' 
                  : 'Sledujte predikce a kurzy pro turnaje LEC, LCK, LPL a LCS.'}
              </p>
            </div>
          </div>
        </div>

        {/* Filtry dnů a vyhledávání */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-2">
          
          <div className="flex items-center gap-2 w-full md:w-auto bg-gray-900/60 p-1.5 rounded-2xl border border-gray-800">
            <button
              onClick={() => setDayFilter('all')}
              className={`flex-1 md:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                dayFilter === 'all' ? 'bg-emerald-600 text-white shadow-md' : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              📅 Všechny
            </button>
            <button
              onClick={() => setDayFilter('today')}
              className={`flex-1 md:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                dayFilter === 'today' ? 'bg-emerald-600 text-white shadow-md' : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              🔥 Dnes
            </button>
            <button
              onClick={() => setDayFilter('tomorrow')}
              className={`flex-1 md:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                dayFilter === 'tomorrow' ? 'bg-emerald-600 text-white shadow-md' : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              ⏳ Zítra
            </button>
          </div>

          <div className="relative w-full md:w-80">
            <input 
              type="text"
              placeholder="🔍 Hledat podle týmu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-all shadow-inner"
            />
          </div>
        </div>

        {/* Seznam zápasů */}
        {isLoading ? (
          <div className="bg-gray-900/50 border border-gray-800/80 p-16 rounded-2xl text-center space-y-3">
            <div className="inline-block w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-gray-400 font-medium">Načítám aktuální data a počítám modelové šance...</p>
          </div>
        ) : filteredMatches.length === 0 ? (
          <div className="bg-gray-900/50 border border-gray-800/80 p-16 rounded-2xl text-center text-gray-400 text-xs">
            Žádné zápasy neodpovídají zadanému filtru.
          </div>
        ) : (
          <div className="space-y-4">
            {filteredMatches.map((match) => (
              <div key={match.id} className="bg-gray-900/90 hover:bg-gray-900 border border-gray-800/90 hover:border-gray-700 p-5 rounded-2xl shadow-xl transition-all flex flex-col lg:flex-row items-center justify-between gap-6">
                
                <div className="w-full lg:w-[280px] flex-shrink-0 flex flex-col justify-center gap-2">
                  <div className="flex items-center gap-2">
                    <span className="inline-block bg-gray-800/90 text-gray-300 border border-gray-700/60 px-2.5 py-0.5 rounded-lg text-[11px] font-semibold tracking-wide">
                      {match.league}
                    </span>

                    {match.status === 'LIVE' && (
                      <span className="bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse text-[10px] font-black px-2 py-0.5 rounded-lg">
                        🔴 LIVE
                      </span>
                    )}
                  </div>

                  <div className="text-base font-extrabold text-white leading-snug min-h-[44px] flex items-center">
                    <span>{match.home_team} vs {match.away_team}</span>
                  </div>

                  {match.score ? (
                    <div className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                      <span>Skóre:</span>
                      <span className="bg-gray-950 px-2.5 py-1 rounded-lg border border-amber-500/30 text-amber-300">{match.score}</span>
                    </div>
                  ) : (
                    <div className="text-xs text-gray-400 flex items-center gap-1.5 font-medium">
                      <span>🕒</span> {match.match_date}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full flex-1">
                  {match.tips.map((tip: any, idx: number) => {
                    const uniqueKey = match.id + '-' + tip.name;
                    const isSaving = savingKey === uniqueKey;

                    return (
                      <div 
                        key={idx} 
                        className={`p-3.5 rounded-xl border flex flex-col justify-between h-[120px] transition-all relative ${
                          tip.isSureBet 
                            ? 'bg-gradient-to-b from-amber-950/20 to-gray-950/80 border-amber-500/50 shadow-md shadow-amber-950/10' 
                            : 'bg-gray-950/60 border-gray-800/80 hover:border-gray-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          {tip.isSureBet ? (
                            <span className="bg-amber-500 text-black text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider">
                              ⭐ DOPORUČENO
                            </span>
                          ) : (
                            <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">
                              TIP #{idx + 1}
                            </span>
                          )}
                          <span className="text-[11px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                            {tip.probability}
                          </span>
                        </div>

                        <div className="text-xs font-bold text-gray-200 h-[32px] flex items-center leading-snug">
                          <span className="line-clamp-2">{tip.name}</span>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-gray-800/80">
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-[10px] text-gray-400">Kurz</span>
                            <span className="text-sm font-black text-emerald-400">{tip.bookmakerOdds}</span>
                          </div>

                          <button
                            onClick={() => handleSaveTicket(match, tip)}
                            disabled={isSaving}
                            className="bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg transition-all shadow shadow-emerald-900/30 disabled:opacity-50 flex items-center gap-1.5"
                          >
                            <span>{isSaving ? '⏳' : '📥'}</span> {isSaving ? 'Ukládám' : 'Uložit'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>
            ))}
          </div>
        )}

      </main>
    </div>
  );
}