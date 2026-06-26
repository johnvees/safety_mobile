import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import Icon from '@/components/Icon';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { C } from '@/theme/colors';
import { F } from '@/theme/typography';
import { notifications } from '@/data/mockData';

type FilterKey = 'Semua' | 'Persetujuan' | 'Insiden' | 'Sistem';

const FILTERS: FilterKey[] = ['Semua', 'Persetujuan', 'Insiden', 'Sistem'];

const FILTER_TYPES: Record<FilterKey, string[]> = {
  Semua: [],
  Persetujuan: ['permit'],
  Insiden: ['incident'],
  Sistem: ['system', 'sop'],
};

const iconMap: Record<string, { icon: string; color: string; bg: string }> = {
  incident: { icon: 'alert-triangle', color: C.danger, bg: C.red100 },
  inspection: { icon: 'clipboard', color: C.ok, bg: C.green100 },
  permit: { icon: 'file-text', color: C.warn, bg: C.amber100 },
  system: { icon: 'speakerphone', color: C.teal, bg: C.teal100 },
  sop: { icon: 'file-description', color: '#3b82f6', bg: '#dbeafe' },
};

export default function NotifikasiScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [items, setItems] = useState(notifications);
  const [activeFilter, setActiveFilter] = useState<FilterKey>('Semua');

  const unreadCount = items.filter((n) => !n.read).length;

  const markAll = () => setItems((p) => p.map((n) => ({ ...n, read: true })));
  const markOne = (id: string) =>
    setItems((p) => p.map((n) => (n.id === id ? { ...n, read: true } : n)));

  const filterTypes = FILTER_TYPES[activeFilter];
  const filtered =
    filterTypes.length === 0
      ? items
      : items.filter((n) => filterTypes.includes(n.type));

  const grouped: Record<string, typeof notifications> = {};
  filtered.forEach((n) => {
    if (!grouped[n.date]) grouped[n.date] = [];
    grouped[n.date].push(n);
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor={C.white} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={styles.backBtn}
        >
          <Icon name="arrow-left" size={22} color={C.ink} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifikasi</Text>
        {unreadCount > 0 ? (
          <TouchableOpacity onPress={markAll}>
            <Text style={styles.markAll}>Tandai sudah dibaca</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.headerRight} />
        )}
      </View>

      {/* Filter chips */}
      <View style={styles.filterWrap}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.chip, activeFilter === f && styles.chipActive]}
              onPress={() => setActiveFilter(f)}
              activeOpacity={0.75}
            >
              <Text
                style={[
                  styles.chipText,
                  activeFilter === f && styles.chipTextActive,
                ]}
              >
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* List */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {Object.entries(grouped).map(([date, notifs]) => (
          <View key={date}>
            <Text style={styles.dateLabel}>{date}</Text>
            <View style={styles.group}>
              {notifs.map((n, i) => {
                const cfg = iconMap[n.type] ?? iconMap.system;
                return (
                  <TouchableOpacity
                    key={n.id}
                    style={[
                      styles.row,
                      !n.read && styles.rowUnread,
                      i < notifs.length - 1 && styles.rowBorder,
                    ]}
                    onPress={() => markOne(n.id)}
                    activeOpacity={0.7}
                  >
                    <View
                      style={[styles.iconWrap, { backgroundColor: cfg.bg }]}
                    >
                      <Icon name={cfg.icon} size={18} color={cfg.color} />
                    </View>
                    <View style={styles.body}>
                      <Text
                        style={[
                          styles.notifTitle,
                          !n.read && styles.notifTitleUnread,
                        ]}
                      >
                        {n.title}
                      </Text>
                      <Text style={styles.notifMsg}>{n.message}</Text>
                      <Text style={styles.notifTime}>{n.time}</Text>
                    </View>
                    {!n.read && <View style={styles.unreadDot} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}

        {filtered.length === 0 && (
          <View style={styles.empty}>
            <Icon name="bell-off" size={36} color={C.mut} />
            <Text style={styles.emptyText}>Tidak ada notifikasi</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.white },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.white,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  backBtn: { marginRight: 12 },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontFamily: F.extraBold,
    color: C.ink,
    includeFontPadding: false,
  },
  headerRight: { width: 90 },
  markAll: { fontSize: 13, fontFamily: F.semiBold, color: '#3b82f6' },

  // Filter chips
  filterWrap: {
    backgroundColor: C.white,
    borderBottomWidth: 1,
    borderBottomColor: C.line,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 14,
    paddingTop: 4,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: C.line,
    backgroundColor: C.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipActive: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  chipText: {
    fontSize: 13.5,
    fontFamily: F.semiBold,
    color: C.sec,
    lineHeight: 18,
    includeFontPadding: false,
  },
  chipTextActive: {
    color: C.white,
  },

  // List
  scroll: { flex: 1 },
  scrollContent: { paddingTop: 20 },

  dateLabel: {
    fontSize: 11,
    fontFamily: F.bold,
    color: C.mut,
    letterSpacing: 0.8,
    paddingHorizontal: 18,
    marginBottom: 6,
  },
  group: {
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
    gap: 14,
  },
  rowUnread: { backgroundColor: '#EFF6FF' },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: C.line,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  body: { flex: 1 },
  notifTitle: {
    fontSize: 13.5,
    fontFamily: F.semiBold,
    color: C.ink,
    lineHeight: 19,
  },
  notifTitleUnread: { fontFamily: F.bold },
  notifMsg: {
    fontSize: 12.5,
    color: C.sec,
    marginTop: 2,
    lineHeight: 17,
  },
  notifTime: { fontSize: 11.5, color: C.mut, marginTop: 3 },
  unreadDot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: '#3b82f6',
    flexShrink: 0,
  },

  // Empty
  empty: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyText: { fontSize: 14, color: C.mut, fontFamily: F.medium },
});
