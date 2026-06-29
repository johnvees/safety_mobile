import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from '@/components/Icon';
import { C } from '@/theme/colors';
import { F } from '@/theme/typography';
import { RootStackParamList } from '@/navigation/types';

type RouteP = RouteProp<RootStackParamList, 'HseModulDetail'>;
type Nav = NativeStackNavigationProp<RootStackParamList>;

const CAT_COLORS: Record<string, { bg: string; text: string }> = {
  K3: { bg: C.red100, text: C.danger },
  Lingkungan: { bg: C.green100, text: C.ok },
  Kesehatan: { bg: C.teal100, text: C.teal },
};

const MODULE_DESC: Record<string, string> = {
  SoP: 'Dokumen ini menetapkan prosedur standar yang wajib diikuti oleh seluruh karyawan terkait. Pastikan semua personil memahami dan mematuhi setiap langkah yang tertuang dalam prosedur ini.',
  WI: 'Instruksi kerja ini memberikan panduan teknis langkah demi langkah untuk memastikan keselamatan dan keseragaman dalam pelaksanaan pekerjaan di lapangan.',
  Form: 'Formulir ini digunakan untuk mendokumentasikan hasil pemeriksaan, inspeksi, atau laporan kejadian. Isi dengan lengkap dan akurat untuk mendukung tindakan perbaikan.',
  Edukasi: 'Materi edukasi ini dirancang untuk meningkatkan kesadaran dan pengetahuan karyawan terkait aspek keselamatan, kesehatan, dan lingkungan kerja.',
};

const DUMMY_COMMENTS = [
  { id: '1', name: 'Andi Wijaya', initials: 'AW', time: '2j', text: 'Di plant kami juga ada isu serupa, terima kasih remindernya 🙏' },
  { id: '2', name: 'Dewi Lestari', initials: 'DL', time: '1j', text: 'Sudah saya teruskan ke tim Maintenance Kediri.' },
  { id: '3', name: 'Rudi Hartono', initials: 'RH', time: '45m', text: 'Apakah ada revisi terbaru untuk prosedur ini?' },
];

const DUMMY_FILES = [
  { id: '1', name: 'Lampiran_Prosedur_Utama.pdf', size: '2.4 MB', icon: 'file-text' },
  { id: '2', name: 'Diagram_Alur_Kerja.png', size: '840 KB', icon: 'image' },
];

