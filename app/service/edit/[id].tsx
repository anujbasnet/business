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
import AsyncStorage from '@react-native-async-storage/async-storage';

import Colors from "@/constants/colors";
import { Service } from "@/types";

export default function EditServiceScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const cleanId = id?.trim();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [businessId, setBusinessId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const API_BASE = "http://192.168.1.5:5000/api";

  // Load businessId
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem('businessId');
        if (!stored) {
          Alert.alert('Error', 'Business not identified');
          setLoading(false);
          return;
        }
        setBusinessId(stored);
      } catch (e) {
        console.log('Failed to load businessId', e);
        setLoading(false);
      }
    })();
  }, []);

  // Fetch service by ID from embedded list
  useEffect(() => {
    if (!cleanId || !businessId) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await axios.get(`${API_BASE}/business/${businessId}/services`);
        const list: Service[] = res.data || [];
        const data = list.find(s => String(s.id) === String(cleanId));
        if (!data) {
          Alert.alert('Error', 'Service not found');
        }
        if (!cancelled) {
          setService(data || null);
          if (data) {
            setName(data.name ?? "");
            setDescription(data.description ?? "");
            setDuration(String(data.duration ?? ""));
            setPrice(String(data.price ?? ""));
            setCategory(data.category ?? "");
          }
        }
      } catch (err:any) {
        console.error(err.response?.data || err.message);
        Alert.alert('Error', 'Failed to fetch service data');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [cleanId, businessId]);

  // Update service
  const handleSave = async () => {
    if (!service || !businessId) {
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
      await axios.put(`${API_BASE}/business/${businessId}/services/${service.id}`, {
        name,
        description,
        duration: durationNum,
        price: priceNum,
        category,
      });
      router.back();
    } catch (err:any) {
      console.error(err.response?.data || err.message);
      Alert.alert("Error", "Failed to update service");
    }
  };

  // Delete service
  const handleDelete = async () => {
    if (!service || !businessId) return;

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
              await axios.delete(`${API_BASE}/business/${businessId}/services/${service.id}`);
              router.back();
            } catch (err:any) {
              console.error(err.response?.data || err.message);
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

        <View style={styles.actionsRow}>
          <TouchableOpacity style={[styles.button, styles.deleteButton]} onPress={handleDelete}>
            <Trash size={18} color={Colors.neutral.white} />
            <Text style={styles.buttonText}>Delete</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={handleSave}>
            <Save size={18} color={Colors.neutral.white} />
            <Text style={styles.buttonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.neutral.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { padding: 16 },
  fieldGroup: { marginBottom: 16 },
  fieldRow: { flexDirection: 'row', marginBottom: 16 },
  fieldHalf: { flex: 1 },
  spacer: { width: 12 },
  label: { fontSize: 14, color: Colors.neutral.darkGray, marginBottom: 8 },
  input: { backgroundColor: Colors.neutral.white, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: Colors.neutral.black },
  multiline: { height: 100, textAlignVertical: 'top' },
  actionsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, gap: 12 },
  button: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', flex: 1, paddingVertical: 14, borderRadius: 8, gap: 6 },
  deleteButton: { backgroundColor: '#dc2626' },
  saveButton: { backgroundColor: Colors.primary.main },
  buttonText: { color: Colors.neutral.white, fontWeight: '600' },
});
