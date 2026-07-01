import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from '@/components/Icon';
import { C, GradientHeaders } from '@/theme/colors';
import { F } from '@/theme/typography';
import { getProfile } from '@/data/chatData';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Rt = RouteProp<RootStackParamList, 'ChatProfile'>;

export default function ChatProfileScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<Rt>();
  const insets = useSafeAreaInsets();
  const profile = getProfile(params.name);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={GradientHeaders.chat as [string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + 12 }]}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.iconBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Icon name="arrow-left" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Info Kontak</Text>
        <View style={styles.iconBtnPlaceholder} />
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.avatarWrap}>
          <View style={[styles.avatar, { backgroundColor: params.color }]}>
            <Text style={styles.avatarText}>
              {params.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()}
            </Text>
          </View>
          <Text style={styles.name}>{params.name}</Text>
          <Text style={styles.role}>{profile.role}</Text>
        </View>

        {profile.bio ? (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Tentang</Text>
            <Text style={styles.sectionText}>{profile.bio}</Text>
          </View>
        ) : null}

        {!profile.isGroup && (
          <View style={styles.section}>
            <View style={styles.infoRow}>
              <Icon name="phone" size={18} color={C.mut} />
              <View style={styles.infoBody}>
                <Text style={styles.infoLabel}>Telepon</Text>
                <Text style={styles.infoValue}>{profile.phone}</Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <Icon name="mail" size={18} color={C.mut} />
              <View style={styles.infoBody}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{profile.email}</Text>
              </View>
            </View>
          </View>
        )}

        {profile.isGroup && (
          <View style={styles.section}>
            <View style={styles.infoRow}>
              <Icon name="mail" size={18} color={C.mut} />
              <View style={styles.infoBody}>
                <Text style={styles.infoLabel}>Email Grup</Text>
                <Text style={styles.infoValue}>{profile.email}</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingBottom: 16,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnPlaceholder: { width: 40, height: 40 },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 17, fontFamily: F.bold, color: '#fff' },
  content: { paddingBottom: 40 },
  avatarWrap: { alignItems: 'center', paddingVertical: 28, gap: 4 },
  avatar: {
    width: 92,
    height: 92,
    borderRadius: 46,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  avatarText: { fontSize: 30, fontFamily: F.extraBold, color: '#fff' },
  name: { fontSize: 19, fontFamily: F.extraBold, color: C.ink },
  role: { fontSize: 13.5, color: C.sec, fontFamily: F.medium },
  section: {
    marginHorizontal: 18,
    marginTop: 14,
    backgroundColor: C.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.line,
    padding: 16,
    gap: 14,
  },
  sectionLabel: { fontSize: 12, fontFamily: F.bold, color: C.mut, textTransform: 'uppercase' },
  sectionText: { fontSize: 14, color: C.ink, fontFamily: F.regular, lineHeight: 20 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  infoBody: { flex: 1 },
  infoLabel: { fontSize: 11.5, color: C.mut, fontFamily: F.medium },
  infoValue: { fontSize: 14, color: C.ink, fontFamily: F.regular, marginTop: 2 },
});
