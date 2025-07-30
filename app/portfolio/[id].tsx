import { Calendar, Edit, Tag, Trash } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';

import Colors from '@/constants/colors';
import { usePortfolioStore } from '@/hooks/usePortfolioStore';
import { PortfolioItem } from '@/types';

export default function PortfolioItemDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { portfolioItems, deletePortfolioItem } = usePortfolioStore();
  const [item, setItem] = useState<PortfolioItem | null>(null);

  useEffect(() => {
    if (id) {
      const foundItem = portfolioItems.find((i) => i.id === id);
      if (foundItem) {
        setItem(foundItem);
      }
    }
  }, [id, portfolioItems]);

  const handleDeleteItem = () => {
    Alert.alert(
      'Delete Portfolio Item',
      'Are you sure you want to delete this portfolio item?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            if (item) {
              deletePortfolioItem(item.id);
              router.back();
            }
          },
        },
      ]
    );
  };

  const handleEditItem = () => {
    if (item) {
      router.push(`/portfolio/edit/${item.id}`);
    }
  };

  if (!item) {
    return (
      <View style={styles.container}>
        <Text>Portfolio item not found</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen 
        options={{
          title: 'Portfolio Item',
          headerRight: () => (
            <View style={styles.headerButtons}>
              <TouchableOpacity onPress={handleEditItem} style={styles.headerButton}>
                <Edit size={20} color={Colors.neutral.white} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDeleteItem} style={styles.headerButton}>
                <Trash size={20} color={Colors.neutral.white} />
              </TouchableOpacity>
            </View>
          ),
        }}
      />
      <ScrollView style={styles.container}>
        <Image 
          source={{ uri: item.imageUrl }} 
          style={styles.image}
          resizeMode="cover"
        />
        
        <View style={styles.content}>
          <View style={styles.infoContainer}>
            <View style={styles.categoryBadge}>
              <Tag size={16} color={Colors.neutral.white} />
              <Text style={styles.categoryText}>{item.serviceCategory}</Text>
            </View>
            
            <View style={styles.dateContainer}>
              <Calendar size={16} color={Colors.neutral.darkGray} />
              <Text style={styles.dateText}>{item.date}</Text>
            </View>
          </View>
          
          <Text style={styles.description}>{item.description}</Text>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.neutral.background,
  },
  headerButtons: {
    flexDirection: 'row',
  },
  headerButton: {
    marginLeft: 16,
  },
  image: {
    width: '100%',
    height: 300,
  },
  content: {
    padding: 16,
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary.main,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  categoryText: {
    color: Colors.neutral.white,
    fontWeight: '500' as const,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    color: Colors.neutral.darkGray,
  },
  description: {
    fontSize: 18,
    color: Colors.neutral.black,
    lineHeight: 28,
  },
});