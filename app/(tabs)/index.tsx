import { Calendar, Clock, DollarSign, Users } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';

import AppointmentCard from '@/components/AppointmentCard';
import EmptyState from '@/components/EmptyState';
import StatCard from '@/components/StatCard';
import Colors from '@/constants/colors';
import { translations } from '@/constants/translations';
import { useAppointmentsStore } from '@/hooks/useAppointmentsStore';
import { useBusinessStore } from '@/hooks/useBusinessStore';
import { useClientsStore } from '@/hooks/useClientsStore';
import { useLanguageStore } from '@/hooks/useLanguageStore';
import { Appointment } from '@/types';

export default function DashboardScreen() {
  const { language } = useLanguageStore();
  const t = translations[language];
  const { profile } = useBusinessStore();
  const { appointments, getUpcomingAppointments } = useAppointmentsStore();
  const { clients } = useClientsStore();
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [stats, setStats] = useState({
    totalClients: 0,
    totalAppointments: 0,
    todayAppointments: 0,
    revenue: 0,
  });

  useEffect(() => {
    const upcoming = getUpcomingAppointments().slice(0, 5);
    setUpcomingAppointments(upcoming);

    const today = new Date().toISOString().split('T')[0];
    const todayAppts = appointments.filter(
      (appointment) => appointment.date === today && appointment.status !== 'cancelled'
    );
    setTodayAppointments(todayAppts);

    // Calculate stats
    setStats({
      totalClients: clients.length,
      totalAppointments: appointments.filter(a => a.status !== 'cancelled').length,
      todayAppointments: todayAppts.length,
      revenue: calculateMonthlyRevenue(),
    });
  }, [appointments, clients]);

  const calculateMonthlyRevenue = () => {
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    
    return appointments
      .filter(appointment => {
        const [year, month] = appointment.date.split('-').map(Number);
        return month === currentMonth && year === currentYear && appointment.status === 'completed';
      })
      .reduce((total, appointment) => {
        // In a real app, you would get the actual price from the service
        // This is a simplified example
        return total + 50;
      }, 0);
  };

  const handleAppointmentPress = (appointment: Appointment) => {
    router.push(`/appointment/${appointment.id}`);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome back,</Text>
        <Text style={styles.businessName}>{profile.name}</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statsRow}>
          <StatCard 
            title={t.todayAppointments} 
            value={stats.todayAppointments} 
            icon={Calendar}
            color={Colors.primary.main}
          />
          <StatCard 
            title={t.totalClients} 
            value={stats.totalClients} 
            icon={Users}
            color={Colors.secondary.main}
          />
        </View>
        <View style={styles.statsRow}>
          <StatCard 
            title={t.monthlyRevenue} 
            value={`$${stats.revenue}`} 
            icon={DollarSign}
            color={Colors.status.success}
          />
          <StatCard 
            title={t.totalAppointments} 
            value={stats.totalAppointments} 
            icon={Clock}
            color={Colors.status.info}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Today's Schedule</Text>
        {todayAppointments.length > 0 ? (
          <FlatList
            data={todayAppointments}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <AppointmentCard appointment={item} onPress={handleAppointmentPress} />
            )}
            scrollEnabled={false}
          />
        ) : (
          <EmptyState
            icon={Calendar}
            title="No appointments today"
            message="You have no appointments scheduled for today."
          />
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Upcoming Appointments</Text>
        {upcomingAppointments.length > 0 ? (
          <FlatList
            data={upcomingAppointments}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <AppointmentCard appointment={item} onPress={handleAppointmentPress} />
            )}
            scrollEnabled={false}
          />
        ) : (
          <EmptyState
            icon={Calendar}
            title="No upcoming appointments"
            message="You have no upcoming appointments scheduled."
          />
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral.background,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 16,
    color: Colors.neutral.darkGray,
  },
  businessName: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.primary.main,
  },
  statsContainer: {
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.primary.main,
    marginBottom: 12,
  },
});