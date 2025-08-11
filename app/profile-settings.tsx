import { Stack } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import Colors from '@/constants/colors';

export default function ProfileSettingsScreen() {
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [bio, setBio] = useState<string>('');
  const [photoUrl, setPhotoUrl] = useState<string>('');

  return (
    <View style={styles.container} testID="profile-settings-screen">
      <Stack.Screen options={{ title: 'Profile Settings' }} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Profile Info</Text>
          <View style={styles.photoRow}>
            <Image source={{ uri: photoUrl || 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop&auto=format' }} style={styles.avatar} />
            <View style={{ flex: 1 }}>
              <TextInput
                placeholder="Photo URL"
                placeholderTextColor={Colors.neutral.gray}
                style={styles.input}
                value={photoUrl}
                onChangeText={setPhotoUrl}
              />
            </View>
          </View>

          <View style={styles.row}>
            <TextInput
              placeholder="First name"
              placeholderTextColor={Colors.neutral.gray}
              style={[styles.input, styles.half]}
              value={firstName}
              onChangeText={setFirstName}
            />
            <TextInput
              placeholder="Last name"
              placeholderTextColor={Colors.neutral.gray}
              style={[styles.input, styles.half]}
              value={lastName}
              onChangeText={setLastName}
            />
          </View>
          <TextInput
            placeholder="Email"
            placeholderTextColor={Colors.neutral.gray}
            keyboardType="email-address"
            style={styles.input}
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            placeholder="Phone number"
            placeholderTextColor={Colors.neutral.gray}
            keyboardType="phone-pad"
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
          />
          <TextInput
            placeholder="Bio"
            placeholderTextColor={Colors.neutral.gray}
            style={[styles.input, styles.multiline]}
            multiline
            numberOfLines={4}
            value={bio}
            onChangeText={setBio}
          />

          <TouchableOpacity
            testID="save-profile-settings"
            style={styles.primaryButton}
            onPress={() => Alert.alert('Saved', 'Profile settings saved')}
          >
            <Text style={styles.primaryButtonText}>Save</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Change Password</Text>
          <TextInput placeholder="Current password" placeholderTextColor={Colors.neutral.gray} secureTextEntry style={styles.input} />
          <TextInput placeholder="New password" placeholderTextColor={Colors.neutral.gray} secureTextEntry style={styles.input} />
          <TextInput placeholder="Confirm new password" placeholderTextColor={Colors.neutral.gray} secureTextEntry style={styles.input} />
          <TouchableOpacity style={styles.secondaryButton} onPress={() => Alert.alert('Updated', 'Password updated')}>
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
  sectionTitle: { fontSize: 18, fontWeight: '700' as const, color: Colors.neutral.black },
  row: { flexDirection: 'row', gap: 12 },
  half: { flex: 1 },
  input: { borderWidth: 1, borderColor: Colors.neutral.lightGray, borderRadius: 8, padding: 12, fontSize: 14, color: Colors.neutral.black },
  multiline: { minHeight: 96, textAlignVertical: 'top' as const },
  primaryButton: { backgroundColor: Colors.primary.main, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  primaryButtonText: { color: Colors.neutral.white, fontSize: 16, fontWeight: '600' as const },
  secondaryButton: { backgroundColor: Colors.neutral.background, paddingVertical: 12, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: Colors.primary.main },
  secondaryButtonText: { color: Colors.primary.main, fontSize: 16, fontWeight: '600' as const },
  photoRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: Colors.neutral.background },
});