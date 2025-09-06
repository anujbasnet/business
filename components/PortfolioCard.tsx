import { Calendar, Tag } from 'lucide-react-native';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import Colors from '@/constants/colors';
import { PortfolioItem } from '@/types';

interface PortfolioCardProps {
  item: PortfolioItem;
  onPress: (item: PortfolioItem) => void;
}

export default function PortfolioCard({ item, onPress }: PortfolioCardProps) {
  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={() => onPress(item)}
      activeOpacity={0.7}
    >
      <Image 
        source={{ uri: item.imageUrl }} 
        style={styles.image}
        resizeMode="cover"
      />
      
      <View style={styles.content}>
        <Text style={styles.description} numberOfLines={2} ellipsizeMode="tail">
          {item.description}
        </Text>
        
        <View style={styles.footer}>
          <View style={styles.infoRow}>
            <Tag size={16} color={Colors.neutral.darkGray} />
            <Text style={styles.infoText}>{item.serviceCategory}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Calendar size={16} color={Colors.neutral.darkGray} />
            <Text style={styles.infoText}>{item.date}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.neutral.white,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: Colors.neutral.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
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
    color: Colors.primary.main,
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
    color: Colors.neutral.darkGray,
  },
});