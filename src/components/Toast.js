import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, shadows } from '../theme';

export default function Toast({ message, visible, icon = 'mail', onHide }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(anim, { toValue: 1, duration: 250, useNativeDriver: true }).start();
      const t = setTimeout(() => {
        Animated.timing(anim, { toValue: 0, duration: 250, useNativeDriver: true }).start(onHide);
      }, 2800);
      return () => clearTimeout(t);
    }
  }, [visible]);

  return (
    <View pointerEvents="none" style={styles.wrap}>
      <Animated.View
        style={[
          styles.toast,
          {
            opacity: anim,
            transform: [
              { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [-16, 0] }) },
              { scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1] }) },
            ],
          },
        ]}
      >
        <View style={styles.iconBox}>
          <MaterialIcons name={icon} size={18} color={colors.accentLight} />
        </View>
        <Text style={styles.text}>{message}</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: 10,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 50,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bgElevated,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
    maxWidth: '88%',
    ...shadows.float,
  },
  iconBox: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(108,92,231,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
    flexShrink: 1,
  },
});