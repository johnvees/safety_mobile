import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import Icon from '@/components/Icon';
import { C, GradientHeaders } from '@/theme/colors';
import { F } from '@/theme/typography';
import GradientHeader from '@/components/GradientHeader';
import { CONTACTS } from '@/data/chatData';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function ChatContactPickerScreen() {
  const navigation = useNavigation<Nav>();
  const [search, setSearch] = useState('');
  const searchQ = search.trim().toLowerCase();
  const filtered = CONTACTS.filter((c) => c.name.toLowerCase().includes(searchQ));

  return (
    <View style={styles.container}>
      <GradientHeader
        title="Chat Baru"
        colors={GradientHeaders.chat as [string, string]}
        onBack={() => navigation.goBack()}
        subtitle={
          <View style={styles.headerSearch}>
            <View style={styles.headerSearchInput}>
              <Icon name="search" size={15} color="rgba(255,255,255,0.6)" />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Cari kontak..."
                placeholderTextColor="rgba(255,255,255,0.5)"
                style={styles.headerSearchText}
                returnKeyType="search"
              />
            </View>
          </View>
        }
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filtered.map((c, i) => (
          <TouchableOpacity
            key={c.id}
            style={[styles.row, i < filtered.length - 1 && styles.rowBorder]}
            activeOpacity={0.7}
            onPress={() =>
              navigation.replace('ChatConversation', {
                contactId: c.id,
                name: c.name,
                color: c.color,
              })
            }
          >
            <View style={[styles.avatar, { backgroundColor: c.color }]}>
              <Text style={styles.avatarText}>
                {c.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()}
              </Text>
            </View>
            <View style={styles.body}>
              <Text style={styles.name} numberOfLines={1}>{c.name}</Text>
              <Text style={styles.role} numberOfLines={1}>{c.role}</Text>
            </View>
            <Icon name="chevron-right" size={16} color={C.mut} />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  headerSearch: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerSearchInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.55)',
    paddingHorizontal: 12,
    height: 36,
  },
  headerSearchText: { flex: 1, color: '#fff', fontSize: 13, fontFamily: F.regular, height: 36 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 18, paddingTop: 14, paddingBottom: 32 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
  },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: C.line },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarText: { fontSize: 15, fontFamily: F.extraBold, color: '#fff' },
  body: { flex: 1 },
  name: { fontSize: 14.5, fontFamily: F.bold, color: C.ink },
  role: { fontSize: 12.5, color: C.sec, marginTop: 2 },
});
