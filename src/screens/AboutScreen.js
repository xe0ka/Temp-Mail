import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, gradients, typography } from '../theme';

function Row({ icon, label, value }) {
  return (
    <View style={styles.row}>
      <View style={styles.rowIcon}>
        <MaterialIcons name={icon} size={18} color={colors.accentLight} />
      </View>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

export default function AboutScreen() {
  const insets = useSafeAreaInsets();
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 30 }]}
    >
      <LinearGradient colors={gradients.hero} style={styles.hero}>
        <View style={styles.logoBox}>
          <MaterialIcons name="mail" size={32} color={colors.white} />
        </View>
        <Text style={styles.title}>TempMail</Text>
        <Text style={styles.subtitle}>Анонимная временная почта</Text>
      </LinearGradient>

      <View style={styles.card}>
        <Row icon="verified-user" label="Версия" value="1.0.0" />
        <View style={styles.divider} />
        <Row icon="lock-outline" label="Конфиденциальность" value="Без регистрации" />
        <View style={styles.divider} />
        <Row icon="timer-outline" label="Срок жизни адреса" value="~1 час" />
        <View style={styles.divider} />
        <Row icon="database-outline" label="Провайдер" value="Guerrilla Mail" />
      </View>

      <View style={styles.note}>
        <MaterialIcons name="info-outline" size={16} color={colors.textMuted} />
        <Text style={styles.noteText}>
          TempMail создаёт одноразовый адрес для регистраций без раскрытия личной почты.
          Письма хранятся около часа и удаляются автоматически.
        </Text>
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
  hero: {
    borderRadius: 22,
    alignItems: 'center',
    paddingVertical: 30,
    marginBottom: 20,
  },
  logoBox: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: {
    ...typography.h1,
    color: colors.white,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    marginTop: 4,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: 'rgba(108,92,231,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rowLabel: {
    flex: 1,
    ...typography.body,
    fontSize: 14,
  },
  rowValue: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginLeft: 62,
  },
  note: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 18,
    paddingHorizontal: 8,
  },
  noteText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    color: colors.textMuted,
  },
});