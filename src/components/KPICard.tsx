import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from './Icon';
import { C } from '@/theme/colors';
import { F } from '@/theme/typography';

interface Props {
  label: string;
  value: string;
  unit?: string;
  trend: string;
  trendUp: boolean;
  icon: string;
  accent: string;
  tint: string;
  compare?: string;
}

export default function KPICard({ label, value, unit, trend, trendUp, icon, accent, tint, compare }: Props) {
  const trendColor = trendUp ? C.danger : C.ok;

  return (
    <View style={styles.card}>
      <View style={styles.top}>
        <View style={[styles.iconWrap, { backgroundColor: tint }]}>
          <Icon name={icon} size={18} color={accent} />
        </View>
        <View style={[styles.trendBadge, { backgroundColor: trendUp ? C.red100 : C.green100 }]}>
          <Icon
            name={trendUp ? 'trending-up' : 'trending-down'}
            size={11}
            color={trendColor}
          />
          <Text style={[styles.trendText, { color: trendColor, fontFamily: F.semiBold }]}>{trend}</Text>
        </View>
      </View>
      <Text style={[styles.value, { color: accent, fontFamily: F.extraBold }]}>{value}</Text>
      {unit ? <Text style={[styles.unit, { fontFamily: F.regular }]}>{unit}</Text> : null}
      <Text style={[styles.label, { fontFamily: F.semiBold }]}>{label}</Text>
      {compare ? <Text style={[styles.compare, { fontFamily: F.regular }]}>{compare}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: C.white,
    borderRadius: 14,
    padding: 14,
    width: 148,
    marginRight: 12,
    borderWidth: 1,
    borderColor: C.line,
    shadowColor: C.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
  },
  trendText: { fontSize: 10 },
  value: { fontSize: 26, lineHeight: 30, marginBottom: 2 },
  unit: { fontSize: 10, color: C.mut, marginBottom: 2 },
  label: { fontSize: 11, color: C.sec, lineHeight: 14 },
  compare: { fontSize: 10, color: C.mut, marginTop: 2 },
});
