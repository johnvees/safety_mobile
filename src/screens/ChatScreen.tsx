import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import Icon from '@/components/Icon';
import { C, GradientHeaders } from '@/theme/colors';
import { F } from '@/theme/typography';
import GradientHeader from '@/components/GradientHeader';
import ChatFabMenu from '@/components/ChatFabMenu';
import SwipeableRow from '@/components/SwipeableRow';
import { useChatStore } from '@/context/ChatContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function ChatScreen() {
  const navigation = useNavigation<Nav>();
  const [search, setSearch] = useState('');
  const { conversations, archiveChat, softDeleteChat } = useChatStore();
  const searchQ = search.trim().toLowerCase();
  const archivedList = conversations.filter((c) => c.archived && !c.deletedAt);
  const filtered = conversations.filter(
    (c) => !c.archived && !c.deletedAt && c.name.toLowerCase().includes(searchQ),
  );

  function deleteChat(id: string) {
    Alert.alert('Hapus Percakapan', 'Percakapan akan dipindahkan ke Pesan Terhapus.', [
      { text: 'Batal', style: 'cancel' },
      { text: 'Hapus', style: 'destructive', onPress: () => softDeleteChat(id) },
    ]);
  }

  return (
    <View style={styles.container}>
      <GradientHeader
        title="Chat HSE"
        colors={GradientHeaders.chat as [string, string]}
        subtitle={
          <View style={styles.headerSearch}>
            <View style={styles.headerSearchInput}>
              <Icon name="search" size={15} color="rgba(255,255,255,0.6)" />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Cari percakapan..."
                placeholderTextColor="rgba(255,255,255,0.5)"
                style={styles.headerSearchText}
                returnKeyType="search"
              />
              {search.length > 0 && (
                <TouchableOpacity
                  onPress={() => setSearch('')}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Icon name="x" size={14} color="rgba(255,255,255,0.7)" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        }
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {archivedList.length > 0 && (
          <TouchableOpacity
            style={styles.archivedRow}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('ChatArchived')}
          >
            <View style={styles.archivedIconWrap}>
              <Icon name="archive" size={18} color={C.teal} />
            </View>
            <Text style={styles.archivedLabel}>Chat Diarsipkan</Text>
            <View style={styles.archivedCountBadge}>
              <Text style={styles.archivedCountText}>{archivedList.length}</Text>
            </View>
            <Icon name="chevron-right" size={16} color={C.mut} />
          </TouchableOpacity>
        )}

        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Icon name="message-circle" size={40} color={C.mut} />
            <Text style={styles.emptyText}>Tidak ada percakapan</Text>
          </View>
        ) : (
          filtered.map((c, i) => (
            <SwipeableRow key={c.id} onArchive={() => archiveChat(c.id)} onDelete={() => deleteChat(c.id)}>
              <TouchableOpacity
                style={[styles.row, i < filtered.length - 1 && styles.rowBorder]}
                activeOpacity={0.7}
                onPress={() =>
                  navigation.navigate('ChatConversation', {
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
            </SwipeableRow>
          ))
        )}
      </ScrollView>

      <ChatFabMenu />
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
  archivedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: C.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.line,
    marginBottom: 10,
  },
  archivedIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: C.teal100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  archivedLabel: { flex: 1, fontSize: 14, fontFamily: F.bold, color: C.ink },
  archivedCountBadge: {
    backgroundColor: C.surface,
    borderRadius: 10,
    minWidth: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  archivedCountText: { fontSize: 11.5, fontFamily: F.bold, color: C.sec },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 18, paddingTop: 14, paddingBottom: 100 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    backgroundColor: C.bg,
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
