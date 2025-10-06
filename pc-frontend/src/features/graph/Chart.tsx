import { format } from 'date-fns';
import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

type ViewType = 'hour' | 'day';

interface DataPoint {
  time: number; // Unixタイムスタンプ (ミリ秒)
  heartRate?: number | null;
  breath?: number | null;
}

// Propsの型定義
type HealthChartProps = {
  view: ViewType;
  date: Date;
  to?: Date;
  vitals?: DataPoint[];
};

/**
 * @param view 'hour' | 'day' をPropsとして受け取り、表示を切り替える
 */
const Chart = ({ view, date, to, vitals }: HealthChartProps) => {
  const { data, xAxisDomain, xAxisTicks, tickFormatter, isMinuteUpdate } = useMemo(() => {
    const chartData = vitals;

    // ✅ 修正点: 関数名を `timeFormatter` から `tickFormatter` に変更しました。
    const tickFormatter = (timestamp: number) =>
      new Date(timestamp).toLocaleTimeString('ja-JP', {
        hour: '2-digit',
        minute: '2-digit',
      });

    if (view === 'hour') {
      const startTimestamp = date.getTime();
      const endTimestamp = to ? to.getTime() : startTimestamp + 60 * 60 * 1000;
      // 5分ごとにメモリを表示
      const ticks = [];
      let currentTick = Math.ceil(startTimestamp / (5 * 60 * 1000)) * (5 * 60 * 1000);
      while (currentTick <= endTimestamp) {
        ticks.push(currentTick);
        currentTick += 5 * 60 * 1000;
      }

      // 1分間の範囲かどうかを判定
      const isMinuteUpdate = (endTimestamp - startTimestamp) === 60 * 1000;
      return { data: chartData, xAxisDomain: [startTimestamp, endTimestamp], xAxisTicks: ticks, tickFormatter, isMinuteUpdate };
    } else { // view === 'day'
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const startTimestamp = startOfDay.getTime();
      const endTimestamp = startTimestamp + 24 * 60 * 60 * 1000;
      const ticks = Array.from({ length: 25 }, (_, i) => startTimestamp + i * 60 * 60 * 1000);
      return { data: chartData, xAxisDomain: [startTimestamp, endTimestamp], xAxisTicks: ticks, tickFormatter, isMinuteUpdate: false };
    }
  }, [view, date, to, vitals]);

  // hour viewで1分更新の場合のみアニメーションを抑制
  const animationDuration = view === 'hour' && isMinuteUpdate ? 100 : 300;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="time"
          type="number"
          scale="time"
          domain={xAxisDomain as [number, number]}
          ticks={xAxisTicks}
          tickFormatter={tickFormatter}
          dy={10}
          fontSize={12}
        />
        <YAxis
          yAxisId="left"
          orientation="left"
          stroke="#ef4444"
          domain={[0, 200]}
          fontSize={10}
          label={<HeartRateLabel />}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          stroke="#3b82f6"
          domain={[0, 40]}
          fontSize={10}
          label={<BreathLabel />}
        />
        <Tooltip
          labelFormatter={(label) => format(new Date(label), "yyyy/MM/dd HH:mm")}
          formatter={(value, name) => [`${value}`, name]}
          wrapperClassName="no-print"
        />
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="heartRate"
          name="心拍"
          stroke="#ef4444" // red-500
          dot={false}
          strokeWidth={2}
          animationDuration={animationDuration}
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="breath"
          name="呼吸"
          stroke="#3b82f6"
          dot={false}
          strokeWidth={2}
          animationDuration={animationDuration}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

const BreathLabel = ({ viewBox }: { viewBox?: { x: number, y: number } }) => {
  // viewBoxからY軸の開始位置（左上隅）のx, y座標を取得
  const { x, y } = viewBox!;
  return (
    <text x={x} y={y} dy={8} dx={25} textAnchor="start" fill="#3b82f6" fontSize={12}>
      呼吸
    </text>
  );
};

const HeartRateLabel = ({ viewBox, }: { viewBox?: { x: number, y: number }, }) => {
  // viewBoxからY軸の開始位置（左上隅）のx, y座標を取得
  const { x, y } = viewBox!;
  return (
    <text x={x} y={y} dy={8} dx={5} textAnchor="start" fill="#ef4444" fontSize={12}>
      心拍
    </text>
  );
};
export { Chart };
export type { ViewType };
