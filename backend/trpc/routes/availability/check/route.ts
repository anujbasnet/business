import { z } from 'zod';
import { publicProcedure, type Context } from '../../create-context';

export const checkAvailabilityProcedure = publicProcedure
  .input(
    z.object({
      businessId: z.string(),
      date: z.string(),
      serviceId: z.string().optional(),
    })
  )
  .query(async ({ input, ctx }) => {
    // Get service duration if serviceId is provided
    let serviceDuration = 60; // Default 60 minutes
    
    if (input.serviceId) {
      const { data: service } = await ctx.supabase
        .from('services')
        .select('duration')
        .eq('id', input.serviceId)
        .single();
      
      if (service) {
        serviceDuration = service.duration;
      }
    }
    
    // Get existing appointments for the date
    const { data: existingAppointments } = await ctx.supabase
      .from('appointments')
      .select('start_time, end_time, id')
      .eq('business_id', input.businessId)
      .eq('appointment_date', input.date)
      .neq('status', 'cancelled');

    // Generate time slots from 9 AM to 6 PM (business hours)
    const slots = [];
    const startHour = 9;
    const endHour = 18;
    
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        
        // Check if this slot conflicts with existing appointments
        const isBooked = existingAppointments?.some((appointment) => {
          const appointmentStart = appointment.start_time;
          const appointmentEnd = appointment.end_time;
          
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
        }) || false;
        
        // Check if there's enough time before the next appointment
        const hasEnoughTime = !existingAppointments?.some((appointment) => {
          const appointmentStartMinutes = parseInt(appointment.start_time.split(':')[0]) * 60 + parseInt(appointment.start_time.split(':')[1]);
          const slotMinutes = hour * 60 + minute;
          const slotEndMinutes = slotMinutes + serviceDuration;
          
          return slotMinutes < appointmentStartMinutes && slotEndMinutes > appointmentStartMinutes;
        });
        
        slots.push({
          time,
          available: !isBooked && hasEnoughTime,
          appointmentId: existingAppointments?.find((a) => a.start_time === time)?.id,
        });
      }
    }

    return {
      date: input.date,
      slots,
    };
  });