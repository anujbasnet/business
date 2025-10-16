import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, Stack } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Eye, EyeOff, Mail, Lock, Scissors } from "lucide-react-native";
import Colors from "@/constants/colors";
import axios from "axios";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const insets = useSafeAreaInsets();

  // Check login on app start
  useEffect(() => {
    const checkLogin = async () => {
      const token = await AsyncStorage.getItem("BusinessToken");
      if (token) {
        router.replace("/(tabs)");
      }
    };
    checkLogin();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    try {
      const response = await axios.post(
        `https://${process.env.EXPO_PUBLIC_SERVER_IP}/api/auth/business/login`,
        { email, password }
      );

      if (response.data?.token) {
        await AsyncStorage.setItem("BusinessToken", response.data.token);
        await AsyncStorage.setItem("businessId", response.data.business.id);
        router.replace("/(tabs)"); // Directly go to dashboard
      } else {
        Alert.alert(
          "Login Failed",
          response.data.message || "Invalid credentials"
        );
      }
    } catch (err) {
      console.log(err);
      Alert.alert(
        "Login Failed",
        err.response?.data?.message || "Something went wrong"
      );
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "",
          headerTitle: () => (
            <View style={styles.headerTitle}>
              <Scissors size={24} color={Colors.neutral.white} />
              <Text style={styles.headerTitleText}>Rejaly.uz</Text>
            </View>
          ),
        }}
      />
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.content}>
              <View style={styles.header}>
                <Text style={styles.title}>Welcome Back</Text>
                <Text style={styles.subtitle}>
                  Sign in to continue to your business dashboard
                </Text>
              </View>

              <View style={styles.form}>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Email Address</Text>
                  <View style={styles.inputWrapper}>
                    <Mail
                      size={20}
                      color={Colors.neutral.gray}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      value={email}
                      onChangeText={setEmail}
                      placeholder="Enter your email"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      placeholderTextColor={Colors.neutral.gray}
                    />
                  </View>
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Password</Text>
                  <View style={styles.inputWrapper}>
                    <Lock
                      size={20}
                      color={Colors.neutral.gray}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      value={password}
                      onChangeText={setPassword}
                      placeholder="Enter your password"
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      placeholderTextColor={Colors.neutral.gray}
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      style={styles.eyeIcon}
                    >
                      {showPassword ? (
                        <EyeOff size={20} color={Colors.neutral.gray} />
                      ) : (
                        <Eye size={20} color={Colors.neutral.gray} />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.button, loading && styles.buttonDisabled]}
                  onPress={handleLogin}
                  disabled={loading}
                >
                  <Text style={styles.buttonText}>
                    {loading ? "Signing In..." : "Sign In"}
                  </Text>
                </TouchableOpacity>

                <View style={styles.bottomLinks}>
                  <TouchableOpacity
                    style={styles.linkButton}
                    onPress={() => router.push("/signup")}
                  >
                    <Text style={styles.linkText}>
                      Don't have an account?{" "}
                      <Text style={{ fontWeight: "600" }}>Sign Up</Text>
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.neutral.white },
  keyboardView: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 40,
    maxWidth: 400,
    width: "100%",
    alignSelf: "center",
  },
  header: { alignItems: "center", marginBottom: 48 },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: Colors.neutral.black,
    textAlign: "center",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.neutral.gray,
    textAlign: "center",
    lineHeight: 22,
  },
  form: { gap: 24, width: "100%" },
  bottomLinks: { alignItems: "center", gap: 8, marginTop: 24 },
  inputContainer: { gap: 8 },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.neutral.black,
    marginBottom: 4,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.neutral.lightGray,
    borderRadius: 12,
    backgroundColor: Colors.neutral.background,
    paddingHorizontal: 16,
  },
  inputIcon: { marginRight: 12 },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: Colors.neutral.black,
  },
  eyeIcon: { padding: 4, marginLeft: 8 },
  button: {
    backgroundColor: Colors.primary.main,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 16,
    shadowColor: Colors.primary.main,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonDisabled: { opacity: 0.6, shadowOpacity: 0.1 },
  buttonText: { color: Colors.neutral.white, fontSize: 16, fontWeight: "600" },
  linkButton: { alignItems: "center", paddingVertical: 8 },
  linkText: { color: Colors.primary.main, fontSize: 16, fontWeight: "500" },
  headerTitle: { flexDirection: "row", alignItems: "center", gap: 8 },
  headerTitleText: {
    color: Colors.neutral.white,
    fontSize: 18,
    fontWeight: "600",
  },
});
