import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WatchHistoryItem {
  id: string;
  title: string;
  poster: string;
  progress: number;
  slug?: string;
  watched_at?: string;
  episodeNum?: number;
  seasonNum?: number;
  currentTime?: number;
}

interface AppState {
  isPinLocked: boolean;
  pin: string | null;
  history: WatchHistoryItem[];
  favorites: WatchHistoryItem[];
  user: any | null;
  setUser: (user: any | null) => void;
  setPin: (pin: string | null) => void;
  setPinLocked: (isLocked: boolean) => void;
  addToHistory: (item: WatchHistoryItem) => void;
  removeFromHistory: (id: string) => void;
  setHistory: (history: WatchHistoryItem[]) => void;
  addToFavorites: (item: WatchHistoryItem) => void;
  removeFromFavorites: (id: string) => void;
  setFavorites: (favorites: WatchHistoryItem[]) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      isPinLocked: false,
      pin: null,
      history: [],
      favorites: [],
      user: null,
      setUser: (user) => set({ user }),
      setPin: (pin) => set({ pin }),
      setPinLocked: (isLocked) => set({ isPinLocked: isLocked }),
      addToHistory: (item) => set((state) => {
        const filtered = state.history.filter((i) => i.id !== item.id);
        return { history: [item, ...filtered].slice(0, 20) };
      }),
      removeFromHistory: (id) => set((state) => ({
        history: state.history.filter((i) => i.id !== id)
      })),
      setHistory: (history) => set({ history }),
      addToFavorites: (item) => set((state) => {
        if (state.favorites.some(f => f.id === item.id)) return state;
        return { favorites: [item, ...state.favorites] };
      }),
      removeFromFavorites: (id) => set((state) => ({
        favorites: state.favorites.filter((i) => i.id !== id)
      })),
      setFavorites: (favorites) => set({ favorites }),
    }),
    {
      name: 'lumina-storage',
    }
  )
);
