import { 
  Building, 
  ChevronDown, 
  ChevronRight, 
  Clock, 
  Download,
  Edit, 
  Mail, 
  MapPin, 
  Phone, 
  QrCode,
  Share,
  Users 
} from 'lucide-react-native';
import React, { useState } from 'react';
import { router } from 'expo-router';
import { 
  Alert, 
  Dimensions, 
  Image, 
  Linking, 
  Modal,
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
  const [showShareModal, setShowShareModal] = useState<boolean>(false);

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

  const socialMediaLogos = {
    instagram: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Instagram_icon.png/2048px-Instagram_icon.png',
    telegram: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Telegram_logo.svg/2048px-Telegram_logo.svg.png',
    tiktok: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Ionicons_logo-tiktok.svg/2048px-Ionicons_logo-tiktok.svg.png',
    facebook: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Facebook_Logo_%282019%29.png/1024px-Facebook_Logo_%282019%29.png',
    youtube: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/YouTube_full-color_icon_%282017%29.svg/2048px-YouTube_full-color_icon_%282017%29.svg.png',
  };

  const handleSocialMediaPress = (platform: string, url?: string) => {
    if (url && url.trim()) {
      Linking.openURL(url).catch(() => {
        Alert.alert('Error', 'Could not open link');
      });
    }
  };

  const handleEditSection = (section: string) => {
    switch (section) {
      case 'Cover Photos':
        router.push('/edit-cover-photos');
        break;
      case 'Business Details':
        router.push('/edit-business-details');
        break;
      case 'Working Hours':
        router.push('/edit-working-hours');
        break;
      case 'Social Media':
        router.push('/edit-social-media');
        break;
      case 'Employees':
        router.push('/edit-employees');
        break;
      default:
        Alert.alert('Edit', `Edit ${section} functionality will be implemented`);
    }
  };

  const handleShareProfile = () => {
    setShowShareModal(true);
  };

  const handleDownloadQR = () => {
    Alert.alert('Download', 'QR code download functionality will be implemented');
  };

  const profileUrl = `https://bronapp.com/profile/${profile.id}`;

  const renderCoverPhotos = () => (
    <View style={styles.coverSection}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        style={styles.coverPhotosContainer}
      >
        {profile.coverPhotos?.map((photo, index) => (
          <View key={index} style={styles.coverPhotoContainer}>
            <Image
              source={{ uri: photo }}
              style={styles.coverPhoto}
              resizeMode="cover"
            />
          </View>
        ))}
      </ScrollView>
      
      <View style={styles.coverOverlay}>
        <TouchableOpacity 
          style={styles.shareButton}
          onPress={handleShareProfile}
        >
          <Share size={16} color={Colors.neutral.white} />
          <Text style={styles.shareButtonText}>Share profile</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.editCoverButton}
          onPress={() => handleEditSection('Cover Photos')}
        >
          <Edit size={16} color={Colors.neutral.white} />
        </TouchableOpacity>
      </View>
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

  const renderSocialMedia = () => {
    const activeSocialMedia = Object.entries(profile.socialMedia || {})
      .filter(([_, url]) => url && url.trim())
      .filter(([platform]) => ['instagram', 'telegram', 'tiktok'].includes(platform));

    if (activeSocialMedia.length === 0) return null;

    return (
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
          {activeSocialMedia.map(([platform, url]) => {
            const logoUrl = socialMediaLogos[platform as keyof typeof socialMediaLogos];
            
            return (
              <TouchableOpacity
                key={platform}
                style={styles.socialButton}
                onPress={() => handleSocialMediaPress(platform, url)}
              >
                <Image 
                  source={{ uri: logoUrl }}
                  style={styles.socialLogo}
                  resizeMode="contain"
                />
                <Text style={styles.socialLabel}>
                  {t[platform as keyof typeof t] || platform}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

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
      </View>
    </View>
  );

  const renderShareModal = () => (
    <Modal
      visible={showShareModal}
      transparent
      animationType="fade"
      onRequestClose={() => setShowShareModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Share Profile</Text>
            <TouchableOpacity 
              onPress={() => setShowShareModal(false)}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.qrContainer}>
            <View style={styles.qrPlaceholder}>
              <QrCode size={120} color={Colors.primary.main} />
              <Text style={styles.qrText}>QR Code</Text>
            </View>
          </View>
          
          <Text style={styles.profileUrl}>{profileUrl}</Text>
          
          <View style={styles.modalActions}>
            <TouchableOpacity 
              style={styles.downloadButton}
              onPress={handleDownloadQR}
            >
              <Download size={16} color={Colors.neutral.white} />
              <Text style={styles.downloadButtonText}>Download QR</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.copyButton}
              onPress={() => {
                // TODO: Copy URL to clipboard
                Alert.alert('Copied', 'Profile URL copied to clipboard');
              }}
            >
              <Text style={styles.copyButtonText}>Copy Link</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {renderCoverPhotos()}
        {renderBusinessDetails()}
        {renderWorkingHours()}
        {renderSocialMedia()}
        {renderEmployees()}
      </ScrollView>
      {renderShareModal()}
    </View>
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
  coverSection: {
    position: 'relative',
    height: 250,
    marginBottom: 12,
  },
  coverPhotosContainer: {
    flexDirection: 'row',
  },
  coverPhotoContainer: {
    width: width,
    height: 250,
  },
  coverPhoto: {
    width: '100%',
    height: '100%',
  },
  coverOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'space-between',
    padding: 16,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: Colors.primary.main,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
    marginTop: 40,
  },
  shareButtonText: {
    color: Colors.neutral.white,
    fontSize: 14,
    fontWeight: '600' as const,
  },
  editCoverButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 8,
    borderRadius: 20,
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
    backgroundColor: Colors.neutral.white,
    borderWidth: 2,
    borderColor: Colors.primary.main,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  socialLogo: {
    width: 32,
    height: 32,
    marginBottom: 4,
  },
  socialLabel: {
    fontSize: 10,
    color: Colors.primary.main,
    fontWeight: '600' as const,
    textAlign: 'center',
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
  
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 350,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.neutral.black,
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 24,
    color: Colors.neutral.gray,
    fontWeight: '300' as const,
  },
  qrContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  qrPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 160,
    height: 160,
    backgroundColor: Colors.neutral.background,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.primary.main,
    borderStyle: 'dashed',
  },
  qrText: {
    marginTop: 8,
    fontSize: 12,
    color: Colors.neutral.gray,
    fontWeight: '500' as const,
  },
  profileUrl: {
    fontSize: 12,
    color: Colors.neutral.gray,
    textAlign: 'center',
    marginBottom: 24,
    padding: 12,
    backgroundColor: Colors.neutral.background,
    borderRadius: 8,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  downloadButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary.main,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  downloadButtonText: {
    color: Colors.neutral.white,
    fontSize: 14,
    fontWeight: '600' as const,
  },
  copyButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.neutral.background,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primary.main,
  },
  copyButtonText: {
    color: Colors.primary.main,
    fontSize: 14,
    fontWeight: '600' as const,
  },
});