import { createTRPCRouter } from "./create-context";
import hiRoute from "./routes/example/hi/route";
import { listAppointmentsProcedure } from "./routes/appointments/list/route";
import { createAppointmentProcedure } from "./routes/appointments/create/route";
import { updateAppointmentProcedure } from "./routes/appointments/update/route";
import { checkAvailabilityProcedure } from "./routes/availability/check/route";
import { getBusinessProfileProcedure, updateBusinessProfileProcedure } from "./routes/business/profile/route";
import { listServicesProcedure } from "./routes/services/list/route";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiRoute,
  }),
  appointments: createTRPCRouter({
    list: listAppointmentsProcedure,
    create: createAppointmentProcedure,
    update: updateAppointmentProcedure,
  }),
  availability: createTRPCRouter({
    check: checkAvailabilityProcedure,
  }),
  business: createTRPCRouter({
    profile: getBusinessProfileProcedure,
    updateProfile: updateBusinessProfileProcedure,
  }),
  services: createTRPCRouter({
    list: listServicesProcedure,
  }),
});

export type AppRouter = typeof appRouter;