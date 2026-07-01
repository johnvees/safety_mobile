import React, { useRef, useState, useEffect } from 'react';
import { Animated, View, Text, Image, StyleSheet, TouchableOpacity, PanResponder } from 'react-native';
import * as Sharing from 'expo-sharing';
import * as Haptics from 'expo-haptics';
import Icon from '@/components/Icon';
import { C } from '@/theme/colors';
import { F } from '@/theme/typography';
import { ChatAttachment, ChatReplyRef } from '@/data/chatData';
import VoiceMessage from '@/components/VoiceMessage';
import MediaViewerModal from '@/components/MediaViewerModal';
import PdfViewerModal from '@/components/PdfViewerModal';

const SWIPE_MAX = 60;
const SWIPE_TRIGGER = 44;

interface Props {
  message: string;
  isMe?: boolean;
  timestamp?: string;
  attachments?: ChatAttachment[];
  edited?: boolean;
  deleted?: boolean;
  replyTo?: ChatReplyRef;
  status?: 'sent' | 'delivered' | 'read';
  starred?: boolean;
  pulse?: boolean;
  onLongPress?: () => void;
  onSwipeReply?: () => void;
  onReplyPress?: () => void;
}

export default function ChatBubble({
  message,
  isMe = false,
  timestamp,
  attachments = [],
  edited,
  deleted,
  replyTo,
  status,
  starred,
  pulse,
  onLongPress,
  onSwipeReply,
  onReplyPress,
}: Props) {
  const translateX = useRef(new Animated.Value(0)).current;
  const iconOpacity = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const [viewerMedia, setViewerMedia] = useState<{ type: 'image' | 'video'; uri: string } | null>(null);
  const [viewerPdf, setViewerPdf] = useState<{ uri: string; name: string } | null>(null);

  useEffect(() => {
    if (!pulse) return;
    Animated.sequence([
      Animated.timing(pulseAnim, { toValue: 1, duration: 250, useNativeDriver: false }),
      Animated.timing(pulseAnim, { toValue: 0, duration: 650, useNativeDriver: false }),
    ]).start();
  }, [pulse]);

  const pulseOpacity = pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.55] });

  async function openFile(a: ChatAttachment) {
    if (a.mimeType === 'application/pdf') {
      setViewerPdf({ uri: a.uri, name: a.name });
      return;
    }
    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
      Sharing.shareAsync(a.uri, a.mimeType ? { mimeType: a.mimeType } : undefined);
    }
  }

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) =>
        !!onSwipeReply && g.dx > 8 && Math.abs(g.dx) > Math.abs(g.dy),
      onPanResponderMove: (_, g) => {
        const clamped = Math.max(0, Math.min(SWIPE_MAX, g.dx));
        translateX.setValue(clamped);
        iconOpacity.setValue(clamped / SWIPE_MAX);
      },
      onPanResponderRelease: (_, g) => {
        if (g.dx >= SWIPE_TRIGGER) {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onSwipeReply?.();
        }
        Animated.parallel([
          Animated.spring(translateX, { toValue: 0, useNativeDriver: true, tension: 120, friction: 14 }),
          Animated.timing(iconOpacity, { toValue: 0, duration: 150, useNativeDriver: true }),
        ]).start();
      },
    }),
  ).current;

  return (
    <View style={[styles.wrap, isMe ? styles.wrapMe : styles.wrapOther]}>
      <Animated.View style={[styles.replyIconWrap, { opacity: iconOpacity }]}>
        <Icon
          name="arrow-left"
          size={16}
          color={C.teal}
          style={{ transform: [{ rotate: '90deg' }] }}
        />
      </Animated.View>
      <Animated.View style={{ transform: [{ translateX }] }} {...panResponder.panHandlers}>
      <View style={styles.bubbleStack}>
        <Animated.View
          pointerEvents="none"
          style={[styles.pulseGlow, { opacity: pulseOpacity }]}
        />
        <TouchableOpacity
          activeOpacity={onLongPress ? 0.7 : 1}
          onLongPress={() => {
            if (onLongPress) {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              onLongPress();
            }
          }}
          disabled={!onLongPress}
          style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleOther]}
        >
        {deleted ? (
          <View style={styles.deletedRow}>
            <Icon name="x-circle" size={14} color={isMe ? 'rgba(255,255,255,0.7)' : C.mut} />
            <Text style={[styles.deletedText, { color: isMe ? 'rgba(255,255,255,0.85)' : C.mut }]}>
              Pesan ini telah dihapus
            </Text>
          </View>
        ) : (
          <>
            {replyTo && (
              <TouchableOpacity
                activeOpacity={onReplyPress ? 0.6 : 1}
                disabled={!onReplyPress}
                onPress={onReplyPress}
                style={[styles.replyBlock, { borderLeftColor: isMe ? '#fff' : C.teal }]}
              >
                <Text
                  style={[styles.replyName, { color: isMe ? '#fff' : C.teal }]}
                  numberOfLines={1}
                >
                  {replyTo.senderName}
                </Text>
                <Text
                  style={[styles.replyText, { color: isMe ? 'rgba(255,255,255,0.85)' : C.sec }]}
                  numberOfLines={1}
                >
                  {replyTo.text}
                </Text>
              </TouchableOpacity>
            )}
            {attachments.length > 0 && (
              <View style={styles.attachments}>
                {attachments.map((a) =>
                  a.type === 'audio' ? (
                    <VoiceMessage key={a.id} uri={a.uri} duration={a.duration} isMe={isMe} />
                  ) : a.type === 'file' ? (
                    <TouchableOpacity
                      key={a.id}
                      style={styles.fileChip}
                      activeOpacity={0.7}
                      onPress={() => openFile(a)}
                    >
                      <Icon name="file-text" size={16} color={isMe ? '#fff' : C.ink} />
                      <Text
                        style={[styles.fileName, { color: isMe ? '#fff' : C.ink }]}
                        numberOfLines={1}
                      >
                        {a.name}
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      key={a.id}
                      style={styles.mediaWrap}
                      activeOpacity={0.85}
                      onPress={() => setViewerMedia({ type: a.type as 'image' | 'video', uri: a.uri })}
                    >
                      <Image source={{ uri: a.uri }} style={styles.mediaImage} />
                      {a.type === 'video' && (
                        <View style={styles.playOverlay}>
                          <Icon name="play-circle" size={26} color="#fff" />
                        </View>
                      )}
                    </TouchableOpacity>
                  ),
                )}
              </View>
            )}
            {message ? (
              <Text style={[styles.text, { fontFamily: F.regular, color: isMe ? '#fff' : C.ink }]}>
                {message}
              </Text>
            ) : null}
          </>
        )}
        </TouchableOpacity>
      </View>
      </Animated.View>
      <View style={styles.metaRow}>
        {starred && !deleted ? <Icon name="star" size={10} color={C.warn} /> : null}
        {edited && !deleted ? <Text style={styles.editedTag}>diedit</Text> : null}
        {timestamp ? <Text style={styles.time}>{timestamp}</Text> : null}
        {isMe && !deleted && status ? (
          <Icon
            name={status === 'sent' ? 'check' : 'checks'}
            size={13}
            color={status === 'read' ? '#34B7F1' : C.mut}
          />
        ) : null}
      </View>
      {viewerMedia && (
        <MediaViewerModal
          visible
          type={viewerMedia.type}
          uri={viewerMedia.uri}
          onClose={() => setViewerMedia(null)}
        />
      )}
      {viewerPdf && (
        <PdfViewerModal
          visible
          uri={viewerPdf.uri}
          name={viewerPdf.name}
          onClose={() => setViewerPdf(null)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginVertical: 4, maxWidth: '75%', position: 'relative' },
  replyIconWrap: {
    position: 'absolute',
    left: 0,
    top: '50%',
    marginTop: -14,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: C.teal100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wrapMe: { alignSelf: 'flex-end', alignItems: 'flex-end' },
  wrapOther: { alignSelf: 'flex-start', alignItems: 'flex-start' },
  bubbleStack: { position: 'relative' },
  pulseGlow: {
    position: 'absolute',
    top: -6,
    left: -6,
    right: -6,
    bottom: -6,
    borderRadius: 22,
    backgroundColor: C.amber100,
  },
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
  deletedRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  deletedText: { fontSize: 13, fontStyle: 'italic', fontFamily: F.regular },
  replyBlock: {
    borderLeftWidth: 3,
    paddingLeft: 8,
    marginBottom: 6,
  },
  replyName: { fontSize: 12, fontFamily: F.bold },
  replyText: { fontSize: 12.5, fontFamily: F.regular, marginTop: 1 },
  attachments: { gap: 6, marginBottom: 4 },
  mediaWrap: { borderRadius: 12, overflow: 'hidden', position: 'relative' },
  mediaImage: { width: 180, height: 130, backgroundColor: C.line },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  fileChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(0,0,0,0.08)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    maxWidth: 200,
  },
  fileName: { fontSize: 12.5, fontFamily: F.medium, flexShrink: 1 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3 },
  editedTag: { fontSize: 10, color: C.mut, fontStyle: 'italic' },
  time: { fontSize: 10, color: C.mut },
});
