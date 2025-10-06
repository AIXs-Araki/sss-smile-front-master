import { injectCommonQueryOptions } from "@/lib/injectAuth";
import * as API from "@core/api/api-generated";

export const useCorporateList = injectCommonQueryOptions(API.useGetCorporationsManage)

export const useDeleteCorporate = injectCommonQueryOptions(API.useDeleteCorporationsManage);
