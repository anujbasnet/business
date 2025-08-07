import { Calendar, ChevronLeft, ChevronRight, List, Plus } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

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

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour < 20; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(timeString);
      }
    }
    return slots;
  };

  const getAppointmentForTimeSlot = (timeSlot: string) => {
    return appointments.find(apt => {
      const aptStartTime = apt.startTime;
      const aptEndTime = apt.endTime;
      return timeSlot >= aptStartTime && timeSlot < aptEndTime;
    });
  };

  const getAppointmentDuration = (appointment: Appointment, timeSlot: string) => {
    const startTime = appointment.startTime;
    const endTime = appointment.endTime;
    
    const startMinutes = parseInt(startTime.split(':')[0]) * 60 + parseInt(startTime.split(':')[1]);
    const endMinutes = parseInt(endTime.split(':')[0]) * 60 + parseInt(endTime.split(':')[1]);
    const slotMinutes = parseInt(timeSlot.split(':')[0]) * 60 + parseInt(timeSlot.split(':')[1]);
    
    const totalDuration = endMinutes - startMinutes;
    const slotsCount = totalDuration / 30;
    
    return {
      isFirst: slotMinutes === startMinutes,
      slotsCount,
      totalDuration
    };
  };

  const renderCalendarView = () => {
    const timeSlots = generateTimeSlots();
    
    return (
      <ScrollView style={styles.calendarView} showsVerticalScrollIndicator={false}>
        <View style={styles.timeGrid}>
          {timeSlots.map((timeSlot, index) => {
            const appointment = getAppointmentForTimeSlot(timeSlot);
            const isOccupied = !!appointment;
            
            if (isOccupied && appointment) {
              const { isFirst, slotsCount } = getAppointmentDuration(appointment, timeSlot);
              
              if (isFirst) {
                return (
                  <View key={index} style={[styles.timeSlot, styles.occupiedSlot, { height: 60 * slotsCount }]}>
                    <View style={styles.timeLabel}>
                      <Text style={styles.timeLabelText}>{timeSlot}</Text>
                    </View>
                    <View style={styles.appointmentInfo}>
                      <Text style={styles.appointmentName} numberOfLines={1}>
                        {appointment.clientName}
                      </Text>
                      <Text style={styles.appointmentService} numberOfLines={1}>
                        {appointment.serviceName}
                      </Text>
                    </View>
                  </View>
                );
              } else {
                return null;
              }
            }
            
            return (
              <View key={index} style={[styles.timeSlot, styles.freeSlot]}>
                <View style={styles.timeLabel}>
                  <Text style={styles.timeLabelText}>{timeSlot}</Text>
                </View>
                <View style={styles.freeSlotContent}>
                  <Text style={styles.freeSlotText}>Available</Text>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    );
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
          <View style={styles.headerActions}>
            <View style={styles.viewToggle}>
              <TouchableOpacity 
                style={[styles.toggleButton, viewMode === 'list' && styles.activeToggle]}
                onPress={() => setViewMode('list')}
              >
                <List size={16} color={viewMode === 'list' ? Colors.neutral.white : Colors.primary.main} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.toggleButton, viewMode === 'calendar' && styles.activeToggle]}
                onPress={() => setViewMode('calendar')}
              >
                <Calendar size={16} color={viewMode === 'calendar' ? Colors.neutral.white : Colors.primary.main} />
              </TouchableOpacity>
            </View>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={handleAddAppointment}
            >
              <Plus size={20} color={Colors.neutral.white} />
            </TouchableOpacity>
          </View>
        </View>

        {viewMode === 'list' ? (
          appointments.length > 0 ? (
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
          )
        ) : (
          renderCalendarView()
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: Colors.neutral.lightGray,
    borderRadius: 20,
    padding: 2,
  },
  toggleButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 18,
  },
  activeToggle: {
    backgroundColor: Colors.primary.main,
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
  calendarView: {
    flex: 1,
  },
  timeGrid: {
    paddingBottom: 20,
  },
  timeSlot: {
    flexDirection: 'row',
    minHeight: 60,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.lightGray,
  },
  freeSlot: {
    backgroundColor: Colors.neutral.white,
  },
  occupiedSlot: {
    backgroundColor: Colors.primary.main + '15',
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary.main,
  },
  timeLabel: {
    width: 60,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.neutral.background,
    borderRightWidth: 1,
    borderRightColor: Colors.neutral.lightGray,
  },
  timeLabelText: {
    fontSize: 12,
    color: Colors.neutral.darkGray,
    fontWeight: '500' as const,
  },
  appointmentInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  appointmentName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.neutral.black,
    marginBottom: 2,
  },

  appointmentService: {
    fontSize: 14,
    color: Colors.primary.main,
    fontWeight: '500' as const,
  },
  freeSlotContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  freeSlotText: {
    fontSize: 12,
    color: Colors.neutral.gray,
    fontStyle: 'italic',
  },
});