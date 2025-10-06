import { useMutation, type MutationFunction, type UseMutationOptions, type UseMutationResult } from "@tanstack/react-query";
import type { AxiosError, AxiosRequestConfig } from "axios";
import * as API from "@core/api/api-generated";
import { injectCommonMutationOptions } from "@/query/injectAuth";


export const mutationOptions = <TError = AxiosError<API.GeneralError>,
  TContext = unknown>(options?: { mutation?: UseMutationOptions<Awaited<ReturnType<typeof API.getUserDataGraphMonitor>>, TError, { uid: string; params: API.GetUserDataGraphMonitorParams }, TContext>, axios?: AxiosRequestConfig }
  ): UseMutationOptions<Awaited<ReturnType<typeof API.getUserDataGraphMonitor>>, TError, { uid: string; params: API.GetUserDataGraphMonitorParams }, TContext> => {
  const mutationKey = ['useUserDataGraphForDownload'];
  const { mutation: mutationOptions, axios: axiosOptions } = options ?
    options.mutation && 'mutationKey' in options.mutation && options.mutation.mutationKey ?
      options
      : { ...options, mutation: { ...options.mutation, mutationKey } }
    : { mutation: { mutationKey, }, axios: undefined };
  const mutationFn: MutationFunction<Awaited<ReturnType<typeof API.getUserDataGraphMonitor>>, { uid: string; params: API.GetUserDataGraphMonitorParams }>
    = (props) => {
      const { uid, params } = props ?? {};
      return API.getUserDataGraphMonitor(uid, params, axiosOptions)
    }
  return { mutationFn, ...mutationOptions }
}

export const useGraphForDownloadQuery = <TError = AxiosError<API.GeneralError>,
  TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof API.getUserDataGraphMonitor>>,
      TError, { uid: string; params: API.GetUserDataGraphMonitorParams }, TContext>, axios?: AxiosRequestConfig
  }
  ): UseMutationResult<
    Awaited<ReturnType<typeof API.getUserDataGraphMonitor>>,
    TError,
    { uid: string; params: API.GetUserDataGraphMonitorParams },
    TContext
  > => {
  return useMutation(mutationOptions(options));
}
export const useGraphForDownload = injectCommonMutationOptions(useGraphForDownloadQuery);
