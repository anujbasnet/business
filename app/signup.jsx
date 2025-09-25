import React, { useState } from "react";
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
import { useAuth } from "@/hooks/useAuthStore";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Phone,
  MapPin,
  Briefcase,
  ChevronDown,
} from "lucide-react-native";
import Colors from "@/constants/colors";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function SignUpScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [serviceName, setServiceName] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [customServiceType, setCustomServiceType] = useState("");
  const [showServiceTypes, setShowServiceTypes] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);
  const { signUp } = useAuth();
  const insets = useSafeAreaInsets();

  const serviceTypes = [
    "Barber",
    "Hair Salon",
    "Nail Salon",
    "Football Pitch",
    "Video Gaming",
    "Spa & Massage",
    "Dental Service",
    "Other",
  ];

  // Replace your existing handleSignUp function with this
  const handleSignUp = async () => {
    const finalServiceType =
      serviceType === "Other" ? customServiceType : serviceType;

    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !repeatPassword ||
      !phoneNumber ||
      !address ||
      !serviceName ||
      !finalServiceType
    ) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (serviceType === "Other" && !customServiceType.trim()) {
      Alert.alert("Error", "Please specify your service type");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }

    if (password !== repeatPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        "http://192.168.1.4:5000/api/auth/business/signup",
        {
          firstName,
          lastName,
          email,
          password,
          phoneNumber,
          address,
          serviceName,
          serviceType: finalServiceType,
          user_type: "business",
          loginStatus: false,
          
        }
      );

      if (response.data.business) {
        Alert.alert("Success", "Account created successfully!");
        router.replace("/login");
      }
    } catch (error) {
      console.log(error.response?.data || error.message);
      Alert.alert(
        "Sign Up Failed",
        error.response?.data?.message || "Something went wrong"
      );
    }

    setLoading(false);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Sign Up",
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
                <Text style={styles.title}>Create Your Account</Text>
                <Text style={styles.subtitle}>
                  Join thousands of businesses managing their appointments with
                  ease
                </Text>
              </View>

              <View style={styles.form}>
                <View style={styles.row}>
                  <View style={[styles.inputContainer, styles.halfWidth]}>
                    <Text style={styles.label}>First Name</Text>
                    <View style={styles.inputWrapper}>
                      <User
                        size={18}
                        color={Colors.neutral.gray}
                        style={styles.inputIcon}
                      />
                      <TextInput
                        style={styles.input}
                        value={firstName}
                        onChangeText={setFirstName}
                        placeholder="First name"
                        autoCapitalize="words"
                        placeholderTextColor={Colors.neutral.gray}
                      />
                    </View>
                  </View>
                  <View style={[styles.inputContainer, styles.halfWidth]}>
                    <Text style={styles.label}>Last Name</Text>
                    <View style={styles.inputWrapper}>
                      <User
                        size={18}
                        color={Colors.neutral.gray}
                        style={styles.inputIcon}
                      />
                      <TextInput
                        style={styles.input}
                        value={lastName}
                        onChangeText={setLastName}
                        placeholder="Last name"
                        autoCapitalize="words"
                        placeholderTextColor={Colors.neutral.gray}
                      />
                    </View>
                  </View>
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Email Address</Text>
                  <View style={styles.inputWrapper}>
                    <Mail
                      size={18}
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
                  <Text style={styles.label}>Phone Number</Text>
                  <View style={styles.inputWrapper}>
                    <Phone
                      size={18}
                      color={Colors.neutral.gray}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      value={phoneNumber}
                      onChangeText={setPhoneNumber}
                      placeholder="Enter your phone number"
                      keyboardType="phone-pad"
                      placeholderTextColor={Colors.neutral.gray}
                    />
                  </View>
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Password</Text>
                  <View style={styles.inputWrapper}>
                    <Lock
                      size={18}
                      color={Colors.neutral.gray}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      value={password}
                      onChangeText={setPassword}
                      placeholder="Create password (min 6 characters)"
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      placeholderTextColor={Colors.neutral.gray}
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      style={styles.eyeIcon}
                    >
                      {showPassword ? (
                        <EyeOff size={18} color={Colors.neutral.gray} />
                      ) : (
                        <Eye size={18} color={Colors.neutral.gray} />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Repeat Password</Text>
                  <View style={styles.inputWrapper}>
                    <Lock
                      size={18}
                      color={Colors.neutral.gray}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      value={repeatPassword}
                      onChangeText={setRepeatPassword}
                      placeholder="Repeat your password"
                      secureTextEntry={!showRepeatPassword}
                      autoCapitalize="none"
                      placeholderTextColor={Colors.neutral.gray}
                    />
                    <TouchableOpacity
                      onPress={() => setShowRepeatPassword(!showRepeatPassword)}
                      style={styles.eyeIcon}
                    >
                      {showRepeatPassword ? (
                        <EyeOff size={18} color={Colors.neutral.gray} />
                      ) : (
                        <Eye size={18} color={Colors.neutral.gray} />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Address</Text>
                  <View style={styles.inputWrapper}>
                    <MapPin
                      size={18}
                      color={Colors.neutral.gray}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      value={address}
                      onChangeText={setAddress}
                      placeholder="Enter your business address"
                      autoCapitalize="words"
                      placeholderTextColor={Colors.neutral.gray}
                    />
                  </View>
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Service Name</Text>
                  <View style={styles.inputWrapper}>
                    <Briefcase
                      size={18}
                      color={Colors.neutral.gray}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      value={serviceName}
                      onChangeText={setServiceName}
                      placeholder="Enter your business name"
                      autoCapitalize="words"
                      placeholderTextColor={Colors.neutral.gray}
                    />
                  </View>
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Service Type</Text>
                  <TouchableOpacity
                    style={styles.inputWrapper}
                    onPress={() => setShowServiceTypes(!showServiceTypes)}
                  >
                    <Briefcase
                      size={18}
                      color={Colors.neutral.gray}
                      style={styles.inputIcon}
                    />
                    <Text
                      style={[
                        styles.input,
                        { paddingVertical: 16 },
                        !serviceType && { color: Colors.neutral.gray },
                      ]}
                    >
                      {serviceType || "Select service type"}
                    </Text>
                    <ChevronDown size={18} color={Colors.neutral.gray} />
                  </TouchableOpacity>

                  {showServiceTypes && (
                    <View style={styles.dropdown}>
                      <ScrollView
                        nestedScrollEnabled
                        style={{ maxHeight: 180 }}
                      >
                        {serviceTypes.map((type) => (
                          <TouchableOpacity
                            key={type}
                            style={styles.dropdownItem}
                            onPress={() => {
                              setServiceType(type);
                              setShowServiceTypes(false);
                              if (type !== "Other") setCustomServiceType("");
                            }}
                          >
                            <Text style={styles.dropdownText}>{type}</Text>
                            {type === "Other" && (
                              <Text style={styles.dropdownDetail}>
                                Specify your own service type
                              </Text>
                            )}
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  )}
                </View>

                {serviceType === "Other" && (
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>Custom Service Type</Text>
                    <View style={styles.inputWrapper}>
                      <Briefcase
                        size={18}
                        color={Colors.neutral.gray}
                        style={styles.inputIcon}
                      />
                      <TextInput
                        style={styles.input}
                        value={customServiceType}
                        onChangeText={setCustomServiceType}
                        placeholder="Enter your service type"
                        autoCapitalize="words"
                        placeholderTextColor={Colors.neutral.gray}
                      />
                    </View>
                  </View>
                )}

                <TouchableOpacity
                  style={[styles.button, loading && styles.buttonDisabled]}
                  onPress={handleSignUp}
                  disabled={loading}
                >
                  <Text style={styles.buttonText}>
                    {loading ? "Creating Account..." : "Sign Up"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.linkButton}
                  onPress={() => router.push("/login")}
                >
                  <Text style={styles.linkText}>
                    Already have an account?{" "}
                    <Text style={{ fontWeight: "600" }}>Sign In</Text>
                  </Text>
                </TouchableOpacity>
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
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  header: { alignItems: "center", marginBottom: 48 },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.neutral.black,
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.neutral.gray,
    textAlign: "center",
    lineHeight: 20,
  },
  form: { gap: 16 },
  row: { flexDirection: "row", gap: 12 },
  halfWidth: { flex: 1 },
  inputContainer: { gap: 8, position: "relative" },
  label: {
    fontSize: 12,
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
    paddingVertical: 14,
    fontSize: 14,
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
  buttonText: { color: Colors.neutral.white, fontSize: 14, fontWeight: "600" },
  linkButton: { alignItems: "center", marginTop: 24, paddingVertical: 8 },
  linkText: { color: Colors.primary.main, fontSize: 14, fontWeight: "500" },
  dropdown: {
    borderWidth: 1,
    borderColor: Colors.neutral.lightGray,
    borderRadius: 12,
    backgroundColor: Colors.neutral.white,
    marginTop: 4,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
  },

  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.lightGray,
    backgroundColor: Colors.neutral.white,
  },

  dropdownText: {
    fontSize: 14,
    color: Colors.neutral.black,
  },

  dropdownDetail: {
    fontSize: 12,
    color: Colors.neutral.gray,
    marginTop: 2,
  },
});
