import { create } from 'zustand';

interface AppStore {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  
  // Add more global app state here as needed
}

export const useAppStore = create<AppStore>((set) => ({
  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),
}));
