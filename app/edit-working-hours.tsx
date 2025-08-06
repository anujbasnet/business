import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
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

interface DayHours {
  isOpen: boolean;
  openTime: string;
  closeTime: string;
}

type WorkingHours = {
  [key: string]: DayHours;
};

export default function EditWorkingHoursScreen() {
  const { language } = useLanguageStore();
  const { profile, updateProfile } = useBusinessStore();
  const t = translations[language];
  
  const [workingHours, setWorkingHours] = useState<WorkingHours>(profile.workingHours);

  const handleSave = () => {
    updateProfile({ workingHours });
    Alert.alert('Success', 'Working hours updated successfully');
    router.back();
  };

  const updateDayHours = (day: string, field: keyof DayHours, value: boolean | string) => {
    setWorkingHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }));
  };

  const daysOfWeek = [
    { key: 'monday', name: t.monday },
    { key: 'tuesday', name: t.tuesday },
    { key: 'wednesday', name: t.wednesday },
    { key: 'thursday', name: t.thursday },
    { key: 'friday', name: t.friday },
    { key: 'saturday', name: t.saturday },
    { key: 'sunday', name: t.sunday },
  ];

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Edit Working Hours',
          headerRight: () => (
            <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
              <Text style={styles.saveButtonText}>{t.save}</Text>
            </TouchableOpacity>
          ),
        }} 
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.description}>
          Set your business hours for each day of the week. Customers will see these hours on your profile.
        </Text>
        
        <View style={styles.daysContainer}>
          {daysOfWeek.map((day) => {
            const dayHours = workingHours[day.key];
            
            return (
              <View key={day.key} style={styles.dayContainer}>
                <View style={styles.dayHeader}>
                  <Text style={styles.dayName}>{day.name}</Text>
                  <Switch
                    value={dayHours.isOpen}
                    onValueChange={(value) => updateDayHours(day.key, 'isOpen', value)}
                    trackColor={{ false: Colors.neutral.lightGray, true: Colors.primary.main + '40' }}
                    thumbColor={dayHours.isOpen ? Colors.primary.main : Colors.neutral.gray}
                  />
                </View>
                
                {dayHours.isOpen && (
                  <View style={styles.timeInputs}>
                    <View style={styles.timeGroup}>
                      <Text style={styles.timeLabel}>{t.openTime}</Text>
                      <TextInput
                        style={styles.timeInput}
                        value={dayHours.openTime}
                        onChangeText={(time) => updateDayHours(day.key, 'openTime', time)}
                        placeholder="09:00"
                        placeholderTextColor={Colors.neutral.gray}
                      />
                    </View>
                    
                    <View style={styles.timeGroup}>
                      <Text style={styles.timeLabel}>{t.closeTime}</Text>
                      <TextInput
                        style={styles.timeInput}
                        value={dayHours.closeTime}
                        onChangeText={(time) => updateDayHours(day.key, 'closeTime', time)}
                        placeholder="18:00"
                        placeholderTextColor={Colors.neutral.gray}
                      />
                    </View>
                  </View>
                )}
                
                {!dayHours.isOpen && (
                  <Text style={styles.closedText}>{t.closed}</Text>
                )}
              </View>
            );
          })}
        </View>
        
        <View style={styles.tips}>
          <Text style={styles.tipsTitle}>Tips:</Text>
          <Text style={styles.tipText}>• Use 24-hour format (e.g., 09:00, 18:00)</Text>
          <Text style={styles.tipText}>• Toggle the switch to mark days as closed</Text>
          <Text style={styles.tipText}>• Make sure your hours are accurate for customer expectations</Text>
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
  daysContainer: {
    gap: 16,
    marginBottom: 32,
  },
  dayContainer: {
    padding: 16,
    backgroundColor: Colors.neutral.white,
    borderRadius: 8,
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  dayName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.neutral.black,
  },
  timeInputs: {
    flexDirection: 'row',
    gap: 16,
  },
  timeGroup: {
    flex: 1,
    gap: 8,
  },
  timeLabel: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: Colors.neutral.darkGray,
  },
  timeInput: {
    borderWidth: 1,
    borderColor: Colors.neutral.lightGray,
    borderRadius: 6,
    padding: 10,
    fontSize: 16,
    color: Colors.neutral.black,
    textAlign: 'center',
  },
  closedText: {
    fontSize: 14,
    color: Colors.neutral.gray,
    fontStyle: 'italic',
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