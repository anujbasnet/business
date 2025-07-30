import { Calendar, ChevronLeft, ChevronRight, Plus } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';

import AppointmentCard from '@/components/AppointmentCard';
import EmptyState from '@/components/EmptyState';
import Colors from '@/constants/colors';
import { useAppointmentsStore } from '@/hooks/useAppointmentsStore';
import { Appointment } from '@/types';

export default function CalendarScreen() {
  const { getAppointmentsByDate } = useAppointmentsStore();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [weekDates, setWeekDates] = useState<Date[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    generateWeekDates(selectedDate);
  }, [selectedDate]);

  useEffect(() => {
    const dateString = selectedDate.toISOString().split('T')[0];
    const appointmentsForDate = getAppointmentsByDate(dateString);
    setAppointments(appointmentsForDate);
  }, [selectedDate, getAppointmentsByDate]);

  const generateWeekDates = (currentDate: Date) => {
    const dates: Date[] = [];
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      dates.push(date);
    }

    setWeekDates(dates);
  };

  const navigateToPreviousWeek = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 7);
    setSelectedDate(newDate);
  };

  const navigateToNextWeek = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 7);
    setSelectedDate(newDate);
  };

  const selectDate = (date: Date) => {
    setSelectedDate(date);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (date: Date) => {
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  const formatDayName = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const handleAppointmentPress = (appointment: Appointment) => {
    router.push(`/appointment/${appointment.id}`);
  };

  const handleAddAppointment = () => {
    router.push('/appointment/new');
  };

  return (
    <View style={styles.container}>
      <View style={styles.calendarHeader}>
        <Text style={styles.monthYear}>{formatMonthYear(selectedDate)}</Text>
        <View style={styles.navigationButtons}>
          <TouchableOpacity onPress={navigateToPreviousWeek} style={styles.navButton}>
            <ChevronLeft size={24} color={Colors.primary.main} />
          </TouchableOpacity>
          <TouchableOpacity onPress={navigateToNextWeek} style={styles.navButton}>
            <ChevronRight size={24} color={Colors.primary.main} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.weekContainer}>
        {weekDates.map((date, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.dayContainer,
              isSelected(date) && styles.selectedDayContainer,
            ]}
            onPress={() => selectDate(date)}
          >
            <Text style={[
              styles.dayName,
              isSelected(date) && styles.selectedDayText,
            ]}>
              {formatDayName(date)}
            </Text>
            <View style={[
              styles.dayNumber,
              isToday(date) && styles.todayCircle,
              isSelected(date) && styles.selectedDayCircle,
            ]}>
              <Text style={[
                styles.dayNumberText,
                isToday(date) && styles.todayText,
                isSelected(date) && styles.selectedDayNumberText,
              ]}>
                {date.getDate()}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.appointmentsContainer}>
        <View style={styles.appointmentsHeader}>
          <Text style={styles.appointmentsTitle}>Appointments</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={handleAddAppointment}
          >
            <Plus size={20} color={Colors.neutral.white} />
          </TouchableOpacity>
        </View>

        {appointments.length > 0 ? (
          <FlatList
            data={appointments}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <AppointmentCard appointment={item} onPress={handleAppointmentPress} />
            )}
            contentContainerStyle={styles.appointmentsList}
          />
        ) : (
          <EmptyState
            icon={Calendar}
            title="No appointments"
            message={`No appointments scheduled for ${selectedDate.toLocaleDateString()}.`}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral.background,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.neutral.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.lightGray,
  },
  monthYear: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.primary.main,
  },
  navigationButtons: {
    flexDirection: 'row',
  },
  navButton: {
    padding: 4,
    marginLeft: 8,
  },
  weekContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.neutral.white,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.lightGray,
  },
  dayContainer: {
    flex: 1,
    alignItems: 'center',
    padding: 8,
  },
  selectedDayContainer: {
    backgroundColor: Colors.primary.main + '10',
    borderRadius: 8,
  },
  dayName: {
    fontSize: 12,
    color: Colors.neutral.darkGray,
    marginBottom: 4,
  },
  selectedDayText: {
    color: Colors.primary.main,
    fontWeight: '500' as const,
  },
  dayNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayNumberText: {
    fontSize: 16,
    color: Colors.neutral.black,
  },
  todayCircle: {
    backgroundColor: Colors.neutral.lightGray,
  },
  todayText: {
    fontWeight: '600' as const,
  },
  selectedDayCircle: {
    backgroundColor: Colors.primary.main,
  },
  selectedDayNumberText: {
    color: Colors.neutral.white,
    fontWeight: '600' as const,
  },
  appointmentsContainer: {
    flex: 1,
    padding: 16,
  },
  appointmentsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  appointmentsTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.primary.main,
  },
  addButton: {
    backgroundColor: Colors.secondary.main,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appointmentsList: {
    paddingBottom: 16,
  },
});