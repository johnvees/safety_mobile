import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from './Icon';
import { F } from '@/theme/typography';

interface Props {
  scope: string;
  light?: boolean;
}

export default function ScopeBreadcrumb({ scope, light }: Props) {
  const parts = scope.split(' > ');
  const textColor = light ? 'rgba(255,255,255,0.85)' : '#64748B';
  const chevronColor = light ? 'rgba(255,255,255,0.5)' : '#94A3B8';

  return (
    <View style={styles.row}>
      <Icon name="map-pin" size={11} color={chevronColor} />
      {parts.map((part, i) => (
        <React.Fragment key={i}>
          {i > 0 && <Icon name="chevron-right" size={11} color={chevronColor} style={styles.chevron} />}
          <Text style={[styles.part, { color: textColor, fontFamily: F.medium }]}>{part}</Text>
        </React.Fragment>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 3, flexWrap: 'wrap' },
  chevron: { marginHorizontal: 1 },
  part: { fontSize: 11.5 },
});
