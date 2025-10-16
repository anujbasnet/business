import { ImagePlus, Plus, X } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import React, { useState, useEffect } from 'react';
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchStaff, addStaff, updateStaff, deleteStaff, type StaffMember } from '../services/staff';

type EmployeeForm = { id?: string; name: string; photoUri?: string; title?: string };

export default function EditEmployeesScreen() {
  const { language } = useLanguageStore();
  const { profile } = useBusinessStore();
  const t = translations[language];
  
  // Normalize employees that may be stored as:
  // 1. Simple string: "John Smith - Barber"
  // 2. Encoded string: "John Smith|||https://.../photo.jpg"
  // 3. Object with varying key names (name/full_name/title + avatarUrl/photo/image)
  // 4. Any other primitive -> coerced to string
  const [employees, setEmployees] = useState<EmployeeForm[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newEmployeeName, setNewEmployeeName] = useState<string>('');
  const [newEmployeePhoto, setNewEmployeePhoto] = useState<string | undefined>(undefined);
  const [newEmployeeTitle, setNewEmployeeTitle] = useState<string>('');
  const [showAddEmployee, setShowAddEmployee] = useState<boolean>(false);
  const [brokenPhotos, setBrokenPhotos] = useState<Record<string, boolean>>({});

  // Sanitize & normalize avatar values coming from backend or user edits
  const sanitizeBase64 = (b64: string) => b64.replace(/\s+/g, '');
  const normalizeAvatar = (raw?: string): string | undefined => {
    if (!raw) return undefined;
    const val = raw.trim();
    if (val.toLowerCase().startsWith('data:image/')) return val; // proper data URL
    if (!val.startsWith('http') && /^[A-Za-z0-9+/=\r\n]+$/.test(val) && val.length > 100) {
      return `data:image/png;base64,${sanitizeBase64(val)}`;
    }
    if (/^image\//.test(val)) { // e.g. image/png;base64,XXXX
      return `data:${val}`;
    }
    if (val.startsWith('/')) { // relative path
      const apiBase = `https://${process.env.EXPO_PUBLIC_SERVER_IP}`; // replace with your actual base URL or env variable
      return apiBase.replace(/\/$/, '') + val;
    }
    return val; // assume already absolute URL
  };

  const businessId = profile.id;

  useEffect(() => {
    const load = async () => {
      if (!businessId) return;
      setLoading(true);
      setError(null);
      try {
  const staff = await fetchStaff(businessId);
  setEmployees(staff.map(s => ({ id: s.id, name: s.name, photoUri: normalizeAvatar((s as any).avatarUrl || (s as any).avatar || (s as any).photo || (s as any).image), title: s.title })));
  setBrokenPhotos({});
      } catch (e: any) {
        setError(e?.response?.data?.message || e.message || 'Failed to load staff');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [businessId]);

  const handleSave = () => {
    Alert.alert('Saved', 'Changes already persisted.');
    router.back();
  };

  // Pick an image, compress (optional), and convert to base64 data URL so that
  // the avatar is visible on the web (web cannot access device file:// URIs).
  const pickImage = async (onPicked: (dataUrl: string) => void) => {
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
        const asset = result.assets[0];
        try {
          // Read file as base64
          const base64 = await FileSystem.readAsStringAsync(asset.uri, { encoding: 'base64' as any });
          const mime = asset.mimeType || 'image/jpeg';
          const dataUrl = `data:${mime};base64,${base64}`;
          onPicked(dataUrl);
        } catch (convErr) {
          console.warn('Failed to convert image to base64, falling back to URI', convErr);
          onPicked(asset.uri); // fallback (won't show on web)
        }
      }
    } catch (e) {
      console.log('pickImage error', e);
      Alert.alert('Error', 'Could not pick the image. Please try again.');
    }
  };

  const handleAddEmployee = async () => {
    if (!businessId) return;
    if (!newEmployeeName.trim() || !newEmployeeTitle.trim()) {
      Alert.alert('Required', 'Name and title are required');
      return;
    }
    setSaving(true);
    try {
          const created = await addStaff(businessId, { name: newEmployeeName.trim(), title: newEmployeeTitle.trim(), avatarUrl: newEmployeePhoto });
          setEmployees(prev => [...prev, { id: created.id, name: created.name, title: created.title, photoUri: normalizeAvatar((created as any).avatarUrl || (created as any).avatar) }]);
      setNewEmployeeName('');
      setNewEmployeeTitle('');
      setNewEmployeePhoto(undefined);
      setShowAddEmployee(false);
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message || 'Failed to add employee');
    } finally { setSaving(false); }
  };

  const handleRemoveEmployee = async (index: number) => {
    const emp = employees[index];
    setEmployees(prev => prev.filter((_, i) => i !== index));
    if (businessId && emp?.id) {
      try { await deleteStaff(businessId, emp.id); } catch {}
    }
  };

  const handleEditPhoto = (index: number) => {
    pickImage(async (dataUrl) => {
      setEmployees(prev => {
        const updated = prev.map((e,i)=> i===index ? { ...e, photoUri: dataUrl } : e);
        const emp = updated[index];
        if (businessId && emp?.id) {
          updateStaff(businessId, emp.id, { name: emp.name?.trim(), title: emp.title?.trim(), avatarUrl: dataUrl }).catch(()=>{});
        }
        return updated;
      });
    });
  };
  const handleEditName = (index: number, name: string) => {
    setEmployees(prev => {
      const updated = prev.map((e,i)=> i===index ? { ...e, name } : e);
      const emp = updated[index];
      if (businessId && emp?.id) {
        updateStaff(businessId, emp.id, { name: emp.name?.trim(), title: emp.title?.trim(), avatarUrl: emp.photoUri }).catch(()=>{});
      }
      return updated;
    });
  };
  const handleEditTitle = (index: number, title: string) => {
    setEmployees(prev => {
      const updated = prev.map((e,i)=> i===index ? { ...e, title } : e);
      const emp = updated[index];
      if (businessId && emp?.id) {
        updateStaff(businessId, emp.id, { name: emp.name?.trim(), title: emp.title?.trim(), avatarUrl: emp.photoUri }).catch(()=>{});
      }
      return updated;
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
          {loading && <Text style={{ marginBottom: 12 }}>Loading...</Text>}
          {error && <Text style={{ marginBottom: 12, color:'red' }}>{error}</Text>}
          {employees.map((employee, index) => (
            <View key={index} style={styles.employeeItem}>
              <View style={styles.employeeLeft}>
                <TouchableOpacity
                  testID={`employee-${index}-edit-photo`}
                  onPress={() => handleEditPhoto(index)}
                  style={styles.avatarButton}
                >
                  {(!brokenPhotos[employee.id || index]) && employee.photoUri ? (
                    <Image
                      source={{ uri: employee.photoUri }}
                      style={styles.avatar}
                      resizeMode="cover"
                      onError={() => setBrokenPhotos(prev => ({ ...prev, [employee.id || index]: true }))}
                    />
                  ) : (
                    <View style={styles.avatarPlaceholder}>
                      <ImagePlus size={18} color={Colors.neutral.gray} />
                    </View>
                  )}
                </TouchableOpacity>
                <View style={{ flex:1, gap:8 }}>
                  <TextInput
                    testID={`employee-${index}-name`}
                    style={styles.employeeNameInput}
                    value={employee.name}
                    onChangeText={(txt) => handleEditName(index, txt)}
                    placeholder={t.enterEmployeeName}
                    placeholderTextColor={Colors.neutral.gray}
                  />
                  <TextInput
                    testID={`employee-${index}-title`}
                    style={styles.employeeNameInput}
                    value={employee.title || ''}
                    onChangeText={(txt) => handleEditTitle(index, txt)}
                    placeholder={'Enter title'}
                    placeholderTextColor={Colors.neutral.gray}
                  />
                </View>
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
            <Text style={styles.formLabel}>Employee Name, Title & Photo</Text>
            <View style={styles.addRow}>
              <TouchableOpacity
                testID="new-employee-pick-photo"
                onPress={() => pickImage((dataUrl) => setNewEmployeePhoto(dataUrl))}
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
              <View style={{ flex:1, gap:8 }}>
                <TextInput
                  style={[styles.textInput]}
                  value={newEmployeeName}
                  onChangeText={setNewEmployeeName}
                  placeholder={t.enterEmployeeName}
                  placeholderTextColor={Colors.neutral.gray}
                />
                <TextInput
                  style={[styles.textInput]}
                  value={newEmployeeTitle}
                  onChangeText={setNewEmployeeTitle}
                  placeholder={'Enter title'}
                  placeholderTextColor={Colors.neutral.gray}
                />
              </View>
            </View>
            <View style={styles.formActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowAddEmployee(false);
                  setNewEmployeeName('');
                  setNewEmployeeTitle('');
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
                <Text style={styles.addButtonText}>{saving ? 'Saving...' : 'Add Employee'}</Text>
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