import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Care } from '@/constants/care-theme';

export function ScreenHeader({
  title,
  subtitle,
  onBack,
}: {
  title: string;
  subtitle?: string;
  onBack: () => void;
}) {
  return (
    <View style={styles.header}>
      <Pressable onPress={onBack} hitSlop={12} accessibilityLabel="Back" style={styles.side}>
        <Ionicons name="arrow-back" size={24} color={Care.text} />
      </Pressable>
      <View style={styles.center}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      <View style={styles.side} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  side: { width: 32 },
  center: { flex: 1, alignItems: 'center' },
  title: { color: Care.text, fontSize: 17, fontWeight: '700' },
  subtitle: { color: Care.textSecondary, fontSize: 12, marginTop: 2 },
});
