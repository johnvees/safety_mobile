import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import Icon from '@/components/Icon';
import { C } from '@/theme/colors';
import { F } from '@/theme/typography';
import WaveformBars, { generateLevels } from '@/components/WaveformBars';

const BAR_COUNT = 28;

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
  const levels = useMemo(() => generateLevels(uri, BAR_COUNT), [uri]);

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

  function seek(ratio: number) {
    if (totalSeconds > 0) {
      player.seekTo(ratio * totalSeconds);
    }
  }

  const accent = isMe ? '#fff' : C.teal;
  const track = isMe ? 'rgba(255,255,255,0.35)' : C.line;

  return (
    <View style={styles.wrap}>
      <TouchableOpacity
        style={[styles.playBtn, { backgroundColor: isMe ? 'rgba(255,255,255,0.2)' : C.teal100 }]}
        onPress={toggle}
        activeOpacity={0.8}
      >
        <Icon name={status.playing ? 'pause-circle' : 'play-circle'} size={24} color={accent} />
      </TouchableOpacity>
      <View style={styles.body}>
        <WaveformBars
          levels={levels}
          progress={progress}
          activeColor={accent}
          mutedColor={track}
          height={26}
          onSeek={seek}
        />
        <Text style={[styles.time, { color: isMe ? 'rgba(255,255,255,0.85)' : C.mut }]}>
          {formatSeconds(status.playing || currentSeconds > 0 ? currentSeconds : totalSeconds)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', gap: 10, minWidth: 210, paddingHorizontal: 2 },
  playBtn: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  body: { flex: 1, gap: 6, justifyContent: 'center' },
  time: { fontSize: 10.5, fontFamily: F.medium },
});
