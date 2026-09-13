import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, typography } from '../theme';
import {
  ensurePermissions,
  isEnabled,
  setEnabled,
} from '../utils/notifications';

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const [enabled, setEnabledState] = useState(true);
  const [permission, setPermission] = useState(false);

  useEffect(() => {
    (async () => {
      setEnabledState(await isEnabled());
      setPermission((await ensurePermissions()) === true);
    })();
  }, []);

  const toggle = async (value) => {
    if (value) {
      const granted = await ensurePermissions();
      if (!granted) {
        Alert.alert(
          'Доступ запрещён',
          'Включите уведомления для TempMail в настройках системы.'
        );
        return;
      }
      setPermission(true);
    }
    setEnabled(value ? true : false);
    await setEnabled(value);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 30 }]}
    >
      <View style={styles.card}>
        <View style={styles.row}>
          <View style={styles.iconBox}>
            <MaterialIcons name="notifications-active" size={20} color={colors.accentLight} />
          </View>
          <View style={styles.info}>
            <Text style={styles.title}>Уведомления о письмах</Text>
            <Text style={styles.desc}>Показывать оповещение при получении письма</Text>
          </View>
          <Switch
            value={enabled}
            onValueChange={toggle}
            trackColor={{ false: colors.border, true: colors.accent }}
            thumbColor={colors.white}
          />
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.row}>
          <View style={[styles.iconBox, permission && { backgroundColor: 'rgba(46,213,115,0.14)' }]}>
            <MaterialIcons
              name={permission ? 'check-circle' : 'how-to-reg'}
              size={20}
              color={permission ? colors.success : colors.textMuted}
            />
          </View>
          <View style={styles.info}>
            <Text style={styles.title}>Разрешение системы</Text>
            <Text style={styles.desc}>
              {permission ? 'Уведомления разрешены' : 'Нажмите «Включить», чтобы разрешить'}
            </Text>
          </View>
        </View>
        {!permission && (
          <Text style={styles.hint}>
            Уведомления появляются при получении нового письма. Работает, когда приложение открыто.
          </Text>
        )}
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
    backgroundColor: colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginBottom: 12,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
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
    marginRight: 10,
  },
  title: {
    ...typography.h3,
    fontSize: 14,
  },
  desc: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  hint: {
    fontSize: 12,
    lineHeight: 18,
    color: colors.textMuted,
    paddingHorizontal: 14,
    paddingBottom: 14,
  },
});