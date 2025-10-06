import { useLoginMonitor } from "@core/api/api-generated";
import { injectCommonMutationOptions } from "./injectAuth";

export const useLogin = injectCommonMutationOptions(useLoginMonitor)
