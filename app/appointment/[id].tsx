import { Calendar, Clock, Edit, MessageSquare, Trash, User } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View, SafeAreaView } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

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
  const [isUpdating, setIsUpdating] = useState(false);
  const [hasAuth, setHasAuth] = useState<boolean>(false);

  // Helper: build Authorization header from token, normalizing Bearer prefix
  const makeAuthHeader = (token: string | undefined | null) => {
    if (!token) return undefined;
    const t = String(token).trim();
    const hasBearer = /^bearer\s+/i.test(t);
    return { Authorization: hasBearer ? t : `Bearer ${t}` } as { Authorization: string };
  };

  // Helper: get Authorization header from AsyncStorage across possible keys
  const getAuthHeaders = async (): Promise<{ Authorization: string } | undefined> => {
    // Try raw token keys first
    const directKeys = ['token', 'businessToken', 'BusinessToken', 'accessToken', 'access_token', 'jwt', 'authToken'];
    for (const k of directKeys) {
      const v = await AsyncStorage.getItem(k);
      if (v) {
        return makeAuthHeader(v);
      }
    }
    // Try JSON containers commonly used to store { token, id }
    const jsonKeys = ['currentUser', 'user', 'business', 'auth', 'authState', 'session', 'profile', 'currentBusiness'];
    for (const k of jsonKeys) {
      const raw = await AsyncStorage.getItem(k);
      if (raw) {
        try {
          const obj = JSON.parse(raw);
          const t = obj?.token || obj?.accessToken || obj?.jwt || obj?.business?.token || obj?.user?.token;
          if (t) {
            console.log('[auth] using token from JSON key:', k);
            return makeAuthHeader(t);
          }
        } catch {
          // ignore parse errors
        }
      }
    }
    // Fallback: scan all keys and try to find any object containing a token-like field
    try {
      const keys = await AsyncStorage.getAllKeys();
      // Limit to reasonable count to avoid heavy IO
      const slice = keys.slice(0, 50);
      const stores = await AsyncStorage.multiGet(slice);
      for (const [k, raw] of stores) {
        if (!raw) continue;
        try {
          const obj = JSON.parse(raw);
          const t = obj?.token || obj?.accessToken || obj?.jwt;
          if (t) {
            console.log('[auth] using token from scanned key:', k);
            return makeAuthHeader(t);
          }
        } catch {
          // skip non-JSON
        }
      }
    } catch (scanErr) {
      // ignore
    }
    return undefined;
  };

  useEffect(() => {
    if (id) {
      const foundAppointment = appointments.find((a) => a.id === id);
      if (foundAppointment) {
        setAppointment(foundAppointment);
      }
    }
  }, [id, appointments]);

  useEffect(() => {
    (async () => {
      const headers = await getAuthHeaders();
      setHasAuth(!!headers);
    })();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      let active = true;
      (async () => {
        const headers = await getAuthHeaders();
        if (active) setHasAuth(!!headers);
      })();
      return () => {
        active = false;
      };
    }, [])
  );

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

  const acceptAppointment = async () => {
    if (!appointment || isUpdating) return;
    setIsUpdating(true);
    const prev = appointment.status;
    // Optimistic update: booked -> confirmed in mobile UI
    updateAppointment(appointment.id, { status: 'confirmed' as Appointment['status'] });
    try {
      const headers = await getAuthHeaders();
      if (!headers) {
        throw new Error('NO_AUTH');
      }
      await axios.patch(`http://192.168.1.4:5000/api/appointments/${appointment.id}/status`, { status: 'booked' }, { headers });
    } catch (e: any) {
      // Rollback on failure
      updateAppointment(appointment.id, { status: prev });
      const message = e?.message === 'NO_AUTH' ? 'Please sign in as a business to accept appointments.' : (e?.response?.data?.msg || 'Could not accept the appointment.');
      Alert.alert('Update failed', message);
    } finally {
      setIsUpdating(false);
    }
  };

  const declineAppointment = async () => {
    if (!appointment || isUpdating) return;
    setIsUpdating(true);
    const prev = appointment.status;
    // Optimistic update: canceled -> cancelled in mobile UI
    updateAppointment(appointment.id, { status: 'cancelled' as Appointment['status'] });
    try {
      const headers = await getAuthHeaders();
      if (!headers) {
        throw new Error('NO_AUTH');
      }
      await axios.patch(`http://192.168.1.4:5000/api/appointments/${appointment.id}/status`, { status: 'notbooked' }, { headers });
    } catch (e: any) {
      // Rollback on failure
      updateAppointment(appointment.id, { status: prev });
      const message = e?.message === 'NO_AUTH' ? 'Please sign in as a business to decline appointments.' : (e?.response?.data?.msg || 'Could not decline the appointment.');
      Alert.alert('Update failed', message);
    } finally {
      setIsUpdating(false);
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
  const showActions = (() => {
    const s = String(appointment.status || '').toLowerCase();
    return s === 'pending' || s === 'waiting' || s === 'notbooked';
  })();

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
      <View style={styles.screen}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={[styles.contentContainer, showActions && styles.contentBottomSpacer]}
        >
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

        {showActions && (
          <View style={styles.bottomActionsContainer}>
            <SafeAreaView>
              <View style={styles.actionsRow}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.acceptButton, (isUpdating || !hasAuth) && styles.actionButtonDisabled]}
                  onPress={acceptAppointment}
                  disabled={isUpdating || !hasAuth}
                >
                  <Text style={styles.actionButtonText}>Accept</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.declineButton, (isUpdating || !hasAuth) && styles.actionButtonDisabled]}
                  onPress={declineAppointment}
                  disabled={isUpdating || !hasAuth}
                >
                  <Text style={styles.actionButtonText}>Decline</Text>
                </TouchableOpacity>
              </View>
              {!hasAuth && (
                <View style={{ marginTop: 8 }}>
                  <Text style={{ textAlign: 'center', color: Colors.neutral.darkGray }}>
                    Sign in as a business to manage appointments.
                  </Text>
                </View>
              )}
            </SafeAreaView>
          </View>
        )}
      </View>
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
  screen: {
    flex: 1,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 12,
  },
  bottomActionsContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.neutral.white,
    borderTopWidth: 1,
    borderTopColor: Colors.neutral.lightGray,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 6,
  },
  contentBottomSpacer: {
    paddingBottom: 100,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  acceptButton: {
    backgroundColor: Colors.primary.main,
  },
  declineButton: {
    backgroundColor: '#ef4444',
  },
  actionButtonText: {
    color: Colors.neutral.white,
    fontWeight: '600' as const,
  },
  actionButtonDisabled: {
    opacity: 0.6,
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