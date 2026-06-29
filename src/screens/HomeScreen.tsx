import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from '@/components/Icon';
import { F } from '@/theme/typography';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { C, RoleColors, GradientHeaders } from '@/theme/colors';
import { currentUser } from '@/data/mockData';
import { RootStackParamList } from '@/navigation/types';
import ScopePickerSheet from '@/components/ScopePickerSheet';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const kpis = [
  {
    icon: 'alert-triangle',
    label: 'Insiden Bulan Ini',
    value: '3',
    trend: '-57%',
    trendUp: false,
    trendBad: false,
    accent: C.danger,
    tint: C.red100,
  },
  {
    icon: 'file-text',
    label: 'Permit Terbuka',
    value: '7',
    trend: '+2',
    trendUp: true,
    trendBad: true,
    accent: C.warn,
    tint: C.amber100,
  },
  {
    icon: 'clipboard',
    label: 'Skor Inspeksi',
    value: '92%',
    trend: '+4%',
    trendUp: true,
    trendBad: false,
    accent: C.ok,
    tint: C.green100,
  },
  {
    icon: 'eye',
    label: 'Unsafe Act',
    value: '5',
    trend: '+1',
    trendUp: true,
    trendBad: true,
    accent: C.teal,
    tint: C.teal100,
  },
];

const plantStatus = [
  { name: 'Plant Medan', division: 'Feedmill', status: 'AMAN', color: C.ok },
  {
    name: 'Plant Surabaya',
    division: 'Feedmill',
    status: 'WASPADA',
    color: C.warn,
  },
  {
    name: 'Plant Cikande',
    division: 'Food Processing',
    status: 'BAHAYA',
    color: C.danger,
  },
];

const feedItems = [
  {
    icon: 'file-text',
    color: C.warn,
    tint: C.amber100,
    text: '3 permit menunggu persetujuan Anda',
    sub: 'Permit-to-Work · Hot Work',
  },
  {
    icon: 'alert-triangle',
    color: C.danger,
    tint: C.red100,
    text: 'Insiden baru dilaporkan di Area Konstruksi',
    sub: 'oleh Rudi Hermawan · 4j lalu',
  },
  {
    icon: 'clipboard',
    color: C.ok,
    tint: C.green100,
    text: 'Inspeksi APAR selesai — skor 96%',
    sub: 'oleh Siti Rahayu · 2j lalu',
  },
];

const quickActions = [
  {
    icon: 'alert-triangle',
    color: C.danger,
    tint: C.red100,
    title: 'Laporkan Insiden',
    sub: 'Near miss, kecelakaan, unsafe',
    route: 'CaseIncident' as const,
  },
  {
    icon: 'clipboard',
    color: C.ok,
    tint: C.green100,
    title: 'Mulai Inspeksi',
    sub: 'Pilih template & lokasi',
    route: 'InspeksiList' as const,
  },
  {
    icon: 'file-text',
    color: C.warn,
    tint: C.amber100,
    title: 'Buat Permit',
    sub: 'Izin kerja HSE baru',
    route: 'PermitList' as const,
  },
  {
    icon: 'file-plus',
    color: '#6366f1',
    tint: '#ede9fe',
    title: 'SoP / Dokumen Baru',
    sub: 'Standard of Procedure',
    route: 'CaseIncident' as const,
  },
];

