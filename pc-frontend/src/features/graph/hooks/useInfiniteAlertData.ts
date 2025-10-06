import { useState, useEffect, useCallback } from 'react';
import { useGraph } from '../../print/query';
import { useLoginUser } from '@/hooks/useLoginUser';
import type { GetUserDataGraphMonitor200AllOfAlertDataListItem } from '@core/api/api-generated';

interface UseInfiniteAlertDataOptions {
  uid: string;
  enabled: boolean;
  shouldFetchMore?: (currentDate: Date, oldestDataTime: Date) => boolean;
  getFetchRange?: (targetDate: Date) => { from: Date; to: Date };
}

export const useInfiniteAlertData = ({
  uid,
  enabled,
  shouldFetchMore = (currentDate, oldestDataTime) => currentDate < oldestDataTime,
  getFetchRange = (targetDate) => {
    const from = new Date(targetDate);
    from.setDate(from.getDate() - 7);
    const to = new Date(targetDate);
    to.setDate(to.getDate() + 1);
    return { from, to };
  }
}: UseInfiniteAlertDataOptions) => {
  const [accumulatedData, setAccumulatedData] = useState<GetUserDataGraphMonitor200AllOfAlertDataListItem[]>([]);
  const [fetchRange, setFetchRange] = useState<{ from: Date; to: Date } | undefined>(undefined);
  const loginUser = useLoginUser();

  const initialQuery = useGraph(uid, { CorpID: loginUser.cid, FacilityID: loginUser.fid }, { query: {} });
  const additionalQuery = useGraph(uid, { CorpID: loginUser.cid, FacilityID: loginUser.fid }, { query: { enabled: enabled && !!fetchRange } }, fetchRange);

  useEffect(() => {
    if (initialQuery.data?.data.AlertDataList) {
      setAccumulatedData(initialQuery.data.data.AlertDataList);
    }
  }, [initialQuery.data?.data.AlertDataList]);

  useEffect(() => {
    if (additionalQuery.data?.data.AlertDataList) {
      setAccumulatedData(prev => {
        const newData = additionalQuery.data.data.AlertDataList || [];
        const timeMap = new Map();
        [...prev, ...newData].forEach(item => timeMap.set(item.AlertTime, item));
        return Array.from(timeMap.values()).sort((a, b) => new Date(a.AlertTime || '').getTime() - new Date(b.AlertTime || '').getTime());
      });
      setFetchRange(undefined);
    }
  }, [additionalQuery.data?.data.AlertDataList]);

  const checkAndFetchMore = useCallback((targetDate: Date) => {
    if (accumulatedData.length > 0) {
      const oldestDataTime = new Date(accumulatedData[0].AlertTime || '');
      if (shouldFetchMore(targetDate, oldestDataTime)) {
        setFetchRange(getFetchRange(targetDate));
      }
    }
  }, [accumulatedData, shouldFetchMore, getFetchRange]);

  const isLoading = (initialQuery.isLoading && accumulatedData.length === 0) || additionalQuery.isLoading;

  return {
    data: accumulatedData,
    isLoading,
    checkAndFetchMore,
    queries: [initialQuery, additionalQuery]
  };
};