import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { C } from '@/theme/colors';
import { F } from '@/theme/typography';

interface Props {
  message: string;
  isMe?: boolean;
  timestamp?: string;
}

export default function ChatBubble({ message, isMe = false, timestamp }: Props) {
  return (
    <View style={[styles.wrap, isMe ? styles.wrapMe : styles.wrapOther]}>
      <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleOther]}>
        <Text style={[styles.text, { fontFamily: F.regular, color: isMe ? '#fff' : C.ink }]}>
          {message}
        </Text>
      </View>
      {timestamp ? (
        <Text style={[styles.time, { fontFamily: F.regular }]}>{timestamp}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginVertical: 4, maxWidth: '75%' },
  wrapMe: { alignSelf: 'flex-end', alignItems: 'flex-end' },
  wrapOther: { alignSelf: 'flex-start', alignItems: 'flex-start' },
  bubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },
  bubbleMe: {
    backgroundColor: C.teal,
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.line,
    borderBottomLeftRadius: 4,
  },
  text: { fontSize: 14, lineHeight: 20 },
  time: { fontSize: 10, color: C.mut, marginTop: 3 },
});
