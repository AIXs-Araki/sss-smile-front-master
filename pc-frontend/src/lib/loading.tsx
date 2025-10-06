/* eslint-disable @typescript-eslint/no-explicit-any */
import { type AxiosResponse } from 'axios';
import { type ReactElement } from 'react';
import type { UseQueryResult } from '@tanstack/react-query';
import { LoadingOverlay } from '@/components/LoadingOverlay';
import { X } from 'lucide-react';
import { LoadingIcon } from './LoadingIcon';

export function renderWhenFetched<T>(
  query: UseQueryResult<AxiosResponse<T, any>>,
  options: Partial<{ width: number | string, height: number | string, loading: ReactElement }>,
  render: (data: NonNullable<T>) => ReactElement
): ReactElement;
export function renderWhenFetched<T>(
  query: UseQueryResult<AxiosResponse<T, any>>[],
  options: Partial<{ width: number | string, height: number | string, loading: ReactElement }>,
  render: (data: NonNullable<T>[]) => ReactElement
): ReactElement;
export function renderWhenFetched<T>(
  query: UseQueryResult<AxiosResponse<T, any>> | UseQueryResult<AxiosResponse<T, any>>[],
  options: Partial<{ width: number | string, height: number | string, loading: ReactElement }>,
  render: (data: NonNullable<T> | NonNullable<T>[]) => ReactElement
) {
  const queries = Array.isArray(query) ? query : [query];

  // Check for errors
  const errorQuery = queries.find(q => q.isError);
  if (errorQuery) {
    console.error(errorQuery.error);
    return <div style={{ width: options.width, height: options.height }} className="text-center flex flex-row justify-center items-center text-sm text-red-500">
      <X className="text-red-500" />データ取得エラー</div>
  }

  // Check if any query is loading
  if (queries.some(q => q.isLoading || q.isFetching)) {
    if (options.loading) {
      return options.loading;
    }
    return <div className="h-24 pt-4"><span><LoadingIcon />Loading...</span></div>
  }

  // Check if all queries are fetched and have data
  if (queries.every(q => q.isFetched && q.data && q.data.data)) {
    const data = Array.isArray(query)
      ? queries.map(q => q.data!.data as NonNullable<T>)
      : queries[0].data!.data as NonNullable<T>;
    return render(data);
  }

  // ここに来るのは enabled = false の場合
  return <div></div>
}

export function renderWhenFetchedWithLoadingOverlay<T>(query: UseQueryResult<AxiosResponse<T, any>>, options: Partial<{ width: number, height: number }>, render: (data: NonNullable<T>) => ReactElement) {
  if (query.isError) {
    console.error(query.error);
    return <div>データ取得エラー</div>
  }
  if (query.isLoading || query.isFetching) {
    return <div className="h-24 pt-4"><span><LoadingOverlay /></span></div>
  }
  if (query.isFetched && query.data && query.data.data) {
    return render(query.data.data as NonNullable<T>);
  }
  // ここに来るのは enabeld = false の場合
  return <div></div>
}

