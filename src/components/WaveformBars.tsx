import React from 'react';
import { View, StyleSheet } from 'react-native';

interface Props {
  levels: number[]; // 0-1 heights, left to right
  progress?: number; // 0-1, fraction of bars considered "active"
  activeColor: string;
  mutedColor: string;
  height?: number;
}

export default function WaveformBars({ levels, progress = 1, activeColor, mutedColor, height = 24 }: Props) {
  const activeCount = Math.round(progress * levels.length);

  return (
    <View style={[styles.row, { height }]}>
      {levels.map((lvl, i) => (
        <View
          key={i}
          style={[
            styles.bar,
            {
              height: Math.max(3, lvl * height),
              backgroundColor: i < activeCount ? activeColor : mutedColor,
            },
          ]}
        />
      ))}
    </View>
  );
}

function seededLevel(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return 0.25 + (x - Math.floor(x)) * 0.75;
}

export function generateLevels(seedKey: string, count: number): number[] {
  let hash = 0;
  for (let i = 0; i < seedKey.length; i++) {
    hash = (hash * 31 + seedKey.charCodeAt(i)) % 100000;
  }
  return Array.from({ length: count }, (_, i) => seededLevel(hash + i * 7.13));
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 2.5 },
  bar: { width: 2.5, borderRadius: 1.5 },
});
