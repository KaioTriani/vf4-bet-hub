import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Bet, MinigameResult } from '@/types/betting';

interface UserState {
  user: User | null;
  bets: Bet[];
  minigameHistory: MinigameResult[];
  isAuthenticated: boolean;
  
  login: (username: string, email: string) => void;
  logout: () => void;
  updateBalance: (amount: number) => void;
  placeBet: (bet: Omit<Bet, 'id' | 'timestamp'>) => boolean;
  addMinigameResult: (result: Omit<MinigameResult, 'id' | 'timestamp'>) => void;
  settleBet: (betId: string, won: boolean) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      bets: [],
      minigameHistory: [],
      isAuthenticated: false,

      login: (username: string, email: string) => {
        const existingUser = get().user;
        set({
          user: existingUser ? { ...existingUser, username, email } : {
            id: crypto.randomUUID(),
            username,
            email,
            balance: 1000,
            totalBets: 0,
            totalWins: 0,
            createdAt: new Date(),
          },
          isAuthenticated: true,
        });
      },

      logout: () => {
        set({ isAuthenticated: false });
      },

      updateBalance: (amount: number) => {
        const { user } = get();
        if (user) {
          set({ user: { ...user, balance: Math.max(0, user.balance + amount) } });
        }
      },

      placeBet: (bet: Omit<Bet, 'id' | 'timestamp'>) => {
        const { user } = get();
        if (!user || user.balance < bet.stake) return false;

        const newBet: Bet = {
          ...bet,
          id: crypto.randomUUID(),
          timestamp: new Date(),
        };

        set({
          user: { 
            ...user, 
            balance: user.balance - bet.stake,
            totalBets: user.totalBets + 1,
          },
          bets: [...get().bets, newBet],
        });

        return true;
      },

      addMinigameResult: (result: Omit<MinigameResult, 'id' | 'timestamp'>) => {
        const newResult: MinigameResult = {
          ...result,
          id: crypto.randomUUID(),
          timestamp: new Date(),
        };

        set({
          minigameHistory: [newResult, ...get().minigameHistory].slice(0, 50),
        });

        const { user } = get();
        if (user && result.result === 'win') {
          set({ user: { ...user, totalWins: user.totalWins + 1 } });
        }
      },

      settleBet: (betId: string, won: boolean) => {
        const { bets, user } = get();
        const bet = bets.find(b => b.id === betId);
        
        if (bet && bet.status === 'pending' && user) {
          const newStatus: 'won' | 'lost' = won ? 'won' : 'lost';
          const updatedBets = bets.map(b => 
            b.id === betId ? { ...b, status: newStatus } : b
          );
          
          set({
            bets: updatedBets,
            user: {
              ...user,
              balance: won ? user.balance + bet.potentialWin : user.balance,
              totalWins: won ? user.totalWins + 1 : user.totalWins,
            },
          });
        }
      },
    }),
    {
      name: 'vf4-user-storage',
    }
  )
);
