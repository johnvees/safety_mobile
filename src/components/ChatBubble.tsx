import React, { useRef, useState, useEffect } from 'react';
import { Animated, View, Text, Image, StyleSheet, TouchableOpacity, PanResponder, Platform } from 'react-native';
import * as Sharing from 'expo-sharing';
import * as IntentLauncher from 'expo-intent-launcher';
import { File } from 'expo-file-system';
import * as Haptics from 'expo-haptics';
import Icon from '@/components/Icon';
import { C } from '@/theme/colors';
import { F } from '@/theme/typography';
import { ChatAttachment, ChatReplyRef } from '@/data/chatData';
import VoiceMessage from '@/components/VoiceMessage';
import MediaViewerModal from '@/components/MediaViewerModal';

const GRID_MAX = 4;

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
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!pulse) return;
    Animated.sequence([
      Animated.timing(pulseAnim, { toValue: 1, duration: 250, useNativeDriver: false }),
      Animated.timing(pulseAnim, { toValue: 0, duration: 650, useNativeDriver: false }),
    ]).start();
  }, [pulse]);

  const pulseOpacity = pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.55] });

  const mediaAttachments = attachments.filter((a) => a.type === 'image' || a.type === 'video');
  const otherAttachments = attachments.filter((a) => a.type === 'file' || a.type === 'audio');
  const isMediaGrouped = mediaAttachments.length >= 4;

  async function openFile(a: ChatAttachment) {
    if (Platform.OS === 'android') {
      try {
        const contentUri = new File(a.uri).contentUri;
        await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
          data: contentUri,
          flags: 1, // FLAG_GRANT_READ_URI_PERMISSION
          type: a.mimeType || '*/*',
        });
        return;
      } catch {
        // no app registered for this mime type — fall through to share sheet
      }
    }
    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
      Sharing.shareAsync(a.uri, a.mimeType ? { mimeType: a.mimeType, UTI: a.mimeType } : undefined);
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
                {isMediaGrouped ? (
                  <View style={styles.mediaGrid}>
                    {mediaAttachments.slice(0, GRID_MAX).map((a, i) => {
                      const remaining = mediaAttachments.length - GRID_MAX;
                      const showMoreOverlay = i === GRID_MAX - 1 && remaining > 0;
                      return (
                        <TouchableOpacity
                          key={a.id}
                          style={styles.mediaGridItem}
                          activeOpacity={0.85}
                          onPress={() => setViewerIndex(i)}
                        >
                          <Image source={{ uri: a.uri }} style={styles.mediaGridImage} />
                          {a.type === 'video' && !showMoreOverlay && (
                            <View style={styles.playOverlay}>
                              <Icon name="play-circle" size={20} color="#fff" />
                            </View>
                          )}
                          {showMoreOverlay && (
                            <View style={styles.moreOverlay}>
                              <Text style={styles.moreOverlayText}>+{remaining}</Text>
                            </View>
                          )}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                ) : (
                  mediaAttachments.map((a, i) => (
                    <TouchableOpacity
                      key={a.id}
                      style={styles.mediaWrap}
                      activeOpacity={0.85}
                      onPress={() => setViewerIndex(i)}
                    >
                      <Image source={{ uri: a.uri }} style={styles.mediaImage} />
                      {a.type === 'video' && (
                        <View style={styles.playOverlay}>
                          <Icon name="play-circle" size={26} color="#fff" />
                        </View>
                      )}
                    </TouchableOpacity>
                  ))
                )}
                {otherAttachments.map((a) =>
                  a.type === 'audio' ? (
                    <VoiceMessage key={a.id} uri={a.uri} duration={a.duration} isMe={isMe} />
                  ) : (
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
      {viewerIndex !== null && (
        <MediaViewerModal
          visible
          items={mediaAttachments.map((a) => ({ type: a.type as 'image' | 'video', uri: a.uri }))}
          initialIndex={viewerIndex}
          onClose={() => setViewerIndex(null)}
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
  mediaGrid: { flexDirection: 'row', flexWrap: 'wrap', width: 184, gap: 4 },
  mediaGridItem: { width: 88, height: 88, borderRadius: 10, overflow: 'hidden', position: 'relative' },
  mediaGridImage: { width: '100%', height: '100%', backgroundColor: C.line },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  moreOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  moreOverlayText: { color: '#fff', fontSize: 20, fontFamily: F.extraBold },
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
