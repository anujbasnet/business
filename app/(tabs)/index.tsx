import { Bell, Calendar } from 'lucide-react-native';
import React, { useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router, Stack } from 'expo-router';

import AppointmentCard from '@/components/AppointmentCard';
import EmptyState from '@/components/EmptyState';
import { useTheme } from '@/hooks/useTheme';
import { useAppointmentsStore } from '@/hooks/useAppointmentsStore';
import { useBusinessStore } from '@/hooks/useBusinessStore';
import { useNotificationsStore } from '@/hooks/useNotificationsStore';
import { Appointment } from '@/types';
import { AppColors } from '@/constants/colors';

type PeriodType = 'today' | 'week' | 'month';

export default function DashboardScreen() {
  const { colors } = useTheme();
  const { profile } = useBusinessStore();
  const { appointments, getUpcomingAppointments } = useAppointmentsStore();
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('today');
  const unreadCount = useNotificationsStore((s: { unreadCount: number }) => s.unreadCount);
  const styles = getStyles(colors);

  const handleAppointmentPress = (appointment: Appointment) => {
    router.push(`/appointment/${appointment.id}`);
  };

  const getEmployeeName = () => {
    if (profile.employees && profile.employees.length > 0) {
      return profile.employees[0].split(' - ')[0];
    }
    return 'Owner';
  };

  const getNextTwoAppointments = () => {
    const upcoming = getUpcomingAppointments();
    return upcoming.slice(0, 2);
  };

  const calculateStats = () => {
    const today = new Date().toISOString().split('T')[0];
    const thisWeekStart = new Date();
    thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay());
    const thisMonthStart = new Date();
    thisMonthStart.setDate(1);

    const todayAppts = appointments.filter(a => a.date === today && a.status !== 'cancelled');
    const todayCompleted = appointments.filter(a => a.date === today && a.status === 'completed');
    const todayRevenue = todayCompleted.reduce((sum, a) => sum + (a.servicePrice || 0), 0);

    const thisWeekAppts = appointments.filter(a => {
      const apptDate = new Date(a.date);
      return apptDate >= thisWeekStart && a.status !== 'cancelled';
    });
    const thisWeekCompleted = appointments.filter(a => {
      const apptDate = new Date(a.date);
      return apptDate >= thisWeekStart && a.status === 'completed';
    });
    const thisWeekRevenue = thisWeekCompleted.reduce((sum, a) => sum + (a.servicePrice || 0), 0);

    const thisMonthAppts = appointments.filter(a => {
      const apptDate = new Date(a.date);
      return apptDate >= thisMonthStart && a.status !== 'cancelled';
    });
    const thisMonthCompleted = appointments.filter(a => {
      const apptDate = new Date(a.date);
      return apptDate >= thisMonthStart && a.status === 'completed';
    });
    const thisMonthRevenue = thisMonthCompleted.reduce((sum, a) => sum + (a.servicePrice || 0), 0);

    return {
      today: { total: todayAppts.length, completed: todayCompleted.length, revenue: todayRevenue },
      week: { total: thisWeekAppts.length, completed: thisWeekCompleted.length, revenue: thisWeekRevenue },
      month: { total: thisMonthAppts.length, completed: thisMonthCompleted.length, revenue: thisMonthRevenue },
    };
  };

  const performanceStats = calculateStats();
  const nextTwoAppointments = getNextTwoAppointments();

  const getCurrentStats = () => {
    switch (selectedPeriod) {
      case 'today':
        return performanceStats.today;
      case 'week':
        return performanceStats.week;
      case 'month':
        return performanceStats.month;
      default:
        return performanceStats.today;
    }
  };

  const getPeriodLabel = () => {
    switch (selectedPeriod) {
      case 'today':
        return 'Today';
      case 'week':
        return 'This Week';
      case 'month':
        return 'This Month';
      default:
        return 'Today';
    }
  };

  const currentStats = getCurrentStats();

  return (
    <>
      <Stack.Screen 
        options={{
          headerRight: () => (
            <TouchableOpacity 
              testID="header-notifications-button"
              onPress={() => router.push('/notifications')}
              style={styles.notificationButton}
            >
              <Bell color={colors.neutral.white} size={24} />
              {unreadCount > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          ),
        }} 
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={styles.header}>
          <Text style={[styles.welcomeText, { color: colors.neutral.gray }]}>Welcome back,</Text>
          <Text style={[styles.businessName, { color: colors.neutral.darkGray }]}>{getEmployeeName()}</Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.neutral.darkGray }]}>Next 2 Appointments</Text>
          {nextTwoAppointments.length > 0 ? (
            <FlatList
              data={nextTwoAppointments}
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

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.neutral.darkGray }]}>Performance Summary</Text>
          
          <View style={styles.periodSelector}>
            <TouchableOpacity 
              style={[styles.periodButton, selectedPeriod === 'today' && styles.periodButtonActive]}
              onPress={() => setSelectedPeriod('today')}
            >
              <Text style={[styles.periodButtonText, { color: selectedPeriod === 'today' ? colors.neutral.white : colors.neutral.gray }]}>Today</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.periodButton, selectedPeriod === 'week' && styles.periodButtonActive]}
              onPress={() => setSelectedPeriod('week')}
            >
              <Text style={[styles.periodButtonText, { color: selectedPeriod === 'week' ? colors.neutral.white : colors.neutral.gray }]}>This Week</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.periodButton, selectedPeriod === 'month' && styles.periodButtonActive]}
              onPress={() => setSelectedPeriod('month')}
            >
              <Text style={[styles.periodButtonText, { color: selectedPeriod === 'month' ? colors.neutral.white : colors.neutral.gray }]}>This Month</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.performanceContainer}>
            <Text style={[styles.performanceTitle, { color: colors.primary.main }]}>{getPeriodLabel()}</Text>
            <View style={styles.performanceRow}>
              <View style={styles.performanceStat}>
                <Text style={[styles.performanceValue, { color: colors.neutral.darkGray }]}>{currentStats.total}</Text>
                <Text style={[styles.performanceLabel, { color: colors.neutral.gray }]}>Total Appointments</Text>
              </View>
              <View style={styles.performanceStat}>
                <Text style={[styles.performanceValue, { color: colors.neutral.darkGray }]}>{currentStats.completed}</Text>
                <Text style={[styles.performanceLabel, { color: colors.neutral.gray }]}>Completed</Text>
              </View>
              <View style={styles.performanceStat}>
                <Text style={[styles.performanceValue, { color: colors.neutral.darkGray }]}>${currentStats.revenue}</Text>
                <Text style={[styles.performanceLabel, { color: colors.neutral.gray }]}>Revenue</Text>
              </View>
            </View>
          </View>
        </View>

      </ScrollView>
    </>
  );
}

const getStyles = (colors: AppColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral.background,
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
  },
  businessName: {
    fontSize: 24,
    fontWeight: '700' as const,
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
    marginRight: 8,
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: colors.status.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  notificationBadgeText: {
    color: colors.neutral.white,
    fontSize: 12,
    fontWeight: '600' as const,
  },
  performanceContainer: {
    backgroundColor: colors.neutral.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: colors.neutral.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  performanceTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    marginBottom: 12,
  },
  performanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  performanceStat: {
    alignItems: 'center',
    flex: 1,
  },
  performanceValue: {
    fontSize: 20,
    fontWeight: '700' as const,
    marginBottom: 4,
  },
  performanceLabel: {
    fontSize: 12,
    textAlign: 'center',
  },

  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    marginBottom: 12,
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: colors.neutral.lightGray,
    borderRadius: 8,
    padding: 4,
    marginBottom: 16,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: colors.primary.main,
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '500' as const,
  },
  periodButtonTextActive: {
    color: colors.neutral.white,
  },
});