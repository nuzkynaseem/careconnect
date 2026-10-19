import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/avatar';
import { ScreenHeader } from '@/components/screen-header';
import { SlideToConfirm } from '@/components/slide-to-confirm';
import { Care } from '@/constants/care-theme';
import { useInbox } from '@/context/inbox';
import type { AccessLevel } from '@/data/inbox';

export default function InvitationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { items, resolutions, acceptInvite, resolve } = useInbox();
  const [access, setAccess] = useState<AccessLevel>('view');

  const invite = items.find((item) => item.id === id);
  const close = () => (router.canGoBack() ? router.back() : router.replace('/inbox'));

  if (invite?.kind !== 'invite') {
    return (
      <SafeAreaView style={styles.container}>
        <ScreenHeader title="Invitation Detail" onBack={close} />
        <Text style={styles.missing}>This invitation could not be found.</Text>
      </SafeAreaView>
    );
  }

  const { from } = invite;
  const resolution = resolutions[invite.id];

  const options: { value: AccessLevel; title: string; description: string }[] = [
    {
      value: 'view',
      title: 'View Only',
      description: `${from.shortName} can see your medication list but cannot change anything.`,
    },
    {
      value: 'edit',
      title: 'Can Edit',
      description: `${from.shortName} can add or remove medications and change schedules.`,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title="Invitation Detail" onBack={close} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.profile}>
          <View style={styles.avatarRing}>
            <Avatar person={from} size={112} round />
          </View>
          <Text style={styles.name}>{from.name}</Text>
          <View style={styles.relationChip}>
            <Text style={styles.relationText}>{from.relation}</Text>
          </View>
          <Text style={styles.message}>{invite.message}</Text>
        </View>

        <Text style={styles.sectionTitle}>Access Level</Text>
        <View style={styles.options} accessibilityRole="radiogroup">
          {options.map((option) => {
            const selected = access === option.value;
            return (
              <Pressable
                key={option.value}
                style={[styles.option, selected && styles.optionSelected]}
                onPress={() => setAccess(option.value)}
                disabled={!!resolution}
                accessibilityRole="radio"
                accessibilityState={{ checked: selected }}>
                <View style={[styles.radio, selected && styles.radioSelected]}>
                  {selected && <View style={styles.radioDot} />}
                </View>
                <View style={styles.optionText}>
                  <Text style={styles.optionTitle}>{option.title}</Text>
                  <Text style={styles.optionDescription}>{option.description}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        {resolution ? (
          <Text style={styles.resolved}>
            You {resolution === 'accepted' ? 'accepted' : 'declined'} this invitation.
          </Text>
        ) : (
          <>
            <SlideToConfirm
              label="SLIDE TO AGREE"
              onConfirm={() => {
                acceptInvite(invite.id, access);
                close();
              }}
            />
            <Pressable
              hitSlop={12}
              style={styles.decline}
              onPress={() => {
                resolve(invite.id, 'declined');
                close();
              }}>
              <Text style={styles.declineText}>Decline Invitation</Text>
            </Pressable>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Care.background },
  missing: { color: Care.textSecondary, textAlign: 'center', marginTop: 48 },
  scroll: { paddingHorizontal: 20, paddingBottom: 16 },

  profile: { alignItems: 'center', marginTop: 8 },
  avatarRing: {
    padding: 4,
    borderRadius: 999,
    borderWidth: 3,
    borderColor: Care.primary,
  },
  name: { color: Care.text, fontSize: 28, fontWeight: '800', marginTop: 16 },
  relationChip: {
    marginTop: 6,
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: 10,
    backgroundColor: 'rgba(47, 107, 255, 0.16)',
  },
  relationText: { color: Care.primaryLight, fontSize: 13, fontWeight: '700' },
  message: {
    color: Care.textSecondary,
    fontSize: 17,
    lineHeight: 24,
    textAlign: 'center',
    marginTop: 14,
    paddingHorizontal: 24,
  },

  sectionTitle: { color: Care.text, fontSize: 17, fontWeight: '700', marginTop: 28 },
  options: { gap: 12, marginTop: 12 },
  option: {
    flexDirection: 'row',
    gap: 14,
    padding: 18,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: Care.border,
  },
  optionSelected: { borderColor: Care.primary, backgroundColor: 'rgba(47, 107, 255, 0.10)' },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Care.textSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  radioSelected: { borderColor: Care.primary, backgroundColor: Care.primary },
  radioDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Care.text },
  optionText: { flex: 1 },
  optionTitle: { color: Care.text, fontSize: 16, fontWeight: '700' },
  optionDescription: { color: Care.textSecondary, fontSize: 13, lineHeight: 19, marginTop: 4 },

  footer: { paddingHorizontal: 20, paddingBottom: 12, paddingTop: 8, gap: 14 },
  decline: { alignSelf: 'center' },
  declineText: { color: Care.textSecondary, fontSize: 13 },
  resolved: { color: Care.textSecondary, textAlign: 'center', fontSize: 14, paddingVertical: 16 },
});
