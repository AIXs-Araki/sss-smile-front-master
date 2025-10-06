import type { DataPoint } from '@core/model/chart.type';
import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea,
} from 'recharts';


// 異常範囲の定義
interface AbnormalRange {
  threshold: number;
  color: string; // 例: 'rgba(239, 68, 68, 0.1)'
  label: string;
}

// コンポーネントのPropsの型定義
interface ReusableLineChartProps {
  title: string;
  data: DataPoint[];
  lineColor: string;
  defaultMaxY: number;
  abnormalRanges?: {
    high?: AbnormalRange;
    low?: AbnormalRange;
  };
}

export const Chart: React.FC<ReusableLineChartProps> = ({
  title,
  data,
  lineColor,
  defaultMaxY,
  abnormalRanges,
}) => {
  // Y軸の最大値を動的に計算
  const maxDataValue = Math.max(...data.map(p => (p.value ? p.value : 0)));
  const yAxisMax = Math.max(defaultMaxY, maxDataValue);

  return (
    <div className="bg-white ">
      <ResponsiveContainer width="100%" height={200}>
        <LineChart
          data={data}
          margin={{
            top: 0,
            right: 0,
            left: 0,
            bottom: 0,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis dataKey="time" tick={false} axisLine={false} tickLine={false} />
          <YAxis domain={[0, yAxisMax]} allowDataOverflow={true} fontSize={12} />

          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #ccc',
              borderRadius: '0.5rem',
            }}
            labelStyle={{ fontWeight: 'bold' }}
            wrapperClassName="no-print"

            // formatterで単位と名称を動的に設定
            formatter={(value: number, name: string) => [`${value}`, name]}
          />

          {/* 異常値（高）エリアの条件付きレンダリング */}
          {abnormalRanges?.high && (
            <ReferenceArea
              y1={abnormalRanges.high.threshold}
              y2={yAxisMax}
              ifOverflow="visible"
              fill={abnormalRanges.high.color}
              stroke={abnormalRanges.high.color.replace('0.1', '0.3')} // 透明度を少し濃くする
            >
            </ReferenceArea>
          )}

          {/* 異常値（低）エリアの条件付きレンダリング */}
          {abnormalRanges?.low && (
            <ReferenceArea
              y1={0}
              y2={abnormalRanges.low.threshold}
              ifOverflow="visible"
              fill={abnormalRanges.low.color}
              stroke={abnormalRanges.low.color.replace('0.1', '0.3')}
            >
            </ReferenceArea>
          )}

          <Line
            type="monotone"
            dataKey="value"
            name={title}
            stroke={lineColor}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 8 }}
            connectNulls={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
