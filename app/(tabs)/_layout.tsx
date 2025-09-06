import { Tabs } from "expo-router";
import { Bell, Calendar, Home, Image, User } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";

import { translations } from "@/constants/translations";
import { useLanguageStore } from "@/hooks/useLanguageStore";
import { useNotificationsStore } from "@/hooks/useNotificationsStore";
import { useTheme } from "@/hooks/useTheme";

export default function TabLayout() {
  const { language } = useLanguageStore();
  const t = translations[language];
  const unreadCount = useNotificationsStore((s: { unreadCount: number }) => s.unreadCount);
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary.main,
        tabBarInactiveTintColor: colors.neutral.gray,
        tabBarStyle: {
          borderTopColor: colors.neutral.lightGray,
        },
        headerStyle: {
          backgroundColor: colors.primary.main,
        },
        headerTintColor: colors.neutral.white,
        headerTitleStyle: {
          fontWeight: '600',
          color: colors.neutral.white,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Rejaly.uz",
          tabBarLabel: t.dashboard,
          tabBarIcon: ({ color }) => <Home color={color} size={24} />,
          headerRight: () => (
            <TouchableOpacity
              testID="header-notifications-button"
              onPress={() => router.push('/notifications')}
              style={styles.notificationButton}
            >
              <Bell color={colors.neutral.white} size={24} />
              {unreadCount > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          ),
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          headerShown: false,
          tabBarIcon: ({ color }) => <Calendar color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="portfolio"
        options={{
          title: t.portfolio,
          tabBarIcon: ({ color }) => <Image color={color} size={24} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t.profile,
          tabBarIcon: ({ color }) => <User color={color} size={24} />,
          headerShown: false,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  notificationButton: {
    position: 'relative',
    padding: 8,
    marginRight: 8,
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  notificationBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600' as const,
  },
});