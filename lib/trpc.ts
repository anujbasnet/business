import { createTRPCReact } from "@trpc/react-query";
import { httpLink } from "@trpc/client";
import type { AppRouter } from "@/backend/trpc/app-router";
import superjson from "superjson";
import { Platform } from 'react-native';
import { supabase } from './supabase';

export const trpc = createTRPCReact<AppRouter>();

const getApiBaseUrl = (): string => {
  try {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const origin = window.location?.origin ?? '';
      const path = window.location?.pathname ?? '';
      if (!origin) return '';

      const segments = path.split('/').filter(Boolean);
      const inProject = segments.length >= 2 && segments[0] === 'p';
      const projectBase = inProject ? `/p/${segments[1]}` : '';
      const base = `${origin}${projectBase}/api`;
      return base;
    }
  } catch (e) {
    console.log('[trpc] window origin check failed', e);
  }

  const envBase = process.env.EXPO_PUBLIC_RORK_API_BASE_URL ?? '';
  if (envBase) {
    return envBase.endsWith('/api') ? envBase : `${envBase}/api`;
  }

  throw new Error("No API base url found. Set EXPO_PUBLIC_RORK_API_BASE_URL (pointing to the site origin or origin/p/{project}) or run on web.");
};

const API_BASE = getApiBaseUrl();

export const trpcClient = trpc.createClient({
  links: [
    httpLink({
      url: `${API_BASE}/trpc`,
      transformer: superjson,
      async headers() {
        const { data: { session } } = await supabase.auth.getSession();
        return {
          authorization: session?.access_token ? `Bearer ${session.access_token}` : '',
        };
      },
    }),
  ],
});