export default function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const [fabOpen, setFabOpen] = useState(false);
  const [overlayMounted, setOverlayMounted] = useState(false);
  const [scopeOpen, setScopeOpen] = useState(false);
  const [activeScope, setActiveScope] = useState(currentUser.scope);
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;
  const panelSlide = useRef(new Animated.Value(60)).current;
  const cardAnims = useRef(
    quickActions.map(() => ({
      opacity: new Animated.Value(0),
      translateY: new Animated.Value(10),
    }))
  ).current;

  useEffect(() => {
    Animated.spring(rotateAnim, {
      toValue: fabOpen ? 1 : 0,
      useNativeDriver: true,
      tension: 120,
      friction: 8,
    }).start();

    if (fabOpen) {
      cardAnims.forEach((a) => { a.opacity.setValue(0); a.translateY.setValue(12); });
      setOverlayMounted(true);
      Animated.parallel([
        Animated.timing(overlayAnim, { toValue: 1, duration: 240, useNativeDriver: true }),
        Animated.spring(panelSlide, { toValue: 0, tension: 90, friction: 11, useNativeDriver: true }),
        Animated.stagger(
          65,
          cardAnims.map((a) =>
            Animated.parallel([
              Animated.timing(a.opacity, { toValue: 1, duration: 210, useNativeDriver: true }),
              Animated.spring(a.translateY, { toValue: 0, tension: 120, friction: 12, useNativeDriver: true }),
            ])
          )
        ),
      ]).start();
    } else {
      Animated.parallel([
        Animated.stagger(
          25,
          [...cardAnims].reverse().map((a) =>
            Animated.parallel([
              Animated.timing(a.opacity, { toValue: 0, duration: 110, useNativeDriver: true }),
              Animated.timing(a.translateY, { toValue: 8, duration: 110, useNativeDriver: true }),
            ])
          )
        ),
        Animated.sequence([
          Animated.delay(70),
          Animated.parallel([
            Animated.timing(overlayAnim, { toValue: 0, duration: 190, useNativeDriver: true }),
            Animated.timing(panelSlide, { toValue: 60, duration: 190, useNativeDriver: true }),
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

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Selamat pagi' : hour < 17 ? 'Selamat siang' : 'Selamat malam';
  const initials = currentUser.name
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const roleKey = `Lv.5 · ${currentUser.role}`;
  const roleColor = RoleColors[roleKey] ?? C.sec;

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={GradientHeaders.home as [string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + 12 }]}
      >
        {/* Top row: avatar + greeting + bell */}
        <View style={styles.headerRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={styles.headerMid}>
            <Text style={styles.headerGreeting}>{greeting},</Text>
            <Text style={styles.headerName}>{currentUser.name}</Text>
          </View>
          <TouchableOpacity
            style={styles.bellBtn}
            onPress={() => navigation.navigate('Notifikasi')}
          >
            <Icon name="bell" size={20} color={C.white} />
            <View style={styles.bellBadge}>
              <Text style={styles.bellBadgeText}>4</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Breadcrumb row */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.breadcrumbRow}
          contentContainerStyle={styles.breadcrumbContent}
        >
          <TouchableOpacity
            style={styles.scopePill}
            onPress={() => setScopeOpen(true)}
            activeOpacity={0.8}
          >
            <Icon name="map-pin" size={11} color="rgba(255,255,255,0.7)" />
            {activeScope.split(' > ').map((part, i) => (
              <React.Fragment key={i}>
                {i > 0 && <Text style={styles.scopeSep}>›</Text>}
                <Text style={styles.scopePart}>{part}</Text>
              </React.Fragment>
            ))}
            <Icon
              name="chevron-down"
              size={14}
              color="rgba(255,255,255,0.7)"
              style={{ marginLeft: 2 }}
            />
          </TouchableOpacity>
          <View style={styles.roleBadge}>
            <View style={[styles.roleDot, { backgroundColor: roleColor }]} />
            <Text style={[styles.roleText, { color: roleColor }]}>
              {roleKey}
            </Text>
          </View>
        </ScrollView>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 32 },
        ]}
        showsVerticalScrollIndicator={false}
        scrollEnabled={!fabOpen}
      >
        {/* KPI Grid */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Safety KPI</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('DashboardFull')}
            >
              <Text style={styles.seeAll}>Lihat semua</Text>
            </TouchableOpacity>
          </View>
          {[kpis.slice(0, 2), kpis.slice(2, 4)].map((row, ri) => (
            <View key={ri} style={[styles.kpiRow, ri > 0 && { marginTop: 12 }]}>
              {row.map((kpi) => {
                const trendColor = kpi.trendBad ? C.danger : C.ok;
                const trendBg = kpi.trendBad ? C.red100 : C.green100;
                return (
                  <View key={kpi.label} style={styles.kpiCard}>
                    <View style={styles.kpiTop}>
                      <View
                        style={[
                          styles.kpiIconWrap,
                          { backgroundColor: kpi.tint },
                        ]}
                      >
                        <Icon name={kpi.icon} size={18} color={kpi.accent} />
                      </View>
                      <View
                        style={[
                          styles.trendBadge,
                          { backgroundColor: trendBg },
                        ]}
                      >
                        <Icon
                          name={
                            kpi.trendUp ? 'arrow-up-right' : 'arrow-down-right'
                          }
                          size={11}
                          color={trendColor}
                        />
                        <Text style={[styles.trendText, { color: trendColor }]}>
                          {kpi.trend}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.kpiValue}>{kpi.value}</Text>
                    <Text style={styles.kpiLabel}>{kpi.label}</Text>
                  </View>
                );
              })}
            </View>
          ))}
        </View>

        {/* Status Keselamatan Plant */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Status Safety</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>Lihat semua</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.listCard}>
            {plantStatus.map((p, i) => (
              <View key={p.name}>
                {i > 0 && <View style={styles.divider} />}
                <View style={styles.plantRow}>
                  <View
                    style={[styles.plantDot, { backgroundColor: p.color }]}
                  />
                  <View style={styles.plantMid}>
                    <Text style={styles.plantName}>{p.name}</Text>
                    <Text style={styles.plantDiv}>{p.division}</Text>
                  </View>
                  <Text style={[styles.plantStatus, { color: p.color }]}>
                    {p.status}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Aktivitas Terbaru */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Aktivitas Terbaru</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>Lihat Semua</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.listCard}>
            {feedItems.map((f, i) => (
              <View key={f.text}>
                {i > 0 && <View style={styles.divider} />}
                <View style={styles.feedRow}>
                  <View style={[styles.feedIcon, { backgroundColor: f.tint }]}>
                    <Icon name={f.icon} size={16} color={f.color} />
                  </View>
                  <View style={styles.feedBody}>
                    <Text style={styles.feedText}>{f.text}</Text>
                    <Text style={styles.feedSub}>{f.sub}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Quick action overlay */}
      {overlayMounted && (
        <Animated.View
          style={[StyleSheet.absoluteFill, styles.overlayBg, { opacity: overlayAnim }]}
        >
          <TouchableOpacity style={StyleSheet.absoluteFill} onPress={() => setFabOpen(false)} />
          <Animated.View
            style={[styles.qaPanel, { paddingBottom: insets.bottom + 80, transform: [{ translateY: panelSlide }] }]}
          >
            <Text style={styles.qaLabel}>Aksi Cepat</Text>
            {quickActions.map((qa, i) => (
              <Animated.View
                key={qa.title}
                style={{ opacity: cardAnims[i].opacity, transform: [{ translateY: cardAnims[i].translateY }] }}
              >
                <TouchableOpacity
                  style={styles.qaCard}
                  activeOpacity={0.8}
                  onPress={() => {
                    setFabOpen(false);
                    navigation.navigate(qa.route);
                  }}
                >
                  <View style={[styles.qaIconWrap, { backgroundColor: qa.tint }]}>
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
            colors={['#60a5fa', '#2563eb']}
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

      <ScopePickerSheet
        visible={scopeOpen}
        currentScope={activeScope}
        onClose={() => setScopeOpen(false)}
        onApply={(scope) => setActiveScope(scope)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },

  // Header
  header: { paddingHorizontal: 18, paddingBottom: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14, height: 65 },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 15,
    fontFamily: F.bold,
    color: C.white,
    lineHeight: 42,
    textAlign: 'center',
  },
  headerMid: { flex: 1 },
  headerGreeting: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.75)',
    fontFamily: F.regular,
    lineHeight: 16,
  },
  headerName: {
    fontSize: 18,
    fontFamily: F.bold,
    color: C.white,
    lineHeight: 22,
    marginTop: -2,
  },
  bellBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    minWidth: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: C.danger,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  bellBadgeText: {
    fontSize: 8,
    fontFamily: F.bold,
    color: C.white,
    lineHeight: 14,
    textAlign: 'center',
  },

  // Breadcrumb row
  breadcrumbRow: { marginHorizontal: -18 },
  breadcrumbContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 18,
  },
  scopePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 7,
    gap: 3,
  },
  scopeSep: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    marginHorizontal: 1,
  },
  scopePart: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.9)',
    fontFamily: F.medium,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.92)',
  },
  roleDot: { width: 7, height: 7, borderRadius: 3.5, flexShrink: 0 },
  roleText: { fontSize: 11, fontFamily: F.semiBold },

  // Scroll
  scroll: { flex: 1 },
  scrollContent: { paddingTop: 20 },

  // Sections
  section: { paddingHorizontal: 18, marginBottom: 20 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 15, fontFamily: F.bold, color: C.ink },
  seeAll: { fontSize: 13, fontFamily: F.semiBold, color: C.teal },

  // KPI Grid
  kpiRow: { flexDirection: 'row', gap: 12 },
  kpiCard: {
    flex: 1,
    backgroundColor: C.white,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: C.line,
    shadowColor: C.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  kpiTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  kpiIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  trendText: { fontSize: 10, fontFamily: F.bold, lineHeight: 13 },
  kpiValue: {
    fontSize: 28,
    fontFamily: F.extraBold,
    letterSpacing: -0.5,
    lineHeight: 32,
    color: C.ink,
  },
  kpiLabel: {
    fontSize: 11.5,
    color: C.sec,
    fontFamily: F.medium,
    marginTop: 3,
  },

  // List card (shared)
  listCard: {
    backgroundColor: C.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.line,
    overflow: 'hidden',
    shadowColor: C.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  divider: { height: 1, backgroundColor: C.line, marginLeft: 52 },

  // Plant status
  plantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 13,
    gap: 12,
  },
  plantDot: { width: 10, height: 10, borderRadius: 5, flexShrink: 0 },
  plantMid: { flex: 1 },
  plantName: { fontSize: 13, fontFamily: F.semiBold, color: C.ink },
  plantDiv: { fontSize: 11, color: C.mut, fontFamily: F.regular, marginTop: 1 },
  plantStatus: { fontSize: 13, fontFamily: F.bold, letterSpacing: 0.3 },

  // Activity feed
  feedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  feedIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  feedBody: { flex: 1, justifyContent: 'center' },
  feedText: {
    fontSize: 13,
    fontFamily: F.semiBold,
    color: C.ink,
    lineHeight: 18,
  },
  feedSub: {
    fontSize: 11.5,
    color: C.mut,
    marginTop: 2,
    fontFamily: F.regular,
  },

  // Quick action overlay
  overlayBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15,23,42,0.55)',
    justifyContent: 'flex-end',
  },
  qaPanel: {
    paddingHorizontal: 18,
    gap: 10,
  },
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

  // FAB
  fab: {
    position: 'absolute',
    right: 20,
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#1d4ed8',
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
});
