import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Icon from '@/components/Icon';
import { useNavigation } from '@react-navigation/native';
import { C, GradientHeaders, StatusMap } from '@/theme/colors';
import { F } from '@/theme/typography';
import { kpiData, monthlyTrend } from '@/data/mockData';
import GradientHeader from '@/components/GradientHeader';

const { width } = Dimensions.get('window');
const CHART_W = width - 36;
const PERIODS = ['Bulan Ini', '3 Bulan', '6 Bulan', 'Tahun Ini'];

const PLANT_STATUS = [
  { name: 'Plant Medan', safe: true, score: 94, incidents: 1 },
  { name: 'Plant Kediri', safe: false, score: 71, incidents: 3 },
  { name: 'Plant Surabaya', safe: true, score: 88, incidents: 0 },
  { name: 'Plant Jakarta', safe: false, score: 45, incidents: 5 },
];

const SEVERITY_DIST = [
  { label: 'Rendah', count: 4, pct: 44, color: C.ok },
  { label: 'Sedang', count: 3, pct: 33, color: C.warn },
  { label: 'Tinggi', count: 2, pct: 22, color: C.danger },
];

const maxVal = Math.max(...monthlyTrend.map((m) => m.incidents));

export default function DashboardScreen() {
  const navigation = useNavigation();
  const [period, setPeriod] = useState(0);

  return (
    <View style={styles.container}>
      <GradientHeader
        title="Laporan & Analitik"
        colors={GradientHeaders.home as [string, string]}
        onBack={() => navigation.goBack()}
        rightIcon="download"
      />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Period selector */}
        <View style={styles.periodRow}>
          {PERIODS.map((p, i) => (
            <TouchableOpacity
              key={p}
              style={[styles.periodChip, period === i && styles.periodActive]}
              onPress={() => setPeriod(i)}
            >
              <Text style={[styles.periodText, period === i && styles.periodTextActive]}>{p}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* KPI cards 2-col */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Indikator Utama</Text>
          <View style={styles.kpiGrid}>
            {[
              { label: 'TRIR', value: kpiData.trir, sub: 'per juta jam kerja', color: C.ok, icon: 'activity' },
              { label: 'LTI', value: kpiData.lti, sub: 'loss time injury', color: C.danger, icon: 'zap' },
              { label: 'FAR', value: kpiData.far, sub: 'fatality rate', color: C.danger, icon: 'alert-triangle' },
              { label: 'Jam Kerja', value: kpiData.safeHours.toLocaleString(), sub: 'jam aman kumulatif', color: C.teal, icon: 'clock' },
            ].map((k) => (
              <View key={k.label} style={[styles.kpiCard, { borderTopColor: k.color, borderTopWidth: 3 }]}>
                <Icon name={k.icon} size={16} color={k.color} />
                <Text style={[styles.kpiValue, { color: k.color }]}>{k.value}</Text>
                <Text style={styles.kpiLabel}>{k.label}</Text>
                <Text style={styles.kpiSub}>{k.sub}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Bar chart - incidents trend */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tren Insiden Bulanan</Text>
          <View style={styles.chartCard}>
            <View style={styles.barChart}>
              {monthlyTrend.slice(-6).map((m) => {
                const h = maxVal > 0 ? (m.incidents / maxVal) * 100 : 4;
                const barColor = m.incidents === 0 ? C.ok : m.incidents <= 2 ? C.warn : C.danger;
                return (
                  <View key={m.month} style={styles.barCol}>
                    <Text style={[styles.barNum, { color: barColor }]}>{m.incidents}</Text>
                    <View style={styles.barBg}>
                      <View style={[styles.barFill, { height: `${Math.max(h, 4)}%` as any, backgroundColor: barColor }]} />
                    </View>
                    <Text style={styles.barLabel}>{m.month.slice(0, 3)}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        </View>

        {/* Plant status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Status per Plant</Text>
          <View style={styles.plantList}>
            {PLANT_STATUS.map((p, i) => (
              <View key={p.name} style={[styles.plantRow, i < PLANT_STATUS.length - 1 && styles.plantBorder]}>
                <View style={[styles.plantIndicator, { backgroundColor: p.safe ? C.ok : C.danger }]} />
                <View style={styles.plantInfo}>
                  <Text style={styles.plantName}>{p.name}</Text>
                  <Text style={styles.plantMeta}>{p.incidents} insiden bulan ini</Text>
                </View>
                <View style={styles.plantScore}>
                  <Text style={[styles.plantScoreNum, { color: p.safe ? C.ok : p.score >= 70 ? C.warn : C.danger }]}>{p.score}</Text>
                  <Text style={styles.plantScoreLabel}>skor</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Severity distribution */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Distribusi Tingkat Keparahan</Text>
          <View style={styles.distCard}>
            {SEVERITY_DIST.map((s) => (
              <View key={s.label} style={styles.distRow}>
                <Text style={styles.distLabel}>{s.label}</Text>
                <View style={styles.distBar}>
                  <View style={[styles.distFill, { width: `${s.pct}%` as any, backgroundColor: s.color }]} />
                </View>
                <Text style={[styles.distPct, { color: s.color }]}>{s.count}</Text>
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
  periodRow: { flexDirection: 'row', paddingHorizontal: 18, paddingVertical: 14, gap: 8 },
  periodChip: {
    flex: 1, paddingVertical: 7, borderRadius: 20, alignItems: 'center',
    backgroundColor: C.white, borderWidth: 1, borderColor: C.line,
  },
  periodActive: { backgroundColor: C.teal, borderColor: C.teal },
  periodText: { fontSize: 11.5, fontFamily: F.semiBold, color: C.sec },
  periodTextActive: { color: '#fff' },
  section: { paddingHorizontal: 18, marginTop: 4, marginBottom: 14 },
  sectionTitle: { fontSize: 14, fontFamily: F.bold, color: C.ink, marginBottom: 10 },
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  kpiCard: {
    backgroundColor: C.white, borderRadius: 14, padding: 14, width: '47.5%',
    borderWidth: 1, borderColor: C.line, gap: 4,
    shadowColor: C.ink, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3, elevation: 1,
  },
  kpiValue: { fontSize: 24, fontFamily: F.extraBold, marginTop: 6 },
  kpiLabel: { fontSize: 12, fontFamily: F.bold, color: C.ink },
  kpiSub: { fontSize: 10.5, color: C.mut },
  chartCard: {
    backgroundColor: C.white, borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: C.line, height: 160,
    shadowColor: C.ink, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3, elevation: 1,
  },
  barChart: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: '100%' },
  barCol: { alignItems: 'center', flex: 1, height: '100%', justifyContent: 'flex-end', gap: 4 },
  barNum: { fontSize: 11, fontFamily: F.bold },
  barBg: { width: 24, flex: 1, backgroundColor: C.surface, borderRadius: 6, justifyContent: 'flex-end', overflow: 'hidden' },
  barFill: { width: '100%', borderRadius: 6 },
  barLabel: { fontSize: 10, color: C.mut },
  plantList: {
    backgroundColor: C.white, borderRadius: 14, borderWidth: 1, borderColor: C.line, overflow: 'hidden',
    shadowColor: C.ink, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3, elevation: 1,
  },
  plantRow: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  plantBorder: { borderBottomWidth: 1, borderBottomColor: C.line },
  plantIndicator: { width: 10, height: 10, borderRadius: 5 },
  plantInfo: { flex: 1 },
  plantName: { fontSize: 14, fontFamily: F.bold, color: C.ink },
  plantMeta: { fontSize: 11.5, color: C.mut, marginTop: 2 },
  plantScore: { alignItems: 'center' },
  plantScoreNum: { fontSize: 22, fontFamily: F.extraBold },
  plantScoreLabel: { fontSize: 10, color: C.mut },
  distCard: {
    backgroundColor: C.white, borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: C.line, gap: 14,
    shadowColor: C.ink, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3, elevation: 1,
  },
  distRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  distLabel: { width: 52, fontSize: 12.5, fontFamily: F.semiBold, color: C.sec },
  distBar: { flex: 1, height: 8, backgroundColor: C.surface, borderRadius: 4, overflow: 'hidden' },
  distFill: { height: '100%', borderRadius: 4 },
  distPct: { width: 22, fontSize: 13, fontFamily: F.extraBold, textAlign: 'right' },
});
