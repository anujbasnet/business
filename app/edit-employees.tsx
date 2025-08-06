import { Plus, X } from 'lucide-react-native';
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

export default function EditEmployeesScreen() {
  const { language } = useLanguageStore();
  const { profile, updateProfile } = useBusinessStore();
  const t = translations[language];
  
  const [employees, setEmployees] = useState<string[]>(profile.employees || []);
  const [newEmployeeName, setNewEmployeeName] = useState<string>('');
  const [showAddEmployee, setShowAddEmployee] = useState<boolean>(false);

  const handleSave = () => {
    updateProfile({ employees });
    Alert.alert('Success', 'Employees updated successfully');
    router.back();
  };

  const handleAddEmployee = () => {
    if (newEmployeeName.trim()) {
      setEmployees([...employees, newEmployeeName.trim()]);
      setNewEmployeeName('');
      setShowAddEmployee(false);
    }
  };

  const handleRemoveEmployee = (index: number) => {
    setEmployees(employees.filter((_, i) => i !== index));
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Edit Employees',
          headerRight: () => (
            <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
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
              <Text style={styles.employeeName}>{employee}</Text>
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => handleRemoveEmployee(index)}
              >
                <X size={20} color={Colors.neutral.gray} />
              </TouchableOpacity>
            </View>
          ))}
          
          <TouchableOpacity
            style={styles.addEmployeeButton}
            onPress={() => setShowAddEmployee(true)}
          >
            <Plus size={20} color={Colors.primary.main} />
            <Text style={styles.addEmployeeText}>{t.addEmployee}</Text>
          </TouchableOpacity>
        </View>
        
        {showAddEmployee && (
          <View style={styles.addEmployeeForm}>
            <Text style={styles.formLabel}>Employee Name & Role</Text>
            <TextInput
              style={styles.textInput}
              value={newEmployeeName}
              onChangeText={setNewEmployeeName}
              placeholder={t.enterEmployeeName}
              placeholderTextColor={Colors.neutral.gray}
            />
            <View style={styles.formActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowAddEmployee(false);
                  setNewEmployeeName('');
                }}
              >
                <Text style={styles.cancelButtonText}>{t.cancel}</Text>
              </TouchableOpacity>
              <TouchableOpacity
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
    padding: 16,
    backgroundColor: Colors.neutral.white,
    borderRadius: 8,
  },
  employeeName: {
    fontSize: 16,
    color: Colors.neutral.black,
    flex: 1,
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
  textInput: {
    borderWidth: 1,
    borderColor: Colors.neutral.lightGray,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: Colors.neutral.black,
    marginBottom: 16,
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