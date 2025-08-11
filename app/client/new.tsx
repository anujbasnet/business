import { Stack, router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Plus } from 'lucide-react-native';

import Colors from '@/constants/colors';
import { useClientsStore } from '@/hooks/useClientsStore';
import { Client } from '@/types';

export default function NewClientScreen() {
  const { addClient } = useClientsStore();

  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const handleCreate = () => {
    if (name.trim().length === 0) {
      Alert.alert('Validation', 'Name is required');
      return;
    }
    const now = new Date().toISOString();
    const newClient: Client = {
      id: String(Date.now()),
      name,
      phone: phone ?? '',
      email: email ?? '',
      notes: notes ?? undefined,
      createdAt: now,
      lastVisit: undefined,
      upcomingAppointment: undefined,
      avatar: undefined,
      totalVisits: 0,
    };
    addClient(newClient);
    router.back();
  };

  return (
    <>
      <Stack.Screen options={{ title: 'New Client' }} />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Full name</Text>
          <TextInput testID="new-client-name" style={styles.input} placeholder="Enter full name" value={name} onChangeText={setName} />
        </View>
        <View style={styles.fieldRow}>
          <View style={styles.fieldHalf}>
            <Text style={styles.label}>Phone</Text>
            <TextInput testID="new-client-phone" style={styles.input} placeholder="+998 (__) ___-__-__" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />
          </View>
          <View style={styles.spacer} />
          <View style={styles.fieldHalf}>
            <Text style={styles.label}>Email</Text>
            <TextInput testID="new-client-email" style={styles.input} placeholder="name@email.com" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
          </View>
        </View>
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Notes</Text>
          <TextInput testID="new-client-notes" style={[styles.input, styles.multiline]} placeholder="Notes about client" multiline numberOfLines={4} value={notes} onChangeText={setNotes} />
        </View>

        <TouchableOpacity testID="create-client" style={styles.primaryButton} onPress={handleCreate}>
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
  fieldRow: { flexDirection: 'row', marginBottom: 16 },
  fieldHalf: { flex: 1 },
  spacer: { width: 12 },
  label: { fontSize: 14, color: Colors.neutral.darkGray, marginBottom: 8 },
  input: { backgroundColor: Colors.neutral.white, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 12, color: Colors.neutral.black },
  multiline: { height: 120, textAlignVertical: 'top' as const },
  primaryButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: Colors.primary.main, paddingVertical: 14, borderRadius: 10, marginTop: 8 },
  primaryButtonText: { color: Colors.neutral.white, fontWeight: '600' as const },
});