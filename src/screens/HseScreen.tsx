import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from '@/components/Icon';
import { C, GradientHeaders } from '@/theme/colors';
import { F } from '@/theme/typography';
import GradientHeader from '@/components/GradientHeader';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RootStackParamList } from '@/navigation/types';

const quickActions = [
  {
    icon: 'book-open',
    color: C.teal,
    tint: C.teal100,
    title: 'Tambah SoP Baru',
    sub: 'Standard of Procedure',
    route: 'HseModuleBuat' as const,
    moduleType: 'SoP' as const,
  },
  {
    icon: 'list',
    color: C.ok,
    tint: C.green100,
    title: 'Tambah Work Instruction',
    sub: 'Instruksi kerja HSE',
    route: 'HseModuleBuat' as const,
    moduleType: 'WI' as const,
  },
  {
    icon: 'file-text',
    color: C.warn,
    tint: C.amber100,
    title: 'Buat Form Baru',
    sub: 'Formulir inspeksi & laporan',
    route: 'HseModuleBuat' as const,
    moduleType: 'Form' as const,
  },
  {
    icon: 'play-circle',
    color: C.violet,
    tint: C.violet100,
    title: 'Buat Edukasi Baru',
    sub: 'Materi & video edukasi HSE',
    route: 'HseModuleBuat' as const,
    moduleType: 'Edukasi' as const,
  },
];

const MODULE_TABS = [
  { label: 'SoP', icon: 'book-open', color: C.teal, bg: C.teal100 },
  { label: 'WI', icon: 'list', color: C.ok, bg: C.green100 },
  { label: 'Form', icon: 'file-text', color: C.warn, bg: C.amber100 },
  { label: 'Edukasi', icon: 'play-circle', color: C.violet, bg: C.violet100 },
];

const CATS = ['Semua', 'K3', 'Lingkungan', 'Kesehatan'];

