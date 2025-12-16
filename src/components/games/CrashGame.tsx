import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useUserStore } from '@/store/userStore';
import { TrendingUp, Play } from 'lucide-react';
import { toast } from 'sonner';

export const CrashGame = () => {
  const { user, isAuthenticated, updateBalance, addMinigameResult } = useUserStore();
  const [bet, setBet] = useState(10);
  const [multiplier, setMultiplier] = useState(1.0);
  const [isRunning, setIsRunning] = useState(false);
  const [hasCashedOut, setHasCashedOut] = useState(false);
  const [crashPoint, setCrashPoint] = useState(0);
  const [gameHistory, setGameHistory] = useState<number[]>([2.45, 1.23, 5.67, 1.89, 3.12]);
  const [ballBurst, setBallBurst] = useState(false);
  const [kickerState, setKickerState] = useState<'idle' | 'running' | 'kicked'>('idle');
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
    setBallBurst(false);
    setMultiplier(1.0);
    setKickerState('running');

    // Generate crash point (house edge ~4%)
    const crash = Math.max(1.0, 0.99 / Math.random());
    setCrashPoint(crash);

    // Kicker animation
    setTimeout(() => setKickerState('kicked'), 400);

    // Small chance of immediate burst (5%)
    if (Math.random() < 0.05) {
      setTimeout(() => {
        setBallBurst(true);
        setIsRunning(false);
        setKickerState('idle');
        setGameHistory((h) => [1.0, ...h.slice(0, 9)]);
        toast.error('💥 A bola estourou no chute! Você perdeu R$ ' + bet.toFixed(2));
        addMinigameResult({
          game: 'crash',
          bet,
          multiplier: 0,
          result: 'lose',
          payout: 0,
        });
      }, 600);
      return;
    }

    intervalRef.current = setInterval(() => {
      setMultiplier((prev) => {
        const newMult = prev + 0.02 + (Math.random() * 0.03);
        
        if (newMult >= crash) {
          clearInterval(intervalRef.current!);
          setIsRunning(false);
          setBallBurst(true);
          setKickerState('idle');
          setGameHistory((h) => [crash, ...h.slice(0, 9)]);
          
          if (!hasCashedOut) {
            toast.error(`💥 Estourou em ${crash.toFixed(2)}x! Você perdeu R$ ${bet.toFixed(2)}`);
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
    setKickerState('idle');

    const payout = bet * multiplier;
    updateBalance(payout);
    setGameHistory((h) => [crashPoint, ...h.slice(0, 9)]);
    
    toast.success(`⚽ Sacou em ${multiplier.toFixed(2)}x! Ganhou R$ ${payout.toFixed(2)}`);
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

  // Calculate ball height based on multiplier
  const ballHeight = Math.min((multiplier - 1) * 40, 120);

  return (
    <div className="glass-card p-6">
      <div className="text-center mb-6">
        <h3 className="font-display text-2xl font-bold text-foreground mb-2">Crash ⚽💥</h3>
        <p className="text-muted-foreground text-sm">Saque antes da bola estourar!</p>
      </div>

      {/* Game Area */}
      <div className="relative w-full aspect-video bg-gradient-to-t from-neon-green/20 via-vf4-blue/10 to-vf4-blue/30 rounded-xl mb-6 overflow-hidden border border-border">
        {/* Sky */}
        <div className="absolute inset-0 bg-gradient-to-t from-transparent to-vf4-blue/20" />
        
        {/* Ground */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-neon-green/40 to-neon-green/10" />
        
        {/* Football Player */}
        <motion.div
          animate={{ 
            x: kickerState === 'running' ? 20 : kickerState === 'kicked' ? 30 : 0,
            rotate: kickerState === 'kicked' ? 15 : 0,
          }}
          transition={{ duration: 0.3 }}
          className="absolute bottom-16 left-6 text-4xl"
        >
          {kickerState === 'idle' ? '🧍' : kickerState === 'running' ? '🏃' : '🦵'}
        </motion.div>

        {/* Ball flying up */}
        <AnimatePresence>
          {(isRunning || ballBurst || hasCashedOut) && (
            <motion.div
              initial={{ y: 0, scale: 1 }}
              animate={{ 
                y: ballBurst ? 0 : -ballHeight,
                scale: ballBurst ? [1, 1.5, 0] : 1 + (multiplier - 1) * 0.1,
              }}
              transition={{ 
                type: ballBurst ? 'spring' : 'tween',
                duration: ballBurst ? 0.3 : 0.05 
              }}
              className="absolute bottom-20 left-16 text-3xl"
            >
              {ballBurst ? '💥' : '⚽'}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Multiplier Display */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{ scale: isRunning ? [1, 1.02, 1] : 1 }}
            transition={{ duration: 0.3, repeat: isRunning ? Infinity : 0 }}
            className="text-center bg-background/70 backdrop-blur-sm rounded-xl px-6 py-4"
          >
            <div 
              className={`font-display text-4xl md:text-6xl font-black ${
                ballBurst && !hasCashedOut
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
            {ballBurst && !hasCashedOut && (
              <div className="text-destructive text-lg font-bold mt-2">💥 ESTOUROU!</div>
            )}
            {hasCashedOut && (
              <div className="text-success text-lg font-bold mt-2">✅ SACOU!</div>
            )}
          </motion.div>
        </div>
      </div>

      {/* History */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {gameHistory.map((mult, i) => (
          <div
            key={i}
            className={`px-3 py-1 rounded-lg text-sm font-mono font-bold shrink-0 ${
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
            Chutar Bola
          </Button>
        ) : (
          <Button variant="success" className="w-full animate-pulse" onClick={cashOut}>
            <TrendingUp className="w-4 h-4" />
            SACAR R$ {(bet * multiplier).toFixed(2)}
          </Button>
        )}
      </div>
    </div>
  );
};
