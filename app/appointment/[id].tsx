import { Calendar, Clock, Edit, MessageSquare, Trash, User } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';

import Colors from '@/constants/colors';
import { useAppointmentsStore } from '@/hooks/useAppointmentsStore';
import { useClientsStore } from '@/hooks/useClientsStore';
import { useServicesStore } from '@/hooks/useServicesStore';
import { Appointment } from '@/types';

export default function AppointmentDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { appointments, updateAppointment, deleteAppointment } = useAppointmentsStore();
  const { getClientById } = useClientsStore();
  const { getServiceById } = useServicesStore();
  const [appointment, setAppointment] = useState<Appointment | null>(null);

  useEffect(() => {
    if (id) {
      const foundAppointment = appointments.find((a) => a.id === id);
      if (foundAppointment) {
        setAppointment(foundAppointment);
      }
    }
  }, [id, appointments]);

  const handleStatusChange = (status: Appointment['status']) => {
    if (appointment) {
      updateAppointment(appointment.id, { status });
    }
  };

  const handleDeleteAppointment = () => {
    Alert.alert(
      'Delete Appointment',
      'Are you sure you want to delete this appointment?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            if (appointment) {
              deleteAppointment(appointment.id);
              router.back();
            }
          },
        },
      ]
    );
  };

  const handleEditAppointment = () => {
    if (appointment) {
      router.push(`/appointment/edit/${appointment.id}`);
    }
  };

  const handleViewClient = () => {
    if (appointment) {
      router.push(`/client/${appointment.clientId}`);
    }
  };

  if (!appointment) {
    return (
      <View style={styles.container}>
        <Text>Appointment not found</Text>
      </View>
    );
  }

  const client = getClientById(appointment.clientId);
  const service = getServiceById(appointment.serviceId);

  return (
    <>
      <Stack.Screen 
        options={{
          title: 'Appointment Details',
          headerRight: () => (
            <View style={styles.headerButtons}>
              <TouchableOpacity onPress={handleEditAppointment} style={styles.headerButton}>
                <Edit size={20} color={Colors.neutral.white} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDeleteAppointment} style={styles.headerButton}>
                <Trash size={20} color={Colors.neutral.white} />
              </TouchableOpacity>
            </View>
          ),
        }}
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={styles.card}>
          <View style={styles.statusContainer}>
            <Text style={styles.label}>Status:</Text>
            <View style={styles.statusButtons}>
              {(['pending', 'confirmed', 'completed', 'cancelled'] as const).map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.statusButton,
                    appointment.status === status && styles.activeStatusButton,
                    { backgroundColor: appointment.status === status ? Colors.appointment[status] : Colors.neutral.lightGray },
                  ]}
                  onPress={() => handleStatusChange(status)}
                >
                  <Text 
                    style={[
                      styles.statusButtonText,
                      appointment.status === status && styles.activeStatusButtonText,
                    ]}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.infoRow}>
              <Calendar size={20} color={Colors.primary.main} />
              <Text style={styles.infoLabel}>Date:</Text>
              <Text style={styles.infoValue}>{appointment.date}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Clock size={20} color={Colors.primary.main} />
              <Text style={styles.infoLabel}>Time:</Text>
              <Text style={styles.infoValue}>{appointment.startTime} - {appointment.endTime}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.section} onPress={handleViewClient}>
            <Text style={styles.sectionTitle}>Client</Text>
            <View style={styles.infoRow}>
              <User size={20} color={Colors.primary.main} />
              <Text style={styles.infoLabel}>Name:</Text>
              <Text style={styles.infoValue}>{client?.name || appointment.clientName}</Text>
            </View>
            
            {client && (
              <>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Phone:</Text>
                  <Text style={styles.infoValue}>{client.phone}</Text>
                </View>
                
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Email:</Text>
                  <Text style={styles.infoValue}>{client.email}</Text>
                </View>
              </>
            )}
          </TouchableOpacity>

          <View style={styles.divider} />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Service</Text>
            <Text style={styles.serviceName}>{service?.name || appointment.serviceName}</Text>
            
            {service && (
              <>
                <Text style={styles.serviceDescription}>{service.description}</Text>
                
                <View style={styles.serviceDetails}>
                  <View style={styles.serviceDetail}>
                    <Text style={styles.serviceDetailLabel}>Duration</Text>
                    <Text style={styles.serviceDetailValue}>{service.duration} min</Text>
                  </View>
                  
                  <View style={styles.serviceDetail}>
                    <Text style={styles.serviceDetailLabel}>Price</Text>
                    <Text style={styles.serviceDetailValue}>${service.price}</Text>
                  </View>
                </View>
              </>
            )}
          </View>

          {appointment.notes && (
            <>
              <View style={styles.divider} />
              <View style={styles.section}>
                <View style={styles.infoRow}>
                  <MessageSquare size={20} color={Colors.primary.main} />
                  <Text style={styles.sectionTitle}>Notes</Text>
                </View>
                <Text style={styles.notes}>{appointment.notes}</Text>
              </View>
            </>
          )}
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
  },
  headerButtons: {
    flexDirection: 'row',
  },
  headerButton: {
    marginLeft: 16,
  },
  card: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: Colors.neutral.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statusContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.primary.main,
    marginBottom: 8,
  },
  statusButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: Colors.neutral.lightGray,
  },
  activeStatusButton: {
    backgroundColor: Colors.primary.main,
  },
  statusButtonText: {
    color: Colors.neutral.darkGray,
    fontWeight: '500' as const,
  },
  activeStatusButtonText: {
    color: Colors.neutral.white,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.primary.main,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: Colors.neutral.darkGray,
    marginLeft: 8,
    width: 60,
  },
  infoValue: {
    fontSize: 16,
    color: Colors.neutral.black,
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.neutral.lightGray,
    marginVertical: 16,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.neutral.black,
    marginBottom: 8,
  },
  serviceDescription: {
    fontSize: 14,
    color: Colors.neutral.darkGray,
    marginBottom: 12,
  },
  serviceDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  serviceDetail: {
    backgroundColor: Colors.neutral.background,
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  serviceDetailLabel: {
    fontSize: 12,
    color: Colors.neutral.darkGray,
    marginBottom: 4,
  },
  serviceDetailValue: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.primary.main,
  },
  notes: {
    fontSize: 16,
    color: Colors.neutral.darkGray,
    lineHeight: 24,
  },
});