import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, gradients, shadows } from '../theme';

export default function GradientButton({ title, onPress, icon, style, loading }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={loading}
      style={({ pressed }) => [
        styles.wrap,
        style,
        pressed && styles.pressed,
        loading && styles.disabled,
      ]}
    >
      <LinearGradient
        colors={gradients.primary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {icon}
        <Text style={styles.label}>{loading ? '...' : title}</Text>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: 16,
    ...shadows.strong,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    opacity: 0.6,
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 24,
    borderRadius: 16,
    gap: 8,
  },
  label: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});