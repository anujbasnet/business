import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { mockClients } from '@/mocks/clients';
import { Client } from '@/types';

interface ClientsState {
  clients: Client[];
  isLoading: boolean;
  addClient: (client: Client) => void;
  updateClient: (id: string, updatedClient: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  getClientById: (id: string) => Client | undefined;
}

export const useClientsStore = create<ClientsState>()(
  persist(
    (set, get) => ({
      clients: mockClients,
      isLoading: false,
      addClient: (client) => 
        set((state) => ({
          clients: [...state.clients, client],
        })),
      updateClient: (id, updatedClient) => 
        set((state) => ({
          clients: state.clients.map((client) => 
            client.id === id 
              ? { ...client, ...updatedClient } 
              : client
          ),
        })),
      deleteClient: (id) => 
        set((state) => ({
          clients: state.clients.filter((client) => client.id !== id),
        })),
      getClientById: (id) => {
        return get().clients.find((client) => client.id === id);
      },
    }),
    {
      name: 'clients-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);