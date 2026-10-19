import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/avatar';
import { Care } from '@/constants/care-theme';
import { people, primaryContactId, type PersonId } from '@/data/people';

/** Seconds of "ringing" before the call shows as connected. */
const RING_SECONDS = 3;

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function CallScreen() {
  const { id, emergency } = useLocalSearchParams<{ id: string; emergency?: string }>();
  const person = people[id as PersonId];
  const isEmergency = emergency === '1';

  const [elapsed, setElapsed] = useState(0);
  const [speaker, setSpeaker] = useState(true);
  const [video, setVideo] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const endCall = () => (router.canGoBack() ? router.back() : router.replace('/'));

  if (!person) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.missing}>This contact could not be found.</Text>
      </SafeAreaView>
    );
  }

  const connected = elapsed >= RING_SECONDS;
  const role = person.id === primaryContactId ? 'Primary Caregiver' : person.role;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.back} onPress={endCall} accessibilityLabel="Back">
          <Ionicons name="chevron-back" size={24} color={Care.text} />
        </Pressable>
        <Text style={styles.headerTitle}>{isEmergency ? 'Emergency Call' : 'Call'}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.body}>
        <Avatar person={person} size={150} round ring showBadge />

        <Text style={styles.name}>
          {connected ? person.name : `Calling ${person.shortName}...`}
        </Text>
        <View style={styles.roleChip}>
          <Text style={styles.roleText}>{role}</Text>
        </View>
        <Text style={styles.timer}>
          {connected ? formatDuration(elapsed - RING_SECONDS) : 'Ringing'}
        </Text>
        <Text style={styles.demo}>Demo call — no real call is placed</Text>

        {isEmergency && (
          <View style={styles.locationPill}>
            <View style={styles.locationIcon}>
              <MaterialCommunityIcons name="crosshairs-gps" size={18} color={Care.primaryLight} />
            </View>
            <Text style={styles.locationText}>Location sent to caregiver</Text>
          </View>
        )}

        <View style={styles.controls}>
          <ControlButton
            icon="volume-high"
            label="Speaker"
            active={speaker}
            onPress={() => setSpeaker((v) => !v)}
          />
          <ControlButton
            icon="video"
            label="Video"
            active={video}
            onPress={() => setVideo((v) => !v)}
          />
        </View>
      </View>

      <Pressable
        style={({ pressed }) => [styles.endButton, pressed && { opacity: 0.85 }]}
        onPress={endCall}>
        <View style={styles.endIcon}>
          <MaterialCommunityIcons name="phone-hangup" size={22} color="#FF5A52" />
        </View>
        <Text style={styles.endText}>END CALL</Text>
      </Pressable>
    </SafeAreaView>
  );
}

function ControlButton({
  icon,
  label,
  active,
  onPress,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[styles.control, active && styles.controlActive]}
      onPress={onPress}
      accessibilityRole="switch"
      accessibilityState={{ checked: active }}>
      <View style={[styles.controlIcon, active && styles.controlIconActive]}>
        <MaterialCommunityIcons
          name={icon}
          size={22}
          color={active ? Care.primaryLight : Care.textSecondary}
        />
      </View>
      <Text style={styles.controlLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Care.background },
  missing: { color: Care.textSecondary, textAlign: 'center', marginTop: 48 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  back: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Care.surface,
  },
  headerSpacer: { width: 40 },
  headerTitle: { flex: 1, textAlign: 'center', color: Care.text, fontSize: 17, fontWeight: '700' },

  body: { flex: 1, alignItems: 'center', paddingHorizontal: 20, paddingTop: 20 },
  name: { color: Care.text, fontSize: 28, fontWeight: '800', marginTop: 22 },
  roleChip: {
    marginTop: 8,
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(47, 107, 255, 0.16)',
  },
  roleText: { color: Care.primaryLight, fontSize: 14, fontWeight: '700' },
  timer: {
    color: Care.textSecondary,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 2,
    marginTop: 10,
    fontVariant: ['tabular-nums'],
  },
  demo: { color: Care.textMuted, fontSize: 11, marginTop: 4 },

  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 22,
    alignSelf: 'stretch',
    padding: 10,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: Care.border,
    backgroundColor: Care.surfaceMuted,
  },
  locationIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(47, 107, 255, 0.16)',
  },
  locationText: { color: Care.text, fontSize: 14, fontWeight: '500' },

  controls: { flexDirection: 'row', gap: 16, marginTop: 24, alignSelf: 'stretch' },
  control: {
    flex: 1,
    alignItems: 'center',
    gap: 10,
    paddingVertical: 18,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Care.border,
    backgroundColor: Care.surface,
  },
  controlActive: { borderColor: Care.primary, backgroundColor: 'rgba(47, 107, 255, 0.12)' },
  controlIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2A3242',
  },
  controlIconActive: { backgroundColor: 'rgba(47, 107, 255, 0.22)' },
  controlLabel: { color: Care.text, fontSize: 15, fontWeight: '700' },

  endButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginHorizontal: 18,
    marginBottom: 16,
    paddingVertical: 18,
    borderRadius: 36,
    backgroundColor: '#E53935',
    shadowColor: '#E53935',
    shadowOpacity: 0.5,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  endIcon: {
    width: 44,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.92)',
  },
  endText: { color: Care.text, fontSize: 20, fontWeight: '800', letterSpacing: 1 },
});
