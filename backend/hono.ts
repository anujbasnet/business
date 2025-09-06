import { Hono } from "hono";
import { trpcServer } from "@hono/trpc-server";
import { cors } from "hono/cors";
import { appRouter } from "./trpc/app-router";
import { createContext } from "./trpc/create-context";

// When deployed, this app is mounted by the platform at /api
const app = new Hono();

// Enable CORS for all routes
app.use("*", cors());

// Mount tRPC router at /trpc; endpoint must match the mounted path (without the external /api prefix)
app.use(
  "/trpc/*",
  trpcServer({
    endpoint: "/trpc",
    router: appRouter,
    createContext,
  })
);

// Simple health check endpoint (will be available at /api/)
app.get("/", (c) => {
  return c.json({ status: "ok", message: "API is running" });
});

export default app;