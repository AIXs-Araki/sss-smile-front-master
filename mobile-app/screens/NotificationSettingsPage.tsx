import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Switch, ScrollView, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePusnhNotificaitonGroup, useSavePushNotiGroup, useGroupList } from './query';
import { useLoginUser } from '@/hooks/useLoginUser';

type GroupSettings = {
  [key: string]: boolean | undefined;
};

export function NotificationSettingsPage({ onBack }: { onBack: () => void }) {
  const insets = useSafeAreaInsets();
  const loginUser = useLoginUser();
  const { data: groupData } = usePusnhNotificaitonGroup();
  const { data: groupListData } = useGroupList(loginUser.cid, loginUser.fid);
  const saveMutation = useSavePushNotiGroup();
  const [groupSettings, setGroupSettings] = useState<GroupSettings>({});

  useEffect(() => {
    if (groupData?.data) {
      setGroupSettings({
        Group1: groupData.data.Group1,
        Group2: groupData.data.Group2,
        Group3: groupData.data.Group3,
        Group4: groupData.data.Group4,
        Group5: groupData.data.Group5,
        Group6: groupData.data.Group6,
        Group7: groupData.data.Group7,
        Group8: groupData.data.Group8,
      });
    }
  }, [groupData]);

  const getSelectedCount = () => {
    return Object.values(groupSettings).filter(Boolean).length;
  };

  const handleToggle = (groupKey: string) => {
    const isCurrentlySelected = groupSettings[groupKey];

    // 最後の1つの場合はoffにできない
    if (isCurrentlySelected && getSelectedCount() === 1) {
      return;
    }

    const newValue = !isCurrentlySelected;
    const previousValue = isCurrentlySelected;
    setGroupSettings(prev => ({ ...prev, [groupKey]: newValue }));

    // 保存
    const groupNumber = parseInt(groupKey.replace('Group', ''));
    saveMutation.mutate({
      data: {
        GroupNumber: groupNumber,
        Status: newValue
      }
    }, {
      onError: () => {
        // エラー時は設定を元に戻す
        setGroupSettings(prev => ({ ...prev, [groupKey]: previousValue }));
        Alert.alert('エラー', '設定の保存に失敗しました。もう一度お試しください。');
      }
    });
  };

  const groups = groupListData?.data?.GroupInformation?.map((group: any) => ({
    key: `Group${group.GroupNumber}`,
    name: group.GroupName || `グループ${group.GroupNumber}`
  })) || [];

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <Text style={styles.title}>アラート通知設定</Text>

      <Text style={styles.subtitle}>
        プッシュ通知で<Text style={styles.alertText}>アラート</Text>を受け取るグループを選択してください
      </Text>

      <ScrollView style={styles.groupList}>
        {groups.map(({ key, name }) => {
          const isSelected = groupSettings[key] || false;

          return (
            <Pressable
              key={key}
              style={styles.groupItem}
              onPress={() => handleToggle(key)}
            >
              <Text style={styles.groupName}>
                {name}
              </Text>
              <Switch
                value={isSelected}
                onValueChange={() => handleToggle(key)}
              />
            </Pressable>
          );
        })}
      </ScrollView>

      <Pressable
        style={styles.backButton}
        onPress={onBack}
      >
        <Text style={styles.backButtonText}>戻る</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    paddingTop: 20,
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 30,
    lineHeight: 24,
  },
  alertText: {
    color: '#ff0000',
  },
  groupList: {
    flex: 1,
  },
  groupItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  groupName: {
    fontSize: 18,
    fontWeight: '500',
  },

  backButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});