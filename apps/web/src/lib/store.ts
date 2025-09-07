import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { useToast } from './useToast';

// Types
export interface User {
  id: string;
  walletAddress: string;
  username?: string;
}

export interface Lobby {
  id: string;
  bracketId: number;
  status: 'OPEN' | 'FULL' | 'IN_PROGRESS' | 'FINISHED';
  creatorId: string;
  opponentId?: string;
  wagerLamports: number;
}

export interface Battle {
  id: string;
  lobbyId: string;
  player1Id: string;
  player2Id: string;
  status: 'WAITING' | 'IN_PROGRESS' | 'FINISHED';
  winner?: string;
}

// Store interface
interface AppState {
  // User state
  user: User | null;
  isAuthenticated: boolean;

  // Lobby state
  currentLobby: Lobby | null;
  availableLobbies: Lobby[];

  // Battle state
  currentBattle: Battle | null;
  battleState: any;

  // UI state
  isLoading: boolean;
  error: string | null;

  // Actions
  setUser: (user: User | null) => void;
  setCurrentLobby: (lobby: Lobby | null) => void;
  setAvailableLobbies: (lobbies: Lobby[]) => void;
  setCurrentBattle: (battle: Battle | null) => void;
  setBattleState: (state: any) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Lobby actions
  joinLobby: (lobbyId: string) => Promise<void>;
  leaveLobby: () => void;
  createLobby: (bracketId: number, wagerLamports: number) => Promise<void>;

  // Battle actions
  startBattle: (lobbyId: string) => Promise<void>;
  makeMove: (moveData: any) => Promise<void>;
  forfeitBattle: () => Promise<void>;

  // Utility actions
  clearError: () => void;
  reset: () => void;
}

// Store implementation
export const useStore = create<AppState>()(
  devtools(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      currentLobby: null,
      availableLobbies: [],
      currentBattle: null,
      battleState: null,
      isLoading: false,
      error: null,

      // Basic setters
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setCurrentLobby: (lobby) => set({ currentLobby: lobby }),
      setAvailableLobbies: (lobbies) => set({ availableLobbies: lobbies }),
      setCurrentBattle: (battle) => set({ currentBattle: battle }),
      setBattleState: (state) => set({ battleState: state }),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),

      // Lobby actions
      joinLobby: async (lobbyId: string) => {
        const { user } = get();
        if (!user) {
          set({ error: 'User not authenticated' });
          return;
        }

        set({ isLoading: true, error: null });

        try {
          // TODO: Implement actual lobby joining logic
          // For now, just update the store
          const lobby = get().availableLobbies.find(l => l.id === lobbyId);
          if (lobby) {
            set({ currentLobby: { ...lobby, opponentId: user.id } });
          }
        } catch (error) {
          set({ error: 'Failed to join lobby' });
        } finally {
          set({ isLoading: false });
        }
      },

      leaveLobby: () => {
        set({ currentLobby: null });
      },

      createLobby: async (bracketId: number, wagerLamports: number) => {
        const { user } = get();
        if (!user) {
          set({ error: 'User not authenticated' });
          return;
        }

        set({ isLoading: true, error: null });

        try {
          // TODO: Implement actual lobby creation logic
          const newLobby: Lobby = {
            id: `lobby-${Date.now()}`,
            bracketId,
            status: 'OPEN',
            creatorId: user.id,
            wagerLamports,
          };

          set({ currentLobby: newLobby });
        } catch (error) {
          set({ error: 'Failed to create lobby' });
        } finally {
          set({ isLoading: false });
        }
      },

      // Battle actions
      startBattle: async (lobbyId: string) => {
        const { currentLobby } = get();
        if (!currentLobby) {
          set({ error: 'No lobby selected' });
          return;
        }

        set({ isLoading: true, error: null });

        try {
          // TODO: Implement actual battle start logic
          const battle: Battle = {
            id: `battle-${Date.now()}`,
            lobbyId,
            player1Id: currentLobby.creatorId,
            player2Id: currentLobby.opponentId || '',
            status: 'IN_PROGRESS',
          };

          set({
            currentBattle: battle,
            currentLobby: { ...currentLobby, status: 'IN_PROGRESS' }
          });
        } catch (error) {
          set({ error: 'Failed to start battle' });
        } finally {
          set({ isLoading: false });
        }
      },

      makeMove: async (moveData: any) => {
        const { currentBattle } = get();
        if (!currentBattle) {
          set({ error: 'No active battle' });
          return;
        }

        set({ isLoading: true, error: null });

        try {
          // TODO: Implement actual move logic
          // This would communicate with the backend via WebSocket
          console.log('Making move:', moveData);
        } catch (error) {
          set({ error: 'Failed to make move' });
        } finally {
          set({ isLoading: false });
        }
      },

      forfeitBattle: async () => {
        const { currentBattle } = get();
        if (!currentBattle) {
          set({ error: 'No active battle' });
          return;
        }

        set({ isLoading: true, error: null });

        try {
          // TODO: Implement actual forfeit logic
          set({
            currentBattle: { ...currentBattle, status: 'FINISHED' },
            currentLobby: null
          });
        } catch (error) {
          set({ error: 'Failed to forfeit battle' });
        } finally {
          set({ isLoading: false });
        }
      },

      // Utility actions
      clearError: () => set({ error: null }),

      reset: () => set({
        user: null,
        isAuthenticated: false,
        currentLobby: null,
        availableLobbies: [],
        currentBattle: null,
        battleState: null,
        isLoading: false,
        error: null,
      }),
    }),
    {
      name: 'pokedotduel-store',
    }
  )
);

// Selectors
export const useUser = () => useStore((state) => state.user);
export const useIsAuthenticated = () => useStore((state) => state.isAuthenticated);
export const useCurrentLobby = () => useStore((state) => state.currentLobby);
export const useAvailableLobbies = () => useStore((state) => state.availableLobbies);
export const useCurrentBattle = () => useStore((state) => state.currentBattle);
export const useBattleState = () => useStore((state) => state.battleState);
export const useIsLoading = () => useStore((state) => state.isLoading);
export const useError = () => useStore((state) => state.error);
