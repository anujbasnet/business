import { z } from 'zod';
import { publicProcedure } from '../../create-context';
import { mockAppointments } from '@/mocks/appointments';

export const listAppointmentsProcedure = publicProcedure
  .input(
    z.object({
      date: z.string().optional(),
      status: z.enum(['confirmed', 'pending', 'cancelled', 'completed', 'no-show']).optional(),
      clientId: z.string().optional(),
    })
  )
  .query(({ input }: { input: any }) => {
    let filteredAppointments = [...mockAppointments];

    if (input.date) {
      filteredAppointments = filteredAppointments.filter(
        (appointment) => appointment.date === input.date
      );
    }

    if (input.status) {
      filteredAppointments = filteredAppointments.filter(
        (appointment) => appointment.status === input.status
      );
    }

    if (input.clientId) {
      filteredAppointments = filteredAppointments.filter(
        (appointment) => appointment.clientId === input.clientId
      );
    }

    return filteredAppointments.sort((a, b) => {
      const dateA = new Date(`${a.date} ${a.startTime}`);
      const dateB = new Date(`${b.date} ${b.startTime}`);
      return dateA.getTime() - dateB.getTime();
    });
  });