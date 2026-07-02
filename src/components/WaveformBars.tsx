import React, { useRef, useState } from 'react';
import { View, StyleSheet, PanResponder } from 'react-native';

interface Props {
  levels: number[]; // 0-1 heights, left to right
  progress?: number; // 0-1, fraction of bars considered "active"
  activeColor: string;
  mutedColor: string;
  height?: number;
  onSeek?: (progress: number) => void; // 0-1, fired on tap/drag
}

const MIN_BAR_WIDTH = 1.2;
const MAX_BAR_WIDTH = 2.5;

export default function WaveformBars({
  levels,
  progress = 1,
  activeColor,
  mutedColor,
  height = 24,
  onSeek,
}: Props) {
  const containerRef = useRef<View>(null);
  const [rowWidth, setRowWidth] = useState(0);
  const pageXRef = useRef(0);
  const widthRef = useRef(0);
  const activeCount = Math.round(progress * levels.length);
  const barWidth = rowWidth > 0
    ? Math.max(MIN_BAR_WIDTH, Math.min(MAX_BAR_WIDTH, (rowWidth / levels.length) * 0.55))
    : MAX_BAR_WIDTH;

  function measureContainer() {
    containerRef.current?.measure((_x, _y, w, _h, pageX) => {
      pageXRef.current = pageX;
      widthRef.current = w;
    });
  }

  function seekFromPageX(pageX: number) {
    if (!onSeek || widthRef.current <= 0) return;
    const ratio = Math.max(0, Math.min(1, (pageX - pageXRef.current) / widthRef.current));
    onSeek(ratio);
  }

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !!onSeek,
      onMoveShouldSetPanResponder: () => !!onSeek,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: (e) => seekFromPageX(e.nativeEvent.pageX),
      onPanResponderMove: (_e, g) => seekFromPageX(g.moveX),
    }),
  ).current;

  return (
    <View
      ref={containerRef}
      style={styles.touchArea}
      onLayout={(e) => {
        widthRef.current = e.nativeEvent.layout.width;
        setRowWidth(e.nativeEvent.layout.width);
        measureContainer();
      }}
      hitSlop={{ top: 14, bottom: 14, left: 6, right: 6 }}
      {...panResponder.panHandlers}
    >
      <View style={[styles.row, { height }]} pointerEvents="none">
        {levels.map((lvl, i) => (
          <View
            key={i}
            style={[
              styles.bar,
              {
                width: barWidth,
                borderRadius: barWidth / 2,
                height: Math.max(3, lvl * height),
                backgroundColor: i < activeCount ? activeColor : mutedColor,
              },
            ]}
          />
        ))}
      </View>
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
  touchArea: { width: '100%', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%' },
  bar: { alignSelf: 'center' },
});
