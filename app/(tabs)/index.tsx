import { Bell, Calendar } from 'lucide-react-native';
import React, { useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router, Stack } from 'expo-router';

import AppointmentCard from '@/components/AppointmentCard';
import EmptyState from '@/components/EmptyState';
import Colors from '@/constants/colors';
import { translations } from '@/constants/translations';
import { useAppointmentsStore } from '@/hooks/useAppointmentsStore';
import { useBusinessStore } from '@/hooks/useBusinessStore';
import { useLanguageStore } from '@/hooks/useLanguageStore';
import { useNotificationsStore } from '@/hooks/useNotificationsStore';
import { Appointment } from '@/types';

type PeriodType = 'today' | 'week' | 'month';

export default function DashboardScreen() {
  const { language } = useLanguageStore();
  const t = translations[language];
  const { profile } = useBusinessStore();
  const { appointments, getUpcomingAppointments } = useAppointmentsStore();
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('today');
  const unreadCount = useNotificationsStore((s: { unreadCount: number }) => s.unreadCount);

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
        return t.today;
      case 'week':
        return t.thisWeek;
      case 'month':
        return t.thisMonth;
      default:
        return t.today;
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
              <Bell color={Colors.neutral.white} size={24} />
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
          <Text style={styles.welcomeText}>{t.welcomeBack}</Text>
          <Text style={styles.businessName}>{getEmployeeName()}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.nextTwoAppointments}</Text>
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
              title={t.noUpcomingAppointments}
              message={t.noUpcomingMessage}
            />
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.performanceSummary}</Text>
          
          <View style={styles.periodSelector}>
            <TouchableOpacity 
              style={[styles.periodButton, selectedPeriod === 'today' && styles.periodButtonActive]}
              onPress={() => setSelectedPeriod('today')}
            >
              <Text style={[styles.periodButtonText, selectedPeriod === 'today' && styles.periodButtonTextActive]}>{t.today}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.periodButton, selectedPeriod === 'week' && styles.periodButtonActive]}
              onPress={() => setSelectedPeriod('week')}
            >
              <Text style={[styles.periodButtonText, selectedPeriod === 'week' && styles.periodButtonTextActive]}>{t.thisWeek}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.periodButton, selectedPeriod === 'month' && styles.periodButtonActive]}
              onPress={() => setSelectedPeriod('month')}
            >
              <Text style={[styles.periodButtonText, selectedPeriod === 'month' && styles.periodButtonTextActive]}>{t.thisMonth}</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.performanceContainer}>
            <Text style={styles.performanceTitle}>{getPeriodLabel()}</Text>
            <View style={styles.performanceRow}>
              <View style={styles.performanceStat}>
                <Text style={styles.performanceValue}>{currentStats.total}</Text>
                <Text style={styles.performanceLabel}>{t.totalAppointments}</Text>
              </View>
              <View style={styles.performanceStat}>
                <Text style={styles.performanceValue}>{currentStats.completed}</Text>
                <Text style={styles.performanceLabel}>{t.completed}</Text>
              </View>
              <View style={styles.performanceStat}>
                <Text style={styles.performanceValue}>${currentStats.revenue}</Text>
                <Text style={styles.performanceLabel}>{t.revenue}</Text>
              </View>
            </View>
          </View>
        </View>

      </ScrollView>
    </>
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
  notificationButton: {
    position: 'relative',
    padding: 8,
    marginRight: 8,
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: Colors.status.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  notificationBadgeText: {
    color: Colors.neutral.white,
    fontSize: 12,
    fontWeight: '600' as const,
  },
  performanceContainer: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 12,
    padding: 16,
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
  performanceTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.primary.main,
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
    color: Colors.neutral.black,
    marginBottom: 4,
  },
  performanceLabel: {
    fontSize: 12,
    color: Colors.neutral.gray,
    textAlign: 'center',
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
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: Colors.neutral.lightGray,
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
    backgroundColor: Colors.primary.main,
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: Colors.neutral.gray,
  },
  periodButtonTextActive: {
    color: Colors.neutral.white,
  },
});