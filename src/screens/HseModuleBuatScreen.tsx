import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  Platform,
  KeyboardAvoidingView,
  Animated,
  PanResponder,
  Dimensions,
} from 'react-native';

const SCREEN_H = Dimensions.get('window').height;
const DRAG_CLOSE_THRESHOLD = 60;
const DRAG_VELOCITY_THRESHOLD = 0.5;
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from '@/components/Icon';
import { C } from '@/theme/colors';
import { F } from '@/theme/typography';
import { RootStackParamList } from '@/navigation/types';
import { JENIS_OPTIONS, MODULE_META } from '@/constants/hseJenis';

type RouteP = RouteProp<RootStackParamList, 'HseModuleBuat'>;
type Nav = NativeStackNavigationProp<RootStackParamList>;

const UPLOAD_TYPES = [
  { icon: 'image', label: 'Foto / Gambar', color: C.teal },
  { icon: 'film', label: 'Video', color: C.violet },
  { icon: 'file', label: 'Dokumen', color: C.warn },
];

export default function HseModuleBuatScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<RouteP>();
  const insets = useSafeAreaInsets();
  const moduleType = route.params?.moduleType ?? 'SoP';
  const meta = MODULE_META[moduleType] ?? MODULE_META['SoP'];

  const [judul, setJudul] = useState('');
  const [jenisSelected, setJenisSelected] = useState('');
  const [jenisOpen, setJenisOpen] = useState(false);
  const sheetY = useRef(new Animated.Value(SCREEN_H)).current;
  const sheetOverlay = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (jenisOpen) {
      sheetY.setValue(SCREEN_H);
      sheetOverlay.setValue(0);
      Animated.parallel([
        Animated.timing(sheetOverlay, { toValue: 1, duration: 220, useNativeDriver: true }),
        Animated.spring(sheetY, { toValue: 0, tension: 100, friction: 12, useNativeDriver: true }),
      ]).start();
    }
  }, [jenisOpen]);

  const closeSheet = () => {
    Animated.parallel([
      Animated.timing(sheetOverlay, { toValue: 0, duration: 180, useNativeDriver: true }),
      Animated.timing(sheetY, { toValue: SCREEN_H, duration: 200, useNativeDriver: true }),
    ]).start(() => setJenisOpen(false));
  };

  const sheetPan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, g) => g.dy > 0,
      onPanResponderMove: (_, g) => {
        if (g.dy > 0) {
          sheetY.setValue(g.dy);
          sheetOverlay.setValue(Math.max(0, 1 - g.dy / SCREEN_H));
        }
      },
      onPanResponderRelease: (_, g) => {
        if (g.dy > DRAG_CLOSE_THRESHOLD || g.vy > DRAG_VELOCITY_THRESHOLD) {
          Animated.parallel([
            Animated.timing(sheetOverlay, { toValue: 0, duration: 180, useNativeDriver: true }),
            Animated.timing(sheetY, { toValue: SCREEN_H, duration: 200, useNativeDriver: true }),
          ]).start(() => setJenisOpen(false));
        } else {
          Animated.parallel([
            Animated.timing(sheetOverlay, { toValue: 1, duration: 150, useNativeDriver: true }),
            Animated.spring(sheetY, { toValue: 0, tension: 120, friction: 10, useNativeDriver: true }),
          ]).start();
        }
      },
    })
  ).current;

  const [uploads, setUploads] = useState<{ id: string; type: string; name: string }[]>([]);
  const [deskripsi, setDeskripsi] = useState('');
  const [poinList, setPoinList] = useState<{ id: string; text: string }[]>([
    { id: '1', text: '' },
  ]);
  const poinInputRefs = useRef<Record<string, TextInput | null>>({});

  const jenisOptions = JENIS_OPTIONS[moduleType] ?? [];

  function addPoin() {
    const id = Date.now().toString();
    setPoinList((prev) => [...prev, { id, text: '' }]);
    setTimeout(() => poinInputRefs.current[id]?.focus(), 80);
  }

  function removePoin(id: string) {
    setPoinList((prev) => prev.filter((p) => p.id !== id));
  }

  function updatePoin(id: string, text: string) {
    setPoinList((prev) => prev.map((p) => (p.id === id ? { ...p, text } : p)));
  }

  function mockUpload(type: string) {
    const names: Record<string, string> = {
      image: `foto_${Date.now().toString().slice(-4)}.jpg`,
      film: `video_${Date.now().toString().slice(-4)}.mp4`,
      file: `dokumen_${Date.now().toString().slice(-4)}.pdf`,
    };
    setUploads((prev) => [
      ...prev,
      { id: Date.now().toString(), type, name: names[type] ?? 'file' },
    ]);
  }

  function removeUpload(id: string) {
    setUploads((prev) => prev.filter((u) => u.id !== id));
  }

  const uploadIconColor = (type: string) => {
    if (type === 'image') return C.teal;
    if (type === 'film') return C.violet;
    return C.warn;
  };

  const uploadIconName = (type: string) => {
    if (type === 'image') return 'image';
    if (type === 'film') return 'film';
    return 'file';
  };

  const screenTitle = `Buat ${meta.label} Baru`;

  return (
    <View style={styles.root}>
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
          {screenTitle}
        </Text>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Judul */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Judul</Text>
            <TextInput
              style={styles.inputRow}
              placeholder={`Judul ${meta.label}...`}
              placeholderTextColor={C.mut}
              value={judul}
              onChangeText={setJudul}
              returnKeyType="next"
            />
          </View>

          {/* Jenis Peraturan */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Jenis Peraturan</Text>
            <TouchableOpacity
              style={styles.selectRow}
              onPress={() => setJenisOpen(true)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.selectText,
                  !jenisSelected && { color: C.mut },
                ]}
              >
                {jenisSelected || 'Pilih jenis peraturan...'}
              </Text>
              <Icon name="chevron-down" size={16} color={C.mut} />
            </TouchableOpacity>
          </View>

          {/* Upload Area */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Lampiran</Text>
            <View style={styles.uploadArea}>
              <View style={styles.uploadButtons}>
                {UPLOAD_TYPES.map((ut) => (
                  <TouchableOpacity
                    key={ut.icon}
                    style={styles.uploadBtn}
                    onPress={() => mockUpload(ut.icon)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.uploadBtnIcon, { backgroundColor: ut.color + '18' }]}>
                      <Icon name={ut.icon} size={18} color={ut.color} />
                    </View>
                    <Text style={styles.uploadBtnLabel}>{ut.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              {uploads.length > 0 && (
                <View style={styles.uploadList}>
                  {uploads.map((u) => (
                    <View key={u.id} style={styles.uploadItem}>
                      <Icon
                        name={uploadIconName(u.type)}
                        size={15}
                        color={uploadIconColor(u.type)}
                      />
                      <Text style={styles.uploadItemName} numberOfLines={1}>
                        {u.name}
                      </Text>
                      <TouchableOpacity
                        onPress={() => removeUpload(u.id)}
                        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                      >
                        <Icon name="x" size={14} color={C.mut} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
              {uploads.length === 0 && (
                <Text style={styles.uploadHint}>
                  Unggah foto, video, atau dokumen pendukung
                </Text>
              )}
            </View>
          </View>

          {/* Deskripsi */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Deskripsi</Text>
            <TextInput
              style={styles.textarea}
              placeholder="Tulis deskripsi lengkap..."
              placeholderTextColor={C.mut}
              value={deskripsi}
              onChangeText={setDeskripsi}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />
          </View>

          {/* Poin Penting */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Poin Penting</Text>
            <View style={styles.poinContainer}>
              {poinList.map((p, i) => (
                <View key={p.id} style={styles.poinRow}>
                  <View style={[styles.poinBullet, { backgroundColor: meta.color }]}>
                    <Text style={styles.poinBulletText}>{i + 1}</Text>
                  </View>
                  <TextInput
                    ref={(r) => { poinInputRefs.current[p.id] = r; }}
                    style={styles.poinInput}
                    placeholder="Tambah poin penting..."
                    placeholderTextColor={C.mut}
                    value={p.text}
                    onChangeText={(t) => updatePoin(p.id, t)}
                    returnKeyType="next"
                    onSubmitEditing={addPoin}
                  />
                  {poinList.length > 1 && (
                    <TouchableOpacity
                      onPress={() => removePoin(p.id)}
                      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                    >
                      <Icon name="x" size={15} color={C.mut} />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
              <TouchableOpacity style={styles.addPoinBtn} onPress={addPoin} activeOpacity={0.7}>
                <Icon name="plus" size={15} color={meta.color} />
                <Text style={[styles.addPoinText, { color: meta.color }]}>Tambah poin</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Bottom action bar */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 12 }]}>
        <TouchableOpacity
          style={[styles.simpanBtn, { backgroundColor: meta.color }]}
          activeOpacity={0.85}
        >
          <Text style={styles.simpanText}>Simpan</Text>
        </TouchableOpacity>
      </View>

      {/* Jenis Picker Sheet */}
      {jenisOpen && (
        <Modal
          visible={jenisOpen}
          transparent
          animationType="none"
          onRequestClose={closeSheet}
          statusBarTranslucent
        >
          <Animated.View style={[styles.sheetOverlay, { opacity: sheetOverlay }]}>
            <TouchableOpacity style={StyleSheet.absoluteFill} onPress={closeSheet} />
            <Animated.View
              style={[
                styles.sheetContainer,
                { paddingBottom: insets.bottom + 16, transform: [{ translateY: sheetY }] },
              ]}
            >
              <View {...sheetPan.panHandlers} style={styles.sheetHandleArea}>
                <View style={styles.sheetHandle} />
              </View>
              <View style={styles.sheetHeader}>
                <Text style={styles.sheetTitle}>Jenis Peraturan</Text>
                <TouchableOpacity onPress={closeSheet} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Icon name="x" size={20} color={C.sec} />
                </TouchableOpacity>
              </View>
              {jenisOptions.map((opt) => {
                const active = jenisSelected === opt;
                return (
                  <TouchableOpacity
                    key={opt}
                    style={[styles.sheetOption, active && { backgroundColor: meta.tint, borderColor: meta.color }]}
                    onPress={() => { setJenisSelected(opt); closeSheet(); }}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.sheetRadio, active && { borderColor: meta.color }]}>
                      {active && <View style={[styles.sheetRadioDot, { backgroundColor: meta.color }]} />}
                    </View>
                    <Text style={[styles.sheetOptionText, active && { color: meta.color, fontFamily: F.semiBold }]}>
                      {opt}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </Animated.View>
          </Animated.View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
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
  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontFamily: F.bold,
    color: C.ink,
  },
  draftBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  draftText: {
    fontSize: 12,
    fontFamily: F.semiBold,
  },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 18, paddingTop: 16, gap: 20 },
  breadcrumb: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: C.white,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: C.line,
    alignSelf: 'flex-start',
  },
  breadcrumbText: { fontSize: 13, fontFamily: F.regular, color: C.sec },
  breadcrumbActive: { fontFamily: F.semiBold, color: C.ink },
  fieldGroup: { gap: 6 },
  label: { fontSize: 13, fontFamily: F.semiBold, color: C.sec },
  inputRow: {
    backgroundColor: C.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.line,
    paddingHorizontal: 14,
    height: 50,
    fontSize: 14,
    fontFamily: F.regular,
    color: C.ink,
  },
  selectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: C.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.line,
    paddingHorizontal: 14,
    height: 50,
  },
  selectText: {
    fontSize: 14,
    fontFamily: F.regular,
    color: C.ink,
    flex: 1,
  },
  uploadArea: {
    backgroundColor: C.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.line,
    borderStyle: 'dashed',
    padding: 14,
    gap: 12,
  },
  uploadButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  uploadBtn: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: C.surface,
  },
  uploadBtnIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadBtnLabel: { fontSize: 11, fontFamily: F.semiBold, color: C.sec, textAlign: 'center' },
  uploadHint: {
    fontSize: 12,
    color: C.mut,
    textAlign: 'center',
    paddingBottom: 4,
  },
  uploadList: { gap: 6 },
  uploadItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: C.surface,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  uploadItemName: {
    flex: 1,
    fontSize: 13,
    fontFamily: F.regular,
    color: C.ink,
  },
  textarea: {
    backgroundColor: C.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.line,
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 14,
    fontSize: 14,
    fontFamily: F.regular,
    color: C.ink,
    minHeight: 110,
  },
  poinContainer: {
    backgroundColor: C.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.line,
    overflow: 'hidden',
  },
  poinRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: C.line,
  },
  poinBullet: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  poinBulletText: { fontSize: 11, fontFamily: F.bold, color: '#fff' },
  poinInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: F.regular,
    color: C.ink,
    height: 38,
  },
  addPoinBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  addPoinText: { fontSize: 13, fontFamily: F.semiBold },
  bottomBar: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 18,
    paddingTop: 12,
    backgroundColor: C.white,
    borderTopWidth: 1,
    borderTopColor: C.line,
  },
  simpanBtn: {
    flex: 1,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
  },
  simpanText: { fontSize: 15, fontFamily: F.bold, color: '#fff' },
  sheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.72)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: C.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 18,
    paddingTop: 0,
    gap: 6,
  },
  sheetHandleArea: { alignItems: 'center', paddingVertical: 12 },
  sheetHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: C.line },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sheetTitle: { fontSize: 17, fontFamily: F.bold, color: C.ink },
  sheetOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1.5,
    borderColor: C.line,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: C.white,
  },
  sheetRadio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: C.line,
    backgroundColor: C.white,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  sheetRadioDot: { width: 10, height: 10, borderRadius: 5 },
  sheetOptionText: { flex: 1, fontSize: 14, fontFamily: F.regular, color: C.ink },
});
