import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useUserStore } from '@/store/userStore';
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

const diceIcons = [Dice1, Dice2, Dice3, Dice4, Dice5, Dice6];

export const DiceGame = () => {
  const { user, isAuthenticated, updateBalance, addMinigameResult } = useUserStore();
  const [bet, setBet] = useState(10);
  const [prediction, setPrediction] = useState<'under' | 'over'>('over');
  const [target, setTarget] = useState(50);
  const [isRolling, setIsRolling] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [displayDice, setDisplayDice] = useState([1, 1]);

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

    // Animate dice
    let rollCount = 0;
    const rollInterval = setInterval(() => {
      setDisplayDice([Math.floor(Math.random() * 6), Math.floor(Math.random() * 6)]);
      rollCount++;
      if (rollCount > 15) {
        clearInterval(rollInterval);
      }
    }, 100);

    setTimeout(() => {
      clearInterval(rollInterval);
      
      const rollResult = Math.random() * 100;
      setResult(rollResult);
      setDisplayDice([Math.floor(Math.random() * 6), Math.floor(Math.random() * 6)]);
      
      const won = prediction === 'over' ? rollResult > target : rollResult < target;
      const multiplier = getMultiplier();
      const payout = won ? bet * multiplier : 0;

      if (won) {
        updateBalance(payout);
        toast.success(`Resultado: ${rollResult.toFixed(2)} - Você ganhou R$ ${payout.toFixed(2)}!`);
      } else {
        toast.error(`Resultado: ${rollResult.toFixed(2)} - Você perdeu!`);
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

  const DiceIcon1 = diceIcons[displayDice[0]];
  const DiceIcon2 = diceIcons[displayDice[1]];

  return (
    <div className="glass-card p-6">
      <div className="text-center mb-6">
        <h3 className="font-display text-2xl font-bold text-foreground mb-2">Dice 🎲</h3>
        <p className="text-muted-foreground text-sm">Acima ou Abaixo do alvo</p>
      </div>

      {/* Dice Display */}
      <div className="flex justify-center gap-4 mb-6">
        <motion.div
          animate={{ rotate: isRolling ? 360 : 0 }}
          transition={{ duration: 0.3, repeat: isRolling ? Infinity : 0, ease: 'linear' }}
          className="w-16 h-16 bg-gradient-to-br from-primary to-warning rounded-xl flex items-center justify-center shadow-lg"
        >
          <DiceIcon1 className="w-10 h-10 text-primary-foreground" />
        </motion.div>
        <motion.div
          animate={{ rotate: isRolling ? -360 : 0 }}
          transition={{ duration: 0.4, repeat: isRolling ? Infinity : 0, ease: 'linear' }}
          className="w-16 h-16 bg-gradient-to-br from-accent to-vf4-blue rounded-xl flex items-center justify-center shadow-lg"
        >
          <DiceIcon2 className="w-10 h-10 text-accent-foreground" />
        </motion.div>
      </div>

      {/* Result Display */}
      <AnimatePresence>
        {showResult && result !== null && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="text-center mb-6"
          >
            <div className="font-display text-4xl font-bold text-foreground mb-2">
              {result.toFixed(2)}
            </div>
            <div className={`text-lg font-semibold ${
              (prediction === 'over' ? result > target : result < target)
                ? 'text-success'
                : 'text-destructive'
            }`}>
              {(prediction === 'over' ? result > target : result < target) ? '🎉 Ganhou!' : '😔 Perdeu!'}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Target Slider */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span>Alvo: {target.toFixed(0)}</span>
          <span>Multiplicador: {getMultiplier().toFixed(2)}x</span>
        </div>
        <input
          type="range"
          min={5}
          max={95}
          value={target}
          onChange={(e) => setTarget(Number(e.target.value))}
          disabled={isRolling}
          className="w-full accent-primary"
        />
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>5</span>
          <span>50</span>
          <span>95</span>
        </div>
      </div>

      {/* Prediction Selection */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Button
          variant={prediction === 'under' ? 'bet-selected' : 'bet'}
          onClick={() => !isRolling && setPrediction('under')}
          disabled={isRolling}
          className="h-12"
        >
          ⬇️ Abaixo de {target}
        </Button>
        <Button
          variant={prediction === 'over' ? 'bet-selected' : 'bet'}
          onClick={() => !isRolling && setPrediction('over')}
          disabled={isRolling}
          className="h-12"
        >
          ⬆️ Acima de {target}
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
            🎲 {isRolling ? 'Rolando...' : 'Rolar Dados'}
          </Button>
        )}
      </div>
    </div>
  );
};
