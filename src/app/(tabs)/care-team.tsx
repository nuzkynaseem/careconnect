import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/avatar';
import { Care } from '@/constants/care-theme';
import { useInbox } from '@/context/inbox';

export default function CareTeamScreen() {
  const { careTeam, unread } = useInbox();
  const pendingInvites = unread.filter((item) => item.kind === 'invite').length;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.headerTitle}>Care Team</Text>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>My Caregivers</Text>
        <Text style={styles.subtitle}>Tap the call button to contact your care team member instantly.</Text>

        {pendingInvites > 0 && (
          <Pressable style={styles.pending} onPress={() => router.push('/inbox')}>
            <Ionicons name="mail-unread-outline" size={20} color={Care.primaryLight} />
            <Text style={styles.pendingText}>
              {pendingInvites} pending {pendingInvites === 1 ? 'invite' : 'invites'}
            </Text>
            <Ionicons name="chevron-forward" size={18} color={Care.textSecondary} />
          </Pressable>
        )}

        <View style={styles.grid}>
          {careTeam.map((member) => (
            <View key={member.id} style={styles.card}>
              <Avatar person={member} size={76} round ring showBadge />
              <Text style={styles.name} numberOfLines={1}>
                {member.cardName}
              </Text>
              <Text style={[styles.role, { color: member.roleColor }]} numberOfLines={1}>
                {member.role}
              </Text>
              <Pressable
                style={({ pressed }) => [styles.callButton, pressed && styles.pressed]}
                onPress={() => router.push({ pathname: '/call/[id]', params: { id: member.id } })}
                accessibilityLabel={`Call ${member.name}`}>
                <Ionicons name="call" size={16} color={Care.text} />
                <Text style={styles.callText}>Call</Text>
              </Pressable>
            </View>
          ))}

          <Pressable style={[styles.card, styles.addCard]} onPress={() => router.push('/profile/share')}>
            <View style={styles.addCircle}>
              <Ionicons name="add" size={30} color={Care.textMuted} />
            </View>
            <Text style={styles.addTitle}>Add New</Text>
            <Text style={styles.addSubtitle}>Caregiver</Text>
          </Pressable>
        </View>
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
  scroll: { paddingHorizontal: 16, paddingBottom: 32 },
  title: { color: Care.text, fontSize: 28, fontWeight: '800' },
  subtitle: { color: Care.textSecondary, fontSize: 14, lineHeight: 20, marginTop: 4 },

  pending: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 16,
    padding: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(47, 107, 255, 0.12)',
  },
  pendingText: { flex: 1, color: Care.text, fontSize: 15, fontWeight: '600' },

  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 14, marginTop: 18 },
  card: {
    width: '48%',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 12,
    borderRadius: 22,
    backgroundColor: '#1A2B40',
  },
  name: { color: Care.text, fontSize: 16, fontWeight: '800', marginTop: 12 },
  role: { fontSize: 12, fontWeight: '600', marginTop: 2 },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    alignSelf: 'stretch',
    marginTop: 12,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: Care.primary,
  },
  callText: { color: Care.text, fontSize: 15, fontWeight: '700' },

  addCard: { justifyContent: 'center', backgroundColor: Care.surface, minHeight: 200 },
  addCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: Care.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addTitle: { color: Care.textSecondary, fontSize: 16, fontWeight: '700', marginTop: 12 },
  addSubtitle: { color: Care.textMuted, fontSize: 12, marginTop: 2 },
});
