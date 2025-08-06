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

export default function EditSocialMediaScreen() {
  const { language } = useLanguageStore();
  const { profile, updateProfile } = useBusinessStore();
  const t = translations[language];
  
  const [socialMedia, setSocialMedia] = useState({
    instagram: profile.socialMedia?.instagram || '',
    telegram: profile.socialMedia?.telegram || '',
    tiktok: profile.socialMedia?.tiktok || '',
    facebook: profile.socialMedia?.facebook || '',
    youtube: profile.socialMedia?.youtube || '',
  });

  const handleSave = () => {
    updateProfile({ socialMedia });
    Alert.alert('Success', 'Social media links updated successfully');
    router.back();
  };

  const updateSocialMedia = (platform: string, url: string) => {
    setSocialMedia(prev => ({
      ...prev,
      [platform]: url,
    }));
  };

  const socialPlatforms = [
    { key: 'instagram', name: 'Instagram', placeholder: 'https://instagram.com/yourbusiness' },
    { key: 'telegram', name: 'Telegram', placeholder: 'https://t.me/yourbusiness' },
    { key: 'tiktok', name: 'TikTok', placeholder: 'https://tiktok.com/@yourbusiness' },
    { key: 'facebook', name: 'Facebook', placeholder: 'https://facebook.com/yourbusiness' },
    { key: 'youtube', name: 'YouTube', placeholder: 'https://youtube.com/@yourbusiness' },
  ];

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Edit Social Media',
          headerRight: () => (
            <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
              <Text style={styles.saveButtonText}>{t.save}</Text>
            </TouchableOpacity>
          ),
        }} 
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.description}>
          Add your social media links to help customers connect with you on different platforms. Only platforms with links will be displayed on your profile.
        </Text>
        
        <View style={styles.form}>
          {socialPlatforms.map((platform) => (
            <View key={platform.key} style={styles.formGroup}>
              <Text style={styles.label}>{platform.name}</Text>
              <TextInput
                style={styles.textInput}
                value={socialMedia[platform.key as keyof typeof socialMedia]}
                onChangeText={(url) => updateSocialMedia(platform.key, url)}
                placeholder={platform.placeholder}
                placeholderTextColor={Colors.neutral.gray}
                keyboardType="url"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          ))}
        </View>
        
        <View style={styles.tips}>
          <Text style={styles.tipsTitle}>Tips:</Text>
          <Text style={styles.tipText}>• Make sure to include the full URL (starting with https://)</Text>
          <Text style={styles.tipText}>• Only platforms with valid links will appear on your profile</Text>
          <Text style={styles.tipText}>• Keep your social media profiles active and professional</Text>
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
  description: {
    fontSize: 14,
    color: Colors.neutral.darkGray,
    marginBottom: 24,
    lineHeight: 20,
  },
  form: {
    gap: 20,
    marginBottom: 32,
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
  tips: {
    padding: 16,
    backgroundColor: Colors.primary.main + '10',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary.main,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.primary.main,
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    color: Colors.neutral.darkGray,
    marginBottom: 4,
    lineHeight: 18,
  },
});