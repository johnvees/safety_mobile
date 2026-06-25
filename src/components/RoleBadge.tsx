import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RoleColors } from '@/theme/colors';
import { F } from '@/theme/typography';

interface Props {
  role: string;
}

export default function RoleBadge({ role }: Props) {
  const color = RoleColors[role] ?? '#475569';

  return (
    <View style={[styles.badge, { backgroundColor: `${color}18` }]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.text, { color, fontFamily: F.semiBold }]}>{role}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
    gap: 6,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  text: { fontSize: 12 },
});
