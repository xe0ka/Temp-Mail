import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CHANNEL_ID = 'new_emails';
const ENABLED_KEY = '@tempmail_notif_enabled';

let initialized = false;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function initNotifications() {
  if (initialized) return;
  initialized = true;
  try {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: 'Новые письма',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#6C5CE7',
    });
  } catch (e) {}
}

export async function ensurePermissions() {
  try {
    const existing = await Notifications.getPermissionsAsync();
    if (existing.granted) return true;
    if (existing.status === 'undetermined') {
      const req = await Notifications.requestPermissionsAsync();
      return req.granted;
    }
    return false;
  } catch (e) {
    return false;
  }
}

export async function isEnabled() {
  try {
    const raw = await AsyncStorage.getItem(ENABLED_KEY);
    if (raw === null) return true;
    return raw === '1';
  } catch (e) {
    return true;
  }
}

export async function setEnabled(value) {
  try {
    await AsyncStorage.setItem(ENABLED_KEY, value ? '1' : '0');
  } catch (e) {}
}

export async function notifyNewMail(fromName, subject) {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '📬 Новое письмо',
        body: `${fromName || 'Отправитель'}: ${subject || 'Без темы'}`,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
        color: '#6C5CE7',
      },
      trigger: null,
      channelId: CHANNEL_ID,
    });
  } catch (e) {
    // уведомления не критичны
  }
}