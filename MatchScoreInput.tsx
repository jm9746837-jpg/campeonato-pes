import { useState } from 'react';
import { Match } from '../types/league';

interface MatchScoreInputProps {
  match: Match;
  onScoreSubmit: (homeScore: number, awayScore: number) => void;
}

export default function MatchScoreInput({ match, onScoreSubmit }: MatchScoreInputProps) {
  const [homeScore, setHomeScore] = useState<string>(match.homeScore?.toString() || '');
  const [awayScore, setAwayScore] = useState<string>(match.awayScore?.toString() || '');
  const [isEditing, setIsEditing] = useState(!match.played);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const home = parseInt(homeScore);
    const away = parseInt(awayScore);
    
    if (isNaN(home) || isNaN(away) || home < 0 || away < 0) {
      alert('Por favor, insira placares válidos (números positivos)');
      return;
    }
    
    onScoreSubmit(home, away);
    setIsEditing(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  if (match.played && !isEditing) {
    return (
      <div className="flex justify-between items-center">
        <div className="text-green-600 font-medium">
          ✓ Resultado registrado
        </div>
        <button
          onClick={handleEdit}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
        >
          Editar placar
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <label className="text-gray-600">Casa:</label>
            <input
              type="number"
              min="0"
              value={homeScore}
              onChange={(e) => setHomeScore(e.target.value)}
              className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-center"
              placeholder="0"
            />
          </div>
          <span className="text-gray-400">×</span>
          <div className="flex items-center space-x-2">
            <label className="text-gray-600">Visitante:</label>
            <input
              type="number"
              min="0"
              value={awayScore}
              onChange={(e) => setAwayScore(e.target.value)}
              className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-center"
              placeholder="0"
            />
          </div>
        </div>
        
        <div className="flex space-x-2">
          <button
            type="submit"
            className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 font-medium"
          >
            Salvar placar
          </button>
          {match.played && (
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              Cancelar
            </button>
          )}
        </div>
      </div>
      
      <div className="text-xs text-gray-500">
        <p>• Vitória: 3 pontos • Empate: 1 ponto cada • Derrota: 0 pontos</p>
      </div>
    </form>
  );
}