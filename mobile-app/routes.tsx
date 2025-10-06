import { useCallback, useEffect, useState } from 'react';
import { Alert, StatusBar, StyleSheet, useWindowDimensions, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { Drawer } from './components/Drawer';
import { useAuth } from './contexts/AuthContext';
import { usePushNotificationContext } from './contexts/PushNotificationContext';
import "./global.css";
import { usePushNotifications } from './hooks/usePushNotification';
import LoginPage from './screens/LoginPage';
import { MonitorPage } from './screens/MonitorPage';
import { NotificationSettingsPage } from './screens/NotificationSettingsPage';


const DRAWER_WIDTH_PERCENT = 0.7;

function ScreenWithDrawer() {
  const [currentScreen, setCurrentScreen] = useState<'monitor' | 'notifications'>('monitor');
  const { logout } = useAuth();
  const { setCloseDrawer } = usePushNotificationContext();
  const { width: windowWidth } = useWindowDimensions();
  const DRAWER_WIDTH = windowWidth * DRAWER_WIDTH_PERCENT;
  const translateX = useSharedValue(-DRAWER_WIDTH);

  const handleLogoutPress = useCallback(() => {
    Alert.alert(
      'ログアウト',
      '本当にログアウトしますか？',
      [
        { text: 'キャンセル', style: 'cancel' },
        { text: 'ログアウト', onPress: logout }
      ]
    );
  }, [logout]);

  const openDrawer = useCallback(() => {
    translateX.value = withTiming(0, { duration: 250 });
  }, [translateX]);

  const closeDrawer = useCallback(() => {
    translateX.value = withTiming(-DRAWER_WIDTH, { duration: 250 });
  }, [translateX, DRAWER_WIDTH]);

  useEffect(() => {
    setCloseDrawer(() => closeDrawer);
  }, [closeDrawer, setCloseDrawer]);

  const animatedDrawerStyle = useAnimatedStyle(() => {
    const pointerEvents = translateX.value === -DRAWER_WIDTH ? 'none' : 'auto';
    return {
      transform: [{ translateX: translateX.value }],
      pointerEvents,
    };
  });

  const animatedOverlayStyle = useAnimatedStyle(() => {
    const opacity = 1 + translateX.value / DRAWER_WIDTH;
    return {
      opacity,
      pointerEvents: translateX.value === -DRAWER_WIDTH ? 'none' : 'auto',
    };
  });

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" />
        {currentScreen === 'monitor' ? (
          <MonitorPage onMenuPress={openDrawer} />
        ) : (
          <NotificationSettingsPage onBack={() => setCurrentScreen('monitor')} />
        )}

        <Drawer
          onClose={closeDrawer}
          onLogoutPress={handleLogoutPress}
          onNavigateToSettings={() => setCurrentScreen('notifications')}
          drawerWidth={DRAWER_WIDTH}
          animatedDrawerStyle={animatedDrawerStyle}
          animatedOverlayStyle={animatedOverlayStyle}
        />
      </View>
    </GestureHandlerRootView>
  );
}

export function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();
  usePushNotifications(isAuthenticated);

  if (isLoading) {
    return <View style={styles.container} />;
  }

  return (
    <View style={styles.container}>
      {isAuthenticated ? (
        <ScreenWithDrawer />
      ) : (
        <LoginPage />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 100,
  },
});
