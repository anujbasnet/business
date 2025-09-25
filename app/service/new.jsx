import { Stack, router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Plus } from "lucide-react-native";

import Colors from "@/constants/colors";
import { useServicesStore } from "@/hooks/useServicesStore";
import axios from "axios";

export default function NewServiceScreen() {
  const { addService } = useServicesStore();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");

  const handleCreate = async () => {
    if (name.trim().length === 0) {
      Alert.alert("Validation", "Name is required");
      return;
    }

    const durationNum = Number(duration);
    const priceNum = Number(price);

    if (Number.isNaN(durationNum) || durationNum <= 0) {
      Alert.alert("Validation", "Duration must be a positive number");
      return;
    }
    if (Number.isNaN(priceNum) || priceNum < 0) {
      Alert.alert("Validation", "Price must be a number");
      return;
    }

    try {
      const newService = {
        name,
        category,
        duration: durationNum,
        price: priceNum,
        description,
      };

      const res = await axios.post(
        "http://192.168.1.4:5000/api/services",
        newService
      );
      Alert.alert("Success", "Service created successfully");

      // navigate back or refresh list
      router.back();
    } catch (err) {
      console.error("Add Error:", err);
      Alert.alert(
        "Error",
        err.response?.data?.message || "Failed to add service"
      );
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: "New Service" }} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            testID="new-service-name"
            style={styles.input}
            placeholder="Service name"
            value={name}
            onChangeText={setName}
          />
        </View>
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Category</Text>
          <TextInput
            testID="new-service-category"
            style={styles.input}
            placeholder="Category"
            value={category}
            onChangeText={setCategory}
          />
        </View>
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            testID="new-service-description"
            style={[styles.input, styles.multiline]}
            placeholder="Describe the service"
            multiline
            numberOfLines={4}
            value={description}
            onChangeText={setDescription}
          />
        </View>
        <View style={styles.fieldRow}>
          <View style={styles.fieldHalf}>
            <Text style={styles.label}>Duration (min)</Text>
            <TextInput
              testID="new-service-duration"
              style={styles.input}
              placeholder="60"
              keyboardType="numeric"
              value={duration}
              onChangeText={setDuration}
            />
          </View>
          <View style={styles.spacer} />
          <View style={styles.fieldHalf}>
            <Text style={styles.label}>Price</Text>
            <TextInput
              testID="new-service-price"
              style={styles.input}
              placeholder="50"
              keyboardType="numeric"
              value={price}
              onChangeText={setPrice}
            />
          </View>
        </View>

        <TouchableOpacity
          testID="create-service"
          style={styles.primaryButton}
          onPress={handleCreate}
        >
          <Plus size={18} color={Colors.neutral.white} />
          <Text style={styles.primaryButtonText}>Create</Text>
        </TouchableOpacity>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.neutral.background },
  content: { padding: 16 },
  fieldGroup: { marginBottom: 16 },
  fieldRow: { flexDirection: "row", marginBottom: 16 },
  fieldHalf: { flex: 1 },
  spacer: { width: 12 },
  label: { fontSize: 14, color: Colors.neutral.darkGray, marginBottom: 8 },
  input: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: Colors.neutral.black,
  },
  multiline: { height: 120, textAlignVertical: "top" },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.primary.main,
    paddingVertical: 14,
    borderRadius: 10,
    marginTop: 8,
  },
  primaryButtonText: { color: Colors.neutral.white, fontWeight: "600" },
});
