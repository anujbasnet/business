import { Plus, X } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Alert,
  Dimensions,
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

const { width } = Dimensions.get('window');

export default function EditCoverPhotosScreen() {
  const { language } = useLanguageStore();
  const { profile, updateProfile } = useBusinessStore();
  const t = translations[language];
  
  const [coverPhotos, setCoverPhotos] = useState<string[]>(profile.coverPhotos || []);
  const [newPhotoUrl, setNewPhotoUrl] = useState<string>('');
  const [showAddPhoto, setShowAddPhoto] = useState<boolean>(false);

  const handleSave = () => {
    updateProfile({ coverPhotos });
    Alert.alert('Success', 'Cover photos updated successfully');
    router.back();
  };

  const handleAddPhoto = () => {
    if (newPhotoUrl.trim() && coverPhotos.length < 5) {
      setCoverPhotos([...coverPhotos, newPhotoUrl.trim()]);
      setNewPhotoUrl('');
      setShowAddPhoto(false);
    }
  };

  const handleRemovePhoto = (index: number) => {
    setCoverPhotos(coverPhotos.filter((_, i) => i !== index));
  };

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Edit Cover Photos',
          headerRight: () => (
            <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
              <Text style={styles.saveButtonText}>{t.save}</Text>
            </TouchableOpacity>
          ),
        }} 
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.description}>
          Add up to 5 cover photos to showcase your business. These photos will be displayed at the top of your profile.
        </Text>
        
        <View style={styles.photosContainer}>
          {coverPhotos.map((photo, index) => (
            <View key={index} style={styles.photoContainer}>
              <Image
                source={{ uri: photo }}
                style={styles.photo}
                resizeMode="cover"
              />
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => handleRemovePhoto(index)}
              >
                <X size={16} color={Colors.neutral.white} />
              </TouchableOpacity>
            </View>
          ))}
          
          {coverPhotos.length < 5 && (
            <TouchableOpacity
              style={styles.addPhotoButton}
              onPress={() => setShowAddPhoto(true)}
            >
              <Plus size={24} color={Colors.primary.main} />
              <Text style={styles.addPhotoText}>{t.addPhoto}</Text>
            </TouchableOpacity>
          )}
        </View>
        
        {showAddPhoto && (
          <View style={styles.addPhotoForm}>
            <Text style={styles.formLabel}>Photo URL</Text>
            <TextInput
              style={styles.textInput}
              value={newPhotoUrl}
              onChangeText={setNewPhotoUrl}
              placeholder="Enter image URL"
              placeholderTextColor={Colors.neutral.gray}
            />
            <View style={styles.formActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowAddPhoto(false);
                  setNewPhotoUrl('');
                }}
              >
                <Text style={styles.cancelButtonText}>{t.cancel}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.addButton}
                onPress={handleAddPhoto}
              >
                <Text style={styles.addButtonText}>Add Photo</Text>
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
  photosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  photoContainer: {
    position: 'relative',
  },
  photo: {
    width: (width - 48) / 2,
    height: 120,
    borderRadius: 8,
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 12,
    padding: 4,
  },
  addPhotoButton: {
    width: (width - 48) / 2,
    height: 120,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.primary.main,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  addPhotoText: {
    fontSize: 12,
    color: Colors.primary.main,
    fontWeight: '500' as const,
  },
  addPhotoForm: {
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