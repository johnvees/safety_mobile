import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from '@/components/Icon';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { C, GradientHeaders } from '@/theme/colors';
import { F } from '@/theme/typography';
import { currentUser } from '@/data/mockData';
import GradientHeader from '@/components/GradientHeader';
import ScopeBreadcrumb from '@/components/ScopeBreadcrumb';
import { RootStackParamList } from '@/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const REP_CARDS = [
  {
    icon: 'alert-triangle', color: C.danger, bg: C.red100,
    title: 'Case Incident', desc: 'Near miss · accident · unsafe act',
    count: 3, countLabel: 'Terbuka', route: 'CaseIncident',
  },
  {
    icon: 'clipboard', color: C.ok, bg: C.green100,
    title: 'Inspeksi K3L', desc: 'Checklist & audit keselamatan',
    count: 2, countLabel: 'Berlangsung', route: 'InspeksiList',
  },
  {
    icon: 'file-text', color: C.teal, bg: C.teal100,
    title: 'Permit Kerja HSE', desc: 'Izin kerja berbahaya',
    count: 3, countLabel: 'Menunggu', route: 'PermitList',
  },
] as const;

export default function LaporanScreen() {
  const navigation = useNavigation<Nav>();

  return (
    <View style={styles.container}>
      <GradientHeader
        title="Laporan"
        colors={GradientHeaders.laporan as [string, string]}
        rightIcon="bell"
        subtitle={<ScopeBreadcrumb scope={currentUser.scope} light />}
      />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Buat Laporan Baru CTA */}
        <TouchableOpacity
          style={styles.ctaCard}
          activeOpacity={0.85}
          onPress={() => {}}
        >
          <View style={styles.ctaLeft}>
            <View style={styles.ctaIconWrap}>
              <Icon name="plus" size={22} color="#fff" />
            </View>
            <View>
              <Text style={styles.ctaTitle}>Buat Laporan Baru</Text>
              <Text style={styles.ctaDesc}>Pilih jenis laporan di bawah</Text>
            </View>
          </View>
          <Icon name="chevron-right" size={20} color="rgba(255,255,255,0.7)" />
        </TouchableOpacity>

        {/* Jenis Laporan */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>JENIS LAPORAN</Text>
          <View style={styles.repList}>
            {REP_CARDS.map((r, i) => (
              <TouchableOpacity
                key={r.title}
                style={[styles.repCard, i < REP_CARDS.length - 1 && styles.repCardBorder]}
                onPress={() => navigation.navigate(r.route as any)}
                activeOpacity={0.7}
              >
                <View style={[styles.repIcon, { backgroundColor: r.bg }]}>
                  <Icon name={r.icon} size={22} color={r.color} />
                </View>
                <View style={styles.repBody}>
                  <Text style={styles.repTitle}>{r.title}</Text>
                  <Text style={styles.repDesc}>{r.desc}</Text>
                </View>
                <View style={styles.repRight}>
                  <Text style={[styles.repCount, { color: r.color }]}>{r.count}</Text>
                  <Text style={styles.repCountLabel}>{r.countLabel}</Text>
                </View>
                <Icon name="chevron-right" size={16} color={C.mut} style={{ marginLeft: 4 }} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Ringkasan Bulan Ini */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>RINGKASAN BULAN INI</Text>
          <View style={styles.summaryGrid}>
            {[
              { label: 'Total Laporan', value: '47', color: C.teal },
              { label: 'Diselesaikan', value: '38', color: C.ok },
              { label: 'Menunggu', value: '6', color: C.warn },
              { label: 'Eskalasi', value: '3', color: C.danger },
            ].map((s) => (
              <View key={s.label} style={styles.summaryCard}>
                <Text style={[styles.summaryValue, { color: s.color }]}>{s.value}</Text>
                <Text style={styles.summaryLabel}>{s.label}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 32 },
  ctaCard: {
    marginHorizontal: 18, marginTop: 16,
    backgroundColor: C.tealD,
    borderRadius: 16, padding: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  ctaLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  ctaIconWrap: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  ctaTitle: { fontSize: 15, fontFamily: F.extraBold, color: '#fff' },
  ctaDesc: { fontSize: 11.5, color: 'rgba(255,255,255,0.85)', marginTop: 2 },
  section: { paddingHorizontal: 18, marginTop: 20 },
  sectionLabel: { fontSize: 11, fontFamily: F.bold, color: C.mut, letterSpacing: 0.8, marginBottom: 10 },
  repList: {
    backgroundColor: C.white, borderRadius: 16,
    borderWidth: 1, borderColor: C.line,
    overflow: 'hidden',
    shadowColor: C.ink, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3, elevation: 1,
  },
  repCard: { flexDirection: 'row', alignItems: 'center', padding: 15, gap: 13 },
  repCardBorder: { borderBottomWidth: 1, borderBottomColor: C.line },
  repIcon: { width: 46, height: 46, borderRadius: 13, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  repBody: { flex: 1, minWidth: 0 },
  repTitle: { fontSize: 14.5, fontFamily: F.bold, color: C.ink },
  repDesc: { fontSize: 11.5, color: C.mut, marginTop: 2 },
  repRight: { alignItems: 'flex-end' },
  repCount: { fontSize: 18, fontFamily: F.extraBold },
  repCountLabel: { fontSize: 10.5, color: C.mut },
  summaryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  summaryCard: {
    backgroundColor: C.white, borderRadius: 14, padding: 14, width: '47.5%',
    borderWidth: 1, borderColor: C.line,
    shadowColor: C.ink, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3, elevation: 1,
  },
  summaryValue: { fontSize: 24, fontFamily: F.extraBold },
  summaryLabel: { fontSize: 11.5, color: C.sec, marginTop: 3 },
});
