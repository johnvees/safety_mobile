import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from '@/components/Icon';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { C, GradientHeaders, StatusMap } from '@/theme/colors';
import { F } from '@/theme/typography';
import { inspections } from '@/data/mockData';
import GradientHeader from '@/components/GradientHeader';
import { RootStackParamList } from '@/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const TABS = ['Terjadwal', 'Berlangsung', 'Selesai'];

export default function InspeksiListScreen() {
  const navigation = useNavigation<Nav>();
  const [tab, setTab] = useState(0);

  const filtered = inspections.filter((i) => {
    if (tab === 0) return i.status === 'Terjadwal';
    if (tab === 1) return i.status === 'Berlangsung';
    return i.status === 'Selesai';
  });

  return (
    <View style={styles.container}>
      <GradientHeader
        title="Inspeksi K3L"
        colors={GradientHeaders.inspeksi as [string, string]}
        onBack={() => navigation.goBack()}
        rightIcon="plus"
      />

      {/* Tabs */}
      <View style={styles.tabBar}>
        {TABS.map((t, i) => (
          <TouchableOpacity key={t} style={[styles.tab, tab === i && styles.tabActive]} onPress={() => setTab(i)}>
            <Text style={[styles.tabText, tab === i && styles.tabTextActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.listWrap}>
          {filtered.length === 0 ? (
            <View style={styles.empty}>
              <Icon name="clipboard" size={40} color={C.mut} />
              <Text style={styles.emptyText}>Tidak ada inspeksi {TABS[tab].toLowerCase()}</Text>
            </View>
          ) : filtered.map((insp) => {
            const [statusColor, statusBg] = StatusMap[insp.status] ?? [C.sec, C.surface];
            const scoreColor = insp.score >= 90 ? C.ok : insp.score >= 70 ? C.warn : C.danger;
            return (
              <TouchableOpacity
                key={insp.id}
                style={styles.card}
                onPress={() => navigation.navigate('InspeksiDetail', { id: insp.id })}
                activeOpacity={0.7}
              >
                <View style={styles.cardTop}>
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardTitle}>{insp.title}</Text>
                    <Text style={styles.cardDate}>{insp.dueDate}</Text>
                    <Text style={styles.cardLocation}>{insp.location}</Text>
                  </View>
                  <View style={styles.scoreCircle}>
                    <Text style={[styles.scoreNum, { color: scoreColor }]}>{insp.score}</Text>
                    <Text style={styles.scoreLabel}>/ 100</Text>
                  </View>
                </View>
                <View style={styles.progressWrap}>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${insp.score}%` as any, backgroundColor: scoreColor }]} />
                  </View>
                  <Text style={[styles.progressPct, { color: scoreColor }]}>{insp.score}%</Text>
                </View>
                <View style={styles.cardFooter}>
                  <View style={styles.picRow}>
                    <Icon name="user" size={12} color={C.mut} />
                    <Text style={styles.picText}>{insp.inspector}</Text>
                  </View>
                  <View style={[styles.badge, { backgroundColor: statusBg }]}>
                    <Text style={[styles.badgeText, { color: statusColor }]}>{insp.status}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.fab}>
        <Icon name="plus" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: C.white,
    borderBottomWidth: 1, borderBottomColor: C.line,
  },
  tab: { flex: 1, paddingVertical: 13, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2.5, borderBottomColor: C.ok },
  tabText: { fontSize: 13, fontFamily: F.semiBold, color: C.sec },
  tabTextActive: { color: C.ok },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 80 },
  listWrap: { paddingHorizontal: 18, paddingTop: 14, gap: 10 },
  empty: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyText: { fontSize: 14, color: C.mut },
  card: {
    backgroundColor: C.white, borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: C.line,
    shadowColor: C.ink, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3, elevation: 1,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  cardInfo: { flex: 1, marginRight: 12 },
  cardTitle: { fontSize: 14, fontFamily: F.bold, color: C.ink, lineHeight: 20 },
  cardDate: { fontSize: 12, color: C.sec, marginTop: 3 },
  cardLocation: { fontSize: 11.5, color: C.mut, marginTop: 2 },
  scoreCircle: { alignItems: 'center' },
  scoreNum: { fontSize: 24, fontFamily: F.extraBold },
  scoreLabel: { fontSize: 10, color: C.mut },
  progressWrap: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  progressBar: { flex: 1, height: 6, backgroundColor: C.line, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  progressPct: { fontSize: 12, fontFamily: F.bold, width: 36, textAlign: 'right' },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 },
  picRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  picText: { fontSize: 12, color: C.sec },
  badge: { paddingHorizontal: 9, paddingVertical: 3, borderRadius: 20 },
  badgeText: { fontSize: 11, fontFamily: F.bold },
  fab: {
    position: 'absolute', bottom: 24, right: 20,
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: C.ok,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: C.ok, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 8, elevation: 6,
  },
});
