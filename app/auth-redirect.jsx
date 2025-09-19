import React, { useEffect } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import Colors from "@/constants/colors";

export default function AuthRedirect() {
  const router = useRouter();

  useEffect(() => {
    const checkLogin = async () => {
      const token = await AsyncStorage.getItem("BusinessToken");

      // Use replace so user cannot go back to redirect
      if (token) {
        router.replace("(tabs)");
      } else {
        router.replace("/login");
      }
    };
    checkLogin();
  }, []);

  return (
    <View style={styles.loader}>
      <ActivityIndicator size="large" color={Colors.primary.main} />
    </View>
  );
}

const styles = StyleSheet.create({
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
});
