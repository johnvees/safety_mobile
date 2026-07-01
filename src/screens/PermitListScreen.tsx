import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import Icon from '@/components/Icon';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { C, GradientHeaders, StatusMap } from '@/theme/colors';
import { F } from '@/theme/typography';
import { permits } from '@/data/mockData';
import GradientHeader from '@/components/GradientHeader';
import { RootStackParamList } from '@/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const TYPES = ['Semua', 'Hot Work', 'Confined Space', 'Working at Height', 'Electrical'];

const typeColors: Record<string, [string, string]> = {
  'Hot Work': [C.danger, C.red100],
  'Confined Space': [C.violet, C.violet100],
  'Working at Height': [C.warn, C.amber100],
  'Electrical': [C.teal, C.teal100],
};

export default function PermitListScreen() {
  const navigation = useNavigation<Nav>();
  const [typeFilter, setTypeFilter] = useState(0);
  const [search, setSearch] = useState('');

  const filtered = permits.filter((p) => {
    if (typeFilter > 0 && p.type !== TYPES[typeFilter]) return false;
    if (search && !p.title.toLowerCase().includes(search.toLowerCase()) && !p.permitNumber.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <View style={styles.container}>
      <GradientHeader
        title="Permit Kerja HSE"
        colors={GradientHeaders.permit as [string, string]}
        onBack={() => navigation.goBack()}
        rightIcon="plus"
      />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.searchWrap}>
          <Icon name="search" size={16} color={C.mut} />
          <TextInput
            style={styles.searchInput}
            placeholder="Cari permit, PTW nomor..."
            placeholderTextColor={C.mut}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {TYPES.map((t, i) => (
            <TouchableOpacity
              key={t}
              style={[styles.chip, typeFilter === i && styles.chipActive]}
              onPress={() => setTypeFilter(i)}
            >
              <Text style={[styles.chipText, typeFilter === i && styles.chipTextActive]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.listWrap}>
          {filtered.map((permit) => {
            const [typeColor, typeBg] = typeColors[permit.type] ?? [C.sec, C.surface];
            const [statusColor, statusBg] = StatusMap[permit.status] ?? [C.sec, C.surface];
            return (
              <TouchableOpacity
                key={permit.id}
                style={styles.card}
                onPress={() => navigation.navigate('PermitDetail', { id: permit.id })}
                activeOpacity={0.7}
              >
                <View style={styles.cardHeader}>
                  <View style={[styles.typeBadge, { backgroundColor: typeBg }]}>
                    <Text style={[styles.typeBadgeText, { color: typeColor }]}>{permit.type}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
                    <Text style={[styles.statusBadgeText, { color: statusColor }]}>{permit.status}</Text>
                  </View>
                </View>
                <Text style={styles.ptwNum}>{permit.permitNumber}</Text>
                <Text style={styles.title}>{permit.title}</Text>
                <View style={styles.metaRow}>
                  <View style={styles.metaItem}>
                    <Icon name="map-pin" size={12} color={C.mut} />
                    <Text style={styles.metaText}>{permit.location}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Icon name="calendar" size={12} color={C.mut} />
                    <Text style={styles.metaText}>{permit.validDate}</Text>
                  </View>
                </View>
                <View style={styles.cardFooter}>
                  <View style={styles.picRow}>
                    <View style={styles.picAvatar}>
                      <Text style={styles.picAvatarText}>{permit.applicant.split(' ').map((n) => n[0]).join('').slice(0, 2)}</Text>
                    </View>
                    <Text style={styles.picName}>{permit.applicant}</Text>
                  </View>
                  <Icon name="chevron-right" size={16} color={C.mut} />
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
  fab: {
    position: 'absolute', bottom: 24, right: 20,
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: C.warn,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: C.warn, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 8, elevation: 6,
  },
  container: { flex: 1, backgroundColor: C.bg },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 80 },
  searchWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginHorizontal: 18, marginTop: 14,
    backgroundColor: C.white, borderRadius: 12, borderWidth: 1, borderColor: C.line,
    paddingHorizontal: 12, paddingVertical: 10,
  },
  searchInput: { flex: 1, fontSize: 14, color: C.ink, padding: 0 },
  filterRow: { paddingHorizontal: 18, paddingVertical: 12, gap: 8 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 20, backgroundColor: C.white,
    borderWidth: 1, borderColor: C.line,
  },
  chipActive: { backgroundColor: C.warn, borderColor: C.warn },
  chipText: { fontSize: 13, fontFamily: F.semiBold, color: C.sec },
  chipTextActive: { color: '#fff' },
  listWrap: { paddingHorizontal: 18, gap: 10 },
  card: {
    backgroundColor: C.white, borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: C.line,
    shadowColor: C.ink, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3, elevation: 1,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  typeBadge: { paddingHorizontal: 9, paddingVertical: 3, borderRadius: 20 },
  typeBadgeText: { fontSize: 11, fontFamily: F.bold },
  statusBadge: { paddingHorizontal: 9, paddingVertical: 3, borderRadius: 20 },
  statusBadgeText: { fontSize: 11, fontFamily: F.bold },
  ptwNum: { fontSize: 11.5, fontFamily: 'monospace', color: C.sec, marginBottom: 4 },
  title: { fontSize: 14.5, fontFamily: F.bold, color: C.ink, lineHeight: 20, marginBottom: 10 },
  metaRow: { flexDirection: 'row', gap: 16, marginBottom: 10 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaText: { fontSize: 12, color: C.sec },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: C.line, paddingTop: 10 },
  picRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  picAvatar: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: C.amber100, alignItems: 'center', justifyContent: 'center',
  },
  picAvatarText: { fontSize: 9, fontFamily: F.extraBold, color: C.warn },
  picName: { fontSize: 12.5, fontFamily: F.semiBold, color: C.sec },
});
