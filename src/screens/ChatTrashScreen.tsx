import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import Icon from '@/components/Icon';
import { C, GradientHeaders } from '@/theme/colors';
import { F } from '@/theme/typography';
import GradientHeader from '@/components/GradientHeader';
import { daysRemaining, TRASH_RETENTION_DAYS } from '@/data/chatData';
import { useChatStore } from '@/context/ChatContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function ChatTrashScreen() {
  const navigation = useNavigation<Nav>();
  const { conversations, restoreChat, permanentlyDeleteChat } = useChatStore();
  const list = conversations.filter((c) => !!c.deletedAt);

  function confirmPermanentDelete(id: string, name: string) {
    Alert.alert(
      'Hapus Permanen',
      `Percakapan dengan "${name}" akan dihapus permanen dan tidak dapat dikembalikan. Lanjutkan?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus Permanen',
          style: 'destructive',
          onPress: () => permanentlyDeleteChat(id),
        },
      ],
    );
  }

  return (
    <View style={styles.container}>
      <GradientHeader
        title="Pesan Terhapus"
        colors={GradientHeaders.chat as [string, string]}
        onBack={() => navigation.goBack()}
      />

      <View style={styles.notice}>
        <Icon name="alert-circle" size={16} color={C.warn} />
        <Text style={styles.noticeText}>
          Percakapan yang dihapus akan disimpan di sini selama {TRASH_RETENTION_DAYS} hari,
          setelah itu akan dihapus secara permanen dan tidak dapat dikembalikan.
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {list.length === 0 ? (
          <View style={styles.empty}>
            <Icon name="trash" size={40} color={C.mut} />
            <Text style={styles.emptyText}>Tidak ada pesan terhapus</Text>
          </View>
        ) : (
          list.map((c, i) => (
            <View key={c.id} style={[styles.row, i < list.length - 1 && styles.rowBorder]}>
              <View style={styles.rowMain}>
                <View style={[styles.avatar, { backgroundColor: c.color }]}>
                  <Text style={styles.avatarText}>
                    {c.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()}
                  </Text>
                </View>
                <View style={styles.body}>
                  <Text style={styles.name} numberOfLines={1}>{c.name}</Text>
                  <Text style={styles.lastMsg} numberOfLines={1}>{c.lastMessage}</Text>
                  <Text style={styles.retention}>
                    {c.deletedAt
                      ? `Dihapus permanen dalam ${daysRemaining(c.deletedAt)} hari`
                      : ''}
                  </Text>
                </View>
              </View>
              <View style={styles.actionsRow}>
                <TouchableOpacity style={styles.restoreBtn} onPress={() => restoreChat(c.id)}>
                  <Icon name="refresh" size={15} color={C.teal} />
                  <Text style={styles.restoreText}>Pulihkan</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => confirmPermanentDelete(c.id, c.name)}
                >
                  <Icon name="trash" size={15} color={C.danger} />
                  <Text style={styles.deleteText}>Hapus Permanen</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  notice: {
    flexDirection: 'row',
    gap: 10,
    marginHorizontal: 18,
    marginTop: 14,
    padding: 12,
    backgroundColor: C.amber100,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  noticeText: { flex: 1, fontSize: 12, color: C.warn700, fontFamily: F.medium, lineHeight: 17 },
  scrollContent: { paddingHorizontal: 18, paddingTop: 10, paddingBottom: 32 },
  row: { paddingVertical: 14, gap: 10 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: C.line },
  rowMain: { flexDirection: 'row', alignItems: 'center', gap: 12 },
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
  retention: { fontSize: 11, color: C.danger, marginTop: 3, fontFamily: F.medium },
  actionsRow: { flexDirection: 'row', gap: 10, marginLeft: 58 },
  restoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: C.teal100,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  restoreText: { fontSize: 12.5, fontFamily: F.bold, color: C.teal },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: C.red100,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  deleteText: { fontSize: 12.5, fontFamily: F.bold, color: C.danger },
  empty: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyText: { fontSize: 14, color: C.mut, fontFamily: F.medium },
});
