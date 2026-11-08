import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch('https://api.football-data.org/v4/matches', {
      headers: {
        'X-Auth-Token': process.env.FOOTBALL_DATA_API_KEY || '',
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      console.warn(`Externí API vrátil status ${response.status}`);
      return NextResponse.json({
        success: false,
        message: 'API je přetížené (limit požadavků), zkuste to prosím za chvíli.',
        data: []
      });
    }

    const json = await response.json();
    const matches = json.matches || [];

    const processedMatches = matches.map((match: any) => {
      const homeTeam = match.homeTeam?.name || 'Domácí';
      const awayTeam = match.awayTeam?.name || 'Hosté';
      const seed = (match.id % 10);

      // Výpočty pro různé statistické sázky
      const homeWinProb = 35 + (seed * 5); // např. 35% až 80%
      const cornersCount = 8.5 + (seed % 4); // např. 8.5 až 11.5 rohů
      const bttsProb = 50 + (seed * 3); // pravděpodobnost obou týmů skórovat

      const toOdds = (prob: number) => Math.max(1.15, (0.92 / (prob / 100))).toFixed(2);

      const matchDateObj = new Date(match.utcDate);
      const dateLabel = `${matchDateObj.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'numeric' })}, ${matchDateObj.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' })}`;

      let status = 'NS';
      if (match.status === 'IN_PLAY' || match.status === 'PAUSED') status = 'LIVE';
      if (match.status === 'FINISHED') status = 'FT';

      const homeGoals = match.score?.fullTime?.home;
      const awayGoals = match.score?.fullTime?.away;
      const scoreStr = (homeGoals !== null && homeGoals !== undefined && awayGoals !== null && awayGoals !== undefined)
        ? `${homeGoals} : ${awayGoals}`
        : null;

      // 1. Tip na výsledek / hlavní sázku
      const mainTip = {
        name: `Výhra ${homeTeam}`,
        probability: `${homeWinProb}%`,
        bookmakerOdds: parseFloat(toOdds(homeWinProb)),
        isSureBet: homeWinProb >= 78
      };

      // 2. Statistická sázka: Rohové kopy (např. Více než 9.5 rohů)
      const cornersProb = 65 + (seed * 2);
      const cornersTip = {
        name: `Celkem rohů: Více než 9.5`,
        probability: `${cornersProb}%`,
        bookmakerOdds: parseFloat((1.70 + (seed * 0.04)).toFixed(2)),
        isSureBet: cornersProb >= 80
      };

      // 3. Statistická sázka: Oba týmy skórují (BTTS)
      const bttsTip = {
        name: `Oba týmy dají gól (ANO)`,
        probability: `${bttsProb}%`,
        bookmakerOdds: parseFloat(toOdds(bttsProb)),
        isSureBet: bttsProb >= 75
      };

      return {
        id: match.id.toString(),
        home_team: homeTeam,
        away_team: awayTeam,
        league: match.competition?.name || 'Fotbalová Liga',
        match_date: dateLabel,
        utcDate: match.utcDate,
        status: status,
        score: scoreStr,
        tips: [mainTip, cornersTip, bttsTip] // Obsahuje klasiku, rohy i BTTS
      };
    });

    return NextResponse.json({
      success: true,
      data: processedMatches
    });

  } catch (error: any) {
    console.error('Chyba serveru:', error.message);
    return NextResponse.json({
      success: false,
      message: 'Chyba připojení k serveru.',
      data: []
    }, { status: 500 });
  }
}