export default function HseModulDetailScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteP>();
  const insets = useSafeAreaInsets();
  const { title, cat, module: moduleType, updated } = route.params;

  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(48);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState(DUMMY_COMMENTS);

  const catStyle = CAT_COLORS[cat] ?? { bg: C.surface, text: C.sec };
  const isEdukasi = moduleType === 'Edukasi';
  const isForm = moduleType === 'Form';
  const hasVideo = isEdukasi;
  const hasFiles = isForm || moduleType === 'SoP' || moduleType === 'WI';

  function handleLike() {
    setLiked((v) => !v);
    setLikeCount((n) => (liked ? n - 1 : n + 1));
  }

  function handleSend() {
    const text = comment.trim();
    if (!text) return;
    setComments((prev) => [
      ...prev,
      { id: Date.now().toString(), name: 'Saya', initials: 'Me', time: 'Baru', text },
    ]);
    setComment('');
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: C.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Icon name="arrow-left" size={20} color={C.ink} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {moduleType}
        </Text>
        <TouchableOpacity
          style={styles.shareBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Icon name="share" size={18} color={C.sec} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Media area */}
        {hasVideo ? (
          <View style={styles.videoContainer}>
            <LinearGradient
              colors={['#0f172a', '#1e293b']}
              style={styles.videoGradient}
            >
              <View style={styles.stripeOverlay}>
                {Array.from({ length: 12 }).map((_, i) => (
                  <View key={i} style={[styles.stripe, { top: i * 38 - 60 }]} />
                ))}
              </View>
              <TouchableOpacity style={styles.playBtn} activeOpacity={0.8}>
                <Icon name="play" size={28} color={C.ink} />
              </TouchableOpacity>
              <View style={styles.durationBadge}>
                <Text style={styles.durationText}>4:32</Text>
              </View>
            </LinearGradient>
          </View>
        ) : isForm ? (
          <View style={styles.fileBanner}>
            <View style={styles.fileBannerIcon}>
              <Icon name="file-text" size={32} color={C.warn} />
            </View>
            <Text style={styles.fileBannerLabel}>Formulir Digital</Text>
            <Text style={styles.fileBannerSub}>Buka & isi langsung di aplikasi</Text>
          </View>
        ) : (
          <View style={styles.docBanner}>
            <LinearGradient
              colors={['#1e3a5f', '#0f172a']}
              style={styles.docBannerGradient}
            >
              <Icon name="book-open" size={36} color="rgba(255,255,255,0.8)" />
              <Text style={styles.docBannerText}>{moduleType}</Text>
            </LinearGradient>
          </View>
        )}

        {/* Content */}
        <View style={styles.content}>
          {/* Cat badge + title */}
          <View style={[styles.catBadge, { backgroundColor: catStyle.bg }]}>
            <Text style={[styles.catBadgeText, { color: catStyle.text }]}>{cat}</Text>
          </View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.desc}>{MODULE_DESC[moduleType] ?? ''}</Text>
          <Text style={styles.updatedText}>Diperbarui {updated}</Text>

          {/* Like / Comment buttons */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: liked ? C.red100 : C.surface }]}
              onPress={handleLike}
              activeOpacity={0.75}
            >
              <Icon name={liked ? 'heart-filled' : 'heart'} size={16} color={liked ? C.danger : C.sec} />
              <Text style={[styles.actionText, { color: liked ? C.danger : C.sec }]}>
                {likeCount} Suka
              </Text>
            </TouchableOpacity>
            <View style={[styles.actionBtn, { backgroundColor: C.surface }]}>
              <Icon name="eye" size={16} color={C.sec} />
              <Text style={[styles.actionText, { color: C.sec }]}>124 Dilihat</Text>
            </View>
          </View>

          {/* Files / attachments */}
          {hasFiles && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Lampiran</Text>
              {DUMMY_FILES.map((f) => (
                <TouchableOpacity key={f.id} style={styles.fileRow} activeOpacity={0.7}>
                  <View style={styles.fileIcon}>
                    <Icon name={f.icon} size={18} color={C.teal} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.fileName} numberOfLines={1}>{f.name}</Text>
                    <Text style={styles.fileSize}>{f.size}</Text>
                  </View>
                  <Icon name="download" size={16} color={C.mut} />
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Comments */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Komentar ({comments.length})</Text>
            {comments.map((c, i) => (
              <View key={c.id}>
                <View style={styles.commentRow}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{c.initials}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={styles.commentMeta}>
                      <Text style={styles.commentName}>{c.name}</Text>
                      <Text style={styles.commentTime}>{c.time}</Text>
                    </View>
                    <Text style={styles.commentText}>{c.text}</Text>
                  </View>
                </View>
                {i < comments.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Comment input */}
      <View style={[styles.inputBar, { paddingBottom: insets.bottom + 12 }]}>
        <TextInput
          style={styles.commentInput}
          placeholder="Tulis komentar..."
          placeholderTextColor={C.mut}
          value={comment}
          onChangeText={setComment}
          returnKeyType="send"
          onSubmitEditing={handleSend}
        />
        <TouchableOpacity
          style={[styles.sendBtn, { backgroundColor: C.teal }]}
          onPress={handleSend}
          activeOpacity={0.85}
        >
          <Icon name="send" size={16} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingBottom: 14,
    backgroundColor: C.white,
    borderBottomWidth: 1,
    borderBottomColor: C.line,
    gap: 10,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: C.surface,
  },
  headerTitle: { flex: 1, fontSize: 17, fontFamily: F.bold, color: C.ink },
  shareBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Video
  videoContainer: { width: '100%', height: 220, overflow: 'hidden' },
  videoGradient: { flex: 1, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  stripeOverlay: { ...StyleSheet.absoluteFillObject, overflow: 'hidden' },
  stripe: {
    position: 'absolute',
    left: -200,
    right: -200,
    height: 18,
    backgroundColor: 'rgba(255,255,255,0.04)',
    transform: [{ rotate: '-35deg' }],
  },
  playBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 4,
  },
  durationBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.75)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  durationText: { fontSize: 12, fontFamily: F.bold, color: '#fff' },

  // File banner
  fileBanner: {
    height: 160,
    backgroundColor: C.amber100,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  fileBannerIcon: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: C.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileBannerLabel: { fontSize: 15, fontFamily: F.bold, color: C.warn },
  fileBannerSub: { fontSize: 12, fontFamily: F.regular, color: C.warn700 },

  // Doc banner
  docBanner: { width: '100%', height: 160, overflow: 'hidden' },
  docBannerGradient: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  docBannerText: { fontSize: 14, fontFamily: F.bold, color: 'rgba(255,255,255,0.7)', letterSpacing: 1 },

  // Content
  content: { padding: 20, gap: 12 },
  catBadge: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  catBadgeText: { fontSize: 13, fontFamily: F.semiBold },
  title: { fontSize: 22, fontFamily: F.extraBold, color: C.ink, lineHeight: 30 },
  desc: { fontSize: 14, fontFamily: F.regular, color: C.sec, lineHeight: 22 },
  updatedText: { fontSize: 12, fontFamily: F.regular, color: C.mut },

  // Actions
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 4 },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 13,
    borderRadius: 14,
  },
  actionText: { fontSize: 14, fontFamily: F.semiBold },

  // Section
  section: { gap: 10, marginTop: 6 },
  sectionLabel: { fontSize: 15, fontFamily: F.bold, color: C.ink },

  // Files
  fileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: C.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.line,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  fileIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: C.teal100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileName: { fontSize: 13, fontFamily: F.semiBold, color: C.ink },
  fileSize: { fontSize: 11, fontFamily: F.regular, color: C.mut, marginTop: 2 },

  // Comments
  commentRow: { flexDirection: 'row', gap: 12, paddingVertical: 12 },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: C.surface,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarText: { fontSize: 12, fontFamily: F.bold, color: C.sec },
  commentMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 3 },
  commentName: { fontSize: 13, fontFamily: F.bold, color: C.ink },
  commentTime: { fontSize: 12, fontFamily: F.regular, color: C.mut },
  commentText: { fontSize: 13, fontFamily: F.regular, color: C.sec, lineHeight: 19 },
  divider: { height: 1, backgroundColor: C.line, marginLeft: 50 },

  // Input bar
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 18,
    paddingTop: 12,
    backgroundColor: C.white,
    borderTopWidth: 1,
    borderTopColor: C.line,
  },
  commentInput: {
    flex: 1,
    height: 44,
    backgroundColor: C.surface,
    borderRadius: 22,
    paddingHorizontal: 16,
    fontSize: 14,
    fontFamily: F.regular,
    color: C.ink,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
