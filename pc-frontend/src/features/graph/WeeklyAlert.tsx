import React, { useState, useMemo } from 'react';
import { ALERT_COLOR_MAP, } from '../monitor/modals/parts/ActivityStatusBar';
import { mapMeasurementStatusToBedStatus, type BedStatus } from '@core/types/UserCard';
import { AlertBar } from './AlertBar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import type { BedStatusHistory } from '@core/model/chart.type';
import { useGraph } from '../print/query';
import type { GetUserDataGraphMonitor200AllOfSummaryDataListItem } from '@core/api/api-generated';
import { useLocation } from 'react-router-dom';
import { useLoginUser } from '@/hooks/useLoginUser';
import { renderWhenFetched } from '@/lib/loading';
import { mergeConsecutiveStatuses } from './helper';

type ViewMode = 'mutation_day' | 'mutation_night' | 'cumulative';

interface WeeklyAlertChartProps {
  // alerts: BedStatusHistory[];
  currentTime: Date;
}

const useUserId = () => {
  const location = useLocation();
  const userId = (location.pathname.split('/')[4]);
  console.log({ userId })
  return userId;
}


// 1日のミリ秒数
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

/**
 * 過去7日間のアラート状況を表示するグラフコンポーネント
 */
export const WeeklyActivityChart: React.FC<WeeklyAlertChartProps> = ({ currentTime }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('mutation_day');
  const [openPopoverId, setOpenPopoverId] = useState<string | null>(null);
  const loginUser = useLoginUser()

  const uid = useUserId();
  const weeklyGraphQuery = useGraph(uid, { CorpID: loginUser.cid, FacilityID: loginUser.fid }, { query: { enabled: !!uid } });

  const alerts = useMemo(() => {
    return weeklyGraphQuery.data?.data.SummaryDataList ? convertToWeeklyStatuses(weeklyGraphQuery.data.data.SummaryDataList, new Date()) : [];
  }, [weeklyGraphQuery.data?.data.SummaryDataList]);

  // useMemoを使用して、alerts, currentTime, viewModeが変更された時のみデータを再計算
  const weeklyData = useMemo(() => {
    // 表示モードに応じて、グラフの各行が表す24時間の開始時刻を定義する
    const timeWindows: Date[] = [];

    if (viewMode === 'mutation_night') {
      // --- 変異表示 夜基準の時間枠を生成 ---
      // 7本のグラフバー（[7日前 12:00 ~ 6日前 11:59], ..., [昨日 12:00 ~ 今日 11:59]）
      for (let i = 6; i >= 0; i--) {
        const day = new Date(currentTime);
        // 開始日を（今日から i+1 日前）に設定
        day.setDate(day.getDate() - (i + 2));
        // 開始時刻を12:00（正午）に設定
        day.setHours(12, 0, 0, 0);
        timeWindows.push(day);
      }
    } else {
      // --- 通常表示（変異・累積）の時間枠を生成 ---
      // 7本のグラフバー（[6日前 0:00 ~ 5日前 23:59], ..., [今日 0:00 ~ 今日 23:59]）
      for (let i = 6; i >= 0; i--) {
        const day = new Date(currentTime);
        day.setDate(day.getDate() - (i + 1));
        day.setHours(0, 0, 0, 0);
        timeWindows.push(day);
      }
    }

    // --- 生成された時間枠を元にチャートデータを計算 ---
    return timeWindows.map(dayStart => {
      const dayEnd = new Date(dayStart.getTime() + ONE_DAY_MS);

      // 各時間枠（24時間）に含まれるアラートをフィルタリング
      const alertsForDay = alerts.filter(
        alert => alert.startTime < dayEnd && alert.endTime > dayStart
      );

      let segments: {
        id: string;
        left?: string;
        right?: string;
        width: string;
        color: string;
        type: BedStatus;
        startTime: Date;
        endTime: Date;
      }[] = [];

      if (viewMode === 'mutation_day' || viewMode === 'mutation_night') {
        // --- 変異表示のロジック（昼・夜共通） ---
        // dayStartとdayEndが適切に設定されていれば、描画位置の計算ロジックは同じ
        segments = alertsForDay.map(alert => {
          const start = Math.max(alert.startTime.getTime(), dayStart.getTime());
          const end = Math.min(alert.endTime.getTime(), dayEnd.getTime());

          const left = ((start - dayStart.getTime()) / ONE_DAY_MS) * 100;
          const width = ((end - start) / ONE_DAY_MS) * 100;
          return {
            id: `${alert.id}-${dayStart.getTime()}`,
            left: `${left}%`,
            width: `${width}%`,
            color: ALERT_COLOR_MAP[alert.type],
            type: alert.type,
            startTime: alert.startTime,
            endTime: alert.endTime,
          };
        });
      } else {
        // --- 累積表示のロジック ---
        const totalDurations: Record<BedStatus, number> = { bedexit: 0, moving: 0, offline: 0, resting: 0 };

        alertsForDay.forEach(alert => {
          const start = Math.max(alert.startTime.getTime(), dayStart.getTime());
          const end = Math.min(alert.endTime.getTime(), dayEnd.getTime());
          totalDurations[alert.type] += (end - start);
        });

        let currentLeft = 0;
        const cumulativeSegments: {
          id: string;
          right: string;
          width: string;
          color: string;
          duration: number;
          type: BedStatus;
        }[] = [];

        (['offline', 'bedexit', 'moving', 'resting'] as BedStatus[]).forEach(type => {
          if (totalDurations[type] > 0) {
            const width = (totalDurations[type] / ONE_DAY_MS) * 100;
            cumulativeSegments.push({
              id: `${type}-${dayStart.getTime()}`,
              right: `${currentLeft}%`,
              width: `${width}%`,
              color: ALERT_COLOR_MAP[type],
              duration: totalDurations[type],
              type,
            });
            currentLeft += width;
          }
        });
        segments = cumulativeSegments.map(s => ({ ...s, startTime: new Date(0), endTime: new Date(s.duration) }));
      }
      const displayDate =
        viewMode === 'mutation_night'
          ? new Date(dayStart.getTime()) // Add 12 hours
          : dayStart;
      return {
        date: displayDate,
        segments,
      };
    });
  }, [alerts, currentTime, viewMode]);

  return renderWhenFetched(weeklyGraphQuery, { width: "100%", height: 100 }, () => (
    <div className="p-4 font-sans flex flex-col">


      <div className="flex gap-4">
        {/* --- Y軸 (日付) --- */}
        <div className="flex flex-col gap-y-2 text-xs text-gray-500 shrink-0">
          {weeklyData.map(({ date }) => (
            <div key={date.getTime()} className="h-5 flex items-center relative" style={{ top: 0 }}>
              {date.toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' })}
            </div>
          ))}
        </div>

        {/* --- グラフ本体 --- */}
        <div className="w-full">
          {/* --- 各日のバー --- */}
          <div className="flex flex-col gap-y-2 border-l border-gray-300 border-r">
            {weeklyData.map(({ date, segments }) => (
              <div key={date.getTime()} className="relative h-5 w-full bg-blue-400 ">
                {viewMode === 'cumulative'
                  ? segments.map(seg => (
                    <Popover key={seg.id} open={openPopoverId === seg.id}>
                      <PopoverTrigger asChild>
                        <div
                          onMouseEnter={() => setOpenPopoverId(seg.id)}
                          onMouseLeave={() => setOpenPopoverId(null)}
                          className={`absolute h-full ${seg.color} rounded-none cursor-pointer`}
                          style={{ right: seg.right, width: seg.width }}
                        />
                      </PopoverTrigger>
                      <PopoverContent
                        onMouseEnter={() => setOpenPopoverId(seg.id)}
                        onMouseLeave={() => setOpenPopoverId(null)}
                        className="w-auto p-2 text-xs"
                      >
                        <div className="flex flex-col gap-1">
                          <div>{seg.type}</div>
                          <div>
                            {`合計: ${format(new Date(seg.endTime.getTime() - new Date(0).getTime()), "HH:mm:ss")}`}
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  ))
                  : segments.map(seg => (
                    <AlertBar
                      key={seg.id}
                      segment={seg}
                      open={openPopoverId === seg.id}
                      onMouseEnter={() => setOpenPopoverId(seg.id)}
                      onMouseLeave={() => setOpenPopoverId(null)}
                    />
                  ))}
              </div>
            ))}
          </div>

          <div className="relative w-full mt-1 text-xs text-gray-500 flex justify-between">
            {viewMode === "mutation_night" ? <TimescaleNight /> : <TimescaleDay />}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 mb-4 mx-auto">
        <button
          onClick={() => setViewMode('mutation_day')}
          className={`px-3 py-1 text-sm rounded ${viewMode === 'mutation_day' ? 'bg-gray-800 text-white' : 'bg-gray-200'}`}
        >
          変異表示(昼基準)
        </button>
        <button
          onClick={() => setViewMode('mutation_night')}
          className={`px-3 py-1 text-sm rounded ${viewMode === 'mutation_night' ? 'bg-gray-800 text-white' : 'bg-gray-200'}`}
        >
          変異表示(夜基準)
        </button>
        <button
          onClick={() => setViewMode('cumulative')}
          className={`px-3 py-1 text-sm rounded ${viewMode === 'cumulative' ? 'bg-gray-800 text-white' : 'bg-gray-200'}`}
        >
          累積表示
        </button>
      </div>
    </div>
  ));
};

const TimescaleDay = React.memo(() => (
  <Timescale hours={Array.from({ length: 25 }, (_, i) => i)} />
))

const TimescaleNight = React.memo(() => (
  <Timescale hours={[...Array.from({ length: 12 }, (_, i) => i + 12), ...Array.from({ length: 13 }, (_, i) => i)]} />
))

const Timescale = (props: { hours: number[] }) => {
  return <div className="w-full h-8 relative" style={{ marginLeft: 1, marginRight: 1 }}>
    {props.hours.map((hour, index) => (
      (hour % 6 === 0) && (
        <div key={hour} className="flex flex-col absolute items-center -translate-x-1/2 -translate-y-1/2" style={{ top: 8, left: `${index / 24 * 100}%` }} >
          <span style={{ fontSize: 8 }}>|</span>
          <span>{String(hour).padStart(2, '0')}:00</span>
        </div>
      )
    ))}
  </div>
}


const convertToWeeklyStatuses = (summaryDataList: GetUserDataGraphMonitor200AllOfSummaryDataListItem[], currentTime: Date): BedStatusHistory[] => {
  const sevenDaysAgo = new Date(currentTime);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const weeklyData = summaryDataList
    .filter(item => {
      const time = new Date(item.Time || '');
      return time >= sevenDaysAgo && time <= currentTime;
    })
    .sort((a, b) => new Date(a.Time || '').getTime() - new Date(b.Time || '').getTime());

  const statuses: BedStatusHistory[] = weeklyData.map((item, index) => ({
    id: index,
    startTime: new Date(item.Time || ''),
    endTime: new Date(item.Time || ''),
    type: mapMeasurementStatusToBedStatus(item.MeasurementStatus || '90')
  }));

  return mergeConsecutiveStatuses(statuses);
};