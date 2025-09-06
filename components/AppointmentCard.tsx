import { Calendar, Clock, MessageSquare, User, Smartphone, Phone, MapPin, DollarSign } from 'lucide-react-native';
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

  const getBookingSourceIcon = (source: Appointment['bookingSource']) => {
    switch (source) {
      case 'bronapp':
        return <Smartphone size={14} color={Colors.primary.main} />;
      case 'phone':
        return <Phone size={14} color={Colors.secondary.main} />;
      case 'walk-in':
        return <MapPin size={14} color={Colors.status.warning} />;
      default:
        return <Calendar size={14} color={Colors.neutral.gray} />;
    }
  };

  const getBookingSourceLabel = (source: Appointment['bookingSource']) => {
    switch (source) {
      case 'bronapp':
        return 'BronApp';
      case 'phone':
        return 'Phone';
      case 'walk-in':
        return 'Walk-in';
      default:
        return 'Direct';
    }
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
          <View style={styles.badgeContainer}>
            <View style={styles.sourceBadge}>
              {getBookingSourceIcon(appointment.bookingSource)}
              <Text style={styles.sourceText}>{getBookingSourceLabel(appointment.bookingSource)}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(appointment.status) }]}>
              <Text style={styles.statusText}>{appointment.status}</Text>
            </View>
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
        
        <View style={styles.infoRow}>
          <DollarSign size={16} color={Colors.status.success} />
          <Text style={[styles.infoText, { color: Colors.status.success, fontWeight: '600' as const }]}>
            ${appointment.servicePrice}
          </Text>
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
    justifyContent: 'space-between',
    width: '100%',
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sourceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.neutral.lightGray,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    gap: 4,
  },
  sourceText: {
    color: Colors.neutral.darkGray,
    fontSize: 11,
    fontWeight: '500' as const,
  },
  time: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.primary.main,
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