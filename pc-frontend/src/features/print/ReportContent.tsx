
import { useLoginUser } from '@/hooks/useLoginUser';
import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useGraph } from './query';
import { useLocation } from 'react-router-dom';
import type { UserCardData } from '@core/types/UserCard';
import { mapMeasurementStatusToBedStatus } from '@core/types/UserCard';
import { startOfMonth, endOfMonth } from 'date-fns';
import type { GetUserDataGraphMonitor200AllOfSummaryDataListItem } from '@core/api/api-generated';

interface ReportContentProps {
  // "YYYY-MM" 形式の文字列を受け取る
  yearMonth: string;
  card: UserCardData;
}

// 1日のデータ構造
interface DailyData {
  day: number;
  resting: number;
  moving: number;
  bedexit: number;
  offline: number;
  heartRate: number | null;
  breath: number | null;
}
/**
 * APIデータから月次チャートデータを生成するヘルパー関数
 */
const generateMonthlyDataFromAPI = (summaryDataList: GetUserDataGraphMonitor200AllOfSummaryDataListItem[], year: number, month: number): DailyData[] => {
  const data: DailyData[] = [];
  const daysInMonth = new Date(year, month, 0).getDate();

  // 各日のデータを初期化
  for (let day = 1; day <= 31; day++) {
    data.push({
      day,
      resting: 0,
      moving: 0,
      bedexit: 0,
      offline: day <= daysInMonth ? 24 : 0, // 有効な日は初期値としてofflineに24時間設定
      heartRate: null,
      breath: null,
    });
  }

  if (!summaryDataList || summaryDataList.length === 0) {
    return data;
  }

  // 日ごとにデータを集計
  const dailyStats: { [day: number]: { statusDurations: { [status: string]: number }, heartRates: number[], breaths: number[] } } = {};

  // データを時間順にソート
  const sortedData = [...summaryDataList].sort((a, b) => {
    const timeA = new Date(a.Time || '').getTime();
    const timeB = new Date(b.Time || '').getTime();
    return timeA - timeB;
  });

  // 日ごとにデータポイントをグループ化
  sortedData.forEach(item => {
    if (!item.Time) return;

    const date = new Date(item.Time);
    if (date.getFullYear() !== year || date.getMonth() + 1 !== month) return;

    const day = date.getDate();
    if (day > daysInMonth) return;

    if (!dailyStats[day]) {
      dailyStats[day] = { statusDurations: {}, heartRates: [], breaths: [] };
    }

    const status = item.MeasurementStatus || '0';
    dailyStats[day].statusDurations[status] = (dailyStats[day].statusDurations[status] || 0) + 1;

    // 心拍・呼吸データを収集
    if (item.HeartRateValue && item.HeartRateValue > 0) {
      dailyStats[day].heartRates.push(item.HeartRateValue);
    }
    if (item.RespirationRateValue && item.RespirationRateValue > 0) {
      dailyStats[day].breaths.push(item.RespirationRateValue);
    }
  });

  // 集計データをチャート用データに変換
  Object.entries(dailyStats).forEach(([dayStr, stats]) => {
    const day = parseInt(dayStr);
    const dataPoint = data[day - 1];

    // 初期化（offlineをリセット）
    dataPoint.resting = 0;
    dataPoint.moving = 0;
    dataPoint.bedexit = 0;
    dataPoint.offline = 0;

    const totalCount = Object.values(stats.statusDurations).reduce((sum, count) => sum + count, 0);

    if (totalCount > 0) {
      // 各状態の時間を計算（24時間を総カウントで按分）
      Object.entries(stats.statusDurations).forEach(([status, count]) => {
        const hours = (count / totalCount) * 24;
        const bedStatus = mapMeasurementStatusToBedStatus(status);

        switch (bedStatus) {
          case 'resting':
            dataPoint.resting += hours;
            break;
          case 'moving':
            dataPoint.moving += hours;
            break;
          case 'bedexit':
            dataPoint.bedexit += hours;
            break;
          default:
            dataPoint.offline += hours;
            break;
        }
      });
    } else {
      // データがない日は全てoffline
      dataPoint.offline = 24;
    }

    // 心拍・呼吸の平均値を計算
    if (stats.heartRates.length > 0) {
      dataPoint.heartRate = Math.round(stats.heartRates.reduce((sum, val) => sum + val, 0) / stats.heartRates.length);
    }
    if (stats.breaths.length > 0) {
      dataPoint.breath = Math.round(stats.breaths.reduce((sum, val) => sum + val, 0) / stats.breaths.length);
    }
  });

  return data;
};

