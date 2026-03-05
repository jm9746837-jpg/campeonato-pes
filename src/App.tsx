import { useState, useEffect, useMemo } from 'react';
import { Team, Match, TeamStats } from './types/league';
import { initialTeams, initialMatches } from './data/initialData';
import StandingsTable from './components/StandingsTable';
import RoundMatches from './components/RoundMatches';
import TeamManager from './components/TeamManager';

export default function App() {
  const [teams, setTeams] = useState<Team[]>(() => {
    const saved = localStorage.getItem('leagueTeams');
    return saved ? JSON.parse(saved) : initialTeams;
  });
  
  const [matches, setMatches] = useState<Match[]>(() => {
    const saved = localStorage.getItem('leagueMatches');
    return saved ? JSON.parse(saved) : initialMatches;
  });
  
  const [currentRound, setCurrentRound] = useState(1);

  useEffect(() => {
    localStorage.setItem('leagueTeams', JSON.stringify(teams));
    localStorage.setItem('leagueMatches', JSON.stringify(matches));
  }, [teams, matches]);

  const generateMatches = (teamList: Team[]) => {
    const totalTeams = teamList.length;
    if (totalTeams < 2) return;
    const newMatches: Match[] = [];
    const teamIds = [...teamList.map(t => t.id)];
    if (teamIds.length % 2 !== 0) teamIds.push('BYE');
    const n = teamIds.length;
    const rounds = n - 1;
    for (let r = 0; r < rounds; r++) {
      for (let i = 0; i < n / 2; i++) {
        const home = teamIds[i];
        const away = teamIds[n - 1 - i];
        if (home !== 'BYE' && away !== 'BYE') {
          newMatches.push({
            id: `r${r+1}-m${i}-${Date.now()}`,
            homeTeamId: home, awayTeamId: away,
            homeScore: null, awayScore: null,
            round: r + 1, played: false,
          });
        }
      }
      teamIds.splice(1, 0, teamIds.pop()!);
    }
    setMatches(newMatches);
    setCurrentRound(1);
  };

  const stats = useMemo<TeamStats[]>(() => {
    const teamStatsMap = new Map<string, TeamStats>();
    teams.forEach(t => teamStatsMap.set(t.id, {
      teamId: t.id, played: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, points: 0,
    }));
    matches.forEach(m => {
      if (!m.played || m.homeScore === null || m.awayScore === null) return;
      const h = teamStatsMap.get(m.homeTeamId);
      const a = teamStatsMap.get(m.awayTeamId);
      if (h && a) {
        h.played++; a.played++;
        h.goalsFor += m.homeScore; h.goalsAgainst += m.awayScore;
        a.goalsFor += m.awayScore; a.goalsAgainst += m.homeScore;
        if (m.homeScore > m.awayScore) { h.wins++; h.points += 3; a.losses++; }
        else if (m.homeScore < m.awayScore) { a.wins++; a.points += 3; h.losses++; }
        else { h.draws++; h.points += 1; a.draws++; a.points += 1; }
      }
    });
    return Array.from(teamStatsMap.values());
  }, [teams, matches]);

  const handleUpdateScore = (matchId: string, homeScore: number, awayScore: number) => {
    setMatches(prev => prev.map(m => m.id === matchId ? { ...m, homeScore, awayScore, played: true } : m));
  };

  const totalRounds = matches.length > 0 ? Math.max(...matches.map(m => m.round)) : 0;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 text-gray-900">
      <header className="mb-8 flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold">Liga de Futebol Manager</h1>
          <p className="text-sm text-gray-500">Gerencie sua liga e placares</p>
        </div>
        <div className="text-center bg-blue-50 px-4 py-2 rounded-xl">
          <div className="text-xs text-blue-400 font-bold uppercase">Times</div>
          <div className="text-xl font-bold text-blue-600">{teams.length}</div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <StandingsTable teams={teams} stats={stats} />
          
          {teams.length >= 2 && matches.length === 0 && (
            <button onClick={() => generateMatches(teams)} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold shadow-lg transition-transform active:scale-95">
              ⚽ Gerar Tabela de Jogos
            </button>
          )}

          {matches.length > 0 && (
            <div className="space-y-4">
              <RoundMatches matches={matches} teams={teams} currentRound={currentRound} onUpdateScore={handleUpdateScore} />
              <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <button disabled={currentRound === 1} onClick={() => setCurrentRound(c => c - 1)} className="px-6 py-2 bg-gray-100 rounded-lg disabled:opacity-30">Anterior</button>
                <span className="font-bold">Rodada {currentRound} de {totalRounds}</span>
                <button disabled={currentRound === totalRounds} onClick={() => setCurrentRound(c => c + 1)} className="px-6 py-2 bg-gray-100 rounded-lg disabled:opacity-30">Próxima</button>
              </div>
            </div>
          )}
        </div>
        <aside>
          <TeamManager teams={teams} onAddTeam={(t) => setTeams([...teams, {...t, id: Date.now().toString()}])} onRemoveTeam={(id) => { setTeams(teams.filter(t => t.id !== id)); setMatches([]); }} />
        </aside>
      </div>
    </div>
  );
}
