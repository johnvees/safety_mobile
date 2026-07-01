import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from '@/components/Icon';
import { C } from '@/theme/colors';
import { RootStackParamList } from '@/navigation/types';
import { styles } from '@/screens/HomeScreen.styles';

const quickActions = [
  {
    icon: 'alert-triangle',
    color: C.danger,
    tint: C.red100,
    title: 'Laporkan Insiden',
    sub: 'Near miss, kecelakaan, unsafe',
    route: 'CaseIncident' as const,
  },
  {
    icon: 'clipboard',
    color: C.ok,
    tint: C.green100,
    title: 'Mulai Inspeksi',
    sub: 'Pilih template & lokasi',
    route: 'InspeksiList' as const,
  },
  {
    icon: 'file-text',
    color: C.warn,
    tint: C.amber100,
    title: 'Buat Permit',
    sub: 'Izin kerja HSE baru',
    route: 'PermitList' as const,
  },
];

type Nav = NativeStackNavigationProp<RootStackParamList>;

interface Props {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function HomeFabMenu({ open: fabOpen, setOpen: setFabOpen }: Props) {
  const navigation = useNavigation<Nav>();
  const insets = useSafeAreaInsets();
  const [overlayMounted, setOverlayMounted] = useState(false);
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;
  const panelSlide = useRef(new Animated.Value(60)).current;
  const cardAnims = useRef(
    quickActions.map(() => ({
      opacity: new Animated.Value(0),
      translateY: new Animated.Value(10),
    }))
  ).current;

  useEffect(() => {
    Animated.spring(rotateAnim, {
      toValue: fabOpen ? 1 : 0,
      useNativeDriver: true,
      tension: 120,
      friction: 8,
    }).start();

    if (fabOpen) {
      cardAnims.forEach((a) => { a.opacity.setValue(0); a.translateY.setValue(12); });
      setOverlayMounted(true);
      Animated.parallel([
        Animated.timing(overlayAnim, { toValue: 1, duration: 240, useNativeDriver: true }),
        Animated.spring(panelSlide, { toValue: 0, tension: 90, friction: 11, useNativeDriver: true }),
        Animated.stagger(
          65,
          cardAnims.map((a) =>
            Animated.parallel([
              Animated.timing(a.opacity, { toValue: 1, duration: 210, useNativeDriver: true }),
              Animated.spring(a.translateY, { toValue: 0, tension: 120, friction: 12, useNativeDriver: true }),
            ])
          )
        ),
      ]).start();
    } else {
      Animated.parallel([
        Animated.stagger(
          25,
          [...cardAnims].reverse().map((a) =>
            Animated.parallel([
              Animated.timing(a.opacity, { toValue: 0, duration: 110, useNativeDriver: true }),
              Animated.timing(a.translateY, { toValue: 8, duration: 110, useNativeDriver: true }),
            ])
          )
        ),
        Animated.sequence([
          Animated.delay(70),
          Animated.parallel([
            Animated.timing(overlayAnim, { toValue: 0, duration: 190, useNativeDriver: true }),
            Animated.timing(panelSlide, { toValue: 60, duration: 190, useNativeDriver: true }),
          ]),
        ]),
      ]).start(() => setOverlayMounted(false));
    }
  }, [fabOpen]);

  useEffect(() => {
    return navigation.addListener('blur', () => setFabOpen(false));
  }, [navigation]);

  const fabRotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '135deg'],
  });

  return (
    <>
      {overlayMounted && (
        <Animated.View
          style={[StyleSheet.absoluteFill, styles.overlayBg, { opacity: overlayAnim }]}
        >
          <TouchableOpacity style={StyleSheet.absoluteFill} onPress={() => setFabOpen(false)} />
          <Animated.View
            style={[styles.qaPanel, { paddingBottom: insets.bottom + 80, transform: [{ translateY: panelSlide }] }]}
          >
            <Text style={styles.qaLabel}>Aksi Cepat</Text>
            {quickActions.map((qa, i) => (
              <Animated.View
                key={qa.title}
                style={{ opacity: cardAnims[i].opacity, transform: [{ translateY: cardAnims[i].translateY }] }}
              >
                <TouchableOpacity
                  style={styles.qaCard}
                  activeOpacity={0.8}
                  onPress={() => {
                    setFabOpen(false);
                    navigation.navigate(qa.route);
                  }}
                >
                  <View style={[styles.qaIconWrap, { backgroundColor: qa.tint }]}>
                    <Icon name={qa.icon} size={22} color={qa.color} />
                  </View>
                  <View style={styles.qaBody}>
                    <Text style={styles.qaTitle}>{qa.title}</Text>
                    <Text style={styles.qaSub}>{qa.sub}</Text>
                  </View>
                  <Icon name="chevron-right" size={16} color={C.mut} />
                </TouchableOpacity>
              </Animated.View>
            ))}
          </Animated.View>
        </Animated.View>
      )}

      <TouchableOpacity
        style={[styles.fab, { bottom: insets.bottom + 8 }]}
        onPress={() => setFabOpen((o) => !o)}
        activeOpacity={0.85}
      >
        {fabOpen ? (
          <View style={styles.fabDark}>
            <Animated.View style={{ transform: [{ rotate: fabRotate }] }}>
              <Icon name="plus" size={22} color={C.white} />
            </Animated.View>
          </View>
        ) : (
          <LinearGradient
            colors={['#60a5fa', '#2563eb']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.fabGradient}
          >
            <Animated.View style={{ transform: [{ rotate: fabRotate }] }}>
              <Icon name="plus" size={22} color={C.white} />
            </Animated.View>
          </LinearGradient>
        )}
      </TouchableOpacity>
    </>
  );
}
