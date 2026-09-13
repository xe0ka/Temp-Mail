import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { colors } from './src/theme';
import { initNotifications } from './src/utils/notifications';
import DrawerContent from './src/navigation/DrawerContent';
import HomeScreen from './src/screens/HomeScreen';
import MessageScreen from './src/screens/MessageScreen';
import AboutScreen from './src/screens/AboutScreen';
import DevScreen from './src/screens/DevScreen';
import CreditsScreen from './src/screens/CreditsScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

const navTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.bg,
    card: colors.bgElevated,
    text: colors.text,
    primary: colors.accent,
    border: colors.border,
  },
};

function DrawerNav() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <DrawerContent {...props} />}
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: colors.bgElevated },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '700', fontSize: 16 },
        headerShadowVisible: false,
        sceneStyle: { backgroundColor: colors.bg },
        drawerStyle: { backgroundColor: colors.bg, width: 290 },
        overlayColor: 'rgba(5,7,12,0.6)',
        swipeEdgeWidth: 60,
      }}
    >
      <Drawer.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
      <Drawer.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Уведомления' }} />
      <Drawer.Screen name="About" component={AboutScreen} options={{ title: 'О приложении' }} />
      <Drawer.Screen name="Dev" component={DevScreen} options={{ title: 'Разработчик' }} />
      <Drawer.Screen name="Credits" component={CreditsScreen} options={{ title: 'Благодарности' }} />
    </Drawer.Navigator>
  );
}

export default function App() {
  useEffect(() => {
    initNotifications();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer theme={navTheme}>
          <StatusBar style="light" />
          <Stack.Navigator
            screenOptions={{
              headerShown: false,
              animation: 'slide_from_right',
              contentStyle: { backgroundColor: colors.bg },
            }}
          >
            <Stack.Screen name="Main" component={DrawerNav} />
            <Stack.Screen name="Message" component={MessageScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}