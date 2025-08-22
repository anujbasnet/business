import { 
  Building, 
  ChevronDown, 
  ChevronLeft,
  ChevronRight, 
  Clock, 
  Download,
  Edit, 
  Globe,
  Languages,
  Mail, 
  MapPin, 
  MessageSquare,
  Phone, 
  QrCode,
  Reply,
  Settings,
  Share,
  Star,
  Users,
  Megaphone,
  CreditCard,
  Info,
  User as UserIcon
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
  TextInput,
  TouchableOpacity, 
  View 
} from 'react-native';

import Colors from '@/constants/colors';
import { translations } from '@/constants/translations';
import { useBusinessStore } from '@/hooks/useBusinessStore';
import { useLanguageStore } from '@/hooks/useLanguageStore';
import { mockReviews } from '@/mocks/reviews';
import { Review } from '@/types';

const { width } = Dimensions.get('window');

export default function ProfileScreen() {
  const { language, setLanguage } = useLanguageStore();
  const { profile } = useBusinessStore();
  const t = translations[language];
  
  const [showFullWeek, setShowFullWeek] = useState<boolean>(false);
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [showAllReviews, setShowAllReviews] = useState<boolean>(false);
  const [expandedReview, setExpandedReview] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<string>('');
  const [showLanguageModal, setShowLanguageModal] = useState<boolean>(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState<number>(0);
  const scrollViewRef = React.useRef<ScrollView>(null);

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

  const handlePreviousPhoto = () => {
    const orderedPhotos = profile.coverPhotos ? [...profile.coverPhotos] : [];
    const mainIndex = profile.mainCoverPhotoIndex || 0;
    
    if (mainIndex > 0 && mainIndex < orderedPhotos.length) {
      const mainPhoto = orderedPhotos[mainIndex];
      orderedPhotos.splice(mainIndex, 1);
      orderedPhotos.unshift(mainPhoto);
    }
    
    if (orderedPhotos.length > 1) {
      const newIndex = currentPhotoIndex === 0 ? orderedPhotos.length - 1 : currentPhotoIndex - 1;
      setCurrentPhotoIndex(newIndex);
      scrollViewRef.current?.scrollTo({ x: newIndex * width, animated: true });
    }
  };

  const handleNextPhoto = () => {
    const orderedPhotos = profile.coverPhotos ? [...profile.coverPhotos] : [];
    const mainIndex = profile.mainCoverPhotoIndex || 0;
    
    if (mainIndex > 0 && mainIndex < orderedPhotos.length) {
      const mainPhoto = orderedPhotos[mainIndex];
      orderedPhotos.splice(mainIndex, 1);
      orderedPhotos.unshift(mainPhoto);
    }
    
    if (orderedPhotos.length > 1) {
      const newIndex = currentPhotoIndex === orderedPhotos.length - 1 ? 0 : currentPhotoIndex + 1;
      setCurrentPhotoIndex(newIndex);
      scrollViewRef.current?.scrollTo({ x: newIndex * width, animated: true });
    }
  };

  const renderCoverPhotos = () => {
    // Ensure main cover photo is displayed first
    const orderedPhotos = profile.coverPhotos ? [...profile.coverPhotos] : [];
    const mainIndex = profile.mainCoverPhotoIndex || 0;
    
    if (mainIndex > 0 && mainIndex < orderedPhotos.length) {
      const mainPhoto = orderedPhotos[mainIndex];
      orderedPhotos.splice(mainIndex, 1);
      orderedPhotos.unshift(mainPhoto);
    }
    
    return (
      <View style={styles.coverSection}>
        <ScrollView 
          ref={scrollViewRef}
          horizontal 
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          style={styles.coverPhotosContainer}
          onMomentumScrollEnd={(event) => {
            const slideSize = event.nativeEvent.layoutMeasurement.width;
            const index = Math.floor(event.nativeEvent.contentOffset.x / slideSize);
            setCurrentPhotoIndex(index);
          }}
        >
          {orderedPhotos.map((photo, index) => (
            <View key={index} style={styles.coverPhotoContainer}>
              <Image
                source={{ uri: photo }}
                style={styles.coverPhoto}
                resizeMode="cover"
              />
            </View>
          ))}
        </ScrollView>
        
        {orderedPhotos.length > 1 && (
          <>
            <TouchableOpacity 
              style={styles.navArrowLeft}
              onPress={handlePreviousPhoto}
            >
              <ChevronLeft size={24} color={Colors.neutral.white} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.navArrowRight}
              onPress={handleNextPhoto}
            >
              <ChevronRight size={24} color={Colors.neutral.white} />
            </TouchableOpacity>
          </>
        )}
        
        <View style={styles.coverOverlay}>
          <View style={styles.coverActions}>
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
        </View>
      );
    };

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
      
      <View style={styles.employeesGrid}>
        {profile.employees?.map((employee, index) => {
          const raw = (employee || '').trim();
          const partsPipe = raw.split('|||');
          const nameOnly = (partsPipe[0] ?? '').trim();
          const userPhoto = (partsPipe[1] ?? '').trim();
          const nameParts = nameOnly.split(' ').filter(Boolean);
          const displayName = nameParts.length > 1 ? `${nameParts[0]}\n${nameParts.slice(1).join(' ')}` : nameOnly;
          const fallbackPhoto = `https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop&auto=format&dpr=2&sig=${index}`;
          const photoUri = userPhoto || fallbackPhoto;
          return (
            <View key={index} style={styles.employeeCard}>
              <Image
                source={{ uri: photoUri }}
                style={styles.employeeAvatar}
                resizeMode="cover"
              />
              <Text style={styles.employeeLabel} numberOfLines={2}>
                {displayName}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );

  const handleReplyToReview = (reviewId: string) => {
    if (replyText.trim()) {
      Alert.alert('Success', 'Reply sent successfully');
      setReplyingTo(null);
      setReplyText('');
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        size={16}
        color={index < rating ? Colors.secondary.main : Colors.neutral.lightGray}
        fill={index < rating ? Colors.secondary.main : 'transparent'}
      />
    ));
  };

  const renderReviews = () => {
    const displayedReviews = showAllReviews ? mockReviews : mockReviews.slice(0, 1);
    const averageRating = mockReviews.reduce((sum, review) => sum + review.rating, 0) / mockReviews.length;

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Reviews</Text>
          <View style={styles.ratingContainer}>
            <View style={styles.starsContainer}>
              {renderStars(Math.round(averageRating))}
            </View>
            <Text style={styles.ratingText}>{averageRating.toFixed(1)} ({mockReviews.length})</Text>
          </View>
        </View>
        
        <View style={styles.reviewsContainer}>
          {displayedReviews.map((review) => (
            <View key={review.id} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <View style={styles.reviewerInfo}>
                  <Text style={styles.reviewerName}>{review.clientName}</Text>
                  <View style={styles.reviewStars}>
                    {renderStars(review.rating)}
                  </View>
                </View>
                <Text style={styles.reviewDate}>
                  {new Date(review.date).toLocaleDateString()}
                </Text>
              </View>
              
              <TouchableOpacity
                onPress={() => setExpandedReview(expandedReview === review.id ? null : review.id)}
              >
                <Text 
                  style={styles.reviewComment}
                  numberOfLines={expandedReview === review.id ? undefined : 2}
                >
                  {review.comment}
                </Text>
              </TouchableOpacity>
              
              {review.reply && (
                <View style={styles.replyContainer}>
                  <Text style={styles.replyLabel}>Business Reply:</Text>
                  <Text style={styles.replyText}>{review.reply}</Text>
                  <Text style={styles.replyDate}>
                    {new Date(review.replyDate!).toLocaleDateString()}
                  </Text>
                </View>
              )}
              
              {!review.reply && (
                <TouchableOpacity
                  style={styles.replyButton}
                  onPress={() => setReplyingTo(review.id)}
                >
                  <Reply size={14} color={Colors.primary.main} />
                  <Text style={styles.replyButtonText}>Reply</Text>
                </TouchableOpacity>
              )}
              
              {replyingTo === review.id && (
                <View style={styles.replyInputContainer}>
                  <TextInput
                    style={styles.replyInput}
                    value={replyText}
                    onChangeText={setReplyText}
                    placeholder="Write your reply..."
                    placeholderTextColor={Colors.neutral.gray}
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                  />
                  <View style={styles.replyActions}>
                    <TouchableOpacity
                      style={styles.cancelReplyButton}
                      onPress={() => {
                        setReplyingTo(null);
                        setReplyText('');
                      }}
                    >
                      <Text style={styles.cancelReplyText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.sendReplyButton}
                      onPress={() => handleReplyToReview(review.id)}
                    >
                      <Text style={styles.sendReplyText}>Send</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          ))}
          
          {!showAllReviews && mockReviews.length > 1 && (
            <TouchableOpacity
              style={styles.showMoreButton}
              onPress={() => setShowAllReviews(true)}
            >
              <Text style={styles.showMoreText}>Show all {mockReviews.length} reviews</Text>
              <ChevronRight size={16} color={Colors.primary.main} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const renderAppSettings = () => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>App Settings</Text>
      </View>
      
      <View style={styles.settingsContainer}>
        <TouchableOpacity
          testID="setting-language"
          style={styles.settingRow}
          onPress={() => setShowLanguageModal(true)}
        >
          <View style={styles.settingLeft}>
            <Languages size={20} color={Colors.primary.main} />
            <Text style={styles.settingLabel}>Language</Text>
          </View>
          <View style={styles.settingRight}>
            <Text style={styles.settingValue}>
              {language === 'en' ? 'English' : language === 'ru' ? 'Русский' : 'O\'zbek'}
            </Text>
            <ChevronRight size={16} color={Colors.neutral.gray} />
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          testID="setting-profile-settings"
          style={styles.settingRow}
          onPress={() => router.push('/profile-settings')}
        >
          <View style={styles.settingLeft}>
            <UserIcon size={20} color={Colors.primary.main} />
            <Text style={styles.settingLabel}>Profile Settings</Text>
          </View>
          <ChevronRight size={16} color={Colors.neutral.gray} />
        </TouchableOpacity>
        <TouchableOpacity
          testID="setting-payment-settings"
          style={styles.settingRow}
          onPress={() => router.push('/payment-settings')}
        >
          <View style={styles.settingLeft}>
            <CreditCard size={20} color={Colors.primary.main} />
            <Text style={styles.settingLabel}>Payment Settings</Text>
          </View>
          <ChevronRight size={16} color={Colors.neutral.gray} />
        </TouchableOpacity>
        <TouchableOpacity
          testID="setting-support"
          style={styles.settingRow}
          onPress={() => router.push('/support')}
        >
          <View style={styles.settingLeft}>
            <MessageSquare size={20} color={Colors.primary.main} />
            <Text style={styles.settingLabel}>Support</Text>
          </View>
          <ChevronRight size={16} color={Colors.neutral.gray} />
        </TouchableOpacity>
        <TouchableOpacity
          testID="setting-about"
          style={styles.settingRow}
          onPress={() => router.push('/about')}
        >
          <View style={styles.settingLeft}>
            <Info size={20} color={Colors.primary.main} />
            <Text style={styles.settingLabel}>About</Text>
          </View>
          <ChevronRight size={16} color={Colors.neutral.gray} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderLanguageModal = () => {
    const languages = [
      { code: 'en', name: 'English', nativeName: 'English' },
      { code: 'ru', name: 'Russian', nativeName: 'Русский' },
      { code: 'uz', name: 'Uzbek', nativeName: 'O\'zbek' },
    ];

    return (
      <Modal
        visible={showLanguageModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Language</Text>
              <TouchableOpacity onPress={() => setShowLanguageModal(false)}>
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.languageList}>
              {languages.map((lang) => (
                <TouchableOpacity
                  key={lang.code}
                  style={[styles.languageOption, language === lang.code && styles.selectedLanguage]}
                  onPress={() => {
                    setLanguage(lang.code as any);
                    setShowLanguageModal(false);
                  }}
                >
                  <Text style={[styles.languageName, language === lang.code && styles.selectedLanguageText]}>
                    {lang.nativeName}
                  </Text>
                  {language === lang.code && (
                    <View style={styles.checkmark}>
                      <Text style={styles.checkmarkText}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    );
  };

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
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {renderCoverPhotos()}
        {renderBusinessDetails()}
        {renderWorkingHours()}
        {renderSocialMedia()}
        {renderEmployees()}
        {renderReviews()}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Marketing & Promotions</Text>
          </View>
          <View style={styles.settingsContainer}>
            <TouchableOpacity
              testID="marketing-promotions"
              style={styles.settingRow}
              onPress={() => router.push('/marketing-promotions')}
            >
              <View style={styles.settingLeft}>
                <Megaphone size={20} color={Colors.primary.main} />
                <Text style={styles.settingLabel}>Marketing & Promotions</Text>
              </View>
              <ChevronRight size={16} color={Colors.neutral.gray} />
            </TouchableOpacity>
          </View>
        </View>
        {renderAppSettings()}
      </ScrollView>
      {renderShareModal()}
      {renderLanguageModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral.background,
  },
  scrollContent: {
    paddingBottom: 20,
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
    justifyContent: 'flex-end',
    padding: 16,
  },
  coverActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 40,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary.main,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  shareButtonText: {
    color: Colors.neutral.white,
    fontSize: 14,
    fontWeight: '600' as const,
  },
  editCoverButton: {
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
    gap: 16,
  },
  socialButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  socialLogo: {
    width: 40,
    height: 40,
    marginBottom: 8,
  },
  socialLabel: {
    fontSize: 12,
    color: Colors.primary.main,
    fontWeight: '600' as const,
    textAlign: 'center',
  },
  
  // Employees
  employeesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'space-between',
  },
  employeeCard: {
    width: '30%',
    alignItems: 'center',
    marginBottom: 8,
  },
  employeeAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    marginBottom: 8,
    backgroundColor: Colors.neutral.background,
  },
  employeeLabel: {
    fontSize: 12,
    color: Colors.neutral.darkGray,
    textAlign: 'center',
    lineHeight: 16,
    fontWeight: '500' as const,
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
  
  // Reviews
  reviewsContainer: {
    gap: 16,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  ratingText: {
    fontSize: 14,
    color: Colors.neutral.darkGray,
    fontWeight: '500' as const,
  },
  reviewCard: {
    backgroundColor: Colors.neutral.background,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.neutral.lightGray,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  reviewerInfo: {
    flex: 1,
  },
  reviewerName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.neutral.black,
    marginBottom: 4,
  },
  reviewStars: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewDate: {
    fontSize: 12,
    color: Colors.neutral.gray,
  },
  reviewComment: {
    fontSize: 14,
    color: Colors.neutral.darkGray,
    lineHeight: 20,
    marginBottom: 12,
  },
  replyContainer: {
    backgroundColor: Colors.primary.main + '10',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary.main,
  },
  replyLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: Colors.primary.main,
    marginBottom: 4,
  },
  replyText: {
    fontSize: 14,
    color: Colors.neutral.darkGray,
    lineHeight: 18,
    marginBottom: 4,
  },
  replyDate: {
    fontSize: 11,
    color: Colors.neutral.gray,
  },
  replyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
  },
  replyButtonText: {
    fontSize: 14,
    color: Colors.primary.main,
    fontWeight: '500' as const,
  },
  replyInputContainer: {
    marginTop: 12,
    gap: 8,
  },
  replyInput: {
    borderWidth: 1,
    borderColor: Colors.neutral.lightGray,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: Colors.neutral.black,
    backgroundColor: Colors.neutral.white,
    minHeight: 80,
  },
  replyActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  cancelReplyButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  cancelReplyText: {
    fontSize: 14,
    color: Colors.neutral.gray,
    fontWeight: '500' as const,
  },
  sendReplyButton: {
    backgroundColor: Colors.primary.main,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  sendReplyText: {
    fontSize: 14,
    color: Colors.neutral.white,
    fontWeight: '600' as const,
  },
  showMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  showMoreText: {
    fontSize: 14,
    color: Colors.primary.main,
    fontWeight: '500' as const,
  },
  
  // App Settings
  settingsContainer: {
    gap: 4,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 12,
    backgroundColor: Colors.neutral.background,
    borderRadius: 8,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingLabel: {
    fontSize: 16,
    color: Colors.neutral.black,
    fontWeight: '500' as const,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingValue: {
    fontSize: 14,
    color: Colors.neutral.gray,
  },
  
  // Language Modal
  languageList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.lightGray,
  },
  selectedLanguage: {
    backgroundColor: Colors.primary.main + '10',
  },
  languageName: {
    fontSize: 16,
    color: Colors.neutral.black,
  },
  selectedLanguageText: {
    color: Colors.primary.main,
    fontWeight: '600' as const,
  },
  checkmark: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.primary.main,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    color: Colors.neutral.white,
    fontSize: 12,
    fontWeight: '600' as const,
  },
  
  // Navigation arrows for cover photos
  navArrowLeft: {
    position: 'absolute',
    left: 16,
    top: '50%',
    marginTop: -20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 8,
    zIndex: 2,
  },
  navArrowRight: {
    position: 'absolute',
    right: 16,
    top: '50%',
    marginTop: -20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 8,
    zIndex: 2,
  },
});