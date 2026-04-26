import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WatchHistoryItem {
  id: string;
  title: string;
  poster: string;
  progress: number;
}

interface AppState {
  isPinLocked: boolean;
  pin: string | null;
  history: WatchHistoryItem[];
  setPin: (pin: string | null) => void;
  setPinLocked: (isLocked: boolean) => void;
  addToHistory: (item: WatchHistoryItem) => void;
  removeFromHistory: (id: string) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      isPinLocked: false,
      pin: null,
      history: [],
      setPin: (pin) => set({ pin }),
      setPinLocked: (isLocked) => set({ isPinLocked: isLocked }),
      addToHistory: (item) => set((state) => {
        const filtered = state.history.filter((i) => i.id !== item.id);
        return { history: [item, ...filtered].slice(0, 20) };
      }),
      removeFromHistory: (id) => set((state) => ({
        history: state.history.filter((i) => i.id !== id)
      })),
    }),
    {
      name: 'lumina-storage',
    }
  )
);
