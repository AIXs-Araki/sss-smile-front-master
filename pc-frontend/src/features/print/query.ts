import { injectCommonQueryOptions } from "@/query/injectAuth";
import * as API from "@core/api/api-generated";
import { format } from "date-fns";

const baseUseGraph = injectCommonQueryOptions(API.useGetUserDataGraphMonitor);

export const useGraphTimeFormat = "yyyy-MM-dd'T'HH:mm:ssxxx";
export const useGraph = (userId: string, params: API.GetUserDataGraphMonitorParams, options?: { query?: { enabled?: boolean } }, dateRange?: { from: Date, to: Date }) => {
  const queryParams = dateRange ? {
    ...params,
    Start: format(dateRange.from, useGraphTimeFormat),
    End: format(dateRange.to, useGraphTimeFormat)
  } : params;

  return baseUseGraph(userId, queryParams, {
    ...options,
    query: {
      ...options?.query,
      queryKey: ['graph', userId, queryParams.CorpID, queryParams.FacilityID, queryParams.Start, queryParams.End],
    }
  });
};