import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, gradients, typography } from '../theme';

export default function DevScreen() {
  const insets = useSafeAreaInsets();
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 30 }]}
    >
      <LinearGradient colors={['#1B2130', '#141826']} style={styles.card}>
        <View style={styles.avatarRing}>
          <LinearGradient colors={gradients.primary} style={styles.avatar}>
            <Text style={styles.avatarText}>N</Text>
          </LinearGradient>
        </View>
        <Text style={styles.name}>notseqt</Text>
        <Text style={styles.role}>Разработчик TempMail</Text>
        <View style={styles.badge}>
          <MaterialIcons name="favorite" size={13} color={colors.danger} />
          <Text style={styles.badgeText}>сделано с любовью</Text>
        </View>
      </LinearGradient>

      <View style={styles.block}>
        <Text style={styles.blockLabel}>ОБО МНЕ</Text>
        <Text style={styles.blockText}>
          Привет! Я notseqt — разработчик, который любит простые и полезные инструменты.
          TempMail создаётся как полностью бесплатный проект: никакой рекламы, подписок
          и лишней аналитики. Просто открой и пользуйся.
        </Text>
      </View>

      <View style={styles.block}>
        <Text style={styles.blockLabel}>ИДЕИ И ПОЖЕЛАНИЯ</Text>
        <View style={styles.ideaRow}>
          <MaterialIcons name="lightbulb-outline" size={18} color={colors.warning} />
          <Text style={styles.ideaText}>
            Нашёл баг или хочешь новую фичу? Напиши мне в Telegram — notseqt. каждая идея «в теме».
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    padding: 16,
  },
  card: {
    borderRadius: 22,
    alignItems: 'center',
    paddingVertical: 28,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginBottom: 22,
  },
  avatarRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    padding: 4,
    backgroundColor: 'rgba(108,92,231,0.25)',
    marginBottom: 14,
  },
  avatar: {
    flex: 1,
    borderRadius: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.white,
    fontSize: 40,
    fontWeight: '900',
  },
  name: {
    ...typography.h2,
    fontSize: 22,
  },
  role: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 14,
    backgroundColor: 'rgba(255,107,107,0.12)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  badgeText: {
    color: colors.danger,
    fontSize: 12,
    fontWeight: '600',
  },
  block: {
    marginBottom: 20,
  },
  blockLabel: {
    ...typography.label,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  blockText: {
    ...typography.body,
    fontSize: 14,
    lineHeight: 21,
    color: colors.textSecondary,
  },
  ideaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255,217,61,0.07)',
    borderRadius: 14,
    padding: 14,
  },
  ideaText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    color: colors.textSecondary,
  },
});