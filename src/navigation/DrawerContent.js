import React from 'react';
import { Pressable, Share, StyleSheet, Text, View } from 'react-native';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, gradients, typography } from '../theme';

function Item({ icon, label, onPress, active }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.item, active && styles.itemActive, pressed && styles.itemPressed]}
    >
      <View style={[styles.itemIcon, active && styles.itemIconActive]}>
        <MaterialIcons name={icon} size={19} color={active ? colors.white : colors.textSecondary} />
      </View>
      <Text style={[styles.itemLabel, active && styles.itemLabelActive]}>{label}</Text>
      {active && <View style={styles.itemDot} />}
    </Pressable>
  );
}

function Section({ label }) {
  return <Text style={styles.section}>{label}</Text>;
}

export default function DrawerContent({ navigation, state }) {
  const insets = useSafeAreaInsets();
  const active = state?.routes?.[state.index]?.name;

  const shareApp = async () => {
    try {
      await Share.share({
        message: 'TempMail — анонимная временная почта для безопасных регистраций. Просто открой и пользуйся!\n\nСкачать - ',
        title: 'TempMail',
      });
    } catch (e) {}
  };

  return (
    <DrawerContentScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <View style={styles.brandWrap}>
        <LinearGradient colors={gradients.primary} style={styles.brandIcon}>
          <MaterialIcons name="mail" size={22} color={colors.white} />
        </LinearGradient>
        <View>
          <Text style={styles.brandName}>TempMail</Text>
          <Text style={styles.brandTag}>Анонимная почта</Text>
        </View>
      </View>

      <Section label="МЕНЮ" />
      <Item
        icon="inbox"
        label="Моя почта"
        active={active === 'Home'}
        onPress={() => navigation.navigate('Home')}
      />
      <Item
        icon="notifications-none"
        label="Уведомления"
        active={active === 'Notifications'}
        onPress={() => navigation.navigate('Notifications')}
      />
      <Item icon="share" label="Поделиться" onPress={shareApp} />

      <Section label="ПРОЕКТ" />
      <Item
        icon="info-outline"
        label="О приложении"
        active={active === 'About'}
        onPress={() => navigation.navigate('About')}
      />
      <Item
        icon="code"
        label="Разработчик"
        active={active === 'Dev'}
        onPress={() => navigation.navigate('Dev')}
      />
      <Item
        icon="favorite-outline"
        label="Благодарности"
        active={active === 'Credits'}
        onPress={() => navigation.navigate('Credits')}
      />

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <Text style={styles.version}>TempMail v1.0.0 · сделано notseqt</Text>
        <View style={styles.footerDot} />
      </View>
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    backgroundColor: colors.bg,
  },
  content: {
    paddingVertical: 18,
  },
  brandWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingBottom: 18,
  },
  brandIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: {
    ...typography.h2,
    fontSize: 19,
  },
  brandTag: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 1,
  },
  section: {
    ...typography.label,
    fontSize: 10,
    paddingHorizontal: 20,
    marginBottom: 6,
    marginTop: 12,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 11,
    marginHorizontal: 8,
    borderRadius: 14,
    gap: 12,
  },
  itemActive: {
    backgroundColor: 'rgba(108,92,231,0.16)',
  },
  itemPressed: {
    opacity: 0.7,
  },
  itemIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: colors.bgElevated,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemIconActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  itemLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  itemLabelActive: {
    color: colors.text,
    fontWeight: '700',
  },
  itemDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accentLight,
  },
  footer: {
    marginTop: 24,
    paddingHorizontal: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
  },
  version: {
    fontSize: 11,
    color: colors.textMuted,
  },
  footerDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.accent,
  },
});