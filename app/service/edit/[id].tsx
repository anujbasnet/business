import { Stack, useLocalSearchParams, router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Save, X, Trash } from "lucide-react-native";

import Colors from "@/constants/colors";
import { useServicesStore } from "@/hooks/useServicesStore";

export default function EditServiceScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { services, updateService, deleteService } = useServicesStore();
  const existing = useMemo(
    () => services.find((s) => s.id === id),
    [services, id]
  );

  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [duration, setDuration] = useState<string>("");
  const [price, setPrice] = useState<string>("");
  const [category, setCategory] = useState<string>("");

  useEffect(() => {
    if (existing) {
      setName(existing.name ?? "");
      setDescription(existing.description ?? "");
      setDuration(String(existing.duration ?? ""));
      setPrice(String(existing.price ?? ""));
      setCategory(existing.category ?? "");
    }
  }, [existing]);

  const handleSave = () => {
    if (!id || !existing) {
      Alert.alert("Error", "Service not found");
      return;
    }
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
    updateService(id, {
      name,
      description,
      duration: durationNum,
      price: priceNum,
      category,
    });
    router.back();
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Service",
      "Are you sure you want to delete this service?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            if (id) {
              deleteService(id);
              router.back();
            }
          },
        },
      ]
    );
  };

  if (!existing) {
    return (
      <View style={styles.missingContainer}>
        <Text>Service not found</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: "Edit Service" }} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Service name"
          />
        </View>
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Category</Text>
          <TextInput
            style={styles.input}
            value={category}
            onChangeText={setCategory}
            placeholder="Category"
          />
        </View>
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.multiline]}
            value={description}
            onChangeText={setDescription}
            placeholder="Describe the service"
            multiline
            numberOfLines={4}
          />
        </View>
        <View style={styles.fieldRow}>
          <View style={styles.fieldHalf}>
            <Text style={styles.label}>Duration (min)</Text>
            <TextInput
              style={styles.input}
              value={duration}
              onChangeText={setDuration}
              keyboardType="numeric"
              placeholder="60"
            />
          </View>
          <View style={styles.spacer} />
          <View style={styles.fieldHalf}>
            <Text style={styles.label}>Price</Text>
            <TextInput
              style={styles.input}
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
              placeholder="50"
            />
          </View>
        </View>

        {/* Save button */}
        <TouchableOpacity style={styles.primaryButton} onPress={handleSave}>
          <Save size={18} color={Colors.neutral.white} />
          <Text style={styles.primaryButtonText}>Save</Text>
        </TouchableOpacity>

        {/* Cancel & Delete buttons on same line */}
        <View style={styles.horizontalButtons}>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.back()}
          >
            <X size={18} color={Colors.primary.main} />
            <Text style={styles.secondaryButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <Trash size={18} color={Colors.neutral.white} />
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
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
  multiline: { height: 120, textAlignVertical: "top" as const },
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
  primaryButtonText: {
    color: Colors.neutral.white,
    fontWeight: "600" as const,
  },
  horizontalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.neutral.white,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.primary.main,
  },
  secondaryButtonText: {
    color: Colors.primary.main,
    fontWeight: "600" as const,
  },
  deleteButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#FF4D4F",
    paddingVertical: 14,
    borderRadius: 10,
  },
  deleteButtonText: { 
    color: Colors.neutral.white, 
    fontWeight: "600" as const 
  },
  missingContainer: { 
    flex: 1, 
    alignItems: "center", 
    justifyContent: "center" 
  },
});
