import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Care } from '@/constants/care-theme';

export function PlaceholderScreen({
  title,
  icon,
}: {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.body}>
        <Ionicons name={icon} size={48} color={Care.textMuted} />
        <Text style={styles.subtitle}>Coming soon</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Care.background, paddingHorizontal: 24 },
  title: { color: Care.text, fontSize: 28, fontWeight: '700', marginTop: 24 },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  subtitle: { color: Care.textSecondary, fontSize: 15 },
});
