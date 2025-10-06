import { TouchableOpacity, Text, View, Alert } from 'react-native';
import type { AlertStatus } from '@core/types/UserCard';
import { useClearAlert } from '@/screens/query';
import { useLoginUser } from '@/hooks/useLoginUser';

type AlertType = 'error' | 'warning';

interface AlertItem {
  name: string;
  date: Date;
}

const alertStyles = {
  error: {
    container: 'bg-red-100 border-red-500',
    text: 'text-red-800',
  },
  warning: {
    container: 'bg-yellow-100 border-yellow-500',
    text: 'text-yellow-800',
  },
};


const sampleAlerts: AlertItem[] = [
  { name: '離床アラート', date: new Date() },
  { name: '離床アラート', date: new Date(Date.now() - 24 * 60 * 60 * 1000) },
  { name: '心拍アラート', date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
];

const formatDate = (date: Date): string => {
  const today = new Date();
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

  if (date.toDateString() === today.toDateString()) {
    return '本日';
  } else if (date.toDateString() === yesterday.toDateString()) {
    return '昨日';
  } else {
    return `${date.getMonth() + 1}/${date.getDate()}`;
  }
};

const formatTime = (date: Date): string => {
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
};

interface AlertBannerProps {
  uid: string,
  rid: number,
  alertStatus: AlertStatus;
  type?: AlertType;
  onDismiss: () => void;
}

const AlertBanner = ({
  uid,
  rid,
  alertStatus,
  type = 'error',
  onDismiss,
}: AlertBannerProps) => {
  const styles = alertStyles[type];
  const clearAlert = useClearAlert();
  const loginUser = useLoginUser();
  const handleClearAlert = async () => {
    try {
      const data = await clearAlert.mutateAsync({ uid, data: { CorpID: loginUser.cid, FacilityID: loginUser.fid, RoomID: rid } });
      if (data.data.Result) {
        onDismiss();
      } else {
        Alert.alert('エラー', 'アラート解除に失敗しました');
      }
    } catch {
      Alert.alert('エラー', 'アラート解除に失敗しました');
    }
  };
  return (
    <View className={`w-full mx-2 p-4 border rounded-md ${styles.container}`}>
      {(sampleAlerts || alertStatus).slice(0, 3).map((alert, index) => (
        <View key={index} className="flex-row justify-between items-center py-1">
          <Text className={`flex-1 ${styles.text}`}>{alert.name}</Text>
          <Text className={`text-xs ${styles.text}`}>{formatDate(alert.date)} {formatTime(alert.date)}</Text>
        </View>
      ))}

      <TouchableOpacity
        className="bg-white border-2 border-red-600 py-3 px-6 rounded-md mt-4 self-center"
        onPress={handleClearAlert}
        accessibilityRole="button"
        accessibilityLabel="アラートを解除"
      >
        <Text className="text-red-600 font-medium">アラート解除</Text>
      </TouchableOpacity>
    </View>
  );
};

export default AlertBanner;