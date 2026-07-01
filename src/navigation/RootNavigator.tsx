import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import BottomTabs from './BottomTabs';
import CaseIncidentScreen from '@/screens/CaseIncidentScreen';
import InsidenDetailScreen from '@/screens/InsidenDetailScreen';
import InspeksiListScreen from '@/screens/InspeksiListScreen';
import InspeksiDetailScreen from '@/screens/InspeksiDetailScreen';
import PermitListScreen from '@/screens/PermitListScreen';
import PermitDetailScreen from '@/screens/PermitDetailScreen';
import NotifikasiScreen from '@/screens/NotifikasiScreen';
import DashboardScreen from '@/screens/DashboardScreen';
import SettingsScreen from '@/screens/SettingsScreen';
import HseModuleBuatScreen from '@/screens/HseModuleBuatScreen';
import HseModulDetailScreen from '@/screens/HseModulDetailScreen';
import ChatContactPickerScreen from '@/screens/ChatContactPickerScreen';
import ChatConversationScreen from '@/screens/ChatConversationScreen';
import ChatProfileScreen from '@/screens/ChatProfileScreen';
import ChatArchivedScreen from '@/screens/ChatArchivedScreen';
import ChatTrashScreen from '@/screens/ChatTrashScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={BottomTabs} />
      <Stack.Screen name="CaseIncident" component={CaseIncidentScreen} />
      <Stack.Screen name="InsidenDetail" component={InsidenDetailScreen} />
      <Stack.Screen name="InspeksiList" component={InspeksiListScreen} />
      <Stack.Screen name="InspeksiDetail" component={InspeksiDetailScreen} />
      <Stack.Screen name="PermitList" component={PermitListScreen} />
      <Stack.Screen name="PermitDetail" component={PermitDetailScreen} />
      <Stack.Screen name="Notifikasi" component={NotifikasiScreen} />
      <Stack.Screen name="DashboardFull" component={DashboardScreen} />
      <Stack.Screen name="SettingsFull" component={SettingsScreen} />
      <Stack.Screen name="HseModuleBuat" component={HseModuleBuatScreen} />
      <Stack.Screen name="HseModulDetail" component={HseModulDetailScreen} />
      <Stack.Screen name="ChatContactPicker" component={ChatContactPickerScreen} />
      <Stack.Screen name="ChatConversation" component={ChatConversationScreen} />
      <Stack.Screen name="ChatProfile" component={ChatProfileScreen} />
      <Stack.Screen name="ChatArchived" component={ChatArchivedScreen} />
      <Stack.Screen name="ChatTrash" component={ChatTrashScreen} />
    </Stack.Navigator>
  );
}
