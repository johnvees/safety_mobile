import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { IconFileText } from '@tabler/icons-react-native';
import { C } from '@/theme/colors';
import { F } from '@/theme/typography';
import StatusBadge from './StatusBadge';

interface Props {
  title: string;
  version: string;
  updatedAt: string;
  status: string;
  onPress?: () => void;
}

export default function DocumentCard({ title, version, updatedAt, status, onPress }: Props) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.iconWrap}>
        <IconFileText size={22} color={C.teal} stroke={1.8} />
      </View>
      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text style={[styles.title, { fontFamily: F.semiBold }]} numberOfLines={2}>{title}</Text>
          <StatusBadge label={status} showDot={false} />
        </View>
        <Text style={[styles.meta, { fontFamily: F.regular }]}>
          {version} · Update {updatedAt}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: C.white,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: C.line,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    shadowColor: C.ink,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: C.teal100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { flex: 1 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6, gap: 8 },
  title: { fontSize: 14, color: C.ink, lineHeight: 20, flex: 1 },
  meta: { fontSize: 12, color: C.mut },
});
