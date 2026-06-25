import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Switch, StatusBar } from 'react-native';
import Icon from '@/components/Icon';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { C } from '@/theme/colors';
import { F } from '@/theme/typography';
import { currentUser } from '@/data/mockData';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [notifPush, setNotifPush] = useState(true);
  const [notifEmail, setNotifEmail] = useState(false);
  const [biometric, setBiometric] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const initials = currentUser.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Icon name="arrow-left" size={22} color={C.ink} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pengaturan</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{currentUser.name}</Text>
            <Text style={styles.profileRole}>Lv.5 · {currentUser.role}</Text>
            <Text style={styles.profileEmail}>budi.s@cpi.co.id</Text>
          </View>
          <TouchableOpacity style={styles.editBtn}>
            <Icon name="edit-2" size={16} color={C.teal} />
          </TouchableOpacity>
        </View>

        {/* Notifikasi */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>NOTIFIKASI</Text>
          <View style={styles.menuList}>
            {[
              { label: 'Push Notification', sub: 'Terima notifikasi real-time', value: notifPush, onToggle: setNotifPush },
              { label: 'Email Notification', sub: 'Notifikasi melalui email', value: notifEmail, onToggle: setNotifEmail },
            ].map((item, i, arr) => (
              <View key={item.label} style={[styles.menuRow, i < arr.length - 1 && styles.menuBorder]}>
                <View style={styles.menuText}>
                  <Text style={styles.menuLabel}>{item.label}</Text>
                  <Text style={styles.menuSub}>{item.sub}</Text>
                </View>
                <Switch
                  value={item.value}
                  onValueChange={item.onToggle}
                  trackColor={{ false: C.line, true: C.teal }}
                  thumbColor="#fff"
                />
              </View>
            ))}
          </View>
        </View>

        {/* Keamanan */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>KEAMANAN</Text>
          <View style={styles.menuList}>
            <View style={[styles.menuRow, styles.menuBorder]}>
              <View style={styles.menuText}>
                <Text style={styles.menuLabel}>Biometric Login</Text>
                <Text style={styles.menuSub}>Gunakan sidik jari / Face ID</Text>
              </View>
              <Switch
                value={biometric}
                onValueChange={setBiometric}
                trackColor={{ false: C.line, true: C.teal }}
                thumbColor="#fff"
              />
            </View>
            <TouchableOpacity style={[styles.menuRow, styles.menuBorder]} activeOpacity={0.7}>
              <View style={styles.menuText}>
                <Text style={styles.menuLabel}>Ubah Password</Text>
                <Text style={styles.menuSub}>Perbarui kata sandi akun Anda</Text>
              </View>
              <Icon name="chevron-right" size={16} color={C.mut} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuRow} activeOpacity={0.7}>
              <View style={styles.menuText}>
                <Text style={styles.menuLabel}>Sesi Aktif</Text>
                <Text style={styles.menuSub}>Kelola sesi login aktif</Text>
              </View>
              <Icon name="chevron-right" size={16} color={C.mut} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Tampilan */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>TAMPILAN</Text>
          <View style={styles.menuList}>
            <View style={styles.menuRow}>
              <View style={styles.menuText}>
                <Text style={styles.menuLabel}>Dark Mode</Text>
                <Text style={styles.menuSub}>Tema gelap untuk kenyamanan mata</Text>
              </View>
              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
                trackColor={{ false: C.line, true: C.teal }}
                thumbColor="#fff"
              />
            </View>
          </View>
        </View>

        {/* Tentang */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>TENTANG</Text>
          <View style={styles.menuList}>
            {['Versi Aplikasi', 'Kebijakan Privasi', 'Syarat & Ketentuan'].map((item, i, arr) => (
              <TouchableOpacity key={item} style={[styles.menuRow, i < arr.length - 1 && styles.menuBorder]} activeOpacity={0.7}>
                <Text style={styles.menuLabel}>{item}</Text>
                {item === 'Versi Aplikasi' ? (
                  <Text style={styles.versionText}>v1.0.0</Text>
                ) : (
                  <Icon name="chevron-right" size={16} color={C.mut} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={{ height: 16 }} />
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
  headerTitle: { fontSize: 18, fontFamily: F.extraBold, color: C.ink },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 32 },
  profileCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    margin: 18, backgroundColor: C.white, borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: C.line,
    shadowColor: C.ink, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3, elevation: 1,
  },
  avatar: {
    width: 50, height: 50, borderRadius: 25,
    backgroundColor: C.teal, alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 18, fontFamily: F.extraBold, color: '#fff' },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 16, fontFamily: F.extraBold, color: C.ink },
  profileRole: { fontSize: 12, color: C.sec, marginTop: 2 },
  profileEmail: { fontSize: 12, color: C.mut, marginTop: 1 },
  editBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: C.teal100, alignItems: 'center', justifyContent: 'center',
  },
  section: { paddingHorizontal: 18, marginBottom: 6 },
  sectionLabel: { fontSize: 11, fontFamily: F.bold, color: C.mut, letterSpacing: 0.8, marginBottom: 8 },
  menuList: {
    backgroundColor: C.white, borderRadius: 14, borderWidth: 1, borderColor: C.line, overflow: 'hidden',
    shadowColor: C.ink, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3, elevation: 1,
  },
  menuRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, paddingHorizontal: 15 },
  menuBorder: { borderBottomWidth: 1, borderBottomColor: C.line },
  menuText: { flex: 1, marginRight: 10 },
  menuLabel: { fontSize: 14, fontFamily: F.semiBold, color: C.ink },
  menuSub: { fontSize: 11.5, color: C.mut, marginTop: 2 },
  versionText: { fontSize: 13, color: C.mut, fontFamily: F.semiBold },
});
