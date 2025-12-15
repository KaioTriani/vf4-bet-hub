import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useUserStore } from '@/store/userStore';
import { Wallet, LogIn, LogOut, User, Trophy, TrendingUp, Menu, X } from 'lucide-react';

export const Header = () => {
  const { user, isAuthenticated, logout } = useUserStore();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-warning flex items-center justify-center font-display font-bold text-primary-foreground">
              VF4
            </div>
            <span className="font-display text-lg font-bold text-foreground hidden sm:block">
              VF4<span className="text-primary">BET</span>
            </span>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <a href="#matches" className="text-muted-foreground hover:text-foreground transition-colors">
              Jogos
            </a>
            <a href="#minigames" className="text-muted-foreground hover:text-foreground transition-colors">
              Minigames
            </a>
            <a href="#penalty" className="text-muted-foreground hover:text-foreground transition-colors">
              Penalty
            </a>
          </nav>

          {/* User Section */}
          <div className="flex items-center gap-3">
            {isAuthenticated && user ? (
              <>
                <div className="hidden sm:flex items-center gap-2 bg-secondary rounded-lg px-4 py-2">
                  <Wallet className="w-4 h-4 text-primary" />
                  <span className="font-mono font-bold text-foreground">
                    R$ {user.balance.toFixed(2)}
                  </span>
                </div>
                <div className="hidden lg:flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Trophy className="w-4 h-4 text-primary" />
                    <span>{user.totalWins}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-4 h-4 text-accent" />
                    <span>{user.totalBets}</span>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={logout}>
                  <LogOut className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <Button variant="gold" size="sm" onClick={() => window.location.href = '#login'}>
                <LogIn className="w-4 h-4" />
                <span className="hidden sm:inline">Entrar</span>
              </Button>
            )}
            
            {/* Mobile menu button */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
            >
              {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {showMobileMenu && (
            <motion.nav
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-border py-4"
            >
              <div className="flex flex-col gap-4">
                <a href="#matches" className="text-muted-foreground hover:text-foreground transition-colors py-2">
                  Jogos
                </a>
                <a href="#minigames" className="text-muted-foreground hover:text-foreground transition-colors py-2">
                  Minigames
                </a>
                <a href="#penalty" className="text-muted-foreground hover:text-foreground transition-colors py-2">
                  Penalty Predictor
                </a>
                {isAuthenticated && user && (
                  <div className="flex items-center gap-2 bg-secondary rounded-lg px-4 py-2 w-fit">
                    <Wallet className="w-4 h-4 text-primary" />
                    <span className="font-mono font-bold text-foreground">
                      R$ {user.balance.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};
