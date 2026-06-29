import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Icon from '@/components/Icon';
import { C, GradientHeaders } from '@/theme/colors';
import { F } from '@/theme/typography';
import GradientHeader from '@/components/GradientHeader';

const MODULE_TABS = [
  { label: 'SoP', icon: 'book-open', color: C.teal, bg: C.teal100 },
  { label: 'WI', icon: 'list', color: C.ok, bg: C.green100 },
  { label: 'Form', icon: 'file-text', color: C.warn, bg: C.amber100 },
  { label: 'Edukasi', icon: 'play-circle', color: C.violet, bg: C.violet100 },
];

const CATS = ['Semua', 'K3', 'Lingkungan', 'Kesehatan'];

const DOCS = [
  {
    id: '1',
    title: 'SoP Penanganan Bahan Berbahaya & Beracun (B3)',
    status: 'Published',
    cat: 'K3',
    version: 'v2.3',
    updated: '12 Jun 2026',
    module: 'SoP',
  },
  {
    id: '2',
    title: 'WI Pengoperasian Forklift Area Gudang',
    status: 'Published',
    cat: 'K3',
    version: 'v1.5',
    updated: '8 Jun 2026',
    module: 'WI',
  },
  {
    id: '3',
    title: 'Form Inspeksi Harian APD',
    status: 'Draft',
    cat: 'K3',
    version: 'v3.0',
    updated: '15 Jun 2026',
    module: 'Form',
  },
  {
    id: '4',
    title: 'SoP Pengelolaan Limbah Cair Industri',
    status: 'Published',
    cat: 'Lingkungan',
    version: 'v1.2',
    updated: '1 Jun 2026',
    module: 'SoP',
  },
  {
    id: '5',
    title: 'Edukasi K3 — Dasar Keselamatan Kerja',
    status: 'Published',
    cat: 'K3',
    version: 'v1.0',
    updated: '20 Mei 2026',
    module: 'Edukasi',
  },
  {
    id: '6',
    title: 'SoP Pemeriksaan Kesehatan Berkala Karyawan',
    status: 'Published',
    cat: 'Kesehatan',
    version: 'v2.1',
    updated: '5 Jun 2026',
    module: 'SoP',
  },
  {
    id: '7',
    title: 'Form Laporan Kecelakaan Kerja',
    status: 'Published',
    cat: 'K3',
    version: 'v4.0',
    updated: '3 Jun 2026',
    module: 'Form',
  },
  {
    id: '8',
    title: 'WI Penanganan Tumpahan Bahan Kimia',
    status: 'Draft',
    cat: 'Lingkungan',
    version: 'v1.1',
    updated: '18 Jun 2026',
    module: 'WI',
  },
];

export default function HseScreen() {
  const [activeModule, setActiveModule] = useState(0);
  const [activeCat, setActiveCat] = useState(0);

  const currentModule = MODULE_TABS[activeModule].label;
  const currentCat = CATS[activeCat];

  const filtered = DOCS.filter((d) => {
    if (d.module !== currentModule) return false;
    if (currentCat !== 'Semua' && d.cat !== currentCat) return false;
    return true;
  });

  return (
    <View style={styles.container}>
      <GradientHeader
        title="Modul HSE"
        colors={GradientHeaders.hse as [string, string]}
        rightIcon="search"
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Module tabs */}
        <View style={styles.moduleTabs}>
          {MODULE_TABS.map((m, i) => (
            <TouchableOpacity
              key={m.label}
              style={[
                styles.moduleTab,
                activeModule === i && { borderColor: m.color, borderWidth: 2 },
              ]}
              onPress={() => setActiveModule(i)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.moduleIcon,
                  { backgroundColor: m.bg },
                  activeModule === i && { backgroundColor: m.color },
                ]}
              >
                <Icon
                  name={m.icon}
                  size={20}
                  color={activeModule === i ? '#fff' : m.color}
                />
              </View>
              <Text
                style={[
                  styles.moduleLabel,
                  activeModule === i && {
                    color: m.color,
                    fontFamily: F.extraBold,
                  },
                ]}
              >
                {m.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Category chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.catRow}
        >
          {CATS.map((cat, i) => (
            <TouchableOpacity
              key={cat}
              style={[styles.catChip, activeCat === i && styles.catChipActive]}
              onPress={() => setActiveCat(i)}
            >
              <Text
                style={[
                  styles.catText,
                  activeCat === i && styles.catTextActive,
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Document list */}
        <View style={styles.docList}>
          {filtered.length === 0 ? (
            <View style={styles.empty}>
              <Icon name="folder" size={40} color={C.mut} />
              <Text style={styles.emptyText}>Belum ada dokumen</Text>
            </View>
          ) : (
            filtered.map((doc) => {
              const isPublished = doc.status === 'Published';
              return (
                <TouchableOpacity
                  key={doc.id}
                  style={styles.docCard}
                  activeOpacity={0.7}
                >
                  <View style={styles.docTop}>
                    <View
                      style={[
                        styles.badge,
                        {
                          backgroundColor: isPublished ? C.teal100 : C.surface,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.badgeText,
                          { color: isPublished ? C.teal : C.sec },
                        ]}
                      >
                        {doc.status}
                      </Text>
                    </View>
                    <View style={[styles.catBadge]}>
                      <Text style={styles.catBadgeText}>{doc.cat}</Text>
                    </View>
                  </View>
                  <Text style={styles.docTitle}>{doc.title}</Text>
                  <View style={styles.docMeta}>
                    <Text style={styles.docVersion}>{doc.version}</Text>
                    <Text style={styles.docUpdated}>
                      Diperbarui {doc.updated}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 32 },
  moduleTabs: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  moduleTab: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: C.white,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: C.line,
    shadowColor: C.ink,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  moduleIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 7,
  },
  moduleLabel: { fontSize: 12, fontFamily: F.semiBold, color: C.sec },
  catRow: { paddingHorizontal: 18, paddingBottom: 12, gap: 8 },
  catChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.line,
  },
  catChipActive: { backgroundColor: C.teal, borderColor: C.teal },
  catText: { fontSize: 13, fontFamily: F.semiBold, color: C.sec },
  catTextActive: { color: '#fff' },
  docList: { paddingHorizontal: 18, gap: 10 },
  empty: { alignItems: 'center', paddingVertical: 48, gap: 12 },
  emptyText: { fontSize: 14, color: C.mut },
  docCard: {
    backgroundColor: C.white,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: C.line,
    shadowColor: C.ink,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  docTop: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  badge: { paddingHorizontal: 9, paddingVertical: 3, borderRadius: 20 },
  badgeText: { fontSize: 11, fontFamily: F.bold },
  catBadge: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 20,
    backgroundColor: C.surface,
  },
  catBadgeText: { fontSize: 11, fontFamily: F.semiBold, color: C.sec },
  docTitle: { fontSize: 14, fontFamily: F.bold, color: C.ink, lineHeight: 20 },
  docMeta: { flexDirection: 'row', gap: 10, marginTop: 8 },
  docVersion: {
    fontSize: 12,
    fontFamily: F.bold,
    color: C.teal,
    fontFamily: 'monospace',
  },
  docUpdated: { fontSize: 12, color: C.mut },
});