const useUserId = () => {
  const location = useLocation();
  const userId = (location.pathname.split('/')[4]);
  return userId;
}

/**
 * 月次アクティビティとを表示するチャートコンポーネント
 */
export const ReportContent = ({ yearMonth, card }: ReportContentProps) => {
  // yearMonthが変更された時のみデータを再生成

  const year = parseInt(yearMonth.substring(0, 4), 10);
  const month = parseInt(yearMonth.substring(4, 6), 10);
  const loginUser = useLoginUser();
  const uid = useUserId();

  // 月の開始日と終了日を計算
  const monthStart = startOfMonth(new Date(year, month - 1));
  const monthEnd = endOfMonth(new Date(year, month - 1));

  const graphQuery = useGraph(
    uid,
    { CorpID: loginUser.cid, FacilityID: loginUser.fid },
    { query: {} },
    { from: monthStart, to: monthEnd }
  );

  const chartData = useMemo(() => {
    if (!graphQuery.data?.data?.SummaryDataList) {
      // データがない場合は空のデータを返す
      const emptyData: DailyData[] = [];
      const daysInMonth = new Date(year, month, 0).getDate();
      for (let day = 1; day <= 31; day++) {
        emptyData.push({
          day,
          resting: 0,
          moving: 0,
          bedexit: 0,
          offline: day <= daysInMonth ? 24 : 0,
          heartRate: null,
          breath: null,
        });
      }
      return emptyData;
    }

    return generateMonthlyDataFromAPI(graphQuery.data.data.SummaryDataList, year, month);
  }, [graphQuery.data?.data?.SummaryDataList, year, month]);

  if (graphQuery.isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">データを読み込み中...</div>
      </div>
    );
  }

  if (graphQuery.isError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-600">データの読み込みに失敗しました</div>
      </div>
    );
  }

  return (
    <div>

      <header className="flex justify-between items-center pb-4 border-b">
        <div className="text-left">
          <div className="text-2xl font-bold flex gap-x-10">
            <div>{card.roomNumber}</div>
            <div>{card.userName} 様</div>
          </div>
          <p className="text-gray-600">{`${year} 年 ${month} 月`}分</p>
        </div>
        <div className="h-12 flex items-center justify-center text-sm text-gray-500">
          <img src="/hitsuji-logo.png" width={220} />
        </div>
      </header>
      <div className="p-4 md:p-8 bg-white flex flex-col gap-y-12">

        {/* 1. 棒グラフ (アクティビティ時間) */}
        <div>
          <h2 className="text-xl font-bold text-gray-700 mb-4">体動状態</h2>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={chartData} margin={{ top: 5, right: 80, left: 10, bottom: 20 }}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="day" tickCount={31} interval={0} tickFormatter={formatXAxis} padding={{ left: 2, right: 1 }} fontSize={12}>
              </XAxis>
              <YAxis domain={[0, 24]} allowDataOverflow={true}
                fontSize={12}
                label={<TimeLabel />}
              />
              <Tooltip
                formatter={(value, name) => [`${(value as number).toFixed(1)} 時間`, name]}
                labelFormatter={(label) => `${label}日`}
                wrapperClassName="no-print"
              />
              <Legend verticalAlign="bottom" wrapperStyle={{}} />
              <Bar dataKey="resting" stackId="a" fill="oklch(0.707 0.165 254.624)" name="安静" />
              <Bar dataKey="moving" stackId="a" fill="oklch(75% 0.183 55.934)" name="体動" />
              <Bar dataKey="bedexit" stackId="a" fill="oklch(0.872 0.01 258.338)" name="離床" />
              <Bar dataKey="offline" stackId="a" fill="#eee" name="通信途絶" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 2. 折れ線グラフ (心拍) */}
        <div>
          <h2 className="text-xl font-bold text-gray-700 mb-4">心拍･呼吸</h2>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 20 }}>
              <CartesianGrid vertical={false} />


              <XAxis dataKey="day" tickCount={31} interval={0} tickFormatter={formatXAxis} padding={{ left: 10, right: 10 }} fontSize={12}>
              </XAxis>
              <YAxis
                yAxisId="left"
                orientation="left"
                stroke="#ef4444"
                domain={[0, 200]}
                fontSize={12}
                label={<HeartRateLabel />}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#3b82f6"
                domain={[0, 40]}
                fontSize={12}
                label={<BreathLabel />}
              />
              <Tooltip
                labelFormatter={(label) => `${label}日`}
                formatter={(value, name) => [value, name === "heartRate" ? '心拍' : '呼吸']}
                wrapperClassName="no-print"

              />
              <Legend content={<CustomLegend />} />

              <Line
                yAxisId="left"
                type="monotone"
                dataKey="heartRate"
                stroke="#ef4444" // red-500
                dot={false}
                strokeDasharray="2 2"
                strokeWidth={2}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="breath"
                stroke="#3b82f6"
                dot={false}
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

      </div>
    </div>
  );
};

