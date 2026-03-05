import { useState } from 'react';
import { Team } from '../types/league';

interface TeamManagerProps {
  teams: Team[];
  onAddTeam: (team: Omit<Team, 'id'>) => void;
  onRemoveTeam: (teamId: string) => void;
  onResetLeague: () => void;
}

export default function TeamManager({ teams, onAddTeam, onRemoveTeam }: TeamManagerProps) {
  const [name, setName] = useState('');
  const [shortName, setShortName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !shortName.trim()) {
      alert('Por favor, preencha o nome e a sigla do time');
      return;
    }
    
    onAddTeam({ name, shortName });
    setName('');
    setShortName('');
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Gerenciar Times</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 mb-2">Nome do Time</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ex: Flamengo"
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Sigla</label>
            <input
              type="text"
              value={shortName}
              onChange={(e) => setShortName(e.target.value.toUpperCase())}
              maxLength={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ex: FLA"
            />
          </div>
        </div>
        <button
          type="submit"
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 font-medium"
        >
          Adicionar Time
        </button>
      </form>
      
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Times da Liga ({teams.length})</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {teams.map(team => (
            <div key={team.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold mr-3">
                  {team.shortName}
                </div>
                <span className="font-medium">{team.name}</span>
              </div>
              <button
                onClick={() => onRemoveTeam(team.id)}
                className="px-3 py-1 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 text-sm"
              >
                Remover
              </button>
            </div>
          ))}
        </div>
        
        {teams.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>Nenhum time adicionado ainda. Adicione times para começar a liga!</p>
          </div>
        )}
      </div>
      
      <div className="mt-6 text-sm text-gray-500">
        <p>⚠️ Aviso: Remover times irá reiniciar todos os jogos da liga.</p>
      </div>
    </div>
  );
}
