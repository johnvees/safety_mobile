import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import Icon from '@/components/Icon';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { C, GradientHeaders, StatusMap, SeverityMap } from '@/theme/colors';
import { F } from '@/theme/typography';
import { incidents } from '@/data/mockData';
import GradientHeader from '@/components/GradientHeader';
import ScopeBreadcrumb from '@/components/ScopeBreadcrumb';
import { RootStackParamList } from '@/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const FILTERS = ['Semua', 'Near Miss', 'Accident', 'Unsafe Act'];

export default function CaseIncidentScreen() {
  const navigation = useNavigation<Nav>();
  const [filter, setFilter] = useState(0);
  const [search, setSearch] = useState('');

  const filtered = incidents.filter((i) => {
    if (filter > 0 && i.type !== FILTERS[filter]) return false;
    if (search && !i.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const counts = {
    Terbuka: incidents.filter((i) => i.status === 'Terbuka').length,
    Investigasi: incidents.filter((i) => i.status === 'Investigasi').length,
    Selesai: incidents.filter((i) => i.status === 'Selesai').length,
  };

  return (
    <View style={styles.container}>
      <GradientHeader
        title="Case Incident"
        colors={GradientHeaders.incident as [string, string]}
        onBack={() => navigation.goBack()}
        rightIcon="bell"
        rightBadge={1}
      />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Search */}
        <View style={styles.searchWrap}>
          <Icon name="search" size={16} color={C.mut} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Cari insiden, lokasi, PIC..."
            placeholderTextColor={C.mut}
            value={search}
            onChangeText={setSearch}
          />
          <TouchableOpacity>
            <Icon name="sliders" size={16} color={C.sec} />
          </TouchableOpacity>
        </View>

        {/* Filter chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {FILTERS.map((f, i) => (
            <TouchableOpacity
              key={f}
              style={[styles.chip, filter === i && styles.chipActive]}
              onPress={() => setFilter(i)}
            >
              <Text style={[styles.chipText, filter === i && styles.chipTextActive]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Stats row */}
        <View style={styles.statsRow}>
          {Object.entries(counts).map(([label, count]) => {
            const [color] = StatusMap[label] ?? [C.sec, C.bg];
            return (
              <TouchableOpacity key={label} style={styles.statBox} onPress={() => {}}>
                <Text style={[styles.statNum, { color }]}>{count}</Text>
                <Text style={styles.statLabel}>{label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Incident cards */}
        <View style={styles.listWrap}>
          {filtered.map((inc) => {
            const [typeColor, typeBg] = inc.type === 'Near Miss' ? [C.warn, C.amber100] : inc.type === 'Accident' ? [C.danger, C.red100] : [C.sec, C.surface];
            const [sevColor, sevBg] = SeverityMap[inc.severity] ?? [C.sec, C.bg];
            const [statusColor, statusBg] = StatusMap[inc.status] ?? [C.sec, C.bg];
            return (
              <TouchableOpacity
                key={inc.id}
                style={styles.incCard}
                onPress={() => navigation.navigate('InsidenDetail', { id: inc.id })}
                activeOpacity={0.7}
              >
                <View style={styles.incTop}>
                  <View style={styles.incBadges}>
                    <View style={[styles.badge, { backgroundColor: typeBg }]}>
                      <Text style={[styles.badgeText, { color: typeColor }]}>{inc.type}</Text>
                    </View>
                    <View style={[styles.badge, { backgroundColor: sevBg }]}>
                      <Text style={[styles.badgeText, { color: sevColor }]}>{inc.severity}</Text>
                    </View>
                  </View>
                  <View style={[styles.badge, { backgroundColor: statusBg }]}>
                    <Text style={[styles.badgeText, { color: statusColor }]}>{inc.status}</Text>
                  </View>
                </View>
                <Text style={styles.incTitle}>{inc.title}</Text>
                <ScopeBreadcrumb scope="Feedmill · Plant Medan · Produksi" />
                <View style={styles.incFooter}>
                  <View style={styles.incAvatar}>
                    <Text style={styles.incAvatarText}>{inc.reporter.split(' ').map((n) => n[0]).join('').slice(0, 2)}</Text>
                  </View>
                  <Text style={styles.incReporter}>{inc.reporter}</Text>
                  <Text style={styles.incTime}>{inc.date}</Text>
                  <View style={[styles.badge, { backgroundColor: statusBg, marginLeft: 'auto' }]}>
                    <Text style={[styles.badgeText, { color: statusColor }]}>{inc.status}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity style={styles.fab}>
        <Icon name="plus" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 80 },
  searchWrap: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: 18, marginTop: 14,
    backgroundColor: C.white,
    borderRadius: 12, borderWidth: 1, borderColor: C.line,
    paddingHorizontal: 12, paddingVertical: 10, gap: 8,
  },
  searchIcon: {},
  searchInput: { flex: 1, fontSize: 14, color: C.ink, padding: 0 },
  filterRow: { paddingHorizontal: 18, paddingVertical: 12, gap: 8 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 20, backgroundColor: C.white,
    borderWidth: 1, borderColor: C.line,
  },
  chipActive: { backgroundColor: C.ink, borderColor: C.ink },
  chipText: { fontSize: 13, fontFamily: F.semiBold, color: C.sec },
  chipTextActive: { color: '#fff' },
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: 18, marginBottom: 14,
    backgroundColor: C.white, borderRadius: 14, borderWidth: 1, borderColor: C.line,
    overflow: 'hidden',
  },
  statBox: { flex: 1, alignItems: 'center', paddingVertical: 14, borderRightWidth: 1, borderRightColor: C.line },
  statNum: { fontSize: 22, fontFamily: F.extraBold },
  statLabel: { fontSize: 11, color: C.mut, marginTop: 2 },
  listWrap: { paddingHorizontal: 18, gap: 10 },
  incCard: {
    backgroundColor: C.white, borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: C.line,
    shadowColor: C.ink, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3, elevation: 1,
  },
  incTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  incBadges: { flexDirection: 'row', gap: 6, flex: 1, marginRight: 8, flexWrap: 'wrap' },
  badge: { paddingHorizontal: 9, paddingVertical: 3, borderRadius: 20 },
  badgeText: { fontSize: 11, fontFamily: F.bold },
  incTitle: { fontSize: 14, fontFamily: F.bold, color: C.ink, lineHeight: 20, marginBottom: 6 },
  incFooter: { flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 10 },
  incAvatar: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: C.teal100, alignItems: 'center', justifyContent: 'center',
  },
  incAvatarText: { fontSize: 8, fontFamily: F.extraBold, color: C.teal },
  incReporter: { fontSize: 12, fontFamily: F.semiBold, color: C.sec },
  incTime: { fontSize: 11, color: C.mut },
  fab: {
    position: 'absolute', bottom: 24, right: 20,
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: C.danger,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: C.danger, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 6,
  },
});
