import { Bell, Calendar } from 'lucide-react-native';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, ScrollView, Text, TouchableOpacity, View, StyleSheet, RefreshControl, Alert } from 'react-native';
import { router, Stack } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

import AppointmentCard from '@/components/AppointmentCard';
import EmptyState from '@/components/EmptyState';
import Colors from '@/constants/colors';
import { translations } from '@/constants/translations';
import { useAppointmentsStore } from '@/hooks/useAppointmentsStore';
import { useBusinessStore } from '@/hooks/useBusinessStore';
import { useLanguageStore } from '@/hooks/useLanguageStore';
import { useNotificationsStore } from '@/hooks/useNotificationsStore';

export default function DashboardScreen() {
  const { language } = useLanguageStore();
  const t = translations[language];
  const { appointments, getUpcomingAppointments, setAppointments } = useAppointmentsStore();
  const [pendingAppointments, setPendingAppointments] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('today');
  const unreadCount = useNotificationsStore(s => s.unreadCount);
  const [businessName, setBusinessName] = useState('');
  const { updateProfile } = useBusinessStore();
  const [refreshing, setRefreshing] = useState(false);
  const [servicePriceMap, setServicePriceMap] = useState({}); // by service id
  const [servicePriceNameMap, setServicePriceNameMap] = useState({}); // by lowercased name
  const [servicePricesLoaded, setServicePricesLoaded] = useState(false);
  const servicePriceMapRef = useRef({});
  const servicePriceNameMapRef = useRef({});
  const BaseURL= process.env.EXPO_PUBLIC_SERVER_IP;
  useEffect(() => {
    servicePriceMapRef.current = servicePriceMap || {};
  }, [servicePriceMap]);
  useEffect(() => {
    servicePriceNameMapRef.current = servicePriceNameMap || {};
  }, [servicePriceNameMap]);

  const mapsAreEqual = useCallback((a = {}, b = {}) => {
    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);
    if (aKeys.length !== bKeys.length) return false;
    for (const k of aKeys) {
      if (a[k] !== b[k]) return false;
    }
    return true;
  }, []);

  // Build a price map for services: { [serviceId]: price }
  const fetchServicePrices = useCallback(async () => {
    try {
      const businessId = await AsyncStorage.getItem('businessId');
      if (!businessId) return;
      // Correct endpoint: /api/business/:businessId/services
      const res = await axios.get(`https://${BaseURL}/api/business/${businessId}/services`);
      const list = Array.isArray(res?.data) ? res.data : [];
      const byId = {};
      const byName = {};
      (list || []).forEach((s) => {
        const id = String(s?.id || s?._id || s?.service_id || '').trim();
        const nameKey = String(s?.name || '').toLowerCase().trim();
        const price = Number(s?.price || s?.service_price || s?.amount || s?.servicePrice || 0);
        if (id) byId[id] = price;
        if (nameKey) byName[nameKey] = price;
      });
      setServicePricesLoaded(true);
      setServicePriceMap(prev => (mapsAreEqual(prev, byId) ? prev : byId));
      setServicePriceNameMap(prev => (mapsAreEqual(prev, byName) ? prev : byName));
    } catch (e1) {
      // Optional fallback: try a generic services-by-business endpoint if available
      try {
        const businessId = await AsyncStorage.getItem('businessId');
        const res2 = await axios.get(`https://${BaseURL}/api/services`, { params: { businessId } });
        const raw2 = res2?.data || {};
        const list2 = Array.isArray(raw2) ? raw2 : (raw2.services || raw2.data || []);
        const byId2 = {};
        const byName2 = {};
        (list2 || []).forEach((s) => {
          const id = String(s?.id || s?._id || s?.service_id || '').trim();
          const nameKey = String(s?.name || '').toLowerCase().trim();
          const price = Number(s?.price || s?.service_price || s?.amount || s?.servicePrice || 0);
          if (id) byId2[id] = price;
          if (nameKey) byName2[nameKey] = price;
        });
        setServicePricesLoaded(true);
        setServicePriceMap(prev => (mapsAreEqual(prev, byId2) ? prev : byId2));
        setServicePriceNameMap(prev => (mapsAreEqual(prev, byName2) ? prev : byName2));
      } catch (e2) {
        // Leave map empty; revenue will fallback to appointment price field
        setServicePricesLoaded(true);
        setServicePriceMap(prev => (mapsAreEqual(prev, {}) ? prev : {}));
        setServicePriceNameMap(prev => (mapsAreEqual(prev, {}) ? prev : {}));
      }
    }
  }, [mapsAreEqual]);

  // Fetchers (reused by effects and pull-to-refresh)
  const fetchBusinessProfile = useCallback(async () => {
    try {
      const businessId = await AsyncStorage.getItem('businessId');
      if (!businessId) return console.log('No business ID found');
      const response = await axios.get(`https://${BaseURL}/api/auth/business/profile`, { params: { businessId } });
      const data = response.data || {};
      // Map backend fields to mobile BusinessProfile shape + normalize working hours
      const normalizeWorkingHours = (wh) => {
        if (!wh || typeof wh !== 'object') return {};
          // If already mobile structure (has monday object with isOpen)
        if (wh.monday && typeof wh.monday === 'object' && 'isOpen' in wh.monday) return wh;
        const base = {
          monday: { isOpen: false, openTime: '', closeTime: '' },
          tuesday: { isOpen: false, openTime: '', closeTime: '' },
          wednesday: { isOpen: false, openTime: '', closeTime: '' },
          thursday: { isOpen: false, openTime: '', closeTime: '' },
          friday: { isOpen: false, openTime: '', closeTime: '' },
          saturday: { isOpen: false, openTime: '', closeTime: '' },
          sunday: { isOpen: false, openTime: '', closeTime: '' },
        };
        const assignRange = (days, value) => {
          if (!value || typeof value !== 'string') return;
          if (value.toLowerCase().includes('closed')) {
            days.forEach(d => { base[d] = { isOpen: false, openTime: '', closeTime: '' }; });
            return;
          }
          const parts = value.split('-').map(p => p.trim());
          if (parts.length === 2) {
            const to24 = (str) => {
              const match = str.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
              if (!match) return '';
              let [_, hh, mm, ap] = match; // eslint-disable-line no-unused-vars
              let h = parseInt(hh, 10);
              if (ap.toUpperCase() === 'PM' && h !== 12) h += 12;
              if (ap.toUpperCase() === 'AM' && h === 12) h = 0;
              return `${h.toString().padStart(2,'0')}:${mm}`;
            };
            const openTime = to24(parts[0]);
            const closeTime = to24(parts[1]);
            days.forEach(d => { base[d] = { isOpen: true, openTime, closeTime }; });
          }
        };
        Object.entries(wh).forEach(([label, value]) => {
          const lower = label.toLowerCase();
          if (lower.includes('monday') && lower.includes('friday')) assignRange(['monday','tuesday','wednesday','thursday','friday'], value);
          else if (lower.startsWith('saturday')) assignRange(['saturday'], value);
          else if (lower.startsWith('sunday')) assignRange(['sunday'], value);
          else if (['monday','tuesday','wednesday','thursday','friday','saturday','sunday'].includes(lower)) assignRange([lower], value);
        });
        return base;
      };
      const normalizedWorkingHours = normalizeWorkingHours(data.workingHours);
      updateProfile({
        id: data.id || businessId,
          name: data.service_name || data.full_name || data.name || 'Business',
          address: data.address || '',
          phone: data.phone_number || data.phone || '',
          email: data.email || '',
          bio: data.description || 'No description yet.',
          profileImage: data.logoUrl || data.avatarUrl || data.imageUrl,
          logoUrl: data.logoUrl,
          businessType: data.service_type || data.businessType || 'General',
          serviceType: data.service_type || data.serviceType,
          socialMedia: data.socialMedia || {},
          workingHours: normalizedWorkingHours,
          updatedAt: new Date().toISOString(),
      });
      setBusinessName(data.service_name || data.full_name || data.name || 'Owner');

      // Try to build price map from profile's embedded services if present
      try {
        const services = Array.isArray(data?.services)
          ? data.services
          : (Array.isArray(data?.business?.services) ? data.business.services : []);
        if (services.length > 0) {
          const byId = {};
          const byName = {};
          services.forEach((s) => {
            const id = String(s?.id || s?._id || s?.service_id || '').trim();
            const nameKey = String(s?.name || '').toLowerCase().trim();
            const price = Number(s?.price || s?.service_price || s?.amount || s?.servicePrice || 0);
            if (id) byId[id] = price;
            if (nameKey) byName[nameKey] = price;
          });
          if (Object.keys(byId).length > 0 || Object.keys(byName).length > 0) {
            setServicePricesLoaded(true);
            setServicePriceMap(prev => (mapsAreEqual(prev, byId) ? prev : byId));
            setServicePriceNameMap(prev => (mapsAreEqual(prev, byName) ? prev : byName));
          }
        }
      } catch {}
    } catch (error) {
      console.log('Error fetching profile:', error?.response?.data || error.message);
    }
  }, [updateProfile, mapsAreEqual]);

  useEffect(() => {
    fetchBusinessProfile();
  }, [fetchBusinessProfile]);

  useEffect(() => {
    fetchServicePrices();
  }, [fetchServicePrices]);

  // If a price map exists (from profile) but loaded flag isn't set, set it
  useEffect(() => {
    if (!servicePricesLoaded && servicePriceMap && Object.keys(servicePriceMap).length > 0) {
      setServicePricesLoaded(true);
    }
  }, [servicePricesLoaded, servicePriceMap]);

  // Fetch appointments similarly to web DashboardPage.tsx
  // Helper to map appointments
  const mapAppointments = (payload) => {
    const priceMapNow = servicePriceMapRef.current || {};
    const priceNameMapNow = servicePriceNameMapRef.current || {};
    return (Array.isArray(payload) ? payload : [])
      .filter(Boolean)
      .map((a) => ({
        id: String(a.id || a._id || ''),
        date: a.date,
        startTime: a.time || a.startTime || '09:00',
        endTime: a.endTime || '10:00',
        clientId: String(a.user_id || a.clientId || ''),
        clientName: a.clientName || a.user_name || a.user_id || 'Customer',
        serviceId: (() => {
          const sid = (a && a.service_id && typeof a.service_id === 'object') ? (a.service_id.id || a.service_id._id || a.service_id.name) : (a.service_id || a.serviceId);
          return String(sid || '');
        })(),
        serviceName: (() => {
          if (a?.serviceName) return a.serviceName;
          if (a?.service_id && typeof a.service_id === 'object') return a.service_id.name || a.service_id.id || a.service_id._id;
          return a?.service_id;
        })(),
        staffName: (() => {
          if (a?.staffName) return a.staffName;
          if (a?.specialist && typeof a.specialist === 'object') return a.specialist.name || a.specialist.fullName || a.specialist.id || '';
          if (a?.specialist) return a.specialist;
          if (a?.employeeName) return a.employeeName;
          return '';
        })(),
        servicePrice: (() => {
          const rawSid = (a && a.service_id && typeof a.service_id === 'object') ? (a.service_id.id || a.service_id._id || a.service_id.name) : (a.service_id || a.serviceId || '');
          const sid = String(rawSid || '').trim();
          const rawSname = a?.serviceName || (a?.service_id && typeof a.service_id === 'object' ? (a.service_id.name || '') : '');
          const snameKey = String(rawSname || '').toLowerCase().trim() || (/[a-zA-Z]/.test(String(sid)) ? sid.toLowerCase() : '');
          const fromId = sid ? priceMapNow[sid] : undefined;
          const fromName = snameKey ? priceNameMapNow[snameKey] : undefined;
          const raw = Number(a.servicePrice || a.price || a.amount || 0);
          return Number((fromId ?? fromName ?? raw) ?? 0) || 0;
        })(),
        status: (() => {
          const s = String(a.status || 'pending').toLowerCase();
          if (s === 'booked') return 'confirmed';
          if (s === 'canceled' || s === 'cancelled' || s === 'declined' || s === 'rejected' || s === 'notbooked') return 'cancelled';
          if (s === 'completed') return 'completed';
          if (s === 'waiting' || s === 'pending') return 'pending';
          return 'pending';
        })(),
        notes: a.notes || '',
        createdAt: a.created_at || new Date().toISOString(),
        updatedAt: a.updated_at || new Date().toISOString(),
        bookingSource: 'bronapp',
      }));
  };

  // Fetch booked/confirmed appointments
  const fetchAppointments = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('BusinessToken')
        || await AsyncStorage.getItem('token')
        || await AsyncStorage.getItem('accessToken')
        || await AsyncStorage.getItem('access_token')
        || await AsyncStorage.getItem('jwt');
      const businessId = await AsyncStorage.getItem('businessId');
      const config = {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        params: businessId ? { businessId, status: 'booked,confirmed,completed' } : { status: 'booked,confirmed,completed' },
      };
      const res = await axios.get(`https://${BaseURL}/api/appointments/business`, config);
      const payload = res.data?.appointments || res.data || [];
      if (typeof setAppointments === 'function') setAppointments(mapAppointments(payload));
    } catch (error) {
      console.log('Error fetching appointments:', error?.response?.data || error.message);
    }
  }, [setAppointments]);

  // Fetch pending/waiting appointments
  const fetchPendingAppointments = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('BusinessToken')
        || await AsyncStorage.getItem('token')
        || await AsyncStorage.getItem('accessToken')
        || await AsyncStorage.getItem('access_token')
        || await AsyncStorage.getItem('jwt');
      const businessId = await AsyncStorage.getItem('businessId');
      const config = {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        params: businessId ? { businessId, status: 'pending,waiting' } : { status: 'pending,waiting' },
      };
      const res = await axios.get(`https://${BaseURL}/api/appointments/business`, config);
      const payload = res.data?.appointments || res.data || [];
      setPendingAppointments(mapAppointments(payload));
    } catch (error) {
      console.log('Error fetching pending appointments:', error?.response?.data || error.message);
    }
  }, []);

  useEffect(() => {
    if (servicePricesLoaded) {
      fetchAppointments();
      fetchPendingAppointments();
    }
  }, [servicePricesLoaded, fetchAppointments, fetchPendingAppointments]);

  // Ensure fresh data when returning from details (e.g., after cancel/accept)
  useFocusEffect(
    useCallback(() => {
      // Refetch in order so price map is available before mapping appointments
      (async () => {
        await fetchBusinessProfile();
        await fetchServicePrices();
        await fetchAppointments();
        await fetchPendingAppointments();
      })();
      return () => {};
    }, [fetchAppointments, fetchPendingAppointments, fetchBusinessProfile, fetchServicePrices])
  );

  // Pull-to-refresh handler
  const onRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      await fetchBusinessProfile();
      await fetchServicePrices();
      await fetchAppointments();
      await fetchPendingAppointments();
    } finally {
      setRefreshing(false);
    }
  }, [fetchBusinessProfile, fetchServicePrices, fetchAppointments, fetchPendingAppointments]);

  const handleAppointmentPress = appointment => {
    router.push(`/appointment/${appointment.id}`);
  };

  const getUsername = () => businessName || 'Owner';


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
    const todayCompleted = appointments.filter(a => a.date === today && (a.status === 'confirmed' || a.status === 'completed'));
    const todayRevenue = todayCompleted.reduce((sum, a) => sum + (a.servicePrice || 0), 0);

    const thisWeekAppts = appointments.filter(a => {
      const apptDate = new Date(a.date);
      return apptDate >= thisWeekStart && a.status !== 'cancelled';
    });
    const thisWeekCompleted = appointments.filter(a => {
      const apptDate = new Date(a.date);
      return apptDate >= thisWeekStart && (a.status === 'completed' || a.status === 'confirmed');
    });
    const thisWeekRevenue = thisWeekCompleted.reduce((sum, a) => sum + (a.servicePrice || 0), 0);

    const thisMonthAppts = appointments.filter(a => {
      const apptDate = new Date(a.date);
      return apptDate >= thisMonthStart && a.status !== 'cancelled';
    });
    const thisMonthCompleted = appointments.filter(a => {
      const apptDate = new Date(a.date);
      return apptDate >= thisMonthStart && (a.status === 'completed' || a.status === 'confirmed');
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
  const upcomingAppointments = useMemo(() => getUpcomingAppointments().slice(0, 2), [appointments]);
  
  // Use filteredPendingAppointments for display
  const filteredPendingAppointments = useMemo(() => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const toTs = (a) => {
      const t = (a.startTime || '00:00').padStart(5, '0');
      return new Date(`${a.date}T${t}:00`).getTime();
    };
    return (pendingAppointments || [])
      .filter(a => {
        try {
          const apptDay = new Date(a.date);
          apptDay.setHours(0, 0, 0, 0);
          return apptDay >= todayStart;
        } catch {
          return true;
        }
      })
      .sort((a,b) => toTs(a) - toTs(b));
  }, [pendingAppointments]);

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
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary.main}
          />
        }
      >
        <View style={styles.header}>
          <Text style={styles.welcomeText}>{t.welcomeBack}</Text>
          <Text style={styles.businessName}>{getUsername()}</Text>
        </View>


        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.pendingAppointments || 'Pending Appointments'}</Text>
          {filteredPendingAppointments.length > 0 ? (
            <FlatList
              data={filteredPendingAppointments}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <AppointmentCard appointment={item} onPress={handleAppointmentPress} />
              )}
              scrollEnabled={false}
            />
          ) : (
            <EmptyState
              icon={Calendar}
              title={(t.noPendingAppointments) || 'No pending appointments'}
              message={(t.noPendingMessage) || 'You have no pending appointments right now.'}
            />
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.bookedAppointments || 'Booked Appointments'}</Text>
          {appointments.length > 0 ? (
            <FlatList
              data={[...appointments]
                .filter(a => {
                  const apptDate = new Date(a.date);
                  const today = new Date();
                  today.setHours(0,0,0,0);
                  apptDate.setHours(0,0,0,0);
                  return apptDate >= today;
                })
                .sort((a, b) => {
                  const dateA = new Date(a.date);
                  const dateB = new Date(b.date);
                  if (dateA < dateB) return -1;
                  if (dateA > dateB) return 1;
                  // Same date, compare startTime
                  const timeA = (a.startTime || '00:00').padStart(5, '0');
                  const timeB = (b.startTime || '00:00').padStart(5, '0');
                  return timeA.localeCompare(timeB);
                })}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <AppointmentCard appointment={item} onPress={handleAppointmentPress} />
              )}
              scrollEnabled={false}
            />
          ) : (
            <EmptyState
              icon={Calendar}
              title={t.noBookedAppointments || 'No booked appointments'}
              message={t.noBookedMessage || 'You have no booked appointments right now.'}
            />
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.performanceSummary}</Text>
          
          <View style={styles.periodSelector}>
            <TouchableOpacity 
              style={[styles.periodButton, selectedPeriod === 'today' && styles.periodButtonActive]}
              onPress={ () => {
                setSelectedPeriod('today');
              }}
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
                <Text style={styles.performanceValue}>{currentStats.revenue}</Text>
                <Text style={styles.performanceValue}>UZS</Text>
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
    fontWeight: '700',
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
    fontWeight: '600',
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
    fontWeight: '600',
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
    fontWeight: '700',
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
    fontWeight: '600',
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
    fontWeight: '500',
    color: Colors.neutral.gray,
  },
  periodButtonTextActive: {
    color: Colors.neutral.white,
  },
});
