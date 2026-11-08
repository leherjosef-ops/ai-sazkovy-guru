'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function GeneratorPage() {
  const [targetOdds, setTargetOdds] = useState<number>(3.5);
  const [matchesCount, setMatchesCount] = useState<number>(3);
  const [generatedTicket, setGeneratedTicket] = useState<any[] | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setErrorMsg(null);
    setGeneratedTicket(null);

    try {
      const res = await fetch('/api/calculate-poisson');
      const json = await res.json();

      if (!json.success || !json.data || json.data.length === 0) {
        setErrorMsg('V reálném API zrovna nejsou k dispozici žádné zápasy pro vygenerování tiketu.');
        setIsGenerating(false);
        return;
      }

      // Vyfiltrumeme všechny dostupné tipy z reálných zápasů
      const allTips: any[] = [];
      json.data.forEach((match: any) => {
        match.tips.forEach((tip: any) => {
          allTips.push({
            match: `${match.home_team} vs ${match.away_team}`,
            league: match.league,
            date: match.match_date,
            tip: tip.name,
            odds: tip.bookmakerOdds,
            probability: tip.probability,
            isSureBet: tip.isSureBet
          });
        });
      });

      // Seřadíme tipy primárně podle zaručenosti/pravděpodobnosti
      allTips.sort((a, b) => {
        const probA = parseInt(a.probability);
        const probB = parseInt(b.probability);
        return probB - probA;
      });

      // Vybereme požadovaný počet unikátních zápasů
      const selected: any[] = [];
      const usedMatches = new Set<string>();

      for (const tip of allTips) {
        if (!usedMatches.has(tip.match)) {
          usedMatches.add(tip.match);
          selected.push(tip);
        }
        if (selected.length === matchesCount) break;
      }

      if (selected.length === 0) {
        setErrorMsg('Nenašel se dostatek reálných tipů pro vygenerování tiketu.');
      } else {
        setGeneratedTicket(selected);
      }

    } catch (err) {
      console.error('Chyba při generování AI tiketu:', err);
      setErrorMsg('Nastala chyby při propojování s reálným API.');
    } finally {
      setIsGenerating(false);
    }
  };

  const totalOdds = generatedTicket 
    ? generatedTicket.reduce((acc, curr) => acc * curr.odds, 1).toFixed(2) 
    : '0.00';

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6 md:p-10">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <Link href="/" className="text-xs text-gray-400 hover:text-emerald-400 transition-all flex items-center gap-1">
            ← Zpět na hlavní stránku
          </Link>
        </div>

        <div className="bg-gray-900 border border-gray-800 p-8 rounded-2xl shadow-xl space-y-6">
          <div className="flex items-center gap-3">
            <span className="text-3xl">⚡</span>
            <div>
              <h1 className="text-2xl font-extrabold text-white">AI Generátor Tiketů</h1>
              <p className="text-xs text-gray-400">Automatické skládání tiketů z reálných nadcházejících zápasů napříč ligami</p>
            </div>
          </div>

          <div className="bg-gray-950 border border-gray-800 p-6 rounded-xl space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-300 uppercase tracking-wider">Cílový kurz tiketu: <span className="text-emerald-400">{targetOdds}x</span></label>
              <input 
                type="range" 
                min="1.5" 
                max="15.0" 
                step="0.5" 
                value={targetOdds} 
                onChange={(e) => setTargetOdds(parseFloat(e.target.value))}
                className="w-full accent-emerald-500 bg-gray-900 cursor-pointer"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-300 uppercase tracking-wider">Počet zápasů na tiketu: <span className="text-emerald-400">{matchesCount}</span></label>
              <div className="flex gap-2">
                {[2, 3, 4, 5].map((num) => (
                  <button
                    key={num}
                    onClick={() => setMatchesCount(num)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                      matchesCount === num ? 'bg-emerald-600 text-white shadow' : 'bg-gray-900 text-gray-400 hover:bg-gray-800 border border-gray-800'
                    }`}
                  >
                    {num} zápasy
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold py-3 rounded-xl transition-all shadow-lg shadow-emerald-950/40 disabled:opacity-50"
            >
              {isGenerating ? 'Generuji AI tiket z reálných dat...' : '⚡ Vygenerovat tiket z reálných zápasů'}
            </button>
          </div>

          {errorMsg && (
            <div className="bg-red-950/40 border border-red-500/40 p-4 rounded-xl text-red-400 text-xs text-center">
              {errorMsg}
            </div>
          )}

          {generatedTicket && (
            <div className="bg-gray-950 border border-emerald-500/30 p-6 rounded-xl space-y-4">
              <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Vygenerovaný AI Tiket</span>
                <div className="text-sm font-extrabold text-amber-400">Celkový kurz: {totalOdds}</div>
              </div>

              <div className="space-y-3">
                {generatedTicket.map((item, idx) => (
                  <div key={idx} className="bg-gray-900 border border-gray-800 p-3.5 rounded-xl flex items-center justify-between">
                    <div>
                      <div className="text-xs text-gray-500">{item.league} • {item.date}</div>
                      <div className="text-sm font-bold text-white mt-0.5">{item.match}</div>
                      <div className="text-xs text-emerald-400 font-semibold mt-1">Tip: {item.tip}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-amber-400 font-bold">Kurz {item.odds}</div>
                      <div className="text-[10px] text-gray-400 mt-0.5">Šance {item.probability}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}