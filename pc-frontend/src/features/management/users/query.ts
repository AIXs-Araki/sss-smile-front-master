import { injectCommonMutationOptions, injectCommonQueryOptions } from "@/query/injectAuth";
import * as API from "@core/api/api-generated";
import { type GetUserInformationMonitorParams } from '@core/api/api-generated';
import { useMutation, type MutationFunction, type UseMutationOptions, type UseMutationResult } from "@tanstack/react-query";
import type { AxiosError, AxiosRequestConfig } from "axios";

export const useUserList = injectCommonQueryOptions(API.useGetUserInformationListMonitor)

export const useLineStaff = injectCommonQueryOptions(API.useGetStaffChoicesMonitor);

export const useDeleteUser = injectCommonQueryOptions(API.useDeleteUserInformationMonitor);

export const useAddUser = injectCommonMutationOptions(API.useAddUserInformationMonitor);

export const useEditUser = injectCommonMutationOptions(API.useEditUserInformationMonitor);

export const useUserDetail = injectCommonQueryOptions(API.useGetUserInformationMonitor);


export const getAddUserInformationMonitorMutationOptions = <TError = AxiosError<API.GeneralError>,
  TContext = unknown>(options?: { mutation?: UseMutationOptions<Awaited<ReturnType<typeof API.getUserInformationMonitor>>, TError, { uid: string; params: GetUserInformationMonitorParams }, TContext>, axios?: AxiosRequestConfig }
  ): UseMutationOptions<Awaited<ReturnType<typeof API.getUserInformationMonitor>>, TError, { uid: string; params: GetUserInformationMonitorParams }, TContext> => {
  const mutationKey = ['useGetUserInformationMonitorMutation'];
  const { mutation: mutationOptions, axios: axiosOptions } = options ?
    options.mutation && 'mutationKey' in options.mutation && options.mutation.mutationKey ?
      options
      : { ...options, mutation: { ...options.mutation, mutationKey } }
    : { mutation: { mutationKey, }, axios: undefined };
  const mutationFn: MutationFunction<Awaited<ReturnType<typeof API.getUserInformationMonitor>>, { uid: string; params: GetUserInformationMonitorParams }>
    = (props) => {
      const { uid, params } = props ?? {};
      return API.getUserInformationMonitor(uid, params, axiosOptions)
    }
  return { mutationFn, ...mutationOptions }
}

export const useAddUserInformationMonitor = <TError = AxiosError<API.GeneralError>,
  TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof API.getUserInformationMonitor>>,
      TError, { uid: string; params: GetUserInformationMonitorParams }, TContext>, axios?: AxiosRequestConfig
  }
  ): UseMutationResult<
    Awaited<ReturnType<typeof API.getUserInformationMonitor>>,
    TError,
    { uid: string; params: GetUserInformationMonitorParams },
    TContext
  > => {

  const mutationOptions = getAddUserInformationMonitorMutationOptions(options);

  return useMutation(mutationOptions);
}
export const useGetUserInformationMonitorMutation = injectCommonMutationOptions(useAddUserInformationMonitor);
