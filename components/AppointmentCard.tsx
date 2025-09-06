import { Calendar, Clock, MessageSquare, User, Smartphone, Phone, MapPin, DollarSign } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import { Appointment } from '@/types';

interface AppointmentCardProps {
  appointment: Appointment;
  onPress: (appointment: Appointment) => void;
}

export default function AppointmentCard({ appointment, onPress }: AppointmentCardProps) {
  const { colors } = useTheme();

  const getStatusColor = (status: Appointment['status']) => {
    return colors.appointment[status];
  };

  const getBookingSourceIcon = (source: Appointment['bookingSource']) => {
    switch (source) {
      case 'bronapp':
        return <Smartphone size={14} color={colors.primary.main} />;
      case 'phone':
        return <Phone size={14} color={colors.secondary.main} />;
      case 'walk-in':
        return <MapPin size={14} color={colors.status.warning} />;
      default:
        return <Calendar size={14} color={colors.neutral.gray} />;
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
      style={[
        styles.container,
        {
          backgroundColor: colors.neutral.surface,
          borderColor: colors.neutral.border,
          shadowColor: colors.neutral.black,
        },
      ]}
      onPress={() => onPress(appointment)}
      activeOpacity={0.7}
      testID="appointment-card"
    >
      <View style={styles.header}>
        <View style={styles.timeContainer}>
          <Text style={[styles.time, { color: colors.neutral.darkGray }]}>
            {appointment.startTime} - {appointment.endTime}
          </Text>
          <View style={styles.badgeContainer}>
            <View style={[styles.sourceBadge, { backgroundColor: colors.neutral.lightGray }]}>
              {getBookingSourceIcon(appointment.bookingSource)}
              <Text style={[styles.sourceText, { color: colors.neutral.darkGray }]}>
                {getBookingSourceLabel(appointment.bookingSource)}
              </Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(appointment.status) }]}>
              <Text style={[styles.statusText, { color: colors.neutral.white }]}>{appointment.status}</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.infoRow}>
          <User size={16} color={colors.neutral.darkGray} />
          <Text style={[styles.infoText, { color: colors.neutral.darkGray }]}>{appointment.clientName}</Text>
        </View>

        <View style={styles.infoRow}>
          <Calendar size={16} color={colors.neutral.darkGray} />
          <Text style={[styles.infoText, { color: colors.neutral.darkGray }]}>{appointment.date}</Text>
        </View>

        <View style={styles.infoRow}>
          <Clock size={16} color={colors.neutral.darkGray} />
          <Text style={[styles.infoText, { color: colors.neutral.darkGray }]}>{appointment.serviceName}</Text>
        </View>

        <View style={styles.infoRow}>
          <DollarSign size={16} color={colors.status.success} />
          <Text style={[styles.infoText, { color: colors.status.success, fontWeight: '600' as const }]}>
            ${appointment.servicePrice}
          </Text>
        </View>

        {appointment.notes ? (
          <View style={styles.infoRow}>
            <MessageSquare size={16} color={colors.neutral.darkGray} />
            <Text style={[styles.infoText, { color: colors.neutral.darkGray }]} numberOfLines={1} ellipsizeMode="tail">
              {appointment.notes}
            </Text>
          </View>
        ) : null}
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
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    gap: 4,
  },
  sourceText: {
    fontSize: 11,
    fontWeight: '500' as const,
  },
  time: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusText: {
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
    flex: 1,
  },
});