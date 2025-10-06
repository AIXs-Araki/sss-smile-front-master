/* eslint-disable @typescript-eslint/no-explicit-any */
import { injectCommonMutationOptions } from "@/query/injectAuth";
import * as API from "@core/api/api-generated";

export const useResetPassword = injectCommonMutationOptions(API.useRequestResetPasswordMonitor)


export const useRequestAuthCode = injectCommonMutationOptions(API.useRequestAuthorizationMonitor)