import { Clock, DollarSign, Edit } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import { Service } from '@/types';

interface ServiceCardProps {
  service: Service;
  onPress: (service: Service) => void;
}

export default function ServiceCard({ service, onPress }: ServiceCardProps) {
  const { colors } = useTheme();
  
  return (
    <TouchableOpacity 
      style={[styles.container, { backgroundColor: colors.neutral.surface, borderColor: colors.neutral.border, shadowColor: colors.neutral.black }]}
      onPress={() => onPress(service)}
      activeOpacity={0.7}
      testID="service-card"
    >
      <View style={styles.header}>
        <Text style={[styles.name, { color: colors.neutral.darkGray }]}>{service.name}</Text>
        <View style={[styles.categoryBadge, { backgroundColor: colors.primary.main }]}>
          <Text style={[styles.categoryText, { color: colors.neutral.white }]}>{service.category}</Text>
        </View>
      </View>
      
      <Text style={[styles.description, { color: colors.neutral.gray }]} numberOfLines={2} ellipsizeMode="tail">
        {service.description}
      </Text>
      
      <View style={styles.footer}>
        <View style={styles.infoRow}>
          <Clock size={16} color={colors.neutral.darkGray} />
          <Text style={[styles.infoText, { color: colors.neutral.darkGray }]}>{service.duration} min</Text>
        </View>
        
        <View style={styles.infoRow}>
          <DollarSign size={16} color={colors.neutral.darkGray} />
          <Text style={[styles.infoText, { color: colors.neutral.darkGray }]}>${service.price}</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => onPress(service)}
        >
          <Edit size={16} color={colors.primary.main} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    fontSize: 18,
    fontWeight: '600' as const,
    flex: 1,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500' as const,
  },
  description: {
    fontSize: 14,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginRight: 16,
  },
  infoText: {
    fontSize: 14,
  },
  editButton: {
    marginLeft: 'auto',
    padding: 4,
  },
});