import { Stack, useLocalSearchParams, router } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Save, X } from 'lucide-react-native';

import Colors from '@/constants/colors';
import { usePortfolioStore } from '@/hooks/usePortfolioStore';

export default function EditPortfolioItemScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { portfolioItems, updatePortfolioItem } = usePortfolioStore();
  const existing = useMemo(() => portfolioItems.find(p => p.id === id), [portfolioItems, id]);

  const [imageUrl, setImageUrl] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [serviceCategory, setServiceCategory] = useState<string>('');
  const [date, setDate] = useState<string>('');

  useEffect(() => {
    if (existing) {
      setImageUrl(existing.imageUrl ?? '');
      setDescription(existing.description ?? '');
      setServiceCategory(existing.serviceCategory ?? '');
      setDate(existing.date ?? '');
    }
  }, [existing]);

  const handleSave = () => {
    if (!id || !existing) {
      Alert.alert('Error', 'Portfolio item not found');
      return;
    }
    if (!imageUrl) {
      Alert.alert('Validation', 'Image URL is required');
      return;
    }
    updatePortfolioItem(id, { imageUrl, description, serviceCategory, date });
    router.back();
  };

  if (!existing) {
    return (
      <View style={styles.missingContainer}>
        <Text>Portfolio item not found</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Edit Portfolio' }} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Image URL</Text>
          <TextInput testID="edit-portfolio-image" style={styles.input} value={imageUrl} onChangeText={setImageUrl} placeholder="https://..." autoCapitalize="none" />
        </View>
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Service Category</Text>
          <TextInput testID="edit-portfolio-category" style={styles.input} value={serviceCategory} onChangeText={setServiceCategory} placeholder="Category" />
        </View>
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Date</Text>
          <TextInput testID="edit-portfolio-date" style={styles.input} value={date} onChangeText={setDate} placeholder="2025-08-11" />
        </View>
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput testID="edit-portfolio-description" style={[styles.input, styles.multiline]} value={description} onChangeText={setDescription} placeholder="Describe this work" multiline numberOfLines={4} />
        </View>

        <TouchableOpacity testID="save-portfolio" style={styles.primaryButton} onPress={handleSave}>
          <Save size={18} color={Colors.neutral.white} />
          <Text style={styles.primaryButtonText}>Save</Text>
        </TouchableOpacity>
        <TouchableOpacity testID="cancel-portfolio" style={styles.secondaryButton} onPress={() => router.back()}>
          <X size={18} color={Colors.primary.main} />
          <Text style={styles.secondaryButtonText}>Cancel</Text>
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
  secondaryButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.neutral.white, paddingVertical: 14, borderRadius: 10, marginTop: 8, borderWidth: 1, borderColor: Colors.primary.main },
  secondaryButtonText: { color: Colors.primary.main, fontWeight: '600' as const },
  missingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});