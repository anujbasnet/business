import { Stack, router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Plus } from 'lucide-react-native';

import Colors from '@/constants/colors';
import { usePortfolioStore } from '@/hooks/usePortfolioStore';
import { PortfolioItem } from '@/types';

export default function NewPortfolioItemScreen() {
  const { addPortfolioItem } = usePortfolioStore();

  const [imageUrl, setImageUrl] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [serviceCategory, setServiceCategory] = useState<string>('');
  const [date, setDate] = useState<string>('');

  const handleCreate = () => {
    if (!imageUrl) {
      Alert.alert('Validation', 'Image URL is required');
      return;
    }

    const newItem: PortfolioItem = {
      id: String(Date.now()),
      imageUrl,
      description: description ?? '',
      serviceCategory: serviceCategory || 'General',
      date: date || new Date().toISOString().slice(0, 10),
    };
    addPortfolioItem(newItem);
    router.back();
  };

  return (
    <>
      <Stack.Screen options={{ title: 'New Portfolio' }} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Image URL</Text>
          <TextInput testID="new-portfolio-image" style={styles.input} placeholder="https://..." autoCapitalize="none" value={imageUrl} onChangeText={setImageUrl} />
        </View>
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Service Category</Text>
          <TextInput testID="new-portfolio-category" style={styles.input} placeholder="Category" value={serviceCategory} onChangeText={setServiceCategory} />
        </View>
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Date</Text>
          <TextInput testID="new-portfolio-date" style={styles.input} placeholder="2025-08-11" value={date} onChangeText={setDate} />
        </View>
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput testID="new-portfolio-description" style={[styles.input, styles.multiline]} placeholder="Describe this work" multiline numberOfLines={4} value={description} onChangeText={setDescription} />
        </View>

        <TouchableOpacity testID="create-portfolio" style={styles.primaryButton} onPress={handleCreate}>
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
  label: { fontSize: 14, color: Colors.neutral.darkGray, marginBottom: 8 },
  input: { backgroundColor: Colors.neutral.white, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 12, color: Colors.neutral.black },
  multiline: { height: 120, textAlignVertical: 'top' as const },
  primaryButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.primary.main, paddingVertical: 14, borderRadius: 10, marginTop: 8 },
  primaryButtonText: { color: Colors.neutral.white, fontWeight: '600' as const },
});