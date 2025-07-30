import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { mockBusinessProfile } from '@/mocks/profile';
import { BusinessProfile } from '@/types';

interface BusinessState {
  profile: BusinessProfile;
  isLoading: boolean;
  updateProfile: (updatedProfile: Partial<BusinessProfile>) => void;
}

export const useBusinessStore = create<BusinessState>()(
  persist(
    (set) => ({
      profile: mockBusinessProfile,
      isLoading: false,
      updateProfile: (updatedProfile) => 
        set((state) => ({
          profile: { ...state.profile, ...updatedProfile },
        })),
    }),
    {
      name: 'business-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);