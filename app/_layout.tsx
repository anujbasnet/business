import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Platform, StyleSheet } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';

import { trpc, trpcClient } from "@/lib/trpc";
import { AuthProvider } from "@/hooks/useAuthStore";
import { ThemeProvider, useTheme } from "@/hooks/useTheme";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  const { colors } = useTheme();
  return (
    <Stack 
      screenOptions={{ 
        headerBackTitle: "Back",
        headerStyle: {
          backgroundColor: colors.primary.main,
        },
        headerTintColor: colors.neutral.white,
        headerTitleStyle: {
          fontWeight: '600',
          color: colors.neutral.white,
        },
        contentStyle: {
          backgroundColor: colors.neutral.background,
        }
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}

function computeApiBase(): string {
  const envBase = process.env.EXPO_PUBLIC_RORK_API_BASE_URL?.replace(/\/$/, "") ?? "";
  if (envBase) return envBase;
  try {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.location?.origin) {
      return window.location.origin.replace(/\/$/, "");
    }
  } catch {}
  return "";
}

export default function RootLayout() {
  useEffect(() => {
    const init = async () => {
      try {
        const seeded = await AsyncStorage.getItem('supabase_setup_done');
        if (seeded) return;

        const apiPrefix = (process.env.EXPO_PUBLIC_RORK_API_PREFIX ?? '/api').replace(/\/$/, '');
        const base = computeApiBase();
        const healthUrl = `${base}${apiPrefix}/` || `${apiPrefix}/`;

        let apiOk = false;
        try {
          const res = await fetch(healthUrl, { method: 'GET' });
          apiOk = res.ok;
        } catch {}

        if (!apiOk) {
          await AsyncStorage.setItem('supabase_setup_done', 'skip:no-api');
          return;
        }

        const status = await trpcClient.admin.status.query();
        console.log('[bootstrap] status', status);
        await trpcClient.admin.setupPublic.mutate({ run: true });
        await AsyncStorage.setItem('supabase_setup_done', '1');
      } catch (e) {
        // Silence noisy bootstrap errors permanently for this session
        await AsyncStorage.setItem('supabase_setup_done', 'skip:error');
      } finally {
        SplashScreen.hideAsync();
      }
    };
    void init();
  }, []);

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ThemeProvider>
            <GestureHandlerRootView style={styles.container}>
              <RootLayoutNav />
            </GestureHandlerRootView>
          </ThemeProvider>
        </AuthProvider>
      </QueryClientProvider>
    </trpc.Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});