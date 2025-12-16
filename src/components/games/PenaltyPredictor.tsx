import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useUserStore } from '@/store/userStore';
import { Target, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

type Direction = 'left' | 'center' | 'right';
type Height = 'low' | 'mid' | 'high';

interface PenaltyResult {
  kickDirection: Direction;
  kickHeight: Height;
  saveDirection: Direction;
  saveHeight: Height;
  isGoal: boolean;
  payout: number;
}

const directionLabels: Record<Direction, string> = {
  left: 'Esquerda',
  center: 'Centro',
  right: 'Direita',
};

const heightLabels: Record<Height, string> = {
  low: 'Baixo',
  mid: 'Meio',
  high: 'Alto',
};

export const PenaltyPredictor = () => {
  const { user, isAuthenticated, updateBalance, addMinigameResult } = useUserStore();
  const [bet, setBet] = useState(10);
  const [selectedDirection, setSelectedDirection] = useState<Direction | null>(null);
  const [selectedHeight, setSelectedHeight] = useState<Height | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [result, setResult] = useState<PenaltyResult | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [kickerState, setKickerState] = useState<'idle' | 'running' | 'kicked'>('idle');
  const [goalkeeperPosition, setGoalkeeperPosition] = useState<{ dir: Direction; ht: Height } | null>(null);

  // Dynamic odds based on position
  const getOdds = useCallback((dir: Direction, height: Height) => {
    const baseOdds: Record<Direction, Record<Height, number>> = {
      left: { low: 2.5, mid: 3.2, high: 4.0 },
      center: { low: 3.8, mid: 5.0, high: 4.5 },
      right: { low: 2.5, mid: 3.2, high: 4.0 },
    };
    return baseOdds[dir][height];
  }, []);

  const handleKick = () => {
    if (!isAuthenticated) {
      toast.error('Faça login para jogar');
      return;
    }
    if (!selectedDirection || !selectedHeight) {
      toast.error('Selecione direção e altura do chute');
      return;
    }
    if (!user || user.balance < bet) {
      toast.error('Saldo insuficiente');
      return;
    }

    updateBalance(-bet);
    setIsAnimating(true);
    setShowResult(false);
    setKickerState('running');
    setGoalkeeperPosition(null);

    // Simulate goalkeeper save position (randomly determined)
    const directions: Direction[] = ['left', 'center', 'right'];
    const heights: Height[] = ['low', 'mid', 'high'];
    
    const kickDir = selectedDirection;
    const kickHt = selectedHeight;
    const saveDir = directions[Math.floor(Math.random() * 3)];
    const saveHt = heights[Math.floor(Math.random() * 3)];

    // Kicker runs and kicks
    setTimeout(() => {
      setKickerState('kicked');
    }, 600);

    // Goalkeeper jumps
    setTimeout(() => {
      setGoalkeeperPosition({ dir: saveDir, ht: saveHt });
    }, 800);

    // Calculate result - Goal if goalkeeper doesn't match the kick
    setTimeout(() => {
      const isGoal = kickDir !== saveDir || kickHt !== saveHt;
      const odds = getOdds(kickDir, kickHt);
      const payout = isGoal ? bet * odds : 0;

      setResult({
        kickDirection: kickDir,
        kickHeight: kickHt,
        saveDirection: saveDir,
        saveHeight: saveHt,
        isGoal,
        payout,
      });

      if (isGoal) {
        updateBalance(payout);
        toast.success(`⚽ GOOOL! Você ganhou R$ ${payout.toFixed(2)}!`);
      } else {
        toast.error('🧤 Goleiro defendeu! Tente novamente.');
      }

      addMinigameResult({
        game: 'penalty',
        bet,
        multiplier: isGoal ? odds : 0,
        result: isGoal ? 'win' : 'lose',
        payout,
      });

      setIsAnimating(false);
      setShowResult(true);
    }, 1600);
  };

  const resetGame = () => {
    setSelectedDirection(null);
    setSelectedHeight(null);
    setResult(null);
    setShowResult(false);
    setKickerState('idle');
    setGoalkeeperPosition(null);
  };

  const getGoalkeeperTransform = () => {
    if (!goalkeeperPosition) return { x: 0, y: 0 };
    const xMap = { left: -50, center: 0, right: 50 };
    const yMap = { low: 15, mid: 0, high: -20 };
    return { x: xMap[goalkeeperPosition.dir], y: yMap[goalkeeperPosition.ht] };
  };

  const getBallPosition = () => {
    if (!selectedDirection || !selectedHeight) return { x: 0, y: 0 };
    const xMap = { left: -70, center: 0, right: 70 };
    const yMap = { low: 60, mid: 30, high: 5 };
    return { x: xMap[selectedDirection], y: yMap[selectedHeight] };
  };

  return (
    <div className="glass-card p-6 max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h3 className="font-display text-2xl font-bold text-foreground mb-2">
          Penalty Predictor 🥅
        </h3>
        <p className="text-muted-foreground">
          Escolha a direção do chute e vença o goleiro!
        </p>
      </div>

      {/* Goal Visualization */}
      <div className="relative w-full aspect-[16/10] bg-gradient-to-b from-vf4-blue/20 to-neon-green/20 rounded-xl mb-8 overflow-hidden border border-neon-green/30">
        {/* Goal Frame */}
        <div className="absolute inset-x-8 top-4 bottom-24 border-4 border-foreground/80 rounded-t-lg">
          {/* Net pattern */}
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 20px, hsl(var(--foreground)) 20px, hsl(var(--foreground)) 21px), repeating-linear-gradient(0deg, transparent, transparent 20px, hsl(var(--foreground)) 20px, hsl(var(--foreground)) 21px)',
            }}
          />

          {/* 3x3 Grid for selection */}
          <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-1 p-2">
            {(['left', 'center', 'right'] as Direction[]).map((dir) =>
              (['high', 'mid', 'low'] as Height[]).map((ht) => {
                const isSelected = selectedDirection === dir && selectedHeight === ht;
                const odds = getOdds(dir, ht);
                return (
                  <button
                    key={`${dir}-${ht}`}
                    onClick={() => {
                      if (!isAnimating) {
                        setSelectedDirection(dir);
                        setSelectedHeight(ht);
                      }
                    }}
                    disabled={isAnimating}
                    className={`
                      rounded-lg border-2 transition-all duration-300 flex flex-col items-center justify-center
                      ${isSelected 
                        ? 'border-primary bg-primary/30 shadow-[0_0_20px_hsl(var(--primary)/0.5)]' 
                        : 'border-border/50 bg-background/20 hover:border-primary/50 hover:bg-primary/10'}
                      ${isAnimating ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
                    `}
                  >
                    <span className="text-xs text-muted-foreground hidden sm:block">
                      {heightLabels[ht]} {directionLabels[dir]}
                    </span>
                    <span className="font-mono font-bold text-primary text-sm sm:text-base">
                      {odds.toFixed(1)}x
                    </span>
                  </button>
                );
              })
            )}
          </div>

          {/* Goalkeeper */}
          <motion.div
            animate={getGoalkeeperTransform()}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="absolute left-1/2 bottom-1 -translate-x-1/2 text-3xl z-10"
          >
            🧤
          </motion.div>

          {/* Ball Animation */}
          <AnimatePresence>
            {kickerState === 'kicked' && selectedDirection && selectedHeight && (
              <motion.div
                initial={{ y: 120, x: 0, scale: 1, opacity: 1 }}
                animate={{ 
                  y: getBallPosition().y,
                  x: getBallPosition().x,
                  scale: 0.7,
                  opacity: 1,
                }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="absolute left-1/2 bottom-0 -translate-x-1/2 text-2xl z-20"
              >
                ⚽
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Grass */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-neon-green/40 to-neon-green/10" />

        {/* Penalty spot */}
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-foreground/60" />

        {/* Kicker */}
        <motion.div
          animate={{ 
            x: kickerState === 'running' ? 15 : kickerState === 'kicked' ? 25 : 0,
            rotate: kickerState === 'kicked' ? 20 : 0,
          }}
          transition={{ duration: 0.3 }}
          className="absolute bottom-14 left-1/2 -translate-x-1/2 text-3xl"
        >
          {kickerState === 'idle' ? '🧍' : kickerState === 'running' ? '🏃' : '🦵'}
        </motion.div>

        {/* Result Overlay */}
        <AnimatePresence>
          {showResult && result && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-30"
            >
              <div className="text-center">
                {result.isGoal ? (
                  <>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', bounce: 0.5 }}
                      className="text-6xl mb-4"
                    >
                      🎉
                    </motion.div>
                    <h4 className="font-display text-3xl font-bold text-success mb-2">GOOOOL!</h4>
                    <p className="text-foreground font-bold text-xl">
                      +R$ {result.payout.toFixed(2)}
                    </p>
                  </>
                ) : (
                  <>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', bounce: 0.5 }}
                      className="text-6xl mb-4"
                    >
                      🧤
                    </motion.div>
                    <h4 className="font-display text-3xl font-bold text-destructive mb-2">DEFENDIDO!</h4>
                    <p className="text-muted-foreground">
                      Goleiro pulou: {heightLabels[result.saveHeight]} {directionLabels[result.saveDirection]}
                    </p>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="text-sm text-muted-foreground mb-1 block">Valor da aposta</label>
            <input
              type="number"
              value={bet}
              onChange={(e) => setBet(Math.max(1, Number(e.target.value)))}
              min={1}
              max={user?.balance || 1000}
              disabled={isAnimating}
              className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-foreground font-mono focus:outline-none focus:border-primary disabled:opacity-50"
            />
          </div>
          <div className="flex-1">
            <label className="text-sm text-muted-foreground mb-1 block">Retorno potencial</label>
            <div className="bg-secondary border border-border rounded-lg px-4 py-3 font-mono text-success font-bold">
              R$ {selectedDirection && selectedHeight 
                ? (bet * getOdds(selectedDirection, selectedHeight)).toFixed(2) 
                : '0.00'}
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          {showResult ? (
            <Button variant="gold" className="flex-1" onClick={resetGame}>
              <RotateCcw className="w-4 h-4" />
              Jogar Novamente
            </Button>
          ) : (
            <Button 
              variant="gold" 
              className="flex-1" 
              onClick={handleKick}
              disabled={!selectedDirection || !selectedHeight || isAnimating}
            >
              <Target className="w-4 h-4" />
              {isAnimating ? 'Cobrando...' : 'Cobrar Pênalti!'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
