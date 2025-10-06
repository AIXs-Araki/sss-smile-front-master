import { useState, useEffect, useCallback } from 'react';
import { TiledCardLayout } from "./tiling/TiledCardLayout"
import { sortUserCards, type UserCardData } from "@core/types/UserCard"
import { UserCard, type ImageVersion } from "./UserCard"
import { SelectRoomGroup } from './SelectRoomGroup';
import { SensorStatus } from './SensorStatus';
import { Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ArrowDownWideNarrow } from 'lucide-react';
import { useModal } from "@core/hooks/useModal";
import { SensorGateWayModal } from './modals/SensorGatewayModal';
import { useLoginUser } from '../../hooks/useLoginUser';
import { useUserMatrix, useGroups } from './query';
import { type GetGroupNameMonitor200AllOfGroupInformationItem } from "@core/api/api-generated";
import { useAudio } from '@/components/AudioContext';
import { convertToUserCards } from "@core/model/converter";
// --- Helper functions and data for random generation ---

const groupsToOptions = (groups: GetGroupNameMonitor200AllOfGroupInformationItem[]) => {
  return groups.map(group => ({
    value: String(group.GroupNumber),
    label: group.GroupName || `グループ${group.GroupNumber}`
  }));
};

// アラート種別と音声設定のマッピング
const getAlertSoundNumber = (
  alertStatus: string,
  groupInfo: GetGroupNameMonitor200AllOfGroupInformationItem | undefined
): number => {
  if (!groupInfo) return 1;

  switch (alertStatus) {
    case "Awake":
      return groupInfo.SoundWakeup || 1;
    case "BedExit":
      return groupInfo.SoundGetout || 1;
    case "InBed":
      return groupInfo.SoundLiein || 1;
    case "HeartBeatUpper":
      return groupInfo.SoundHeartRateUpper || 1;
    case "HeartBeatLower":
      return groupInfo.SoundHeartRateLower || 1;
    case "BreathUpper":
      return groupInfo.SoundRespirationUpper || 1;
    case "BreathLower":
      return groupInfo.SoundRespirationLower || 1;
    case "NurseCall":
      return groupInfo.SoundCalling || 1;
    default:
      return 1;
  }
};

export const MonitoringScreen = () => {
  const groupId = useGroupId();
  const [cards, setCards] = useState<UserCardData[]>([]);
  const [isSorting, setIsSorting] = useState(false);
  const [cardsBeforeSort, setCardsBeforeSort] = useState<UserCardData[]>([]);
  const navigate = useNavigate();
  const { cardId } = useParams();
  const user = useLoginUser();
  const sensorGatewayModal = useModal()
  const [bedImageVersion, setBedImageVersion] = useState<ImageVersion>(8);
  const { setSoundSrc } = useAudio();
  const groups = useGroups(user.cid, user.fid);
  const currentGroup = groups.data?.data.GroupInformation?.find(g => g.GroupNumber === groupId);

  // 現在選択されているカードを動的に取得
  const selectedCard = cardId ? cards.find((c) => c.id === Number(cardId)) || null : null;


  // 毎分データを取得するクエリ
  const { data: matrixData } = useUserMatrix(user.cid, user.fid, groupId, {
    query: {
      // 1. 1分おきにクエリを自動実行する
      refetchInterval: 60 * 1000,
      // 2. 取得に失敗した場合、1回だけリトライする
      retry: 1,
      // 3. リトライする前に5秒待つ
      retryDelay: 0,
      refetchIntervalInBackground: true,
      refetchOnWindowFocus: false
    }
  })


  const data = matrixData?.data;

  useEffect(() => {
    if (data && data.DataList) {
      const convertedCards = convertToUserCards(data.DataList, groupId, new Date(data.MeasurementTime!));

      // アラートが検知された場合、音声を設定
      const alertCards = convertedCards.filter(card => card.alertStatus !== "None");
      if (alertCards.length > 0 && currentGroup) {
        // 最初のアラートの音声設定を使用
        const soundNumber = getAlertSoundNumber(alertCards[0].alertStatus, currentGroup);
        setSoundSrc(`/sounds/${soundNumber.toString().padStart(2, '0')}.mp3`);
      }

      setCards(convertedCards);
    }
  }, [data, groupId, currentGroup, setSoundSrc]);

  const handleStartSort = useCallback(() => {
    setCardsBeforeSort(cards);
    setIsSorting(true);
  }, [cards]);

  const handleSaveSort = useCallback(() => {
    // TODO call api
    setIsSorting(false);
  }, []);

  const handleCancelSort = useCallback(() => {
    setCards(cardsBeforeSort);
    setIsSorting(false);
  }, [cardsBeforeSort]);

  const handleResetSort = useCallback(() => {
    const sorted = sortUserCards(cards, []);
    // TODO api call
    setCards(sorted);
  }, [cards]);

  const handleCardClick = useCallback((card: UserCardData) => {
    if (isSorting) {
      return;
    }
    navigate(`/monitor/${card.groupId}/card/${card.id}`)
    //    modal.open({ card });
  }, [isSorting, navigate]);

  const renderCard = useCallback((card: UserCardData, gridSize: number) => (
    <div className="w-full h-full" onClick={(e) => e.stopPropagation()}>
      <UserCard
        gridSize={gridSize}
        card={card}
        onClick={handleCardClick}
        isSelected={card.id === selectedCard?.id}
        bedImageVersion={bedImageVersion}
      />
    </div>
  ), [handleCardClick, selectedCard, bedImageVersion])

  const handleClickOutside = useCallback(() => {
    navigate(`/monitor/${groupId}`);
  }, [navigate, groupId]);

  return (
    <>
      <div className="flex flex-col" style={{ height: "calc( 100vh - 60px)" }} onClick={handleClickOutside}>
        <div className="h-12 max-w-full">
          <Control
            isSorting={isSorting}
            onStartSort={handleStartSort}
            onSaveSort={handleSaveSort}
            onCancelSort={handleCancelSort}
            onResetSort={handleResetSort}
            onOpenSensor={() => sensorGatewayModal.open()}
            onChangeBedImageVersion={setBedImageVersion}
            setCards={setCards}
          />
        </div>
        <div key={groupId} className="flex-1 no-print">
          <TiledCardLayout
            cards={cards}
            setCards={setCards}
            isSorting={isSorting}
            renderCard={renderCard}
          />
        </div>
      </div>
      <Outlet context={{ card: selectedCard }} />
      <SensorGateWayModal {...sensorGatewayModal.props} />
    </>
  );
};

