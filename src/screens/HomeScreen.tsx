import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from '@/components/Icon';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { C, RoleColors, GradientHeaders } from '@/theme/colors';
import { currentUser } from '@/data/mockData';
import { RootStackParamList } from '@/navigation/types';
import ScopePickerSheet from '@/components/ScopePickerSheet';
import HomeFabMenu from '@/components/HomeFabMenu';
import { styles } from './HomeScreen.styles';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const kpis = [
  {
    icon: 'alert-triangle',
    label: 'Insiden Bulan Ini',
    value: '3',
    trend: '-57%',
    trendUp: false,
    trendBad: false,
    accent: C.danger,
    tint: C.red100,
  },
  {
    icon: 'file-text',
    label: 'Permit Terbuka',
    value: '7',
    trend: '+2',
    trendUp: true,
    trendBad: true,
    accent: C.warn,
    tint: C.amber100,
  },
  {
    icon: 'clipboard',
    label: 'Skor Inspeksi',
    value: '92%',
    trend: '+4%',
    trendUp: true,
    trendBad: false,
    accent: C.ok,
    tint: C.green100,
  },
  {
    icon: 'eye',
    label: 'Unsafe Act',
    value: '5',
    trend: '+1',
    trendUp: true,
    trendBad: true,
    accent: C.teal,
    tint: C.teal100,
  },
];

const plantStatus = [
  { name: 'Plant Medan', division: 'Feedmill', status: 'AMAN', color: C.ok },
  {
    name: 'Plant Surabaya',
    division: 'Feedmill',
    status: 'WASPADA',
    color: C.warn,
  },
  {
    name: 'Plant Cikande',
    division: 'Food Processing',
    status: 'BAHAYA',
    color: C.danger,
  },
];

const feedItems = [
  {
    icon: 'file-text',
    color: C.warn,
    tint: C.amber100,
    text: '3 permit menunggu persetujuan Anda',
    sub: 'Permit-to-Work · Hot Work',
  },
  {
    icon: 'alert-triangle',
    color: C.danger,
    tint: C.red100,
    text: 'Insiden baru dilaporkan di Area Konstruksi',
    sub: 'oleh Rudi Hermawan · 4j lalu',
  },
  {
    icon: 'clipboard',
    color: C.ok,
    tint: C.green100,
    text: 'Inspeksi APAR selesai — skor 96%',
    sub: 'oleh Siti Rahayu · 2j lalu',
  },
];

export default function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const [fabOpen, setFabOpen] = useState(false);
  const [scopeOpen, setScopeOpen] = useState(false);
  const [activeScope, setActiveScope] = useState(currentUser.scope);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Selamat pagi' : hour < 17 ? 'Selamat siang' : 'Selamat malam';
  const initials = currentUser.name
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const roleKey = `Lv.5 · ${currentUser.role}`;
  const roleColor = RoleColors[roleKey] ?? C.sec;

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={GradientHeaders.home as [string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + 12 }]}
      >
        {/* Top row: avatar + greeting + bell */}
        <View style={styles.headerRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={styles.headerMid}>
            <Text style={styles.headerGreeting}>{greeting},</Text>
            <Text style={styles.headerName}>{currentUser.name}</Text>
          </View>
          <TouchableOpacity
            style={styles.bellBtn}
            onPress={() => navigation.navigate('Notifikasi')}
          >
            <Icon name="bell" size={20} color={C.white} />
            <View style={styles.bellBadge}>
              <Text style={styles.bellBadgeText}>4</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Breadcrumb row */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.breadcrumbRow}
          contentContainerStyle={styles.breadcrumbContent}
        >
          <TouchableOpacity
            style={styles.scopePill}
            onPress={() => setScopeOpen(true)}
            activeOpacity={0.8}
          >
            <Icon name="map-pin" size={11} color="rgba(255,255,255,0.7)" />
            {activeScope.split(' > ').map((part, i) => (
              <React.Fragment key={i}>
                {i > 0 && <Text style={styles.scopeSep}>›</Text>}
                <Text style={styles.scopePart}>{part}</Text>
              </React.Fragment>
            ))}
            <Icon
              name="chevron-down"
              size={14}
              color="rgba(255,255,255,0.7)"
              style={{ marginLeft: 2 }}
            />
          </TouchableOpacity>
          <View style={styles.roleBadge}>
            <View style={[styles.roleDot, { backgroundColor: roleColor }]} />
            <Text style={[styles.roleText, { color: roleColor }]}>
              {roleKey}
            </Text>
          </View>
        </ScrollView>
      </LinearGradient>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 32 },
        ]}
        showsVerticalScrollIndicator={false}
        scrollEnabled={!fabOpen}
      >
        {/* KPI Grid */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Safety KPI</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('DashboardFull')}
            >
              <Text style={styles.seeAll}>Lihat semua</Text>
            </TouchableOpacity>
          </View>
          {[kpis.slice(0, 2), kpis.slice(2, 4)].map((row, ri) => (
            <View key={ri} style={[styles.kpiRow, ri > 0 && { marginTop: 12 }]}>
              {row.map((kpi) => {
                const trendColor = kpi.trendBad ? C.danger : C.ok;
                const trendBg = kpi.trendBad ? C.red100 : C.green100;
                return (
                  <View key={kpi.label} style={styles.kpiCard}>
                    <View style={styles.kpiTop}>
                      <View
                        style={[
                          styles.kpiIconWrap,
                          { backgroundColor: kpi.tint },
                        ]}
                      >
                        <Icon name={kpi.icon} size={18} color={kpi.accent} />
                      </View>
                      <View
                        style={[
                          styles.trendBadge,
                          { backgroundColor: trendBg },
                        ]}
                      >
                        <Icon
                          name={
                            kpi.trendUp ? 'arrow-up-right' : 'arrow-down-right'
                          }
                          size={11}
                          color={trendColor}
                        />
                        <Text style={[styles.trendText, { color: trendColor }]}>
                          {kpi.trend}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.kpiValue}>{kpi.value}</Text>
                    <Text style={styles.kpiLabel}>{kpi.label}</Text>
                  </View>
                );
              })}
            </View>
          ))}
        </View>

        {/* Status Keselamatan Plant */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Status Safety</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>Lihat semua</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.listCard}>
            {plantStatus.map((p, i) => (
              <View key={p.name}>
                {i > 0 && <View style={styles.divider} />}
                <View style={styles.plantRow}>
                  <View
                    style={[styles.plantDot, { backgroundColor: p.color }]}
                  />
                  <View style={styles.plantMid}>
                    <Text style={styles.plantName}>{p.name}</Text>
                    <Text style={styles.plantDiv}>{p.division}</Text>
                  </View>
                  <Text style={[styles.plantStatus, { color: p.color }]}>
                    {p.status}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Aktivitas Terbaru */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Aktivitas Terbaru</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>Lihat Semua</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.listCard}>
            {feedItems.map((f, i) => (
              <View key={f.text}>
                {i > 0 && <View style={styles.divider} />}
                <View style={styles.feedRow}>
                  <View style={[styles.feedIcon, { backgroundColor: f.tint }]}>
                    <Icon name={f.icon} size={16} color={f.color} />
                  </View>
                  <View style={styles.feedBody}>
                    <Text style={styles.feedText}>{f.text}</Text>
                    <Text style={styles.feedSub}>{f.sub}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <HomeFabMenu open={fabOpen} setOpen={setFabOpen} />

      <ScopePickerSheet
        visible={scopeOpen}
        currentScope={activeScope}
        onClose={() => setScopeOpen(false)}
        onApply={(scope) => setActiveScope(scope)}
      />
    </View>
  );
}
