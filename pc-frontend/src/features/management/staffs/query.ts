import { injectCommonMutationOptions, injectCommonQueryOptions } from "@/query/injectAuth";
import * as API from "@core/api/api-generated";

export const useStaffList = injectCommonQueryOptions(API.useGetStaffListMonitor)


export const useDeleteStaff = injectCommonQueryOptions(API.useDeleteStaffMonitor);

export const useAddStaff = injectCommonMutationOptions(API.useAddStaffMonitor);

export const useEditStaff = injectCommonMutationOptions(API.useEditStaffMonitor);

export const useStaffDetail = injectCommonQueryOptions(API.useGetStaffMonitor);
