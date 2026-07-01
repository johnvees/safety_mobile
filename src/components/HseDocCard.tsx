import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Icon from '@/components/Icon';
import { C } from '@/theme/colors';
import { HseDoc } from '@/data/hseDocs';
import { styles } from '@/screens/HseScreen.styles';

interface Props {
  doc: HseDoc;
  liked: boolean;
  onToggleLike: () => void;
  onPress: () => void;
}

export default function HseDocCard({ doc, liked, onToggleLike, onPress }: Props) {
  return (
    <TouchableOpacity style={styles.docCard} activeOpacity={0.7} onPress={onPress}>
      <View style={styles.docTop}>
        <View style={styles.catBadge}>
          <Text style={styles.catBadgeText}>{doc.cat}</Text>
        </View>
      </View>
      <Text style={styles.docTitle}>{doc.title}</Text>

      <View style={styles.docDivider} />

      <View style={styles.docFooterRow}>
        <View style={styles.docMeta}>
          <Icon name="clock" size={13} color={C.mut} />
          <Text style={styles.docUpdated}>
            Update {doc.updated} · {doc.updatedBy}
          </Text>
        </View>
        <View style={styles.docStatsRow}>
          <TouchableOpacity
            style={styles.docStatItem}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            onPress={onToggleLike}
          >
            <Icon name={liked ? 'heart-filled' : 'heart'} size={13} color={C.danger} />
            <Text style={styles.docStatText}>{doc.likeCount + (liked ? 1 : 0)}</Text>
          </TouchableOpacity>
          <View style={styles.docStatItem}>
            <Icon name="message-circle" size={13} color={C.mut} />
            <Text style={styles.docStatText}>{doc.commentCount}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
