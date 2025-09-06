import { Calendar, Tag } from 'lucide-react-native';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import { PortfolioItem } from '@/types';

interface PortfolioCardProps {
  item: PortfolioItem;
  onPress: (item: PortfolioItem) => void;
}

export default function PortfolioCard({ item, onPress }: PortfolioCardProps) {
  const { colors } = useTheme();
  
  return (
    <TouchableOpacity 
      style={[styles.container, { backgroundColor: colors.neutral.surface, borderColor: colors.neutral.border, shadowColor: colors.neutral.black }]}
      onPress={() => onPress(item)}
      activeOpacity={0.7}
      testID="portfolio-card"
    >
      <Image 
        source={{ uri: item.imageUrl }} 
        style={styles.image}
        resizeMode="cover"
      />
      
      <View style={[styles.content, { backgroundColor: colors.neutral.surface }]}>
        <Text style={[styles.description, { color: colors.neutral.darkGray }]} numberOfLines={2} ellipsizeMode="tail">
          {item.description}
        </Text>
        
        <View style={styles.footer}>
          <View style={styles.infoRow}>
            <Tag size={16} color={colors.neutral.darkGray} />
            <Text style={[styles.infoText, { color: colors.neutral.darkGray }]}>{item.serviceCategory}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Calendar size={16} color={colors.neutral.darkGray} />
            <Text style={[styles.infoText, { color: colors.neutral.darkGray }]}>{item.date}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
  },
  image: {
    width: '100%',
    height: 200,
  },
  content: {
    padding: 16,
  },
  description: {
    fontSize: 16,
    fontWeight: '500' as const,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoText: {
    fontSize: 14,
  },
});