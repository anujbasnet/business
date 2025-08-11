import { Tabs } from "expo-router";
import { Bell, Calendar, Home, Image, User } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { router } from "expo-router";

import Colors from "@/constants/colors";
import { translations } from "@/constants/translations";
import { useLanguageStore } from "@/hooks/useLanguageStore";
import { useNotificationsStore } from "@/hooks/useNotificationsStore";

export default function TabLayout() {
  const { language } = useLanguageStore();
  const t = translations[language];
  const unreadCount = useNotificationsStore((s: { unreadCount: number }) => s.unreadCount);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary.main,
        tabBarInactiveTintColor: Colors.neutral.gray,
        tabBarStyle: {
          borderTopColor: Colors.neutral.lightGray,
        },
        headerStyle: {
          backgroundColor: Colors.primary.main,
        },
        headerTintColor: Colors.neutral.white,
        headerTitleStyle: {
          fontWeight: '600',
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
              <Bell color={Colors.neutral.white} size={24} />
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
          title: t.calendar,
          tabBarIcon: ({ color }) => <Calendar color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="portfolio"
        options={{
          title: t.portfolio,
          tabBarIcon: ({ color }) => <Image color={color} size={24} />,
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
    backgroundColor: Colors.status.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  notificationBadgeText: {
    color: Colors.neutral.white,
    fontSize: 12,
    fontWeight: '600' as const,
  },
});