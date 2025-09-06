import { z } from 'zod';
import { publicProcedure, protectedProcedure } from '../../create-context';

export const listPortfolioProcedure = publicProcedure
  .input(
    z.object({
      businessId: z.string(),
    })
  )
  .query(async ({ input, ctx }) => {
    const { data, error } = await ctx.supabase
      .from('portfolio')
      .select(`
        *,
        service:services(name, category)
      `)
      .eq('business_id', input.businessId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch portfolio: ${error.message}`);
    }

    return data || [];
  });

export const createPortfolioProcedure = protectedProcedure
  .input(
    z.object({
      businessId: z.string(),
      title: z.string(),
      description: z.string().optional(),
      imageUrl: z.string(),
      serviceId: z.string().optional(),
      serviceCategory: z.string().optional(),
      date: z.string().optional(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const { data, error } = await ctx.supabase
      .from('portfolio')
      .insert({
        business_id: input.businessId,
        title: input.title,
        description: input.description,
        image_url: input.imageUrl,
        service_id: input.serviceId,
        service_category: input.serviceCategory,
        date: input.date,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create portfolio item: ${error.message}`);
    }

    return data;
  });

export const updatePortfolioProcedure = protectedProcedure
  .input(
    z.object({
      id: z.string(),
      title: z.string().optional(),
      description: z.string().optional(),
      imageUrl: z.string().optional(),
      serviceId: z.string().optional(),
      serviceCategory: z.string().optional(),
      date: z.string().optional(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const { id, imageUrl, serviceId, serviceCategory, ...updateData } = input;
    
    const { data, error } = await ctx.supabase
      .from('portfolio')
      .update({
        ...updateData,
        image_url: imageUrl,
        service_id: serviceId,
        service_category: serviceCategory,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update portfolio item: ${error.message}`);
    }

    return data;
  });

export const deletePortfolioProcedure = protectedProcedure
  .input(
    z.object({
      id: z.string(),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const { error } = await ctx.supabase
      .from('portfolio')
      .delete()
      .eq('id', input.id);

    if (error) {
      throw new Error(`Failed to delete portfolio item: ${error.message}`);
    }

    return { success: true };
  });