import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from '@/components/Icon';
import { C, GradientHeaders } from '@/theme/colors';
import { F } from '@/theme/typography';
import GradientHeader from '@/components/GradientHeader';
import { useChatStore } from '@/context/ChatContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function ChatArchivedScreen() {
  const navigation = useNavigation<Nav>();
  const { conversations, unarchiveChat } = useChatStore();
  const list = conversations.filter((c) => c.archived && !c.deletedAt);

  return (
    <View style={styles.container}>
      <GradientHeader
        title="Chat Diarsipkan"
        colors={GradientHeaders.chat as [string, string]}
        onBack={() => navigation.goBack()}
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {list.length === 0 ? (
          <View style={styles.empty}>
            <Icon name="archive" size={40} color={C.mut} />
            <Text style={styles.emptyText}>Tidak ada chat diarsipkan</Text>
          </View>
        ) : (
          list.map((c, i) => (
            <View key={c.id} style={[styles.row, i < list.length - 1 && styles.rowBorder]}>
              <TouchableOpacity
                style={styles.rowMain}
                activeOpacity={0.7}
                onPress={() =>
                  navigation.navigate('ChatConversation', { contactId: c.id, name: c.name, color: c.color })
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
              </TouchableOpacity>
              <TouchableOpacity style={styles.unarchiveBtn} onPress={() => unarchiveChat(c.id)}>
                <Icon name="archive" size={16} color={C.teal} />
                <Text style={styles.unarchiveText}>Batal Arsip</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  scrollContent: { paddingHorizontal: 18, paddingTop: 14, paddingBottom: 32 },
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
  unarchiveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: C.teal100,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginLeft: 58,
  },
  unarchiveText: { fontSize: 12.5, fontFamily: F.bold, color: C.teal },
  empty: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyText: { fontSize: 14, color: C.mut, fontFamily: F.medium },
});
