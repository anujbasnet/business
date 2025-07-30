import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { mockServices } from '@/mocks/services';
import { Service } from '@/types';

interface ServicesState {
  services: Service[];
  isLoading: boolean;
  addService: (service: Service) => void;
  updateService: (id: string, updatedService: Partial<Service>) => void;
  deleteService: (id: string) => void;
  getServiceById: (id: string) => Service | undefined;
  getServicesByCategory: (category: string) => Service[];
}

export const useServicesStore = create<ServicesState>()(
  persist(
    (set, get) => ({
      services: mockServices,
      isLoading: false,
      addService: (service) => 
        set((state) => ({
          services: [...state.services, service],
        })),
      updateService: (id, updatedService) => 
        set((state) => ({
          services: state.services.map((service) => 
            service.id === id 
              ? { ...service, ...updatedService } 
              : service
          ),
        })),
      deleteService: (id) => 
        set((state) => ({
          services: state.services.filter((service) => service.id !== id),
        })),
      getServiceById: (id) => {
        return get().services.find((service) => service.id === id);
      },
      getServicesByCategory: (category) => {
        return get().services.filter((service) => service.category === category);
      },
    }),
    {
      name: 'services-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);