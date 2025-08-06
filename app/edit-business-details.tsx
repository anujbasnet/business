import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Stack, router } from 'expo-router';

import Colors from '@/constants/colors';
import { translations } from '@/constants/translations';
import { useBusinessStore } from '@/hooks/useBusinessStore';
import { useLanguageStore } from '@/hooks/useLanguageStore';

export default function EditBusinessDetailsScreen() {
  const { language } = useLanguageStore();
  const { profile, updateProfile } = useBusinessStore();
  const t = translations[language];
  
  const [businessName, setBusinessName] = useState<string>(profile.name || '');
  const [serviceType, setServiceType] = useState<string>(profile.serviceType || profile.businessType || '');
  const [address, setAddress] = useState<string>(profile.address || '');
  const [phone, setPhone] = useState<string>(profile.phone || '');
  const [email, setEmail] = useState<string>(profile.email || '');
  const [bio, setBio] = useState<string>(profile.bio || '');

  const handleSave = () => {
    updateProfile({
      name: businessName,
      serviceType,
      address,
      phone,
      email,
      bio,
    });
    Alert.alert('Success', 'Business details updated successfully');
    router.back();
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Edit Business Details',
          headerRight: () => (
            <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
              <Text style={styles.saveButtonText}>{t.save}</Text>
            </TouchableOpacity>
          ),
        }} 
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>{t.businessName}</Text>
            <TextInput
              style={styles.textInput}
              value={businessName}
              onChangeText={setBusinessName}
              placeholder={t.enterBusinessName}
              placeholderTextColor={Colors.neutral.gray}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>{t.serviceType}</Text>
            <TextInput
              style={styles.textInput}
              value={serviceType}
              onChangeText={setServiceType}
              placeholder={t.enterServiceType}
              placeholderTextColor={Colors.neutral.gray}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>{t.address}</Text>
            <TextInput
              style={styles.textInput}
              value={address}
              onChangeText={setAddress}
              placeholder={t.enterAddress}
              placeholderTextColor={Colors.neutral.gray}
              multiline
              numberOfLines={2}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>{t.phone}</Text>
            <TextInput
              style={styles.textInput}
              value={phone}
              onChangeText={setPhone}
              placeholder={t.enterPhone}
              placeholderTextColor={Colors.neutral.gray}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>{t.email}</Text>
            <TextInput
              style={styles.textInput}
              value={email}
              onChangeText={setEmail}
              placeholder={t.enterEmail}
              placeholderTextColor={Colors.neutral.gray}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>{t.bio}</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={bio}
              onChangeText={setBio}
              placeholder={t.enterBio}
              placeholderTextColor={Colors.neutral.gray}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral.background,
  },
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  saveButtonText: {
    color: Colors.neutral.white,
    fontSize: 16,
    fontWeight: '600' as const,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  form: {
    gap: 20,
  },
  formGroup: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.neutral.black,
  },
  textInput: {
    borderWidth: 1,
    borderColor: Colors.neutral.lightGray,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: Colors.neutral.black,
    backgroundColor: Colors.neutral.white,
  },
  textArea: {
    height: 100,
  },
});