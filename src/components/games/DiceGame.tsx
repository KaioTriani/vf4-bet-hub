import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useUserStore } from '@/store/userStore';
import { RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

export const DiceGame = () => {
  const { user, isAuthenticated, updateBalance, addMinigameResult } = useUserStore();
  const [bet, setBet] = useState(10);
  const [prediction, setPrediction] = useState<'under' | 'over'>('over');
  const [target, setTarget] = useState(50);
  const [isRolling, setIsRolling] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  // Calculate multiplier based on target and prediction
  const getMultiplier = () => {
    const winChance = prediction === 'over' ? (100 - target) / 100 : target / 100;
    return Math.max(1.01, (0.97 / winChance)); // 3% house edge
  };

  const handleRoll = () => {
    if (!isAuthenticated) {
      toast.error('Faça login para jogar');
      return;
    }
    if (!user || user.balance < bet) {
      toast.error('Saldo insuficiente');
      return;
    }

    updateBalance(-bet);
    setIsRolling(true);
    setShowResult(false);

    setTimeout(() => {
      const rollResult = Math.random() * 100;
      setResult(rollResult);
      
      const won = prediction === 'over' ? rollResult > target : rollResult < target;
      const multiplier = getMultiplier();
      const payout = won ? bet * multiplier : 0;

      if (won) {
        updateBalance(payout);
        toast.success(`⚽ GOL! ${rollResult.toFixed(2)} - Você ganhou R$ ${payout.toFixed(2)}!`);
      } else {
        toast.error(`🧤 DEFESA! ${rollResult.toFixed(2)} - Você perdeu!`);
      }

      addMinigameResult({
        game: 'dice',
        bet,
        multiplier: won ? multiplier : 0,
        result: won ? 'win' : 'lose',
        payout,
      });

      setIsRolling(false);
      setShowResult(true);
    }, 1500);
  };

  const resetGame = () => {
    setResult(null);
    setShowResult(false);
  };

  const winChance = prediction === 'over' ? (100 - target) : target;

  return (
    <div className="glass-card p-6">
      <div className="text-center mb-6">
        <h3 className="font-display text-2xl font-bold text-foreground mb-2">Dado do Goleiro 🎲</h3>
        <p className="text-muted-foreground text-sm">Passe pelo goleiro para marcar!</p>
      </div>

      {/* Football Field Visualization */}
      <div className="relative w-full h-36 bg-gradient-to-t from-neon-green/30 to-neon-green/10 rounded-xl mb-6 overflow-hidden border border-neon-green/30">
        {/* Field lines */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 border-2 border-foreground/20 rounded-full" />
        </div>
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-foreground/20" />
        
        {/* Goal area */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-10 border-2 border-foreground/30 border-t-0 rounded-b-lg">
          {/* Goalkeeper */}
          <motion.div
            animate={{ 
              x: isRolling ? [0, -20, 20, -10, 10, 0] : 0,
            }}
            transition={{ duration: 1.5, ease: 'easeInOut' }}
            className="absolute bottom-0 left-1/2 -translate-x-1/2 text-2xl"
          >
            🧤
          </motion.div>
        </div>

        {/* Ball */}
        <AnimatePresence>
          {isRolling && (
            <motion.div
              initial={{ y: 80, scale: 1 }}
              animate={{ y: 15, scale: 0.5 }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              className="absolute left-1/2 -translate-x-1/2 text-xl"
            >
              ⚽
            </motion.div>
          )}
        </AnimatePresence>

        {/* Result Display */}
        <AnimatePresence>
          {showResult && result !== null && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 flex items-center justify-center bg-background/70 backdrop-blur-sm"
            >
              <div className="text-center">
                <div className="text-4xl mb-1">
                  {(prediction === 'over' ? result > target : result < target) ? '⚽' : '🧤'}
                </div>
                <div className="font-display text-2xl font-bold text-foreground">
                  {result.toFixed(2)}
                </div>
                <div className={`text-sm font-semibold ${
                  (prediction === 'over' ? result > target : result < target)
                    ? 'text-success'
                    : 'text-destructive'
                }`}>
                  {(prediction === 'over' ? result > target : result < target) ? 'GOL!' : 'DEFESA!'}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Target Slider with Field Design */}
      <div className="mb-6 relative">
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span>🧤 Goleiro: {target.toFixed(0)}</span>
          <span className="text-primary font-bold">{getMultiplier().toFixed(2)}x</span>
        </div>
        
        {/* Custom slider track styled as field */}
        <div className="relative h-6 rounded-lg bg-gradient-to-r from-neon-green/20 via-secondary to-neon-green/20 border border-border overflow-hidden">
          {/* Filled portion */}
          <div 
            className={`absolute top-0 h-full transition-all duration-200 ${
              prediction === 'under' 
                ? 'left-0 bg-success/30' 
                : 'right-0 bg-success/30'
            }`}
            style={{ 
              width: prediction === 'under' ? `${target}%` : `${100 - target}%`
            }}
          />
          
          {/* Goalkeeper position marker */}
          <div 
            className="absolute top-0 h-full w-1 bg-foreground/50 transition-all"
            style={{ left: `${target}%` }}
          />
          
          {/* Slider input */}
          <input
            type="range"
            min={5}
            max={95}
            value={target}
            onChange={(e) => setTarget(Number(e.target.value))}
            disabled={isRolling}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          />
        </div>
        
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>5</span>
          <span>Chance: {winChance.toFixed(0)}%</span>
          <span>95</span>
        </div>
      </div>

      {/* Prediction Selection */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Button
          variant={prediction === 'under' ? 'bet-selected' : 'bet'}
          onClick={() => !isRolling && setPrediction('under')}
          disabled={isRolling}
          className="h-12 flex flex-col gap-0"
        >
          <span className="text-sm">⬇️ Abaixo de {target}</span>
          <span className="text-xs text-muted-foreground">({target}% chance)</span>
        </Button>
        <Button
          variant={prediction === 'over' ? 'bet-selected' : 'bet'}
          onClick={() => !isRolling && setPrediction('over')}
          disabled={isRolling}
          className="h-12 flex flex-col gap-0"
        >
          <span className="text-sm">⬆️ Acima de {target}</span>
          <span className="text-xs text-muted-foreground">({100 - target}% chance)</span>
        </Button>
      </div>

      {/* Controls */}
      <div className="space-y-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="text-sm text-muted-foreground mb-1 block">Aposta</label>
            <input
              type="number"
              value={bet}
              onChange={(e) => setBet(Math.max(1, Number(e.target.value)))}
              min={1}
              max={user?.balance || 1000}
              disabled={isRolling}
              className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-foreground font-mono focus:outline-none focus:border-primary disabled:opacity-50"
            />
          </div>
          <div className="flex-1">
            <label className="text-sm text-muted-foreground mb-1 block">Retorno</label>
            <div className="bg-secondary border border-border rounded-lg px-4 py-3 font-mono text-success font-bold">
              R$ {(bet * getMultiplier()).toFixed(2)}
            </div>
          </div>
        </div>

        {showResult ? (
          <Button variant="gold" className="w-full" onClick={resetGame}>
            <RotateCcw className="w-4 h-4" />
            Jogar Novamente
          </Button>
        ) : (
          <Button 
            variant="gold" 
            className="w-full" 
            onClick={handleRoll}
            disabled={isRolling}
          >
            ⚽ {isRolling ? 'Chutando...' : 'Chutar!'}
          </Button>
        )}
      </div>
    </div>
  );
};
