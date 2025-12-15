import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useUserStore } from '@/store/userStore';
import { User, Mail, LogIn, Gift } from 'lucide-react';
import { toast } from 'sonner';

export const LoginSection = () => {
  const { login, isAuthenticated } = useUserStore();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');

  const handleLogin = () => {
    if (!username || !email) {
      toast.error('Preencha todos os campos');
      return;
    }
    login(username, email);
    toast.success(`Bem-vindo, ${username}! Você recebeu R$ 1.000,00 de bônus!`);
  };

  if (isAuthenticated) return null;

  return (
    <section id="login" className="py-20 bg-card/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-md mx-auto glass-card p-8"
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-warning flex items-center justify-center mx-auto mb-4">
              <Gift className="w-8 h-8 text-primary-foreground" />
            </div>
            <h2 className="font-display text-2xl font-bold text-foreground mb-2">Criar Conta</h2>
            <p className="text-muted-foreground">Ganhe R$ 1.000,00 em saldo demo!</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Nome de usuário</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Seu nome"
                  className="w-full bg-secondary border border-border rounded-lg pl-10 pr-4 py-3 text-foreground focus:outline-none focus:border-primary"
                />
              </div>
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="w-full bg-secondary border border-border rounded-lg pl-10 pr-4 py-3 text-foreground focus:outline-none focus:border-primary"
                />
              </div>
            </div>
            <Button variant="gold" className="w-full" size="lg" onClick={handleLogin}>
              <LogIn className="w-4 h-4" />
              Criar Conta Grátis
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center mt-6">
            ⚠️ Plataforma demonstrativa. Sem dinheiro real.
          </p>
        </motion.div>
      </div>
    </section>
  );
};
