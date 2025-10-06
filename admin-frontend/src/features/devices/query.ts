import { injectCommonMutationOptions, injectCommonQueryOptions } from "@/lib/injectAuth";
import * as API from "@core/api/api-generated";
import { useMutation, type MutationFunction, type UseMutationOptions, type UseMutationResult } from "@tanstack/react-query";
import type { AxiosError, AxiosRequestConfig } from "axios";


// デバイスの一覧を取得
export const useDeviceList = injectCommonQueryOptions(API.useGetDeviceListManage)

// デバイス登録画面の種類の選択肢
export const useDeviceKindList = injectCommonQueryOptions(API.useGetDeviceKindsManage)

// CSV でデバイス一括登録
// export const useDownloadSampleCsv = injectCommonQueryOptions(API.useGetDeviceRegisterCsvManage)

// デバイスの削除
export const useDeleteDevice = injectCommonMutationOptions(API.useDeleteDeviceManage);

// デバイス1台登録
export const useAddDevice = injectCommonMutationOptions(API.useAddDeviceListManage);

// デバイスの編集
export const useEditDevice = injectCommonMutationOptions(API.useEditDeviceListManage);



export const getUserCsvMutationOptions = <TError = AxiosError<API.GeneralError>,
  TContext = unknown>(options?: { mutation?: UseMutationOptions<Awaited<ReturnType<typeof API.getDeviceRegisterCsvManage>>, TError, unknown, TContext>, axios?: AxiosRequestConfig }
  ): UseMutationOptions<Awaited<ReturnType<typeof API.getDeviceRegisterCsvManage>>, TError, unknown, TContext> => {
  const mutationKey = ['useDownloadDeviceRegisterSampleCsv'];
  const { mutation: mutationOptions, axios: axiosOptions } = options ?
    options.mutation && 'mutationKey' in options.mutation && options.mutation.mutationKey ?
      options
      : { ...options, mutation: { ...options.mutation, mutationKey } }
    : { mutation: { mutationKey, }, axios: undefined };
  const mutationFn: MutationFunction<Awaited<ReturnType<typeof API.getDeviceRegisterCsvManage>>>
    = () => {
      return API.getDeviceRegisterCsvManage(axiosOptions)
    }
  return { mutationFn, ...mutationOptions }
}

export const useGetSampleCsv = <TError = AxiosError<API.GeneralError>,
  TContext = unknown>(options?: {
    mutation?: UseMutationOptions<Awaited<ReturnType<typeof API.getDeviceRegisterCsvManage>>,
      TError, unknown, TContext>, axios?: AxiosRequestConfig
  }
  ): UseMutationResult<
    Awaited<ReturnType<typeof API.getDeviceRegisterCsvManage>>,
    TError,
    unknown,
    TContext
  > => {

  const mutationOptions = getUserCsvMutationOptions(options);

  return useMutation(mutationOptions);
}
export const useDownloadSampleCsv = injectCommonMutationOptions(useGetSampleCsv);
