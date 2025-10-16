import { router, Stack } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import Colors from '@/constants/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProfileSettingsScreen() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [Email, setEmail] = useState('');
  const BASE_URL = process.env.EXPO_PUBLIC_SERVER_IP;
  const API_URL = `https://${BASE_URL}/api/auth/business`;
  const handleChangePassword = async () => {
    if (!Email || !currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill all fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match.');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: Email, currentPassword, newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Success', 'Password updated.');
        setEmail('');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        await AsyncStorage.removeItem('BusinessToken');
        router.replace('/login');
      } else {
        Alert.alert('Error', data.message || 'Failed to update password.');
      }
    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
  };

  return (
    <View style={styles.container} testID="profile-settings-screen">
      <Stack.Screen options={{ title: 'Profile Settings' }} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Change Password</Text>
          <TextInput
          placeholder='Email'
            placeholderTextColor={Colors.neutral.gray}
            style={styles.input}
            value={Email}
            onChangeText={setEmail}
          />
          <TextInput
            placeholder="Current password"
            placeholderTextColor={Colors.neutral.gray}
            secureTextEntry
            style={styles.input}
            value={currentPassword}
            onChangeText={setCurrentPassword}
          />
          <TextInput
            placeholder="New password"
            placeholderTextColor={Colors.neutral.gray}
            secureTextEntry
            style={styles.input}
            value={newPassword}
            onChangeText={setNewPassword}
          />
          <TextInput
            placeholder="Confirm new password"
            placeholderTextColor={Colors.neutral.gray}
            secureTextEntry
            style={styles.input}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
          <TouchableOpacity style={styles.secondaryButton} onPress={handleChangePassword}>
            <Text style={styles.secondaryButtonText}>Update Password</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.neutral.background },
  content: { padding: 16, gap: 12 },
  card: { backgroundColor: Colors.neutral.white, borderRadius: 12, padding: 16, gap: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: Colors.neutral.black },
  input: {
    borderWidth: 1,
    borderColor: Colors.neutral.lightGray,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: Colors.neutral.black,
  },
  secondaryButton: {
    backgroundColor: Colors.neutral.background,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.primary.main,
  },
  secondaryButtonText: {
    color: Colors.primary.main,
    fontSize: 16,
    fontWeight: '600',
  },
});
