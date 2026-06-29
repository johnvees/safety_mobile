import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Dimensions,
  Animated,
  PanResponder,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from '@/components/Icon';
import { C } from '@/theme/colors';
import { F } from '@/theme/typography';

const SCOPE_DATA: Record<string, Record<string, string[]>> = {
  Feedmill: {
    'Plant Medan': ['Produksi', 'Maintenance', 'Quality Control', 'HSE', 'Engineering'],
    'Plant Surabaya': ['Produksi', 'Engineering', 'HSE', 'Maintenance'],
    'Plant Makassar': ['Produksi', 'Maintenance', 'HSE'],
    'Plant Banjarmasin': ['Produksi', 'Quality Control', 'Engineering'],
  },
  'Food Processing': {
    'Plant Cikande': ['Produksi', 'Maintenance', 'Quality Control', 'HSE'],
    'Plant Jakarta': ['Produksi', 'Maintenance', 'Packing'],
    'Plant Semarang': ['Produksi', 'QA', 'Maintenance'],
  },
  'BISI (Corn/Seed)': {
    'Plant Madiun': ['Produksi', 'Maintenance', 'Agronomi', 'Quality Control'],
    'Plant Kediri': ['Produksi', 'Maintenance'],
  },
  Poultry: {
    'Farm Bogor': ['Produksi', 'Veteriner', 'Maintenance'],
    'Farm Blitar': ['Produksi', 'Veteriner', 'HSE'],
    'Farm Lampung': ['Produksi', 'Maintenance'],
  },
};

interface Props {
  visible: boolean;
  currentScope: string;
  onClose: () => void;
  onApply: (scope: string) => void;
}

const { height: SCREEN_H } = Dimensions.get('window');
const SHEET_MAX_H = SCREEN_H * 0.78;
const DRAG_CLOSE_THRESHOLD = 80;
const DRAG_VELOCITY_THRESHOLD = 0.5;

