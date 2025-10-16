import { z } from 'zod';
import { protectedProcedure } from '../../create-context';

export const listClientsProcedure = protectedProcedure
  .input(
    z.object({
      businessId: z.string(),
      sortBy: z.enum(['name', 'lastVisit', 'visitCount']).optional().default('name'),
      sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
    })
  )
  .query(async ({ input, ctx }) => {
    let query = ctx.supabase
      .from('clients')
      .select('*')
      .eq('business_id', input.businessId);

    // Apply sorting
    switch (input.sortBy) {
      case 'name':
        query = query.order('name', { ascending: input.sortOrder === 'asc' });
        break;
      case 'lastVisit':
        query = query.order('last_visit', { ascending: input.sortOrder === 'asc', nullsFirst: false });
        break;
      case 'visitCount':
        query = query.order('visit_count', { ascending: input.sortOrder === 'asc' });
        break;
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch clients: ${error.message}`);
    }

    return data || [];
  });

export const createClientProcedure = protectedProcedure
  .input(
    z.object({
      businessId: z.string(),
      name: z.string(),
      phone: z.string().optional(),
      email: z.string().optional(),
      notes: z.string().optional(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const { data, error } = await ctx.supabase
      .from('clients')
      .insert({
        business_id: input.businessId,
        name: input.name,
        phone: input.phone,
        email: input.email,
        notes: input.notes,
        visit_count: 0,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create client: ${error.message}`);
    }

    return data;
  });

export const updateClientProcedure = protectedProcedure
  .input(
    z.object({
      id: z.string(),
      name: z.string().optional(),
      phone: z.string().optional(),
      email: z.string().optional(),
      notes: z.string().optional(),
      lastVisit: z.string().optional(),
      upcomingAppointment: z.string().optional(),
      visitCount: z.number().optional(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const { id, ...updateData } = input;
    
    const { data, error } = await ctx.supabase
      .from('clients')
      .update({
        ...updateData,
        last_visit: updateData.lastVisit,
        upcoming_appointment: updateData.upcomingAppointment,
        visit_count: updateData.visitCount,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update client: ${error.message}`);
    }

    return data;
  });

export const deleteClientProcedure = protectedProcedure
  .input(
    z.object({
      id: z.string(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const { error } = await ctx.supabase
      .from('clients')
      .delete()
      .eq('id', input.id);

    if (error) {
      throw new Error(`Failed to delete client: ${error.message}`);
    }

    return { success: true };
  });