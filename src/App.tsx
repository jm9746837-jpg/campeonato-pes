import { useState, useEffect, useMemo } from 'react';
import { Team, Match, TeamStats } from './types/league';
import { initialTeams, initialMatches } from './data/initialData';
import StandingsTable from './components/StandingsTable';
import RoundMatches from './components/RoundMatches';
import TeamManager from './components/TeamManager';

function App() {
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
    if (totalTeams < 2) {
      setMatches([]);
      return;
    }

    const newMatches: Match[] = [];
    const teamIds = teamList.map(team => team.id);
    
    // Se for ímpar, adiciona um "Dummy" para o algoritmo funcionar
    const tempTeamIds = [...teamIds];
    if (tempTeamIds.length % 2 !== 0) {
      tempTeamIds.push('BYE');
    }

    const n = tempTeamIds.length;
    const totalRounds = n - 1;
    const matchesPerRound = n / 2;

    for (let round = 0; round < totalRounds; round++) {
      for (let i = 0; i < matchesPerRound; i++) {
        const home = tempTeamIds[i];
        const away = tempTeamIds[n - 1 - i];
        
        if (home !== 'BYE' && away !== 'BYE') {
          newMatches.push({
            id: `r${round + 1}-m${i}`,
            homeTeamId: home,
            awayTeamId: away,
            homeScore: null,
            awayScore: null,
            round: round + 1,
            played: false,
          });
        }
      }
      tempTeamIds.splice(1, 0, tempTeamIds.pop()!);
    }

    setMatches(newMatches);
  };

  const stats = useMemo<TeamStats[]>(() => {
    const teamStatsMap = new Map<string, TeamStats>();
    teams.forEach(team => {
      teamStatsMap.set(team.id, {
        teamId: team.id, played: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0, points: 0,
      });
    });

    matches.forEach(match => {
      if (!match.played || match.homeScore === null || match.awayScore === null) return;
      const homeStats = teamStatsMap.get(match.homeTeamId);
      const awayStats = teamStatsMap.get(match.awayTeamId);
      if (!homeStats || !awayStats) return;
      
      homeStats.played++;
      homeStats.goalsFor += match.homeScore;
      homeStats.goalsAgainst += match.awayScore;
      awayStats.played++;
      awayStats.goalsFor += match.awayScore;
      awayStats.goalsAgainst += match.homeScore;
      
      if (match.homeScore > match.awayScore) {
        homeStats.wins++; homeStats.points += 3; awayStats.losses++;
      } else if (match.homeScore < match.awayScore) {
        homeStats.losses++; awayStats.wins++; awayStats.points += 3;
      } else {
        homeStats.draws++; homeStats.points += 1; awayStats.draws++; awayStats.points += 1;
      }
    });
    return Array.from(teamStatsMap.values());
  }, [teams, matches]);

  const handleScoreSubmit = (matchId: string, homeScore: number, awayScore: number) => {
    setMatches(prev => prev.map(match => 
      match.id === matchId ? { ...match, homeScore, awayScore, played: true } : match
    ));
  };

  const handleAddTeam = (teamData: Omit<Team, 'id'>) => {
    const newTeam: Team = { ...teamData, id: Date.now().toString() };
    setTeams(prev => [...prev, newTeam]);
  };

  const handleRemoveTeam = (teamId: string) => {
    setTeams(prev => prev.filter(team => team.id !== teamId));
    setMatches([]); // Limpa as partidas para forçar a gerar nova tabela
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <header className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Liga de Futebol Manager</h1>
            <p className="text-gray-600">Gerencie sua liga e acompanhe a classificação</p>
          </div>
          <div className="bg-white px-6 py-3 rounded-xl shadow-md border border-gray-100">
            <div className="text-sm text-gray-500 text-center">Times na liga</div>
            <div className="text-2xl font-bold text-blue-600 text-center">{teams.length}</div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <StandingsTable teams={teams} stats={stats} />
        </div>
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Resumo da Liga</h2>
            <div className="space-y-3">
              <div className="flex justify-between border-b pb-2"><span className="text-gray-600">Rodadas</span><span className="font-semibold">{Math.max(0, teams.length - 1)}</span></div>
              <div className="flex justify-between border-b pb-2"><span className="text-gray-600">Jogos Realizados</span><span className="font-semibold">{matches.filter(m => m.played).length} / {matches.length}</span></div>
            </div>
          </div>
          
          <div className="bg-blue-600 rounded-xl shadow-lg p-6 text-white">
            <h2 className="text-xl font-bold mb-3">Como funciona</h2>
            <ul className="space-y-2 text-sm opacity-90">
              <li>• Adicione seus times</li>
              <li>• Clique em "Gerar Tabela de Jogos"</li>
              <li>• Registre os placares após os jogos</li>
            </ul>
          </div>
        </div>
      </div>

      {/* BOTÃO DE GERAR JOGOS - APARECE QUANDO HÁ TIMES MAS NÃO HÁ JOGOS */}
      {teams.length >= 2 && matches.length === 0 && (
        <div className="flex justify-center mb-8">
          <button
            onClick={() => generateMatches(teams)}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-12 rounded-xl shadow-xl transition-all transform hover:scale-105"
          >
            ⚽ Gerar Tabela de Jogos
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {matches.length > 0 ? (
            <RoundMatches
              matches={matches}
              teams={teams}
              currentRound={currentRound}
              onScoreSubmit={handleScoreSubmit}
              onRoundChange={setCurrentRound}
            />
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 p-8 rounded-xl text-center text-yellow-700">
              Adicione pelo menos 2 times e clique no botão acima para começar!
            </div>
          )}
        </div>
        <div>
          <TeamManager teams={teams} onAddTeam={handleAddTeam} onRemoveTeam={handleRemoveTeam} />
        </div>
      </div>

      <footer className="mt-12 py-6 text-center text-gray-400 text-xs border-t">
        <p>Dados salvos automaticamente no seu navegador</p>
      </footer>
    </div>
  );
}

export default App;              
