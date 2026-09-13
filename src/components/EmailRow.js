import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, shadows } from '../theme';
import { formatRelativeTime } from '../utils/format';

const AVATAR_COLORS = [
  ['#8B7DF6', '#5A4BD1'],
  ['#4EA8DE', '#2D6FA3'],
  ['#2ED573', '#0E9F6E'],
  ['#F5A623', '#D97A00'],
  ['#FF6B9D', '#D63D6E'],
  ['#A78BFA', '#7C3AED'],
  ['#4ADEDE', '#248FAE'],
  ['#F9CA24', '#D99918'],
];

function hashSeed(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) >>> 0;
  }
  return h;
}

function Avatar({ name, unread, size = 46 }) {
  const seed = hashSeed(name || '?');
  const [c1, c2] = AVATAR_COLORS[seed % AVATAR_COLORS.length];
  const initial = name ? name.trim().charAt(0).toUpperCase() : '?';
  return (
    <LinearGradient
      colors={c1.length ? [c1, c2] : ['#8B7DF6', '#5A4BD1']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}
    >
      <Text style={[styles.avatarText, { fontSize: size * 0.4 }]}>{initial}</Text>
      {unread && <View style={styles.avatarDot} />}
    </LinearGradient>
  );
}

export default function EmailRow({ message, onPress }) {
  const fromName = message.from?.name || 'Неизвестно';
  const unread = Boolean(message.unread);
  const hasUnread = unread;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.wrap, pressed && styles.pressed]}
    >
      <Avatar name={fromName} unread={hasUnread} />
      <View style={styles.content}>
        <View style={styles.topRow}>
          {hasUnread && <View style={styles.unreadDot} />}
          <Text
            style={[styles.fromName, hasUnread && styles.bold]}
            numberOfLines={1}
          >
            {fromName}
          </Text>
          <Text style={styles.time}>{formatRelativeTime(message.createdAt)}</Text>
        </View>
        <Text
          style={[styles.subject, hasUnread && styles.bold]}
          numberOfLines={1}
        >
          {message.subject || 'Без темы'}
        </Text>
        {message.intro ? (
          <Text style={styles.intro} numberOfLines={1}>
            {message.intro}
          </Text>
        ) : null}
      </View>
      <MaterialIcons name="chevron-right" size={20} color={colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginHorizontal: 14,
    marginVertical: 4,
    backgroundColor: colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    ...shadows.card,
  },
  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.985 }],
  },
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: colors.white,
    fontWeight: '800',
  },
  avatarDot: {
    position: 'absolute',
    right: -1,
    bottom: -1,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.accentLight,
    borderWidth: 2,
    borderColor: colors.card,
  },
  content: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accentLight,
    marginRight: 6,
  },
  fromName: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
    marginRight: 8,
    fontWeight: '500',
  },
  bold: {
    fontWeight: '800',
  },
  time: {
    fontSize: 11,
    color: colors.textMuted,
  },
  subject: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
    lineHeight: 19,
  },
  intro: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
});