import React, { useRef, useState } from 'react';
import {
  Modal,
  View,
  Image,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Dimensions,
  ViewToken,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { VideoView, useVideoPlayer } from 'expo-video';
import Icon from '@/components/Icon';

export interface MediaViewerItem {
  type: 'image' | 'video';
  uri: string;
}

interface Props {
  visible: boolean;
  items: MediaViewerItem[];
  initialIndex: number;
  onClose: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

function VideoContent({ uri, active }: { uri: string; active: boolean }) {
  const player = useVideoPlayer(uri);

  React.useEffect(() => {
    if (active) {
      player.play();
    } else {
      player.pause();
    }
  }, [active, player]);

  return (
    <VideoView
      style={styles.video}
      player={player}
      nativeControls
      contentFit="contain"
      allowsFullscreen
    />
  );
}

export default function MediaViewerModal({ visible, items, initialIndex, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const listRef = useRef<FlatList<MediaViewerItem>>(null);

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0 && viewableItems[0].index != null) {
      setActiveIndex(viewableItems[0].index);
    }
  }).current;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      onShow={() => {
        setActiveIndex(initialIndex);
        listRef.current?.scrollToIndex({ index: initialIndex, animated: false });
      }}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={[styles.closeBtn, { top: insets.top + 12 }]}
          onPress={onClose}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Icon name="x" size={22} color="#fff" />
        </TouchableOpacity>
        {items.length > 1 && (
          <View style={[styles.counter, { top: insets.top + 20 }]}>
            <Text style={styles.counterText}>{activeIndex + 1}/{items.length}</Text>
          </View>
        )}
        <FlatList
          ref={listRef}
          data={items}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item, i) => `${item.uri}-${i}`}
          initialScrollIndex={initialIndex}
          getItemLayout={(_, index) => ({ length: SCREEN_WIDTH, offset: SCREEN_WIDTH * index, index })}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={{ itemVisiblePercentThreshold: 60 }}
          renderItem={({ item, index }) => (
            <View style={styles.page}>
              {item.type === 'image' ? (
                <Image source={{ uri: item.uri }} style={styles.image} resizeMode="contain" />
              ) : (
                <VideoContent uri={item.uri} active={index === activeIndex} />
              )}
            </View>
          )}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.92)', alignItems: 'center', justifyContent: 'center' },
  closeBtn: {
    position: 'absolute',
    right: 18,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  counter: {
    position: 'absolute',
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    zIndex: 1,
  },
  counterText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  page: { width: SCREEN_WIDTH, alignItems: 'center', justifyContent: 'center' },
  image: { width: '100%', height: '80%' },
  video: { width: '100%', height: '80%' },
});
