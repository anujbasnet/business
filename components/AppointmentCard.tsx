import { Calendar, Clock, MessageSquare, User, Smartphone, Phone, MapPin, DollarSign } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

import Colors from '@/constants/colors';
import { Appointment } from '@/types';

interface AppointmentCardProps {
  appointment: Appointment;
  onPress?: (appointment: Appointment) => void;
  onAccept?: (appointment: Appointment) => void;
  onDecline?: (appointment: Appointment) => void;
}

export default function AppointmentCard({ appointment, onPress }: AppointmentCardProps) {
  // Format time to show only start time with AM/PM, avoid duplicate AM/PM
  const formatTime = (timeStr: string | undefined) => {
    if (!timeStr) return '';
    let clean = timeStr.replace(/\s*(AM|PM)$/i, '');
    let [h, m] = clean.split(':');
    h = h ? h.trim() : '00';
    m = m ? m.trim() : '00';
    let hourNum = parseInt(h, 10);
    const ampm = hourNum >= 12 ? 'PM' : 'AM';
    const hour12 = hourNum % 12 === 0 ? 12 : hourNum % 12;
    return `${hour12}:${m} ${ampm}`;
  };
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

  const [actionLoading, setActionLoading] = React.useState(false);
  const handleAccept = async () => {
    if (actionLoading) return;
    setActionLoading(true);
    try {
      const token = await AsyncStorage.getItem('BusinessToken') || await AsyncStorage.getItem('token') || await AsyncStorage.getItem('accessToken') || await AsyncStorage.getItem('access_token') || await AsyncStorage.getItem('jwt');
      const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
      await axios.patch(`http://192.168.1.4:5000/api/appointments/${appointment.id}/status`, { status: 'booked' }, { headers });
      if (typeof arguments[0].onAccept === 'function') arguments[0].onAccept({ ...appointment, status: 'booked' });
    } catch (e) {
      if (typeof e === 'object' && e !== null && 'response' in e) {
        // @ts-ignore
        console.log('Accept failed:', e.response?.data || e.message);
      } else {
        console.log('Accept failed:', e);
      }
    }
  };
  const handleDecline = async () => {
    if (actionLoading) return;
    setActionLoading(true);
    try {
      const token = await AsyncStorage.getItem('BusinessToken') || await AsyncStorage.getItem('token') || await AsyncStorage.getItem('accessToken') || await AsyncStorage.getItem('access_token') || await AsyncStorage.getItem('jwt');
      const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
      await axios.patch(`http://192.168.1.4:5000/api/appointments/${appointment.id}/status`, { status: 'canceled' }, { headers });
      if (typeof arguments[0].onDecline === 'function') arguments[0].onDecline({ ...appointment, status: 'canceled' });
    } catch (e) {
      if (typeof e === 'object' && e !== null && 'response' in e) {
        // @ts-ignore
        console.log('Decline failed:', e.response?.data || e.message);
      } else {
        console.log('Decline failed:', e);
      }
    }
  };
  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={onPress ? () => onPress(appointment) : undefined}
        activeOpacity={onPress ? 0.7 : 1}
      >
        <View style={styles.header}>
          <View style={styles.timeContainer}>
            <Text style={styles.time}>{formatTime(appointment.startTime)}</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(appointment.status) }]}> 
              <Text style={styles.statusText}>{appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}</Text>
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

          {appointment.staffName && (
            <View style={styles.infoRow}>
              <User size={16} color={Colors.primary.main} />
              <Text style={styles.infoText}>{`Staff: ${appointment.staffName}`}</Text>
            </View>
          )}

          <View style={styles.infoRow}>
            <Text style={[styles.infoText, { color: Colors.status.success, fontWeight: '600' as const }]}>{appointment.servicePrice} UZS</Text>
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
      {appointment.status === 'pending' && (
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8, gap: 8 }}>
          <TouchableOpacity
            style={{ backgroundColor: Colors.primary.main, paddingVertical: 6, paddingHorizontal: 16, borderRadius: 6, opacity: actionLoading ? 0.6 : 1 }}
            onPress={handleAccept}
            disabled={actionLoading}
          >
            <Text style={{ color: Colors.neutral.white, fontWeight: '600' }}>Accept</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ backgroundColor: Colors.status.error, paddingVertical: 6, paddingHorizontal: 16, borderRadius: 6, opacity: actionLoading ? 0.6 : 1 }}
            onPress={handleDecline}
            disabled={actionLoading}
          >
            <Text style={{ color: Colors.neutral.white, fontWeight: '600' }}>Decline</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
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