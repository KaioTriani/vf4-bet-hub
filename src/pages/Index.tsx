import { Header } from '@/components/Header';
import { HeroSection } from '@/components/HeroSection';
import { MatchesSection } from '@/components/MatchesSection';
import { MinigamesSection } from '@/components/MinigamesSection';
import { LoginSection } from '@/components/LoginSection';
import { Shield } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      <MatchesSection />
      <MinigamesSection />
      <LoginSection />
      
      {/* Footer */}
      <footer className="py-12 border-t border-border">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-warning flex items-center justify-center font-display font-bold text-primary-foreground text-sm">
              VF4
            </div>
            <span className="font-display text-lg font-bold text-foreground">
              VF4<span className="text-primary">BET</span>
            </span>
          </div>
          <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm mb-4">
            <Shield className="w-4 h-4" />
            <span>Plataforma demonstrativa - Sem dinheiro real</span>
          </div>
          <p className="text-xs text-muted-foreground">
            © 2024 VF4BET. Protótipo educacional. Aposte com responsabilidade.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
