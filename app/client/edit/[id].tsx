import { Stack, useLocalSearchParams, router } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Save, X } from 'lucide-react-native';

import Colors from '@/constants/colors';
import { useClientsStore } from '@/hooks/useClientsStore';

export default function EditClientScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { clients, updateClient } = useClientsStore();

  const existing = useMemo(() => clients.find(c => c.id === id), [clients, id]);

  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    if (existing) {
      setName(existing.name ?? '');
      setEmail(existing.email ?? '');
      setPhone(existing.phone ?? '');
      setNotes(existing.notes ?? '');
    }
  }, [existing]);

  const handleSave = () => {
    if (!id || !existing) {
      Alert.alert('Error', 'Client not found');
      return;
    }
    if (name.trim().length === 0) {
      Alert.alert('Validation', 'Name is required');
      return;
    }
    updateClient(id, { name, email, phone, notes });
    router.back();
  };

  if (!existing) {
    return (
      <View style={styles.missingContainer}>
        <Text>Client not found</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Edit Client' }} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Full name</Text>
          <TextInput
            testID="edit-client-name"
            style={styles.input}
            placeholder="Enter full name"
            value={name}
            onChangeText={setName}
          />
        </View>

        <View style={styles.fieldRow}>
          <View style={styles.fieldHalf}>
            <Text style={styles.label}>Phone</Text>
            <TextInput
              testID="edit-client-phone"
              style={styles.input}
              placeholder="+998 (__) ___-__-__"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />
          </View>
          <View style={styles.spacer} />
          <View style={styles.fieldHalf}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              testID="edit-client-email"
              style={styles.input}
              placeholder="name@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Notes</Text>
          <TextInput
            testID="edit-client-notes"
            style={[styles.input, styles.multiline]}
            placeholder="Notes about client"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
          />
        </View>

        <TouchableOpacity testID="save-client" style={styles.primaryButton} onPress={handleSave}>
          <Save size={18} color={Colors.neutral.white} />
          <Text style={styles.primaryButtonText}>Save</Text>
        </TouchableOpacity>

        <TouchableOpacity testID="cancel-client" style={styles.secondaryButton} onPress={() => router.back()}>
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
  fieldRow: { flexDirection: 'row', marginBottom: 16 },
  fieldHalf: { flex: 1 },
  spacer: { width: 12 },
  label: { fontSize: 14, color: Colors.neutral.darkGray, marginBottom: 8 },
  input: { backgroundColor: Colors.neutral.white, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 12, color: Colors.neutral.black },
  multiline: { height: 120, textAlignVertical: 'top' as const },
  primaryButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.primary.main, paddingVertical: 14, borderRadius: 10, marginTop: 8 },
  primaryButtonText: { color: Colors.neutral.white, fontWeight: '600' as const },
  secondaryButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.neutral.white, paddingVertical: 14, borderRadius: 10, marginTop: 8, borderWidth: 1, borderColor: Colors.primary.main },
  secondaryButtonText: { color: Colors.primary.main, fontWeight: '600' as const },
  missingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});