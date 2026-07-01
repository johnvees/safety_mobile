import React, { useEffect, useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { File, Paths } from 'expo-file-system';
import Icon from '@/components/Icon';
import { C } from '@/theme/colors';
import { F } from '@/theme/typography';

interface Props {
  visible: boolean;
  uri: string;
  name: string;
  onClose: () => void;
}

export default function PdfViewerModal({ visible, uri, name, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const [localUri, setLocalUri] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setLocalUri(null);
    setError(false);
    try {
      // Android content:// URIs (from the document picker) can't be loaded
      // directly by WebView — copy into the app's cache dir as a real file first.
      const source = new File(uri);
      const dest = new File(Paths.cache, `pdf-${Date.now()}-${name}`);
      source.copy(dest);
      setLocalUri(dest.uri);
    } catch {
      setError(true);
    }
  }, [visible, uri, name]);

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Icon name="x" size={22} color={C.ink} />
          </TouchableOpacity>
          <Text style={styles.title} numberOfLines={1}>{name}</Text>
          <View style={styles.closeBtn} />
        </View>
        {error ? (
          <View style={styles.center}>
            <Icon name="alert-triangle" size={32} color={C.mut} />
            <Text style={styles.errorText}>Gagal membuka PDF ini.</Text>
          </View>
        ) : localUri ? (
          <WebView source={{ uri: localUri }} style={styles.webview} originWhitelist={['*']} />
        ) : (
          <View style={styles.center}>
            <ActivityIndicator color={C.teal} />
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.line,
    backgroundColor: C.white,
  },
  closeBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  title: { flex: 1, textAlign: 'center', fontSize: 15, fontFamily: F.bold, color: C.ink },
  webview: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  errorText: { fontSize: 13.5, color: C.mut, fontFamily: F.medium },
});
