import { Match, Team } from '../types/league';
import MatchScoreInput from './MatchScoreInput';

interface RoundMatchesProps {
  matches: Match[];
  teams: Team[];
  currentRound: number;
  onUpdateScore: (matchId: string, homeScore: number, awayScore: number) => void;
}

export default function RoundMatches({ matches, teams, currentRound, onUpdateScore }: RoundMatchesProps) {
  const roundMatches = matches.filter(m => m.round === currentRound);

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Rodada {currentRound}</h2>
      <div className="space-y-4">
        {roundMatches.map(match => (
          <MatchScoreInput
            key={match.id}
            match={match}
            teams={teams}
            onUpdateScore={onUpdateScore}
          />
        ))}
      </div>
    </div>
  );
}
