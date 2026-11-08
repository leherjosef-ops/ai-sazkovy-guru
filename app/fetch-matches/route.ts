import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import axios from 'axios';

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const apiKey = process.env.FOOTBALL_DATA_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ success: false, error: 'Chybí FOOTBALL_DATA_API_KEY' }, { status: 400 });
    }

    // Seznam lig, které chceš stahovat
    const leagues = [
      { code: 'PL', name: 'Premier League' },
      { code: 'PD', name: 'La Liga' },
      { code: 'BL1', name: 'Bundesliga' },
      { code: 'SA', name: 'Serie A' }
    ];

    let totalInserted = 0;

    for (const league of leagues) {
      try {
        const response = await axios.get(`https://api.football-data.org/v4/competitions/${league.code}/matches`, {
          headers: { 'X-Auth-Token': apiKey },
          params: { season: '2026' }
        });

        const matches = response.data.matches || [];

        for (const match of matches) {
          const externalMatchId = match.id.toString();
          const homeTeam = match.homeTeam.name;
          const awayTeam = match.awayTeam.name;
          const matchDate = match.utcDate;
          const status = match.status;

          let homeScore = null;
          let awayScore = null;

          if (status === 'FINISHED' && match.score && match.score.fullTime) {
            homeScore = match.score.fullTime.home;
            awayScore = match.score.fullTime.away;
          }

          const baseOdds = Number((1.70 + (match.id % 15) * 0.1).toFixed(2));

          const { error } = await supabase.from('matches').upsert({
            external_match_id: externalMatchId,
            league: league.name, // Uloží se správný název ligy
            home_team: homeTeam,
            away_team: awayTeam,
            match_date: matchDate,
            home_score: homeScore,
            away_score: awayScore,
            home_odds: baseOdds,
            status: status.toLowerCase()
          }, { onConflict: 'external_match_id' });

          if (!error) totalInserted++;
        }
      } catch (err) {
        console.error(`Chyba při stahování ligy ${league.code}:`, err);
      }
    }

    return NextResponse.json({ 
      success: true, 
      count: totalInserted, 
      message: 'Všechny vybrané ligy úspěšně staženy!' 
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}