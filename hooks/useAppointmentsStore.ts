import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { mockAppointments } from '@/mocks/appointments';
import { Appointment } from '@/types';

interface AppointmentsState {
  appointments: Appointment[];
  isLoading: boolean;
  setAppointments?: (appointments: Appointment[]) => void;
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
      setAppointments: (appointments: Appointment[]) => set({ appointments }),
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
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);

        const toTimestamp = (dateStr?: string, timeStr?: string) => {
          const t = (timeStr || '00:00').padStart(5, '0');
          const normalize = (s?: string) => {
            if (!s) return '';
            // ISO YYYY-MM-DD
            if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
            // DD/MM/YYYY or DD-MM-YYYY -> convert to YYYY-MM-DD
            if (/^\d{2}[\/\-]\d{2}[\/\-]\d{4}$/.test(s)) {
              const parts = s.includes('/') ? s.split('/') : s.split('-');
              const [dd, mm, yyyy] = parts;
              return `${yyyy}-${mm}-${dd}`;
            }
            // Fallback: try Date.parse directly
            const d = new Date(s);
            if (!isNaN(d.getTime())) {
              const yyyy = d.getFullYear();
              const mm = String(d.getMonth() + 1).padStart(2, '0');
              const dd = String(d.getDate()).padStart(2, '0');
              return `${yyyy}-${mm}-${dd}`;
            }
            return s; // as-is (may produce NaN below)
          };
          const isoDate = normalize(dateStr);
          const ts = Date.parse(`${isoDate}T${t}:00`);
          return ts;
        };

        const todayMs = todayStart.getTime();
        return get().appointments
          .filter((appointment) => {
            const ts = toTimestamp(appointment.date, appointment.startTime);
            if (isNaN(ts)) return false; // skip invalid
            return (
              ts >= todayMs &&
              appointment.status !== 'cancelled' &&
              appointment.status !== 'completed'
            );
          })
          .sort((a, b) => {
            const ta = toTimestamp(a.date, a.startTime);
            const tb = toTimestamp(b.date, b.startTime);
            if (!isNaN(ta) && !isNaN(tb)) return ta - tb;
            // Fallback to original behavior if parsing fails
            if (a.date !== b.date) return String(a.date).localeCompare(String(b.date));
            return String(a.startTime).localeCompare(String(b.startTime));
          });
      },
    }),
    {
      name: 'appointments-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);