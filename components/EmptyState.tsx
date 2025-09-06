import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LucideIcon } from 'lucide-react-native';

import { useTheme } from '@/hooks/useTheme';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  message: string;
}

export default function EmptyState({ icon: Icon, title, message }: EmptyStateProps) {
  const { colors } = useTheme();
  
  return (
    <View style={styles.container}>
      <Icon size={64} color={colors.neutral.lightGray} />
      <Text style={[styles.title, { color: colors.neutral.darkGray }]}>{title}</Text>
      <Text style={[styles.message, { color: colors.neutral.gray }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '600' as const,
    marginTop: 16,
    marginBottom: 8,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
  },
});