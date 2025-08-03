import { z } from 'zod';
import { publicProcedure, type Context } from '../../create-context';

export const listAppointmentsProcedure = publicProcedure
  .input(
    z.object({
      businessId: z.string(),
      date: z.string().optional(),
      status: z.enum(['pending', 'confirmed', 'completed', 'cancelled']).optional(),
      customerId: z.string().optional(),
    })
  )
  .query(async ({ input, ctx }: { input: any; ctx: Context }) => {
    let query = ctx.supabase
      .from('appointments')
      .select(`
        *,
        customer:users!appointments_customer_id_fkey(id, full_name, email, phone),
        service:services(id, name, price, duration),
        business:businesses(id, business_name)
      `)
      .eq('business_id', input.businessId);

    if (input.date) {
      query = query.eq('appointment_date', input.date);
    }

    if (input.status) {
      query = query.eq('status', input.status);
    }

    if (input.customerId) {
      query = query.eq('customer_id', input.customerId);
    }

    const { data, error } = await query.order('appointment_date', { ascending: true }).order('start_time', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch appointments: ${error.message}`);
    }

    return data || [];
  });