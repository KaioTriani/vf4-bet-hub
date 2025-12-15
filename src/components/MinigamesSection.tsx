import { motion } from 'framer-motion';
import { CrashGame } from './games/CrashGame';
import { CoinflipGame } from './games/CoinflipGame';
import { DiceGame } from './games/DiceGame';
import { PenaltyPredictor } from './games/PenaltyPredictor';
import { Gamepad2 } from 'lucide-react';

export const MinigamesSection = () => {
  return (
    <section id="minigames" className="py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-full px-4 py-2 mb-4">
            <Gamepad2 className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Minigames</span>
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Jogos <span className="text-gradient-gold">Instantâneos</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Diversão garantida com nossos minigames exclusivos. Resultados instantâneos e odds justas.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <CrashGame />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <CoinflipGame />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <DiceGame />
          </motion.div>
        </div>

        {/* Penalty Predictor - Featured */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          id="penalty"
          className="mt-12"
        >
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/30 rounded-full px-4 py-2 mb-4">
              <span className="text-lg">⚽</span>
              <span className="text-sm font-medium text-accent">Exclusivo VF4</span>
            </div>
            <h3 className="font-display text-2xl md:text-3xl font-bold text-foreground">
              Penalty Predictor
            </h3>
          </div>
          <PenaltyPredictor />
        </motion.div>
      </div>
    </section>
  );
};
