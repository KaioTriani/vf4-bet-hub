import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useUserStore } from '@/store/userStore';
import { TrendingUp, Play, Square } from 'lucide-react';
import { toast } from 'sonner';

export const CrashGame = () => {
  const { user, isAuthenticated, updateBalance, addMinigameResult } = useUserStore();
  const [bet, setBet] = useState(10);
  const [multiplier, setMultiplier] = useState(1.0);
  const [isRunning, setIsRunning] = useState(false);
  const [hasCashedOut, setHasCashedOut] = useState(false);
  const [crashPoint, setCrashPoint] = useState(0);
  const [gameHistory, setGameHistory] = useState<number[]>([2.45, 1.23, 5.67, 1.89, 3.12]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startGame = () => {
    if (!isAuthenticated) {
      toast.error('Faça login para jogar');
      return;
    }
    if (!user || user.balance < bet) {
      toast.error('Saldo insuficiente');
      return;
    }

    updateBalance(-bet);
    setIsRunning(true);
    setHasCashedOut(false);
    setMultiplier(1.0);

    // Generate crash point (house edge ~4%)
    const crash = Math.max(1.0, 0.99 / Math.random());
    setCrashPoint(crash);

    intervalRef.current = setInterval(() => {
      setMultiplier((prev) => {
        const newMult = prev + 0.02 + (Math.random() * 0.03);
        if (newMult >= crash) {
          clearInterval(intervalRef.current!);
          setIsRunning(false);
          setGameHistory((h) => [crash, ...h.slice(0, 9)]);
          
          if (!hasCashedOut) {
            toast.error(`Crash em ${crash.toFixed(2)}x! Você perdeu R$ ${bet.toFixed(2)}`);
            addMinigameResult({
              game: 'crash',
              bet,
              multiplier: 0,
              result: 'lose',
              payout: 0,
            });
          }
          return crash;
        }
        return newMult;
      });
    }, 50);
  };

  const cashOut = () => {
    if (!isRunning || hasCashedOut) return;
    
    clearInterval(intervalRef.current!);
    setHasCashedOut(true);
    setIsRunning(false);

    const payout = bet * multiplier;
    updateBalance(payout);
    setGameHistory((h) => [crashPoint, ...h.slice(0, 9)]);
    
    toast.success(`Cash out em ${multiplier.toFixed(2)}x! Ganhou R$ ${payout.toFixed(2)}`);
    addMinigameResult({
      game: 'crash',
      bet,
      multiplier,
      result: 'win',
      payout,
    });
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <div className="glass-card p-6">
      <div className="text-center mb-6">
        <h3 className="font-display text-2xl font-bold text-foreground mb-2">Crash 📈</h3>
        <p className="text-muted-foreground text-sm">Retire antes de quebrar!</p>
      </div>

      {/* Graph Area */}
      <div className="relative w-full aspect-video bg-gradient-to-t from-secondary to-background rounded-xl mb-6 overflow-hidden border border-border">
        {/* Grid */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* Multiplier Display */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{ scale: isRunning ? [1, 1.05, 1] : 1 }}
            transition={{ duration: 0.5, repeat: isRunning ? Infinity : 0 }}
            className="text-center"
          >
            <div 
              className={`font-display text-5xl md:text-7xl font-black ${
                !isRunning && multiplier >= crashPoint && !hasCashedOut
                  ? 'text-destructive'
                  : hasCashedOut
                  ? 'text-success'
                  : isRunning
                  ? 'text-primary'
                  : 'text-muted-foreground'
              }`}
            >
              {multiplier.toFixed(2)}x
            </div>
            {!isRunning && !hasCashedOut && multiplier >= crashPoint && (
              <div className="text-destructive text-lg font-bold mt-2">CRASHED!</div>
            )}
            {hasCashedOut && (
              <div className="text-success text-lg font-bold mt-2">CASH OUT!</div>
            )}
          </motion.div>
        </div>

        {/* Animated line */}
        {isRunning && (
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-primary to-success"
          />
        )}
      </div>

      {/* History */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {gameHistory.map((mult, i) => (
          <div
            key={i}
            className={`px-3 py-1 rounded-lg text-sm font-mono font-bold ${
              mult >= 2 ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'
            }`}
          >
            {mult.toFixed(2)}x
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="space-y-4">
        <div>
          <label className="text-sm text-muted-foreground mb-1 block">Valor da aposta</label>
          <input
            type="number"
            value={bet}
            onChange={(e) => setBet(Math.max(1, Number(e.target.value)))}
            min={1}
            max={user?.balance || 1000}
            disabled={isRunning}
            className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-foreground font-mono focus:outline-none focus:border-primary disabled:opacity-50"
          />
        </div>

        {!isRunning ? (
          <Button variant="gold" className="w-full" onClick={startGame}>
            <Play className="w-4 h-4" />
            Iniciar
          </Button>
        ) : (
          <Button variant="success" className="w-full" onClick={cashOut}>
            <TrendingUp className="w-4 h-4" />
            Cash Out ({(bet * multiplier).toFixed(2)})
          </Button>
        )}
      </div>
    </div>
  );
};
