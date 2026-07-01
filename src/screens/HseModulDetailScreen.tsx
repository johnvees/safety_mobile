import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Platform, KeyboardAvoidingView, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from '@/components/Icon';
import HseEditModuleModal from '@/components/HseEditModuleModal';
import { C } from '@/theme/colors';
import { RootStackParamList } from '@/navigation/types';
import { MODULE_META } from '@/constants/hseJenis';
import { Attachment } from '@/data/hseDocs';
import { styles } from './HseModulDetailScreen.styles';

type RouteP = RouteProp<RootStackParamList, 'HseModulDetail'>;
type Nav = NativeStackNavigationProp<RootStackParamList>;
type Poin = { id: string; text: string };

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

const DUMMY_FILES: Attachment[] = [
  { id: '1', type: 'file', name: 'Lampiran_Prosedur_Utama.pdf' },
  { id: '2', type: 'image', name: 'Diagram_Alur_Kerja.png' },
];

export default function HseModulDetailScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteP>();
  const insets = useSafeAreaInsets();
  const { title, cat, module: moduleType, updated, attachments, deskripsi, poin, onSave, onDelete } = route.params;

  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(48);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState(DUMMY_COMMENTS);

  const [docTitle, setDocTitle] = useState(title);
  const [docCat, setDocCat] = useState(cat);
  const [docAttachments, setDocAttachments] = useState<Attachment[]>(
    attachments && attachments.length > 0 ? attachments : DUMMY_FILES,
  );
  const [docDeskripsi, setDocDeskripsi] = useState(deskripsi ?? MODULE_DESC[moduleType] ?? '');
  const [docPoin, setDocPoin] = useState<Poin[]>(poin && poin.length > 0 ? poin : []);

  const [editOpen, setEditOpen] = useState(false);

  const catStyle = CAT_COLORS[docCat] ?? { bg: C.surface, text: C.sec };
  const meta = MODULE_META[moduleType] ?? MODULE_META['SoP'];
  const isEdukasi = moduleType === 'Edukasi';
  const isForm = moduleType === 'Form';
  const hasVideo = isEdukasi;
  const hasFiles = isForm || moduleType === 'SoP' || moduleType === 'WI';

  function handleEditSave(updated: { title: string; cat: string; attachments: Attachment[]; deskripsi: string; poin: Poin[] }) {
    setDocTitle(updated.title);
    setDocCat(updated.cat);
    setDocAttachments(updated.attachments);
    setDocDeskripsi(updated.deskripsi);
    setDocPoin(updated.poin);
    onSave?.(updated);
    setEditOpen(false);
  }

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
        <View style={styles.headerActions}>
          {onSave && (
            <TouchableOpacity
              style={styles.headerActionBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              onPress={() => setEditOpen(true)}
            >
              <Icon name="edit-2" size={18} color={C.sec} />
            </TouchableOpacity>
          )}
          {onDelete && (
            <TouchableOpacity
              style={styles.headerActionBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              onPress={() => {
                Alert.alert('Hapus modul?', docTitle, [
                  { text: 'Batal', style: 'cancel' },
                  {
                    text: 'Hapus',
                    style: 'destructive',
                    onPress: () => {
                      onDelete?.();
                      navigation.goBack();
                    },
                  },
                ]);
              }}
            >
              <Icon name="trash" size={18} color={C.danger} />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.shareBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Icon name="share" size={18} color={C.sec} />
          </TouchableOpacity>
        </View>
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
            <Text style={[styles.catBadgeText, { color: catStyle.text }]}>{docCat}</Text>
          </View>
          <Text style={styles.title}>{docTitle}</Text>
          <Text style={styles.desc}>{docDeskripsi}</Text>
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
              {docAttachments.length === 0 ? (
                <Text style={styles.fileSize}>Belum ada lampiran</Text>
              ) : (
                docAttachments.map((f) => (
                  <TouchableOpacity key={f.id} style={styles.fileRow} activeOpacity={0.7}>
                    <View style={styles.fileIcon}>
                      <Icon
                        name={f.type === 'image' ? 'image' : f.type === 'film' ? 'film' : 'file-text'}
                        size={18}
                        color={C.teal}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.fileName} numberOfLines={1}>{f.name}</Text>
                    </View>
                    <Icon name="download" size={16} color={C.mut} />
                  </TouchableOpacity>
                ))
              )}
            </View>
          )}

          {/* Poin Penting */}
          {docPoin.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Poin Penting</Text>
              {docPoin.map((p, i) => (
                <View key={p.id} style={styles.poinViewRow}>
                  <View style={[styles.poinViewBullet, { backgroundColor: meta.color }]}>
                    <Text style={styles.poinViewBulletText}>{i + 1}</Text>
                  </View>
                  <Text style={styles.poinViewText}>{p.text}</Text>
                </View>
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

      <HseEditModuleModal
        visible={editOpen}
        onClose={() => setEditOpen(false)}
        onSave={handleEditSave}
        title={docTitle}
        cat={docCat}
        attachments={docAttachments}
        deskripsi={docDeskripsi}
        poin={docPoin}
        moduleType={moduleType}
        color={meta.color}
        tint={meta.tint}
      />
    </KeyboardAvoidingView>
  );
}
