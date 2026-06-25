import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { StatusMap, SeverityMap } from '@/theme/colors';
import { F } from '@/theme/typography';

interface Props {
  label: string;
  type?: 'status' | 'severity';
  showDot?: boolean;
}

export default function StatusBadge({ label, type = 'status', showDot = true }: Props) {
  const map = type === 'severity' ? SeverityMap : StatusMap;
  const [color, bg] = map[label] ?? ['#64748B', '#F1F5F9'];

  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      {showDot && <View style={[styles.dot, { backgroundColor: color }]} />}
      <Text style={[styles.text, { color, fontFamily: F.bold }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 20,
    alignSelf: 'flex-start',
    gap: 5,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  text: { fontSize: 11.5 },
});
