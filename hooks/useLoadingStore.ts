import { create } from 'zustand';

interface LoadingState {
  isPageLoading: boolean;
  setPageLoading: (loading: boolean) => void;
  isInitialLoading: boolean;
  setInitialLoading: (loading: boolean) => void;
  hasLoadedInitial: boolean;
  markInitialLoaded: () => void;
  initialProgress: number;
  setInitialProgress: (progress: number | ((prev: number) => number)) => void;
}

export const useLoadingStore = create<LoadingState>((set) => ({
  isPageLoading: false,
  setPageLoading: (loading) => set({ isPageLoading: loading }),
  isInitialLoading: true,
  setInitialLoading: (loading) => set({ isInitialLoading: loading }),
  hasLoadedInitial: false,
  markInitialLoaded: () => set({ hasLoadedInitial: true, isInitialLoading: false, initialProgress: 100 }),
  initialProgress: 0,
  setInitialProgress: (progress) =>
    set((state) => {
      const nextProgress = typeof progress === 'function' ? progress(state.initialProgress) : progress;
      return { initialProgress: Math.min(100, Math.max(0, Math.round(nextProgress))) };
    }),
}));
