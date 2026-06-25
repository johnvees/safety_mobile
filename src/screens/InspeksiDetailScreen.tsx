import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from '@/components/Icon';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { C, GradientHeaders, StatusMap } from '@/theme/colors';
import { F } from '@/theme/typography';
import { inspections } from '@/data/mockData';
import GradientHeader from '@/components/GradientHeader';
import { RootStackParamList } from '@/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'InspeksiDetail'>;

const CHECKLIST_ITEMS = [
  { id: 'c1', cat: 'APD', label: 'Helm safety tersedia dan kondisi baik' },
  { id: 'c2', cat: 'APD', label: 'Sarung tangan sesuai risiko pekerjaan' },
  { id: 'c3', cat: 'APD', label: 'Sepatu safety anti-slip digunakan' },
  { id: 'c4', cat: 'Area Kerja', label: 'Area kerja bersih dan bebas hambatan' },
  { id: 'c5', cat: 'Area Kerja', label: 'Rambu keselamatan terpasang jelas' },
  { id: 'c6', cat: 'Area Kerja', label: 'Jalur evakuasi tidak terblokir' },
  { id: 'c7', cat: 'Peralatan', label: 'APAR dalam kondisi baik dan mudah dijangkau' },
  { id: 'c8', cat: 'Peralatan', label: 'P3K tersedia dan lengkap' },
];

export default function InspeksiDetailScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const insp = inspections.find((i) => i.id === route.params.id) ?? inspections[0];

  const [checked, setChecked] = useState<Set<string>>(new Set(['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7']));
  const toggle = (id: string) => setChecked((p) => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const total = CHECKLIST_ITEMS.length;
  const done = checked.size;
  const pct = Math.round((done / total) * 100);
  const pctColor = pct >= 90 ? C.ok : pct >= 70 ? C.warn : C.danger;

  const [statusColor, statusBg] = StatusMap[insp.status] ?? [C.sec, C.surface];

  const categories = [...new Set(CHECKLIST_ITEMS.map((i) => i.cat))];

  return (
    <View style={styles.container}>
      <GradientHeader
        title="Detail Inspeksi"
        colors={GradientHeaders.inspeksi as [string, string]}
        onBack={() => navigation.goBack()}
        rightIcon="more-horizontal"
      />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardInfo}>
              <Text style={styles.inspTitle}>{insp.title}</Text>
              <Text style={styles.inspMeta}>{insp.inspector} · {insp.dueDate}</Text>
              <Text style={styles.inspLocation}>{insp.location}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
              <Text style={[styles.statusText, { color: statusColor }]}>{insp.status}</Text>
            </View>
          </View>

          {/* Score + progress */}
          <View style={styles.scoreRow}>
            <View style={styles.scoreCircle}>
              <Text style={[styles.scoreNum, { color: pctColor }]}>{pct}</Text>
              <Text style={styles.scoreLabel}>/ 100</Text>
            </View>
            <View style={styles.scoreRight}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${pct}%` as any, backgroundColor: pctColor }]} />
              </View>
              <Text style={styles.progressMeta}>{done} dari {total} item selesai</Text>
            </View>
          </View>
        </View>

        {/* Checklist grouped by category */}
        {categories.map((cat) => (
          <View key={cat} style={styles.section}>
            <Text style={styles.catLabel}>{cat}</Text>
            <View style={styles.checkCard}>
              {CHECKLIST_ITEMS.filter((i) => i.cat === cat).map((item, idx, arr) => (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.checkRow, idx < arr.length - 1 && styles.checkBorder]}
                  onPress={() => toggle(item.id)}
                  activeOpacity={0.7}
                >
                  <View style={[
                    styles.checkbox,
                    { backgroundColor: checked.has(item.id) ? C.ok : C.white, borderColor: checked.has(item.id) ? C.ok : C.line }
                  ]}>
                    {checked.has(item.id) && <Icon name="check" size={13} color="#fff" />}
                  </View>
                  <Text style={[styles.checkLabel, checked.has(item.id) && styles.checkLabelDone]}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Save button */}
        <View style={styles.btnWrap}>
          <TouchableOpacity style={styles.btnSave}>
            <Icon name="save" size={16} color="#fff" />
            <Text style={styles.btnSaveText}>Simpan Hasil Inspeksi</Text>
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
  card: {
    marginHorizontal: 18, marginTop: 14,
    backgroundColor: C.white, borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: C.line,
    shadowColor: C.ink, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3, elevation: 1,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 },
  cardInfo: { flex: 1, marginRight: 10 },
  inspTitle: { fontSize: 15, fontFamily: F.extraBold, color: C.ink, lineHeight: 21 },
  inspMeta: { fontSize: 12, color: C.sec, marginTop: 4 },
  inspLocation: { fontSize: 11.5, color: C.mut, marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusText: { fontSize: 11, fontFamily: F.bold },
  scoreRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  scoreCircle: { alignItems: 'center' },
  scoreNum: { fontSize: 32, fontFamily: F.extraBold },
  scoreLabel: { fontSize: 11, color: C.mut },
  scoreRight: { flex: 1 },
  progressBar: { height: 10, backgroundColor: C.line, borderRadius: 5, overflow: 'hidden', marginBottom: 6 },
  progressFill: { height: '100%', borderRadius: 5 },
  progressMeta: { fontSize: 12, color: C.sec },
  section: { paddingHorizontal: 18, marginTop: 16 },
  catLabel: { fontSize: 11, fontFamily: F.bold, color: C.mut, letterSpacing: 0.8, marginBottom: 8 },
  checkCard: {
    backgroundColor: C.white, borderRadius: 14, borderWidth: 1, borderColor: C.line, overflow: 'hidden',
    shadowColor: C.ink, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3, elevation: 1,
  },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  checkBorder: { borderBottomWidth: 1, borderBottomColor: C.line },
  checkbox: {
    width: 22, height: 22, borderRadius: 6, borderWidth: 2,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  checkLabel: { fontSize: 13.5, color: C.ink, flex: 1, lineHeight: 19 },
  checkLabelDone: { color: C.mut, textDecorationLine: 'line-through' },
  btnWrap: { paddingHorizontal: 18, marginTop: 20 },
  btnSave: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: C.ok, borderRadius: 14, paddingVertical: 15,
    shadowColor: C.ok, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 4,
  },
  btnSaveText: { fontSize: 15, fontFamily: F.extraBold, color: '#fff' },
});
