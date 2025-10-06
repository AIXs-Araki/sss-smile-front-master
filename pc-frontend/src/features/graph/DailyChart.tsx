

import { renderWhenFetched } from '@/lib/loading';
import { format } from 'date-fns';
import { useCallback, useMemo, useState } from 'react';
import ActivityStatusBar from '../monitor/modals/parts/ActivityStatusBar';
import { BlockHeader } from './BlockHeader';
import { Chart } from './Chart';
import { ChartController } from './ChartController';
import { useInfiniteGraphData } from './hooks/useInfiniteGraphData';


import type { GetUserDataGraphMonitor200AllOfSummaryDataListItem } from '@core/api/api-generated';
import type { BedStatusHistory } from '@core/model/chart.type';
import { mapMeasurementStatusToBedStatus } from '@core/types/UserCard';
import { findFirstIndex, findLastIndex } from '@/helpers/binarySearch';
import { mergeConsecutiveStatuses, type VitalData } from './helper';


interface DailyData {
  statuses: BedStatusHistory[];
  vitals: VitalData[];
}

export const DailyChart = (props: { uid: string, enabled: boolean }) => {
  const [date, setDate] = useState(new Date());

  const { data, isLoading, checkAndFetchMore, queries } = useInfiniteGraphData({
    uid: props.uid,
    enabled: props.enabled,
    shouldFetchMore: (currentDate, oldestDataTime) => {
      const dayStart = new Date(currentDate);
      dayStart.setHours(0, 0, 0, 0);
      return dayStart < oldestDataTime;
    }
  });

  const onChangeDate = useCallback((d: { from: Date, to: Date }) => {
    setDate(d.from);
    checkAndFetchMore(d.from);
  }, [checkAndFetchMore]);

  const dailyData = useMemo(() => {
    return convertToDailyData(data, date);
  }, [data, date]);

  if (isLoading) {
    return <div className="flex items-center justify-center h-full">Loading...</div>;
  }

  return renderWhenFetched(queries, { width: "100%", height: 100 }, () => (<>
    <BlockHeader time={`${format(date, "yyyy/MM/dd")} 0:00 AM - 23:59 PM`} title="1日間グラフ" style={{ paddingLeft: 80, paddingRight: 90 }} />
    <div className="" style={{ paddingLeft: 20, paddingRight: 90 }}>
      <ActivityStatusBar statuses={dailyData.statuses} currentTime={new Date()} mode="daily" displayDate={date} />
    </div>
    <div className='flex-grow'>
      <Chart view='day' date={date} vitals={dailyData.vitals} />
    </div>
    <ChartController viewType='day' onChange={onChangeDate} date={date} />
  </>))
}



const convertToDailyData = (summaryDataList: GetUserDataGraphMonitor200AllOfSummaryDataListItem[], targetDate: Date): DailyData => {
  const dayStart = new Date(targetDate);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(targetDate);
  dayEnd.setHours(23, 59, 59, 999);
  const now = new Date();
  const isToday = dayStart.toDateString() === now.toDateString();
  const endTime = isToday ? now : dayEnd;

  const startIndex = findFirstIndex(summaryDataList, item => {
    const time = new Date(item.Time || '');
    return time >= dayStart;
  });

  const endIndex = findLastIndex(summaryDataList, item => {
    const time = new Date(item.Time || '');
    return time <= endTime;
  });

  const dailyData = startIndex !== -1 && endIndex !== -1
    ? summaryDataList.slice(startIndex, endIndex + 1)
    : [];

  const statuses: BedStatusHistory[] = dailyData.map((item, index) => ({
    id: index,
    startTime: new Date(item.Time || ''),
    endTime: new Date(item.Time || ''),
    type: mapMeasurementStatusToBedStatus(item.MeasurementStatus || '90')
  }));

  const vitals: VitalData[] = [];
  const fiveMinutes = 5 * 60 * 1000;
  let currentTime = dayStart.getTime();
  let dataIndex = 0;

  while (currentTime <= endTime.getTime()) {
    let dataPoint = null;

    for (let i = dataIndex; i < dailyData.length; i++) {
      const itemTime = new Date(dailyData[i].Time || '').getTime();
      if (Math.abs(itemTime - currentTime) <= fiveMinutes) {
        dataPoint = dailyData[i];
        dataIndex = i;
        break;
      }
      if (itemTime > currentTime + fiveMinutes) break;
    }

    vitals.push({
      time: currentTime,
      heartRate: dataPoint?.HeartRateValue || null,
      breath: dataPoint?.RespirationRateValue || null
    });

    currentTime += fiveMinutes;
  }

  return {
    statuses: mergeConsecutiveStatuses(statuses),
    vitals
  };
};
