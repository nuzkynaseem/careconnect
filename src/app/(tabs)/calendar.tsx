import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Care } from '@/constants/care-theme';
import { useDoseStatus } from '@/context/dose-status';
import { dosesPerDay, getPastDay, isSameDay, type DayRecord } from '@/data/history';

type HistoryView = 'weekly' | 'monthly';
type DayState = 'taken' | 'missed' | 'today' | 'none';

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const GREEN = '#22C55E';
const RED = '#EF4444';

function stateOf(record: DayRecord | null): DayState {
  if (!record) return 'none';
  return record.taken >= record.total ? 'taken' : 'missed';
}

export default function MedicationHistoryScreen() {
  const today = useMemo(() => new Date(), []);
  const { statuses } = useDoseStatus();
  const [view, setView] = useState<HistoryView>('monthly');
  const [month, setMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));

  const todayTaken = Object.values(statuses).filter((s) => s.kind === 'taken').length;
  const recordFor = (date: Date): DayRecord | null =>
    isSameDay(date, today) ? { taken: todayTaken, total: dosesPerDay } : getPastDay(date, today);
  const dayState = (date: Date): DayState =>
    isSameDay(date, today) ? 'today' : stateOf(getPastDay(date, today));

  const isCurrentMonth =
    month.getFullYear() === today.getFullYear() && month.getMonth() === today.getMonth();

  const monthCells = useMemo(() => {
    const first = new Date(month.getFullYear(), month.getMonth(), 1);
    const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    const cells: (Date | null)[] = Array.from({ length: first.getDay() }, () => null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(month.getFullYear(), month.getMonth(), d));
    while (cells.length % 7) cells.push(null);
    return cells;
  }, [month]);

  const week = useMemo(() => {
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay());
    return Array.from(
      { length: 7 },
      (_, i) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + i),
    );
  }, [today]);

  const shiftMonth = (delta: number) =>
    setMonth((m) => new Date(m.getFullYear(), m.getMonth() + delta, 1));

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.headerTitle}>Medication History</Text>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.segment}>
          {(['weekly', 'monthly'] as const).map((v) => (
            <Pressable
              key={v}
              style={[styles.segmentItem, view === v && styles.segmentActive]}
              onPress={() => setView(v)}
              accessibilityRole="tab"
              accessibilityState={{ selected: view === v }}>
              <Text style={[styles.segmentText, view === v && styles.segmentTextActive]}>
                {v === 'weekly' ? 'Weekly' : 'Monthly'}
              </Text>
            </Pressable>
          ))}
        </View>

        {view === 'monthly' ? (
          <>
            <View style={styles.monthNav}>
              <Pressable style={styles.navButton} onPress={() => shiftMonth(-1)} accessibilityLabel="Previous month">
                <Ionicons name="chevron-back" size={20} color={Care.text} />
              </Pressable>
              <Text style={styles.monthTitle}>
                {month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </Text>
              <Pressable
                style={[styles.navButton, isCurrentMonth && styles.navDisabled]}
                onPress={() => shiftMonth(1)}
                disabled={isCurrentMonth}
                accessibilityLabel="Next month">
                <Ionicons name="chevron-forward" size={20} color={Care.text} />
              </Pressable>
            </View>

            <View style={styles.calendar}>
              <View style={styles.weekRow}>
                {WEEKDAYS.map((d, i) => (
                  <Text key={i} style={styles.weekday}>
                    {d}
                  </Text>
                ))}
              </View>
              {Array.from({ length: monthCells.length / 7 }, (_, row) => (
                <View key={row} style={styles.weekRow}>
                  {monthCells.slice(row * 7, row * 7 + 7).map((date, i) => (
                    <View key={i} style={styles.cell}>
                      {date && <DayCell date={date} state={dayState(date)} />}
                    </View>
                  ))}
                </View>
              ))}
            </View>
          </>
        ) : (
          <View style={styles.weekList}>
            {week.map((date) => {
              const record = recordFor(date);
              const future = !record && date > today;
              return (
                <View key={date.toISOString()} style={styles.weekItem}>
                  <DayCell date={date} state={dayState(date)} showNumber />
                  <View style={styles.weekItemText}>
                    <Text style={styles.weekItemDay}>
                      {date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                    </Text>
                    <Text style={styles.weekItemDetail}>
                      {record
                        ? `${record.taken} of ${record.total} doses taken`
                        : future
                          ? 'Upcoming'
                          : 'No record'}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        <Text style={styles.legendTitle}>Legend</Text>
        <LegendRow state="taken" label="All Taken" />
        <LegendRow state="missed" label="Missed Dose" />
        <LegendRow state="today" label="Today" />
      </ScrollView>
    </SafeAreaView>
  );
}

function DayCell({ date, state, showNumber = false }: { date: Date; state: DayState; showNumber?: boolean }) {
  const day = date.getDate();
  if (state === 'taken' || state === 'missed') {
    const color = state === 'taken' ? GREEN : RED;
    return (
      <View style={[styles.dayMark, { backgroundColor: `${color}26`, borderColor: `${color}66` }]}>
        {showNumber ? (
          <Text style={[styles.dayNumber, { color }]}>{day}</Text>
        ) : (
          <Ionicons name={state === 'taken' ? 'checkmark' : 'close'} size={18} color={color} />
        )}
      </View>
    );
  }
  if (state === 'today') {
    return (
      <View style={[styles.dayMark, styles.today]}>
        <Text style={styles.todayText}>{day}</Text>
      </View>
    );
  }
  return (
    <View style={styles.dayMark}>
      <Text style={styles.dayNumber}>{day}</Text>
    </View>
  );
}

function LegendRow({ state, label }: { state: DayState; label: string }) {
  return (
    <View style={styles.legendRow}>
      {state === 'today' ? (
        <View style={[styles.legendIcon, styles.today]}>
          <Text style={styles.todayText}>#</Text>
        </View>
      ) : (
        <View
          style={[
            styles.legendIcon,
            {
              backgroundColor: `${state === 'taken' ? GREEN : RED}26`,
              borderColor: `${state === 'taken' ? GREEN : RED}66`,
            },
          ]}>
          <Ionicons
            name={state === 'taken' ? 'checkmark' : 'close'}
            size={16}
            color={state === 'taken' ? GREEN : RED}
          />
        </View>
      )}
      <Text style={styles.legendLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Care.background },
  headerTitle: {
    color: Care.text,
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
    paddingVertical: 14,
  },
  scroll: { paddingHorizontal: 16, paddingBottom: 32 },

  segment: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Care.border,
    backgroundColor: '#142131',
  },
  segmentItem: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 20 },
  segmentActive: { backgroundColor: '#0B111B' },
  segmentText: { color: Care.textSecondary, fontSize: 15, fontWeight: '600' },
  segmentTextActive: { color: Care.text },

  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  navButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1F3550',
  },
  navDisabled: { opacity: 0.35 },
  monthTitle: { color: Care.text, fontSize: 21, fontWeight: '800' },

  calendar: {
    marginTop: 16,
    paddingVertical: 14,
    paddingHorizontal: 6,
    borderRadius: 18,
    backgroundColor: Care.surface,
  },
  weekRow: { flexDirection: 'row' },
  weekday: {
    flex: 1,
    textAlign: 'center',
    color: Care.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    paddingBottom: 8,
  },
  cell: { flex: 1, alignItems: 'center', paddingVertical: 5 },
  dayMark: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  dayNumber: { color: Care.text, fontSize: 15, fontWeight: '600' },
  today: { backgroundColor: Care.primary, borderColor: Care.primary },
  todayText: { color: Care.text, fontSize: 15, fontWeight: '800' },

  weekList: { marginTop: 18, gap: 10 },
  weekItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 14,
    borderRadius: 16,
    backgroundColor: Care.surface,
  },
  weekItemText: { flex: 1 },
  weekItemDay: { color: Care.text, fontSize: 15, fontWeight: '700' },
  weekItemDetail: { color: Care.textSecondary, fontSize: 13, marginTop: 2 },

  legendTitle: { color: Care.text, fontSize: 18, fontWeight: '800', marginTop: 28, marginBottom: 10 },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 12,
    marginBottom: 10,
    borderRadius: 14,
    backgroundColor: Care.surface,
  },
  legendIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  legendLabel: { color: Care.text, fontSize: 15, fontWeight: '600' },
});
