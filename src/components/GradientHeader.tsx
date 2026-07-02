import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from './Icon';
import { C } from '@/theme/colors';
import { F } from '@/theme/typography';

interface Props {
  title: string;
  colors: [string, string];
  onBack?: () => void;
  rightIcon?: string;
  onRight?: () => void;
  rightBadge?: number;
  subtitle?: React.ReactNode;
}

export default function GradientHeader({
  title,
  colors,
  onBack,
  rightIcon,
  onRight,
  rightBadge,
  subtitle,
}: Props) {
  const insets = useSafeAreaInsets();

  return (
    <LinearGradient
      colors={colors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        styles.header,
        { paddingTop: insets.top + 12, paddingBottom: 16 },
      ]}
    >
      <StatusBar barStyle="light-content" />
      <View style={styles.row}>
        {onBack ? (
          <TouchableOpacity
            onPress={onBack}
            style={styles.iconBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Icon name="arrow-left" size={22} color="#fff" />
          </TouchableOpacity>
        ) : null}
        <Text style={styles.title}>{title}</Text>
        {rightIcon ? (
          <TouchableOpacity onPress={onRight} style={styles.iconBtn}>
            <Icon name={rightIcon} size={20} color="#fff" />
            {!!rightBadge && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{rightBadge}</Text>
              </View>
            )}
          </TouchableOpacity>
        ) : (
          <View style={styles.iconBtnPlaceholder} />
        )}
      </View>
      {subtitle ? <View style={styles.subtitle}>{subtitle}</View> : null}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 18, flexShrink: 0, alignSelf: 'stretch' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 65,
  },
  title: { fontSize: 28, fontFamily: F.extraBold, color: '#fff', flex: 1 },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  iconBtnPlaceholder: { width: 40, height: 40 },
  badge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: C.danger,
    borderRadius: 7,
    minWidth: 14,
    height: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    fontSize: 8,
    fontFamily: F.bold,
    color: '#fff',
    lineHeight: 14,
    includeFontPadding: false,
    textAlignVertical: 'center',
    textAlign: 'center',
  },
  subtitle: { marginTop: 8 },
});
