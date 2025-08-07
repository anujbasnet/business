import { Tabs } from "expo-router";
import { Calendar, Home, Image, User } from "lucide-react-native";
import React from "react";

import Colors from "@/constants/colors";
import { translations } from "@/constants/translations";
import { useLanguageStore } from "@/hooks/useLanguageStore";

export default function TabLayout() {
  const { language } = useLanguageStore();
  const t = translations[language];

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
          title: t.dashboard,
          tabBarIcon: ({ color }) => <Home color={color} size={24} />,
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