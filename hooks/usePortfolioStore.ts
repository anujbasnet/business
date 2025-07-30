import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { mockPortfolio } from '@/mocks/portfolio';
import { PortfolioItem } from '@/types';

interface PortfolioState {
  portfolioItems: PortfolioItem[];
  isLoading: boolean;
  addPortfolioItem: (item: PortfolioItem) => void;
  updatePortfolioItem: (id: string, updatedItem: Partial<PortfolioItem>) => void;
  deletePortfolioItem: (id: string) => void;
  getPortfolioItemsByCategory: (category: string) => PortfolioItem[];
}

export const usePortfolioStore = create<PortfolioState>()(
  persist(
    (set, get) => ({
      portfolioItems: mockPortfolio,
      isLoading: false,
      addPortfolioItem: (item) => 
        set((state) => ({
          portfolioItems: [...state.portfolioItems, item],
        })),
      updatePortfolioItem: (id, updatedItem) => 
        set((state) => ({
          portfolioItems: state.portfolioItems.map((item) => 
            item.id === id 
              ? { ...item, ...updatedItem } 
              : item
          ),
        })),
      deletePortfolioItem: (id) => 
        set((state) => ({
          portfolioItems: state.portfolioItems.filter((item) => item.id !== id),
        })),
      getPortfolioItemsByCategory: (category) => {
        return get().portfolioItems.filter((item) => item.serviceCategory === category);
      },
    }),
    {
      name: 'portfolio-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);