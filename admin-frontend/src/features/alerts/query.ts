import { injectCommonQueryOptions } from "@/lib/injectAuth";
import * as API from "@core/api/api-generated";

export const useAlertList = injectCommonQueryOptions(API.useGetAlertListManage)
