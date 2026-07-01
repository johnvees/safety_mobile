import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from '@/components/Icon';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { C, GradientHeaders } from '@/theme/colors';
import { F } from '@/theme/typography';
import { currentUser } from '@/data/mockData';
import { RootStackParamList } from '@/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function MoreScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const initials = currentUser.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

  const MODUL = [
    { icon: 'bar-chart-2', label: 'Laporan & Analitik', badge: 0, onPress: () => navigation.navigate('DashboardFull') },
    { icon: 'calendar', label: 'Jadwal Inspeksi', badge: 0, onPress: () => navigation.navigate('InspeksiList') },
  ];

  const ADMIN = [
    { icon: 'database', label: 'Master Data', locked: true, onPress: () => {} },
    { icon: 'settings', label: 'Pengaturan', locked: false, onPress: () => navigation.navigate('SettingsFull') },
    { icon: 'help-circle', label: 'Bantuan & Panduan', locked: false, onPress: () => {} },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={GradientHeaders.more as [string, string]}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={[styles.profileHeader, { paddingTop: insets.top + 12 }]}
      >
        <View style={styles.profileRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{currentUser.name}</Text>
            <Text style={styles.profileEmail}>budi.s@cpi.co.id</Text>
            <View style={styles.roleRow}>
              <View style={styles.roleBadge}>
                <Text style={styles.roleBadgeText}>Lv.5 · {currentUser.role}</Text>
              </View>
            </View>
          </View>
          <TouchableOpacity style={styles.editBtn}>
            <Icon name="edit-2" size={16} color="rgba(255,255,255,0.8)" />
          </TouchableOpacity>
        </View>
        <View style={styles.scopeRow}>
          <Icon name="map-pin" size={12} color="rgba(255,255,255,0.5)" />
          <Text style={styles.scopeText}>{currentUser.scope}</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>MODUL LAINNYA</Text>
          <View style={styles.menuList}>
            {MODUL.map((m, i) => (
              <TouchableOpacity
                key={m.label}
                style={[styles.menuRow, i < MODUL.length - 1 && styles.menuBorder]}
                onPress={m.onPress}
                activeOpacity={0.7}
              >
                <View style={styles.menuIconWrap}>
                  <Icon name={m.icon} size={18} color={C.teal} />
                </View>
                <Text style={styles.menuLabel}>{m.label}</Text>
                {m.badge > 0 && (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadText}>{m.badge}</Text>
                  </View>
                )}
                <Icon name="chevron-right" size={16} color={C.mut} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>ADMINISTRASI</Text>
          <View style={styles.menuList}>
            {ADMIN.map((a, i) => (
              <TouchableOpacity
                key={a.label}
                style={[styles.menuRow, i < ADMIN.length - 1 && styles.menuBorder, a.locked && styles.menuRowLocked]}
                onPress={a.locked ? undefined : a.onPress}
                activeOpacity={a.locked ? 1 : 0.7}
              >
                <View style={[styles.menuIconWrap, a.locked && { backgroundColor: C.surface }]}>
                  <Icon name={a.icon} size={18} color={a.locked ? C.mut : C.teal} />
                </View>
                <Text style={[styles.menuLabel, a.locked && styles.menuLabelLocked]}>{a.label}</Text>
                {a.locked ? (
                  <View style={styles.lockedBadge}>
                    <Icon name="lock" size={11} color={C.mut} />
                    <Text style={styles.lockedText}>Admin only</Text>
                  </View>
                ) : (
                  <Icon name="chevron-right" size={16} color={C.mut} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <TouchableOpacity style={styles.logoutBtn} activeOpacity={0.8}>
            <Icon name="log-out" size={18} color={C.danger} />
            <Text style={styles.logoutText}>Keluar</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.version}>HSE Safety CPIN · v1.0.0</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  profileHeader: { paddingHorizontal: 18, paddingBottom: 32 },
  profileRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 14, minHeight: 65 },
  avatar: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: C.teal, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2.5, borderColor: 'rgba(255,255,255,0.3)',
  },
  avatarText: { fontSize: 20, fontFamily: F.extraBold, color: '#fff' },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 18, fontFamily: F.extraBold, color: '#fff' },
  profileEmail: { fontSize: 12.5, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  roleRow: { marginTop: 6 },
  roleBadge: {
    backgroundColor: 'rgba(217,119,6,0.85)', paddingHorizontal: 9, paddingVertical: 3,
    borderRadius: 20, alignSelf: 'flex-start',
  },
  roleBadgeText: { fontSize: 11, fontFamily: F.extraBold, color: '#fff' },
  editBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center', justifyContent: 'center',
  },
  scopeRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12 },
  scopeText: { fontSize: 12, color: 'rgba(255,255,255,0.7)' },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 32 },
  section: { paddingHorizontal: 18, marginTop: 20 },
  sectionLabel: { fontSize: 11, fontFamily: F.bold, color: C.mut, letterSpacing: 0.8, marginBottom: 10 },
  menuList: {
    backgroundColor: C.white, borderRadius: 16,
    borderWidth: 1, borderColor: C.line,
    overflow: 'hidden',
    shadowColor: C.ink, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3, elevation: 1,
  },
  menuRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 15, gap: 12 },
  menuBorder: { borderBottomWidth: 1, borderBottomColor: C.line },
  menuRowLocked: { opacity: 0.55 },
  menuIconWrap: {
    width: 38, height: 38, borderRadius: 11,
    backgroundColor: C.teal100, alignItems: 'center', justifyContent: 'center',
  },
  menuLabel: { fontSize: 14.5, fontFamily: F.semiBold, color: C.ink, flex: 1 },
  menuLabelLocked: { color: C.mut },
  unreadBadge: {
    backgroundColor: C.danger, borderRadius: 10,
    minWidth: 20, height: 20, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5,
  },
  unreadText: { fontSize: 11, fontFamily: F.extraBold, color: '#fff' },
  lockedBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: C.surface, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20,
  },
  lockedText: { fontSize: 11, color: C.mut },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: C.red100, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 16,
    borderWidth: 1, borderColor: '#FECACA',
  },
  logoutText: { fontSize: 15, fontFamily: F.bold, color: C.danger },
  version: { textAlign: 'center', fontSize: 12, color: C.mut, marginTop: 20 },
});
