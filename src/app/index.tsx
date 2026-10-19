import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Care } from '@/constants/care-theme';
import { routines, type Medication, type Routine } from '@/data/medications';

const PATIENT_NAME = 'Arthur';

function getGreeting(date: Date) {
  const hour = date.getHours();
  if (hour < 12) return 'Good Morning,';
  if (hour < 17) return 'Good Afternoon,';
  return 'Good Evening,';
}

function formatDate(date: Date) {
  return date
    .toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
    .toUpperCase();
}

const routineIcons: Record<Routine['icon'], keyof typeof MaterialCommunityIcons.glyphMap> = {
  sunrise: 'weather-sunset-up',
  sun: 'white-balance-sunny',
  moon: 'weather-night',
};

export default function HomeScreen() {
  const now = new Date();
  const [taken, setTaken] = useState<Set<string>>(new Set());

  const [current, ...upNext] = routines;
  const totalMeds = routines.reduce((sum, r) => sum + r.medications.length, 0);
  const progress = useMemo(
    () => (totalMeds === 0 ? 0 : Math.round((taken.size / totalMeds) * 100)),
    [taken, totalMeds],
  );

  const toggle = (id: string) =>
    setTaken((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const startRoutine = () =>
    setTaken((prev) => new Set([...prev, ...current.medications.map((m) => m.id)]));

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.date}>{formatDate(now)}</Text>
            <Text style={styles.greeting}>{getGreeting(now)}</Text>
            <Text style={[styles.greeting, styles.name]}>{PATIENT_NAME}</Text>
          </View>
          <Pressable style={styles.inboxButton} accessibilityLabel="Messages">
            <Ionicons name="mail-outline" size={22} color={Care.text} />
            <View style={styles.badge} />
          </Pressable>
        </View>

        <View style={styles.progressSection}>
          <View style={styles.progressRow}>
            <Text style={styles.progressLabel}>Daily Progress</Text>
            <Text style={styles.progressValue}>{progress}%</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
        </View>

        <View style={styles.sectionTitleRow}>
          <MaterialCommunityIcons name="white-balance-sunny" size={20} color={Care.primaryLight} />
          <Text style={styles.sectionTitle}>Now</Text>
        </View>

        <LinearGradient
          colors={[Care.primaryLight, Care.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.nowCard}>
          <View style={styles.nowHeader}>
            <View>
              <View style={styles.timeChip}>
                <Text style={styles.timeChipText}>{current.window}</Text>
              </View>
              <Text style={styles.nowTitle}>{current.title}</Text>
            </View>
            <View style={styles.kitButton}>
              <MaterialCommunityIcons name="medical-bag" size={22} color={Care.text} />
            </View>
          </View>

          {current.medications.map((med) => (
            <MedicationRow
              key={med.id}
              med={med}
              taken={taken.has(med.id)}
              onToggle={() => toggle(med.id)}
            />
          ))}

          <Pressable
            style={({ pressed }) => [styles.startButton, pressed && { opacity: 0.85 }]}
            onPress={startRoutine}>
            <Ionicons name="play-circle-outline" size={20} color={Care.primaryDark} />
            <Text style={styles.startButtonText}>Start Routine</Text>
          </Pressable>
        </LinearGradient>

        <Text style={[styles.sectionTitle, styles.upNextTitle]}>Up Next</Text>

        {upNext.map((routine, index) => (
          <UpNextCard key={routine.id} routine={routine} dimmed={index > 0} />
        ))}
      </ScrollView>

      <Pressable
        style={({ pressed }) => [styles.emergency, pressed && { opacity: 0.85 }]}
        accessibilityLabel="Emergency">
        <MaterialCommunityIcons name="alarm-light-outline" size={20} color={Care.text} />
        <Text style={styles.emergencyText}>Emergency</Text>
      </Pressable>
    </SafeAreaView>
  );
}

function MedicationRow({
  med,
  taken,
  onToggle,
}: {
  med: Medication;
  taken: boolean;
  onToggle: () => void;
}) {
  return (
    <Pressable style={styles.medRow} onPress={onToggle}>
      <View style={styles.medIcon}>
        <MaterialCommunityIcons
          name={med.icon === 'pill' ? 'pill' : 'water-outline'}
          size={20}
          color={Care.primaryDark}
        />
      </View>
      <View style={styles.medInfo}>
        <Text style={[styles.medName, taken && styles.medTaken]}>{med.name}</Text>
        <Text style={styles.medDetail}>
          {med.dose}
          {med.instructions ? ` • ${med.instructions}` : ''}
        </Text>
      </View>
      <View style={[styles.checkbox, taken && styles.checkboxChecked]}>
        {taken && <Ionicons name="checkmark" size={16} color={Care.primaryDark} />}
      </View>
    </Pressable>
  );
}

function UpNextCard({ routine, dimmed }: { routine: Routine; dimmed: boolean }) {
  const accent = routine.icon === 'moon' ? Care.evening : Care.afternoon;
  const count = routine.medications.length;
  return (
    <View style={[styles.upNextCard, dimmed && styles.dimmed]}>
      <View style={styles.upNextHeader}>
        <View style={[styles.upNextIcon, { backgroundColor: `${accent}22` }]}>
          <MaterialCommunityIcons name={routineIcons[routine.icon]} size={18} color={accent} />
        </View>
        <View style={styles.medInfo}>
          <Text style={styles.upNextTitleText}>{routine.title}</Text>
          <Text style={styles.upNextWindow}>{routine.window}</Text>
        </View>
        <Text style={styles.upNextCount}>
          {count} {count === 1 ? 'Med' : 'Meds'}
        </Text>
      </View>
      {!dimmed &&
        routine.medications.map((med) => (
          <View key={med.id} style={styles.upNextMed}>
            <Text style={styles.upNextMedName}>{med.name}</Text>
            <Text style={styles.upNextMedDose}>{med.dose}</Text>
          </View>
        ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Care.background },
  scroll: { paddingHorizontal: 22, paddingTop: 16, paddingBottom: 110 },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  date: { color: Care.textSecondary, fontSize: 12, fontWeight: '600', letterSpacing: 1 },
  greeting: { color: Care.text, fontSize: 30, fontWeight: '800', lineHeight: 36, marginTop: 4 },
  name: { color: Care.primaryLight, marginTop: 0 },
  inboxButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Care.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  badge: {
    position: 'absolute',
    top: 9,
    right: 9,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Care.emergency,
  },

  progressSection: {
    marginTop: 24,
    paddingTop: 20,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Care.border,
  },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  progressLabel: { color: Care.text, fontSize: 15, fontWeight: '600' },
  progressValue: { color: Care.primaryLight, fontSize: 18, fontWeight: '800' },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: Care.surface,
    marginTop: 10,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 4, backgroundColor: Care.primary },

  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 28 },
  sectionTitle: { color: Care.text, fontSize: 20, fontWeight: '800' },

  nowCard: {
    marginTop: 14,
    borderRadius: 28,
    padding: 18,
    gap: 12,
    shadowColor: Care.primary,
    shadowOpacity: 0.4,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  nowHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  timeChip: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
  },
  timeChipText: { color: Care.text, fontSize: 12, fontWeight: '600' },
  nowTitle: { color: Care.text, fontSize: 28, fontWeight: '800', marginTop: 10, lineHeight: 32 },
  kitButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  medRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  medIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Care.text,
    alignItems: 'center',
    justifyContent: 'center',
  },
  medInfo: { flex: 1 },
  medName: { color: Care.text, fontSize: 17, fontWeight: '700' },
  medTaken: { textDecorationLine: 'line-through', opacity: 0.8 },
  medDetail: { color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 2 },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: { backgroundColor: Care.text, borderColor: Care.text },

  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Care.text,
    borderRadius: 26,
    paddingVertical: 15,
    marginTop: 4,
  },
  startButtonText: { color: Care.primaryDark, fontSize: 16, fontWeight: '700' },

  upNextTitle: { marginTop: 32, marginBottom: 14 },
  upNextCard: {
    backgroundColor: Care.surface,
    borderRadius: 22,
    padding: 16,
    marginBottom: 14,
    gap: 12,
  },
  dimmed: { opacity: 0.5 },
  upNextHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  upNextIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  upNextTitleText: { color: Care.text, fontSize: 17, fontWeight: '700' },
  upNextWindow: { color: Care.textSecondary, fontSize: 12, marginTop: 2 },
  upNextCount: { color: Care.textMuted, fontSize: 12, fontWeight: '600' },
  upNextMed: { paddingLeft: 44 },
  upNextMedName: { color: Care.text, fontSize: 14, fontWeight: '500' },
  upNextMedDose: { color: Care.textMuted, fontSize: 12, marginTop: 2 },

  emergency: {
    position: 'absolute',
    right: 20,
    bottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Care.emergency,
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 28,
    shadowColor: Care.emergency,
    shadowOpacity: 0.5,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  emergencyText: { color: Care.text, fontSize: 15, fontWeight: '700' },
});
