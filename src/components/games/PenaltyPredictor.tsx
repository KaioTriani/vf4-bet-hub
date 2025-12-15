import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useUserStore } from '@/store/userStore';
import { Target, ShieldCheck, Crosshair, RotateCcw, Trophy } from 'lucide-react';
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
  const [ballPosition, setBallPosition] = useState({ x: 0, y: 0 });
  const [showResult, setShowResult] = useState(false);

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
      toast.error('Selecione direção e altura');
      return;
    }
    if (!user || user.balance < bet) {
      toast.error('Saldo insuficiente');
      return;
    }

    updateBalance(-bet);
    setIsAnimating(true);
    setShowResult(false);

    // Simulate goalkeeper save
    const directions: Direction[] = ['left', 'center', 'right'];
    const heights: Height[] = ['low', 'mid', 'high'];
    
    const kickDir = selectedDirection;
    const kickHt = selectedHeight;
    const saveDir = directions[Math.floor(Math.random() * 3)];
    const saveHt = heights[Math.floor(Math.random() * 3)];

    // Calculate if it's a goal
    const isGoal = kickDir !== saveDir || kickHt !== saveHt;
    const odds = getOdds(kickDir, kickHt);
    const payout = isGoal ? bet * odds : 0;

    // Animate ball
    const dirX = { left: -100, center: 0, right: 100 };
    const htY = { low: 50, mid: 0, high: -50 };

    setTimeout(() => {
      setBallPosition({ x: dirX[kickDir], y: htY[kickHt] });
    }, 300);

    setTimeout(() => {
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
        toast.success(`GOOOL! Você ganhou R$ ${payout.toFixed(2)}!`);
      } else {
        toast.error('Defendido! Tente novamente.');
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
    }, 1500);
  };

  const resetGame = () => {
    setSelectedDirection(null);
    setSelectedHeight(null);
    setResult(null);
    setShowResult(false);
    setBallPosition({ x: 0, y: 0 });
  };

  return (
    <div className="glass-card p-6 max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h3 className="font-display text-2xl font-bold text-foreground mb-2">
          Penalty Predictor ⚽
        </h3>
        <p className="text-muted-foreground">
          Escolha onde chutar e vença o goleiro!
        </p>
      </div>

      {/* Goal Visualization */}
      <div className="relative w-full aspect-[16/10] bg-gradient-to-b from-neon-green/20 to-neon-green/5 rounded-xl mb-8 overflow-hidden border border-neon-green/30">
        {/* Goal Frame */}
        <div className="absolute inset-x-8 top-4 bottom-20 border-4 border-foreground/80 rounded-t-lg">
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

          {/* Ball Animation */}
          <AnimatePresence>
            {isAnimating && (
              <motion.div
                initial={{ scale: 1, x: 0, y: 100 }}
                animate={{ 
                  scale: 0.5, 
                  x: ballPosition.x, 
                  y: ballPosition.y,
                }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="absolute left-1/2 bottom-0 -translate-x-1/2"
              >
                <div className="w-12 h-12 rounded-full bg-foreground shadow-lg flex items-center justify-center text-2xl">
                  ⚽
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Grass line */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-neon-green/30 to-transparent" />

        {/* Result Overlay */}
        <AnimatePresence>
          {showResult && result && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm"
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
              {isAnimating ? 'Chutando...' : 'Chutar!'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

