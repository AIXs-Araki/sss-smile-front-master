import type { 
  GetUserDataApplication200AllOfMeasurementStatusSummaryItem,
  GetUserDataApplication200AllOfHeartRateSummaryItem,
  GetUserDataApplication200AllOfRespirationRateSummaryItem
} from '../api/api-generated';
import type { BedStatusHistory, DataPoint } from './chart.type';
import { mapMeasurementStatusToBedStatus } from '../types/UserCard';

export const convertToAlerts = (data: GetUserDataApplication200AllOfMeasurementStatusSummaryItem[]): { statuses: BedStatusHistory[], alerts: Date[] } => {
  const sortedData = data
    .filter(item => item.Time)
    .sort((a, b) => new Date(a.Time!).getTime() - new Date(b.Time!).getTime());

  const alerts = sortedData
    .filter(item => item.Alert)
    .map(item => parseTimeString(item.Time!));

  const mergedData = mergeSameStatuses(sortedData);
  const statuses = convertToStatuses(mergedData);

  return { statuses, alerts };
};

const mergeSameStatuses = (data: GetUserDataApplication200AllOfMeasurementStatusSummaryItem[]) => {
  if (data.length === 0) return [];

  const merged = [data[0]];

  for (let i = 1; i < data.length; i++) {
    const current = data[i];
    const previous = merged[merged.length - 1];

    if (current.MeasurementStatus === previous.MeasurementStatus) {
      previous.Alert = previous.Alert || current.Alert;
    } else {
      merged.push(current);
    }
  }

  return merged;
};

const convertToStatuses = (data: GetUserDataApplication200AllOfMeasurementStatusSummaryItem[]): BedStatusHistory[] => {
  return data.map((item, index) => {
    const time = parseTimeString(item.Time!);
    const status = mapMeasurementStatusToBedStatus(item.MeasurementStatus);
    const endTime = index < data.length - 1
      ? parseTimeString(data[index + 1].Time!)
      : new Date();

    return {
      id: index,
      startTime: time,
      endTime,
      type: status
    };
  });
};

export const convertToChartData = (data: GetUserDataApplication200AllOfHeartRateSummaryItem[] | GetUserDataApplication200AllOfRespirationRateSummaryItem[]): DataPoint[] => {
  return data
    .filter(item => item.Time)
    .sort((a, b) => parseTimeString(a.Time!).getTime() - parseTimeString(b.Time!).getTime())
    .map(item => ({
      time: item.Time!,
      value: item.Value ?? null
    }));
};

const parseTimeString = (timeStr: string): Date => {
  const today = new Date();
  const [hours, minutes] = timeStr.split(':').map(Number);
  return new Date(today.getFullYear(), today.getMonth(), today.getDate(), hours, minutes);
};