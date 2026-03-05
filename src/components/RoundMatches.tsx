import { Team, Match } from '../types/league';

interface RoundMatchesProps {
  matches: Match[];
  teams: Team[];
  currentRound: number;
  onUpdateScore: (matchId: string, homeScore: number, awayScore: number) => void;
}

export default function RoundMatches({ matches, teams, currentRound, onUpdateScore }: RoundMatchesProps) {
  const roundMatches = matches.filter(m => m.round === currentRound);

  const getTeamName = (id: string) => teams.find(t => t.id === id)?.name || "Time";

  return (
    <div className="space-y-4">
      {roundMatches.map((match) => (
        <div key={match.id} className="bg-white p-4 rounded-xl shadow-sm border flex items-center justify-between gap-2">
          <div className="flex-1 text-right font-bold truncate">{getTeamName(match.homeTeamId)}</div>
          
          <div className="flex items-center gap-2">
            <input 
              type="number" 
              className="w-12 border rounded text-center p-1" 
              defaultValue={match.homeScore ?? 0}
              id={`home-${match.id}`}
            />
            <span>x</span>
            <input 
              type="number" 
              className="w-12 border rounded text-center p-1" 
              defaultValue={match.awayScore ?? 0}
              id={`away-${match.id}`}
            />
          </div>

          <div className="flex-1 text-left font-bold truncate">{getTeamName(match.awayTeamId)}</div>

          <button 
            onClick={() => {
              const h = Number((document.getElementById(`home-${match.id}`) as HTMLInputElement).value);
              const a = Number((document.getElementById(`away-${match.id}`) as HTMLInputElement).value);
              onUpdateScore(match.id, h, a);
            }}
            className="bg-green-500 text-white px-3 py-1 rounded text-sm font-bold"
          >
            Salvar
          </button>
        </div>
      ))}
    </div>
  );
}
