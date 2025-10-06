import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import type { BedStatusHistory } from '@core/model/chart.type';
import type { BedStatus } from '@core/types/UserCard';
import React, { useState } from 'react';
import { twMerge } from 'tailwind-merge';

// アラートの種類を定義

// コンポーネントのPropsを定義
interface StatusBarProps {
  statuses: BedStatusHistory[];
  currentTime: Date;
  mode?: 'recent' | 'daily';
  displayDate?: Date;
  showTimeMarkers?: boolean;
  alert?: Date[]; // アラート時刻の配列
}

// アラートタイプと色のマッピング
export const ALERT_COLOR_MAP: Record<BedStatus, string> = {
  bedexit: 'bg-gray-300',
  moving: 'bg-orange-400', // オレンジ
  resting: 'bg-blue-400',       // 青
  offline: "bg-white"
};

const STATUS_LABELS = {
  bedexit: "離床",
  moving: "体動",
  resting: "安静",
  offline: "通信途絶"
} as const

/**
 * 過去1時間または指定日24時間のアラート発生状況を表示するステータスバーコンポーネント
 */
const ActivityStatusBar: React.FC<StatusBarProps> = ({
  statuses,
  currentTime,
  mode = 'recent',
  displayDate,
  showTimeMarkers = false,
  alert = [],
}) => {
  const [openPopoverId, setOpenPopoverId] = useState<string | number | null>(null);

  const isDailyMode = mode === 'daily' && !!displayDate;

  // 1. 時間の計算
  const oneHour = 60 * 60 * 1000;
  const twentyFourHours = 24 * oneHour;

  const { windowStartTime, windowEndTime, totalDuration } = (() => {
    if (isDailyMode) {
      const start = new Date(displayDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(end.getDate() + 1);
      return {
        windowStartTime: start.getTime(),
        windowEndTime: end.getTime(),
        totalDuration: twentyFourHours,
      };
    }
    // recentモード
    const endTime = currentTime.getTime();
    return {
      windowStartTime: endTime - oneHour,
      windowEndTime: endTime,
      totalDuration: oneHour,
    };
  })();

  // 2. 表示範囲内のアラートを計算
  const visibleAlerts = statuses
    .map((alert) => {
      const alertStart = alert.startTime.getTime();
      const alertEnd = alert.endTime.getTime();

      if (alertStart > windowEndTime || alertEnd < windowStartTime) {
        return null;
      }

      const left = ((Math.max(alertStart, windowStartTime) - windowStartTime) / totalDuration) * 100;
      const right = ((Math.min(alertEnd, windowEndTime) - windowStartTime) / totalDuration) * 100;
      const width = right - left;

      return {
        id: alert.id,
        left: `${left}%`,
        width: `${width}%`,
        type: alert.type,
        color: ALERT_COLOR_MAP[alert.type],
        startTime: alert.startTime,
        endTime: alert.endTime,
      };
    })
    .filter(Boolean);

  // 3. タイムマーカーの計算
  const timeMarkers = getTimeMarkers(isDailyMode, isDailyMode ? displayDate : currentTime);

  // 4. 未来時間（白色）の計算
  const futureOverlay = (() => {
    if (!isDailyMode || currentTime.getTime() < windowStartTime) {
      return null;
    }
    const left = ((Math.max(currentTime.getTime(), windowStartTime) - windowStartTime) / totalDuration) * 100;
    const width = 100 - left;
    return {
      left: `${left}%`,
      width: `${width}%`,
    };
  })();

  // 5. アラート時刻の三角形マーカーを計算
  const alertMarkers = alert
    .map((alertTime) => {
      const alertTimestamp = alertTime.getTime();
      if (alertTimestamp < windowStartTime || alertTimestamp > windowEndTime) {
        return null;
      }
      const left = ((alertTimestamp - windowStartTime) / totalDuration) * 100;
      return {
        left: `${left}%`,
        time: alertTime,
      };
    })
    .filter(Boolean);

  return (
    <div className="w-full pt-2" style={{ paddingLeft: 60, }}>
      <div className="relative h-5 w-full bg-blue-400  overflow-visible">
        {visibleAlerts.map(
          (alert) =>
            alert && (
              <Popover key={alert.id} open={openPopoverId === alert.id}>
                <PopoverTrigger asChild>
                  <div
                    onMouseEnter={() => setOpenPopoverId(alert.id)}
                    onMouseLeave={() => setOpenPopoverId(null)}
                    className={`absolute h-full ${alert.color}`}
                    style={{ left: alert.left, width: alert.width }}
                  />
                </PopoverTrigger>
                <PopoverContent
                  onMouseEnter={() => setOpenPopoverId(alert.id)}
                  onMouseLeave={() => setOpenPopoverId(null)}
                  className="w-auto p-2 text-xs"
                >
                  <div className="flex flex-col gap-1">
                    <div>{STATUS_LABELS[alert.type]}</div>
                    <div>
                      {` ${alert.startTime.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })} - ${alert.endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            ),
        )}
        {futureOverlay && (
          <div
            className="absolute h-full bg-white"
            style={{ left: futureOverlay.left, width: futureOverlay.width }}
          />
        )}
        {alertMarkers.map((marker, index) =>
          marker && (
            <Triangle
              key={index}
              color="border-t-pink-500"
              style={{ left: marker.left }}
            />
          )
        )}
      </div>

      {showTimeMarkers && (
        <div className="relative h-8 w-full mt-1 text-xs text-gray-600">
          {timeMarkers.map(marker => (
            <div
              key={marker.label}
              className="absolute -translate-x-1/2 text-gray-500"
              style={{ left: marker.position }}
            >
              <span className="absolute top-full left-1/2 -translate-x-1/2" style={{ top: -4, fontSize: 6 }}>
                |
              </span>
              <span className="absolute top-full left-1/2 -translate-x-1/2 pt-1">

                {marker.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const Triangle = (props: { color: string; style?: React.CSSProperties }) => (
  <div
    className={twMerge(
      ' absolute top-[-10px] -translate-x-1/2  w-0 h-0 ',
      ' border-l-[6px] border-l-transparent',
      'border-r-[6px] border-r-transparent',
      'border-t-[8px]',
      props.color,
    )}
    style={props.style}
  />
)

export default ActivityStatusBar;

const getTimeMarkers = (isDailyMode: boolean, date: Date) => {
  if (isDailyMode) {
    const markers = [];
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    for (let i = 0; i <= 24; i++) {
      if (i % 3 === 0) {
        // 3時間ごとのマーカー
        const markerTime = new Date(startOfDay.getTime() + i * 60 * 60 * 1000);
        const position = (i / 24) * 100;
        markers.push({
          label: markerTime.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }),
          position: `${position}%`,
        });
      }
    }
    return markers;
  }

  // --- recentモード (既存のロジックを少し改善) ---
  const markers = [];
  const endLabelTime = new Date(date);
  endLabelTime.setSeconds(0, 0);

  const startLabelTime = new Date(endLabelTime.getTime() - 60 * 60 * 1000);

  for (let i = 0; i <= 60; i++) {
    const tempTime = new Date(startLabelTime.getTime() + i * 60 * 1000);
    if (tempTime.getMinutes() % 15 === 0) {
      markers.push({
        label: tempTime.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }),
        position: `${(i / 60) * 100}%`,
      });
    }
  }
  return markers;
};

