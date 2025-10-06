

import { renderWhenFetched } from '@/lib/loading';
import type { GetUserDataGraphMonitor200AllOfSummaryDataListItem } from '@core/api/api-generated';
import type { BedStatusHistory } from '@core/model/chart.type';
import { mapMeasurementStatusToBedStatus } from '@core/types/UserCard';
import { format } from 'date-fns';
import { useCallback, useMemo, useState } from 'react';
import ActivityStatusBar from '../monitor/modals/parts/ActivityStatusBar';
import { Chart } from './Chart';
import { ChartController } from './ChartController';
import { useInfiniteGraphData } from './hooks/useInfiniteGraphData';
import { BlockHeader } from './BlockHeader';
import { mergeConsecutiveStatuses, type VitalData } from './helper';

interface HourlyData {
  statuses: BedStatusHistory[];
  vitals: VitalData[];
}

export const HourlyChart = (props: { uid: string, enabled: boolean }) => {
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 59 * 60 * 1000);
  const [dateRange, setDate] = useState({ from: oneHourAgo, to: now });

  const { data, isLoading, checkAndFetchMore, queries } = useInfiniteGraphData({
    uid: props.uid,
    enabled: props.enabled,
    shouldFetchMore: (currentDate, oldestDataTime) => {
      const hourStart = new Date(currentDate);
      hourStart.setMinutes(hourStart.getMinutes() - 59);
      return hourStart < oldestDataTime;
    },
    getFetchRange: (targetDate) => {
      const from = new Date(targetDate);
      from.setDate(from.getDate() - 7);
      const to = new Date(targetDate);
      to.setDate(to.getDate() + 1);
      return { from, to };
    }
  });

  const onChangeDate = useCallback((d: { from: Date, to: Date }) => {
    setDate(d);
    checkAndFetchMore(d.to);
  }, [checkAndFetchMore]);

  const hourlyData = useMemo(() => {
    return convertToHourlyData(data, dateRange.to);
  }, [data, dateRange.to]);

  if (isLoading) {
    return <div className="flex items-center justify-center h-full">Loading...</div>;
  }

  return <>
    {renderWhenFetched(queries, {}, () => (
      <>
        <BlockHeader time={`${format(dateRange.from, "yyyy/MM/dd p")} - ${format(dateRange.to, "p")}`} title="1時間グラフ" style={{ paddingLeft: 80, paddingRight: 90 }} />
        <div className="" style={{ paddingLeft: 20, paddingRight: 90 }}>
          <ActivityStatusBar statuses={hourlyData.statuses} currentTime={dateRange.to} />
        </div>
        <div className='flex-grow'>
          <Chart view='hour' date={dateRange.from} to={dateRange.to} vitals={hourlyData.vitals} />
        </div>
        <ChartController viewType='hour' onChange={onChangeDate} date={dateRange.to} />
      </>
    ))}
  </>
}

const convertToHourlyData = (summaryDataList: GetUserDataGraphMonitor200AllOfSummaryDataListItem[], currentTime: Date): HourlyData => {
  const oneHourAgo = new Date(currentTime.getTime() - 60 * 60 * 1000);

  const hourlyData = summaryDataList
    .filter(item => {
      const time = new Date(item.Time || '');
      return time >= oneHourAgo && time <= currentTime;
    })
    .sort((a, b) => new Date(a.Time || '').getTime() - new Date(b.Time || '').getTime());

  const statuses: BedStatusHistory[] = hourlyData.map((item, index) => ({
    id: index,
    startTime: new Date(item.Time || ''),
    endTime: new Date(item.Time || ''),
    type: mapMeasurementStatusToBedStatus(item.MeasurementStatus || '90')
  }));

  const vitals: VitalData[] = hourlyData.map(item => ({
    time: new Date(item.Time || '').getTime(),
    heartRate: item.HeartRateValue || null,
    breath: item.RespirationRateValue || null
  }));

  return {
    statuses: mergeConsecutiveStatuses(statuses),
    vitals
  };
};
