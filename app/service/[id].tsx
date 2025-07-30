import { Clock, DollarSign, Edit, Tag, Trash } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';

import Colors from '@/constants/colors';
import { useServicesStore } from '@/hooks/useServicesStore';
import { Service } from '@/types';

export default function ServiceDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { services, deleteService } = useServicesStore();
  const [service, setService] = useState<Service | null>(null);

  useEffect(() => {
    if (id) {
      const foundService = services.find((s) => s.id === id);
      if (foundService) {
        setService(foundService);
      }
    }
  }, [id, services]);

  const handleDeleteService = () => {
    Alert.alert(
      'Delete Service',
      'Are you sure you want to delete this service?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            if (service) {
              deleteService(service.id);
              router.back();
            }
          },
        },
      ]
    );
  };

  const handleEditService = () => {
    if (service) {
      router.push(`/service/edit/${service.id}`);
    }
  };

  if (!service) {
    return (
      <View style={styles.container}>
        <Text>Service not found</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen 
        options={{
          title: service.name,
          headerRight: () => (
            <View style={styles.headerButtons}>
              <TouchableOpacity onPress={handleEditService} style={styles.headerButton}>
                <Edit size={20} color={Colors.neutral.white} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDeleteService} style={styles.headerButton}>
                <Trash size={20} color={Colors.neutral.white} />
              </TouchableOpacity>
            </View>
          ),
        }}
      />
      <View style={styles.container}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.name}>{service.name}</Text>
            <View style={styles.categoryBadge}>
              <Tag size={16} color={Colors.neutral.white} />
              <Text style={styles.categoryText}>{service.category}</Text>
            </View>
          </View>

          <Text style={styles.description}>{service.description}</Text>

          <View style={styles.detailsContainer}>
            <View style={styles.detailCard}>
              <Clock size={24} color={Colors.primary.main} />
              <Text style={styles.detailLabel}>Duration</Text>
              <Text style={styles.detailValue}>{service.duration} min</Text>
            </View>
            
            <View style={styles.detailCard}>
              <DollarSign size={24} color={Colors.secondary.main} />
              <Text style={styles.detailLabel}>Price</Text>
              <Text style={styles.detailValue}>${service.price}</Text>
            </View>
          </View>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral.background,
    padding: 16,
  },
  headerButtons: {
    flexDirection: 'row',
  },
  headerButton: {
    marginLeft: 16,
  },
  card: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: Colors.neutral.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.primary.main,
    marginBottom: 8,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary.light,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  categoryText: {
    color: Colors.neutral.white,
    fontWeight: '500' as const,
  },
  description: {
    fontSize: 16,
    color: Colors.neutral.darkGray,
    lineHeight: 24,
    marginBottom: 24,
  },
  detailsContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  detailCard: {
    flex: 1,
    backgroundColor: Colors.neutral.background,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: Colors.neutral.darkGray,
    marginTop: 8,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.neutral.black,
  },
});