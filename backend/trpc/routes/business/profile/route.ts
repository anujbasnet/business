import { z } from 'zod';
import { publicProcedure, type Context } from '../../create-context';

export const getBusinessProfileProcedure = publicProcedure
  .input(
    z.object({
      businessId: z.string(),
    })
  )
  .query(async ({ input, ctx }: { input: any; ctx: Context }) => {
    const { data, error } = await ctx.supabase
      .from('businesses')
      .select(`
        *,
        user:users(id, full_name, email, phone, avatar_url)
      `)
      .eq('id', input.businessId)
      .single();

    if (error) {
      throw new Error(`Failed to fetch business profile: ${error.message}`);
    }

    return data;
  });

export const updateBusinessProfileProcedure = publicProcedure
  .input(
    z.object({
      businessId: z.string(),
      businessName: z.string().optional(),
      description: z.string().optional(),
      address: z.string().optional(),
      phone: z.string().optional(),
      email: z.string().optional(),
      website: z.string().optional(),
      instagram: z.string().optional(),
      workingHours: z.any().optional(),
      employees: z.any().optional(),
    })
  )
  .mutation(async ({ input, ctx }: { input: any; ctx: Context }) => {
    const { businessId, ...updateData } = input;
    
    const { data, error } = await ctx.supabase
      .from('businesses')
      .update({
        ...updateData,
        business_name: updateData.businessName,
        working_hours: updateData.workingHours,
        updated_at: new Date().toISOString(),
      })
      .eq('id', businessId)
      .select(`
        *,
        user:users(id, full_name, email, phone, avatar_url)
      `)
      .single();

    if (error) {
      throw new Error(`Failed to update business profile: ${error.message}`);
    }

    return data;
  });