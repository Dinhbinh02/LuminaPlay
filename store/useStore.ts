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
  removeFromHistory: (id: string, seasonNum?: number, episodeNum?: number) => void;
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
        // Filter out the EXACT SAME episode (same show ID, season, and episode)
        const filtered = state.history.filter((i) => 
          !(String(i.id) === String(item.id) && i.seasonNum === item.seasonNum && i.episodeNum === item.episodeNum)
        );
        return { history: [item, ...filtered].slice(0, 50) }; // Increased limit to 50 to accommodate more episodes
      }),
      removeFromHistory: (id, seasonNum, episodeNum) => set((state) => ({
        history: state.history.filter((i) => 
          !(i.id === id && i.seasonNum === seasonNum && i.episodeNum === episodeNum)
        )
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
