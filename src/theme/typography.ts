import { StyleSheet } from 'react-native';
import { C } from './colors';

export const F = {
  regular: 'PlusJakartaSans_400Regular',
  medium: 'PlusJakartaSans_500Medium',
  semiBold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
  extraBold: 'PlusJakartaSans_800ExtraBold',
};

export const Typography = StyleSheet.create({
  h1: { fontSize: 24, fontFamily: F.bold, color: C.ink, lineHeight: 32 },
  h2: { fontSize: 20, fontFamily: F.bold, color: C.ink, lineHeight: 28 },
  h3: { fontSize: 16, fontFamily: F.semiBold, color: C.ink, lineHeight: 24 },
  h4: { fontSize: 14, fontFamily: F.semiBold, color: C.ink, lineHeight: 20 },
  body: { fontSize: 14, fontFamily: F.regular, color: C.sec, lineHeight: 20 },
  bodySmall: { fontSize: 12, fontFamily: F.regular, color: C.mut, lineHeight: 16 },
  caption: { fontSize: 11, fontFamily: F.regular, color: C.mut, lineHeight: 14 },
  label: { fontSize: 12, fontFamily: F.semiBold, color: C.sec, lineHeight: 16 },
  mono: { fontSize: 13, fontFamily: F.semiBold, color: C.ink, lineHeight: 18 },
});
