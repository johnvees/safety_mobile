import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from '@/components/Icon';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { C, GradientHeaders, StatusMap, SeverityMap } from '@/theme/colors';
import { F } from '@/theme/typography';
import { incidents } from '@/data/mockData';
import GradientHeader from '@/components/GradientHeader';
import ScopeBreadcrumb from '@/components/ScopeBreadcrumb';
import { RootStackParamList } from '@/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'InsidenDetail'>;

const KRONOLOGI = [
  { time: '07:45', event: 'Insiden terjadi di Area Produksi B' },
  { time: '07:52', event: 'Pekerja terkena cedera, segera dibawa ke klinik' },
  { time: '08:10', event: 'Laporan awal dikirimkan ke Supervisor HSE' },
  { time: '09:00', event: 'Investigasi dimulai oleh tim HSE' },
  { time: '11:30', event: 'Laporan investigasi selesai, tindakan korektif diusulkan' },
];

const TINDAKAN = [
  { label: 'Perbaikan prosedur kerja di area terkait', done: true },
  { label: 'Pelatihan ulang keselamatan untuk operator', done: true },
  { label: 'Inspeksi APD menyeluruh di seluruh plant', done: false },
  { label: 'Update risk assessment dokumen', done: false },
];

export default function InsidenDetailScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const incident = incidents.find((i) => i.id === route.params.id) ?? incidents[0];

  const [statusColor, statusBg] = StatusMap[incident.status] ?? [C.sec, C.surface];
  const [sevColor] = SeverityMap[incident.severity] ?? [C.sec, C.surface];
  const typeColor = incident.type === 'Near Miss' ? C.warn : incident.type === 'Accident' ? C.danger : C.sec;
  const typeBg = incident.type === 'Near Miss' ? C.amber100 : incident.type === 'Accident' ? C.red100 : C.surface;

  return (
    <View style={styles.container}>
      <GradientHeader
        title="Detail Insiden"
        colors={GradientHeaders.incident as [string, string]}
        onBack={() => navigation.goBack()}
        rightIcon="more-horizontal"
      />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Type + status badges */}
        <View style={styles.badgeRow}>
          <View style={[styles.badge, { backgroundColor: typeBg }]}>
            <Text style={[styles.badgeText, { color: typeColor }]}>{incident.type}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: statusBg }]}>
            <Text style={[styles.badgeText, { color: statusColor }]}>{incident.status}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.incTitle}>{incident.title}</Text>
          <ScopeBreadcrumb scope="Feedmill · Plant Medan · Produksi" />

          <View style={styles.metaGrid}>
            {[
              { label: 'Tanggal', value: incident.date, icon: 'calendar' },
              { label: 'Pelapor', value: incident.reporter, icon: 'user' },
              { label: 'Tingkat Keparahan', value: incident.severity, icon: 'alert-circle', color: sevColor },
              { label: 'Jenis', value: incident.type, icon: 'tag', color: typeColor },
            ].map((m) => (
              <View key={m.label} style={styles.metaItem}>
                <Icon name={m.icon} size={14} color={C.mut} />
                <View>
                  <Text style={styles.metaLabel}>{m.label}</Text>
                  <Text style={[styles.metaValue, m.color ? { color: m.color, fontFamily: F.bold } : {}]}>{m.value}</Text>
                </View>
              </View>
            ))}
          </View>

          {incident.description ? (
            <View style={styles.descWrap}>
              <Text style={styles.descLabel}>Deskripsi</Text>
              <Text style={styles.descText}>{incident.description}</Text>
            </View>
          ) : null}
        </View>

        {/* Kronologi */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Kronologi Kejadian</Text>
          <View style={styles.card}>
            {KRONOLOGI.map((k, i) => (
              <View key={k.time} style={styles.kronoRow}>
                <View style={styles.kronoTimeline}>
                  <View style={[styles.kronoDot, { backgroundColor: i === 0 ? C.danger : C.line }]} />
                  {i < KRONOLOGI.length - 1 && <View style={styles.kronoLine} />}
                </View>
                <View style={styles.kronoContent}>
                  <Text style={styles.kronoTime}>{k.time}</Text>
                  <Text style={styles.kronoEvent}>{k.event}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Tindakan Korektif */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tindakan Korektif</Text>
          <View style={styles.card}>
            {TINDAKAN.map((t, i) => (
              <View key={t.label} style={[styles.actionRow, i < TINDAKAN.length - 1 && styles.actionBorder]}>
                <View style={[styles.actionCheck, { backgroundColor: t.done ? C.ok : C.surface, borderColor: t.done ? C.ok : C.line }]}>
                  {t.done && <Icon name="check" size={12} color="#fff" />}
                </View>
                <Text style={[styles.actionText, t.done && styles.actionDone]}>{t.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionBtns}>
          <TouchableOpacity style={styles.btnSecondary}>
            <Icon name="download" size={16} color={C.teal} />
            <Text style={styles.btnSecondaryText}>Export PDF</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnPrimary}>
            <Icon name="edit-2" size={16} color="#fff" />
            <Text style={styles.btnPrimaryText}>Update Status</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 32 },
  badgeRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 18, paddingVertical: 14 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 12, fontFamily: F.bold },
  card: {
    marginHorizontal: 18, backgroundColor: C.white, borderRadius: 14,
    padding: 16, borderWidth: 1, borderColor: C.line,
    shadowColor: C.ink, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3, elevation: 1,
    marginBottom: 4,
  },
  incTitle: { fontSize: 16, fontFamily: F.extraBold, color: C.ink, lineHeight: 22, marginBottom: 8 },
  metaGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, marginTop: 14 },
  metaItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, width: '45%' },
  metaLabel: { fontSize: 10.5, color: C.mut, marginBottom: 2 },
  metaValue: { fontSize: 13, fontFamily: F.semiBold, color: C.ink },
  descWrap: { marginTop: 16, paddingTop: 14, borderTopWidth: 1, borderTopColor: C.line },
  descLabel: { fontSize: 11, fontFamily: F.bold, color: C.mut, letterSpacing: 0.5, marginBottom: 6 },
  descText: { fontSize: 13.5, color: C.sec, lineHeight: 20 },
  section: { paddingHorizontal: 18, marginTop: 18 },
  sectionTitle: { fontSize: 14, fontFamily: F.bold, color: C.ink, marginBottom: 10 },
  kronoRow: { flexDirection: 'row', gap: 12, minHeight: 44 },
  kronoTimeline: { alignItems: 'center', width: 18 },
  kronoDot: { width: 10, height: 10, borderRadius: 5, marginTop: 4 },
  kronoLine: { flex: 1, width: 2, backgroundColor: C.line, marginTop: 4 },
  kronoContent: { flex: 1, paddingBottom: 12 },
  kronoTime: { fontSize: 11, fontFamily: F.bold, color: C.sec },
  kronoEvent: { fontSize: 13, color: C.ink, marginTop: 2, lineHeight: 18 },
  actionRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingVertical: 12 },
  actionBorder: { borderBottomWidth: 1, borderBottomColor: C.line },
  actionCheck: {
    width: 20, height: 20, borderRadius: 10,
    borderWidth: 2, alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1,
  },
  actionText: { fontSize: 13.5, color: C.ink, flex: 1, lineHeight: 19 },
  actionDone: { color: C.mut, textDecorationLine: 'line-through' },
  actionBtns: { flexDirection: 'row', gap: 10, paddingHorizontal: 18, marginTop: 20 },
  btnSecondary: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7,
    paddingVertical: 13, borderRadius: 12,
    borderWidth: 1.5, borderColor: C.teal,
  },
  btnSecondaryText: { fontSize: 14, fontFamily: F.bold, color: C.teal },
  btnPrimary: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7,
    paddingVertical: 13, borderRadius: 12, backgroundColor: C.teal,
  },
  btnPrimaryText: { fontSize: 14, fontFamily: F.bold, color: '#fff' },
});
