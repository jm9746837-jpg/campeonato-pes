import { Team, TeamStats } from '../types/league';

interface StandingsTableProps {
  teams: Team[];
  stats: TeamStats[];
}

export default function StandingsTable({ teams, stats }: StandingsTableProps) {
  // Combine stats with team info and sort by points, then goal difference, then goals for
  const standings = stats
    .map(stat => {
      const team = teams.find(t => t.id === stat.teamId);
      return {
        ...stat,
        teamName: team?.name || 'Unknown',
        shortName: team?.shortName || 'UNK',
        goalDifference: stat.goalsFor - stat.goalsAgainst,
      };
    })
    .sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
      return b.goalsFor - a.goalsFor;
    });

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Classificação</h2>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 text-gray-600 font-semibold">Pos.</th>
              <th className="text-left py-3 px-4 text-gray-600 font-semibold">Time</th>
              <th className="text-center py-3 px-4 text-gray-600 font-semibold">P</th>
              <th className="text-center py-3 px-4 text-gray-600 font-semibold">V</th>
              <th className="text-center py-3 px-4 text-gray-600 font-semibold">E</th>
              <th className="text-center py-3 px-4 text-gray-600 font-semibold">D</th>
              <th className="text-center py-3 px-4 text-gray-600 font-semibold">GP</th>
              <th className="text-center py-3 px-4 text-gray-600 font-semibold">GC</th>
              <th className="text-center py-3 px-4 text-gray-600 font-semibold">SG</th>
              <th className="text-center py-3 px-4 text-gray-600 font-semibold">Pts</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((standing, index) => (
              <tr 
                key={standing.teamId} 
                className={`border-b border-gray-100 hover:bg-gray-50 ${index < 4 ? 'bg-blue-50' : ''}`}
              >
                <td className="py-4 px-4">
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full ${index < 4 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                    {index + 1}
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold mr-3">
                      {standing.shortName}
                    </div>
                    <span className="font-medium text-gray-800">{standing.teamName}</span>
                  </div>
                </td>
                <td className="text-center py-4 px-4 text-gray-700">{standing.played}</td>
                <td className="text-center py-4 px-4 text-gray-700">{standing.wins}</td>
                <td className="text-center py-4 px-4 text-gray-700">{standing.draws}</td>
                <td className="text-center py-4 px-4 text-gray-700">{standing.losses}</td>
                <td className="text-center py-4 px-4 text-gray-700 font-medium">{standing.goalsFor}</td>
                <td className="text-center py-4 px-4 text-gray-700">{standing.goalsAgainst}</td>
                <td className="text-center py-4 px-4 font-medium">
                  <span className={`px-2 py-1 rounded-full text-sm ${standing.goalDifference >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {standing.goalDifference > 0 ? '+' : ''}{standing.goalDifference}
                  </span>
                </td>
                <td className="text-center py-4 px-4">
                  <div className="bg-gradient-to-r from-green-500 to-green-600 text-white font-bold py-1 px-3 rounded-full inline-block">
                    {standing.points}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-6 text-sm text-gray-500">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-blue-100 border border-blue-300 mr-2"></div>
            <span>Classificados para a fase final</span>
          </div>
        </div>
      </div>
    </div>
  );
}
