import React, { useMemo, useState } from 'react';
import {
  Alert,
  Modal,
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
import { BusinessProfileExceptions } from '@/types';

type PickerOption = { label: string; value: string };

function pad2(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

function buildDate(year: string, month: string, day: string): string {
  if (!year || !month || !day) return '';
  return `${year}-${pad2(Number(month))}-${pad2(Number(day))}`;
}

function getYearOptions(): PickerOption[] {
  const y = new Date().getFullYear();
  const years = [y - 1, y, y + 1, y + 2];
  return years.map((yy) => ({ label: `${yy}`, value: `${yy}` }));
}

const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function getMonthOptions(): PickerOption[] {
  return Array.from({ length: 12 }, (_, i) => ({ label: `${pad2(i + 1)} • ${monthNames[i]}`, value: `${i + 1}` }));
}

function getDayOptions(): PickerOption[] {
  return Array.from({ length: 31 }, (_, i) => ({ label: pad2(i + 1), value: `${i + 1}` }));
}

function SimplePickerModal({
  visible,
  title,
  options,
  selected,
  onSelect,
  onClose,
}: {
  visible: boolean;
  title: string;
  options: PickerOption[];
  selected?: string;
  onSelect: (value: string) => void;
  onClose: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.pickerModalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={{ maxHeight: 320 }}>
            {options.map((opt) => {
              const isSelected = selected === opt.value;
              return (
                <TouchableOpacity
                  key={opt.value}
                  style={[styles.pickerOption, isSelected && styles.pickerOptionSelected]}
                  onPress={() => {
                    onSelect(opt.value);
                    onClose();
                  }}
                >
                  <Text style={[styles.pickerOptionText, isSelected && styles.pickerOptionTextSelected]}>{opt.label}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

interface DayHours {
  isOpen: boolean;
  openTime: string;
  closeTime: string;
}

type WorkingHours = {
  [key: string]: DayHours;
};

type ShortDay = { date: string; openTime: string; closeTime: string };

enum Section {
  General = 'GENERAL',
  Closed = 'CLOSED',
  Short = 'SHORT',
}

export default function EditWorkingHoursScreen() {
  const { language } = useLanguageStore();
  const { profile, updateProfile } = useBusinessStore();
  const t = translations[language];
  
  const [workingHours, setWorkingHours] = useState<WorkingHours>(profile.workingHours);
  const [exceptions, setExceptions] = useState<BusinessProfileExceptions>({
    closedDates: profile.exceptions?.closedDates ?? [],
    shortDays: profile.exceptions?.shortDays ?? [],
  });
  const [activeSection, setActiveSection] = useState<Section>(Section.General);

  const isSaveDisabled = useMemo(() => false, []);

  const handleSave = () => {
    try {
      updateProfile({ workingHours, exceptions });
      Alert.alert('Success', 'Working hours updated successfully');
      router.back();
    } catch (e) {
      Alert.alert('Error', 'Could not save changes. Please try again.');
      console.log('Save working hours error', e);
    }
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

  const addClosedDate = (date: string) => {
    if (!date.trim()) return;
    setExceptions(prev => ({ ...prev, closedDates: Array.from(new Set([...prev.closedDates, date.trim()])) }));
  };
  const removeClosedDate = (date: string) => {
    setExceptions(prev => ({ ...prev, closedDates: prev.closedDates.filter(d => d !== date) }));
  };

  const addShortDay = (entry: ShortDay) => {
    if (!entry.date || !entry.openTime || !entry.closeTime) return;
    setExceptions(prev => ({ ...prev, shortDays: [...prev.shortDays, entry] }));
  };
  const removeShortDay = (index: number) => {
    setExceptions(prev => ({ ...prev, shortDays: prev.shortDays.filter((_, i) => i !== index) }));
  };

  // Closed date pickers state
  const [closedDay, setClosedDay] = useState<string>('');
  const [closedMonth, setClosedMonth] = useState<string>('');
  const [closedYear, setClosedYear] = useState<string>('');
  const [showClosedPicker, setShowClosedPicker] = useState<{ type: 'day' | 'month' | 'year' | null }>({ type: null });

  // Short day pickers state
  const [shortDay, setShortDay] = useState<string>('');
  const [shortMonth, setShortMonth] = useState<string>('');
  const [shortYear, setShortYear] = useState<string>('');
  const [newShortOpen, setNewShortOpen] = useState<string>('');
  const [newShortClose, setNewShortClose] = useState<string>('');
  const [showShortPicker, setShowShortPicker] = useState<{ type: 'day' | 'month' | 'year' | null }>({ type: null });

  const newClosedDate = buildDate(closedYear, closedMonth, closedDay);
  const newShortDate = buildDate(shortYear, shortMonth, shortDay);

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: 'Edit Working Hours',
          headerRight: () => (
            <TouchableOpacity onPress={handleSave} style={styles.saveButton} disabled={isSaveDisabled}>
              <Text style={[styles.saveButtonText, isSaveDisabled && { opacity: 0.5 }]}>{t.save}</Text>
            </TouchableOpacity>
          ),
        }} 
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.description}>
          Manage your General hours, Closed dates, and Short working days. Customers will see these on your profile.
        </Text>

        <View style={styles.tabs}>
          <TouchableOpacity
            testID="tab-general-hours"
            onPress={() => setActiveSection(Section.General)}
            style={[styles.tab, activeSection === Section.General && styles.tabActive]}
          >
            <Text style={[styles.tabText, activeSection === Section.General && styles.tabTextActive]}>General</Text>
          </TouchableOpacity>
          <TouchableOpacity
            testID="tab-closed-dates"
            onPress={() => setActiveSection(Section.Closed)}
            style={[styles.tab, activeSection === Section.Closed && styles.tabActive]}
          >
            <Text style={[styles.tabText, activeSection === Section.Closed && styles.tabTextActive]}>Closed dates</Text>
          </TouchableOpacity>
          <TouchableOpacity
            testID="tab-short-days"
            onPress={() => setActiveSection(Section.Short)}
            style={[styles.tab, activeSection === Section.Short && styles.tabActive]}
          >
            <Text style={[styles.tabText, activeSection === Section.Short && styles.tabTextActive]}>Short days</Text>
          </TouchableOpacity>
        </View>
        
        {activeSection === Section.General && (
          <View style={styles.daysContainer}>
            {daysOfWeek.map((day) => {
              const dayHours = workingHours[day.key];
              return (
                <View key={day.key} style={styles.dayRowCard}>
                  <View style={styles.dayRowHeader}>
                    <Text style={styles.dayName}>{day.name}</Text>
                    <View style={styles.dayHeaderRight}>
                      <Text style={styles.smallLabel}>{dayHours.isOpen ? 'Open' : 'Closed'}</Text>
                      <Switch
                        value={dayHours.isOpen}
                        onValueChange={(value) => updateDayHours(day.key, 'isOpen', value)}
                        trackColor={{ false: Colors.neutral.lightGray, true: Colors.primary.main + '40' }}
                        thumbColor={dayHours.isOpen ? Colors.primary.main : Colors.neutral.gray}
                      />
                    </View>
                  </View>

                  {dayHours.isOpen ? (
                    <View style={styles.inlineInputs}>
                      <View style={styles.inlineGroup}>
                        <Text style={styles.timeLabel}>{t.openTime}</Text>
                        <TextInput
                          testID={`input-${day.key}-open`}
                          style={styles.timeInputCompact}
                          value={dayHours.openTime}
                          onChangeText={(time) => updateDayHours(day.key, 'openTime', time)}
                          placeholder="09:00"
                          placeholderTextColor={Colors.neutral.gray}
                        />
                      </View>
                      <View style={styles.inlineGroup}>
                        <Text style={styles.timeLabel}>{t.closeTime}</Text>
                        <TextInput
                          testID={`input-${day.key}-close`}
                          style={styles.timeInputCompact}
                          value={dayHours.closeTime}
                          onChangeText={(time) => updateDayHours(day.key, 'closeTime', time)}
                          placeholder="18:00"
                          placeholderTextColor={Colors.neutral.gray}
                        />
                      </View>
                    </View>
                  ) : (
                    <Text style={styles.closedText}>{t.closed}</Text>
                  )}
                </View>
              );
            })}
          </View>
        )}

        {activeSection === Section.Closed && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Mark closed dates</Text>
            <View style={styles.dateRow}> 
              <TouchableOpacity
                testID="closed-pick-day"
                style={styles.datePickerChip}
                onPress={() => setShowClosedPicker({ type: 'day' })}
              >
                <Text style={styles.datePickerChipText}>{closedDay || 'DD'}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                testID="closed-pick-month"
                style={styles.datePickerChip}
                onPress={() => setShowClosedPicker({ type: 'month' })}
              >
                <Text style={styles.datePickerChipText}>{closedMonth || 'MM'}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                testID="closed-pick-year"
                style={styles.datePickerChip}
                onPress={() => setShowClosedPicker({ type: 'year' })}
              >
                <Text style={styles.datePickerChipText}>{closedYear || 'YYYY'}</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              testID="btn-add-closed-date"
              style={[styles.addBtn, { alignSelf: 'flex-start', marginTop: 4 }]}
              onPress={() => {
                addClosedDate(newClosedDate);
                setClosedDay('');
                setClosedMonth('');
                setClosedYear('');
              }}
            >
              <Text style={styles.addBtnText}>Add</Text>
            </TouchableOpacity>

            <View style={styles.tagList}>
              {exceptions.closedDates.map((d) => (
                <View key={d} style={styles.tag}>
                  <Text style={styles.tagText}>{d}</Text>
                  <TouchableOpacity onPress={() => removeClosedDate(d)}>
                    <Text style={styles.tagRemove}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        )}

        {activeSection === Section.Short && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Short working days</Text>
            <View style={styles.dateRow}>
              <TouchableOpacity
                testID="short-pick-day"
                style={styles.datePickerChip}
                onPress={() => setShowShortPicker({ type: 'day' })}
              >
                <Text style={styles.datePickerChipText}>{shortDay || 'DD'}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                testID="short-pick-month"
                style={styles.datePickerChip}
                onPress={() => setShowShortPicker({ type: 'month' })}
              >
                <Text style={styles.datePickerChipText}>{shortMonth || 'MM'}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                testID="short-pick-year"
                style={styles.datePickerChip}
                onPress={() => setShowShortPicker({ type: 'year' })}
              >
                <Text style={styles.datePickerChipText}>{shortYear || 'YYYY'}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.timeRow}> 
              <TextInput
                testID="input-short-open"
                style={styles.timeInputCompact}
                value={newShortOpen}
                onChangeText={setNewShortOpen}
                placeholder="10:00"
                placeholderTextColor={Colors.neutral.gray}
              />
              <TextInput
                testID="input-short-close"
                style={styles.timeInputCompact}
                value={newShortClose}
                onChangeText={setNewShortClose}
                placeholder="14:00"
                placeholderTextColor={Colors.neutral.gray}
              />
            </View>
            <TouchableOpacity
              testID="btn-add-short"
              style={[styles.addBtn, { alignSelf: 'flex-start' }]}
              onPress={() => {
                addShortDay({ date: newShortDate, openTime: newShortOpen, closeTime: newShortClose });
                setShortDay('');
                setShortMonth('');
                setShortYear('');
                setNewShortOpen('');
                setNewShortClose('');
              }}
            >
              <Text style={styles.addBtnText}>Add</Text>
            </TouchableOpacity>

            <View style={styles.shortList}>
              {exceptions.shortDays.map((s, idx) => (
                <View key={`${s.date}-${idx}`} style={styles.shortItem}>
                  <Text style={styles.shortItemText}>{s.date}</Text>
                  <Text style={styles.shortItemText}>{s.openTime} - {s.closeTime}</Text>
                  <TouchableOpacity onPress={() => removeShortDay(idx)}>
                    <Text style={styles.tagRemove}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.tips}>
          <Text style={styles.tipsTitle}>Tips:</Text>
          <Text style={styles.tipText}>• Use 24-hour format (e.g., 09:00, 18:00)</Text>
          <Text style={styles.tipText}>• Toggle the switch to mark days as closed</Text>
          <Text style={styles.tipText}>• Closed and short days override General hours</Text>
        </View>
      </ScrollView>

      {/* Closed pickers */}
      <SimplePickerModal
        visible={showClosedPicker.type === 'day'}
        title="Select Day"
        options={getDayOptions()}
        selected={closedDay}
        onSelect={(v) => setClosedDay(v)}
        onClose={() => setShowClosedPicker({ type: null })}
      />
      <SimplePickerModal
        visible={showClosedPicker.type === 'month'}
        title="Select Month"
        options={getMonthOptions()}
        selected={closedMonth}
        onSelect={(v) => setClosedMonth(v)}
        onClose={() => setShowClosedPicker({ type: null })}
      />
      <SimplePickerModal
        visible={showClosedPicker.type === 'year'}
        title="Select Year"
        options={getYearOptions()}
        selected={closedYear}
        onSelect={(v) => setClosedYear(v)}
        onClose={() => setShowClosedPicker({ type: null })}
      />

      {/* Short pickers */}
      <SimplePickerModal
        visible={showShortPicker.type === 'day'}
        title="Select Day"
        options={getDayOptions()}
        selected={shortDay}
        onSelect={(v) => setShortDay(v)}
        onClose={() => setShowShortPicker({ type: null })}
      />
      <SimplePickerModal
        visible={showShortPicker.type === 'month'}
        title="Select Month"
        options={getMonthOptions()}
        selected={shortMonth}
        onSelect={(v) => setShortMonth(v)}
        onClose={() => setShowShortPicker({ type: null })}
      />
      <SimplePickerModal
        visible={showShortPicker.type === 'year'}
        title="Select Year"
        options={getYearOptions()}
        selected={shortYear}
        onSelect={(v) => setShortYear(v)}
        onClose={() => setShowShortPicker({ type: null })}
      />
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
    marginBottom: 16,
    lineHeight: 20,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: Colors.neutral.white,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: Colors.neutral.white,
    borderRightWidth: 1,
    borderRightColor: Colors.neutral.lightGray,
  },
  tabActive: {
    backgroundColor: Colors.primary.main + '10',
  },
  tabText: {
    color: Colors.neutral.darkGray,
    fontWeight: '500' as const,
  },
  tabTextActive: {
    color: Colors.primary.main,
    fontWeight: '600' as const,
  },

  // General hours compact layout
  daysContainer: {
    gap: 12,
    marginBottom: 24,
  },
  dayRowCard: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 8,
    padding: 12,
  },
  dayRowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  dayHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dayName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.neutral.black,
  },
  smallLabel: {
    fontSize: 12,
    color: Colors.neutral.gray,
  },
  inlineInputs: {
    flexDirection: 'row',
    gap: 12,
  },
  inlineGroup: {
    flex: 1,
    gap: 6,
  },
  timeLabel: {
    fontSize: 12,
    fontWeight: '500' as const,
    color: Colors.neutral.darkGray,
  },
  timeInputCompact: {
    borderWidth: 1,
    borderColor: Colors.neutral.lightGray,
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 10,
    fontSize: 14,
    color: Colors.neutral.black,
    textAlign: 'center' as const,
    minWidth: 90,
    backgroundColor: Colors.neutral.white,
  },
  closedText: {
    fontSize: 14,
    color: Colors.neutral.gray,
    fontStyle: 'italic' as const,
  },

  // Closed dates
  card: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 8,
    padding: 12,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: Colors.neutral.black,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  dateRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  dateInput: {
    borderWidth: 1,
    borderColor: Colors.neutral.lightGray,
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 10,
    fontSize: 14,
    color: Colors.neutral.black,
    minWidth: 140,
    backgroundColor: Colors.neutral.white,
  },
  datePickerChip: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: Colors.neutral.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.neutral.lightGray,
  },
  datePickerChipText: {
    color: Colors.neutral.darkGray,
    fontSize: 14,
    fontWeight: '500' as const,
  },
  addBtn: {
    backgroundColor: Colors.primary.main,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 6,
  },
  addBtnText: {
    color: Colors.neutral.white,
    fontWeight: '600' as const,
  },
  tagList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.primary.main + '10',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  tagText: {
    color: Colors.primary.main,
    fontSize: 12,
    fontWeight: '600' as const,
  },
  tagRemove: {
    color: Colors.neutral.gray,
    fontSize: 18,
    marginLeft: 2,
  },

  // Short days
  timeRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  shortList: {
    gap: 8,
  },
  shortItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.neutral.background,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  shortItemText: {
    color: Colors.neutral.darkGray,
    fontSize: 14,
    fontWeight: '500' as const,
  },

  // Tips
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

  // Modal shared
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  pickerModalContent: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 16,
    padding: 16,
    width: '100%',
    maxWidth: 360,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.neutral.black,
  },
  closeButtonText: {
    fontSize: 24,
    color: Colors.neutral.gray,
    fontWeight: '300' as const,
  },
  pickerOption: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutral.lightGray,
  },
  pickerOptionSelected: {
    backgroundColor: Colors.primary.main + '10',
  },
  pickerOptionText: {
    fontSize: 16,
    color: Colors.neutral.black,
  },
  pickerOptionTextSelected: {
    color: Colors.primary.main,
    fontWeight: '700' as const,
  },
});