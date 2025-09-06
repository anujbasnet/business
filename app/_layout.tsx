import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StyleSheet } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';

import Colors from "@/constants/colors";
import { trpc, trpcClient } from "@/lib/trpc";
import { AuthProvider } from "@/hooks/useAuthStore";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack 
      screenOptions={{ 
        headerBackTitle: "Back",
        headerStyle: {
          backgroundColor: Colors.primary.main,
        },
        headerTintColor: Colors.neutral.white,
        headerTitleStyle: {
          fontWeight: '600',
        },
        contentStyle: {
          backgroundColor: Colors.neutral.background,
        }
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    const init = async () => {
      try {
        const seeded = await AsyncStorage.getItem('supabase_setup_done');
        if (!seeded) {
          console.log('[bootstrap] Checking schema status...');
          const status = await trpcClient.admin.status.query();
          console.log('[bootstrap] status', status);
          console.log('[bootstrap] Running public setup to seed data & buckets');
          await trpcClient.admin.setupPublic.mutate({ run: true });
          await AsyncStorage.setItem('supabase_setup_done', '1');
        }
      } catch (e) {
        console.error('[bootstrap] setup error', e);
      } finally {
        SplashScreen.hideAsync();
      }
    };
    init();
  }, []);

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <GestureHandlerRootView style={styles.container}>
            <RootLayoutNav />
          </GestureHandlerRootView>
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