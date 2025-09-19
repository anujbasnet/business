import React, { useEffect } from "react";
import { Platform, StyleSheet } from "react-native";
import { Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { trpc, trpcClient } from "@/lib/trpc";
import { AuthProvider } from "@/hooks/useAuthStore";
import Colors from "@/constants/colors";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function computeApiBase() {
  const envBase =
    (process.env.EXPO_PUBLIC_RORK_API_BASE_URL || "").replace(/\/$/, "") || "";
  if (envBase) return envBase;

  try {
    if (Platform.OS === "web" && typeof window !== "undefined" && window.location?.origin) {
      return window.location.origin.replace(/\/$/, "");
    }
  } catch {}
  return "";
}

function RootLayoutNav() {
  const router = useRouter();

  useEffect(() => {
    const checkLogin = async () => {
      const token = await AsyncStorage.getItem("token");

      // If no token, redirect to login
      if (!token) {
        router.replace("/login");
      }
      // If token exists, home tab will show by default
    };
    checkLogin();
  }, []);

  return (
    <Stack
      screenOptions={{
        headerBackTitle: "Back",
        headerStyle: { backgroundColor: Colors.primary.main },
        headerTintColor: Colors.neutral.white,
        headerTitleStyle: { fontWeight: "600", color: Colors.neutral.white },
        contentStyle: { backgroundColor: Colors.neutral.background },
      }}
    >
      {/* Home tabs screen */}
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      {/* Login screen is separate file at /app/login.jsx */}
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    const init = async () => {
      try {
        const seeded = await AsyncStorage.getItem("supabase_setup_done");
        if (seeded) {
          SplashScreen.hideAsync();
          return;
        }

        const apiPrefix = (process.env.EXPO_PUBLIC_RORK_API_PREFIX || "/api").replace(/\/$/, "");
        const base = computeApiBase();
        const healthUrl = `${base}${apiPrefix}/` || `${apiPrefix}/`;

        let apiOk = false;
        try {
          const res = await fetch(healthUrl, { method: "GET" });
          apiOk = res.ok;
        } catch {
          console.log("[bootstrap] API health check failed");
        }

        if (!apiOk) {
          console.log("[bootstrap] API not available, skipping setup");
          await AsyncStorage.setItem("supabase_setup_done", "skip:no-api");
          SplashScreen.hideAsync();
          return;
        }

        try {
          const status = await trpcClient.admin.status.query();
          console.log("[bootstrap] status", status);
          if (status.schemaReady) {
            await trpcClient.admin.setupPublic.mutate({ run: true });
            console.log("[bootstrap] Setup completed successfully");
          }
          await AsyncStorage.setItem("supabase_setup_done", "1");
        } catch (setupError) {
          console.log("[bootstrap] Setup failed, but continuing:", setupError);
          await AsyncStorage.setItem("supabase_setup_done", "skip:setup-error");
        }
      } catch (e) {
        console.log("[bootstrap] Init failed:", e);
        await AsyncStorage.setItem("supabase_setup_done", "skip:error");
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
  container: { flex: 1 },
});
