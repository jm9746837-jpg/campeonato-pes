import { useState, useEffect, useMemo } from 'react';
// Aqui dizemos ao código para buscar nas pastas novas que você criou
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

  // Salvar dados no localStorage sempre que mudar
  useEffect(() => {
    localStorage.setItem('leagueTeams', JSON.stringify(teams));
    localStorage.setItem('leagueMatches', JSON.stringify(matches));
  }, [teams, matches]);

  // Recalcular partidas quando times mudam
  useEffect(() => {
    if (teams.length > 0) {
      const savedMatches = localStorage.getItem('leagueMatches');
      if (savedMatches) {
        const parsedMatches: Match[] = JSON.parse(savedMatches);
        // Filtrar partidas que ainda têm times válidos
        const validMatches = parsedMatches.filter(match => 
          teams.some(t => t.id === match.homeTeamId) && 
          teams.some(t => t.id === match.awayTeamId)
        );
        setMatches(validMatches);
      } else {
        // Gerar novas partidas
        generateMatches(teams);
      }
    } else {
      setMatches([]);
    }
  }, [teams]);

  const generateMatches = (teamList: Team[]) => {
    const totalTeams = teamList.length;
    if (totalTeams < 2) {
      setMatches([]);
      return;
    }

    const newMatches: Match[] = [];
    const teamIds = teamList.map(team => team.id);
    const totalRounds = totalTeams - 1;
    const matchesPerRound = totalTeams / 2;

    // Algoritmo round-robin
    for (let round = 0; round < totalRounds; round++) {
      for (let i = 0; i < matchesPerRound; i++) {
        const homeIdx = i;
        const awayIdx = totalTeams - 1 - i;
        
        const homeTeamId = round % 2 === 0 ? teamIds[homeIdx] : teamIds[awayIdx];
        const awayTeamId = round % 2 === 0 ? teamIds[awayIdx] : teamIds[homeIdx];
        
        newMatches.push({
          id: `round${round + 1}-match${i + 1}`,
          homeTeamId,
          awayTeamId,
          homeScore: null,
          awayScore: null,
          round: round + 1,
          played: false,
        });
      }
      
      // Rotacionar times (manter o primeiro fixo)
      const last = teamIds.pop();
      if (last) {
        teamIds.splice(1, 0, last);
      }
    }

    setMatches(newMatches);
    localStorage.setItem('leagueMatches', JSON.stringify(newMatches));
  };

  // Calcular estatísticas
  const stats = useMemo<TeamStats[]>(() => {
    const teamStatsMap = new Map<string, TeamStats>();
    
    // Inicializar estatísticas para todos os times
    teams.forEach(team => {
      teamStatsMap.set(team.id, {
        teamId: team.id,
        played: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        points: 0,
      });
    });

    // Processar partidas jogadas
    matches.forEach(match => {
      if (!match.played || match.homeScore === null || match.awayScore === null) return;
      
      const homeStats = teamStatsMap.get(match.homeTeamId);
      const awayStats = teamStatsMap.get(match.awayTeamId);
      
      if (!homeStats || !awayStats) return;
      
      // Atualizar estatísticas do time da casa
      homeStats.played++;
      homeStats.goalsFor += match.homeScore;
      homeStats.goalsAgainst += match.awayScore;
      
      // Atualizar estatísticas do time visitante
      awayStats.played++;
      awayStats.goalsFor += match.awayScore;
      awayStats.goalsAgainst += match.homeScore;
      
      // Determinar resultado
      if (match.homeScore > match.awayScore) {
        homeStats.wins++;
        homeStats.points += 3;
        awayStats.losses++;
      } else if (match.homeScore < match.awayScore) {
        homeStats.losses++;
        awayStats.wins++;
        awayStats.points += 3;
      } else {
        homeStats.draws++;
        homeStats.points += 1;
        awayStats.draws++;
        awayStats.points += 1;
      }
      
      teamStatsMap.set(match.homeTeamId, homeStats);
      teamStatsMap.set(match.awayTeamId, awayStats);
    });

    return Array.from(teamStatsMap.values());
  }, [teams, matches]);

  const handleScoreSubmit = (matchId: string, homeScore: number, awayScore: number) => {
    setMatches(prev => prev.map(match => 
      match.id === matchId 
        ? { 
            ...match, 
            homeScore, 
            awayScore, 
            played: true 
          }
        : match
    ));
  };

  const handleAddTeam = (teamData: Omit<Team, 'id'>) => {
    const newTeam: Team = {
      ...teamData,
      id: Date.now().toString(),
    };
    setTeams(prev => [...prev, newTeam]);
  };

  const handleRemoveTeam = (teamId: string) => {
    setTeams(prev => prev.filter(team => team.id !== teamId));
    // Remover partidas envolvendo este time
    setMatches(prev => prev.filter(match => 
      match.homeTeamId !== teamId && match.awayTeamId !== teamId
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-zinc-100 p-4 md:p-8">
      <header className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Liga de Futebol Manager</h1>
            <p className="text-gray-600 mt-2">Gerencie sua liga, adicione placares e acompanhe a classificação</p>
          </div>
          <div className="bg-white px-6 py-3 rounded-xl shadow-md">
            <div className="text-sm text-gray-500">Times na liga</div>
            <div className="text-2xl font-bold text-gray-800">{teams.length}</div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <StandingsTable teams={teams} stats={stats} />
        </div>
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Resumo da Liga</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total de Times</span>
                <span className="font-semibold">{teams.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Rodadas</span>
                <span className="font-semibold">
                  {Math.max(0, teams.length - 1)} (turno único)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Partidas Jogadas</span>
                <span className="font-semibold">
                  {matches.filter(m => m.played).length} / {matches.length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Gols Marcados</span>
                <span className="font-semibold">
                  {stats.reduce((sum, stat) => sum + stat.goalsFor, 0)}
                </span>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
            <h2 className="text-xl font-bold mb-3">Como funciona</h2>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Adicione seus times</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Jogue as partidas no video game</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Registre os placares aqui</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Acompanhe a classificação automaticamente</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <RoundMatches
            matches={matches}
            teams={teams}
            currentRound={currentRound}
            onScoreSubmit={handleScoreSubmit}
            onRoundChange={setCurrentRound}
          />
        </div>
        <div>
          <TeamManager
            teams={teams}
            onAddTeam={handleAddTeam}
            onRemoveTeam={handleRemoveTeam}
          />
        </div>
      </div>

      <footer className="mt-12 pt-6 border-t border-gray-200 text-center text-gray-500 text-sm">
        <p>Liga de Futebol Manager • Desenvolvido para gerenciar sua liga personalizada</p>
        <p className="mt-2">Os dados são salvos automaticamente no seu navegador</p>
      </footer>
    </div>
  );
}

export default App;
