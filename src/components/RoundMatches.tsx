import { Match, Team } from '../types/league';
import MatchScoreInput from './MatchScoreInput';

interface RoundMatchesProps {
  matches: Match[];
  teams: Team[];
  currentRound: number;
  onScoreSubmit: (matchId: string, homeScore: number, awayScore: number) => void;
  onRoundChange: (round: number) => void;
}

export default function RoundMatches({ 
  matches, 
  teams, 
  currentRound, 
  onScoreSubmit,
  onRoundChange 
}: RoundMatchesProps) {
  const rounds = Array.from(new Set(matches.map(m => m.round))).sort((a, b) => a - b);
  const roundMatches = matches.filter(match => match.round === currentRound);
  
  const getTeam = (teamId: string) => teams.find(team => team.id === teamId);
  
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Rodada {currentRound}</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => onRoundChange(currentRound - 1)}
            disabled={currentRound === 1}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← Anterior
          </button>
          <select
            value={currentRound}
            onChange={(e) => onRoundChange(parseInt(e.target.value))}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            {rounds.map(round => (
              <option key={round} value={round}>Rodada {round}</option>
            ))}
          </select>
          <button
            onClick={() => onRoundChange(currentRound + 1)}
            disabled={currentRound === rounds.length}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Próxima →
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {roundMatches.map(match => {
          const homeTeam = getTeam(match.homeTeamId);
          const awayTeam = getTeam(match.awayTeamId);
          
          return (
            <div key={match.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-center mb-4">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold mr-3">
                      {homeTeam?.shortName || '???'}
                    </div>
                    <span className="font-medium">{homeTeam?.name || 'Time Desconhecido'}</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center text-white font-bold mr-3">
                      {awayTeam?.shortName || '???'}
                    </div>
                    <span className="font-medium">{awayTeam?.name || 'Time Desconhecido'}</span>
                  </div>
                </div>
                
                <div className="text-center mx-4">
                  {match.played ? (
                    <>
                      <div className="text-3xl font-bold text-gray-800">
                        {match.homeScore} - {match.awayScore}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {match.homeScore === match.awayScore ? 'Empate' : 
                         match.homeScore! > match.awayScore! ? 'Vitória da casa' : 'Vitória visitante'}
                      </div>
                    </>
                  ) : (
                    <div className="text-gray-400 font-medium">Aguardando</div>
                  )}
                </div>
              </div>
              
              <MatchScoreInput
                match={match}
                onScoreSubmit={(homeScore, awayScore) => onScoreSubmit(match.id, homeScore, awayScore)}
              />
            </div>
          );
        })}
      </div>
      
      <div className="mt-6 text-sm text-gray-500">
        <p>Total de jogos na rodada: {roundMatches.length} • Jogos realizados: {roundMatches.filter(m => m.played).length}</p>
      </div>
    </div>
  );
}