import React, { useRef } from 'react';
import { Animated, PanResponder, StyleSheet, TouchableOpacity, View } from 'react-native';
import Icon from '@/components/Icon';
import { C } from '@/theme/colors';

const ACTION_WIDTH = 76;
const SWIPE_THRESHOLD = 40;

interface Props {
  children: React.ReactNode;
  onArchive: () => void;
  onDelete: () => void;
}

export default function SwipeableRow({ children, onArchive, onDelete }: Props) {
  const translateX = useRef(new Animated.Value(0)).current;
  const lastOffset = useRef(0);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) =>
        Math.abs(g.dx) > 8 && Math.abs(g.dx) > Math.abs(g.dy),
      onPanResponderMove: (_, g) => {
        const next = lastOffset.current + g.dx;
        const clamped = Math.max(-ACTION_WIDTH, Math.min(ACTION_WIDTH, next));
        translateX.setValue(clamped);
      },
      onPanResponderRelease: (_, g) => {
        const next = lastOffset.current + g.dx;
        let target = 0;
        if (next <= -SWIPE_THRESHOLD) target = -ACTION_WIDTH;
        else if (next >= SWIPE_THRESHOLD) target = ACTION_WIDTH;
        lastOffset.current = target;
        Animated.spring(translateX, {
          toValue: target,
          useNativeDriver: true,
          tension: 120,
          friction: 14,
        }).start();
      },
    }),
  ).current;

  function reset() {
    lastOffset.current = 0;
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true,
      tension: 120,
      friction: 14,
    }).start();
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.actionLeft}>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: C.warn }]}
          onPress={() => {
            reset();
            onArchive();
          }}
        >
          <Icon name="archive" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
      <View style={styles.actionRight}>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: C.danger }]}
          onPress={() => {
            reset();
            onDelete();
          }}
        >
          <Icon name="trash" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
      <Animated.View
        style={[styles.foreground, { transform: [{ translateX }] }]}
        {...panResponder.panHandlers}
      >
        {children}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'relative' },
  foreground: { backgroundColor: C.bg },
  actionLeft: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: ACTION_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionRight: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: ACTION_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtn: {
    width: ACTION_WIDTH,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
