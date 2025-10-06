import { FullscreenModal, type ClosableModalProps } from '@/components/Modal';
import { UserHeaderForModal } from '@/components/UserHeader';
import { format, subDays } from 'date-fns';
import { WeeklyActivityChart } from './WeeklyAlert';
import { HourlyChart } from './HourlyChart';
import { DailyChart } from './DailyChart';
import { BlockHeader } from './BlockHeader';
import { AlertHistory } from './AlertHistory';
import type { UserCardData } from '@core/types/UserCard';
import { useUserId } from './helper';

type Props = {
  card: UserCardData
} & Omit<ClosableModalProps, "title">


export const UserGraphModal = (props: Props) => {
  const uid = useUserId();
  return (
    <>
      <FullscreenModal
        {...props}
        title={"グラフ一覧"}
        customStyle={{}}
        framePanelClassName='w-full sm:max-w-full'
        renderButtons={() => {
          return null
        }}
      >
        <div className="flex flex-col overflow-y-scroll hide-scrollbar" style={{ height: "calc( 100vh - 108px)" }} >
          <UserHeaderForModal card={props.card} />
          <div key={1} className="flex-grow w-full flex gap-4" style={{}}>
            <div className="flex flex-col gap-4" style={{ width: "55%", height: "calc( 100vh - 176px)" }}>
              <div className="bg-white px-2 flex flex-col flex-1">
                <HourlyChart uid={uid} enabled={!!uid && props.open} />
              </div>
              <div className="bg-white px-2 flex flex-col flex-1">
                <DailyChart uid={uid} enabled={!!uid && props.open} />
              </div>
            </div>
            <div className="flex flex-col gap-2" style={{ width: "45%", height: "calc( 100vh - 176px)" }}>
              <div className="bg-white flex flex-col flex-1">
                <BlockHeader time={`${format(subDays(new Date(), 7), 'yyyy/MM/dd')} - ${format(subDays(new Date(), 1), 'yyyy/MM/dd')}`} title="過去１週間の体動状態" style={{ paddingLeft: 55, paddingRight: 15 }} />
                <WeeklyActivityChart currentTime={new Date()} />
              </div>

              <div className="bg-white px-2 flex flex-col flex-1">
                <AlertHistory />
              </div>
            </div>

          </div>
        </div>
      </FullscreenModal>
    </>
  );
};
