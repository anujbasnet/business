import { z } from 'zod';
import { publicProcedure } from '../../create-context';
import { mockProfile } from '@/mocks/profile';

export const getBusinessProfileProcedure = publicProcedure
  .query(() => {
    return mockProfile;
  });

export const updateBusinessProfileProcedure = publicProcedure
  .input(
    z.object({
      name: z.string().optional(),
      address: z.string().optional(),
      phone: z.string().optional(),
      email: z.string().optional(),
      bio: z.string().optional(),
      website: z.string().optional(),
      socialMedia: z.object({
        instagram: z.string().optional(),
        facebook: z.string().optional(),
        twitter: z.string().optional(),
      }).optional(),
      workingHours: z.record(
        z.object({
          isOpen: z.boolean(),
          openTime: z.string(),
          closeTime: z.string(),
        })
      ).optional(),
      isAcceptingBookings: z.boolean().optional(),
      bookingSettings: z.object({
        advanceBookingDays: z.number(),
        cancellationPolicy: z.string(),
        requiresConfirmation: z.boolean(),
      }).optional(),
    })
  )
  .mutation(({ input }) => {
    // In a real app, this would update the database
    Object.assign(mockProfile, {
      ...input,
      updatedAt: new Date().toISOString(),
    });
    
    return mockProfile;
  });