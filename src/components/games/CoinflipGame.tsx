import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useUserStore } from '@/store/userStore';
import { Coins, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

type CoinSide = 'heads' | 'tails';

export const CoinflipGame = () => {
  const { user, isAuthenticated, updateBalance, addMinigameResult } = useUserStore();
  const [bet, setBet] = useState(10);
  const [selectedSide, setSelectedSide] = useState<CoinSide | null>(null);
  const [isFlipping, setIsFlipping] = useState(false);
  const [result, setResult] = useState<CoinSide | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleFlip = () => {
    if (!isAuthenticated) {
      toast.error('Faça login para jogar');
      return;
    }
    if (!selectedSide) {
      toast.error('Escolha cara ou coroa');
      return;
    }
    if (!user || user.balance < bet) {
      toast.error('Saldo insuficiente');
      return;
    }

    updateBalance(-bet);
    setIsFlipping(true);
    setShowResult(false);

    // 50/50 with tiny house edge (49.5%)
    const flipResult: CoinSide = Math.random() < 0.495 ? selectedSide : (selectedSide === 'heads' ? 'tails' : 'heads');
    
    setTimeout(() => {
      setResult(flipResult);
      setIsFlipping(false);
      setShowResult(true);

      const won = flipResult === selectedSide;
      const payout = won ? bet * 1.95 : 0;

      if (won) {
        updateBalance(payout);
        toast.success(`Você ganhou R$ ${payout.toFixed(2)}!`);
      } else {
        toast.error('Você perdeu!');
      }

      addMinigameResult({
        game: 'coinflip',
        bet,
        multiplier: won ? 1.95 : 0,
        result: won ? 'win' : 'lose',
        payout,
      });
    }, 2000);
  };

  const resetGame = () => {
    setResult(null);
    setShowResult(false);
    setSelectedSide(null);
  };

  return (
    <div className="glass-card p-6">
      <div className="text-center mb-6">
        <h3 className="font-display text-2xl font-bold text-foreground mb-2">Coinflip 🪙</h3>
        <p className="text-muted-foreground text-sm">Cara ou Coroa - 1.95x</p>
      </div>

      {/* Coin */}
      <div className="flex justify-center mb-8">
        <motion.div
          animate={{ rotateY: isFlipping ? 1800 : 0 }}
          transition={{ duration: 2, ease: 'easeOut' }}
          className="relative w-32 h-32"
          style={{ transformStyle: 'preserve-3d' }}
        >
          <div 
            className={`absolute inset-0 rounded-full flex items-center justify-center text-5xl shadow-lg ${
              result === 'heads' || (!result && selectedSide === 'heads')
                ? 'bg-gradient-to-br from-primary to-warning'
                : 'bg-gradient-to-br from-accent to-vf4-blue'
            }`}
          >
            {showResult ? (result === 'heads' ? '👑' : '🦅') : '?'}
          </div>
        </motion.div>
      </div>

      {/* Selection */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Button
          variant={selectedSide === 'heads' ? 'bet-selected' : 'bet'}
          className="h-16 text-lg"
          onClick={() => !isFlipping && setSelectedSide('heads')}
          disabled={isFlipping}
        >
          👑 Cara
        </Button>
        <Button
          variant={selectedSide === 'tails' ? 'bet-selected' : 'bet'}
          className="h-16 text-lg"
          onClick={() => !isFlipping && setSelectedSide('tails')}
          disabled={isFlipping}
        >
          🦅 Coroa
        </Button>
      </div>

      {/* Result */}
      <AnimatePresence>
        {showResult && result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`text-center p-4 rounded-lg mb-6 ${
              result === selectedSide
                ? 'bg-success/20 text-success'
                : 'bg-destructive/20 text-destructive'
            }`}
          >
            <div className="font-bold text-lg">
              {result === selectedSide ? '🎉 Você ganhou!' : '😔 Você perdeu!'}
            </div>
            <div className="text-sm">
              Resultado: {result === 'heads' ? 'Cara 👑' : 'Coroa 🦅'}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
            disabled={isFlipping}
            className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-foreground font-mono focus:outline-none focus:border-primary disabled:opacity-50"
          />
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
            onClick={handleFlip}
            disabled={!selectedSide || isFlipping}
          >
            <Coins className="w-4 h-4" />
            {isFlipping ? 'Girando...' : 'Jogar'}
          </Button>
        )}
      </div>
    </div>
  );
};
