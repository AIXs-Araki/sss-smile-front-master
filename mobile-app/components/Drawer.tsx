import { Image, Pressable, Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import Constants from 'expo-constants';
import Animated, { AnimatedStyle } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import "../global.css";

const buildDate = Constants.expoConfig?.extra?.buildDate;
const displayDate = buildDate
  ? new Date(buildDate).toLocaleString('ja-JP') // 'ja-JP'ロケールで表示
  : '取得不可';

export function Drawer({ onClose, onLogoutPress, onNavigateToSettings, drawerWidth, animatedDrawerStyle, animatedOverlayStyle }: {
  onClose: () => void;
  onLogoutPress: () => void;
  onNavigateToSettings: () => void;
  drawerWidth: number;
  animatedDrawerStyle: AnimatedStyle;
  animatedOverlayStyle: AnimatedStyle;
}) {
  const insets = useSafeAreaInsets();

  const handleNotificationSettings = () => {
    onClose();
    onNavigateToSettings();
  };

  return (
    <Animated.View style={[styles.overlay, animatedOverlayStyle]}>
      <Pressable onPress={onClose} style={StyleSheet.absoluteFillObject}>
        <Animated.View style={[styles.drawer, { width: drawerWidth }, animatedDrawerStyle]}>
          <View className="p-8 flex flex-col justify-between" style={{ height: "100%", paddingTop: insets.top + 32, paddingBottom: insets.bottom }}>
            <View>
              <Image
                source={require('../assets/hitsuji-logo.png')}
                resizeMode="contain"
                style={{ width: 130, marginBottom: 0, height: 40 }}
              />
              <View className="pt-10 flex flex-col gap-2">
                <TouchableOpacity onPress={onLogoutPress} className="flex-row items-center p-4 border rounded-xl justify-around">
                  <Text className="text-lg font-semibold">ログアウト</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleNotificationSettings} className="flex-row items-center p-4 border rounded-xl justify-around">
                  <Text className="text-lg font-semibold">アラート通知設定</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View>
              <Text className="text-xs text-gray-300">アプリバージョン:</Text>
              <Text className="text-sm text-gray-400">{displayDate}</Text>
            </View>
          </View>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  drawer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'white',
    zIndex: 1000,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: -5,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 5,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 100,
  },
});