import { motion } from 'framer-motion';
import { MatchCard } from './MatchCard';
import { getLiveMatches, getUpcomingMatches, getFinishedMatches } from '@/data/mockMatches';
import { Zap, Clock, Trophy } from 'lucide-react';

export const MatchesSection = () => {
  const liveMatches = getLiveMatches();
  const upcomingMatches = getUpcomingMatches();
  const finishedMatches = getFinishedMatches();

  return (
    <section id="matches" className="py-20 bg-card/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            Jogos do <span className="text-accent">VF4</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Acompanhe todos os jogos do VF4 e faça suas apostas com odds dinâmicas em tempo real.
          </p>
        </motion.div>

        {/* Live Matches */}
        {liveMatches.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
              <Zap className="w-5 h-5 text-destructive" />
              <h3 className="font-display text-xl font-bold text-foreground">Ao Vivo</h3>
              <span className="bg-destructive/20 text-destructive text-xs font-bold px-2 py-1 rounded">
                {liveMatches.length}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {liveMatches.map((match, index) => (
                <motion.div
                  key={match.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <MatchCard match={match} />
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Matches */}
        {upcomingMatches.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <Clock className="w-5 h-5 text-primary" />
              <h3 className="font-display text-xl font-bold text-foreground">Próximos Jogos</h3>
              <span className="bg-primary/20 text-primary text-xs font-bold px-2 py-1 rounded">
                {upcomingMatches.length}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {upcomingMatches.map((match, index) => (
                <motion.div
                  key={match.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <MatchCard match={match} />
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Finished Matches */}
        {finishedMatches.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <Trophy className="w-5 h-5 text-muted-foreground" />
              <h3 className="font-display text-xl font-bold text-foreground">Encerrados</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-60">
              {finishedMatches.map((match, index) => (
                <motion.div
                  key={match.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <MatchCard match={match} />
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
