import { Calendar, Clock, MessageSquare, User } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import Colors from '@/constants/colors';
import { Appointment } from '@/types';

interface AppointmentCardProps {
  appointment: Appointment;
  onPress: (appointment: Appointment) => void;
}

export default function AppointmentCard({ appointment, onPress }: AppointmentCardProps) {
  const getStatusColor = (status: Appointment['status']) => {
    return Colors.appointment[status];
  };

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={() => onPress(appointment)}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.timeContainer}>
          <Text style={styles.time}>{appointment.startTime} - {appointment.endTime}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(appointment.status) }]}>
            <Text style={styles.statusText}>{appointment.status}</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.content}>
        <View style={styles.infoRow}>
          <User size={16} color={Colors.neutral.darkGray} />
          <Text style={styles.infoText}>{appointment.clientName}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Calendar size={16} color={Colors.neutral.darkGray} />
          <Text style={styles.infoText}>{appointment.date}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Clock size={16} color={Colors.neutral.darkGray} />
          <Text style={styles.infoText}>{appointment.serviceName}</Text>
        </View>
        
        {appointment.notes && (
          <View style={styles.infoRow}>
            <MessageSquare size={16} color={Colors.neutral.darkGray} />
            <Text style={styles.infoText} numberOfLines={1} ellipsizeMode="tail">
              {appointment.notes}
            </Text>
          </View>
        )}
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
    marginBottom: 12,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  time: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.primary.main,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusText: {
    color: Colors.neutral.white,
    fontSize: 12,
    fontWeight: '500' as const,
    textTransform: 'capitalize' as const,
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
    color: Colors.neutral.darkGray,
    flex: 1,
  },
});