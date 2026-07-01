import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import Icon from '@/components/Icon';
import { C, GradientHeaders } from '@/theme/colors';
import { F } from '@/theme/typography';
import GradientHeader from '@/components/GradientHeader';
import HseDocCard from '@/components/HseDocCard';
import HseFabMenu from '@/components/HseFabMenu';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/navigation/types';
import { JENIS_OPTIONS } from '@/constants/hseJenis';
import { HSE_DOCS, Attachment } from '@/data/hseDocs';
import { styles } from './HseScreen.styles';

const MODULE_TABS = [
  { label: 'SoP', icon: 'book-open', color: C.teal, bg: C.teal100 },
  { label: 'WI', icon: 'list', color: C.ok, bg: C.green100 },
  { label: 'Form', icon: 'file-text', color: C.warn, bg: C.amber100 },
  { label: 'Edukasi', icon: 'play-circle', color: C.violet, bg: C.violet100 },
];

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function HseScreen() {
  const navigation = useNavigation<Nav>();
  const [activeModule, setActiveModule] = useState(0);
  const [activeCat, setActiveCat] = useState(0);
  const [search, setSearch] = useState('');
  const [docs, setDocs] = useState(HSE_DOCS);
  const [likedDocs, setLikedDocs] = useState<Set<string>>(new Set());

  function toggleLike(id: string) {
    setLikedDocs((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const currentModule = MODULE_TABS[activeModule].label;
  const cats = ['Semua', ...(JENIS_OPTIONS[currentModule] ?? [])];
  const currentCat = cats[activeCat] ?? 'Semua';
  const searchQ = search.trim().toLowerCase();

  function selectModule(i: number) {
    setActiveModule(i);
    setActiveCat(0);
  }

  function updateDoc(
    id: string,
    updated: {
      title: string;
      cat: string;
      attachments: Attachment[];
      deskripsi: string;
      poin: { id: string; text: string }[];
    },
  ) {
    setDocs((prev) =>
      prev.map((d) => (d.id === id ? { ...d, ...updated } : d)),
    );
  }

  const filtered = docs.filter((d) => {
    if (d.module !== currentModule) return false;
    if (currentCat !== 'Semua' && d.cat !== currentCat) return false;
    if (searchQ && !d.title.toLowerCase().includes(searchQ)) return false;
    return true;
  });

  return (
    <View style={styles.container}>
      <GradientHeader
        title="Modul HSE"
        colors={GradientHeaders.hse as [string, string]}
        rightIcon="bell"
        rightBadge={4}
        onRight={() => navigation.navigate('Notifikasi')}
        subtitle={
          <View style={styles.headerSearch}>
            <View style={styles.headerSearchInput}>
              <Icon name="search" size={15} color="rgba(255,255,255,0.6)" />
              <TextInput
                style={styles.headerSearchText}
                placeholder="Cari dokumen..."
                placeholderTextColor="rgba(255,255,255,0.5)"
                value={search}
                onChangeText={setSearch}
                returnKeyType="search"
              />
              {search.length > 0 && (
                <TouchableOpacity
                  onPress={() => setSearch('')}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Icon name="x" size={14} color="rgba(255,255,255,0.7)" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        }
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
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
              onPress={() => selectModule(i)}
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
          {cats.map((cat, i) => (
            <TouchableOpacity
              key={cat}
              style={[styles.catChip, activeCat === i && styles.catChipActive]}
              onPress={() =>
                setActiveCat((prev) => (prev === i && i !== 0 ? 0 : i))
              }
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
            filtered.map((doc) => (
              <HseDocCard
                key={doc.id}
                doc={doc}
                liked={likedDocs.has(doc.id)}
                onToggleLike={() => toggleLike(doc.id)}
                onPress={() =>
                  navigation.navigate('HseModulDetail', {
                    id: doc.id,
                    title: doc.title,
                    cat: doc.cat,
                    module: doc.module,
                    updated: doc.updated,
                    attachments: doc.attachments,
                    deskripsi: doc.deskripsi,
                    poin: doc.poin,
                    onSave: (updated) => updateDoc(doc.id, updated),
                    onDelete: () =>
                      setDocs((prev) => prev.filter((d) => d.id !== doc.id)),
                  })
                }
              />
            ))
          )}
        </View>
      </ScrollView>

      <HseFabMenu />
    </View>
  );
}