interface CustomLegendPayload {
  value: string;
  color: string;
  dataKey?: string | number;
}

interface CustomLegendProps {
  payload?: CustomLegendPayload[];
}


const CustomLegend: React.FC<CustomLegendProps> = ({ payload }) => {
  return (
    <ul
      style={{
        display: 'flex',
        justifyContent: 'center',
        listStyle: 'none',
        margin: '20px 0 0 0',
        padding: 0,
      }}
    >
      {payload?.map((entry, index) => (
        <li
          key={`item-${index}`}
          style={{
            display: 'flex',
            alignItems: 'center',
            marginRight: '20px',
          }}
        >
          {/* アイコン部分 */}
          <svg width="20" height="10" style={{ marginRight: '5px' }}>
            <line
              x1="0"
              y1="5"
              x2="20"
              y2="5"
              stroke={entry.color}
              strokeWidth={2}
              strokeDasharray={entry.dataKey === 'heartRate' ? '2 2' : 'none'}
            />
          </svg>
          {/* テキスト部分 */}
          <span style={{ color: '#333' }}>{entry.value === "heartRate" ? "心拍" : "呼吸"}</span>
        </li>
      ))}
    </ul>
  );
};


const formatXAxis = (day: number | string) => {
  const d = Number(day)
  // tickItemが1、または5で割り切れる場合のみ、その数値を返す
  if (d === 1 || d % 5 === 0) {
    return d.toString();
  }
  // それ以外の値は表示しない（空文字を返す）
  return "";
};
const BreathLabel = ({ viewBox }: { viewBox?: { x: number, y: number } }) => {
  // viewBoxからY軸の開始位置（左上隅）のx, y座標を取得
  const { x, y } = viewBox!;
  return (
    <text x={x} y={y} dy={8} dx={26} textAnchor="start" fill="#3b82f6" fontSize={12}>
      呼吸
    </text>
  );
};

const HeartRateLabel = ({ viewBox, }: { viewBox?: { x: number, y: number }, }) => {
  // viewBoxからY軸の開始位置（左上隅）のx, y座標を取得
  const { x, y } = viewBox!;
  return (
    <text x={x} y={y} dy={8} dx={4} textAnchor="start" fill="#ef4444" fontSize={12}>
      心拍
    </text>
  );
};


const TimeLabel = ({ viewBox, }: { viewBox?: { x: number, y: number }, }) => {
  // viewBoxからY軸の開始位置（左上隅）のx, y座標を取得
  const { x, y } = viewBox!;
  return (
    <text x={x} y={y} dy={8} dx={4} textAnchor="start" fill="#333" fontSize={12}>
      時間
    </text>
  );
};