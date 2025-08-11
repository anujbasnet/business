import { Stack } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import Colors from '@/constants/colors';

export default function MarketingPromotionsScreen() {
  return (
    <View style={styles.container} testID="marketing-promotions-screen">
      <Stack.Screen options={{ title: 'Marketing & Promotions' }} />
      <View style={styles.card}>
        <Text style={styles.title}>Coming soon</Text>
        <Text style={styles.subtitle}>We are building powerful tools to create promo codes, campaigns and automated messages.</Text>
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
  },
  title: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.neutral.black,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: Colors.neutral.darkGray,
    textAlign: 'center',
    lineHeight: 20,
  },
});