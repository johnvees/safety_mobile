import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { IconCheck, IconX } from '@tabler/icons-react-native';
import { C } from '@/theme/colors';
import { F } from '@/theme/typography';

interface Props {
  label: string;
  hint?: string;
  value: 'ok' | 'na' | 'fail' | null;
  onOk?: () => void;
  onNa?: () => void;
  onFail?: () => void;
}

export default function ChecklistItemRow({ label, hint, value, onOk, onNa, onFail }: Props) {
  return (
    <View style={styles.row}>
      <View style={styles.labelWrap}>
        <Text style={[styles.label, { fontFamily: F.medium }]}>{label}</Text>
        {hint ? <Text style={[styles.hint, { fontFamily: F.regular }]}>{hint}</Text> : null}
      </View>
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionBtn, value === 'ok' && styles.actionOk]}
          onPress={onOk}
          activeOpacity={0.7}
        >
          <IconCheck size={16} color={value === 'ok' ? C.ok : C.mut} stroke={2} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, value === 'na' && styles.actionNa]}
          onPress={onNa}
          activeOpacity={0.7}
        >
          <Text style={[styles.naText, { color: value === 'na' ? C.sec : C.mut, fontFamily: F.semiBold }]}>N/A</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, value === 'fail' && styles.actionFail]}
          onPress={onFail}
          activeOpacity={0.7}
        >
          <IconX size={16} color={value === 'fail' ? C.danger : C.mut} stroke={2} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.line,
    gap: 12,
  },
  labelWrap: { flex: 1 },
  label: { fontSize: 14, color: C.ink, lineHeight: 20 },
  hint: { fontSize: 11, color: C.mut, marginTop: 2 },
  actions: { flexDirection: 'row', gap: 6 },
  actionBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: C.line,
    backgroundColor: C.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionOk: { backgroundColor: C.green100, borderColor: C.ok },
  actionNa: { backgroundColor: C.surface, borderColor: C.sec },
  actionFail: { backgroundColor: C.red100, borderColor: C.danger },
  naText: { fontSize: 11 },
});
