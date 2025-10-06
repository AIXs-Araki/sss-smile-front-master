import { injectCommonMutationOptions, injectCommonQueryOptions } from "@/query/injectAuth";
import * as API from "@core/api/api-generated";

export const useRoomList = injectCommonQueryOptions(API.useGetRoomListMonitor)

export const useDeleteRoom = injectCommonQueryOptions(API.useDeleteRoomListMonitor);

export const useAddRoom = injectCommonMutationOptions(API.useAddRoomListMonitor);

export const useEditRoom = injectCommonMutationOptions(API.useEditRoomListMonitor);

export const useRoomDetail = injectCommonQueryOptions(API.useGetRoomDataMonitor);


export const useGroupList = injectCommonQueryOptions(API.useGetGroupNameMonitor);

export const useSaveGroupList = injectCommonMutationOptions(API.useEditGroupNameMonitor);

export const useAvailableUserList = injectCommonQueryOptions(API.useGetUserChoicesMonitor);