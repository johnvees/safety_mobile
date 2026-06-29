import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from '@/components/Icon';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { C, GradientHeaders } from '@/theme/colors';
import { F } from '@/theme/typography';
import { currentUser } from '@/data/mockData';
import { RootStackParamList } from '@/navigation/types';
import ScopePickerSheet from '@/components/ScopePickerSheet';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const REP_CARDS = [
  {
    icon: 'alert-triangle',
    color: C.danger,
    bg: C.red100,
    title: 'Case Incident',
    desc: 'Near miss · accident · unsafe act',
    count: 3,
    countLabel: 'Terbuka',
    route: 'CaseIncident',
  },
  {
    icon: 'clipboard',
    color: C.ok,
    bg: C.green100,
    title: 'Inspeksi K3L',
    desc: 'Checklist & audit keselamatan',
    count: 2,
    countLabel: 'Berlangsung',
    route: 'InspeksiList',
  },
  {
    icon: 'file-text',
    color: C.warn,
    bg: C.amber100,
    title: 'Permit Kerja HSE',
    desc: 'Izin kerja & permit-to-work',
    count: 7,
    countLabel: 'Aktif',
    route: 'PermitList',
  },
] as const;

const RINGKASAN = [
  {
    icon: 'alert-triangle',
    iconColor: C.danger,
    iconBg: C.red100,
    title: '1 insiden perlu eskalasi segera',
    sub: 'Pekerja tidak pakai helm · Area Konstruksi',
    badge: 'KRITIS',
    badgeColor: C.danger,
    badgeBg: C.red100,
  },
  {
    icon: 'clock',
    iconColor: C.warn,
    iconBg: C.amber100,
    title: '3 inspeksi melewati deadline',
    sub: 'Inspeksi APD, Kendaraan, Forklift',
    badge: 'OVERDUE',
    badgeColor: C.warn,
    badgeBg: C.amber100,
  },
  {
    icon: 'calendar',
    iconColor: '#6366f1',
    iconBg: '#ede9fe',
    title: '2 permit habis besok',
    sub: 'Hot Work · Working at Height',
    badge: 'SEGERA',
    badgeColor: '#6366f1',
    badgeBg: '#ede9fe',
  },
  {
    icon: 'check-circle',
    iconColor: C.ok,
    iconBg: C.green100,
    title: '1 permit baru disetujui',
    sub: 'Confined Space · Tim Kebersihan',
    badge: 'BARU',
    badgeColor: C.ok,
    badgeBg: C.green100,
  },
];

export default function LaporanScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const [scopeOpen, setScopeOpen] = useState(false);
  const [activeScope, setActiveScope] = useState(currentUser.scope);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header — mirrors HomeScreen exactly */}
      <LinearGradient
        colors={GradientHeaders.laporan as [string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + 12 }]}
      >
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Laporan</Text>
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

        {/* Breadcrumb — same as HomeScreen */}
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
            <Icon name="chevron-down" size={14} color="rgba(255,255,255,0.7)" style={{ marginLeft: 2 }} />
          </TouchableOpacity>
        </ScrollView>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Jenis Laporan */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Jenis Laporan</Text>
          {REP_CARDS.map((r) => (
            <TouchableOpacity
              key={r.title}
              style={styles.repCard}
              onPress={() => navigation.navigate(r.route as any)}
              activeOpacity={0.75}
            >
              <View style={[styles.repIcon, { backgroundColor: r.bg }]}>
                <Icon name={r.icon} size={24} color={r.color} />
              </View>
              <View style={styles.repBody}>
                <Text style={styles.repTitle}>{r.title}</Text>
                <Text style={styles.repDesc}>{r.desc}</Text>
              </View>
              <View style={styles.repRight}>
                <Text style={[styles.repCount, { color: r.color }]}>{r.count}</Text>
                <Text style={styles.repCountLabel}>{r.countLabel}</Text>
              </View>
              <Icon name="chevron-right" size={16} color={C.mut} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Ringkasan Laporan */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Ringkasan Laporan</Text>
          <View style={styles.ringkasanCard}>
            {RINGKASAN.map((item, i) => (
              <View key={item.title}>
                {i > 0 && <View style={styles.divider} />}
                <TouchableOpacity style={styles.ringRow} activeOpacity={0.7}>
                  <View style={[styles.ringIcon, { backgroundColor: item.iconBg }]}>
                    <Icon name={item.icon} size={18} color={item.iconColor} />
                  </View>
                  <View style={styles.ringBody}>
                    <Text style={styles.ringTitle}>{item.title}</Text>
                    <Text style={styles.ringSub}>{item.sub}</Text>
                  </View>
                  <View style={[styles.ringBadge, { backgroundColor: item.badgeBg }]}>
                    <Text style={[styles.ringBadgeText, { color: item.badgeColor }]}>
                      {item.badge}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

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

  // Header — same padding as HomeScreen; minHeight on row matches HomeScreen's taller content
  header: { paddingHorizontal: 18, paddingBottom: 16 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    height: 65,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: F.extraBold,
    color: C.white,
    flex: 1,
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

  // Breadcrumb — identical to HomeScreen
  breadcrumbRow: { marginHorizontal: -18 },
  breadcrumbContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    gap: 8,
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
  scopeSep: { color: 'rgba(255,255,255,0.5)', fontSize: 12, marginHorizontal: 1 },
  scopePart: { fontSize: 11, color: 'rgba(255,255,255,0.9)', fontFamily: F.medium },

  // Scroll
  scroll: { flex: 1 },
  scrollContent: { paddingTop: 20 },
  section: { paddingHorizontal: 18, marginBottom: 20 },
  sectionLabel: {
    fontSize: 15,
    fontFamily: F.bold,
    color: C.ink,
    marginBottom: 12,
  },

  // Report cards
  repCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.line,
    paddingHorizontal: 14,
    paddingVertical: 15,
    marginBottom: 10,
    gap: 14,
    shadowColor: C.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  repIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  repBody: { flex: 1, minWidth: 0 },
  repTitle: { fontSize: 15, fontFamily: F.bold, color: C.ink },
  repDesc: { fontSize: 11.5, color: C.mut, marginTop: 3, lineHeight: 16 },
  repRight: { alignItems: 'flex-end', flexShrink: 0 },
  repCount: { fontSize: 22, fontFamily: F.extraBold, lineHeight: 26 },
  repCountLabel: { fontSize: 10.5, color: C.mut, marginTop: 1 },

  // Ringkasan
  ringkasanCard: {
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
  divider: { height: 1, backgroundColor: C.line, marginLeft: 60 },
  ringRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 13,
    gap: 12,
  },
  ringIcon: {
    width: 38,
    height: 38,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  ringBody: { flex: 1 },
  ringTitle: { fontSize: 13, fontFamily: F.semiBold, color: C.ink, lineHeight: 18 },
  ringSub: { fontSize: 11.5, color: C.mut, marginTop: 2 },
  ringBadge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexShrink: 0,
  },
  ringBadgeText: {
    fontSize: 10,
    fontFamily: F.bold,
    letterSpacing: 0.4,
    includeFontPadding: false,
  },
});
