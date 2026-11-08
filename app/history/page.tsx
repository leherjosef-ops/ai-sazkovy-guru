'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function HistoryPage() {
  const [historyMatches, setHistoryMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [stats, setStats] = useState({
    winRate: '0.0',
    totalFinished: 0,
    avgOdds: '0.00'
  });

  useEffect(() => {
    async function fetchHistoryFromDB() {
      try {
        setLoading(true);

        // 1. Načteme uložené tipy přímo z tabulky v Supabase
        const { data: tipsData, error: tipsError } = await supabase
          .from('settled_tips')
          .select('*')
          .order('created_at', { ascending: false });

        if (tipsError) throw tipsError;

        if (tipsData) {
          const formattedList = tipsData.map((item: any) => ({
            id: item.id,
            match: item.match_info,
            league: item.league,
            date: new Date(item.created_at).toLocaleDateString('cs-CZ'),
            score: item.score || 'N/A',
            tip: item.tip_name,
            odds: item.odds,
            isSuccess: item.is_success
          }));

          setHistoryMatches(formattedList);

          // 2. Výpočet statistik přímo z načtených dat
          const totalFinished = formattedList.length;
          const successfulCount = formattedList.filter((item: any) => item.isSuccess).length;
          const winRate = totalFinished > 0 ? ((successfulCount / totalFinished) * 100).toFixed(1) : '0.0';
          
          const oddsSum = formattedList.reduce((acc: number, item: any) => acc + Number(item.odds), 0);
          const avgOdds = totalFinished > 0 ? (oddsSum / totalFinished).toFixed(2) : '0.00';

          setStats({
            winRate,
            totalFinished,
            avgOdds
          });
        }
      } catch (err) {
        console.error('Chyba při načítání historie z DB:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchHistoryFromDB();
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-slate-100 selection:bg-emerald-500 selection:text-black">
      
      {/* Sdílená hlavička */}
      <Navbar />

      <main className="max-w-4xl mx-auto p-6 md:p-10 space-y-6">
        <div>
          <Link href="/" className="text-xs text-gray-400 hover:text-emerald-400 transition-all flex items-center gap-1">
            ← Zpět na úvod
          </Link>
        </div>

        <div className="bg-gray-900 border border-gray-800 p-8 rounded-2xl shadow-xl space-y-6">
          <div className="flex items-center gap-3">
            <span className="text-3xl">📊</span>
            <div>
              <h1 className="text-2xl font-extrabold text-white">Databázová Historie & Statistiky</h1>
              <p className="text-xs text-gray-400">Statistiky a úspěšnost načítané přímo z bezpečné paměti Supabase</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-950 border border-gray-800 p-4 rounded-xl text-center shadow-inner">
              <span className="text-xs text-gray-500 uppercase font-semibold">Úspěšnost odehraných</span>
              <div className="text-2xl font-black text-emerald-400 mt-1">{stats.winRate} %</div>
            </div>
            <div className="bg-gray-950 border border-gray-800 p-4 rounded-xl text-center shadow-inner">
              <span className="text-xs text-gray-500 uppercase font-semibold">Vyhodnocené zápasy</span>
              <div className="text-2xl font-black text-white mt-1">{stats.totalFinished}</div>
            </div>
            <div className="bg-gray-950 border border-gray-800 p-4 rounded-xl text-center shadow-inner">
              <span className="text-xs text-gray-500 uppercase font-semibold">Průměrný kurz tipů</span>
              <div className="text-2xl font-black text-amber-400 mt-1">{stats.avgOdds}</div>
            </div>
          </div>

          <div className="space-y-3 pt-4">
            <h2 className="text-sm font-bold text-gray-300 uppercase tracking-wider">Uložená utkání v databázi</h2>
            
            {loading ? (
              <div className="text-center py-12 text-gray-400 text-xs">Načítám data z databáze...</div>
            ) : historyMatches.length === 0 ? (
              <div className="bg-gray-950 border border-gray-800 p-8 rounded-xl text-center text-gray-400 text-xs">
                V databázi zatiaľ nejsou žádné uložené zápasy. Jakmile systém vyhodnotí tikety, objeví se zde.
              </div>
            ) : (
              <div className="space-y-3">
                {historyMatches.map((item) => (
                  <div key={item.id} className="bg-gray-950 border border-gray-800 p-4 rounded-xl flex items-center justify-between shadow-sm">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">{item.league}</span>
                        <span className="text-xs text-gray-600">{item.date}</span>
                      </div>
                      <div className="text-sm font-bold text-white">{item.match}</div>
                      <div className="text-xs text-gray-400">
                        Tip AI: <span className="text-gray-200 font-semibold">{item.tip}</span> (Kurz: {item.odds})
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-xs text-gray-500">Konečné skóre</div>
                        <div className="text-sm font-bold text-amber-400">{item.score}</div>
                      </div>

                      <div className="text-2xl">
                        {item.isSuccess ? (
                          <span className="bg-emerald-950 text-emerald-400 border border-emerald-500/40 p-2 rounded-xl" title="Tip vyšel">✅</span>
                        ) : (
                          <span className="bg-red-950 text-red-400 border border-red-500/40 p-2 rounded-xl" title="Tip nevyšel">❌</span>
                        )}
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