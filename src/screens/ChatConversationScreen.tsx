import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Image,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import Icon from '@/components/Icon';
import ChatBubble from '@/components/ChatBubble';
import { C, GradientHeaders } from '@/theme/colors';
import { F } from '@/theme/typography';
import { CONVERSATIONS, ChatMessage, ChatAttachment, ChatReplyRef } from '@/data/chatData';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Rt = RouteProp<RootStackParamList, 'ChatConversation'>;

export default function ChatConversationScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<Rt>();
  const insets = useSafeAreaInsets();
  const existing = CONVERSATIONS.find((c) => c.id === params.contactId);
  const [messages, setMessages] = useState<ChatMessage[]>(existing?.messages ?? []);
  const [draft, setDraft] = useState('');
  const [pendingAttachments, setPendingAttachments] = useState<ChatAttachment[]>([]);
  const [attachMenuOpen, setAttachMenuOpen] = useState(false);
  const [actionSheetMsg, setActionSheetMsg] = useState<ChatMessage | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<ChatReplyRef | null>(null);

  function nowTime() {
    return new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  }

  function send() {
    const text = draft.trim();
    if (!text && pendingAttachments.length === 0) return;

    if (editingId) {
      setMessages((prev) =>
        prev.map((m) => (m.id === editingId ? { ...m, text, edited: true } : m)),
      );
      setEditingId(null);
      setDraft('');
      return;
    }

    setMessages((prev) => [
      ...prev,
      {
        id: `local-${Date.now()}`,
        text,
        isMe: true,
        time: nowTime(),
        attachments: pendingAttachments.length > 0 ? pendingAttachments : undefined,
        replyTo: replyingTo ?? undefined,
      },
    ]);
    setDraft('');
    setPendingAttachments([]);
    setReplyingTo(null);
  }

  function startReply(msg: ChatMessage) {
    setReplyingTo({
      id: msg.id,
      senderName: msg.isMe ? 'Anda' : params.name,
      text: msg.text || (msg.attachments?.length ? 'Lampiran' : ''),
    });
    setActionSheetMsg(null);
  }

  function cancelReply() {
    setReplyingTo(null);
  }

  function startEdit(msg: ChatMessage) {
    setEditingId(msg.id);
    setDraft(msg.text);
    setReplyingTo(null);
    setActionSheetMsg(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setDraft('');
  }

  function unsendMessage(msg: ChatMessage) {
    setActionSheetMsg(null);
    Alert.alert('Hapus Pesan', 'Hapus pesan ini untuk semua orang?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: () =>
          setMessages((prev) =>
            prev.map((m) =>
              m.id === msg.id ? { ...m, deleted: true, text: '', attachments: undefined } : m,
            ),
          ),
      },
    ]);
  }

  async function pickMedia() {
    setAttachMenuOpen(false);
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Izin diperlukan', 'Akses galeri diperlukan untuk melampirkan foto/video.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      allowsMultipleSelection: true,
      quality: 0.7,
    });
    if (result.canceled) return;
    const picked: ChatAttachment[] = result.assets.map((a, i) => ({
      id: `att-${Date.now()}-${i}`,
      type: a.type === 'video' ? 'video' : 'image',
      uri: a.uri,
      name: a.fileName ?? `media-${i}`,
    }));
    setPendingAttachments((prev) => [...prev, ...picked]);
  }

  async function pickFile() {
    setAttachMenuOpen(false);
    const result = await DocumentPicker.getDocumentAsync({ multiple: true, type: '*/*' });
    if (result.canceled) return;
    const picked: ChatAttachment[] = result.assets.map((a, i) => ({
      id: `att-${Date.now()}-${i}`,
      type: 'file',
      uri: a.uri,
      name: a.name,
    }));
    setPendingAttachments((prev) => [...prev, ...picked]);
  }

  function removePending(id: string) {
    setPendingAttachments((prev) => prev.filter((a) => a.id !== id));
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={insets.top}
    >
      <LinearGradient
        colors={GradientHeaders.chat as [string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + 12 }]}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.iconBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Icon name="arrow-left" size={22} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.headerProfile}
          activeOpacity={0.75}
          onPress={() => navigation.navigate('ChatProfile', { name: params.name, color: params.color })}
        >
          <View style={[styles.avatar, { backgroundColor: params.color }]}>
            <Text style={styles.avatarText}>
              {params.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()}
            </Text>
          </View>
          <Text style={styles.title} numberOfLines={1}>{params.name}</Text>
        </TouchableOpacity>
        <View style={styles.iconBtnPlaceholder} />
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.length === 0 ? (
          <View style={styles.empty}>
            <Icon name="message-circle" size={40} color={C.mut} />
            <Text style={styles.emptyText}>Mulai percakapan dengan {params.name}</Text>
          </View>
        ) : (
          messages.map((m) => (
            <ChatBubble
              key={m.id}
              message={m.text}
              isMe={m.isMe}
              timestamp={m.time}
              attachments={m.attachments}
              edited={m.edited}
              deleted={m.deleted}
              replyTo={m.replyTo}
              onLongPress={!m.deleted ? () => setActionSheetMsg(m) : undefined}
              onSwipeReply={!m.deleted ? () => startReply(m) : undefined}
            />
          ))
        )}
      </ScrollView>

      {pendingAttachments.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.pendingRow}
          contentContainerStyle={styles.pendingRowContent}
        >
          {pendingAttachments.map((a) => (
            <View key={a.id} style={styles.pendingChip}>
              {a.type === 'file' ? (
                <View style={styles.pendingFile}>
                  <Icon name="file-text" size={18} color={C.ink} />
                  <Text style={styles.pendingFileName} numberOfLines={1}>{a.name}</Text>
                </View>
              ) : (
                <Image source={{ uri: a.uri }} style={styles.pendingImage} />
              )}
              <TouchableOpacity style={styles.pendingRemove} onPress={() => removePending(a.id)}>
                <Icon name="x" size={12} color="#fff" />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}

      {replyingTo && !editingId && (
        <View style={styles.replyBanner}>
          <Icon name="arrow-left" size={14} color={C.teal} style={{ transform: [{ rotate: '90deg' }] }} />
          <View style={styles.replyBannerBody}>
            <Text style={styles.replyBannerName}>Membalas {replyingTo.senderName}</Text>
            <Text style={styles.replyBannerText} numberOfLines={1}>{replyingTo.text}</Text>
          </View>
          <TouchableOpacity onPress={cancelReply}>
            <Icon name="x" size={16} color={C.mut} />
          </TouchableOpacity>
        </View>
      )}

      {editingId && (
        <View style={styles.editBanner}>
          <Icon name="edit" size={14} color={C.teal} />
          <Text style={styles.editBannerText}>Mengedit pesan</Text>
          <TouchableOpacity onPress={cancelEdit}>
            <Icon name="x" size={16} color={C.mut} />
          </TouchableOpacity>
        </View>
      )}

      <View style={[styles.inputBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <TouchableOpacity style={styles.attachBtn} onPress={() => setAttachMenuOpen(true)}>
          <Icon name="plus" size={20} color={C.mut} />
        </TouchableOpacity>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder="Tulis pesan..."
          placeholderTextColor={C.mut}
          style={styles.input}
          multiline
        />
        <TouchableOpacity
          style={[styles.sendBtn, !draft.trim() && pendingAttachments.length === 0 && styles.sendBtnDisabled]}
          onPress={send}
          disabled={!draft.trim() && pendingAttachments.length === 0}
        >
          <Icon name={editingId ? 'check' : 'send'} size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      <Modal visible={attachMenuOpen} transparent animationType="fade">
        <TouchableOpacity
          style={styles.sheetOverlay}
          activeOpacity={1}
          onPress={() => setAttachMenuOpen(false)}
        >
          <View style={styles.sheet}>
            <TouchableOpacity style={styles.sheetOption} onPress={pickMedia}>
              <View style={[styles.sheetIconWrap, { backgroundColor: C.teal100 }]}>
                <Icon name="image" size={20} color={C.teal} />
              </View>
              <Text style={styles.sheetLabel}>Foto & Video</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.sheetOption} onPress={pickFile}>
              <View style={[styles.sheetIconWrap, { backgroundColor: C.violet100 }]}>
                <Icon name="file-text" size={20} color={C.violet} />
              </View>
              <Text style={styles.sheetLabel}>Dokumen</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.sheetCancel} onPress={() => setAttachMenuOpen(false)}>
              <Text style={styles.sheetCancelText}>Batal</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal visible={!!actionSheetMsg} transparent animationType="fade">
        <TouchableOpacity
          style={styles.sheetOverlay}
          activeOpacity={1}
          onPress={() => setActionSheetMsg(null)}
        >
          <View style={styles.sheet}>
            <TouchableOpacity
              style={styles.sheetOption}
              onPress={() => actionSheetMsg && startReply(actionSheetMsg)}
            >
              <View style={[styles.sheetIconWrap, { backgroundColor: C.teal100 }]}>
                <Icon
                  name="arrow-left"
                  size={20}
                  color={C.teal}
                  style={{ transform: [{ rotate: '90deg' }] }}
                />
              </View>
              <Text style={styles.sheetLabel}>Balas</Text>
            </TouchableOpacity>
            {actionSheetMsg?.isMe && (
              <>
                <TouchableOpacity
                  style={styles.sheetOption}
                  onPress={() => actionSheetMsg && startEdit(actionSheetMsg)}
                >
                  <View style={[styles.sheetIconWrap, { backgroundColor: C.teal100 }]}>
                    <Icon name="edit" size={20} color={C.teal} />
                  </View>
                  <Text style={styles.sheetLabel}>Edit Pesan</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.sheetOption}
                  onPress={() => actionSheetMsg && unsendMessage(actionSheetMsg)}
                >
                  <View style={[styles.sheetIconWrap, { backgroundColor: C.red100 }]}>
                    <Icon name="trash" size={20} color={C.danger} />
                  </View>
                  <Text style={[styles.sheetLabel, { color: C.danger }]}>Hapus / Unsend</Text>
                </TouchableOpacity>
              </>
            )}
            <TouchableOpacity style={styles.sheetCancel} onPress={() => setActionSheetMsg(null)}>
              <Text style={styles.sheetCancelText}>Batal</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 18,
    paddingBottom: 16,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnPlaceholder: { width: 40, height: 40 },
  headerProfile: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 13, fontFamily: F.extraBold, color: '#fff' },
  title: { flex: 1, fontSize: 17, fontFamily: F.bold, color: '#fff' },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 18, paddingTop: 14, paddingBottom: 16 },
  empty: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyText: { fontSize: 13.5, color: C.mut, fontFamily: F.medium, textAlign: 'center' },
  pendingRow: { maxHeight: 76, backgroundColor: C.white, borderTopWidth: 1, borderTopColor: C.line },
  pendingRowContent: { paddingHorizontal: 14, paddingVertical: 10, gap: 10 },
  pendingChip: { position: 'relative' },
  pendingImage: { width: 56, height: 56, borderRadius: 10, backgroundColor: C.line },
  pendingFile: {
    width: 90,
    height: 56,
    borderRadius: 10,
    backgroundColor: C.bg,
    borderWidth: 1,
    borderColor: C.line,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: 6,
  },
  pendingFileName: { fontSize: 9.5, color: C.ink, fontFamily: F.medium },
  pendingRemove: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: C.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 8,
    backgroundColor: C.teal100,
  },
  editBannerText: { flex: 1, fontSize: 12.5, color: C.teal, fontFamily: F.medium },
  replyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 8,
    backgroundColor: C.teal100,
  },
  replyBannerBody: { flex: 1 },
  replyBannerName: { fontSize: 12, fontFamily: F.bold, color: C.teal },
  replyBannerText: { fontSize: 12, fontFamily: F.regular, color: C.sec, marginTop: 1 },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    paddingHorizontal: 18,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: C.line,
    backgroundColor: C.white,
  },
  attachBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.bg,
    borderWidth: 1,
    borderColor: C.line,
  },
  input: {
    flex: 1,
    maxHeight: 100,
    fontSize: 14,
    fontFamily: F.regular,
    color: C.ink,
    backgroundColor: C.bg,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.line,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.teal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: { opacity: 0.4 },
  sheetOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: C.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 28,
  },
  sheetOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 12,
  },
  sheetIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetLabel: { fontSize: 15, fontFamily: F.medium, color: C.ink },
  sheetCancel: { alignItems: 'center', paddingVertical: 14, marginTop: 4 },
  sheetCancelText: { fontSize: 15, fontFamily: F.bold, color: C.mut },
});
