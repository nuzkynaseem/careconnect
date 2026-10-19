import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { Care } from '@/constants/care-theme';

type AvatarPerson = {
  initials: string;
  color: string;
  badge?: keyof typeof MaterialCommunityIcons.glyphMap;
  roleColor?: string;
};

export function Avatar({
  person,
  size = 56,
  round = false,
  ring = false,
  showBadge = false,
}: {
  person: AvatarPerson;
  size?: number;
  round?: boolean;
  /** Draws a blue ring around the avatar. */
  ring?: boolean;
  /** Shows the person's role badge in the bottom-right corner. */
  showBadge?: boolean;
}) {
  const radius = round ? size / 2 : size * 0.28;
  const badgeSize = Math.max(20, size * 0.3);

  return (
    <View style={ring && [styles.ring, { borderRadius: radius + 6 }]}>
      <View
        style={[
          styles.avatar,
          { width: size, height: size, borderRadius: radius, backgroundColor: person.color },
        ]}>
        <Text style={[styles.initials, { fontSize: size * 0.36 }]}>{person.initials}</Text>
      </View>
      {showBadge && person.badge && (
        <View
          style={[
            styles.badge,
            {
              width: badgeSize,
              height: badgeSize,
              borderRadius: badgeSize / 2,
              backgroundColor: person.roleColor ?? Care.primary,
            },
          ]}>
          <MaterialCommunityIcons name={person.badge} size={badgeSize * 0.6} color={Care.text} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  ring: { padding: 3, borderWidth: 3, borderColor: Care.primary },
  avatar: { alignItems: 'center', justifyContent: 'center' },
  initials: { color: '#FFFFFF', fontWeight: '800' },
  badge: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Care.background,
  },
});
