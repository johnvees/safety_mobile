import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Platform } from 'react-native';
import {
  IconHome,
  IconReport,
  IconFolder,
  IconMessageCircle,
  IconDots,
} from '@tabler/icons-react-native';
import { C } from '@/theme/colors';
import { F } from '@/theme/typography';
import { BottomTabParamList } from './types';

import HomeScreen from '@/screens/HomeScreen';
import LaporanScreen from '@/screens/LaporanScreen';
import HseScreen from '@/screens/HseScreen';
import ChatScreen from '@/screens/ChatScreen';
import MoreScreen from '@/screens/MoreScreen';

const Tab = createBottomTabNavigator<BottomTabParamList>();

const TAB_ICONS: Record<string, React.ComponentType<any>> = {
  Home: IconHome,
  Laporan: IconReport,
  HSE: IconFolder,
  Chat: IconMessageCircle,
  More: IconDots,
};

export default function BottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          const TabIcon = TAB_ICONS[route.name];
          return TabIcon ? <TabIcon size={size} color={color} strokeWidth={1.8} /> : null;
        },
        tabBarActiveTintColor: C.teal,
        tabBarInactiveTintColor: C.mut,
        tabBarStyle: {
          backgroundColor: C.white,
          borderTopColor: C.line,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 84 : 64,
          paddingBottom: Platform.OS === 'ios' ? 24 : 8,
          paddingTop: 8,
          shadowColor: C.ink,
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.05,
          shadowRadius: 16,
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontFamily: F.semiBold,
          marginTop: 2,
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarLabel: 'Beranda' }}
      />
      <Tab.Screen name="Laporan" component={LaporanScreen} />
      <Tab.Screen name="HSE" component={HseScreen} />
      <Tab.Screen
        name="Chat"
        component={ChatScreen}
        options={{
          tabBarLabel: 'Chat',
          tabBarBadge: 3,
          tabBarBadgeStyle: { backgroundColor: C.danger, fontFamily: F.bold, fontSize: 10 },
        }}
      />
      <Tab.Screen
        name="More"
        component={MoreScreen}
        options={{ tabBarLabel: 'Lainnya' }}
      />
    </Tab.Navigator>
  );
}
