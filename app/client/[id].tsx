import { Calendar, Edit, Mail, MessageSquare, Phone, Trash } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';

import AppointmentCard from '@/components/AppointmentCard';
import EmptyState from '@/components/EmptyState';
import Colors from '@/constants/colors';
import { useAppointmentsStore } from '@/hooks/useAppointmentsStore';
import { useClientsStore } from '@/hooks/useClientsStore';
import { Appointment, Client } from '@/types';

export default function ClientDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { clients, deleteClient } = useClientsStore();
  const { getAppointmentsByClient } = useAppointmentsStore();
  const [client, setClient] = useState<Client | null>(null);
  const [clientAppointments, setClientAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    if (id) {
      const foundClient = clients.find((c) => c.id === id);
      if (foundClient) {
        setClient(foundClient);
        const appointments = getAppointmentsByClient(id);
        setClientAppointments(appointments);
      }
    }
  }, [id, clients, getAppointmentsByClient]);

  const handleDeleteClient = () => {
    Alert.alert(
      'Delete Client',
      'Are you sure you want to delete this client? This will also delete all their appointments.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            if (client) {
              deleteClient(client.id);
              router.back();
            }
          },
        },
      ]
    );
  };

  const handleEditClient = () => {
    if (client) {
      router.push(`/client/edit/${client.id}`);
    }
  };

  const handleAppointmentPress = (appointment: Appointment) => {
    router.push(`/appointment/${appointment.id}`);
  };

  if (!client) {
    return (
      <View style={styles.container}>
        <Text>Client not found</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen 
        options={{
          title: client.name,
          headerRight: () => (
            <View style={styles.headerButtons}>
              <TouchableOpacity onPress={handleEditClient} style={styles.headerButton}>
                <Edit size={20} color={Colors.neutral.white} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDeleteClient} style={styles.headerButton}>
                <Trash size={20} color={Colors.neutral.white} />
              </TouchableOpacity>
            </View>
          ),
        }}
      />
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <View style={styles.card}>
          <View style={styles.clientHeader}>
            <View style={styles.clientInitials}>
              <Text style={styles.initialsText}>
                {client.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </Text>
            </View>
            <View style={styles.clientInfo}>
              <Text style={styles.clientName}>{client.name}</Text>
              {client.lastVisit && (
                <Text style={styles.lastVisit}>Last visit: {client.lastVisit}</Text>
              )}
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.contactSection}>
            <View style={styles.contactItem}>
              <Phone size={20} color={Colors.primary.main} />
              <Text style={styles.contactText}>{client.phone}</Text>
            </View>
            
            <View style={styles.contactItem}>
              <Mail size={20} color={Colors.primary.main} />
              <Text style={styles.contactText}>{client.email}</Text>
            </View>
          </View>

          {client.notes && (
            <>
              <View style={styles.divider} />
              <View style={styles.notesSection}>
                <View style={styles.sectionHeader}>
                  <MessageSquare size={20} color={Colors.primary.main} />
                  <Text style={styles.sectionTitle}>Notes</Text>
                </View>
                <Text style={styles.notesText}>{client.notes}</Text>
              </View>
            </>
          )}
        </View>

        <View style={styles.appointmentsSection}>
          <Text style={styles.appointmentsTitle}>Appointments</Text>
          
          {clientAppointments.length > 0 ? (
            <FlatList
              data={clientAppointments}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <AppointmentCard appointment={item} onPress={handleAppointmentPress} />
              )}
              scrollEnabled={false}
            />
          ) : (
            <EmptyState
              icon={Calendar}
              title="No appointments"
              message="This client has no appointments."
            />
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
    marginBottom: 16,
  },
  clientHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  clientInitials: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  initialsText: {
    color: Colors.neutral.white,
    fontSize: 24,
    fontWeight: '600' as const,
  },
  clientInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: Colors.primary.main,
    marginBottom: 4,
  },
  lastVisit: {
    fontSize: 14,
    color: Colors.neutral.darkGray,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.neutral.lightGray,
    marginVertical: 16,
  },
  contactSection: {
    gap: 12,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactText: {
    fontSize: 16,
    color: Colors.neutral.darkGray,
    marginLeft: 12,
  },
  notesSection: {
    gap: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.primary.main,
    marginLeft: 8,
  },
  notesText: {
    fontSize: 16,
    color: Colors.neutral.darkGray,
    lineHeight: 24,
  },
  appointmentsSection: {
    marginBottom: 24,
  },
  appointmentsTitle: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: Colors.primary.main,
    marginBottom: 16,
  },
});