import { NextResponse } from 'next/server';

function calculateLolOdds(homeTeam: string, awayTeam: string, matchId: string) {
  const seed = (matchId.length + homeTeam.length + awayTeam.length) % 10;
  const homeWinProb = 40 + (seed * 4); 
  const awayWinProb = 100 - homeWinProb;
  const overMapsProb = 50 + (seed * 3); 

  const toOdds = (prob: number) => (0.95 / (prob / 100)).toFixed(2);

  return {
    homeWin: { prob: `${homeWinProb}%`, odds: parseFloat(toOdds(homeWinProb)) },
    awayWin: { prob: `${awayWinProb}%`, odds: parseFloat(toOdds(awayWinProb)) },
    overMaps: { prob: `${overMapsProb}%`, odds: parseFloat(toOdds(overMapsProb)) }
  };
}

export async function GET() {
  try {
    const response = await fetch(
      'https://esports-api.lolesports.com/persisted/gw/getSchedule?hl=cs-CZ',
      {
        headers: {
          'x-api-key': '08a9419864227180e81f4d73310ed552',
        },
        cache: 'no-store'
      }
    );

    if (!response.ok) {
      throw new Error(`LoL Esports API odpovědělo s chybou: ${response.status}`);
    }

    const rawData = await response.json();
    const events = rawData?.data?.schedule?.events || [];
    const today = new Date();

    // Zvýšeno na 80 zápasů pro pokrytí celého měsíce
    const formattedMatches = events.slice(0, 80).map((event: any) => {
      const matchDateObj = new Date(event.startTime);
      const isToday = matchDateObj.getDate() === today.getDate();
      
      const dateLabel = isToday 
        ? `Dnes, ${matchDateObj.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' })}`
        : `${matchDateObj.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'numeric' })}, ${matchDateObj.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' })}`;

      const homeTeam = event.match?.teams[0]?.name || 'Tým A';
      const awayTeam = event.match?.teams[1]?.name || 'Tým B';
      const leagueName = event.league?.name || 'League of Legends';

      let status = 'NS';
      if (event.state === 'inProgress') status = 'LIVE';
      else if (event.state === 'completed') status = 'FT';

      const homeScore = event.match?.teams[0]?.result?.gameWins ?? 0;
      const awayScore = event.match?.teams[1]?.result?.gameWins ?? 0;
      const score = (status === 'LIVE' || status === 'FT') ? `${homeScore} : ${awayScore}` : null;

      const odds = calculateLolOdds(homeTeam, awayTeam, event.id || '1');

      return {
        id: event.id || Math.random().toString(),
        home_team: homeTeam,
        away_team: awayTeam,
        league: leagueName,
        match_date: dateLabel,
        raw_date: matchDateObj.toISOString(),
        status: status,
        score: score,
        strategy: event.match?.strategy?.type || 'Bo3',
        tips: [
          {
            name: `Výhra ${homeTeam}`,
            probability: odds.homeWin.prob,
            bookmakerOdds: odds.homeWin.odds,
            isSureBet: parseInt(odds.homeWin.prob) > 65
          },
          {
            name: `Výhra ${awayTeam}`,
            probability: odds.awayWin.prob,
            bookmakerOdds: odds.awayWin.odds,
            isSureBet: parseInt(odds.awayWin.prob) > 65
          },
          {
            name: `Více než 2.5 map`,
            probability: odds.overMaps.prob,
            bookmakerOdds: odds.overMaps.odds,
            isSureBet: false
          }
        ]
      };
    });

    return NextResponse.json({
      success: true,
      data: formattedMatches
    });

  } catch (error: any) {
    console.error('Chyba při stahování LoL zápasů:', error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}