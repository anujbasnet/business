import { Bell, Calendar, Clock, X } from 'lucide-react-native';
import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import Colors from '@/constants/colors';

interface Notification {
  id: string;
  type: 'new_appointment' | 'appointment_changed' | 'appointment_cancelled';
  title: string;
  message: string;
  clientName: string;
  appointmentId?: string;
  timestamp: string;
  isRead: boolean;
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'new_appointment',
    title: 'New Appointment Booked',
    message: 'John Smith booked a Haircut & Styling for tomorrow at 10:00 AM',
    clientName: 'John Smith',
    appointmentId: '1',
    timestamp: '2 hours ago',
    isRead: false,
  },
  {
    id: '2',
    type: 'appointment_changed',
    title: 'Appointment Rescheduled',
    message: 'Michael Johnson moved his appointment from 2:00 PM to 3:00 PM today',
    clientName: 'Michael Johnson',
    appointmentId: '2',
    timestamp: '4 hours ago',
    isRead: false,
  },
  {
    id: '3',
    type: 'appointment_cancelled',
    title: 'Appointment Cancelled',
    message: 'David Williams cancelled his Full Service appointment for today',
    clientName: 'David Williams',
    appointmentId: '3',
    timestamp: '1 day ago',
    isRead: true,
  },
  {
    id: '4',
    type: 'new_appointment',
    title: 'New Appointment Booked',
    message: 'Sarah Johnson booked a Hair Coloring for next week',
    clientName: 'Sarah Johnson',
    appointmentId: '4',
    timestamp: '2 days ago',
    isRead: true,
  },
];

export default function NotificationsScreen() {
  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'new_appointment':
        return <Calendar color={Colors.status.success} size={20} />;
      case 'appointment_changed':
        return <Clock color={Colors.status.warning} size={20} />;
      case 'appointment_cancelled':
        return <X color={Colors.status.error} size={20} />;
      default:
        return <Bell color={Colors.neutral.gray} size={20} />;
    }
  };

  const handleNotificationPress = (notification: Notification) => {
    if (notification.appointmentId) {
      router.push(`/appointment/${notification.appointmentId}`);
    }
  };

  const renderNotification = ({ item }: { item: Notification }) => (
    <TouchableOpacity
      style={[styles.notificationItem, !item.isRead && styles.unreadNotification]}
      onPress={() => handleNotificationPress(item)}
    >
      <View style={styles.notificationIcon}>
        {getNotificationIcon(item.type)}
      </View>
      <View style={styles.notificationContent}>
        <Text style={styles.notificationTitle}>{item.title}</Text>
        <Text style={styles.notificationMessage}>{item.message}</Text>
        <Text style={styles.notificationTime}>{item.timestamp}</Text>
      </View>
      {!item.isRead && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <X color={Colors.neutral.white} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={styles.placeholder} />
      </View>
      
      <FlatList
        data={mockNotifications}
        keyExtractor={(item) => item.id}
        renderItem={renderNotification}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.primary.main,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.neutral.white,
  },
  placeholder: {
    width: 32,
  },
  listContainer: {
    padding: 16,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.neutral.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  unreadNotification: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary.main,
  },
  notificationIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.neutral.black,
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: Colors.neutral.darkGray,
    lineHeight: 20,
    marginBottom: 8,
  },
  notificationTime: {
    fontSize: 12,
    color: Colors.neutral.gray,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary.main,
    marginLeft: 8,
    marginTop: 8,
  },
});