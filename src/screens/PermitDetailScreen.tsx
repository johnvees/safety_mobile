import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from '@/components/Icon';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { C, GradientHeaders, StatusMap } from '@/theme/colors';
import { F } from '@/theme/typography';
import { permits } from '@/data/mockData';
import GradientHeader from '@/components/GradientHeader';
import { RootStackParamList } from '@/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'PermitDetail'>;

const APD_LIST = ['Helm Safety', 'Safety Harness', 'Sarung Tangan Tahan Api', 'Kacamata Las', 'Baju Tahan Api', 'Sepatu Safety'];
const HAZARDS = ['Risiko kebakaran akibat percikan api', 'Paparan asap / fumes berbahaya', 'Sengatan listrik pada material konduktif', 'Luka bakar pada kulit dan mata'];

const typeColor = (type: string) => {
  if (type === 'Hot Work') return [C.danger, C.red100];
  if (type === 'Confined Space') return [C.violet, C.violet100];
  if (type === 'Working at Height') return [C.warn, C.amber100];
  return [C.teal, C.teal100];
};

export default function PermitDetailScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const permit = permits.find((p) => p.id === route.params.id) ?? permits[0];

  const [tc, tBg] = typeColor(permit.type);
  const [statusColor, statusBg] = StatusMap[permit.status] ?? [C.sec, C.surface];

  return (
    <View style={styles.container}>
      <GradientHeader
        title="Detail Permit"
        colors={GradientHeaders.permit as [string, string]}
        onBack={() => navigation.goBack()}
        rightIcon="more-horizontal"
      />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Type banner */}
        <View style={[styles.typeBanner, { backgroundColor: tBg, borderLeftColor: tc as string, borderLeftWidth: 4 }]}>
          <Text style={[styles.typeLabel, { color: tc as string }]}>{permit.type}</Text>
          <Text style={styles.ptwNum}>{permit.permitNumber}</Text>
        </View>

        {/* Main info card */}
        <View style={styles.card}>
          <View style={styles.cardTop}>
            <Text style={styles.permitTitle}>{permit.title}</Text>
            <View style={[styles.badge, { backgroundColor: statusBg }]}>
              <Text style={[styles.badgeText, { color: statusColor }]}>{permit.status}</Text>
            </View>
          </View>

          <View style={styles.metaGrid}>
            {[
              { icon: 'map-pin', label: 'Lokasi', value: permit.location },
              { icon: 'calendar', label: 'Berlaku', value: permit.validDate },
              { icon: 'user', label: 'Pemohon', value: permit.applicant },
              { icon: 'shield', label: 'Penanggung Jawab', value: 'Ahmad Fauzi' },
            ].map((m) => (
              <View key={m.label} style={styles.metaItem}>
                <Icon name={m.icon} size={14} color={C.mut} />
                <View>
                  <Text style={styles.metaLabel}>{m.label}</Text>
                  <Text style={styles.metaValue}>{m.value}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* APD Required */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>APD Wajib Digunakan</Text>
          <View style={styles.apdList}>
            {APD_LIST.map((apd, i) => (
              <View key={apd} style={[styles.apdRow, i < APD_LIST.length - 1 && styles.apdBorder]}>
                <View style={styles.apdCheck}>
                  <Icon name="check" size={12} color={C.ok} />
                </View>
                <Text style={styles.apdText}>{apd}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Hazard warning */}
        <View style={styles.section}>
          <View style={styles.hazardCard}>
            <View style={styles.hazardHeader}>
              <Icon name="alert-triangle" size={18} color={C.warn} />
              <Text style={styles.hazardTitle}>Potensi Bahaya</Text>
            </View>
            {HAZARDS.map((h) => (
              <View key={h} style={styles.hazardRow}>
                <View style={styles.hazardDot} />
                <Text style={styles.hazardText}>{h}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Action buttons */}
        <View style={styles.btnRow}>
          <TouchableOpacity style={styles.btnReject}>
            <Icon name="x" size={16} color={C.danger} />
            <Text style={styles.btnRejectText}>Tolak</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnApprove}>
            <Icon name="check" size={16} color="#fff" />
            <Text style={styles.btnApproveText}>Setujui Permit</Text>
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
  typeBanner: {
    marginHorizontal: 18, marginTop: 14, borderRadius: 12, padding: 14,
  },
  typeLabel: { fontSize: 13, fontFamily: F.extraBold, letterSpacing: 0.5 },
  ptwNum: { fontSize: 11, color: C.sec, marginTop: 3, fontFamily: 'monospace' },
  card: {
    marginHorizontal: 18, marginTop: 10, backgroundColor: C.white, borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: C.line,
    shadowColor: C.ink, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3, elevation: 1,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 },
  permitTitle: { fontSize: 15, fontFamily: F.extraBold, color: C.ink, flex: 1, marginRight: 10, lineHeight: 21 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 11, fontFamily: F.bold },
  metaGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  metaItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, width: '45%' },
  metaLabel: { fontSize: 10.5, color: C.mut, marginBottom: 2 },
  metaValue: { fontSize: 13, fontFamily: F.semiBold, color: C.ink },
  section: { paddingHorizontal: 18, marginTop: 16 },
  sectionTitle: { fontSize: 14, fontFamily: F.bold, color: C.ink, marginBottom: 10 },
  apdList: {
    backgroundColor: C.white, borderRadius: 14, borderWidth: 1, borderColor: C.line, overflow: 'hidden',
    shadowColor: C.ink, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3, elevation: 1,
  },
  apdRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 14 },
  apdBorder: { borderBottomWidth: 1, borderBottomColor: C.line },
  apdCheck: {
    width: 22, height: 22, borderRadius: 11, backgroundColor: C.green100,
    alignItems: 'center', justifyContent: 'center',
  },
  apdText: { fontSize: 13.5, color: C.ink },
  hazardCard: {
    backgroundColor: C.amber100, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#FDE68A',
  },
  hazardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  hazardTitle: { fontSize: 14, fontFamily: F.extraBold, color: C.warn },
  hazardRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 6 },
  hazardDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.warn, marginTop: 7, flexShrink: 0 },
  hazardText: { fontSize: 13, color: '#92400E', flex: 1, lineHeight: 18 },
  btnRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 18, marginTop: 20 },
  btnReject: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7,
    paddingVertical: 13, borderRadius: 12, borderWidth: 1.5, borderColor: C.danger,
  },
  btnRejectText: { fontSize: 14, fontFamily: F.bold, color: C.danger },
  btnApprove: {
    flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7,
    paddingVertical: 13, borderRadius: 12, backgroundColor: C.ok,
  },
  btnApproveText: { fontSize: 14, fontFamily: F.bold, color: '#fff' },
});
