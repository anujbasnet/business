import { Calendar, ChevronDown, Clock, Mail, Phone, Save, User, X } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { Stack } from 'expo-router';

import Colors from '@/constants/colors';
import { useAppointmentsStore } from '@/hooks/useAppointmentsStore';
import { useClientsStore } from '@/hooks/useClientsStore';
import { useServicesStore } from '@/hooks/useServicesStore';
import { Appointment, Client, Service } from '@/types';

export default function NewAppointmentScreen() {
  const { addAppointment } = useAppointmentsStore();
  const { clients } = useClientsStore();
  const { services } = useServicesStore();
  
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [newClientName, setNewClientName] = useState<string>('');
  const [newClientPhone, setNewClientPhone] = useState<string>('');
  const [newClientEmail, setNewClientEmail] = useState<string>('');
  
  const [showClientModal, setShowClientModal] = useState<boolean>(false);
  const [showServiceModal, setShowServiceModal] = useState<boolean>(false);
  const [showDateModal, setShowDateModal] = useState<boolean>(false);
  const [showTimeModal, setShowTimeModal] = useState<boolean>(false);
  const [isNewClient, setIsNewClient] = useState<boolean>(false);
  
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
  
  const generateDateOptions = () => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push({
        value: date.toISOString().split('T')[0],
        label: date.toLocaleDateString('en-US', { 
          weekday: 'short', 
          month: 'short', 
          day: 'numeric' 
        })
      });
    }
    return dates;
  };
  
  const calculateEndTime = (startTime: string, duration: number) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + duration;
    const endHours = Math.floor(totalMinutes / 60);
    const endMinutes = totalMinutes % 60;
    return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
  };
  
  const handleSaveAppointment = () => {
    if (!selectedService || !selectedDate || !selectedTime) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
    
    if (!selectedClient && (!newClientName || !newClientPhone)) {
      Alert.alert('Error', 'Please select a client or add new client details');
      return;
    }
    
    const clientData = selectedClient || {
      id: `client_${Date.now()}`,
      name: newClientName,
      phone: newClientPhone,
      email: newClientEmail,
      createdAt: new Date().toISOString(),
      totalVisits: 0,
    };
    
    const endTime = calculateEndTime(selectedTime, selectedService.duration);
    
    const newAppointment: Appointment = {
      id: `appointment_${Date.now()}`,
      clientId: clientData.id,
      clientName: clientData.name,
      clientPhone: clientData.phone,
      clientEmail: clientData.email,
      serviceId: selectedService.id,
      serviceName: selectedService.name,
      servicePrice: selectedService.price,
      date: selectedDate,
      startTime: selectedTime,
      endTime: endTime,
      status: 'confirmed',
      notes: notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      bookingSource: 'direct',
    };
    
    addAppointment(newAppointment);
    Alert.alert('Success', 'Appointment created successfully', [
      { text: 'OK', onPress: () => router.back() }
    ]);
  };
  
  const renderClientModal = () => (
    <Modal
      visible={showClientModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowClientModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Client</Text>
            <TouchableOpacity onPress={() => setShowClientModal(false)}>
              <X size={24} color={Colors.neutral.gray} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.clientTypeToggle}>
            <TouchableOpacity
              style={[styles.toggleButton, !isNewClient && styles.activeToggle]}
              onPress={() => setIsNewClient(false)}
            >
              <Text style={[styles.toggleText, !isNewClient && styles.activeToggleText]}>Existing Client</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleButton, isNewClient && styles.activeToggle]}
              onPress={() => setIsNewClient(true)}
            >
              <Text style={[styles.toggleText, isNewClient && styles.activeToggleText]}>New Client</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalScrollView}>
            {!isNewClient ? (
              clients.map((client) => (
                <TouchableOpacity
                  key={client.id}
                  style={[styles.clientOption, selectedClient?.id === client.id && styles.selectedOption]}
                  onPress={() => {
                    setSelectedClient(client);
                    setShowClientModal(false);
                  }}
                >
                  <Text style={styles.clientName}>{client.name}</Text>
                  <Text style={styles.clientPhone}>{client.phone}</Text>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.newClientForm}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Name *</Text>
                  <TextInput
                    style={styles.textInput}
                    value={newClientName}
                    onChangeText={setNewClientName}
                    placeholder="Enter client name"
                    placeholderTextColor={Colors.neutral.gray}
                  />
                </View>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Phone *</Text>
                  <TextInput
                    style={styles.textInput}
                    value={newClientPhone}
                    onChangeText={setNewClientPhone}
                    placeholder="Enter phone number"
                    placeholderTextColor={Colors.neutral.gray}
                    keyboardType="phone-pad"
                  />
                </View>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Email</Text>
                  <TextInput
                    style={styles.textInput}
                    value={newClientEmail}
                    onChangeText={setNewClientEmail}
                    placeholder="Enter email address"
                    placeholderTextColor={Colors.neutral.gray}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
                
                <TouchableOpacity
                  style={styles.saveClientButton}
                  onPress={() => {
                    if (newClientName && newClientPhone) {
                      setSelectedClient({
                        id: `temp_${Date.now()}`,
                        name: newClientName,
                        phone: newClientPhone,
                        email: newClientEmail,
                        createdAt: new Date().toISOString(),
                        totalVisits: 0,
                      });
                      setShowClientModal(false);
                    } else {
                      Alert.alert('Error', 'Please fill in required fields');
                    }
                  }}
                >
                  <Text style={styles.saveClientButtonText}>Save Client</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
  
  const renderServiceModal = () => (
    <Modal
      visible={showServiceModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowServiceModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Service</Text>
            <TouchableOpacity onPress={() => setShowServiceModal(false)}>
              <X size={24} color={Colors.neutral.gray} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalScrollView}>
            {services.map((service) => (
              <TouchableOpacity
                key={service.id}
                style={[styles.serviceOption, selectedService?.id === service.id && styles.selectedOption]}
                onPress={() => {
                  setSelectedService(service);
                  setShowServiceModal(false);
                }}
              >
                <View style={styles.serviceInfo}>
                  <Text style={styles.serviceName}>{service.name}</Text>
                  <Text style={styles.serviceDetails}>
                    {service.duration} min • ${service.price}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
  
  const renderDateModal = () => (
    <Modal
      visible={showDateModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowDateModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Date</Text>
            <TouchableOpacity onPress={() => setShowDateModal(false)}>
              <X size={24} color={Colors.neutral.gray} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalScrollView}>
            {generateDateOptions().map((date) => (
              <TouchableOpacity
                key={date.value}
                style={[styles.dateOption, selectedDate === date.value && styles.selectedOption]}
                onPress={() => {
                  setSelectedDate(date.value);
                  setShowDateModal(false);
                }}
              >
                <Text style={styles.dateText}>{date.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
  
  const renderTimeModal = () => (
    <Modal
      visible={showTimeModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowTimeModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Time</Text>
            <TouchableOpacity onPress={() => setShowTimeModal(false)}>
              <X size={24} color={Colors.neutral.gray} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalScrollView}>
            <View style={styles.timeGrid}>
              {generateTimeSlots().map((time) => (
                <TouchableOpacity
                  key={time}
                  style={[styles.timeOption, selectedTime === time && styles.selectedTimeOption]}
                  onPress={() => {
                    setSelectedTime(time);
                    setShowTimeModal(false);
                  }}
                >
                  <Text style={[styles.timeText, selectedTime === time && styles.selectedTimeText]}>
                    {time}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
  
  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'New Appointment',
          headerStyle: { backgroundColor: Colors.neutral.white },
          headerTintColor: Colors.primary.main,
        }} 
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Client Information</Text>
          
          <TouchableOpacity
            style={styles.selectButton}
            onPress={() => setShowClientModal(true)}
          >
            <User size={20} color={Colors.primary.main} />
            <View style={styles.selectButtonContent}>
              <Text style={styles.selectButtonLabel}>Client</Text>
              <Text style={styles.selectButtonValue}>
                {selectedClient ? selectedClient.name : 'Select client'}
              </Text>
            </View>
            <ChevronDown size={20} color={Colors.neutral.gray} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Service Details</Text>
          
          <TouchableOpacity
            style={styles.selectButton}
            onPress={() => setShowServiceModal(true)}
          >
            <View style={[styles.iconContainer, { backgroundColor: Colors.secondary.main + '20' }]}>
              <Text style={styles.serviceIcon}>✂️</Text>
            </View>
            <View style={styles.selectButtonContent}>
              <Text style={styles.selectButtonLabel}>Service</Text>
              <Text style={styles.selectButtonValue}>
                {selectedService ? selectedService.name : 'Select service'}
              </Text>
              {selectedService && (
                <Text style={styles.serviceSubtext}>
                  {selectedService.duration} min • ${selectedService.price}
                </Text>
              )}
            </View>
            <ChevronDown size={20} color={Colors.neutral.gray} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Date & Time</Text>
          
          <TouchableOpacity
            style={styles.selectButton}
            onPress={() => setShowDateModal(true)}
          >
            <Calendar size={20} color={Colors.primary.main} />
            <View style={styles.selectButtonContent}>
              <Text style={styles.selectButtonLabel}>Date</Text>
              <Text style={styles.selectButtonValue}>
                {selectedDate ? new Date(selectedDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) : 'Select date'}
              </Text>
            </View>
            <ChevronDown size={20} color={Colors.neutral.gray} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.selectButton}
            onPress={() => setShowTimeModal(true)}
          >
            <Clock size={20} color={Colors.primary.main} />
            <View style={styles.selectButtonContent}>
              <Text style={styles.selectButtonLabel}>Time</Text>
              <Text style={styles.selectButtonValue}>
                {selectedTime ? `${selectedTime}${selectedService ? ` - ${calculateEndTime(selectedTime, selectedService.duration)}` : ''}` : 'Select time'}
              </Text>
            </View>
            <ChevronDown size={20} color={Colors.neutral.gray} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Notes</Text>
          
          <TextInput
            style={styles.notesInput}
            value={notes}
            onChangeText={setNotes}
            placeholder="Add any special notes or requests..."
            placeholderTextColor={Colors.neutral.gray}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>
        
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSaveAppointment}
        >
          <Save size={20} color={Colors.neutral.white} />
          <Text style={styles.saveButtonText}>Create Appointment</Text>
        </TouchableOpacity>
      </ScrollView>
      
      {renderClientModal()}
      {renderServiceModal()}
      {renderDateModal()}
      {renderTimeModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral.background,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.neutral.black,
    marginBottom: 16,
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.neutral.background,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.neutral.lightGray,
  },
  selectButtonContent: {
    flex: 1,
    marginLeft: 12,
  },
  selectButtonLabel: {
    fontSize: 12,
    color: Colors.neutral.gray,
    marginBottom: 2,
  },
  selectButtonValue: {
    fontSize: 16,
    color: Colors.neutral.black,
    fontWeight: '500' as const,
  },
  serviceSubtext: {
    fontSize: 12,
    color: Colors.primary.main,
    marginTop: 2,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceIcon: {
    fontSize: 20,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: Colors.neutral.lightGray,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: Colors.neutral.black,
    backgroundColor: Colors.neutral.background,
    minHeight: 100,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary.main,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 32,
    gap: 8,
  },
  saveButtonText: {
    color: Colors.neutral.white,
    fontSize: 16,
    fontWeight: '600' as const,
  },
  
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.neutral.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingTop: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.lightGray,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.neutral.black,
  },
  modalScrollView: {
    paddingHorizontal: 20,
  },
  
  // Client modal
  clientTypeToggle: {
    flexDirection: 'row',
    backgroundColor: Colors.neutral.background,
    borderRadius: 8,
    padding: 4,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeToggle: {
    backgroundColor: Colors.primary.main,
  },
  toggleText: {
    fontSize: 14,
    color: Colors.neutral.gray,
    fontWeight: '500' as const,
  },
  activeToggleText: {
    color: Colors.neutral.white,
  },
  clientOption: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.lightGray,
  },
  selectedOption: {
    backgroundColor: Colors.primary.main + '10',
  },
  clientName: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: Colors.neutral.black,
    marginBottom: 4,
  },
  clientPhone: {
    fontSize: 14,
    color: Colors.neutral.gray,
  },
  newClientForm: {
    paddingVertical: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: Colors.neutral.black,
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: Colors.neutral.lightGray,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: Colors.neutral.black,
    backgroundColor: Colors.neutral.background,
  },
  saveClientButton: {
    backgroundColor: Colors.primary.main,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  saveClientButtonText: {
    color: Colors.neutral.white,
    fontSize: 16,
    fontWeight: '600' as const,
  },
  
  // Service modal
  serviceOption: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.lightGray,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '500' as const,
    color: Colors.neutral.black,
    marginBottom: 4,
  },
  serviceDetails: {
    fontSize: 14,
    color: Colors.primary.main,
  },
  
  // Date modal
  dateOption: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.lightGray,
  },
  dateText: {
    fontSize: 16,
    color: Colors.neutral.black,
  },
  
  // Time modal
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingVertical: 20,
    gap: 8,
  },
  timeOption: {
    width: '30%',
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: Colors.neutral.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.neutral.lightGray,
  },
  selectedTimeOption: {
    backgroundColor: Colors.primary.main,
    borderColor: Colors.primary.main,
  },
  timeText: {
    fontSize: 14,
    color: Colors.neutral.black,
  },
  selectedTimeText: {
    color: Colors.neutral.white,
    fontWeight: '500' as const,
  },
});