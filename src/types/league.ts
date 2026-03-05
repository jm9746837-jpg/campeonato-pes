export interface Team { id: string; name: string; shortName: string; }
export interface Match { id: string; homeTeamId: string; awayTeamId: string; homeScore: number | null; awayScore: number | null; round: number; played: boolean; }
export interface TeamStats { teamId: string; played: number; wins: number; draws: number; losses: number; goalsFor: number; goalsAgainst: number; points: number; }
