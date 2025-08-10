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
      addAppointment: (appointment) => {
        // Update state
        set((state) => ({
          appointments: [...state.appointments, appointment],
        }));
        // Notify
        try {
          const { useNotificationsStore } = require('@/hooks/useNotificationsStore');
          const notifications = useNotificationsStore.getState();
          notifications.addNotification({
            type: 'new_appointment',
            title: 'New Appointment Booked',
            message: `${appointment.clientName} booked ${appointment.serviceName} on ${appointment.date} at ${appointment.startTime}`,
            clientName: appointment.clientName,
            appointmentId: appointment.id,
          });
        } catch (err) {
          console.log('[useAppointmentsStore] addAppointment notify error', err);
        }
      },
      updateAppointment: (id, updatedAppointment) => {
        let prevAppointment: Appointment | undefined;
        let nextAppointment: Appointment | undefined;
        set((state) => {
          prevAppointment = state.appointments.find((a) => a.id === id);
          const updated = state.appointments.map((appointment) =>
            appointment.id === id ? { ...appointment, ...updatedAppointment, updatedAt: new Date().toISOString() } : appointment
          );
          nextAppointment = updated.find((a) => a.id === id);
          return { appointments: updated };
        });
        try {
          if (!prevAppointment || !nextAppointment) return;
          const { useNotificationsStore } = require('@/hooks/useNotificationsStore');
          const notifications = useNotificationsStore.getState();
          if (prevAppointment.status !== 'cancelled' && nextAppointment.status === 'cancelled') {
            notifications.addNotification({
              type: 'appointment_cancelled',
              title: 'Appointment Cancelled',
              message: `${nextAppointment.clientName} cancelled ${nextAppointment.serviceName} on ${nextAppointment.date}`,
              clientName: nextAppointment.clientName,
              appointmentId: nextAppointment.id,
            });
          } else {
            const changed = [
              prevAppointment.date !== nextAppointment.date,
              prevAppointment.startTime !== nextAppointment.startTime,
              prevAppointment.endTime !== nextAppointment.endTime,
              prevAppointment.serviceName !== nextAppointment.serviceName,
              prevAppointment.status !== nextAppointment.status,
            ].some(Boolean);
            if (changed) {
              notifications.addNotification({
                type: 'appointment_changed',
                title: 'Appointment Updated',
                message: `${nextAppointment.clientName} updated to ${nextAppointment.serviceName} on ${nextAppointment.date} at ${nextAppointment.startTime}`,
                clientName: nextAppointment.clientName,
                appointmentId: nextAppointment.id,
              });
            }
          }
        } catch (err) {
          console.log('[useAppointmentsStore] updateAppointment notify error', err);
        }
      },
      deleteAppointment: (id) => {
        let deleted: Appointment | undefined;
        set((state) => {
          deleted = state.appointments.find((a) => a.id === id);
          return { appointments: state.appointments.filter((appointment) => appointment.id !== id) };
        });
        try {
          if (!deleted) return;
          const { useNotificationsStore } = require('@/hooks/useNotificationsStore');
          const notifications = useNotificationsStore.getState();
          notifications.addNotification({
            type: 'appointment_cancelled',
            title: 'Appointment Cancelled',
            message: `${deleted.clientName} cancelled ${deleted.serviceName} on ${deleted.date}`,
            clientName: deleted.clientName,
            appointmentId: deleted.id,
          });
        } catch (err) {
          console.log('[useAppointmentsStore] deleteAppointment notify error', err);
        }
      },
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