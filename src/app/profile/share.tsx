import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/avatar';
import { ScreenHeader } from '@/components/screen-header';
import { Care } from '@/constants/care-theme';
import { patient } from '@/data/people';
import { shareProfileLink, textProfileId } from '@/utils/share-profile';

export default function ShareProfileScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader
        title="Share My Profile"
        onBack={() => (router.canGoBack() ? router.back() : router.replace('/profile'))}
      />

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.card}>
          <View style={styles.cardTop}>
            <Avatar person={patient} size={72} round ring />
            <Text style={styles.name}>{patient.name}</Text>
            <Text style={styles.careId}>ID: {patient.careId}-CARE</Text>
          </View>

          <View style={styles.qrFrame}>
            <View style={styles.qrInner}>
              <QRCode value={patient.profileUrl} size={170} color="#111827" backgroundColor="#FFFFFF" />
            </View>
          </View>

          <Text style={styles.hint}>
            Scan this code to instantly share medical history and medication schedule.
          </Text>
        </View>

        <Pressable
          style={({ pressed }) => [styles.primary, pressed && styles.pressed]}
          onPress={shareProfileLink}>
          <MaterialCommunityIcons name="qrcode-scan" size={20} color={Care.text} />
          <Text style={styles.primaryText}>Share QR to Caregiver</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.secondary, pressed && styles.pressed]}
          onPress={textProfileId}>
          <Ionicons name="chatbox-ellipses-outline" size={20} color={Care.text} />
          <Text style={styles.primaryText}>Send my ID as Text</Text>
        </Pressable>

        <Text style={styles.footnote}>Only people you share this with can view your profile.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Care.background },
  pressed: { opacity: 0.85 },
  scroll: { paddingHorizontal: 18, paddingBottom: 32 },

  card: { borderRadius: 24, overflow: 'hidden', backgroundColor: Care.surface, marginTop: 8 },
  cardTop: { alignItems: 'center', paddingVertical: 20, backgroundColor: '#17324A' },
  name: { color: Care.text, fontSize: 22, fontWeight: '800', marginTop: 10 },
  careId: { color: Care.text, fontSize: 12, fontWeight: '600', letterSpacing: 0.5, marginTop: 2 },

  qrFrame: {
    alignSelf: 'center',
    marginTop: 22,
    padding: 10,
    borderRadius: 26,
    backgroundColor: '#FFFFFF',
  },
  qrInner: { padding: 18, borderRadius: 18, backgroundColor: '#5B6670' },
  hint: {
    color: Care.text,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    paddingHorizontal: 28,
    paddingVertical: 18,
  },

  primary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 28,
    paddingVertical: 16,
    borderRadius: 28,
    backgroundColor: Care.primary,
  },
  secondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 14,
    paddingVertical: 16,
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: '#4A5568',
  },
  primaryText: { color: Care.text, fontSize: 16, fontWeight: '700' },
  footnote: { color: Care.textMuted, fontSize: 12, textAlign: 'center', marginTop: 28 },
});
