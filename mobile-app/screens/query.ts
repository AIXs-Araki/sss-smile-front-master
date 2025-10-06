import { injectCommonMutationOptions, injectCommonQueryOptions } from "../lib/injectAuth";
import * as API from "../api-generated";

// TODO 確認
export const useGroupList = injectCommonQueryOptions(API.useGetGroupNameMonitor);

export const useLogin = injectCommonMutationOptions(API.useLoginSmartphone)
export const useAuthCode = injectCommonMutationOptions(API.useRequestAuthorizationSmartphone)

export const useLogout = injectCommonMutationOptions(API.useLogoutSmartphone)

export const useUserMatrix = injectCommonQueryOptions(API.useGetUserDataMatrixApplication)

export const useUserDetail = injectCommonQueryOptions(API.useGetUserDataApplication)

export const useClearAlert = injectCommonMutationOptions(API.useClearAlertApplication)

export const useSendPushNotificationToken = injectCommonMutationOptions(API.useAddNotificationKeySmartphone);

export const useDeletePushNotificationToken = injectCommonMutationOptions(API.useDeleteNotificationKeySmartphone);

export const useUpdatePusnhNotificaitonGroup = injectCommonMutationOptions(API.useEditNotificationGroupSmartphone);

export const usePusnhNotificaitonGroup = injectCommonQueryOptions(API.useGetNotificationGroupSmartphone);

export const useSavePushNotiGroup = injectCommonMutationOptions(API.useEditNotificationGroupSmartphone);
