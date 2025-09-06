import { createTRPCReact } from "@trpc/react-query";
import { httpLink, loggerLink } from "@trpc/client";
import type { AppRouter } from "@/backend/trpc/app-router";
import superjson from "superjson";
import { Platform } from 'react-native';
import { supabase } from './supabase';

export const trpc = createTRPCReact<AppRouter>();

const getBaseUrl = (): string => {
  const envBase = process.env.EXPO_PUBLIC_RORK_API_BASE_URL;
  if (envBase && envBase.length > 0) {
    return envBase.replace(/\/$/, "");
  }

  try {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.location?.origin) {
      return window.location.origin.replace(/\/$/, "");
    }
  } catch (e) {
    console.log('[trpc] window origin check failed', e);
  }

  throw new Error("No base url found. Set EXPO_PUBLIC_RORK_API_BASE_URL to your app origin hosting the API (e.g. https://your-project.rork.com)");
};

const apiPrefix = (process.env.EXPO_PUBLIC_RORK_API_PREFIX ?? '/api').replace(/\/$/, '');
const baseUrl = `${getBaseUrl()}${apiPrefix}/trpc`;
console.log('[trpc] Using API base', baseUrl);

export const trpcClient = trpc.createClient({
  links: [
    ...(process.env.NODE_ENV !== 'production' ? [loggerLink({ enabled: () => true })] : []),
    httpLink({
      url: baseUrl,
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