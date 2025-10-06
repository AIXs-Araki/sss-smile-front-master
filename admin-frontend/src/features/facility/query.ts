import { injectCommonMutationOptions, injectCommonQueryOptions } from "@/lib/injectAuth";
import * as API from "@core/api/api-generated";
import { useMutation, type MutationFunction, type UseMutationOptions, type UseMutationResult } from "@tanstack/react-query";
import type { AxiosError, AxiosRequestConfig } from "axios";


export const useFacilityList = injectCommonQueryOptions(API.useGetFacilitiesListManage)

export const useFacility = injectCommonQueryOptions(API.useGetFacilitiesManage);

export const useDeleteFacility = injectCommonQueryOptions(API.useDeleteFacilitiesListManage);

export const useAddFacility = injectCommonMutationOptions(API.useAddFacilitiesManage);

export const useEditFacility = injectCommonMutationOptions(API.useEditFacilitiesManage);

export const useAddCorporate = injectCommonMutationOptions(API.useAddCorporationsManage);

export const useEditCorporate = injectCommonMutationOptions(API.useEditCorporationsManage);

export const useUploadCsv = injectCommonMutationOptions(API.useAddUserListCsvManage);


export const getUserCsvMutationOptions = <TError = AxiosError<API.GeneralError>,
  TContext = unknown>(options?: { mutation?: UseMutationOptions<Awaited<ReturnType<typeof API.getUserListCsvManage>>, TError, { cid: number, fid: string }, TContext>, axios?: AxiosRequestConfig }
  ): UseMutationOptions<Awaited<ReturnType<typeof API.getUserListCsvManage>>, TError, { cid: number, fid: string }, TContext> => {
  const mutationKey = ['useDownloadUserListCsv'];
  const { mutation: mutationOptions, axios: axiosOptions } = options ?
    options.mutation && 'mutationKey' in options.mutation && options.mutation.mutationKey ?
      options
      : { ...options, mutation: { ...options.mutation, mutationKey } }
    : { mutation: { mutationKey, }, axios: undefined };
  const mutationFn: MutationFunction<Awaited<ReturnType<typeof API.getUserListCsvManage>>, { cid: number, fid: string }>
    = (props) => {
      return API.getUserListCsvManage(props.cid, props.fid, axiosOptions)
    }
  return { mutationFn, ...mutationOptions }
}

export const useGetUserCsv = <TError = AxiosError<API.GeneralError>,
  TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof API.getUserListCsvManage>>,
      TError, { cid: number, fid: string }, TContext>, axios?: AxiosRequestConfig
  }
  ): UseMutationResult<
    Awaited<ReturnType<typeof API.getUserListCsvManage>>,
    TError,
    { cid: number, fid: string },
    TContext
  > => {

  const mutationOptions = getUserCsvMutationOptions(options);

  return useMutation(mutationOptions);
}
export const useDownloadCsv = injectCommonMutationOptions(useGetUserCsv);
