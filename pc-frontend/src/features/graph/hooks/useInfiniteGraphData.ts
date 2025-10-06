import { useState, useEffect, useCallback } from 'react';
import { useGraph } from '../../print/query';
import { useLoginUser } from '@/hooks/useLoginUser';
import type { GetUserDataGraphMonitor200AllOfSummaryDataListItem } from '@core/api/api-generated';

interface UseInfiniteGraphDataOptions {
  uid: string;
  enabled: boolean;
  shouldFetchMore?: (currentDate: Date, oldestDataTime: Date) => boolean;
  getFetchRange?: (targetDate: Date) => { from: Date; to: Date };
}

export const useInfiniteGraphData = ({
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
}: UseInfiniteGraphDataOptions) => {
  const [accumulatedData, setAccumulatedData] = useState<GetUserDataGraphMonitor200AllOfSummaryDataListItem[]>([]);
  const [fetchRange, setFetchRange] = useState<{ from: Date; to: Date } | undefined>(undefined);
  const loginUser = useLoginUser();

  // Initial query without Start/End
  const initialQuery = useGraph(uid, { CorpID: loginUser.cid, FacilityID: loginUser.fid }, { query: {} });

  // Additional query when needed
  const additionalQuery = useGraph(uid, { CorpID: loginUser.cid, FacilityID: loginUser.fid }, { query: { enabled: enabled && !!fetchRange } }, fetchRange);

  // Accumulate initial data
  useEffect(() => {
    if (initialQuery.data?.data.SummaryDataList) {
      setAccumulatedData(initialQuery.data.data.SummaryDataList);
    }
  }, [initialQuery.data?.data.SummaryDataList]);

  // Accumulate additional data
  useEffect(() => {
    if (additionalQuery.data?.data.SummaryDataList) {
      setAccumulatedData(prev => {
        const newData = additionalQuery.data.data.SummaryDataList || [];
        const timeMap = new Map();
        [...prev, ...newData].forEach(item => timeMap.set(item.Time, item));
        return Array.from(timeMap.values()).sort((a, b) => new Date(a.Time || '').getTime() - new Date(b.Time || '').getTime());
      });
      setFetchRange(undefined); // Reset fetch range after successful fetch
    }
  }, [additionalQuery.data?.data.SummaryDataList]);

  const checkAndFetchMore = useCallback((targetDate: Date) => {
    if (accumulatedData.length > 0) {
      const oldestDataTime = new Date(accumulatedData[0].Time || '');
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