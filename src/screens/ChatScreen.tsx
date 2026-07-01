import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import Icon from '@/components/Icon';
import { C, GradientHeaders } from '@/theme/colors';
import { F } from '@/theme/typography';
import GradientHeader from '@/components/GradientHeader';

const CONVERSATIONS = [
  {
    id: '1',
    name: 'Tim HSE Pusat',
    lastMessage: 'Mohon segera lengkapi laporan inspeksi minggu ini.',
    time: '09:12',
    unread: 2,
    color: C.teal,
  },
  {
    id: '2',
    name: 'Budi Santoso',
    lastMessage: 'Sudah saya upload dokumen JSA-nya pak.',
    time: '08:45',
    unread: 1,
    color: C.ok,
  },
  {
    id: '3',
    name: 'Koordinator K3 Area B',
    lastMessage: 'Terima kasih konfirmasinya.',
    time: 'Kemarin',
    unread: 0,
    color: C.warn,
  },
  {
    id: '4',
    name: 'Grup Inspeksi Lapangan',
    lastMessage: 'Jadwal inspeksi besok pindah jadi jam 08.00.',
    time: 'Kemarin',
    unread: 0,
    color: C.violet,
  },
];

export default function ChatScreen() {
  const [search, setSearch] = useState('');
  const searchQ = search.trim().toLowerCase();
  const filtered = CONVERSATIONS.filter((c) =>
    c.name.toLowerCase().includes(searchQ),
  );

  return (
    <View style={styles.container}>
      <GradientHeader
        title="Chat HSE"
        colors={GradientHeaders.chat as [string, string]}
        subtitle={
          <View style={styles.headerSearch}>
            <View style={styles.headerSearchInput}>
              <Icon name="search" size={16} color="rgba(255,255,255,0.7)" />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Cari percakapan..."
                placeholderTextColor="rgba(255,255,255,0.6)"
                style={styles.headerSearchText}
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
        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Icon name="message-circle" size={40} color={C.mut} />
            <Text style={styles.emptyText}>Tidak ada percakapan</Text>
          </View>
        ) : (
          filtered.map((c, i) => (
            <TouchableOpacity
              key={c.id}
              style={[styles.row, i < filtered.length - 1 && styles.rowBorder]}
              activeOpacity={0.7}
            >
              <View style={[styles.avatar, { backgroundColor: c.color }]}>
                <Text style={styles.avatarText}>
                  {c.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()}
                </Text>
              </View>
              <View style={styles.body}>
                <Text style={styles.name} numberOfLines={1}>{c.name}</Text>
                <Text style={styles.lastMsg} numberOfLines={1}>{c.lastMessage}</Text>
              </View>
              <View style={styles.meta}>
                <Text style={styles.time}>{c.time}</Text>
                {c.unread > 0 && (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadText}>{c.unread}</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  headerSearch: { flexDirection: 'row' },
  headerSearchInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 38,
  },
  headerSearchText: { flex: 1, color: '#fff', fontSize: 13.5, fontFamily: F.medium },
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
  lastMsg: { fontSize: 12.5, color: C.sec, marginTop: 2 },
  meta: { alignItems: 'flex-end', gap: 6 },
  time: { fontSize: 11, color: C.mut },
  unreadBadge: {
    backgroundColor: C.danger,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  unreadText: { fontSize: 11, fontFamily: F.extraBold, color: '#fff' },
  empty: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyText: { fontSize: 14, color: C.mut, fontFamily: F.medium },
});
