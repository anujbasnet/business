import { Stack, useLocalSearchParams, router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { Save, X, Trash } from "lucide-react-native";
import axios from "axios";

import Colors from "@/constants/colors";
import { Service } from "@/types";

export default function EditServiceScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const cleanId = id?.trim();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const BASE_URL = "http://192.168.1.4:5000/api/services";

  // Fetch service by ID
  useEffect(() => {
    if (cleanId) {
      const fetchService = async () => {
        try {
          const res = await axios.get(`${BASE_URL}/${cleanId}`);
          const data: Service = res.data;
          setService(data);
          setName(data.name ?? "");
          setDescription(data.description ?? "");
          setDuration(String(data.duration ?? ""));
          setPrice(String(data.price ?? ""));
          setCategory(data.category ?? "");
        } catch (err) {
          console.error(err);
          Alert.alert("Error", "Failed to fetch service data");
        } finally {
          setLoading(false);
        }
      };
      fetchService();
    }
  }, [cleanId]);

  // Update service
  const handleSave = async () => {
    if (!service) {
      Alert.alert("Error", "Service not found");
      return;
    }

    if (!name.trim()) {
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
      await axios.put(`${BASE_URL}/${service.id}`, {
        name,
        description,
        duration: durationNum,
        price: priceNum,
        category,
      });
      router.back();
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to update service");
    }
  };

  // Delete service
  const handleDelete = async () => {
    if (!service) return;

    Alert.alert(
      "Delete Service",
      "Are you sure you want to delete this service?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await axios.delete(`${BASE_URL}/${service.id}`);
              router.back();
            } catch (err) {
              console.error(err);
              Alert.alert("Error", "Failed to delete service");
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary.main} />
      </View>
    );
  }

  if (!service) {
    return (
      <View style={styles.center}>
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
        keyboardShouldPersistTaps="handled"
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

        <TouchableOpacity style={styles.primaryButton} onPress={handleSave}>
          <Save size={18} color={Colors.neutral.white} />
          <Text style={styles.primaryButtonText}>Save</Text>
        </TouchableOpacity>

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
  deleteButtonText: { color: Colors.neutral.white, fontWeight: "600" as const },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
});
