import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import * as Speech from 'expo-speech';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/avatar';
import { Care } from '@/constants/care-theme';
import { useInbox } from '@/context/inbox';

function formatSeconds(seconds: number) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
}

function confirmDelete(onConfirm: () => void) {
  const title = 'Delete conversation?';
  const message = 'This removes the message and your replies from this device.';
  if (Platform.OS === 'web') {
    if (window.confirm(`${title}\n\n${message}`)) onConfirm();
    return;
  }
  Alert.alert(title, message, [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Delete', style: 'destructive', onPress: onConfirm },
  ]);
}

export default function MessageScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { items, replies, resolutions, resolve, sendReply } = useInbox();
  const message = items.find((item) => item.id === id);

  const [playing, setPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [draft, setDraft] = useState('');
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopTimer = () => {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
  };

  useEffect(
    () => () => {
      stopTimer();
      Speech.stop();
    },
    [],
  );

  const close = () => (router.canGoBack() ? router.back() : router.replace('/inbox'));

  if (message?.kind !== 'voice-note' || resolutions[message.id] === 'deleted') {
    return (
      <SafeAreaView style={styles.container}>
        <Pressable style={styles.back} onPress={close} accessibilityLabel="Back">
          <Ionicons name="arrow-back" size={24} color={Care.text} />
        </Pressable>
        <Text style={styles.missing}>This conversation could not be found.</Text>
      </SafeAreaView>
    );
  }

  const { from, duration } = message;
  const thread = replies[message.id] ?? [];

  const togglePlay = () => {
    if (playing) {
      Speech.stop();
      stopTimer();
      setPlaying(false);
      return;
    }
    setPlaying(true);
    setPosition(0);
    timer.current = setInterval(() => setPosition((p) => Math.min(p + 1, duration)), 1000);
    const finish = () => {
      stopTimer();
      setPlaying(false);
    };
    Speech.speak(message.transcript, {
      rate: 0.9,
      onDone: () => {
        finish();
        setPosition(duration);
        if (!resolutions[message.id]) resolve(message.id, 'listened');
      },
      onStopped: finish,
      onError: finish,
    });
  };

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    sendReply(message.id, text);
    setDraft('');
    if (!resolutions[message.id]) resolve(message.id, 'listened');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Pressable style={styles.back} onPress={close} accessibilityLabel="Back">
          <Ionicons name="arrow-back" size={24} color={Care.text} />
        </Pressable>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.sender}>
            <Avatar person={from} size={84} round ring showBadge />
            <Text style={styles.senderName}>{from.name}</Text>
            <Text style={styles.sentAt}>{message.sentAt}</Text>
          </View>

          <View style={styles.quoteRow}>
            <Avatar person={from} size={20} round />
          </View>
          <Text style={styles.quote}>{message.transcript}</Text>

          <View style={styles.player}>
            <View style={styles.playerHeader}>
              <View style={styles.micIcon}>
                <MaterialCommunityIcons name="microphone" size={18} color={Care.primaryLight} />
              </View>
              <View>
                <Text style={styles.playerTitle}>Voice Note from {from.shortName}</Text>
                <Text style={styles.playerDuration}>{formatSeconds(duration)}</Text>
              </View>
            </View>
            <View style={styles.track}>
              <View style={[styles.trackFill, { width: `${(position / duration) * 100}%` }]} />
            </View>
            <View style={styles.trackTimes}>
              <Text style={styles.trackTime}>{formatSeconds(position)}</Text>
              <Text style={styles.trackTime}>{formatSeconds(duration)}</Text>
            </View>
            <Pressable
              style={({ pressed }) => [styles.playButton, pressed && styles.pressed]}
              onPress={togglePlay}>
              <Ionicons
                name={playing ? 'stop-circle-outline' : 'play-circle-outline'}
                size={20}
                color={Care.text}
              />
              <Text style={styles.playText}>{playing ? 'STOP' : 'PLAY MESSAGE'}</Text>
            </Pressable>
          </View>

          {thread.map((reply) => (
            <View key={reply.id} style={styles.reply}>
              <Text style={styles.replyText}>{reply.text}</Text>
              <Text style={styles.replyTime}>
                {reply.sentAt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
              </Text>
            </View>
          ))}
        </ScrollView>

        <View style={styles.composer}>
          <TextInput
            style={styles.input}
            value={draft}
            onChangeText={setDraft}
            placeholder="Type a reply..."
            placeholderTextColor={Care.textMuted}
            returnKeyType="send"
            onSubmitEditing={send}
          />
          <Pressable
            style={({ pressed }) => [styles.sendButton, (pressed || !draft.trim()) && styles.pressed]}
            onPress={send}
            disabled={!draft.trim()}>
            <Ionicons name="send-outline" size={18} color={Care.text} />
            <Text style={styles.sendText}>SEND</Text>
          </Pressable>
        </View>

        <Pressable
          style={styles.delete}
          onPress={() =>
            confirmDelete(() => {
              Speech.stop();
              resolve(message.id, 'deleted');
              close();
            })
          }>
          <Ionicons name="trash-outline" size={14} color={Care.textSecondary} />
          <Text style={styles.deleteText}>DELETE CONVERSATION</Text>
        </Pressable>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Care.background },
  flex: { flex: 1 },
  pressed: { opacity: 0.6 },
  missing: { color: Care.textSecondary, textAlign: 'center', marginTop: 48 },
  back: { paddingHorizontal: 16, paddingVertical: 12, alignSelf: 'flex-start' },
  scroll: { paddingHorizontal: 20, paddingBottom: 16 },

  sender: { alignItems: 'center' },
  senderName: { color: Care.text, fontSize: 22, fontWeight: '800', marginTop: 12 },
  sentAt: { color: Care.textSecondary, fontSize: 14, marginTop: 2 },
  quoteRow: { marginTop: 24 },
  quote: { color: Care.text, fontSize: 25, fontWeight: '800', lineHeight: 32, marginTop: 8 },

  player: {
    marginTop: 20,
    padding: 16,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#25406B',
    backgroundColor: '#152238',
  },
  playerHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  micIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(47, 107, 255, 0.18)',
  },
  playerTitle: { color: Care.text, fontSize: 15, fontWeight: '700' },
  playerDuration: { color: Care.textSecondary, fontSize: 12, marginTop: 2 },
  track: { height: 8, borderRadius: 4, backgroundColor: '#0E1626', marginTop: 16, overflow: 'hidden' },
  trackFill: { height: '100%', borderRadius: 4, backgroundColor: Care.primary },
  trackTimes: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  trackTime: { color: Care.textSecondary, fontSize: 11, fontVariant: ['tabular-nums'] },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 14,
    paddingVertical: 13,
    borderRadius: 24,
    backgroundColor: Care.primary,
  },
  playText: { color: Care.text, fontSize: 14, fontWeight: '800', letterSpacing: 0.5 },

  reply: {
    alignSelf: 'flex-end',
    maxWidth: '80%',
    marginTop: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    borderBottomRightRadius: 4,
    backgroundColor: Care.primary,
  },
  replyText: { color: Care.text, fontSize: 15, lineHeight: 21 },
  replyTime: { color: 'rgba(255,255,255,0.7)', fontSize: 11, marginTop: 4, alignSelf: 'flex-end' },

  composer: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingTop: 8 },
  input: {
    flex: 1,
    color: Care.text,
    fontSize: 15,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: '#3A4558',
  },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 18,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: '#3A4558',
  },
  sendText: { color: Care.text, fontSize: 14, fontWeight: '800', letterSpacing: 0.5 },
  delete: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
  },
  deleteText: { color: Care.textSecondary, fontSize: 11, fontWeight: '700', letterSpacing: 1 },
});
