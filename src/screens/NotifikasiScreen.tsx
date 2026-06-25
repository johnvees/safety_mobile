import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import Icon from '@/components/Icon';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { C } from '@/theme/colors';
import { F } from '@/theme/typography';
import { notifications } from '@/data/mockData';

const iconMap: Record<string, { icon: string; color: string; bg: string }> = {
  incident: { icon: 'alert-triangle', color: C.danger, bg: C.red100 },
  inspection: { icon: 'clipboard', color: C.ok, bg: C.green100 },
  permit: { icon: 'file-text', color: C.warn, bg: C.amber100 },
  system: { icon: 'bell', color: C.teal, bg: C.teal100 },
};

export default function NotifikasiScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [items, setItems] = useState(notifications);

  const unreadCount = items.filter((n) => !n.read).length;
  const markAll = () => setItems((p) => p.map((n) => ({ ...n, read: true })));
  const markOne = (id: string) => setItems((p) => p.map((n) => n.id === id ? { ...n, read: true } : n));

  const grouped: Record<string, typeof notifications> = {};
  items.forEach((n) => {
    if (!grouped[n.date]) grouped[n.date] = [];
    grouped[n.date].push(n);
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Icon name="arrow-left" size={22} color={C.ink} />
        </TouchableOpacity>
        <View style={styles.headerMid}>
          <Text style={styles.headerTitle}>Notifikasi</Text>
          {unreadCount > 0 && (
            <View style={styles.countBadge}><Text style={styles.countText}>{unreadCount}</Text></View>
          )}
        </View>
        {unreadCount > 0 ? (
          <TouchableOpacity onPress={markAll}><Text style={styles.markAll}>Baca semua</Text></TouchableOpacity>
        ) : <View style={{ width: 60 }} />}
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {Object.entries(grouped).map(([date, notifs]) => (
          <View key={date}>
            <Text style={styles.dateLabel}>{date}</Text>
            <View style={styles.group}>
              {notifs.map((n, i) => {
                const cfg = iconMap[n.type] ?? iconMap.system;
                return (
                  <TouchableOpacity
                    key={n.id}
                    style={[styles.row, i < notifs.length - 1 && styles.rowBorder, !n.read && styles.rowUnread]}
                    onPress={() => markOne(n.id)}
                    activeOpacity={0.7}
                  >
                    {!n.read && <View style={styles.dot} />}
                    <View style={[styles.iconWrap, { backgroundColor: cfg.bg }]}>
                      <Icon name={cfg.icon} size={17} color={cfg.color} />
                    </View>
                    <View style={styles.body}>
                      <Text style={[styles.notifTitle, !n.read && styles.notifTitleBold]}>{n.title}</Text>
                      <Text style={styles.notifMsg} numberOfLines={2}>{n.message}</Text>
                      <Text style={styles.notifTime}>{n.time}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}
        {items.length === 0 && (
          <View style={styles.empty}>
            <Icon name="bell-off" size={40} color={C.mut} />
            <Text style={styles.emptyText}>Tidak ada notifikasi</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 18, paddingBottom: 14,
    backgroundColor: C.white, borderBottomWidth: 1, borderBottomColor: C.line,
  },
  headerMid: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1, marginHorizontal: 12 },
  headerTitle: { fontSize: 18, fontFamily: F.extraBold, color: C.ink },
  countBadge: {
    backgroundColor: C.danger, borderRadius: 10,
    minWidth: 20, height: 20, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5,
  },
  countText: { fontSize: 11, fontFamily: F.extraBold, color: '#fff' },
  markAll: { fontSize: 12.5, fontFamily: F.bold, color: C.teal },
  scroll: { flex: 1 },
  scrollContent: { paddingVertical: 12, paddingBottom: 32 },
  dateLabel: { fontSize: 11, fontFamily: F.bold, color: C.mut, letterSpacing: 0.5, paddingHorizontal: 18, marginBottom: 8, marginTop: 10 },
  group: {
    backgroundColor: C.white, marginHorizontal: 18, borderRadius: 14,
    borderWidth: 1, borderColor: C.line, overflow: 'hidden', marginBottom: 4,
    shadowColor: C.ink, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3, elevation: 1,
  },
  row: { flexDirection: 'row', alignItems: 'flex-start', padding: 14, gap: 12, position: 'relative' },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: C.line },
  rowUnread: { backgroundColor: '#F0F9FF' },
  dot: { position: 'absolute', top: 18, left: 5, width: 7, height: 7, borderRadius: 3.5, backgroundColor: C.teal },
  iconWrap: { width: 38, height: 38, borderRadius: 11, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  body: { flex: 1 },
  notifTitle: { fontSize: 13.5, fontFamily: F.semiBold, color: C.sec, lineHeight: 18 },
  notifTitleBold: { color: C.ink, fontFamily: F.bold },
  notifMsg: { fontSize: 12.5, color: C.sec, marginTop: 3, lineHeight: 17 },
  notifTime: { fontSize: 11, color: C.mut, marginTop: 4 },
  empty: { alignItems: 'center', paddingVertical: 60, gap: 12 },
  emptyText: { fontSize: 14, color: C.mut },
});
