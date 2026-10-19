import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import * as Speech from 'expo-speech';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/screen-header';
import { Care } from '@/constants/care-theme';
import { useDoseStatus } from '@/context/dose-status';
import { routines, type Medication } from '@/data/medications';

const SNOOZE_MINUTES = 10;

export default function RoutineDoseScreen() {
  const { id, med } = useLocalSearchParams<{ id: string; med?: string }>();
  const { statuses, markTaken, skip, snooze } = useDoseStatus();
  const routine = routines.find((r) => r.id === id);

  // Opening a single medication shows just that one; "Start Routine" walks every
  // dose that hasn't been taken or skipped yet. The queue is fixed on open so it
  // doesn't shift as statuses change.
  const [queue] = useState<Medication[]>(() => {
    if (!routine) return [];
    if (med) return routine.medications.filter((m) => m.id === med);
    const pending = routine.medications.filter(
      (m) => statuses[m.id]?.kind !== 'taken' && statuses[m.id]?.kind !== 'skipped',
    );
    return pending.length > 0 ? pending : routine.medications;
  });
  const [index, setIndex] = useState(0);
  const [speaking, setSpeaking] = useState(false);

  const current = queue[index];

  useEffect(() => () => void Speech.stop(), []);

  const instructions = useMemo(() => {
    if (!current || !routine) return '';
    const timing = current.instructions ? `, ${current.instructions.toLowerCase()}` : '';
    return `${current.name} ${current.dose}. Due at ${routine.dueAt}${timing}. ${current.description}`;
  }, [current, routine]);

  if (!routine || !current) {
    return (
      <SafeAreaView style={styles.container}>
        <ScreenHeader title="Medication" onBack={() => router.back()} />
        <Text style={styles.missing}>This medication could not be found.</Text>
      </SafeAreaView>
    );
  }

  const advance = () => {
    Speech.stop();
    setSpeaking(false);
    if (index + 1 < queue.length) setIndex(index + 1);
    else router.back();
  };

  const listen = () => {
    if (speaking) {
      Speech.stop();
      setSpeaking(false);
      return;
    }
    setSpeaking(true);
    Speech.speak(instructions, {
      rate: 0.9,
      onDone: () => setSpeaking(false),
      onStopped: () => setSpeaking(false),
      onError: () => setSpeaking(false),
    });
  };

  const title = `${routine.id.charAt(0).toUpperCase()}${routine.id.slice(1)} Meds`;
  const timing = [routine.dueAt, current.instructions].filter(Boolean).join(' • ').toUpperCase();

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader
        title={title}
        subtitle={queue.length > 1 ? `${index + 1} of ${queue.length}` : undefined}
        onBack={() => router.back()}
      />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <PillArt icon={current.icon} />

        <Text style={styles.name}>
          {current.name} {current.dose}
        </Text>

        <View style={styles.timeChip}>
          <Ionicons name="time-outline" size={14} color={Care.primaryLight} />
          <Text style={styles.timeChipText}>{timing}</Text>
        </View>

        <Text style={styles.description}>{current.description}</Text>

        <Pressable
          style={({ pressed }) => [styles.listenButton, pressed && styles.pressed]}
          onPress={listen}
          accessibilityRole="button">
          <MaterialCommunityIcons
            name={speaking ? 'stop-circle-outline' : 'volume-high'}
            size={20}
            color={Care.primaryLight}
          />
          <Text style={styles.listenText}>{speaking ? 'Stop' : 'Listen to Instructions'}</Text>
        </Pressable>
      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.question}>Did you take this pill?</Text>

        <Pressable
          style={({ pressed }) => [styles.takenButton, pressed && styles.pressed]}
          onPress={() => {
            markTaken(current.id);
            advance();
          }}>
          <Ionicons name="checkmark-circle-outline" size={24} color={Care.text} />
          <Text style={styles.takenText}>YES, TAKEN</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.snoozeButton, pressed && styles.pressed]}
          onPress={() => {
            snooze(current.id, SNOOZE_MINUTES);
            advance();
          }}>
          <MaterialCommunityIcons name="alarm-snooze" size={22} color={Care.text} />
          <Text style={styles.snoozeText}>SNOOZE {SNOOZE_MINUTES} MIN</Text>
        </Pressable>

        <Pressable
          style={styles.skipButton}
          hitSlop={12}
          onPress={() => {
            skip(current.id);
            advance();
          }}>
          <Text style={styles.skipText}>Skip this dose</Text>
          <Ionicons name="chevron-forward" size={14} color={Care.textSecondary} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function PillArt({ icon }: { icon: Medication['icon'] }) {
  return (
    <LinearGradient
      colors={['#3A3F47', '#16191E']}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.art}>
      <View style={styles.artGlow} />
      <MaterialCommunityIcons
        name={icon === 'pill' ? 'pill-multiple' : 'pill'}
        size={120}
        color="#F2F4F7"
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Care.background },
  pressed: { opacity: 0.85 },
  missing: { color: Care.textSecondary, textAlign: 'center', marginTop: 48 },

  scroll: { paddingHorizontal: 22, paddingBottom: 16, alignItems: 'center' },

  art: {
    alignSelf: 'stretch',
    aspectRatio: 1.15,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginTop: 4,
  },
  artGlow: {
    position: 'absolute',
    width: '70%',
    aspectRatio: 1,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },

  name: {
    color: Care.text,
    fontSize: 28,
    fontWeight: '800',
    marginTop: 24,
    textAlign: 'center',
  },
  timeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: 'rgba(47, 107, 255, 0.16)',
  },
  timeChipText: { color: Care.primaryLight, fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
  description: {
    color: Care.textSecondary,
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginTop: 12,
    paddingHorizontal: 12,
  },
  listenButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 20,
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 24,
    backgroundColor: Care.surface,
  },
  listenText: { color: Care.text, fontSize: 15, fontWeight: '600' },

  footer: { paddingHorizontal: 22, paddingBottom: 12, gap: 12 },
  question: {
    color: Care.text,
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 4,
  },
  takenButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: Care.primary,
    borderRadius: 28,
    paddingVertical: 18,
    shadowColor: Care.primary,
    shadowOpacity: 0.4,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  takenText: { color: Care.text, fontSize: 18, fontWeight: '800', letterSpacing: 0.5 },
  snoozeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#3A4558',
    borderRadius: 28,
    paddingVertical: 18,
  },
  snoozeText: { color: Care.text, fontSize: 17, fontWeight: '700', letterSpacing: 0.5 },
  skipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingVertical: 4,
  },
  skipText: { color: Care.textSecondary, fontSize: 13 },
});