const useGroupId = () => {
  const location = useLocation();
  const groupId = location.pathname.split('/')[2];
  return Number(groupId);
}

interface ControlProps {
  isSorting: boolean;
  onStartSort: () => void;
  onSaveSort: () => void;
  onCancelSort: () => void;
  onResetSort: () => void;
  onOpenSensor: () => void;
  onChangeBedImageVersion: React.Dispatch<React.SetStateAction<ImageVersion>>;
  setCards: React.Dispatch<React.SetStateAction<UserCardData[]>>;
}


const Control = ({ isSorting, onStartSort, onSaveSort, onCancelSort, onResetSort, onOpenSensor, setCards }: ControlProps) => {
  const groupId = useGroupId();
  const buildDate = import.meta.env.VITE_APP_BUILD_DATE;
  const user = useLoginUser();
  const { setSoundSrc } = useAudio();

  const groups = useGroups(user.cid, user.fid);
  const currentGroup = groups.data?.data.GroupInformation?.find(g => g.GroupNumber === groupId);

  const handleAlert = useCallback(() => {
    setCards(prevCards => {
      const noneAlertCards = prevCards.filter(card => card.alertStatus === "None");
      if (noneAlertCards.length === 0) return prevCards;

      const randomCard = noneAlertCards[Math.floor(Math.random() * noneAlertCards.length)];
      const alertStatuses = ["HeartBeatUpper", "BreathUpper", "Awake", "InBed", "BedExit", "NurseCall"] as const;
      const randomAlertStatus = alertStatuses[Math.floor(Math.random() * alertStatuses.length)];

      // アラート発生時に音声を設定
      if (currentGroup) {
        const soundNumber = getAlertSoundNumber(randomAlertStatus, currentGroup);
        setSoundSrc(`/sounds/${soundNumber.toString().padStart(2, '0')}.mp3`);
      }

      return prevCards.map(card =>
        card.id === randomCard.id
          ? { ...card, alertStatus: randomAlertStatus }
          : card
      );
    });
  }, [setCards, currentGroup, setSoundSrc]);

  return (
    <div className="relative h-full">
      <div className="flex justify-between px-4 pt-3 h-full">
        <div className="flex items-center gap-2">
          <div>グループ</div>
          <SelectRoomGroup options={groupsToOptions(groups.data?.data.GroupInformation || [])} />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleAlert}>
            アラート
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="w-8 h-8">
                <ArrowDownWideNarrow className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onStartSort}>並び替え</DropdownMenuItem>
              <DropdownMenuItem onClick={onResetSort}>並び順をリセット</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="text-xs">計測日時: {buildDate}</div>
          <div><SensorStatus alert={+groupId === 7} onOpenSensor={onOpenSensor} /></div>
        </div>
      </div>
      {isSorting && (
        <div className="absolute inset-0 bg-gray-700/50 bg-opacity-50 z-10 flex justify-center items-center backdrop-blur ">
          <div className="flex items-center gap-4">
            <Button onClick={onSaveSort}>並び順を保存</Button>
            <Button variant="secondary" onClick={onCancelSort}>キャンセル</Button>
          </div>
        </div>
      )}
    </div>
  );
};
