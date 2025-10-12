import React, { useState, useEffect } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Stack } from "expo-router";
import axios from "axios";

import Colors from "@/constants/colors";
import { translations } from "@/constants/translations";
import { useLanguageStore } from "@/hooks/useLanguageStore";
import { useBusinessStore } from "@/hooks/useBusinessStore";


const API_BASE = "http://192.168.1.4:5000";

export default function EditBusinessDetailsScreen() {
  const { language } = useLanguageStore();
  const { profile, updateProfile } = useBusinessStore();
  const t = translations[language];

  const [businessName, setBusinessName] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  const businessId = profile.id;

  useEffect(() => {
    if (!businessId) return; // wait for store to populate
    axios
      .get(`${API_BASE}/api/business/${businessId}`)
      .then((res) => {
        const data = res.data?.business || res.data || {};
        setBusinessName(data.full_name || "");
        setServiceType(data.service_type || "");
        setAddress(data.address || "");
        setPhone(data.phone_number || "");
        setEmail(data.email || "");
        setDescription(data.description || "");
      })
      .catch((err) => {
        console.error(
          "Fetch business error",
          err?.response?.data || err.message
        );
        Alert.alert(
          "Error",
          err?.response?.data?.message || "Failed to load business"
        );
      });
  }, [businessId]);

  const handleSave = () => {
    if (!businessId) {
      Alert.alert("Error", "Business ID missing");
      return;
    }
    const payload = {
      full_name: businessName?.trim(),
      service_type: serviceType?.trim(),
      address: address?.trim(),
      phone_number: phone?.trim(),
      description: description?.trim(),
      // email intentionally excluded to keep it immutable from this screen
    };
    Object.keys(payload).forEach((k) => {
      if (!payload[k]) delete payload[k];
    });
    setSaving(true);
    axios
      .put(`${API_BASE}/api/business/${businessId}`, payload)
      .then((res) => {
        const updated = res.data?.business || res.data || {};
        updateProfile(updated);
        Alert.alert("Success", "Business details updated successfully");
      })
      .catch((err) => {
        console.error(
          "Update business error",
          err?.response?.data || err.message
        );
        Alert.alert(
          "Error",
          err?.response?.data?.message || "Failed to update business"
        );
      })
      .finally(() => setSaving(false));
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "Edit Business Details" }} />

      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: 160 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.form}>
          <Text style={styles.label}>{t.businessName}</Text>
          <TextInput
            style={styles.input}
            value={businessName}
            onChangeText={setBusinessName}
          />

          <Text style={styles.label}>{t.serviceType}</Text>
          <TextInput
            style={styles.input}
            value={serviceType}
            onChangeText={setServiceType}
          />

          <Text style={styles.label}>{t.address}</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={address}
            onChangeText={setAddress}
            multiline
          />

          <Text style={styles.label}>{t.description || "Description"}</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Describe your business..."
            multiline
          />

          <Text style={styles.label}>{t.phone}</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />

          <Text style={styles.label}>{t.email}</Text>
          <TextInput
            style={[
              styles.input,
              { backgroundColor: "#f3f4f6", color: "#555" },
            ]}
            value={email}
            editable={false}
            selectTextOnFocus={false}
            keyboardType="email-address"
          />

          {/* Button moved to fixed footer */}
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.button, saving && { opacity: 0.7 }]}
          onPress={handleSave}
          activeOpacity={0.85}
          disabled={saving}
        >
          <Text style={styles.buttonText}>
            {saving ? "Saving..." : "Save Changes"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.neutral.background },
  content: { flex: 1, padding: 16 },
  form: { gap: 16 },
  label: { fontWeight: "600", fontSize: 16, marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: Colors.neutral.lightGray,
    borderRadius: 8,
    padding: 12,
  },
  textArea: { height: 100 },
  button: {
    backgroundColor: Colors.primary.main,
    padding: 16,
    borderRadius: 10,
    width: "100%",
    borderWidth: 1,
    borderColor: Colors.primary.dark,
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: 0.5,
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    paddingBottom: 28,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: Colors.neutral.lightGray,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -3 },
    elevation: 16,
    zIndex: 50,
  },
});
