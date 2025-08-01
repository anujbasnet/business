import { z } from 'zod';
import { publicProcedure } from '../../create-context';
import { mockAppointments } from '@/mocks/appointments';
import { mockServices } from '@/mocks/services';
import type { TimeSlot, AvailabilityResponse } from '@/types';

export const checkAvailabilityProcedure = publicProcedure
  .input(
    z.object({
      date: z.string(),
      serviceId: z.string().optional(),
    })
  )
  .query(({ input }) => {
    const service = input.serviceId 
      ? mockServices.find(s => s.id === input.serviceId)
      : null;
    
    const serviceDuration = service?.duration || 60; // Default 60 minutes
    
    // Get existing appointments for the date
    const existingAppointments = mockAppointments.filter(
      (appointment) => 
        appointment.date === input.date && 
        appointment.status !== 'cancelled'
    );

    // Generate time slots from 9 AM to 6 PM (business hours)
    const slots: TimeSlot[] = [];
    const startHour = 9;
    const endHour = 18;
    
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        
        // Check if this slot conflicts with existing appointments
        const isBooked = existingAppointments.some(appointment => {
          const appointmentStart = appointment.startTime;
          const appointmentEnd = appointment.endTime;
          
          // Convert times to minutes for easier comparison
          const slotMinutes = hour * 60 + minute;
          const appointmentStartMinutes = parseInt(appointmentStart.split(':')[0]) * 60 + parseInt(appointmentStart.split(':')[1]);
          const appointmentEndMinutes = parseInt(appointmentEnd.split(':')[0]) * 60 + parseInt(appointmentEnd.split(':')[1]);
          
          // Check if the slot would overlap with the appointment
          const slotEndMinutes = slotMinutes + serviceDuration;
          
          return (
            (slotMinutes >= appointmentStartMinutes && slotMinutes < appointmentEndMinutes) ||
            (slotEndMinutes > appointmentStartMinutes && slotEndMinutes <= appointmentEndMinutes) ||
            (slotMinutes <= appointmentStartMinutes && slotEndMinutes >= appointmentEndMinutes)
          );
        });
        
        // Check if there's enough time before the next appointment
        const hasEnoughTime = !existingAppointments.some(appointment => {
          const appointmentStartMinutes = parseInt(appointment.startTime.split(':')[0]) * 60 + parseInt(appointment.startTime.split(':')[1]);
          const slotMinutes = hour * 60 + minute;
          const slotEndMinutes = slotMinutes + serviceDuration;
          
          return slotMinutes < appointmentStartMinutes && slotEndMinutes > appointmentStartMinutes;
        });
        
        slots.push({
          time,
          available: !isBooked && hasEnoughTime,
          appointmentId: existingAppointments.find(a => a.startTime === time)?.id,
        });
      }
    }

    const response: AvailabilityResponse = {
      date: input.date,
      slots,
    };

    return response;
  });