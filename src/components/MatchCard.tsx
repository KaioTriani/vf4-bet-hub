import { useState } from 'react';
import { motion } from 'framer-motion';
import { Match } from '@/types/betting';
import { Button } from '@/components/ui/button';
import { useUserStore } from '@/store/userStore';
import { Clock, Trophy, TrendingUp, TrendingDown } from 'lucide-react';
import { toast } from 'sonner';

interface MatchCardProps {
  match: Match;
}

export const MatchCard = ({ match }: MatchCardProps) => {
  const { isAuthenticated, placeBet, user } = useUserStore();
  const [selectedBet, setSelectedBet] = useState<string | null>(null);
  const [stake, setStake] = useState<number>(10);

  const handleBetClick = (type: string, odds: number, selection: string) => {
    if (!isAuthenticated) {
      toast.error('Faça login para apostar');
      return;
    }

    setSelectedBet(type === selectedBet ? null : type);
  };

  const handlePlaceBet = () => {
    if (!selectedBet || !user) return;

    const oddsMap: Record<string, number> = {
      home: match.odds.home,
      draw: match.odds.draw,
      away: match.odds.away,
    };

    const odds = oddsMap[selectedBet] || 1;
    const success = placeBet({
      matchId: match.id,
      type: 'match_result',
      selection: selectedBet,
      odds,
      stake,
      potentialWin: stake * odds,
      status: 'pending',
    });

    if (success) {
      toast.success(`Aposta de R$ ${stake.toFixed(2)} realizada!`);
      setSelectedBet(null);
    } else {
      toast.error('Saldo insuficiente');
    }
  };

  const isLive = match.status === 'live';
  const isVF4 = match.homeTeam.includes('VF4') || match.awayTeam.includes('VF4');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`match-card ${isVF4 ? 'border-accent/30' : ''}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {isLive && (
            <div className="live-indicator">
              <span className="text-xs font-semibold text-destructive uppercase">AO VIVO</span>
            </div>
          )}
          {!isLive && match.status === 'scheduled' && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span className="text-xs">{match.time}</span>
            </div>
          )}
          {match.status === 'finished' && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Trophy className="w-3 h-3" />
              <span className="text-xs">Encerrado</span>
            </div>
          )}
        </div>
        <span className="text-xs text-muted-foreground">{match.competition}</span>
      </div>

      {/* Teams & Score */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex-1">
          <div className={`font-semibold ${match.homeTeam.includes('VF4') ? 'text-accent' : 'text-foreground'}`}>
            {match.homeTeam}
          </div>
        </div>
        
        <div className="flex items-center gap-3 px-4">
          {match.status !== 'scheduled' ? (
            <div className="flex items-center gap-2">
              <span className="text-2xl font-display font-bold text-foreground">{match.homeScore}</span>
              <span className="text-muted-foreground">-</span>
              <span className="text-2xl font-display font-bold text-foreground">{match.awayScore}</span>
            </div>
          ) : (
            <span className="text-muted-foreground text-sm">VS</span>
          )}
          {isLive && match.minute && (
            <span className="text-xs text-destructive font-mono">{match.minute}'</span>
          )}
        </div>
        
        <div className="flex-1 text-right">
          <div className={`font-semibold ${match.awayTeam.includes('VF4') ? 'text-accent' : 'text-foreground'}`}>
            {match.awayTeam}
          </div>
        </div>
      </div>

      {/* Odds - 1X2 */}
      {match.status !== 'finished' && (
        <>
          <div className="grid grid-cols-3 gap-2 mb-4">
            <Button
              variant={selectedBet === 'home' ? 'bet-selected' : 'bet'}
              size="sm"
              onClick={() => handleBetClick('home', match.odds.home, match.homeTeam)}
              className="flex flex-col py-3 h-auto"
            >
              <span className="text-xs text-muted-foreground">1</span>
              <span className="font-bold">{match.odds.home.toFixed(2)}</span>
            </Button>
            <Button
              variant={selectedBet === 'draw' ? 'bet-selected' : 'bet'}
              size="sm"
              onClick={() => handleBetClick('draw', match.odds.draw, 'Empate')}
              className="flex flex-col py-3 h-auto"
            >
              <span className="text-xs text-muted-foreground">X</span>
              <span className="font-bold">{match.odds.draw.toFixed(2)}</span>
            </Button>
            <Button
              variant={selectedBet === 'away' ? 'bet-selected' : 'bet'}
              size="sm"
              onClick={() => handleBetClick('away', match.odds.away, match.awayTeam)}
              className="flex flex-col py-3 h-auto"
            >
              <span className="text-xs text-muted-foreground">2</span>
              <span className="font-bold">{match.odds.away.toFixed(2)}</span>
            </Button>
          </div>

          {/* Bet Slip */}
          {selectedBet && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-border pt-4"
            >
              <div className="flex items-center gap-2 mb-3">
                <input
                  type="number"
                  value={stake}
                  onChange={(e) => setStake(Number(e.target.value))}
                  min={1}
                  max={user?.balance || 1000}
                  className="flex-1 bg-secondary border border-border rounded-lg px-3 py-2 text-foreground font-mono text-sm focus:outline-none focus:border-primary"
                />
                <div className="text-sm text-muted-foreground">
                  Retorno: <span className="text-success font-bold">
                    R$ {(stake * (selectedBet === 'home' ? match.odds.home : selectedBet === 'draw' ? match.odds.draw : match.odds.away)).toFixed(2)}
                  </span>
                </div>
              </div>
              <Button variant="gold" className="w-full" onClick={handlePlaceBet}>
                Apostar R$ {stake.toFixed(2)}
              </Button>
            </motion.div>
          )}
        </>
      )}
    </motion.div>
  );
};
