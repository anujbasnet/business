import { Building, Check, Clock, Globe, Mail, MapPin, Phone, Save, User } from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Switch } from 'react-native';

import Colors from '@/constants/colors';
import { translations } from '@/constants/translations';
import { useBusinessStore } from '@/hooks/useBusinessStore';
import { Language, useLanguageStore } from '@/hooks/useLanguageStore';

export default function SettingsScreen() {
  const { language, setLanguage } = useLanguageStore();
  const { profile, updateProfile } = useBusinessStore();
  const t = translations[language];

  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState(profile);

  const languages: { code: Language; name: string }[] = [
    { code: 'en', name: t.english },
    { code: 'ru', name: t.russian },
    { code: 'uz', name: t.uzbek },
  ];

  const daysOfWeek = [
    { key: 'monday', name: t.monday },
    { key: 'tuesday', name: t.tuesday },
    { key: 'wednesday', name: t.wednesday },
    { key: 'thursday', name: t.thursday },
    { key: 'friday', name: t.friday },
    { key: 'saturday', name: t.saturday },
    { key: 'sunday', name: t.sunday },
  ];

  const handleLanguageChange = (languageCode: Language) => {
    setLanguage(languageCode);
  };

  const handleSaveProfile = () => {
    updateProfile(profileForm);
    setEditingProfile(false);
    Alert.alert('Success', t.profileUpdated);
  };

  const handleCancelEdit = () => {
    setProfileForm(profile);
    setEditingProfile(false);
  };

  const updateWorkingHours = (day: string, field: string, value: string | boolean) => {
    setProfileForm(prev => ({
      ...prev,
      workingHours: {
        ...prev.workingHours,
        [day]: {
          ...prev.workingHours[day],
          [field]: value,
        },
      },
    }));
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Profile Settings Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <User size={24} color={Colors.primary.main} />
          <Text style={styles.sectionTitle}>{t.profileSettings}</Text>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => editingProfile ? handleSaveProfile() : setEditingProfile(true)}
          >
            {editingProfile ? (
              <Save size={20} color={Colors.secondary.main} />
            ) : (
              <Text style={styles.editButtonText}>{t.edit}</Text>
            )}
          </TouchableOpacity>
        </View>

        {editingProfile && (
          <TouchableOpacity style={styles.cancelButton} onPress={handleCancelEdit}>
            <Text style={styles.cancelButtonText}>{t.cancel}</Text>
          </TouchableOpacity>
        )}

        <View style={styles.formSection}>
          <Text style={styles.formSectionTitle}>{t.businessInfo}</Text>
          
          <View style={styles.inputGroup}>
            <Building size={20} color={Colors.primary.main} />
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>{t.businessName}</Text>
              <TextInput
                style={[styles.input, !editingProfile && styles.disabledInput]}
                value={profileForm.name}
                onChangeText={(text) => setProfileForm(prev => ({ ...prev, name: text }))}
                placeholder={t.enterBusinessName}
                editable={editingProfile}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <MapPin size={20} color={Colors.primary.main} />
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>{t.address}</Text>
              <TextInput
                style={[styles.input, !editingProfile && styles.disabledInput]}
                value={profileForm.address}
                onChangeText={(text) => setProfileForm(prev => ({ ...prev, address: text }))}
                placeholder={t.enterAddress}
                editable={editingProfile}
                multiline
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Phone size={20} color={Colors.primary.main} />
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>{t.phone}</Text>
              <TextInput
                style={[styles.input, !editingProfile && styles.disabledInput]}
                value={profileForm.phone}
                onChangeText={(text) => setProfileForm(prev => ({ ...prev, phone: text }))}
                placeholder={t.enterPhone}
                editable={editingProfile}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Mail size={20} color={Colors.primary.main} />
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>{t.email}</Text>
              <TextInput
                style={[styles.input, !editingProfile && styles.disabledInput]}
                value={profileForm.email}
                onChangeText={(text) => setProfileForm(prev => ({ ...prev, email: text }))}
                placeholder={t.enterEmail}
                editable={editingProfile}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{t.bio}</Text>
            <TextInput
              style={[styles.textArea, !editingProfile && styles.disabledInput]}
              value={profileForm.bio}
              onChangeText={(text) => setProfileForm(prev => ({ ...prev, bio: text }))}
              placeholder={t.enterBio}
              editable={editingProfile}
              multiline
              numberOfLines={4}
            />
          </View>
        </View>

        <View style={styles.formSection}>
          <View style={styles.workingHoursHeader}>
            <Clock size={20} color={Colors.primary.main} />
            <Text style={styles.formSectionTitle}>{t.workingHours}</Text>
          </View>
          
          {daysOfWeek.map((day) => (
            <View key={day.key} style={styles.dayRow}>
              <Text style={styles.dayName}>{day.name}</Text>
              <View style={styles.dayControls}>
                <Switch
                  value={profileForm.workingHours[day.key]?.isOpen || false}
                  onValueChange={(value) => updateWorkingHours(day.key, 'isOpen', value)}
                  trackColor={{ false: Colors.neutral.lightGray, true: Colors.primary.light }}
                  thumbColor={profileForm.workingHours[day.key]?.isOpen ? Colors.primary.main : Colors.neutral.gray}
                  disabled={!editingProfile}
                />
                
                {profileForm.workingHours[day.key]?.isOpen ? (
                  <View style={styles.timeInputs}>
                    <TextInput
                      style={[styles.timeInput, !editingProfile && styles.disabledInput]}
                      value={profileForm.workingHours[day.key]?.openTime || ''}
                      onChangeText={(text) => updateWorkingHours(day.key, 'openTime', text)}
                      placeholder="09:00"
                      editable={editingProfile}
                    />
                    <Text style={styles.timeSeparator}>-</Text>
                    <TextInput
                      style={[styles.timeInput, !editingProfile && styles.disabledInput]}
                      value={profileForm.workingHours[day.key]?.closeTime || ''}
                      onChangeText={(text) => updateWorkingHours(day.key, 'closeTime', text)}
                      placeholder="18:00"
                      editable={editingProfile}
                    />
                  </View>
                ) : (
                  <Text style={styles.closedText}>{t.closed}</Text>
                )}
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Language Settings Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Globe size={24} color={Colors.primary.main} />
          <Text style={styles.sectionTitle}>{t.language}</Text>
        </View>
        
        <View style={styles.languageOptions}>
          {languages.map((lang) => (
            <TouchableOpacity
              key={lang.code}
              style={[
                styles.languageOption,
                language === lang.code && styles.selectedLanguageOption,
              ]}
              onPress={() => handleLanguageChange(lang.code)}
            >
              <Text
                style={[
                  styles.languageText,
                  language === lang.code && styles.selectedLanguageText,
                ]}
              >
                {lang.name}
              </Text>
              {language === lang.code && (
                <Check size={20} color={Colors.primary.main} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
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
  section: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: Colors.neutral.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.primary.main,
    marginLeft: 12,
    flex: 1,
  },
  editButton: {
    padding: 8,
  },
  editButtonText: {
    color: Colors.secondary.main,
    fontWeight: '500' as const,
  },
  cancelButton: {
    alignSelf: 'flex-end',
    marginBottom: 16,
  },
  cancelButtonText: {
    color: Colors.status.error,
    fontWeight: '500' as const,
  },
  formSection: {
    marginBottom: 24,
  },
  formSectionTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.primary.main,
    marginBottom: 16,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  inputContainer: {
    flex: 1,
    marginLeft: 12,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: Colors.neutral.darkGray,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.neutral.lightGray,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: Colors.neutral.black,
    backgroundColor: Colors.neutral.white,
  },
  disabledInput: {
    backgroundColor: Colors.neutral.background,
    color: Colors.neutral.darkGray,
  },
  textArea: {
    borderWidth: 1,
    borderColor: Colors.neutral.lightGray,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: Colors.neutral.black,
    backgroundColor: Colors.neutral.white,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  workingHoursHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.lightGray,
  },
  dayName: {
    fontSize: 16,
    color: Colors.neutral.black,
    width: 100,
  },
  dayControls: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
  },
  timeInputs: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
  },
  timeInput: {
    borderWidth: 1,
    borderColor: Colors.neutral.lightGray,
    borderRadius: 6,
    padding: 8,
    fontSize: 14,
    width: 60,
    textAlign: 'center',
  },
  timeSeparator: {
    marginHorizontal: 8,
    color: Colors.neutral.darkGray,
  },
  closedText: {
    color: Colors.neutral.gray,
    fontStyle: 'italic',
    marginLeft: 16,
  },
  languageOptions: {
    gap: 8,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 8,
    backgroundColor: Colors.neutral.background,
  },
  selectedLanguageOption: {
    backgroundColor: Colors.primary.main + '10',
    borderWidth: 1,
    borderColor: Colors.primary.main,
  },
  languageText: {
    fontSize: 16,
    color: Colors.neutral.darkGray,
  },
  selectedLanguageText: {
    color: Colors.primary.main,
    fontWeight: '500' as const,
  },
});