const DOCS = [
  // SoP
  { id: '1', title: 'Penanganan Bahan Berbahaya & Beracun (B3)', cat: 'K3', updated: '12 Jun 2026', module: 'SoP' },
  { id: '2', title: 'Pengelolaan Limbah Cair Industri', cat: 'Lingkungan', updated: '1 Jun 2026', module: 'SoP' },
  { id: '3', title: 'Pemeriksaan Kesehatan Berkala Karyawan', cat: 'Kesehatan', updated: '5 Jun 2026', module: 'SoP' },
  { id: '4', title: 'Tanggap Darurat Kebakaran & Evakuasi', cat: 'K3', updated: '20 Jun 2026', module: 'SoP' },
  { id: '5', title: 'Pengendalian Kebisingan di Area Produksi', cat: 'Kesehatan', updated: '25 Jun 2026', module: 'SoP' },
  // WI
  { id: '6', title: 'Pengoperasian Forklift Area Gudang', cat: 'K3', updated: '8 Jun 2026', module: 'WI' },
  { id: '7', title: 'Penanganan Tumpahan Bahan Kimia', cat: 'Lingkungan', updated: '18 Jun 2026', module: 'WI' },
  { id: '8', title: 'Penggunaan Alat Pelindung Diri (APD) Lengkap', cat: 'K3', updated: '10 Jun 2026', module: 'WI' },
  { id: '9', title: 'Prosedur Lock Out Tag Out (LOTO)', cat: 'K3', updated: '22 Jun 2026', module: 'WI' },
  { id: '10', title: 'Pengolahan Limbah Padat B3', cat: 'Lingkungan', updated: '3 Jun 2026', module: 'WI' },
  // Form
  { id: '11', title: 'Inspeksi Harian APD', cat: 'K3', updated: '15 Jun 2026', module: 'Form' },
  { id: '12', title: 'Laporan Kecelakaan Kerja', cat: 'K3', updated: '3 Jun 2026', module: 'Form' },
  { id: '13', title: 'Checklist Inspeksi APAR Bulanan', cat: 'K3', updated: '27 Jun 2026', module: 'Form' },
  { id: '14', title: 'Pemantauan Kualitas Udara & Kebisingan', cat: 'Lingkungan', updated: '11 Jun 2026', module: 'Form' },
  { id: '15', title: 'Formulir Medical Check-Up Karyawan', cat: 'Kesehatan', updated: '7 Jun 2026', module: 'Form' },
  // Edukasi
  { id: '16', title: 'Dasar Keselamatan Kerja untuk Karyawan Baru', cat: 'K3', updated: '20 Mei 2026', module: 'Edukasi' },
  { id: '17', title: 'Cara Benar Menggunakan APAR', cat: 'K3', updated: '15 Jun 2026', module: 'Edukasi' },
  { id: '18', title: 'Pengelolaan Limbah & Lingkungan Hidup', cat: 'Lingkungan', updated: '2 Jun 2026', module: 'Edukasi' },
  { id: '19', title: 'Ergonomi & Kesehatan Kerja', cat: 'Kesehatan', updated: '24 Jun 2026', module: 'Edukasi' },
  { id: '20', title: 'Identifikasi Bahaya & Penilaian Risiko (HIRA)', cat: 'K3', updated: '9 Jun 2026', module: 'Edukasi' },
];

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function HseScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const [fabOpen, setFabOpen] = useState(false);
  const [overlayMounted, setOverlayMounted] = useState(false);
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;
  const panelSlide = useRef(new Animated.Value(60)).current;
  const cardAnims = useRef(
    quickActions.map(() => ({
      opacity: new Animated.Value(0),
      translateY: new Animated.Value(10),
    })),
  ).current;

  useEffect(() => {
    Animated.spring(rotateAnim, {
      toValue: fabOpen ? 1 : 0,
      useNativeDriver: true,
      tension: 120,
      friction: 8,
    }).start();
    if (fabOpen) {
      cardAnims.forEach((a) => {
        a.opacity.setValue(0);
        a.translateY.setValue(12);
      });
      setOverlayMounted(true);
      Animated.parallel([
        Animated.timing(overlayAnim, {
          toValue: 1,
          duration: 240,
          useNativeDriver: true,
        }),
        Animated.spring(panelSlide, {
          toValue: 0,
          tension: 90,
          friction: 11,
          useNativeDriver: true,
        }),
        Animated.stagger(
          65,
          cardAnims.map((a) =>
            Animated.parallel([
              Animated.timing(a.opacity, {
                toValue: 1,
                duration: 210,
                useNativeDriver: true,
              }),
              Animated.spring(a.translateY, {
                toValue: 0,
                tension: 120,
                friction: 12,
                useNativeDriver: true,
              }),
            ]),
          ),
        ),
      ]).start();
    } else {
      Animated.parallel([
        Animated.stagger(
          25,
          [...cardAnims].reverse().map((a) =>
            Animated.parallel([
              Animated.timing(a.opacity, {
                toValue: 0,
                duration: 110,
                useNativeDriver: true,
              }),
              Animated.timing(a.translateY, {
                toValue: 8,
                duration: 110,
                useNativeDriver: true,
              }),
            ]),
          ),
        ),
        Animated.sequence([
          Animated.delay(70),
          Animated.parallel([
            Animated.timing(overlayAnim, {
              toValue: 0,
              duration: 190,
              useNativeDriver: true,
            }),
            Animated.timing(panelSlide, {
              toValue: 60,
              duration: 190,
              useNativeDriver: true,
            }),
          ]),
        ]),
      ]).start(() => setOverlayMounted(false));
    }
  }, [fabOpen]);

  useEffect(() => {
    return navigation.addListener('blur', () => setFabOpen(false));
  }, [navigation]);

  const fabRotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '135deg'],
  });

  const [activeModule, setActiveModule] = useState(0);
  const [activeCat, setActiveCat] = useState(0);
  const [search, setSearch] = useState('');

  const currentModule = MODULE_TABS[activeModule].label;
  const currentCat = CATS[activeCat];
  const searchQ = search.trim().toLowerCase();

  const filtered = DOCS.filter((d) => {
    if (d.module !== currentModule) return false;
    if (currentCat !== 'Semua' && d.cat !== currentCat) return false;
    if (searchQ && !d.title.toLowerCase().includes(searchQ)) return false;
    return true;
  });

  return (
    <View style={styles.container}>
      <GradientHeader
        title="Modul HSE"
        colors={GradientHeaders.hse as [string, string]}
        rightIcon="bell"
        rightBadge={4}
        onRight={() => navigation.navigate('Notifikasi')}
        subtitle={
          <View style={styles.headerSearch}>
            <View style={styles.headerSearchInput}>
              <Icon name="search" size={15} color="rgba(255,255,255,0.6)" />
              <TextInput
                style={styles.headerSearchText}
                placeholder="Cari dokumen..."
                placeholderTextColor="rgba(255,255,255,0.5)"
                value={search}
                onChangeText={setSearch}
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
        keyboardShouldPersistTaps="handled"
      >
        {/* Module tabs */}
        <View style={styles.moduleTabs}>
          {MODULE_TABS.map((m, i) => (
            <TouchableOpacity
              key={m.label}
              style={[
                styles.moduleTab,
                activeModule === i && { borderColor: m.color, borderWidth: 2 },
              ]}
              onPress={() => setActiveModule(i)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.moduleIcon,
                  { backgroundColor: m.bg },
                  activeModule === i && { backgroundColor: m.color },
                ]}
              >
                <Icon
                  name={m.icon}
                  size={20}
                  color={activeModule === i ? '#fff' : m.color}
                />
              </View>
              <Text
                style={[
                  styles.moduleLabel,
                  activeModule === i && {
                    color: m.color,
                    fontFamily: F.extraBold,
                  },
                ]}
              >
                {m.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Category chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.catRow}
        >
          {CATS.map((cat, i) => (
            <TouchableOpacity
              key={cat}
              style={[styles.catChip, activeCat === i && styles.catChipActive]}
              onPress={() => setActiveCat(i)}
            >
              <Text
                style={[
                  styles.catText,
                  activeCat === i && styles.catTextActive,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Document list */}
        <View style={styles.docList}>
          {filtered.length === 0 ? (
            <View style={styles.empty}>
              <Icon name="folder" size={40} color={C.mut} />
              <Text style={styles.emptyText}>Belum ada dokumen</Text>
            </View>
          ) : (
            filtered.map((doc) => (
              <TouchableOpacity
                key={doc.id}
                style={styles.docCard}
                activeOpacity={0.7}
                onPress={() => navigation.navigate('HseModulDetail', {
                  id: doc.id,
                  title: doc.title,
                  cat: doc.cat,
                  module: doc.module,
                  updated: doc.updated,
                })}
              >
                <View style={styles.docTop}>
                  <View style={styles.catBadge}>
                    <Text style={styles.catBadgeText}>{doc.cat}</Text>
                  </View>
                </View>
                <Text style={styles.docTitle}>{doc.title}</Text>
                <Text style={styles.docUpdated}>Diperbarui {doc.updated}</Text>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>

      {/* Quick action overlay */}
      {overlayMounted && (
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            styles.overlayBg,
            { opacity: overlayAnim },
          ]}
        >
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            onPress={() => setFabOpen(false)}
          />
          <Animated.View
            style={[
              styles.qaPanel,
              {
                paddingBottom: insets.bottom + 80,
                transform: [{ translateY: panelSlide }],
              },
            ]}
          >
            <Text style={styles.qaLabel}>TAMBAH MODUL</Text>
            {quickActions.map((qa, i) => (
              <Animated.View
                key={qa.title}
                style={{
                  opacity: cardAnims[i].opacity,
                  transform: [{ translateY: cardAnims[i].translateY }],
                }}
              >
                <TouchableOpacity
                  style={styles.qaCard}
                  activeOpacity={0.8}
                  onPress={() => {
                    setFabOpen(false);
                    navigation.navigate(qa.route, { moduleType: qa.moduleType });
                  }}
                >
                  <View
                    style={[styles.qaIconWrap, { backgroundColor: qa.tint }]}
                  >
                    <Icon name={qa.icon} size={22} color={qa.color} />
                  </View>
                  <View style={styles.qaBody}>
                    <Text style={styles.qaTitle}>{qa.title}</Text>
                    <Text style={styles.qaSub}>{qa.sub}</Text>
                  </View>
                  <Icon name="chevron-right" size={16} color={C.mut} />
                </TouchableOpacity>
              </Animated.View>
            ))}
          </Animated.View>
        </Animated.View>
      )}

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { bottom: insets.bottom + 8 }]}
        onPress={() => setFabOpen((o) => !o)}
        activeOpacity={0.85}
      >
        {fabOpen ? (
          <View style={styles.fabDark}>
            <Animated.View style={{ transform: [{ rotate: fabRotate }] }}>
              <Icon name="plus" size={22} color={C.white} />
            </Animated.View>
          </View>
        ) : (
          <LinearGradient
            colors={GradientHeaders.hse as [string, string]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.fabGradient}
          >
            <Animated.View style={{ transform: [{ rotate: fabRotate }] }}>
              <Icon name="plus" size={22} color={C.white} />
            </Animated.View>
          </LinearGradient>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  overlayBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15,23,42,0.82)',
    justifyContent: 'flex-end',
  },
  qaPanel: { paddingHorizontal: 18, gap: 10 },
  qaLabel: {
    fontSize: 11,
    fontFamily: F.bold,
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 1.2,
    marginBottom: 2,
  },
  qaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.white,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 14,
  },
  qaIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  qaBody: { flex: 1 },
  qaTitle: { fontSize: 14, fontFamily: F.semiBold, color: C.ink },
  qaSub: { fontSize: 12, fontFamily: F.regular, color: C.mut, marginTop: 1 },
  fab: {
    position: 'absolute',
    right: 20,
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  fabGradient: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabDark: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1e293b',
  },
  headerSearch: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerSearchInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.55)',
    paddingHorizontal: 12,
    gap: 8,
    height: 36,
  },
  headerSearchText: {
    flex: 1,
    fontSize: 13,
    fontFamily: F.regular,
    color: '#fff',
    height: 36,
  },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 32 },
  moduleTabs: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  moduleTab: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: C.white,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: C.line,
    shadowColor: C.ink,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  moduleIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 7,
  },
  moduleLabel: { fontSize: 12, fontFamily: F.semiBold, color: C.sec },
  catRow: { paddingHorizontal: 18, paddingBottom: 12, gap: 8 },
  catChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.line,
  },
  catChipActive: { backgroundColor: C.teal, borderColor: C.teal },
  catText: { fontSize: 13, fontFamily: F.semiBold, color: C.sec },
  catTextActive: { color: '#fff' },
  docList: { paddingHorizontal: 18, gap: 10 },
  empty: { alignItems: 'center', paddingVertical: 48, gap: 12 },
  emptyText: { fontSize: 14, color: C.mut },
  docCard: {
    backgroundColor: C.white,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: C.line,
    shadowColor: C.ink,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  docTop: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  badge: { paddingHorizontal: 9, paddingVertical: 3, borderRadius: 20 },
  badgeText: { fontSize: 11, fontFamily: F.bold },
  catBadge: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 20,
    backgroundColor: C.surface,
  },
  catBadgeText: { fontSize: 11, fontFamily: F.semiBold, color: C.sec },
  docTitle: { fontSize: 14, fontFamily: F.bold, color: C.ink, lineHeight: 20 },
  docMeta: { flexDirection: 'row', gap: 10, marginTop: 8 },
  docVersion: {
    fontSize: 12,
    fontFamily: F.bold,
    color: C.teal,
    // fontFamily: 'monospace',
  },
  docUpdated: { fontSize: 12, color: C.mut },
});
