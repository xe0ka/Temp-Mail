import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { WebView } from 'react-native-webview';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, gradients, shadows, typography } from '../theme';
import { getMessage, loadStoredAccount } from '../api/mailService';
import { formatFullDate } from '../utils/format';

function Avatar({ name, size = 46 }) {
  const initial = name ? name.trim().charAt(0).toUpperCase() : '?';
  return (
    <LinearGradient
      colors={gradients.avatar}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}
    >
      <Text style={[styles.avatarText, { fontSize: size * 0.4 }]}>{initial}</Text>
    </LinearGradient>
  );
}

function buildHtml(message, bodyText) {
  if (message?.html && message.html.length > 20) {
    return `
      <html><head>
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        body { font-family: -apple-system, sans-serif; font-size: 15px; line-height: 1.55; color: #E6E9F5; }
        a { color: #A78BFA; }
        pre { white-space: pre-wrap; }
        img { max-width: 100%; height: auto; }
      </style>
      </head><body>${message.html}</body></html>
    `;
  }
  const escaped = (bodyText || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  return `
    <html><head>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
      body { font-family: sans-serif; font-size: 15px; line-height: 1.6; color: #E6E9F5; white-space: pre-wrap; word-wrap: break-word; }
    </style>
    </head><body>${escaped}</body></html>
  `;
}

export default function MessageScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { messageId } = route.params;
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const acc = await loadStoredAccount();
        if (!acc) throw new Error('no account');
        const msg = await getMessage(acc, messageId);
        if (cancelled) return;
        setMessage(msg);
      } catch (e) {
        if (!cancelled) {
          Alert.alert('Ошибка', 'Не удалось загрузить письмо.');
          navigation.goBack();
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [messageId]);

  const fromName = message?.from?.name || 'Неизвестно';
  const fromAddress = message?.from?.address || '';
  const bodyText = message?.text || '';

  const handleReply = () => {
    Linking.openURL(`mailto:${fromAddress}?subject=Re: ${message?.subject || ''}`);
  };

  const handleCopyBody = async () => {
    const Clipboard = await import('expo-clipboard');
    await Clipboard.setStringAsync(bodyText);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.headerBar}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={({ pressed }) => [styles.headerBtn, pressed && styles.pressed]}
        >
          <MaterialIcons name="arrow-back" size={22} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {message?.subject || 'Письмо'}
        </Text>
        <Pressable
          onPress={handleCopyBody}
          style={({ pressed }) => [styles.headerBtn, pressed && styles.pressed]}
          disabled={!message}
        >
          <MaterialIcons name="content-copy" size={18} color={colors.textSecondary} />
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      ) : message ? (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.subject}>{message.subject || 'Без темы'}</Text>

          <View style={styles.senderCard}>
            <Avatar name={fromName} />
            <View style={styles.senderInfo}>
              <Text style={styles.fromName} numberOfLines={1}>
                {fromName}
              </Text>
              <Text style={styles.fromAddress} numberOfLines={1}>
                {fromAddress}
              </Text>
              <Text style={styles.date}>{formatFullDate(message.createdAt)}</Text>
            </View>
            <Pressable
              onPress={handleReply}
              style={({ pressed }) => [styles.replyIconBtn, pressed && styles.pressed]}
            >
              <MaterialIcons name="reply" size={20} color={colors.accentLight} />
            </Pressable>
          </View>

          <View style={styles.bodyCard}>
            {message.html && message.html.length > 20 ? (
              <WebView
                originWhitelist={['*']}
                source={{ html: buildHtml(message, bodyText) }}
                style={styles.webview}
                javaScriptEnabled={false}
                setSupportMultipleWindows={false}
                scrollEnabled={false}
                onShouldStartLoadWithRequest={() => false}
              />
            ) : (
              <Text style={styles.bodyText}>{bodyText || '(Пустое сообщение)'}</Text>
            )}
          </View>

          <Pressable
            onPress={handleReply}
            style={({ pressed }) => [styles.replyBtn, pressed && styles.pressed]}
          >
            <LinearGradient
              colors={gradients.primary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.replyBtnBg}
            >
              <MaterialIcons name="reply" size={17} color={colors.white} />
              <Text style={styles.replyText}>Ответить отправителю</Text>
            </LinearGradient>
          </Pressable>
        </ScrollView>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.bgElevated,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  headerTitle: {
    flex: 1,
    marginHorizontal: 10,
    ...typography.h3,
    fontSize: 15,
  },
  pressed: {
    opacity: 0.72,
    transform: [{ scale: 0.97 }],
  },
  loadingWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  subject: {
    ...typography.h1,
    fontSize: 21,
    lineHeight: 28,
    marginBottom: 14,
  },
  senderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 14,
    marginBottom: 14,
    ...shadows.card,
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
  senderInfo: {
    flex: 1,
  },
  fromName: {
    ...typography.h3,
    fontSize: 15,
  },
  fromAddress: {
    fontSize: 13,
    color: colors.accentLight,
    marginTop: 1,
  },
  date: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 4,
  },
  replyIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(108,92,231,0.14)',
  },
  bodyCard: {
    backgroundColor: colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    padding: 16,
    overflow: 'hidden',
    ...shadows.card,
  },
  webview: {
    backgroundColor: 'transparent',
  },
  bodyText: {
    fontSize: 15,
    lineHeight: 23,
    color: colors.text,
  },
  replyBtn: {
    marginTop: 16,
    borderRadius: 15,
    overflow: 'hidden',
  },
  replyBtnBg: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  replyText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
});