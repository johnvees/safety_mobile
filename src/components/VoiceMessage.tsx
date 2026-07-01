import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import Icon from '@/components/Icon';
import { C } from '@/theme/colors';
import { F } from '@/theme/typography';

interface Props {
  uri: string;
  duration?: number;
  isMe: boolean;
}

function formatSeconds(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return `${m}:${rem.toString().padStart(2, '0')}`;
}

export default function VoiceMessage({ uri, duration = 0, isMe }: Props) {
  const player = useAudioPlayer(uri);
  const status = useAudioPlayerStatus(player);

  const totalSeconds = status.duration || duration;
  const currentSeconds = status.currentTime || 0;
  const progress = totalSeconds > 0 ? Math.min(1, currentSeconds / totalSeconds) : 0;

  function toggle() {
    if (status.playing) {
      player.pause();
    } else {
      if (status.currentTime >= totalSeconds && totalSeconds > 0) {
        player.seekTo(0);
      }
      player.play();
    }
  }

  const accent = isMe ? '#fff' : C.teal;
  const track = isMe ? 'rgba(255,255,255,0.35)' : C.line;

  return (
    <TouchableOpacity style={styles.wrap} onPress={toggle} activeOpacity={0.8}>
      <View style={[styles.playBtn, { backgroundColor: isMe ? 'rgba(255,255,255,0.2)' : C.teal100 }]}>
        <Icon name={status.playing ? 'pause-circle' : 'play-circle'} size={22} color={accent} />
      </View>
      <View style={styles.body}>
        <View style={[styles.track, { backgroundColor: track }]}>
          <View style={[styles.trackFill, { width: `${progress * 100}%`, backgroundColor: accent }]} />
        </View>
        <Text style={[styles.time, { color: isMe ? 'rgba(255,255,255,0.85)' : C.mut }]}>
          {formatSeconds(status.playing || currentSeconds > 0 ? currentSeconds : totalSeconds)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', gap: 8, minWidth: 160, paddingVertical: 2 },
  playBtn: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  body: { flex: 1, gap: 4 },
  track: { height: 4, borderRadius: 2, overflow: 'hidden' },
  trackFill: { height: 4, borderRadius: 2 },
  time: { fontSize: 10.5, fontFamily: F.medium },
});
