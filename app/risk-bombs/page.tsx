'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

export default function RiskBombsPage() {
  const [riskBombs, setRiskBombs] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchRiskBombs() {
      try {
        setLoading(true);
        const res = await fetch('/api/calculate-poisson');
        const json = await res.json();

        if (json.success && json.data) {
          const now = new Date();

          // 1. Vyfiltrujeme POUZE zápasy, které ještě nezačaly (jejich utcDate je větší než aktuální čas)
          const upcomingMatches = json.data.filter((match: any) => {
            if (!match.utcDate) return match.status !== 'FT';
            return new Date(match.utcDate) > now;
          });

          // 2. Vybereme zajímavé value kurzy
          const bombs = upcomingMatches.map((match: any) => {
            const riskyTips = match.tips.filter((t: any) => t.bookmakerOdds >= 1.60);
            const selectedTip = riskyTips.length > 0 ? riskyTips[0] : match.tips[0];
            const boostedOdds = (selectedTip.bookmakerOdds * 1.25).toFixed(2);

            return {
              id: match.id,
              match: `${match.home_team} vs ${match.away_team}`,
              league: match.league,
              date: match.match_date,
              tip: selectedTip.name,
              odds: boostedOdds,
            };
          });

          setRiskBombs(bombs);
        }
      } catch (err) {
        console.error('Chyba při načítání riskantních bomb:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchRiskBombs();
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-slate-100 selection:bg-emerald-500 selection:text-black">
      
      <Navbar />

      <main className="max-w-4xl mx-auto p-6 md:p-10 space-y-6">
        <div>
          <Link href="/" className="text-xs text-gray-400 hover:text-emerald-400 transition-all flex items-center gap-1">
            ← Zpět na úvod
          </Link>
        </div>

        <div className="bg-gray-900 border border-gray-800 p-8 rounded-2xl shadow-xl space-y-6">
          <div className="flex items-center gap-3">
            <span className="text-3xl">💣</span>
            <div>
              <h1 className="text-2xl font-extrabold text-white">Riskantní Bomby (Nadcházející zápasy)</h1>
              <p className="text-xs text-gray-400">Budoucí zápasy s vysokými kurzy a zajímavou value pro odvážné sázkaře</p>
            </div>
          </div>

          <div className="space-y-4 pt-4">
            {loading ? (
              <div className="text-center py-12 text-gray-400 text-xs">Filtruji nadcházející zápasy...</div>
            ) : riskBombs.length === 0 ? (
              <div className="bg-gray-950 border border-gray-800 p-8 rounded-xl text-center text-gray-400 text-xs">
                V tuto chvíli nejsou k dispozici žádné další nadcházející zápasy.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {riskBombs.map((item) => (
                  <div key={item.id} className="bg-gray-950 border border-amber-500/20 hover:border-amber-500/50 transition-all p-5 rounded-xl space-y-4 shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-amber-500/10 text-amber-400 text-[10px] font-bold px-3 py-1 rounded-bl-xl border-l border-b border-amber-500/20 uppercase tracking-wider">
                      💣 Value Bomba
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">{item.league}</span>
                        <span className="text-xs text-gray-400 font-semibold">• {item.date}</span>
                      </div>
                      <div className="text-base font-black text-white">{item.match}</div>
                    </div>

                    <div className="bg-gray-900/90 border border-gray-800 p-3 rounded-lg flex items-center justify-between">
                      <div>
                        <div className="text-[10px] text-gray-400 uppercase font-semibold">Doporučená sázka</div>
                        <div className="text-sm font-bold text-amber-300">{item.tip}</div>
                      </div>

                      <div className="text-right">
                        <div className="text-[10px] text-gray-400 uppercase font-semibold">Kurz</div>
                        <div className="text-lg font-black text-emerald-400 font-mono">@{item.odds}</div>
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}