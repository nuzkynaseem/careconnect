import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/avatar';
import { Care } from '@/constants/care-theme';
import { useInbox } from '@/context/inbox';
import { useSettings } from '@/context/settings';
import { patient } from '@/data/people';
import { shareProfileLink } from '@/utils/share-profile';

export default function ProfileScreen() {
  const { careTeam } = useInbox();
  const { sosEnabled, setSosEnabled } = useSettings();

  const logOut = () => {
    const message = 'Accounts are not set up in this version of Care Connect yet.';
    if (Platform.OS === 'web') window.alert(message);
    else Alert.alert('Log Out', message);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.headerTitle}>My Profile</Text>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.identity}>
          <View>
            <Avatar person={patient} size={96} round ring />
            <View style={styles.onlineDot} />
          </View>
          <Text style={styles.name}>{patient.name}</Text>
          <Text style={styles.age}>{patient.age} Years Old</Text>
          <View style={styles.idChip}>
            <MaterialCommunityIcons name="card-account-details-outline" size={14} color={Care.primaryLight} />
            <Text style={styles.idText}>ID: #{patient.careId}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>My Caregivers</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.caregivers}>
          {careTeam.map((member) => (
            <Pressable
              key={member.id}
              style={styles.caregiver}
              onPress={() => router.push({ pathname: '/call/[id]', params: { id: member.id } })}>
              <Avatar person={member} size={56} round />
              <Text style={styles.caregiverName} numberOfLines={1}>
                {member.shortName}
              </Text>
              <Text style={styles.caregiverRole} numberOfLines={1}>
                {member.relation}
              </Text>
            </Pressable>
          ))}
          <Pressable style={styles.caregiver} onPress={() => router.push('/profile/share')}>
            <View style={styles.addCircle}>
              <Ionicons name="add" size={26} color={Care.textSecondary} />
            </View>
            <Text style={styles.caregiverName}>Add</Text>
            <Text style={styles.caregiverRole}>Contact</Text>
          </Pressable>
        </ScrollView>

        <View style={styles.idCard}>
          <View style={styles.idCardHeader}>
            <View>
              <Text style={styles.idCardTitle}>My Care Connect ID</Text>
              <Text style={styles.idCardSubtitle}>Scan to view medical info</Text>
            </View>
            <Pressable onPress={() => router.push('/profile/share')} accessibilityLabel="Show QR code">
              <MaterialCommunityIcons name="qrcode-scan" size={24} color={Care.primaryLight} />
            </Pressable>
          </View>

          <Pressable style={styles.qrBox} onPress={() => router.push('/profile/share')}>
            <QRCode value={patient.profileUrl} size={150} color="#111827" backgroundColor="#FFFFFF" />
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.shareButton, pressed && styles.pressed]}
            onPress={shareProfileLink}>
            <Ionicons name="share-social-outline" size={18} color={Care.text} />
            <Text style={styles.shareText}>Share My ID Link</Text>
          </Pressable>
        </View>

        <View style={styles.sosRow}>
          <View style={styles.sosIcon}>
            <MaterialCommunityIcons name="alarm-light-outline" size={20} color="#FF5A52" />
          </View>
          <Pressable style={styles.sosText} onPress={() => router.push('/emergency')}>
            <Text style={styles.sosTitle}>Emergency SOS</Text>
            <Text style={styles.sosSubtitle}>
              {sosEnabled ? 'Emergency button shown on Home' : 'Emergency button hidden'}
            </Text>
          </Pressable>
          <Switch
            value={sosEnabled}
            onValueChange={setSosEnabled}
            trackColor={{ false: '#3A4558', true: '#E53935' }}
            thumbColor="#FFFFFF"
            accessibilityLabel="Show emergency button on Home"
          />
        </View>

        <Pressable style={({ pressed }) => [styles.logOut, pressed && styles.pressed]} onPress={logOut}>
          <Ionicons name="log-out-outline" size={20} color={Care.text} />
          <Text style={styles.logOutText}>Log Out</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Care.background },
  pressed: { opacity: 0.85 },
  headerTitle: {
    color: Care.text,
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
    paddingVertical: 14,
  },
  scroll: { paddingHorizontal: 18, paddingBottom: 32 },

  identity: { alignItems: 'center' },
  onlineDot: {
    position: 'absolute',
    right: 6,
    bottom: 6,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#22C55E',
    borderWidth: 3,
    borderColor: Care.background,
  },
  name: { color: Care.text, fontSize: 28, fontWeight: '800', marginTop: 12 },
  age: { color: Care.textSecondary, fontSize: 16, marginTop: 2 },
  idChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(47, 107, 255, 0.16)',
  },
  idText: { color: Care.primaryLight, fontSize: 12, fontWeight: '700' },

  sectionTitle: { color: Care.text, fontSize: 22, fontWeight: '800', marginTop: 28 },
  caregivers: { gap: 8, paddingVertical: 14 },
  caregiver: { alignItems: 'center', width: 84 },
  caregiverName: { color: Care.text, fontSize: 12, fontWeight: '600', marginTop: 8 },
  caregiverRole: { color: Care.textSecondary, fontSize: 12 },
  addCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: Care.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },

  idCard: { backgroundColor: Care.surface, borderRadius: 28, padding: 20, marginTop: 8 },
  idCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  idCardTitle: { color: Care.text, fontSize: 18, fontWeight: '800' },
  idCardSubtitle: { color: Care.textSecondary, fontSize: 13, marginTop: 2 },
  qrBox: {
    alignSelf: 'center',
    padding: 18,
    marginVertical: 18,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 24,
    backgroundColor: Care.primary,
  },
  shareText: { color: Care.text, fontSize: 16, fontWeight: '700' },

  sosRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 18,
    padding: 14,
    borderRadius: 18,
    backgroundColor: 'rgba(229,57,53,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(229,57,53,0.25)',
  },
  sosIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(229,57,53,0.2)',
  },
  sosText: { flex: 1 },
  sosTitle: { color: Care.text, fontSize: 15, fontWeight: '700' },
  sosSubtitle: { color: Care.textSecondary, fontSize: 12, marginTop: 2 },

  logOut: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 14,
    paddingVertical: 16,
    borderRadius: 18,
    backgroundColor: Care.surface,
  },
  logOutText: { color: Care.text, fontSize: 16, fontWeight: '600' },
});
