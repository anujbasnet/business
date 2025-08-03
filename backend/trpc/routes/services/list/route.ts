import { z } from 'zod';
import { publicProcedure, type Context } from '../../create-context';

export const listServicesProcedure = publicProcedure
  .input(
    z.object({
      businessId: z.string(),
    })
  )
  .query(async ({ input, ctx }: { input: any; ctx: Context }) => {
    const { data, error } = await ctx.supabase
      .from('services')
      .select('*')
      .eq('business_id', input.businessId)
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) {
      throw new Error(`Failed to fetch services: ${error.message}`);
    }

    return data || [];
  });