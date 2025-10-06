import { isAlert, UserCardData } from '@core/types/UserCard';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { Button, Platform, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import * as Notifications from 'expo-notifications';
import { FlatList } from 'react-native-gesture-handler';
import Modal from "react-native-modal";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { UserCard } from '../components/UserCard';
import UserDetail from '../components/UserDetail';
import { useGroupList, useUserMatrix } from './query';
import { useLoginUser } from '../hooks/useLoginUser';
import { GetGroupNameMonitor200AllOfGroupInformationItem } from '@core/api/api-generated';
import { convertToUserCards } from "@core/model/converter";
import { useNativationBarWhite } from '@/hooks/useNavigationBarWhite';
import { STORAGE_KEY, useGroup } from '@/hooks/useGroup';
import { usePushNotificationContext } from '@/contexts/PushNotificationContext';



interface MonitorPageProps {
  onMenuPress: () => void;
}

export function MonitorPage({ onMenuPress }: MonitorPageProps) {
  const loginUser = useLoginUser()
  useNativationBarWhite()
  const { defaultGroup } = useGroup();
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top, marginBottom: insets.bottom }}>
      <MonitorContent loginUser={loginUser} defaultGroup={defaultGroup || 1} onMenuPress={onMenuPress} />
    </View>
  );
}

function MonitorContent({ loginUser, defaultGroup, onMenuPress }: { loginUser: ReturnType<typeof useLoginUser>, defaultGroup: number | null, onMenuPress: () => void }) {
  const groupQuery = useGroupList(loginUser.cid, loginUser.fid, { query: { enabled: defaultGroup !== null } })

  if (groupQuery.isLoading || defaultGroup === null) {
    return <Text className="p-4">Loading...</Text>
  }

  if (groupQuery.isError || !groupQuery.data?.data?.GroupInformation) {
    return <Text className="p-4 text-red-500">データの読み込みに失敗しました</Text>
  }

  const groups = groupQuery.data.data.GroupInformation
  return <MonitorPageInner groups={groups} defaultGroup={defaultGroup} loginUser={loginUser} onMenuPress={onMenuPress} />
}