export default function ScopePickerSheet({
  visible,
  currentScope,
  onClose,
  onApply,
}: Props) {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(SHEET_MAX_H)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const buAnims = useRef(
    Object.keys(SCOPE_DATA).map(() => ({ opacity: new Animated.Value(0), ty: new Animated.Value(10) }))
  ).current;
  const plantAnims = useRef(
    Array.from({ length: 6 }, () => ({ opacity: new Animated.Value(1), ty: new Animated.Value(0) }))
  ).current;
  const deptAnims = useRef(
    Array.from({ length: 6 }, () => ({ opacity: new Animated.Value(1), ty: new Animated.Value(0) }))
  ).current;

  const parsedParts = currentScope.split(' > ');
  const [selBU, setSelBU] = useState(parsedParts[0] ?? '');
  const [selPlant, setSelPlant] = useState(parsedParts[1] ?? '');
  const [selDept, setSelDept] = useState(parsedParts[2] ?? '');

  const isInitialBU = useRef(true);
  const isInitialPlant = useRef(true);

  useEffect(() => {
    if (visible) {
      isInitialBU.current = true;
      isInitialPlant.current = true;

      translateY.setValue(SHEET_MAX_H);
      overlayOpacity.setValue(0);

      const parts = currentScope.split(' > ');
      const initBU = parts[0] ?? '';
      const initPlant = parts[1] ?? '';
      const initDept = parts[2] ?? '';

      setSelBU(initBU);
      setSelPlant(initPlant);
      setSelDept(initDept);

      const plantCount = initBU ? Object.keys(SCOPE_DATA[initBU] ?? {}).length : 0;
      const deptCount = initBU && initPlant ? (SCOPE_DATA[initBU]?.[initPlant] ?? []).length : 0;

      buAnims.forEach((a) => { a.opacity.setValue(0); a.ty.setValue(10); });
      plantAnims.slice(0, plantCount).forEach((a) => { a.opacity.setValue(0); a.ty.setValue(10); });
      deptAnims.slice(0, deptCount).forEach((a) => { a.opacity.setValue(0); a.ty.setValue(10); });

      const allItems = [
        ...buAnims,
        ...plantAnims.slice(0, plantCount),
        ...deptAnims.slice(0, deptCount),
      ];

      Animated.parallel([
        Animated.timing(overlayOpacity, { toValue: 1, duration: 220, useNativeDriver: true }),
        Animated.spring(translateY, { toValue: 0, tension: 100, friction: 12, useNativeDriver: true }),
        Animated.sequence([
          Animated.delay(160),
          Animated.stagger(50, allItems.map((a) =>
            Animated.parallel([
              Animated.timing(a.opacity, { toValue: 1, duration: 190, useNativeDriver: true }),
              Animated.spring(a.ty, { toValue: 0, tension: 130, friction: 12, useNativeDriver: true }),
            ])
          )),
        ]),
      ]).start();
    }
  }, [visible, currentScope]);

  useEffect(() => {
    if (isInitialBU.current) { isInitialBU.current = false; return; }
    const count = Object.keys(SCOPE_DATA[selBU] ?? {}).length;
    plantAnims.slice(0, count).forEach((a) => { a.opacity.setValue(0); a.ty.setValue(10); });
    Animated.stagger(50, plantAnims.slice(0, count).map((a) =>
      Animated.parallel([
        Animated.timing(a.opacity, { toValue: 1, duration: 180, useNativeDriver: true }),
        Animated.spring(a.ty, { toValue: 0, tension: 130, friction: 12, useNativeDriver: true }),
      ])
    )).start();
  }, [selBU]);

  useEffect(() => {
    if (isInitialPlant.current) { isInitialPlant.current = false; return; }
    const count = (SCOPE_DATA[selBU]?.[selPlant] ?? []).length;
    deptAnims.slice(0, count).forEach((a) => { a.opacity.setValue(0); a.ty.setValue(10); });
    Animated.stagger(45, deptAnims.slice(0, count).map((a) =>
      Animated.parallel([
        Animated.timing(a.opacity, { toValue: 1, duration: 170, useNativeDriver: true }),
        Animated.spring(a.ty, { toValue: 0, tension: 130, friction: 12, useNativeDriver: true }),
      ])
    )).start();
  }, [selPlant]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(overlayOpacity, { toValue: 0, duration: 180, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: SHEET_MAX_H, duration: 200, useNativeDriver: true }),
    ]).start(() => onClose());
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, g) => g.dy > 0,
      onPanResponderMove: (_, g) => {
        if (g.dy > 0) {
          translateY.setValue(g.dy);
          overlayOpacity.setValue(Math.max(0, 1 - g.dy / SHEET_MAX_H));
        }
      },
      onPanResponderRelease: (_, g) => {
        if (g.dy > DRAG_CLOSE_THRESHOLD || g.vy > DRAG_VELOCITY_THRESHOLD) {
          Animated.parallel([
            Animated.timing(overlayOpacity, { toValue: 0, duration: 180, useNativeDriver: true }),
            Animated.timing(translateY, { toValue: SHEET_MAX_H, duration: 200, useNativeDriver: true }),
          ]).start(() => onClose());
        } else {
          Animated.parallel([
            Animated.timing(overlayOpacity, { toValue: 1, duration: 150, useNativeDriver: true }),
            Animated.spring(translateY, { toValue: 0, useNativeDriver: true, tension: 120, friction: 10 }),
          ]).start();
        }
      },
    })
  ).current;

  const businessUnits = Object.keys(SCOPE_DATA);
  const plants = selBU ? Object.keys(SCOPE_DATA[selBU] ?? {}) : [];
  const departments =
    selBU && selPlant ? SCOPE_DATA[selBU]?.[selPlant] ?? [] : [];

  const breadcrumb = [selBU, selPlant, selDept].filter(Boolean).join(' › ');

  const handleSelectBU = (bu: string) => {
    setSelBU(bu);
    setSelPlant('');
    setSelDept('');
  };

  const handleSelectPlant = (plant: string) => {
    setSelPlant(plant);
    setSelDept('');
  };

  const handleApply = () => {
    const scope = [selBU, selPlant, selDept].filter(Boolean).join(' > ');
    onApply(scope);
    handleClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={handleClose} />
        <Animated.View
          style={[
            styles.sheet,
            { paddingBottom: insets.bottom + 16 },
            { transform: [{ translateY }] },
          ]}
        >
          {/* Draggable handle */}
          <View {...panResponder.panHandlers} style={styles.handleArea}>
            <View style={styles.handle} />
          </View>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Pilih Cakupan</Text>
            <TouchableOpacity
              onPress={handleClose}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Icon name="x" size={20} color={C.sec} />
            </TouchableOpacity>
          </View>

          {/* Breadcrumb preview */}
          {breadcrumb.length > 0 && (
            <View style={styles.breadcrumbRow}>
              <Icon name="map-pin" size={12} color={C.sec} />
              <Text style={styles.breadcrumbText}>{breadcrumb}</Text>
            </View>
          )}

          <ScrollView
            style={styles.scroll}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Business Unit */}
            <Text style={styles.sectionLabel}>1 · BUSINESS UNIT</Text>
            {businessUnits.map((bu, i) => {
              const active = selBU === bu;
              return (
                <Animated.View key={bu} style={{ opacity: buAnims[i].opacity, transform: [{ translateY: buAnims[i].ty }] }}>
                  <TouchableOpacity
                    style={[styles.row, active && styles.rowActive]}
                    onPress={() => handleSelectBU(bu)}
                    activeOpacity={0.75}
                  >
                    <View style={[styles.radio, active && styles.radioActive]}>
                      {active && <Icon name="check" size={13} color={C.white} />}
                    </View>
                    <Text style={[styles.rowLabel, active && styles.rowLabelActive]}>{bu}</Text>
                    {active && <Icon name="chevron-right" size={16} color="#3b82f6" />}
                  </TouchableOpacity>
                </Animated.View>
              );
            })}

            {/* Plant */}
            {plants.length > 0 && (
              <>
                <Text style={styles.sectionLabel}>2 · PLANT</Text>
                {plants.map((plant, i) => {
                  const active = selPlant === plant;
                  return (
                    <Animated.View key={plant} style={{ opacity: plantAnims[i].opacity, transform: [{ translateY: plantAnims[i].ty }] }}>
                      <TouchableOpacity
                        style={[styles.row, active && styles.rowActive]}
                        onPress={() => handleSelectPlant(plant)}
                        activeOpacity={0.75}
                      >
                        <View style={[styles.radio, active && styles.radioActive]}>
                          {active && <Icon name="check" size={13} color={C.white} />}
                        </View>
                        <Text style={[styles.rowLabel, active && styles.rowLabelActive]}>{plant}</Text>
                        {active && <Icon name="chevron-right" size={16} color="#3b82f6" />}
                      </TouchableOpacity>
                    </Animated.View>
                  );
                })}
              </>
            )}

            {/* Department */}
            {departments.length > 0 && (
              <>
                <Text style={styles.sectionLabel}>3 · DEPARTMENT</Text>
                {departments.map((dept, i) => {
                  const active = selDept === dept;
                  return (
                    <Animated.View key={dept} style={{ opacity: deptAnims[i].opacity, transform: [{ translateY: deptAnims[i].ty }] }}>
                      <TouchableOpacity
                        style={[styles.row, active && styles.rowActive]}
                        onPress={() => setSelDept(dept)}
                        activeOpacity={0.75}
                      >
                        <View style={[styles.radio, active && styles.radioActive]}>
                          {active && <Icon name="check" size={13} color={C.white} />}
                        </View>
                        <Text style={[styles.rowLabel, active && styles.rowLabelActive]}>{dept}</Text>
                        {active && <Icon name="chevron-right" size={16} color="#3b82f6" />}
                      </TouchableOpacity>
                    </Animated.View>
                  );
                })}
              </>
            )}
          </ScrollView>

          {/* Apply button */}
          <TouchableOpacity
            style={[styles.applyBtn, !selBU && styles.applyBtnDisabled]}
            onPress={handleApply}
            disabled={!selBU}
            activeOpacity={0.85}
          >
            <Text style={styles.applyText}>Terapkan Cakupan</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: C.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: SHEET_MAX_H,
    paddingHorizontal: 20,
  },

  handleArea: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: C.line,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  title: { fontSize: 20, fontFamily: F.extraBold, color: C.ink },

  breadcrumbRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: C.bg,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 20,
    alignSelf: 'flex-start',
  },
  breadcrumbText: { fontSize: 12.5, fontFamily: F.medium, color: C.sec },

  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 8 },

  sectionLabel: {
    fontSize: 11,
    fontFamily: F.bold,
    color: C.mut,
    letterSpacing: 0.8,
    marginTop: 16,
    marginBottom: 8,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: C.line,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 8,
    gap: 14,
    backgroundColor: C.white,
  },
  rowActive: { backgroundColor: '#EEF2FF', borderColor: '#3b82f6' },

  radio: {
    width: 28,
    height: 28,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: C.line,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  radioActive: { backgroundColor: '#3b82f6', borderColor: '#3b82f6' },

  rowLabel: {
    flex: 1,
    fontSize: 15,
    fontFamily: F.semiBold,
    color: C.ink,
    includeFontPadding: false,
  },
  rowLabelActive: { color: C.ink },

  applyBtn: {
    backgroundColor: '#3b82f6',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 12,
  },
  applyBtnDisabled: { backgroundColor: C.line },
  applyText: {
    fontSize: 15,
    fontFamily: F.bold,
    color: C.white,
    includeFontPadding: false,
  },
});
