import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, gradients, shadows, typography } from '../theme';
import EmailRow from '../components/EmailRow';
import Toast from '../components/Toast';
import {
  createAccount,
  createNewAddress,
  loadStoredAccount,
  saveAccount,
  getMessages,
  getTTLSeconds,
} from '../api/mailService';
import { isEnabled, notifyNewMail } from '../utils/notifications';
import { formatTTL } from '../utils/format';

const READ_KEY = '@tempmail_read_v1';
const POLL_MS = 5000;

function EmptyInbox() {
  return (
    <View style={styles.emptyWrap}>
      <LinearGradient colors={['rgba(139,125,246,0.2)', 'rgba(108,92,231,0.06)']} style={styles.emptyIcon}>
        <MaterialIcons name="drafts-outlined" size={40} color={colors.accentLight} />
      </LinearGradient>
      <Text style={styles.emptyTitle}>Пока пусто</Text>
      <Text style={styles.emptyText}>
        Письма появятся здесь автоматически. Используйте адрес для регистрации.
      </Text>
    </View>
  );
}

export default function HomeScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [account, setAccount] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [ttl, setTtl] = useState(0);
  const [toast, setToast] = useState(null);
  const [readIds, setReadIds] = useState(new Set());
  const prevIds = useRef(new Set());
  const accountRef = useRef(null);
  const copiedOpacity = useRef(new Animated.Value(0)).current;

  const applyUnread = (list, ids) =>
    list.map((m) => ({ ...m, unread: Boolean(m.unread) && !ids.has(m.id) }));

  const loadReadIds = async () => {
    try {
      const raw = await AsyncStorage.getItem(READ_KEY);
      if (raw) {
        const ids = new Set(JSON.parse(raw));
        setReadIds(ids);
        return ids;
      }
    } catch (e) {}
    return new Set();
  };

  const persistReadIds = async (ids) => {
    try {
      await AsyncStorage.setItem(READ_KEY, JSON.stringify(Array.from(ids)));
    } catch (e) {}
  };

  const initAccount = async () => {
    setLoading(true);
    try {
      const stored = await loadStoredAccount();
      if (stored) {
        accountRef.current = stored;
        setAccount(stored);
      } else {
        const fresh = await createAccount();
        accountRef.current = fresh;
        setAccount(fresh);
        await saveAccount(fresh);
      }
    } catch (e) {
      Alert.alert('Ошибка', 'Не удалось создать временный адрес: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const pollMessages = async (acc, silent) => {
    try {
      const ids = await loadReadIds();
      const list = await getMessages(acc);
      const merged = applyUnread(list, ids);
      setMessages(merged);

      const fresh = merged.filter((m) => !prevIds.current.has(m.id));
      if (prevIds.current.size > 0 && fresh.length) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        const first = fresh[0];
        setToast({ message: `Новое письмо от ${first.from?.name || 'отправителя'}`, icon: 'mail' });
        if (await isEnabled()) {
          notifyNewMail(first.from?.name, first.subject);
        }
      }
      prevIds.current = new Set(merged.map((m) => m.id));
    } catch (e) {
      // тихое обновление
    }
  };

  const handleRefresh = async () => {
    if (!account) return;
    setRefreshing(true);
    await pollMessages(account, true);
    setRefreshing(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleNewInbox = () => {
    Alert.alert('Новый адрес', 'Получить новый временный адрес? Письма на старый перестанут приходить.', [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Создать',
        onPress: async () => {
          setCreating(true);
          try {
            const next = await createNewAddress(accountRef.current || account);
            accountRef.current = next;
            setAccount(next);
            await saveAccount(next);
            prevIds.current = new Set();
            setMessages([]);
            await Clipboard.setStringAsync(next.address);
            setToast({ message: 'Новый адрес скопирован', icon: 'check' });
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          } catch (e) {
            Alert.alert('Ошибка', 'Не удалось сменить адрес: ' + e.message);
          } finally {
            setCreating(false);
          }
        },
      },
    ]);
  };

  const handleCopy = async () => {
    if (!account) return;
    await Clipboard.setStringAsync(account.address);
    Animated.timing(copiedOpacity, { toValue: 1, duration: 180, useNativeDriver: true }).start();
    setTimeout(() => {
      Animated.timing(copiedOpacity, { toValue: 0, duration: 240, useNativeDriver: true }).start();
    }, 1600);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setToast({ message: 'Адрес скопирован', icon: 'check' });
  };

  const openMessage = (message) => {
    if (message.unread) {
      const next = new Set(readIds);
      next.add(message.id);
      setReadIds(next);
      persistReadIds(next);
      setMessages((prev) => prev.map((m) => (m.id === message.id ? { ...m, unread: false } : m)));
    }
    navigation.navigate('Message', { messageId: message.id });
  };

  useEffect(() => {
    initAccount();
  }, []);

  useEffect(() => {
    if (!account) return;
    const updateTtl = () => setTtl(getTTLSeconds(account));
    updateTtl();
    const t = setInterval(updateTtl, 1000);
    return () => clearInterval(t);
  }, [account]);

  useEffect(() => {
    if (!account) return;
    const iv = setInterval(() => pollMessages(account, false), POLL_MS);
    return () => clearInterval(iv);
  }, [account]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Toast visible={Boolean(toast)} message={toast?.message} icon={toast?.icon} onHide={() => setToast(null)} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Top bar */}
        <View style={styles.topBar}>
          <Pressable onPress={() => navigation.openDrawer()} style={({ pressed }) => [styles.menuBtn, pressed && styles.pressed]}>
            <MaterialIcons name="menu" size={24} color={colors.text} />
          </Pressable>
          <View style={styles.brandBox}>
            <LinearGradient colors={gradients.primary} style={styles.brandIcon}>
              <MaterialIcons name="mail" size={17} color={colors.white} />
            </LinearGradient>
            <Text style={styles.logo}>TempMail</Text>
          </View>
          <View style={styles.statusRow}>
            <View style={styles.statusDot} />
          </View>
        </View>

        {/* Address card */}
        <Pressable onPress={handleCopy} style={({ pressed }) => [styles.addrCard, pressed && styles.cardPressed]}>
          <View style={styles.addrTop}>
            <Text style={styles.addrLabel}>ВАШ ВРЕМЕННЫЙ АДРЕС</Text>
            <View style={styles.ttlChip}>
              <MaterialIcons name="timer-outline" size={12} color={colors.warning} />
              <Text style={styles.ttlText}>{formatTTL(ttl)}</Text>
            </View>
          </View>

          {loading ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator color={colors.accentLight} size="large" />
            </View>
          ) : account ? (
            <View style={styles.addrBlock}>
              <Animated.View style={[styles.copyOverlay, { opacity: copiedOpacity }]} pointerEvents="none">
                <MaterialIcons name="check-circle" size={16} color={colors.success} />
                <Text style={styles.copyOverlayText}>Скопировано</Text>
              </Animated.View>
              <Text style={styles.address} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
                {account.address}
              </Text>
              <View style={styles.addrHintRow}>
                <MaterialIcons name="content-copy" size={13} color={colors.textMuted} />
                <Text style={styles.addrHint}>нажмите, чтобы скопировать</Text>
              </View>
            </View>
          ) : (
            <Pressable onPress={initAccount} style={styles.retryRow}>
              <MaterialIcons name="error-outline" size={20} color={colors.danger} />
              <Text style={styles.retryText}>Повторить</Text>
            </Pressable>
          )}
        </Pressable>

        {/* Actions */}
        <View style={styles.actions}>
          <Pressable onPress={handleCopy} style={({ pressed }) => [styles.copyBtn, pressed && styles.cardPressed]}>
            <MaterialIcons name="content-copy" size={17} color={colors.accentLight} />
            <Text style={styles.copyBtnText}>Копировать</Text>
          </Pressable>
          <Pressable onPress={handleNewInbox} style={({ pressed }) => [styles.newBtn, (pressed || creating) && styles.cardPressed]}>
            {creating ? (
              <ActivityIndicator color={colors.white} size="small" />
            ) : (
              <>
                <MaterialIcons name="add" size={19} color={colors.white} />
                <Text style={styles.newBtnText}>Новый адрес</Text>
              </>
            )}
          </Pressable>
        </View>

        {/* Inbox */}
        <View style={styles.inboxHeader}>
          <View style={styles.inboxTitleRow}>
            <Text style={styles.inboxTitle}>Входящие</Text>
            {messages.length > 0 && (
              <View style={styles.countBadge}>
                <Text style={styles.countText}>{messages.length}</Text>
              </View>
            )}
          </View>
          <Pressable onPress={handleRefresh} style={({ pressed }) => [styles.refreshBtn, pressed && styles.pressed]}>
            <MaterialIcons name="refresh" size={20} color={colors.textSecondary} />
          </Pressable>
        </View>

        {messages.length === 0 && !loading ? (
          <EmptyInbox />
        ) : (
          <FlatList
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <EmailRow message={item} onPress={() => openMessage(item)} />}
            scrollEnabled={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor={colors.accentLight}
                colors={[colors.accent]}
              />
            }
          />
        )}
        <View style={{ height: insets.bottom + 24 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scroll: {
    padding: 16,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  menuBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bgElevated,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginRight: 12,
  },
  brandBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    flex: 1,
  },
  brandIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.text,
    letterSpacing: -0.4,
  },
  statusRow: {
    alignItems: 'flex-end',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
  },
  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.96 }],
  },

  addrCard: {
    backgroundColor: colors.card,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 18,
    overflow: 'hidden',
    ...shadows.card,
  },
  cardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.995 }],
  },
  addrTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  addrLabel: {
    ...typography.label,
    fontSize: 10,
  },
  ttlChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,217,61,0.08)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  ttlText: {
    color: colors.warning,
    fontSize: 11,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  loadingRow: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  addrBlock: {
    paddingVertical: 2,
  },
  copyOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    left: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    zIndex: 2,
  },
  copyOverlayText: {
    color: colors.success,
    fontSize: 13,
    fontWeight: '700',
  },
  address: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.accentLight,
    letterSpacing: 0.2,
  },
  addrHintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 6,
  },
  addrHint: {
    fontSize: 11,
    color: colors.textMuted,
  },
  retryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  retryText: {
    color: colors.danger,
    fontSize: 14,
    fontWeight: '700',
  },

  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },
  copyBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.bgElevated,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingVertical: 13,
  },
  copyBtnText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  newBtn: {
    flex: 1.4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.accent,
    borderRadius: 15,
    paddingVertical: 13,
    ...shadows.float,
  },
  newBtnText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '700',
  },

  inboxHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  inboxTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  inboxTitle: {
    ...typography.h2,
    fontSize: 19,
  },
  countBadge: {
    backgroundColor: colors.accent,
    borderRadius: 9,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  countText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '800',
  },
  refreshBtn: {
    padding: 6,
  },

  emptyWrap: {
    alignItems: 'center',
    paddingTop: 44,
    paddingHorizontal: 32,
  },
  emptyIcon: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    ...typography.h2,
    fontSize: 17,
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});