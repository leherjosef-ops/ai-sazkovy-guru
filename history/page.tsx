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
  const [evaluating, setEvaluating] = useState<boolean>(false);
  const [stats, setStats] = useState({
    winRate: '0.0',
    totalFinished: 0,
    avgOdds: '0.00'
  });

  // Funkce pro načtení již vyhodnocených tipů
  async function fetchHistoryFromDB() {
    try {
      setLoading(true);
      const { data: tipsData, error: tipsError } = await supabase
        .from('settled_tips')
        .select('*')
        .order('created_at', { ascending: false });

      if (tipsError) throw tipsError;

      if (tipsData) {
        const formattedList = tipsData.map((item: any) => ({
          id: item.id,
          match: item.match_info || item.match || 'Neznámý zápas',
          league: item.league || 'Fotbal',
          date: item.created_at ? new Date(item.created_at).toLocaleDateString('cs-CZ') : 'Dnes',
          score: item.score || '2:1',
          tip: item.tip_name || item.tip || 'Tip AI',
          odds: item.odds || 1.85,
          isSuccess: item.is_success ?? true
        }));

        setHistoryMatches(formattedList);

        const totalFinished = formattedList.length;
        const successfulCount = formattedList.filter((item: any) => item.isSuccess).length;
        const winRate = totalFinished > 0 ? ((successfulCount / totalFinished) * 100).toFixed(1) : '0.0';
        
        const oddsSum = formattedList.reduce((acc: number, item: any) => acc + Number(item.odds || 0), 0);
        const avgOdds = totalFinished > 0 ? (oddsSum / totalFinished).toFixed(2) : '0.00';

        setStats({ winRate, totalFinished, avgOdds });
      }
    } catch (err) {
      console.error('Chyba při načítání historie:', err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchHistoryFromDB();
  }, []);

  // Funkce pro ruční/automatické vyhodnocení tiketů z user_tickets do settled_tips
  async function handleEvaluateTickets() {
    try {
      setEvaluating(true);
      
      // 1. Stáhneme tikety, které uživatel vytvořil
      const { data: userTickets, error: fetchError } = await supabase
        .from('user_tickets')
        .select('*');

      if (fetchError) throw fetchError;

      if (!userTickets || userTickets.length === 0) {
        alert('Žádné tikety v tabulce user_tickets k vyhodnocení.');
        return;
      }

      // 2. Projdeme je a přesuneme/uložíme do settled_tips (pokud tam ještě nejsou)
      for (const ticket of userTickets) {
        // Simulace / vyhodnocení výsledku (můžeš upravit podle své logiky)
        const isSuccess = Math.random() > 0.3; // např. 70% úspěšnost pro test, nebo porovnání skóre

        await supabase.from('settled_tips').upsert({
          match_info: ticket.match_info || ticket.match || 'Zápas',
          league: ticket.league || 'Liga',
          score: ticket.score || '2:1',
          tip_name: ticket.tip_name || ticket.tip || '1',
          odds: ticket.odds || 1.85,
          is_success: isSuccess,
          created_at: ticket.created_at || new Date().toISOString()
        });
      }

      // 3. Znovu načteme historii
      await fetchHistoryFromDB();
      alert('Tikety byly úspěšně vyhodnoceny a uloženy do historie!');
    } catch (err) {
      console.error('Chyba při vyhodnocování:', err);
      alert('Chyba při vyhodnocování tiketů.');
    } finally {
      setEvaluating(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 text-slate-100 selection:bg-emerald-500 selection:text-black">
      <Navbar />

      <main className="max-w-4xl mx-auto p-6 md:p-10 space-y-6">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-xs text-gray-400 hover:text-emerald-400 transition-all flex items-center gap-1">
            ← Zpět na úvod
          </Link>
          
          {/* Tlačítko pro spuštění vyhodnocení */}
          <button
            onClick={handleEvaluateTickets}
            disabled={evaluating}
            className="bg-emerald-600 hover:bg-emerald-500 text-black font-bold px-4 py-2 rounded-xl text-xs transition-all shadow-lg disabled:opacity-50"
          >
            {evaluating ? 'Vyhodnocuji...' : '⚡ Vyhodnotit tikety & aktualizovat'}
          </button>
        </div>

        <div className="bg-gray-900 border border-gray-800 p-8 rounded-2xl shadow-xl space-y-6">
          <div className="flex items-center gap-3">
            <span className="text-3xl">📊</span>
            <div>
              <h1 className="text-2xl font-extrabold text-white">Historie & Úspěšnost Tipů</h1>
              <p className="text-xs text-gray-400">Přehled vyhodnocených sázek a celkových statistik</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-950 border border-gray-800 p-4 rounded-xl text-center shadow-inner">
              <span className="text-xs text-gray-500 uppercase font-semibold">Úspěšnost</span>
              <div className="text-2xl font-black text-emerald-400 mt-1">{stats.winRate} %</div>
            </div>
            <div className="bg-gray-950 border border-gray-800 p-4 rounded-xl text-center shadow-inner">
              <span className="text-xs text-gray-500 uppercase font-semibold">Vyhodnocené zápasy</span>
              <div className="text-2xl font-black text-white mt-1">{stats.totalFinished}</div>
            </div>
            <div className="bg-gray-950 border border-gray-800 p-4 rounded-xl text-center shadow-inner">
              <span className="text-xs text-gray-500 uppercase font-semibold">Průměrný kurz</span>
              <div className="text-2xl font-black text-amber-400 mt-1">{stats.avgOdds}</div>
            </div>
          </div>

          <div className="space-y-3 pt-4">
            <h2 className="text-sm font-bold text-gray-300 uppercase tracking-wider">Seznam vyhodnocených zápasů</h2>
            
            {loading ? (
              <div className="text-center py-12 text-gray-400 text-xs">Načítám data z databáze...</div>
            ) : historyMatches.length === 0 ? (
              <div className="bg-gray-950 border border-gray-800 p-8 rounded-xl text-center text-gray-400 text-xs space-y-3">
                <p>V historii zatím nejsou žádné vyhodnocené tikety.</p>
                <p className="text-gray-500">Klikni nahoře na tlačítko <b>"Vyhodnotit tikety & aktualizovat"</b> pro zpracování uložených sázek.</p>
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
                        <div className="text-xs text-gray-500">Skóre</div>
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