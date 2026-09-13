import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, typography } from '../theme';

function Credit({ icon, name, desc }) {
  return (
    <View style={styles.card}>
      <View style={styles.iconBox}>
        <MaterialIcons name={icon} size={20} color={colors.accentLight} />
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.desc}>{desc}</Text>
      </View>
      <MaterialIcons name="favorite" size={16} color={colors.danger} />
    </View>
  );
}

export default function CreditsScreen() {
  const insets = useSafeAreaInsets();
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 30 }]}
    >
      <Text style={styles.lead}>
        TempMail бесплатен благодаря этим замечательным проектам.
      </Text>

      <Credit
        icon="mail"
        name="Guerrilla Mail"
        desc="Провайдер временной почты и основной почтовый движок"
      />
      <Credit
        icon="swap-horiz"
        name="1secmail"
        desc="Резервный почтовый сервис на случай недоступности"
      />
      <Credit
        icon="mobile-friendly"
        name="Expo / React Native"
        desc="Фреймворк, на котором написано приложение"
      />
      <Credit
        icon="device-hub"
        name="React Navigation"
        desc="Навигация и боковое меню"
      />

      <View style={styles.footer}>
        <Text style={styles.footerText}>Спасибо, что пользуетесь TempMail ❤</Text>
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
  lead: {
    ...typography.small,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 14,
    marginBottom: 10,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: 'rgba(108,92,231,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  info: {
    flex: 1,
    marginRight: 8,
  },
  name: {
    ...typography.h3,
    fontSize: 14,
  },
  desc: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  footer: {
    alignItems: 'center',
    marginTop: 10,
  },
  footerText: {
    fontSize: 13,
    color: colors.textMuted,
  },
});