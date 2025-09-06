import { Calendar, Mail, MessageSquare, Phone } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import { Client } from '@/types';

interface ClientCardProps {
  client: Client;
  onPress: (client: Client) => void;
}

export default function ClientCard({ client, onPress }: ClientCardProps) { const { colors } = useTheme();
  return (
    <TouchableOpacity 
      style={[styles.container, { backgroundColor: colors.neutral.background, borderColor: colors.neutral.lightGray, shadowColor: colors.neutral.black }]}
      onPress={() => onPress(client)}
      activeOpacity={0.7}
      testID="client-card"
    >
      <View style={styles.header}>
        <Text style={styles.name}>{client.name}</Text>
        {client.upcomingAppointment && (
          <View style={styles.upcomingBadge}>
            <Text style={styles.upcomingText}>Upcoming</Text>
          </View>
        )}
      </View>
      
      <View style={styles.content}>
        <View style={styles.infoRow}>
          <Phone size={16} color={colors.neutral.darkGray} />
          <Text style={[styles.infoText, { color: colors.neutral.darkGray }]}>{client.phone}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Mail size={16} color={colors.neutral.darkGray} />
          <Text style={[styles.infoText, { color: colors.neutral.darkGray }]}>{client.email}</Text>
        </View>
        
        {client.lastVisit && (
          <View style={styles.infoRow}>
            <Calendar size={16} color={colors.neutral.darkGray} />
            <Text style={[styles.infoText, { color: colors.neutral.darkGray }]}>Last visit: {client.lastVisit}</Text>
          </View>
        )}
        
        {client.notes && (
          <View style={styles.infoRow}>
            <MessageSquare size={16} color={colors.neutral.darkGray} />
            <Text style={[styles.infoText, { color: colors.neutral.darkGray }]} numberOfLines={1} ellipsizeMode="tail">
              {client.notes}
            </Text>
          </View>
        )}
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
    marginBottom: 12,
  },
  name: {
    fontSize: 18,
    fontWeight: '600' as const,
  },
  upcomingBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  upcomingText: {
    fontSize: 12,
    fontWeight: '500' as const,
  },
  content: {
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    flex: 1,
  },
});