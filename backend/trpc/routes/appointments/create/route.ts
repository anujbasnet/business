import { z } from 'zod';
import { publicProcedure } from '../create-context';
import { mockAppointments } from '@/mocks/appointments';

export const createAppointmentProcedure = publicProcedure
  .input(
    z.object({
      clientName: z.string(),
      clientPhone: z.string().optional(),
      clientEmail: z.string().optional(),
      serviceId: z.string(),
      serviceName: z.string(),
      servicePrice: z.number(),
      date: z.string(),
      startTime: z.string(),
      endTime: z.string(),
      notes: z.string().optional(),
      bookingSource: z.enum(['direct', 'bronapp', 'phone', 'walk-in']).default('direct'),
    })
  )
  .mutation(({ input }) => {
    const newAppointment = {
      id: Date.now().toString(),
      clientId: Date.now().toString(), // In real app, this would be from client lookup/creation
      clientName: input.clientName,
      clientPhone: input.clientPhone,
      clientEmail: input.clientEmail,
      serviceId: input.serviceId,
      serviceName: input.serviceName,
      servicePrice: input.servicePrice,
      date: input.date,
      startTime: input.startTime,
      endTime: input.endTime,
      status: 'pending' as const,
      notes: input.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      bookingSource: input.bookingSource,
    };

    // In a real app, this would be saved to a database
    mockAppointments.push(newAppointment);
    
    return newAppointment;
  });