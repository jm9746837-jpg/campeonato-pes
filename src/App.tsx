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
    if (totalTeams < 2) return;

    const newMatches: Match[] = [];
    const teamIds = [...teamList.map(t => t.id)];
    
    if (teamIds.length % 2 !== 0) teamIds.push('BYE');

    const n = teamIds.length;
    const rounds = n - 1;
    const matchesPerRound = n / 2;

    for (let r = 0; r < rounds; r++) {
      for (let i = 0; i < matchesPerRound; i++) {
        const home = teamIds[i];
        const away = teamIds[n - 1 - i];
        
        if (home !== 'BYE' && away !== 'BYE') {
          newMatches.push({
            id: `r${r+1}-m${i}-${Date.now()}`,
            homeTeamId: home,
            awayTeamId: away,
            homeScore: null,
            awayScore: null,
            round: r + 1,
            played: false,
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
      if (!h || !a) return;
      
      h.played++; a.played++;
      h.goalsFor += m.homeScore; h.goalsAgainst += m.awayScore;
      a.goalsFor += m.awayScore; a.goalsAgainst += m.homeScore;
      
      if (m.homeScore > m.awayScore) { h.wins++; h.points += 3; a.losses++; }
      else if (m.homeScore < m.awayScore) { a.wins++; a.points += 3; h.losses++; }
      else { h.draws++; h.points += 1; a.draws++; a.points += 1; }
    });
    return Array.from(teamStatsMap.values());
  }, [teams, matches]);

  const handleUpdateScore = (matchId: string, homeScore: number, awayScore: number) => {
    setMatches(prev => prev.map(m => 
      m.id === matchId ? { ...m, homeScore, awayScore, played: true } : m
    ));
  };

  const handleAddTeam = (teamData: Omit<Team, 'id'>) => {
    setTeams(prev => [...prev, { ...teamData, id: Date.now().toString() }]);
  };

  const handleRemoveTeam = (id: string) => {
    setTeams(prev => prev.filter(t => t.id !== id));
    setMatches([]); // Limpa para forçar nova geração
  };

  const totalRounds = matches.length > 0 ? Math.max(...matches.map(m => m.round)) : 0;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Liga de Futebol Manager</h1>
          <p className="text-sm text-gray-500">Gerencie sua liga e acompanhe a
