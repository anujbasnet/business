import { ImagePlus, Plus, X } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import {
  Alert,
  Image,
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

type EmployeeForm = { name: string; photoUri?: string };

export default function EditEmployeesScreen() {
  const { language } = useLanguageStore();
  const { profile, updateProfile } = useBusinessStore();
  const t = translations[language];
  
  const initialEmployees: EmployeeForm[] = (profile.employees ?? []).map((e) => {
    const parts = (e ?? '').split('|||');
    return { name: parts[0] ?? '', photoUri: parts[1] ?? undefined } as EmployeeForm;
  });

  const [employees, setEmployees] = useState<EmployeeForm[]>(initialEmployees);
  const [newEmployeeName, setNewEmployeeName] = useState<string>('');
  const [newEmployeePhoto, setNewEmployeePhoto] = useState<string | undefined>(undefined);
  const [showAddEmployee, setShowAddEmployee] = useState<boolean>(false);

  const handleSave = () => {
    const payload = employees.map((e) => `${e.name.trim()}${e.photoUri ? `|||${e.photoUri}` : ''}`);
    updateProfile({ employees: payload });
    Alert.alert('Success', 'Employees updated successfully');
    router.back();
  };

  const pickImage = async (onPicked: (uri: string) => void) => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Please allow photo library access to select an image.');
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      if (!result.canceled && result.assets && result.assets[0]?.uri) {
        onPicked(result.assets[0].uri);
      }
    } catch (e) {
      console.log('pickImage error', e);
      Alert.alert('Error', 'Could not pick the image. Please try again.');
    }
  };

  const handleAddEmployee = () => {
    if (newEmployeeName.trim()) {
      setEmployees((prev) => [...prev, { name: newEmployeeName.trim(), photoUri: newEmployeePhoto }]);
      setNewEmployeeName('');
      setNewEmployeePhoto(undefined);
      setShowAddEmployee(false);
    }
  };

  const handleRemoveEmployee = (index: number) => {
    setEmployees(employees.filter((_, i) => i !== index));
  };

  const handleEditPhoto = (index: number) => {
    pickImage((uri) => {
      setEmployees((prev) => prev.map((e, i) => (i === index ? { ...e, photoUri: uri } : e)));
    });
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Edit Employees',
          headerRight: () => (
            <TouchableOpacity accessibilityRole="button" testID="save-employees" onPress={handleSave} style={styles.saveButton}>
              <Text style={styles.saveButtonText}>{t.save}</Text>
            </TouchableOpacity>
          ),
        }} 
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.description}>
          Add your team members and their roles. This helps customers know who they might be working with.
        </Text>
        
        <View style={styles.employeesList}>
          {employees.map((employee, index) => (
            <View key={index} style={styles.employeeItem}>
              <View style={styles.employeeLeft}>
                <TouchableOpacity
                  testID={`employee-${index}-edit-photo`}
                  onPress={() => handleEditPhoto(index)}
                  style={styles.avatarButton}
                >
                  {employee.photoUri ? (
                    <Image source={{ uri: employee.photoUri }} style={styles.avatar} />
                  ) : (
                    <View style={styles.avatarPlaceholder}>
                      <ImagePlus size={18} color={Colors.neutral.gray} />
                    </View>
                  )}
                </TouchableOpacity>
                <TextInput
                  testID={`employee-${index}-name`}
                  style={styles.employeeNameInput}
                  value={employee.name}
                  onChangeText={(txt) => setEmployees((prev) => prev.map((e, i) => (i === index ? { ...e, name: txt } : e)))}
                  placeholder={t.enterEmployeeName}
                  placeholderTextColor={Colors.neutral.gray}
                />
              </View>
              <TouchableOpacity
                accessibilityRole="button"
                testID={`employee-${index}-remove`}
                style={styles.removeButton}
                onPress={() => handleRemoveEmployee(index)}
              >
                <X size={20} color={Colors.neutral.gray} />
              </TouchableOpacity>
            </View>
          ))}
          
          <TouchableOpacity
            testID="add-employee"
            style={styles.addEmployeeButton}
            onPress={() => setShowAddEmployee(true)}
          >
            <Plus size={20} color={Colors.primary.main} />
            <Text style={styles.addEmployeeText}>{t.addEmployee}</Text>
          </TouchableOpacity>
        </View>
        
        {showAddEmployee && (
          <View style={styles.addEmployeeForm}>
            <Text style={styles.formLabel}>Employee Name & Photo</Text>
            <View style={styles.addRow}>
              <TouchableOpacity
                testID="new-employee-pick-photo"
                onPress={() => pickImage((uri) => setNewEmployeePhoto(uri))}
                style={styles.avatarButtonLarge}
              >
                {newEmployeePhoto ? (
                  <Image source={{ uri: newEmployeePhoto }} style={styles.avatarLarge} />
                ) : (
                  <View style={styles.avatarLargePlaceholder}>
                    <ImagePlus size={22} color={Colors.neutral.gray} />
                    <Text style={styles.addPhotoHint}>Add photo</Text>
                  </View>
                )}
              </TouchableOpacity>
              <TextInput
                style={[styles.textInput, { flex: 1 }]}
                value={newEmployeeName}
                onChangeText={setNewEmployeeName}
                placeholder={t.enterEmployeeName}
                placeholderTextColor={Colors.neutral.gray}
              />
            </View>
            <View style={styles.formActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowAddEmployee(false);
                  setNewEmployeeName('');
                  setNewEmployeePhoto(undefined);
                }}
              >
                <Text style={styles.cancelButtonText}>{t.cancel}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                testID="confirm-add-employee"
                style={styles.addButton}
                onPress={handleAddEmployee}
              >
                <Text style={styles.addButtonText}>Add Employee</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const AVATAR_SIZE = 44;

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
  employeesList: {
    gap: 12,
  },
  employeeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: Colors.neutral.white,
    borderRadius: 8,
  },
  employeeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  avatarButton: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    overflow: 'hidden',
    backgroundColor: Colors.neutral.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.neutral.lightGray,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  employeeNameInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.neutral.lightGray,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    color: Colors.neutral.black,
    backgroundColor: Colors.neutral.white,
  },
  removeButton: {
    padding: 4,
  },
  addEmployeeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderWidth: 2,
    borderColor: Colors.primary.main,
    borderStyle: 'dashed',
    borderRadius: 8,
    backgroundColor: Colors.neutral.white,
  },
  addEmployeeText: {
    fontSize: 16,
    color: Colors.primary.main,
    fontWeight: '500' as const,
  },
  addEmployeeForm: {
    marginTop: 24,
    padding: 16,
    backgroundColor: Colors.neutral.white,
    borderRadius: 8,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.neutral.black,
    marginBottom: 8,
  },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  avatarButtonLarge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    overflow: 'hidden',
    backgroundColor: Colors.neutral.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.neutral.lightGray,
  },
  avatarLarge: {
    width: '100%',
    height: '100%',
  },
  avatarLargePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    gap: 4,
  },
  addPhotoHint: {
    fontSize: 10,
    color: Colors.neutral.gray,
  },
  textInput: {
    borderWidth: 1,
    borderColor: Colors.neutral.lightGray,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: Colors.neutral.black,
    marginBottom: 16,
    backgroundColor: Colors.neutral.white,
  },
  formActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.neutral.lightGray,
    borderRadius: 8,
  },
  cancelButtonText: {
    color: Colors.neutral.darkGray,
    fontSize: 14,
    fontWeight: '500' as const,
  },
  addButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: Colors.primary.main,
    borderRadius: 8,
  },
  addButtonText: {
    color: Colors.neutral.white,
    fontSize: 14,
    fontWeight: '600' as const,
  },
});