function MonitorPageInner({ groups, defaultGroup, loginUser, onMenuPress }: { defaultGroup: number, groups: GetGroupNameMonitor200AllOfGroupInformationItem[], loginUser: ReturnType<typeof useLoginUser>, onMenuPress: () => void }) {
  const [isAlertFilterOn, setIsAlertFilterOn] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<UserCardData | null>(null);
  const [isGroupSelectorVisible, setIsGroupSelectorVisible] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<number>(defaultGroup || 1);
  const [cards, setCards] = useState<UserCardData[]>([]);
  const pushContext = usePushNotificationContext();
  const { pendingRoom, setPendingRoom } = pushContext;


  useEffect(() => {
    const processNotification = (response: any) => {
      const content = response.notification.request.content;
      const trigger = response.notification.request.trigger as any;

      let roomId: string | undefined;
      let groupNumber: number | undefined;

      if (content.data?.id) {
        roomId = content.data.id;
        groupNumber = content.data.group ? parseInt(content.data.group) : undefined;
      }

      if (!roomId && trigger?.payload?.id) {
        roomId = trigger.payload.id;
        groupNumber = trigger.payload.group ? parseInt(trigger.payload.group) : undefined;
      }

      if (roomId && groupNumber) {
        setPendingRoom({ roomId, groupNumber });
      }
    };

    const checkLastNotification = async () => {
      try {
        const lastNotificationResponse = await Notifications.getLastNotificationResponseAsync();
        if (lastNotificationResponse) {
          processNotification(lastNotificationResponse);
        }
      } catch (error) {
        console.error(error);
      }
    };

    checkLastNotification();

    const subscription = Notifications.addNotificationResponseReceivedListener(processNotification);
    return () => subscription.remove();
  }, [setPendingRoom]);
  const { data: matrixData, refetch } = useUserMatrix(loginUser.cid, loginUser.fid, selectedGroup, {})

  const handleRefresh = () => {
    refetch();
  };
  const data = matrixData?.data;

  useEffect(() => {
    if (data && data.DataList) {
      const convertedCards = convertToUserCards(data.DataList, selectedGroup, new Date(data.MeasurementTime!));
      setCards(convertedCards);
    }
  }, [data, selectedGroup,]);

  useEffect(() => {
    if (pendingRoom && pendingRoom.groupNumber >= 1 && pendingRoom.groupNumber <= 8 && pendingRoom.groupNumber !== selectedGroup) {
      handleSelectGroup(pendingRoom.groupNumber);
    }
  }, [pendingRoom, selectedGroup]);

  useEffect(() => {
    if (pendingRoom && cards.length > 0 && selectedGroup === pendingRoom.groupNumber) {
      const isCorrectGroupCards = cards.some(card => {
        const cardGroupNumber = Math.floor(card.id / 100);
        return cardGroupNumber === pendingRoom.groupNumber;
      });

      if (!isCorrectGroupCards) return;

      const targetCard = cards.find(card => card.id.toString() === pendingRoom.roomId);
      if (targetCard) {
        setSelectedRoom(targetCard);
        setTimeout(() => setPendingRoom(null), 100);
      } else {
        setPendingRoom(null);
      }
    }
  }, [cards, pendingRoom, selectedGroup, setPendingRoom]);

  // Save group on change
  const handleSelectGroup = async (groupValue: number) => {
    try {
      setSelectedGroup(groupValue);
      await AsyncStorage.setItem(STORAGE_KEY, groupValue.toString());
      setIsGroupSelectorVisible(false);
    } catch (e) {
      console.error('Failed to save group.', e);
    }
  };

  const filteredRooms = cards.filter(card => !isAlertFilterOn || isAlert(card));

  const handleCardPress = (room: UserCardData) => {
    setSelectedRoom(room);
  };



  const handleCloseModal = () => {
    setSelectedRoom(null);
  };

  return (
    <View className="flex-1">
      {/* Header */}
      <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
        <TouchableOpacity onPress={onMenuPress} className="p-2">
          <Feather name="menu" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-lg font-bold">施設A</Text>
        <TouchableOpacity onPress={handleRefresh} className="p-2">
          <Feather name="refresh-cw" size={24} color="black" />
        </TouchableOpacity>
      </View>

      {/* Controls */}
      <View className="p-4 flex-row items-center justify-between">
        <TouchableOpacity onPress={() => setIsGroupSelectorVisible(true)} className="p-2 bg-gray-200 rounded-md">
          <Text className="font-semibold">{groups?.find(g => g.GroupNumber === selectedGroup)?.GroupName}</Text>
        </TouchableOpacity>

        <View className="flex-row items-center">
          <Text className="mr-2 text-gray-600">アラートのみ表示</Text>
          <Switch
            trackColor={{ false: "#767577", true: Platform.OS === 'android' ? '#81b0ff' : '#34C759' }}
            thumbColor={"#f4f3f4"}
            ios_backgroundColor="#E9E9EA"
            onValueChange={() => setIsAlertFilterOn(previousState => !previousState)}
            value={isAlertFilterOn}
          />
        </View>
      </View>

      {/* Room List */}
      <FlatList
        data={filteredRooms}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleCardPress(item)}>
            <View className="px-4 py-1">
              <UserCard card={item} border={true} />
            </View>
          </TouchableOpacity>
        )}
        keyExtractor={item => item.id.toString()}
        className="flex-1"
      />

      {selectedRoom && (
        <UserDetail
          card={selectedRoom}
          onClose={handleCloseModal}
        />
      )}

      {/* Group Selector Modal */}
      <Modal
        isVisible={isGroupSelectorVisible}
        onBackdropPress={() => setIsGroupSelectorVisible(false)}
        animationIn="fadeIn"
        animationOut="fadeOut"
        backdropTransitionOutTiming={0}
      >
        <View style={styles.modalOverlay}>
          <View className="bg-white rounded-lg p-4 w-4/5">
            <Text className="text-lg font-bold mb-4">グループを選択</Text>
            {groups.map(group => (
              <TouchableOpacity
                key={group.GroupNumber}
                onPress={() => handleSelectGroup(group.GroupNumber!)}
                className="p-3 border-b border-gray-200"
              >
                <Text>{group.GroupName}</Text>
              </TouchableOpacity>
            ))}
            <Button title="キャンセル" onPress={() => setIsGroupSelectorVisible(false)} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  detailModal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
});
