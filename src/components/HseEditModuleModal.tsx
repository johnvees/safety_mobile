import React, { useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, Animated, PanResponder, StyleSheet, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from '@/components/Icon';
import { C } from '@/theme/colors';
import { F } from '@/theme/typography';
import { JENIS_OPTIONS } from '@/constants/hseJenis';
import { Attachment } from '@/data/hseDocs';
import { styles } from '@/screens/HseModulDetailScreen.styles';

const SCREEN_H = Dimensions.get('window').height;
const DRAG_CLOSE_THRESHOLD = 60;
const DRAG_VELOCITY_THRESHOLD = 0.5;

export type Poin = { id: string; text: string };

const UPLOAD_TYPES = [
  { icon: 'image', label: 'Foto', color: C.teal },
  { icon: 'film', label: 'Video', color: C.violet },
  { icon: 'file', label: 'Dokumen', color: C.warn },
];

interface Props {
  visible: boolean;
  onClose: () => void;
  onSave: (updated: { title: string; cat: string; attachments: Attachment[]; deskripsi: string; poin: Poin[] }) => void;
  title: string;
  cat: string;
  attachments: Attachment[];
  deskripsi: string;
  poin: Poin[];
  moduleType: string;
  color: string;
  tint: string;
}

export default function HseEditModuleModal({
  visible,
  onClose,
  onSave,
  title,
  cat,
  attachments,
  deskripsi,
  poin,
  moduleType,
  color,
  tint,
}: Props) {
  const insets = useSafeAreaInsets();
  const jenisOptions = JENIS_OPTIONS[moduleType] ?? [];

  const [editTitle, setEditTitle] = useState(title);
  const [editJenis, setEditJenis] = useState(cat);
  const [editAttachments, setEditAttachments] = useState<Attachment[]>(attachments);
  const [editDeskripsi, setEditDeskripsi] = useState(deskripsi);
  const [editPoin, setEditPoin] = useState<Poin[]>(poin.length > 0 ? poin : [{ id: '1', text: '' }]);

  const [jenisOpen, setJenisOpen] = useState(false);
  const sheetY = useRef(new Animated.Value(SCREEN_H)).current;
  const sheetOverlay = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setEditTitle(title);
      setEditJenis(cat);
      setEditAttachments(attachments);
      setEditDeskripsi(deskripsi);
      setEditPoin(poin.length > 0 ? poin : [{ id: '1', text: '' }]);
    }
  }, [visible]);

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

  function saveEdit() {
    const t = editTitle.trim();
    if (!t) return;
    const cleanPoin = editPoin.filter((p) => p.text.trim().length > 0);
    onSave({
      title: t,
      cat: editJenis || cat,
      attachments: editAttachments,
      deskripsi: editDeskripsi,
      poin: cleanPoin,
    });
  }

  function addAttachment(type: string) {
    const names: Record<string, string> = {
      image: `foto_${Date.now().toString().slice(-4)}.jpg`,
      film: `video_${Date.now().toString().slice(-4)}.mp4`,
      file: `dokumen_${Date.now().toString().slice(-4)}.pdf`,
    };
    setEditAttachments((prev) => [
      ...prev,
      { id: Date.now().toString(), type, name: names[type] ?? 'file' },
    ]);
  }

  function removeAttachment(id: string) {
    setEditAttachments((prev) => prev.filter((a) => a.id !== id));
  }

  function addEditPoin() {
    setEditPoin((prev) => [...prev, { id: Date.now().toString(), text: '' }]);
  }

  function removeEditPoin(id: string) {
    setEditPoin((prev) => prev.filter((p) => p.id !== id));
  }

  function updateEditPoin(id: string, text: string) {
    setEditPoin((prev) => prev.map((p) => (p.id === id ? { ...p, text } : p)));
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.editOverlay}>
        <View style={styles.editSheet}>
          <Text style={styles.editTitleLabel}>Edit Modul</Text>
          <ScrollView
            style={styles.editScroll}
            contentContainerStyle={{ gap: 12 }}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.editFieldLabel}>Judul</Text>
            <TextInput
              style={styles.editInput}
              value={editTitle}
              onChangeText={setEditTitle}
              placeholder="Judul modul"
              placeholderTextColor={C.mut}
            />
            <Text style={styles.editFieldLabel}>Jenis Peraturan</Text>
            <TouchableOpacity
              style={styles.editSelectRow}
              onPress={() => setJenisOpen(true)}
              activeOpacity={0.7}
            >
              <Text style={[styles.editSelectText, !editJenis && { color: C.mut }]}>
                {editJenis || 'Pilih jenis peraturan...'}
              </Text>
              <Icon name="chevron-down" size={16} color={C.mut} />
            </TouchableOpacity>
            <Text style={styles.editFieldLabel}>Lampiran</Text>
            <View style={styles.editUploadButtons}>
              {UPLOAD_TYPES.map((ut) => (
                <TouchableOpacity
                  key={ut.icon}
                  style={styles.editUploadBtn}
                  onPress={() => addAttachment(ut.icon)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.editUploadBtnIcon, { backgroundColor: ut.color + '18' }]}>
                    <Icon name={ut.icon} size={16} color={ut.color} />
                  </View>
                  <Text style={styles.editUploadBtnLabel}>{ut.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {editAttachments.length > 0 && (
              <View style={styles.editUploadList}>
                {editAttachments.map((a) => (
                  <View key={a.id} style={styles.editUploadItem}>
                    <Icon name={a.type === 'image' ? 'image' : a.type === 'film' ? 'film' : 'file'} size={14} color={C.sec} />
                    <Text style={styles.editUploadItemName} numberOfLines={1}>{a.name}</Text>
                    <TouchableOpacity
                      onPress={() => removeAttachment(a.id)}
                      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                    >
                      <Icon name="x" size={13} color={C.mut} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
            <Text style={styles.editFieldLabel}>Deskripsi</Text>
            <TextInput
              style={styles.editTextarea}
              value={editDeskripsi}
              onChangeText={setEditDeskripsi}
              placeholder="Tulis deskripsi lengkap..."
              placeholderTextColor={C.mut}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />
            <Text style={styles.editFieldLabel}>Poin Penting</Text>
            <View style={styles.editPoinContainer}>
              {editPoin.map((p, i) => (
                <View key={p.id} style={styles.editPoinRow}>
                  <View style={[styles.editPoinBullet, { backgroundColor: color }]}>
                    <Text style={styles.editPoinBulletText}>{i + 1}</Text>
                  </View>
                  <TextInput
                    style={styles.editPoinInput}
                    value={p.text}
                    onChangeText={(t) => updateEditPoin(p.id, t)}
                    placeholder="Tambah poin penting..."
                    placeholderTextColor={C.mut}
                    returnKeyType="next"
                  />
                  {editPoin.length > 1 && (
                    <TouchableOpacity
                      onPress={() => removeEditPoin(p.id)}
                      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                    >
                      <Icon name="x" size={14} color={C.mut} />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
              <TouchableOpacity style={styles.editAddPoinBtn} onPress={addEditPoin} activeOpacity={0.7}>
                <Icon name="plus" size={14} color={color} />
                <Text style={[styles.editAddPoinText, { color }]}>Tambah poin</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
          <View style={styles.editBtnRow}>
            <TouchableOpacity style={styles.editCancelBtn} onPress={onClose}>
              <Text style={styles.editCancelText}>Batal</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.editSaveBtn, { backgroundColor: color }]} onPress={saveEdit}>
              <Text style={styles.editSaveText}>Simpan</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Jenis Picker Sheet */}
      {jenisOpen && (
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
              const active = editJenis === opt;
              return (
                <TouchableOpacity
                  key={opt}
                  style={[styles.sheetOption, active && { backgroundColor: tint, borderColor: color }]}
                  onPress={() => { setEditJenis(opt); closeSheet(); }}
                  activeOpacity={0.7}
                >
                  <View style={[styles.sheetRadio, active && { borderColor: color }]}>
                    {active && <View style={[styles.sheetRadioDot, { backgroundColor: color }]} />}
                  </View>
                  <Text style={[styles.sheetOptionText, active && { color, fontFamily: F.semiBold }]}>
                    {opt}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </Animated.View>
        </Animated.View>
      )}
    </Modal>
  );
}
