import { Stack } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import Colors from '@/constants/colors';

export default function AboutScreen() {
  return (
    <View style={styles.container} testID="about-screen">
      <Stack.Screen options={{ title: 'About' }} />
      <View style={styles.card}>
        <Text style={styles.title}>Rejaly.uz</Text>
        <Text style={styles.subtitle}>Appointment scheduling app for salons and services. Version 0.1.0</Text>
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
  card: { width: '100%', maxWidth: 500, backgroundColor: Colors.neutral.white, borderRadius: 12, padding: 24 },
  title: { fontSize: 20, fontWeight: '700' as const, color: Colors.neutral.black, textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 14, color: Colors.neutral.darkGray, textAlign: 'center' },
});