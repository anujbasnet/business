import { 
  Building, 
  ChevronDown, 
  ChevronRight, 
  Clock, 
  Edit, 
  Mail, 
  MapPin, 
  Phone, 
  Plus, 
  Users 
} from 'lucide-react-native';
import React, { useState } from 'react';
import { 
  Alert, 
  Dimensions, 
  Image, 
  Linking, 
  ScrollView, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  View 
} from 'react-native';

import Colors from '@/constants/colors';
import { translations } from '@/constants/translations';
import { useBusinessStore } from '@/hooks/useBusinessStore';
import { useLanguageStore } from '@/hooks/useLanguageStore';

const { width } = Dimensions.get('window');

export default function ProfileScreen() {
  const { language } = useLanguageStore();
  const { profile } = useBusinessStore();
  const t = translations[language];
  
  const [showFullWeek, setShowFullWeek] = useState<boolean>(false);

  const daysOfWeek = [
    { key: 'monday', name: t.monday },
    { key: 'tuesday', name: t.tuesday },
    { key: 'wednesday', name: t.wednesday },
    { key: 'thursday', name: t.thursday },
    { key: 'friday', name: t.friday },
    { key: 'saturday', name: t.saturday },
    { key: 'sunday', name: t.sunday },
  ];

  const today = new Date().getDay();
  const todayKey = daysOfWeek[(today === 0 ? 6 : today - 1)].key;
  const todayHours = profile.workingHours[todayKey];

  const socialMediaIcons = {
    instagram: '📷',
    telegram: '✈️',
    tiktok: '🎵',
    facebook: '📘',
    youtube: '📺',
    twitter: '🐦',
  };

  const handleSocialMediaPress = (platform: string, url?: string) => {
    if (url && url.trim()) {
      Linking.openURL(url).catch(() => {
        Alert.alert('Error', 'Could not open link');
      });
    }
  };

  const handleEditSection = (section: string) => {
    Alert.alert('Edit', `Edit ${section} functionality will be implemented`);
  };

  const renderCoverPhotos = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{t.coverPhotos}</Text>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => handleEditSection('Cover Photos')}
        >
          <Edit size={16} color={Colors.neutral.gray} />
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.coverPhotosContainer}
      >
        {profile.coverPhotos?.map((photo, index) => (
          <Image
            key={index}
            source={{ uri: photo }}
            style={styles.coverPhoto}
            resizeMode="cover"
          />
        ))}
        <TouchableOpacity style={styles.addPhotoButton}>
          <Plus size={24} color={Colors.neutral.gray} />
          <Text style={styles.addPhotoText}>{t.addPhoto}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );

  const renderBusinessDetails = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{t.businessDetails}</Text>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => handleEditSection('Business Details')}
        >
          <Edit size={16} color={Colors.neutral.gray} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.detailsContainer}>
        <Text style={styles.businessName}>{profile.name}</Text>
        
        <View style={styles.detailRow}>
          <Building size={16} color={Colors.primary.main} />
          <Text style={styles.detailText}>{profile.serviceType || profile.businessType}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <MapPin size={16} color={Colors.primary.main} />
          <Text style={styles.detailText}>{profile.address}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Phone size={16} color={Colors.primary.main} />
          <Text style={styles.detailText}>{profile.phone}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Mail size={16} color={Colors.primary.main} />
          <Text style={styles.detailText}>{profile.email}</Text>
        </View>
        
        {profile.bio && (
          <View style={styles.bioContainer}>
            <Text style={styles.bioText}>{profile.bio}</Text>
          </View>
        )}
      </View>
    </View>
  );

  const renderWorkingHours = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{t.todayHours}</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.expandButton}
            onPress={() => setShowFullWeek(!showFullWeek)}
          >
            <Text style={styles.expandText}>
              {showFullWeek ? t.collapseWeek : t.expandWeek}
            </Text>
            {showFullWeek ? (
              <ChevronDown size={16} color={Colors.primary.main} />
            ) : (
              <ChevronRight size={16} color={Colors.primary.main} />
            )}
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => handleEditSection('Working Hours')}
          >
            <Edit size={16} color={Colors.neutral.gray} />
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.hoursContainer}>
        {!showFullWeek ? (
          <View style={styles.todayHoursRow}>
            <Clock size={16} color={Colors.primary.main} />
            <Text style={styles.todayText}>
              {todayHours?.isOpen 
                ? `${todayHours.openTime} - ${todayHours.closeTime}`
                : t.closed
              }
            </Text>
          </View>
        ) : (
          daysOfWeek.map((day) => {
            const dayHours = profile.workingHours[day.key];
            const isToday = day.key === todayKey;
            
            return (
              <View key={day.key} style={[styles.dayRow, isToday && styles.todayRow]}>
                <Text style={[styles.dayName, isToday && styles.todayDayName]}>
                  {day.name}
                </Text>
                <Text style={[styles.dayHours, isToday && styles.todayDayHours]}>
                  {dayHours?.isOpen 
                    ? `${dayHours.openTime} - ${dayHours.closeTime}`
                    : t.closed
                  }
                </Text>
              </View>
            );
          })
        )}
      </View>
    </View>
  );

  const renderSocialMedia = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{t.socialMedia}</Text>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => handleEditSection('Social Media')}
        >
          <Edit size={16} color={Colors.neutral.gray} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.socialContainer}>
        {Object.entries(socialMediaIcons).map(([platform, icon]) => {
          const url = profile.socialMedia?.[platform as keyof typeof profile.socialMedia];
          const hasLink = url && url.trim();
          
          return (
            <TouchableOpacity
              key={platform}
              style={[
                styles.socialButton,
                hasLink && styles.socialButtonActive
              ]}
              onPress={() => handleSocialMediaPress(platform, url)}
              disabled={!hasLink}
            >
              <Text style={styles.socialIcon}>{icon}</Text>
              <Text style={[
                styles.socialLabel,
                hasLink && styles.socialLabelActive
              ]}>
                {t[platform as keyof typeof t] || platform}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  const renderEmployees = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{t.employees}</Text>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={() => handleEditSection('Employees')}
        >
          <Edit size={16} color={Colors.neutral.gray} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.employeesContainer}>
        {profile.employees?.map((employee, index) => (
          <View key={index} style={styles.employeeRow}>
            <Users size={16} color={Colors.primary.main} />
            <Text style={styles.employeeName}>{employee}</Text>
          </View>
        ))}
        
        <TouchableOpacity style={styles.addEmployeeButton}>
          <Plus size={16} color={Colors.primary.main} />
          <Text style={styles.addEmployeeText}>{t.addEmployee}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {renderCoverPhotos()}
      {renderBusinessDetails()}
      {renderWorkingHours()}
      {renderSocialMedia()}
      {renderEmployees()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral.background,
  },
  section: {
    backgroundColor: Colors.neutral.white,
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: Colors.neutral.black,
  },
  editButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: Colors.neutral.background,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  expandText: {
    fontSize: 14,
    color: Colors.primary.main,
    fontWeight: '500' as const,
  },
  
  // Cover Photos
  coverPhotosContainer: {
    flexDirection: 'row',
  },
  coverPhoto: {
    width: width * 0.7,
    height: 200,
    borderRadius: 12,
    marginRight: 12,
  },
  addPhotoButton: {
    width: 120,
    height: 200,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.neutral.lightGray,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  addPhotoText: {
    fontSize: 12,
    color: Colors.neutral.gray,
    fontWeight: '500' as const,
  },
  
  // Business Details
  detailsContainer: {
    gap: 12,
  },
  businessName: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.neutral.black,
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  detailText: {
    fontSize: 16,
    color: Colors.neutral.darkGray,
    flex: 1,
  },
  bioContainer: {
    marginTop: 8,
    padding: 16,
    backgroundColor: Colors.neutral.background,
    borderRadius: 8,
  },
  bioText: {
    fontSize: 14,
    color: Colors.neutral.darkGray,
    lineHeight: 20,
  },
  
  // Working Hours
  hoursContainer: {
    gap: 8,
  },
  todayHoursRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: Colors.primary.main + '10',
    borderRadius: 8,
  },
  todayText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.primary.main,
  },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  todayRow: {
    backgroundColor: Colors.primary.main + '10',
  },
  dayName: {
    fontSize: 14,
    color: Colors.neutral.darkGray,
    fontWeight: '500' as const,
  },
  todayDayName: {
    color: Colors.primary.main,
    fontWeight: '600' as const,
  },
  dayHours: {
    fontSize: 14,
    color: Colors.neutral.gray,
  },
  todayDayHours: {
    color: Colors.primary.main,
    fontWeight: '500' as const,
  },
  
  // Social Media
  socialContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  socialButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.neutral.background,
    borderWidth: 2,
    borderColor: Colors.neutral.lightGray,
  },
  socialButtonActive: {
    borderColor: Colors.primary.main,
    backgroundColor: Colors.primary.main + '10',
  },
  socialIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  socialLabel: {
    fontSize: 10,
    color: Colors.neutral.gray,
    fontWeight: '500' as const,
    textAlign: 'center',
  },
  socialLabelActive: {
    color: Colors.primary.main,
  },
  
  // Employees
  employeesContainer: {
    gap: 12,
  },
  employeeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    backgroundColor: Colors.neutral.background,
    borderRadius: 8,
  },
  employeeName: {
    fontSize: 14,
    color: Colors.neutral.darkGray,
    flex: 1,
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
  },
  addEmployeeText: {
    fontSize: 14,
    color: Colors.primary.main,
    fontWeight: '500' as const,
  },
});