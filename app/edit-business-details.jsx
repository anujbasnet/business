import React, { useState, useEffect } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Stack } from 'expo-router';
import axios from 'axios';

import Colors from '@/constants/colors';
import { translations } from '@/constants/translations';
import { useLanguageStore } from '@/hooks/useLanguageStore';
import { useBusinessStore } from '@/hooks/useBusinessStore';

export default function EditBusinessDetailsScreen() {
  const { language } = useLanguageStore();
  const { profile, setProfile } = useBusinessStore();
  const t = translations[language];

  const [businessName, setBusinessName] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const businessId = profile.id;

  useEffect(() => {
    // Fetch data from backend
    axios.get(`http://localhost:5000/api/business/${businessId}`)
      .then(res => {
        const data = res.data;
        setBusinessName(data.full_name || '');
        setServiceType(data.service_type || '');
        setAddress(data.address || '');
        setPhone(data.phone_number || '');
        setEmail(data.email || '');
      })
      .catch(err => console.error(err));
  }, []);

  const handleSave = () => {
    axios.put(`http://localhost:5000/api/business/${businessId}`, {
      full_name: businessName,
      service_type: serviceType,
      address,
      phone_number: phone,
      email
    })
    .then(res => {
      Alert.alert('Success', 'Business details updated successfully');
      setProfile(res.data.business); // update local store
    })
    .catch(err => console.error(err));
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Edit Business Details' }} />

      <ScrollView style={styles.content}>
        <View style={styles.form}>
          <Text style={styles.label}>{t.businessName}</Text>
          <TextInput style={styles.input} value={businessName} onChangeText={setBusinessName} />

          <Text style={styles.label}>{t.serviceType}</Text>
          <TextInput style={styles.input} value={serviceType} onChangeText={setServiceType} />

          <Text style={styles.label}>{t.address}</Text>
          <TextInput style={[styles.input, styles.textArea]} value={address} onChangeText={setAddress} multiline />

          <Text style={styles.label}>{t.phone}</Text>
          <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />

          <Text style={styles.label}>{t.email}</Text>
          <TextInput style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" />

          <TouchableOpacity style={styles.button} onPress={handleSave}>
            <Text style={styles.buttonText}>Make Changes</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.neutral.background },
  content: { flex: 1, padding: 16 },
  form: { gap: 16 },
  label: { fontWeight: '600', fontSize: 16, marginBottom: 4 },
  input: { borderWidth: 1, borderColor: Colors.neutral.lightGray, borderRadius: 8, padding: 12 },
  textArea: { height: 100 },
  button: { backgroundColor: Colors.primary, padding: 16, borderRadius: 8, marginTop: 16 },
  buttonText: { color: '#fff', fontWeight: '600', textAlign: 'center' },
});
