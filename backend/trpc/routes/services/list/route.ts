import { publicProcedure } from '../../create-context';
import { mockServices } from '@/mocks/services';

export const listServicesProcedure = publicProcedure
  .query(() => {
    return mockServices;
  });