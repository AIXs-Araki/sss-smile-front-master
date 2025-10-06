import { injectCommonMutationOptions } from "@/lib/injectAuth";
import * as API from "@core/api/api-generated";

export const useLogin = injectCommonMutationOptions(API.useLoginManage)

export const useLogout = injectCommonMutationOptions(API.useLogoutManage)