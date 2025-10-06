import { useEffect, useState, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { useSendPushNotificationToken } from '@/screens/query';
import { getPersistentDeviceId } from '@/lib/getDeviceId';
import { usePushNotificationContext } from '@/contexts/PushNotificationContext';
import { Platform } from 'react-native';

// フォアグラウンド時の通知表示設定
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true, // Display a visual alert
    shouldShowBanner: true, // (iOS) 通知バナーを表示するかどうか
    shouldShowList: true,   // (iOS) 通知センターに表示するかどうか
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

if (Platform.OS === 'android') {
  Notifications.setNotificationChannelAsync('alert', {
    name: 'Alert',
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250], // バイブレーションのパターン
    lightColor: '#FF231F7C', // LEDライトの色 (対応デバイスのみ)
  });
}
export function usePushNotifications(isAuthenticated: boolean) {
  const sendPushNotificationToken = useSendPushNotificationToken();
  const { setPendingRoom, closeDrawer } = usePushNotificationContext();
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const notificationListener = useRef<Notifications.Subscription>(null);
  const responseListener = useRef<Notifications.Subscription>(null);

  useEffect(() => {
    async function getAndSendPushToken() {
      try {
        // 1. 通知許可を求める
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }

        if (finalStatus !== 'granted') {
          console.log('Failed to get push token! Permission not granted.');
          return;
        }

        // 2. デバイストークンを取得
        const token = (await Notifications.getDevicePushTokenAsync()).data;

        // 3. トークンをバックエンドに送信
        const deviceId = await getPersistentDeviceId()
        await sendPushNotificationToken.mutateAsync({ data: { ID: deviceId, PushKey: token } });

      } catch (error) {
        console.error('Error in getting or sending push token:', error);
      }
    }
    // ログイン済みの場合のみ処理を実行
    if (isAuthenticated) {
      getAndSendPushToken();
    }
  }, [isAuthenticated]);

  // プッシュ通知タップハンドリング
  useEffect(() => {
    const processNotification = (response: Notifications.NotificationResponse) => {
      const content = response.notification.request.content;
      const trigger = response.notification.request.trigger as any;
      const roomId = content.data?.id || trigger?.payload?.aps?.data?.id;
      const groupNumber = content.data?.group || trigger?.payload?.aps?.data?.group;

      if (roomId && isAuthenticated) {
        closeDrawer?.();
        setPendingRoom({ roomId: String(roomId), groupNumber: Number(groupNumber) });
      }
    };

    // フォアグラウンド時の通知受信リスナー
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    // 通知タップリスナー
    responseListener.current = Notifications.addNotificationResponseReceivedListener(processNotification);

    // アプリ起動時に最後の通知レスポンスをチェック
    if (isAuthenticated) {
      const response = Notifications.getLastNotificationResponse();
      if (response) {
        const roomId = response.notification.request.content.data?.id;
        const groupNumber = response.notification.request.content.data?.group;
        if (roomId) {
          setPendingRoom({ roomId: String(roomId), groupNumber: Number(groupNumber) });
        }
      }
    }
    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, [isAuthenticated, setPendingRoom, closeDrawer]);
}

