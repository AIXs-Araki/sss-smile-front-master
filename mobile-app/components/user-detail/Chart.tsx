import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
//import { lineDataItem } from 'react-native-gifted-charts/src/LineChart/types';

type lineDataItem = {
  value: number | undefined
  labelComponent?: () => void
  showVerticalLine?: boolean,
  verticalLineColor?: string,
  verticalLineThickness?: number,
}
export interface DataPoint {
  time: string;
  value: number | null;
}

interface AbnormalRange {
  threshold: number;
  color: string;
  label: string;
}

interface ReusableLineChartProps {
  title: string;
  data: DataPoint[];
  lineColor: string;
  defaultMaxY: number;
  yAxisTicks: number[];
  abnormalRanges: {
    high: AbnormalRange;
    low: AbnormalRange;
  };
}

export const Chart: React.FC<ReusableLineChartProps> = ({
  title,
  data,
  lineColor,
  defaultMaxY,
  yAxisTicks,
  abnormalRanges,
}) => {
  const [containerWidth, setContainerWidth] = React.useState(0);

  const maxDataValue = Math.max(...data.map(p => (p.value ? p.value : 0)));
  const yAxisMax = Math.max(defaultMaxY, maxDataValue);

  const yAxisWidth = 35;
  const xAxisHeight = 33;
  const chartHeight = 140;
  const totalWrapperHeight = chartHeight + xAxisHeight;

  // 0から始まるY軸ラベルを生成
  const stepSize = yAxisMax / 4; // 4セクションに分割
  const yAxisLabelTexts = [0, stepSize, stepSize * 2, stepSize * 3, yAxisMax].map(val => Math.round(val).toString());

  console.log(JSON.stringify(data[0]))
  const chartData: lineDataItem[] = data.map((point, index) => {
    const basePoint: lineDataItem = {
      value: point.value ?? undefined,
    };

    try {
      // time文字列を ":" で分割し、2番目の要素（分）を取得
      const minutes = parseInt(point.time.split(':')[1], 10);

      // 分が15で割り切れるかチェック
      if (minutes % 15 === 0) {
        basePoint.labelComponent = () => (
          <View style={{ width: 40, marginLeft: -7, height: xAxisHeight }}>
            <Text style={{ color: 'darkgray', fontSize: 12, textAlign: 'center' }}>
              {point.time}
            </Text>
          </View>
        );
        basePoint.showVerticalLine = true;
        basePoint.verticalLineColor = '#d0d0d0';
        basePoint.verticalLineThickness = 1;
      } else {
        basePoint.labelComponent = () => null;
      }
    } catch {
      // timeの形式が "HH:mm" でない場合にエラーになるのを防ぐ
      basePoint.labelComponent = () => null;
    }
    return basePoint;
  });

  const chartWidth = containerWidth > 0 ? containerWidth - yAxisWidth : 0;
  //const pointSpacing = chartWidth > 0 ? chartWidth / (data.length || 1) : 0;
  const divisor = data.length > 1 ? data.length - 1 : 1;
  const pointSpacing = chartWidth > 0 ? chartWidth / divisor : 0;
  return (
    <View style={styles.container}>
      <View style={[styles.chartWrapper, { height: totalWrapperHeight }]} onLayout={(event) => {
        setContainerWidth(event.nativeEvent.layout.width);
      }}>
        {containerWidth > 0 && (
          <>
            {/* ... 異常範囲の背景表示 (変更なし) ... */}
            {abnormalRanges?.high && (
              <View style={[styles.rangeBackground, { width: chartWidth, left: yAxisWidth, height: ((yAxisMax - abnormalRanges.high.threshold) / yAxisMax) * chartHeight, backgroundColor: abnormalRanges.high.color, top: 0, }]} />
            )}
            {abnormalRanges?.low && (
              <View style={[styles.rangeBackground, { width: chartWidth, left: yAxisWidth, height: (abnormalRanges.low.threshold / yAxisMax) * chartHeight, backgroundColor: abnormalRanges.low.color, bottom: xAxisHeight, }]} />
            )}
            <View style={[styles.titleContainer, { left: yAxisWidth - 30, top: -22 }]}>
              <Text className="font-bold">{title}</Text>
            </View>

            <LineChart
              data={chartData}
              width={chartWidth}
              spacing={pointSpacing}

              // --- 修正点 1: 縦線 ---
              showVerticalLines
              // デフォルトの縦線を透明にして見えなくする
              verticalLinesColor="transparent"

              height={chartHeight}
              color={lineColor}
              thickness={2}
              maxValue={yAxisMax}
              mostNegativeValue={0}
              yAxisTextStyle={{ fontSize: 12 }}
              yAxisColor="#e0e0e0"
              yAxisExtraHeight={0}
              yAxisLabelTexts={yAxisLabelTexts}
              noOfSections={4}
              xAxisColor="#e0e0e0"
              rulesType="dashed"
              rulesColor="#e0e0e0"
              endSpacing={0}
              adjustToWidth={false}
              disableScroll
              initialSpacing={0}
              hideDataPoints
              interpolateMissingValues={false}
              dataPointsRadius={0}
              focusedDataPointRadius={4}
              hideOrigin
              showReferenceLine1={!!abnormalRanges?.high}
              referenceLine1Position={abnormalRanges.high.threshold}
              referenceLine1Config={{ color: abnormalRanges.high.color.replace('0.1', '0.5') || '#ff0000', thickness: 1 }}
              showReferenceLine2={!!abnormalRanges?.low}
              referenceLine2Position={abnormalRanges.low.threshold}
              referenceLine2Config={{ color: abnormalRanges.low.color.replace('0.1', '0.5') || '#ff0000', thickness: 1 }}
            />
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { backgroundColor: 'white', padding: 16 },
  chartWrapper: { position: 'relative' },
  titleContainer: { position: 'absolute', top: -16, zIndex: 10 },
  rangeBackground: { position: 'absolute', zIndex: 0 },
});