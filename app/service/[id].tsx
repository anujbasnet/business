import { Clock, DollarSign, Edit, Tag } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import axios from 'axios';

import Colors from '@/constants/colors';
import { Service } from '@/types';

export default function ServiceDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const fetchService = async () => {
        try {
          const res = await axios.get(`http://192.168.1.4:5000/api/services`);
          const services: Service[] = res.data;
          const foundService = services.find(s => String(s.id) === String(id));
          setService(foundService || null);
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchService();
    }
  }, [id]);

  const handleEditService = () => {
    if (service) {
      router.push(`/service/edit/${service.id}`);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={Colors.primary.main} />
      </View>
    );
  }

  if (!service) {
    return (
      <View style={styles.container}>
        <Text>Service not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <TouchableOpacity style={styles.editButton} onPress={handleEditService}>
          <Edit size={20} color={Colors.primary.main} />
        </TouchableOpacity>

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
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.neutral.background, padding: 16 },
  card: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: Colors.neutral.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    position: 'relative',
  },
  editButton: { position: 'absolute', top: 16, right: 16, padding: 8, borderRadius: 8, backgroundColor: Colors.neutral.background, zIndex: 10 },
  header: { marginBottom: 16 },
  name: { fontSize: 24, fontWeight: '700' as const, color: Colors.primary.main, marginBottom: 8 },
  categoryBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.primary.light, alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, gap: 4 },
  categoryText: { color: Colors.neutral.white, fontWeight: '500' as const },
  description: { fontSize: 16, color: Colors.neutral.darkGray, lineHeight: 24, marginBottom: 24 },
  detailsContainer: { flexDirection: 'row', gap: 16 },
  detailCard: { flex: 1, backgroundColor: Colors.neutral.background, borderRadius: 12, padding: 16, alignItems: 'center' },
  detailLabel: { fontSize: 14, color: Colors.neutral.darkGray, marginTop: 8, marginBottom: 4 },
  detailValue: { fontSize: 20, fontWeight: '700' as const, color: Colors.neutral.black },
});
