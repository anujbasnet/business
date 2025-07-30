import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { mockAppointments } from '@/mocks/appointments';
import { Appointment } from '@/types';

interface AppointmentsState {
  appointments: Appointment[];
  isLoading: boolean;
  addAppointment: (appointment: Appointment) => void;
  updateAppointment: (id: string, updatedAppointment: Partial<Appointment>) => void;
  deleteAppointment: (id: string) => void;
  getAppointmentsByDate: (date: string) => Appointment[];
  getAppointmentsByClient: (clientId: string) => Appointment[];
  getUpcomingAppointments: () => Appointment[];
}

export const useAppointmentsStore = create<AppointmentsState>()(
  persist(
    (set, get) => ({
      appointments: mockAppointments,
      isLoading: false,
      addAppointment: (appointment) => 
        set((state) => ({
          appointments: [...state.appointments, appointment],
        })),
      updateAppointment: (id, updatedAppointment) => 
        set((state) => ({
          appointments: state.appointments.map((appointment) => 
            appointment.id === id 
              ? { ...appointment, ...updatedAppointment } 
              : appointment
          ),
        })),
      deleteAppointment: (id) => 
        set((state) => ({
          appointments: state.appointments.filter((appointment) => appointment.id !== id),
        })),
      getAppointmentsByDate: (date) => {
        return get().appointments.filter((appointment) => appointment.date === date);
      },
      getAppointmentsByClient: (clientId) => {
        return get().appointments.filter((appointment) => appointment.clientId === clientId);
      },
      getUpcomingAppointments: () => {
        const today = new Date().toISOString().split('T')[0];
        return get().appointments
          .filter((appointment) => 
            appointment.date >= today && 
            appointment.status !== 'cancelled' && 
            appointment.status !== 'completed'
          )
          .sort((a, b) => {
            if (a.date !== b.date) {
              return a.date.localeCompare(b.date);
            }
            return a.startTime.localeCompare(b.startTime);
          });
      },
    }),
    {
      name: 'appointments-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);