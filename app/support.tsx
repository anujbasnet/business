import { Stack } from 'expo-router';
import React from 'react';
import { Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import Colors from '@/constants/colors';

export default function SupportScreen() {
  return (
    <View style={styles.container} testID="support-screen">
      <Stack.Screen options={{ title: 'Support' }} />
      <View style={styles.card}>
        <Text style={styles.title}>How can we help?</Text>
        <Text style={styles.subtitle}>Contact us and we will get back to you shortly.</Text>
        <TouchableOpacity style={styles.primaryButton} onPress={() => Linking.openURL('mailto:support@rejaly.uz')}>
          <Text style={styles.primaryButtonText}>Email support@rejaly.uz</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryButton} onPress={() => Linking.openURL('https://t.me/rejaly_support')}>
          <Text style={styles.secondaryButtonText}>Open Telegram Chat</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral.background,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 500,
    backgroundColor: Colors.neutral.white,
    borderRadius: 12,
    padding: 24,
    gap: 12,
  },
  title: { fontSize: 20, fontWeight: '700' as const, color: Colors.neutral.black, textAlign: 'center' },
  subtitle: { fontSize: 14, color: Colors.neutral.darkGray, textAlign: 'center' },
  primaryButton: { backgroundColor: Colors.primary.main, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  primaryButtonText: { color: Colors.neutral.white, fontSize: 16, fontWeight: '600' as const },
  secondaryButton: { backgroundColor: Colors.neutral.background, paddingVertical: 12, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: Colors.primary.main },
  secondaryButtonText: { color: Colors.primary.main, fontSize: 16, fontWeight: '600' as const },
});