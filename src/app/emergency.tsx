import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Alert, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/screen-header';
import { Care } from '@/constants/care-theme';
import { useCurrentAddress } from '@/hooks/use-current-address';
import { people, primaryContactId } from '@/data/people';

const EMERGENCY_NUMBER = '911';

function confirm(title: string, message: string, onConfirm: () => void) {
  if (Platform.OS === 'web') {
    if (window.confirm(`${title}\n\n${message}`)) onConfirm();
    return;
  }
  Alert.alert(title, message, [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Call', style: 'destructive', onPress: onConfirm },
  ]);
}

export default function EmergencyScreen() {
  const contact = people[primaryContactId];
  const address = useCurrentAddress();

  const call911 = () =>
    confirm('Call 911?', 'This will open your phone to call emergency services.', () =>
      Linking.openURL(`tel:${EMERGENCY_NUMBER}`).catch(() =>
        Alert.alert('Unable to call', `Please dial ${EMERGENCY_NUMBER} from your phone.`),
      ),
    );

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title="Emergency Assistance" onBack={() => router.back()} />

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Who do you want to call?</Text>
        <Text style={styles.subtitle}>Select an option below for immediate help.</Text>

        <View style={styles.card}>
          <View style={[styles.iconHalo, { borderColor: 'rgba(47,107,255,0.25)' }]}>
            <View style={[styles.iconCircle, { backgroundColor: 'rgba(47,107,255,0.22)' }]}>
              <Ionicons name="person-add" size={34} color={Care.primary} />
            </View>
          </View>
          <Text style={styles.cardTitle}>Call Caregiver ({contact.shortName})</Text>
          <Text style={styles.cardSubtitle}>Primary Contact</Text>
          <Pressable
            style={({ pressed }) => [styles.button, styles.callButton, pressed && styles.pressed]}
            onPress={() =>
              router.push({ pathname: '/call/[id]', params: { id: contact.id, emergency: '1' } })
            }>
            <Ionicons name="call" size={18} color={Care.text} />
            <Text style={styles.buttonText}>Call {contact.shortName}</Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <View style={[styles.iconHalo, { borderColor: 'rgba(229,57,53,0.3)' }]}>
            <View style={[styles.iconCircle, { backgroundColor: 'rgba(229,57,53,0.28)' }]}>
              <MaterialCommunityIcons name="shield-star" size={36} color="#FF5A52" />
            </View>
          </View>
          <Text style={styles.cardTitle}>Call {EMERGENCY_NUMBER}</Text>
          <Text style={styles.cardSubtitle}>Emergency Services</Text>
          <Pressable
            style={({ pressed }) => [styles.button, styles.sosButton, pressed && styles.pressed]}
            onPress={call911}>
            <Text style={styles.sosTag}>SOS</Text>
            <Text style={styles.buttonText}>Call {EMERGENCY_NUMBER}</Text>
          </Pressable>
        </View>

        <View style={styles.location}>
          <Ionicons name="location-outline" size={20} color={Care.textSecondary} />
          <View style={styles.locationText}>
            <Text style={styles.locationTitle}>
              {address.source === 'device' ? 'Your Current Location' : 'Your Home Address'}
            </Text>
            <Text style={styles.locationAddress}>{address.text}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Care.background },
  pressed: { opacity: 0.85 },
  scroll: { paddingHorizontal: 18, paddingBottom: 24 },

  title: {
    color: Care.text,
    fontSize: 30,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 36,
  },
  subtitle: { color: Care.textSecondary, fontSize: 14, textAlign: 'center', marginTop: 8 },

  card: {
    backgroundColor: Care.surface,
    borderRadius: 24,
    alignItems: 'center',
    paddingVertical: 26,
    paddingHorizontal: 20,
    marginTop: 22,
  },
  iconHalo: { padding: 6, borderRadius: 999, borderWidth: 1 },
  iconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: { color: Care.text, fontSize: 21, fontWeight: '800', marginTop: 18 },
  cardSubtitle: { color: Care.textSecondary, fontSize: 15, marginTop: 8 },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 20,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 24,
  },
  callButton: { backgroundColor: Care.primary },
  sosButton: { backgroundColor: '#EF4B4B' },
  buttonText: { color: Care.text, fontSize: 16, fontWeight: '700' },
  sosTag: { color: Care.text, fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },

  location: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 22,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Care.border,
    backgroundColor: Care.surfaceMuted,
  },
  locationText: { flex: 1 },
  locationTitle: { color: Care.text, fontSize: 14, fontWeight: '700' },
  locationAddress: { color: Care.textSecondary, fontSize: 13, marginTop: 2 },
});
