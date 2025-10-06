import { isAlert, UserCardData } from '@core/types/UserCard';
import { useEffect, useMemo } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector, Pressable, ScrollView } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from 'react-native-reanimated';
import AlertBanner from './AlertBanner';
import { UserCard } from './UserCard';
import ActivityStatusBar from './user-detail/ActivityStatusBar';
import { Chart, DataPoint } from './user-detail/Chart';
import { useUserDetail } from '@/screens/query';
import { useLoginUser } from '@/hooks/useLoginUser';
import { convertToAlerts, convertToChartData } from '@core/model/chartDataConverter';

interface UserDetailProps {
  card: UserCardData | null;
  onClose: () => void;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const CLOSE_THRESHOLD = SCREEN_HEIGHT / 4;

export default function UserDetail({ card, onClose }: UserDetailProps) {

  const loginUser = useLoginUser();
  const userQuery = useUserDetail(card?.uid!, { CorpID: loginUser.cid, FacilityID: loginUser.fid }, { query: { enabled: !!card && !!card.uid } });

  const translateY = useSharedValue(SCREEN_HEIGHT);
  const context = useSharedValue({ y: 0 });

  // 表示アニメーション: コンポーネントがマウントされたら画面内にスライドイン
  useEffect(() => {
    translateY.value = withTiming(0, { duration: 300 });
  }, [translateY]);

  // 閉じるアニメーションを実行し、完了後onCloseコールバックを呼ぶ関数
  const closeModal = () => {
    'worklet';
    translateY.value = withTiming(SCREEN_HEIGHT, { duration: 300 }, () => {
      runOnJS(onClose)();
    });
  };

  // AlertBanner用の閉じる関数（workletではない）
  const handleModalClose = () => {
    translateY.value = withTiming(SCREEN_HEIGHT, { duration: 300 }, () => {
      runOnJS(onClose)();
    });
  };

  const panGesture = Gesture.Pan()
    .onStart((_) => {
      'worklet';
      context.value.y = translateY.value;
    })
    .onUpdate((event) => {
      'worklet';
      translateY.value = context.value.y + event.translationY;
      translateY.value = Math.max(translateY.value, 0); // 上にはスワイプさせない
    })
    .onEnd((event) => {
      'worklet';
      if (event.translationY > CLOSE_THRESHOLD || event.velocityY > 500) {
        closeModal();
      } else {
        translateY.value = withTiming(0, { duration: 200 });
      }
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });


  if (!card) {
    return null;
  }

  if (userQuery.isLoading) {
    return (
      <View style={styles.backdrop}>
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <Text>データを読み込み中...</Text>
        </View>
      </View>
    );
  }

  if (userQuery.isError) {
    return (
      <View style={styles.backdrop}>
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <Text>データの読み込みに失敗しました</Text>
        </View>
      </View>
    );
  }

  return (

    <>
      {/* 背景の黒いオーバーレイ。タップで閉じられる */}
      <Pressable onPress={handleModalClose} style={styles.backdrop} />

      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.container, animatedStyle]}>
          {/* ジェスチャーを受け取る領域 */}
          <Animated.View className="w-full items-center pt-3 pb-2 bg-white rounded-t-2xl">
            <View className="w-12 h-1.5 bg-gray-300 rounded-full" />
            <UserDetailContent card={card} border={false} />
          </Animated.View>
          <View className="">
          </View>
          <ScrollView style={styles.scrollView}>
            {isAlert(card) &&
              <View className="pt-3 pb-6 px-12">
                <AlertBanner alertStatus={card.alertStatus} onDismiss={handleModalClose} rid={card.roomId} uid={card.uid} />
              </View>
            }
            <ActivityStatusBarSection userData={userQuery.data} />
            <HeartRateChart userData={userQuery.data} />
            <RespirationChart userData={userQuery.data} />
          </ScrollView>
        </Animated.View>

      </GestureDetector>
    </>
  );
}

const UserDetailContent = (props: { card: UserCardData, border: boolean }) => {
  return <View>
    <UserCard card={props.card} border={props.border} />
  </View>
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 50,
  },
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '93%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  scrollView: {
    paddingTop: 20,
    flexShrink: 1,

  },
  handleArea: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  handleBar: {
    width: 48,
    height: 6,
    backgroundColor: '#D1D5DB',
    borderRadius: 3,
  },
});



const HeartRateChart = ({ userData }: { userData?: any }) => {
  const heartRateData = useMemo(() => {
    const data = userData?.data || userData;
    if (!data?.HeartRateSummary) return [];
    return convertToChartData(data.HeartRateSummary);
  }, [userData]);

  const heartRateConfig = {
    title: '心拍',
    unit: 'bpm',
    lineColor: '#ef4444', // red-500
    defaultMaxY: 200,
    abnormalRanges: {
      high: { threshold: 120, color: 'rgba(239, 68, 68, 0.1)', label: '頻脈' },
      low: { threshold: 40, color: 'rgba(239, 68, 68, 0.1)', label: '徐脈' },
    },
  };

  return <Chart data={heartRateData} {...heartRateConfig} yAxisTicks={[50, 100, 150, 200]} />;
};


/**
 * 呼吸グラフ専用コンポーネント
 */
const RespirationChart = ({ userData }: { userData?: any }) => {
  const respirationData = useMemo(() => {
    const data = userData?.data || userData;
    if (!data?.RespirationRateSummary) return [];
    return convertToChartData(data.RespirationRateSummary);
  }, [userData]);

  // 呼吸グラフ用のデータと設定
  const respirationConfig = {
    title: '呼吸',
    unit: '回/分',
    lineColor: '#3b82f6', // blue-500
    defaultMaxY: 40,
    abnormalRanges: {
      high: { threshold: 30, color: 'rgba(59, 130, 246, 0.1)', label: '頻呼吸' },
      low: { threshold: 10, color: 'rgba(59, 130, 246, 0.1)', label: '徐呼吸' },
    },
  };

  return <Chart data={respirationData} {...respirationConfig} yAxisTicks={[10, 20, 30, 40]} />;
};

const ActivityStatusBarSection = ({ userData }: { userData?: any }) => {
  const { statuses, alerts } = useMemo(() => {
    const data = userData?.data || userData;
    if (!data?.MeasurementStatusSummary) return { statuses: [], alerts: [] };
    return convertToAlerts(data.MeasurementStatusSummary);
  }, [userData]);

  return (
    <View className="pl-14 pr-4 relative">
      <View className="absolute" style={{ left: 22, top: -20 }}>
        <Text className="font-bold">状態</Text>
      </View>
      <ActivityStatusBar
        alerts={statuses}
        currentTime={new Date()}
        showMarker={true}
        showTimeMarkers={true}
      />
    </View>
  );
};
