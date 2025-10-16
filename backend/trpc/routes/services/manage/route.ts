import { z } from 'zod';
import { protectedProcedure } from '../../../create-context';

export const createServiceProcedure = protectedProcedure
  .input(
    z.object({
      businessId: z.string(),
      name: z.string(),
      description: z.string().optional(),
      price: z.number(),
      duration: z.number(),
      category: z.string().optional(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const { data, error } = await ctx.supabase
      .from('services')
      .insert({
        business_id: input.businessId,
        name: input.name,
        description: input.description,
        price: input.price,
        duration: input.duration,
        category: input.category,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create service: ${error.message}`);
    }

    return data;
  });

export const updateServiceProcedure = protectedProcedure
  .input(
    z.object({
      id: z.string(),
      name: z.string().optional(),
      description: z.string().optional(),
      price: z.number().optional(),
      duration: z.number().optional(),
      category: z.string().optional(),
      isActive: z.boolean().optional(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const { id, isActive, ...updateData } = input;
    
    const { data, error } = await ctx.supabase
      .from('services')
      .update({
        ...updateData,
        is_active: isActive,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update service: ${error.message}`);
    }

    return data;
  });

export const deleteServiceProcedure = protectedProcedure
  .input(
    z.object({
      id: z.string(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const { error } = await ctx.supabase
      .from('services')
      .delete()
      .eq('id', input.id);

    if (error) {
      throw new Error(`Failed to delete service: ${error.message}`);
    }

    return { success: true };
  });