import { Clock, DollarSign, Edit } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import Colors from '@/constants/colors';
import { Service } from '@/types';

interface ServiceCardProps {
  service: Service;
  onPress: (service: Service) => void;
}

export default function ServiceCard({ service, onPress }: ServiceCardProps) {
  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={() => onPress(service)}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <Text style={styles.name}>{service.name}</Text>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{service.category}</Text>
        </View>
      </View>
      
      <Text style={styles.description} numberOfLines={2} ellipsizeMode="tail">
        {service.description}
      </Text>
      
      <View style={styles.footer}>
        <View style={styles.infoRow}>
          <Clock size={16} color={Colors.neutral.darkGray} />
          <Text style={styles.infoText}>{service.duration} min</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoText}>{service.price} UZS</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => onPress(service)}
        >
          <Edit size={16} color={Colors.primary.main} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: Colors.neutral.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
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
    color: Colors.primary.main,
    flex: 1,
  },
  categoryBadge: {
    backgroundColor: Colors.primary.light,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  categoryText: {
    color: Colors.neutral.white,
    fontSize: 12,
    fontWeight: '500' as const,
  },
  description: {
    fontSize: 14,
    color: Colors.neutral.darkGray,
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
    color: Colors.neutral.darkGray,
  },
  editButton: {
    marginLeft: 'auto',
    padding: 4,
  },
});