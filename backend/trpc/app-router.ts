import { createTRPCRouter } from "./create-context";
import hiRoute from "./routes/example/hi/route";
import { listAppointmentsProcedure } from "./routes/appointments/list/route";
import { createAppointmentProcedure } from "./routes/appointments/create/route";
import { updateAppointmentProcedure } from "./routes/appointments/update/route";
import { checkAvailabilityProcedure } from "./routes/availability/check/route";
import { getBusinessProfileProcedure, updateBusinessProfileProcedure } from "./routes/business/profile/route";
import { listServicesProcedure } from "./routes/services/list/route";
import { createServiceProcedure, updateServiceProcedure, deleteServiceProcedure } from "./routes/services/manage/route";
import { listClientsProcedure, createClientProcedure, updateClientProcedure, deleteClientProcedure } from "./routes/clients/route";
import { listPortfolioProcedure, createPortfolioProcedure, updatePortfolioProcedure, deletePortfolioProcedure } from "./routes/portfolio/route";

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
    create: createServiceProcedure,
    update: updateServiceProcedure,
    delete: deleteServiceProcedure,
  }),
  clients: createTRPCRouter({
    list: listClientsProcedure,
    create: createClientProcedure,
    update: updateClientProcedure,
    delete: deleteClientProcedure,
  }),
  portfolio: createTRPCRouter({
    list: listPortfolioProcedure,
    create: createPortfolioProcedure,
    update: updatePortfolioProcedure,
    delete: deletePortfolioProcedure,
  }),
});

export type AppRouter = typeof appRouter;