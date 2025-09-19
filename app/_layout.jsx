import React, { useEffect } from "react";
import { StyleSheet } from "react-native";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as SplashScreen from "expo-splash-screen";

import { trpc, trpcClient } from "@/lib/trpc";
import { AuthProvider } from "@/hooks/useAuthStore";
import Colors from "@/constants/colors";

SplashScreen.preventAutoHideAsync();
const queryClient = new QueryClient();

export default function RootLayout() {
  useEffect(() => {
    const init = async () => {
      try {
        await SplashScreen.hideAsync();
      } catch {}
    };
    init();
  }, []);

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <GestureHandlerRootView style={styles.container}>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="auth-redirect" />
              <Stack.Screen name="login" />
              <Stack.Screen name="(tabs)" />
            </Stack>
          </GestureHandlerRootView>
        </AuthProvider>
      </QueryClientProvider>
    </trpc.Provider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
