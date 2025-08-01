import { z } from 'zod';
import { publicProcedure } from '../../create-context';
import { mockAppointments } from '@/mocks/appointments';

export const updateAppointmentProcedure = publicProcedure
  .input(
    z.object({
      id: z.string(),
      status: z.enum(['confirmed', 'pending', 'cancelled', 'completed', 'no-show']).optional(),
      notes: z.string().optional(),
      date: z.string().optional(),
      startTime: z.string().optional(),
      endTime: z.string().optional(),
    })
  )
  .mutation(({ input }) => {
    const appointmentIndex = mockAppointments.findIndex(
      (appointment) => appointment.id === input.id
    );

    if (appointmentIndex === -1) {
      throw new Error('Appointment not found');
    }

    const updatedAppointment = {
      ...mockAppointments[appointmentIndex],
      ...input,
      updatedAt: new Date().toISOString(),
    };

    mockAppointments[appointmentIndex] = updatedAppointment;
    
    return updatedAppointment;
  });