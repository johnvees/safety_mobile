import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from './Icon';
import { C } from '@/theme/colors';
import { F } from '@/theme/typography';
import StatusBadge from './StatusBadge';

interface Props {
  item: {
    id: string;
    title: string;
    type: string;
    severity: string;
    status: string;
    location: string;
    reporter: string;
    date: string;
  };
  onPress?: () => void;
}

export default function IncidentCard({ item, onPress }: Props) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.top}>
        <View style={styles.badges}>
          <StatusBadge label={item.type} />
          <StatusBadge label={item.severity} type="severity" />
        </View>
        <StatusBadge label={item.status} />
      </View>
      <Text style={[styles.title, { fontFamily: F.semiBold }]} numberOfLines={2}>{item.title}</Text>
      <View style={styles.meta}>
        <View style={styles.metaRow}>
          <Icon name="map-pin" size={11} color={C.mut} />
          <Text style={[styles.metaText, { fontFamily: F.regular }]}>{item.location}</Text>
        </View>
        <View style={styles.metaRow}>
          <Icon name="user" size={11} color={C.mut} />
          <Text style={[styles.metaText, { fontFamily: F.regular }]}>{item.reporter}</Text>
        </View>
        <View style={styles.metaRow}>
          <Icon name="calendar" size={11} color={C.mut} />
          <Text style={[styles.metaText, { fontFamily: F.regular }]}>{item.date}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: C.white,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: C.line,
    shadowColor: C.ink,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  badges: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', flex: 1, marginRight: 8 },
  title: { fontSize: 14, color: C.ink, marginBottom: 10, lineHeight: 20 },
  meta: { gap: 4 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaText: { fontSize: 12, color: C.mut },
});
