'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadProfile() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);

        if (user) {
          // Načtení uložených tiketů z databáze
          const { data, error } = await supabase
            .from('saved_tickets')
            .select('*')
            .eq('user_id', user.id);

          if (!error && data) {
            setTickets(data);
          }
        }
      } catch (err) {
        console.error('Chyba při načítání profilu:', err);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        Načítám váš profil...
      </div>
    );
  }

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
            <span className="text-3xl">👤</span>
            <div>
              <h1 className="text-2xl font-extrabold text-white">Uživatelský profil</h1>
              <p className="text-xs text-gray-400">Správa vašeho účtu a uložených tiketů</p>
            </div>
          </div>

          {user ? (
            <div className="space-y-6">
              <div className="bg-gray-950 border border-gray-800 p-4 rounded-xl space-y-2">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Přihlášený e-mail</span>
                <div className="text-sm font-bold text-emerald-400">{user.email}</div>
              </div>

              <div className="space-y-3">
                <h2 className="text-sm font-bold text-gray-300 uppercase tracking-wider">Vaše uložené tikety ({tickets.length})</h2>
                
                {tickets.length === 0 ? (
                  <div className="p-6 bg-gray-950 border border-gray-800 rounded-xl text-center text-gray-500 text-xs">
                    Zatím nemáte uložené žádné tikety. Vraťte se na hlavní stránku a nějaké si uložte!
                  </div>
                ) : (
                  <div className="space-y-3">
                    {tickets.map((ticket) => (
                      <div key={ticket.id} className="bg-gray-950 border border-gray-800 p-4 rounded-xl flex items-center justify-between">
                        <div>
                          <div className="text-sm font-bold text-white">{ticket.match_info}</div>
                          <div className="text-xs text-emerald-400 mt-0.5">{ticket.tip_name} (Kurz: {ticket.odds})</div>
                        </div>
                        <div className="text-xs text-gray-500">
                          Pravděpodobnost: {ticket.probability}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-8 bg-gray-950 border border-gray-800 rounded-xl text-center space-y-4">
              <p className="text-sm text-gray-400">Pro zobrazení profilu se musíte přihlásit.</p>
              <Link 
                href="/login" 
                className="inline-block bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow"
              >
                Přejít na přihlášení
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}