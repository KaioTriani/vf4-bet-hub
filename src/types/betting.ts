export interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  status: 'scheduled' | 'live' | 'finished';
  minute?: number;
  competition: string;
  date: string;
  time: string;
  isVF4Home: boolean;
  odds: MatchOdds;
}

export interface MatchOdds {
  home: number;
  draw: number;
  away: number;
  over15: number;
  under15: number;
  over25: number;
  under25: number;
  btts: number;
  noBtts: number;
  vf4Wins: number;
  vf4NotWins: number;
  firstGoalHome: number;
  firstGoalAway: number;
  noGoal: number;
}

export interface Bet {
  id: string;
  matchId: string;
  type: BetType;
  selection: string;
  odds: number;
  stake: number;
  potentialWin: number;
  status: 'pending' | 'won' | 'lost';
  timestamp: Date;
}

export type BetType = 
  | 'match_result' 
  | 'over_under' 
  | 'btts' 
  | 'vf4_result' 
  | 'first_goal';

export interface User {
  id: string;
  username: string;
  email: string;
  balance: number;
  totalBets: number;
  totalWins: number;
  createdAt: Date;
}

export interface MinigameResult {
  id: string;
  game: 'crash' | 'coinflip' | 'dice' | 'penalty';
  bet: number;
  multiplier: number;
  result: 'win' | 'lose';
  payout: number;
  timestamp: Date;
}

export interface PenaltyPrediction {
  direction: 'left' | 'center' | 'right';
  height: 'low' | 'mid' | 'high';
}
