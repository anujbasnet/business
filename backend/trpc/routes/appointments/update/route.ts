import { z } from 'zod';
import { publicProcedure, type Context } from '../../create-context';

export const updateAppointmentProcedure = publicProcedure
  .input(
    z.object({
      id: z.string(),
      status: z.enum(['pending', 'confirmed', 'completed', 'cancelled']).optional(),
      notes: z.string().optional(),
      appointmentDate: z.string().optional(),
      startTime: z.string().optional(),
      endTime: z.string().optional(),
    })
  )
  .mutation(async ({ input, ctx }: { input: any; ctx: Context }) => {
    const updateData: any = {};
    
    if (input.status) updateData.status = input.status;
    if (input.notes !== undefined) updateData.notes = input.notes;
    if (input.appointmentDate) updateData.appointment_date = input.appointmentDate;
    if (input.startTime) updateData.start_time = input.startTime;
    if (input.endTime) updateData.end_time = input.endTime;
    
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await ctx.supabase
      .from('appointments')
      .update(updateData)
      .eq('id', input.id)
      .select(`
        *,
        customer:users!appointments_customer_id_fkey(id, full_name, email, phone),
        service:services(id, name, price, duration),
        business:businesses(id, business_name)
      `)
      .single();

    if (error) {
      throw new Error(`Failed to update appointment: ${error.message}`);
    }

    return data;
  });