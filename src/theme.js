import { Platform } from 'react-native';

export const colors = {
  bg: '#0A0C12',
  bgElevated: '#11151F',
  card: '#151A26',
  cardBorder: '#222A3A',
  border: '#1C2330',
  text: '#F4F6FF',
  textSecondary: '#98A2B8',
  textMuted: '#5D6678',
  accent: '#6C5CE7',
  accentLight: '#A78BFA',
  accentDark: '#4C3FB5',
  secondary: '#00C6A7',
  danger: '#FF6B6B',
  warning: '#FFD93D',
  success: '#2ED573',
  white: '#FFFFFF',
  overlay: 'rgba(8, 10, 14, 0.75)',
  onSurface: '#FFFFFF',
};

export const gradients = {
  primary: ['#8B7DF6', '#6C5CE7', '#5A4BD1'],
  hero: ['#7C6CF0', '#6C5CE7', '#3E4A7A'],
  avatar: ['#8B7DF6', '#5A4BD1'],
  success: ['#2ED573', '#00C6A7'],
  danger: ['#FF6B6B', '#EE5A24'],
};

export const shadows = {
  card: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.3,
      shadowRadius: 16,
    },
    android: {
      elevation: 5,
    },
  }),
  float: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.45,
      shadowRadius: 22,
    },
    android: {
      elevation: 12,
    },
  }),
};

export const typography = {
  h1: { fontSize: 30, fontWeight: '800', color: colors.text, letterSpacing: -0.5 },
  h2: { fontSize: 21, fontWeight: '700', color: colors.text, letterSpacing: -0.3 },
  h3: { fontSize: 16, fontWeight: '700', color: colors.text },
  body: { fontSize: 15, color: colors.text, lineHeight: 22 },
  small: { fontSize: 13, color: colors.textSecondary },
  caption: { fontSize: 11, color: colors.textMuted },
  label: { fontSize: 11, fontWeight: '700', color: colors.textMuted, letterSpacing: 1.1 },
};