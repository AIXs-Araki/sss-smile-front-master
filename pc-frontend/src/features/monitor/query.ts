import { injectCommonMutationOptions, injectCommonQueryOptions } from "@/query/injectAuth";
import * as API from "@core/api/api-generated";

export const useUserMatrix = injectCommonQueryOptions(API.useGetUserDataMatrixApplication)

export const useUserDetail = injectCommonQueryOptions(API.useGetUserDataApplication)

export const useGroups = injectCommonQueryOptions(API.useGetGroupNameMonitor)

export const useSensorStatus = injectCommonQueryOptions(API.useGetSensorGatewayConditionMonitor)

export const useSaveAlertSetting = injectCommonMutationOptions(API.useEditAlertSettingsMonitor)

export const useClearAlert = injectCommonMutationOptions(API.useClearAlertApplication)