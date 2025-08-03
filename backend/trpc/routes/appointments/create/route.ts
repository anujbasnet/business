import { z } from 'zod';
import { publicProcedure, type Context } from '../../create-context';

export const createAppointmentProcedure = publicProcedure
  .input(
    z.object({
      customerId: z.string(),
      businessId: z.string(),
      serviceId: z.string(),
      appointmentDate: z.string(),
      startTime: z.string(),
      endTime: z.string(),
      notes: z.string().optional(),
      totalPrice: z.number(),
    })
  )
  .mutation(async ({ input, ctx }: { input: any; ctx: Context }) => {
    const { data, error } = await ctx.supabase
      .from('appointments')
      .insert({
        customer_id: input.customerId,
        business_id: input.businessId,
        service_id: input.serviceId,
        appointment_date: input.appointmentDate,
        start_time: input.startTime,
        end_time: input.endTime,
        notes: input.notes,
        total_price: input.totalPrice,
        status: 'pending',
      })
      .select(`
        *,
        customer:users!appointments_customer_id_fkey(id, full_name, email, phone),
        service:services(id, name, price, duration),
        business:businesses(id, business_name)
      `)
      .single();

    if (error) {
      throw new Error(`Failed to create appointment: ${error.message}`);
    }

    return data;
  });