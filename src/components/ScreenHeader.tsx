import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from './Icon';
import { C } from '@/theme/colors';
import { F } from '@/theme/typography';

interface Props {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  rightAction?: { icon: string; onPress: () => void };
  dark?: boolean;
}

export default function ScreenHeader({ title, subtitle, onBack, rightAction, dark }: Props) {
  const insets = useSafeAreaInsets();
  const bg = dark ? C.navy : C.white;
  const textColor = dark ? '#fff' : C.ink;
  const subColor = dark ? 'rgba(255,255,255,0.6)' : C.mut;
  const iconColor = dark ? '#fff' : C.sec;

  return (
    <View style={[styles.header, { paddingTop: insets.top + 8, backgroundColor: bg, borderBottomColor: C.line }]}>
      <View style={styles.inner}>
        {onBack && (
          <TouchableOpacity onPress={onBack} style={styles.backBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Icon name="arrow-left" size={20} color={iconColor} />
          </TouchableOpacity>
        )}
        <View style={styles.titleWrap}>
          <Text style={[styles.title, { color: textColor, fontFamily: F.bold }]}>{title}</Text>
          {subtitle && <Text style={[styles.subtitle, { color: subColor, fontFamily: F.regular }]}>{subtitle}</Text>}
        </View>
        {rightAction && (
          <TouchableOpacity onPress={rightAction.onPress} style={styles.rightBtn}>
            <Icon name={rightAction.icon} size={20} color={iconColor} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1 },
  inner: { flexDirection: 'row', alignItems: 'center' },
  backBtn: { marginRight: 12, padding: 2 },
  titleWrap: { flex: 1 },
  title: { fontSize: 18 },
  subtitle: { fontSize: 12, marginTop: 1 },
  rightBtn: { padding: 4, marginLeft: 8 },
});
