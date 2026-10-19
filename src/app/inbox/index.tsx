import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/avatar';
import { ScreenHeader } from '@/components/screen-header';
import { Care } from '@/constants/care-theme';
import { useDoseStatus } from '@/context/dose-status';
import { useInbox, type Resolution } from '@/context/inbox';
import type { InboxItem } from '@/data/inbox';

type Tab = 'unread' | 'past';

const kindStyle = {
  invite: { label: 'INVITE', color: Care.primaryLight, icon: 'calendar-plus' },
  'voice-note': { label: 'VOICE NOTE', color: '#B57BFF', icon: 'waveform' },
  reminder: { label: 'REMINDER', color: '#F5B03A', icon: 'medical-bag' },
} as const;

const resolutionLabel: Record<Resolution, string> = {
  accepted: 'Accepted',
  declined: 'Declined',
  listened: 'Listened',
  done: 'Marked taken',
  deleted: 'Deleted',
};

export default function InboxScreen() {
  const [tab, setTab] = useState<Tab>('unread');
  const { unread, past, resolutions, resolve } = useInbox();
  const { markTaken } = useDoseStatus();

  const items = tab === 'unread' ? unread : past;

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader
        title="Inbox"
        onBack={() => (router.canGoBack() ? router.back() : router.replace('/'))}
      />

      <View style={styles.tabs}>
        {(['unread', 'past'] as const).map((t) => (
          <Pressable key={t} style={styles.tab} onPress={() => setTab(t)}>
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t === 'unread' ? `Unread${unread.length ? ` (${unread.length})` : ''}` : 'Past'}
            </Text>
            <View style={[styles.tabIndicator, tab === t && styles.tabIndicatorActive]} />
          </Pressable>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {items.map((item) => (
          <InboxCard
            key={item.id}
            item={item}
            resolution={resolutions[item.id]}
            onViewInvite={() =>
              router.push({ pathname: '/inbox/invite/[id]', params: { id: item.id } })
            }
            onListen={() => router.push({ pathname: '/messages/[id]', params: { id: item.id } })}
            onMarkTaken={() => {
              if (item.kind !== 'reminder') return;
              markTaken(item.medId);
              resolve(item.id, 'done');
            }}
          />
        ))}

        <View style={styles.empty}>
          <MaterialCommunityIcons name="inbox-outline" size={32} color={Care.textMuted} />
          <Text style={styles.emptyText}>
            {tab === 'unread' ? "You're all caught up!" : items.length ? 'End of history' : 'Nothing here yet'}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function InboxCard({
  item,
  resolution,
  onViewInvite,
  onListen,
  onMarkTaken,
}: {
  item: InboxItem;
  resolution: Resolution | undefined;
  onViewInvite: () => void;
  onListen: () => void;
  onMarkTaken: () => void;
}) {
  const kind = kindStyle[item.kind];

  return (
    <View style={[styles.card, resolution && styles.cardPast]}>
      <View style={styles.cardTop}>
        <View style={styles.cardText}>
          <View style={styles.kindRow}>
            <View style={[styles.kindIcon, { backgroundColor: `${kind.color}22` }]}>
              <MaterialCommunityIcons name={kind.icon} size={16} color={kind.color} />
            </View>
            <Text style={[styles.kindLabel, { color: kind.color }]}>{kind.label}</Text>
          </View>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
        </View>
        {item.kind === 'reminder' ? (
          <View style={styles.pillThumb}>
            <MaterialCommunityIcons name="pill" size={30} color="#9AA0A8" />
          </View>
        ) : (
          <Avatar person={item.from} />
        )}
      </View>

      <View style={styles.divider} />

      {resolution && item.kind === 'voice-note' ? (
        <Pressable
          style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
          onPress={onListen}>
          <Ionicons name="chatbubble-ellipses-outline" size={18} color={Care.text} />
          <Text style={styles.secondaryButtonText}>Open Conversation</Text>
        </Pressable>
      ) : resolution ? (
        <View style={styles.resolved}>
          <Ionicons name="checkmark-circle" size={16} color={Care.textSecondary} />
          <Text style={styles.resolvedText}>{resolutionLabel[resolution]}</Text>
        </View>
      ) : item.kind === 'invite' ? (
        <Pressable
          style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
          onPress={onViewInvite}>
          <Text style={styles.primaryButtonText}>View Invite</Text>
          <Ionicons name="arrow-forward" size={16} color={Care.text} />
        </Pressable>
      ) : item.kind === 'voice-note' ? (
        <Pressable
          style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
          onPress={onListen}>
          <Ionicons name="play-circle-outline" size={18} color={Care.text} />
          <Text style={styles.secondaryButtonText}>Listen</Text>
        </Pressable>
      ) : (
        <Pressable
          style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}
          onPress={onMarkTaken}>
          <Text style={styles.secondaryButtonText}>Mark Taken</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Care.background },
  pressed: { opacity: 0.85 },

  tabs: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Care.border,
  },
  tab: { flex: 1, alignItems: 'center', paddingTop: 8 },
  tabText: { color: Care.textSecondary, fontSize: 15, fontWeight: '600', paddingBottom: 10 },
  tabTextActive: { color: Care.text, fontWeight: '700' },
  tabIndicator: { height: 3, alignSelf: 'stretch', marginHorizontal: 24, borderRadius: 2 },
  tabIndicatorActive: { backgroundColor: Care.primary },

  list: { padding: 16, gap: 16, paddingBottom: 32 },

  card: { backgroundColor: Care.surface, borderRadius: 18, padding: 16 },
  cardPast: { opacity: 0.7 },
  cardTop: { flexDirection: 'row', gap: 12 },
  cardText: { flex: 1 },
  kindRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  kindIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kindLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  cardTitle: { color: Care.text, fontSize: 17, fontWeight: '700', marginTop: 10 },
  cardSubtitle: { color: '#7FA6C9', fontSize: 14, marginTop: 4, lineHeight: 20 },
  pillThumb: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#ECEBDD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: Care.border,
    marginVertical: 14,
  },

  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Care.primary,
    borderRadius: 12,
    paddingVertical: 12,
  },
  primaryButtonText: { color: Care.text, fontSize: 15, fontWeight: '700' },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#3A4558',
    borderRadius: 12,
    paddingVertical: 12,
  },
  secondaryButtonText: { color: Care.text, fontSize: 15, fontWeight: '600' },
  resolved: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  resolvedText: { color: Care.textSecondary, fontSize: 14, fontWeight: '600' },

  empty: { alignItems: 'center', gap: 8, marginTop: 16 },
  emptyText: { color: Care.textMuted, fontSize: 13 },
});
