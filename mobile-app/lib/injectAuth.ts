/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { AxiosError, type AxiosRequestConfig } from 'axios';
import axios from 'axios';
import Constants from 'expo-constants';
import { eventHub } from '@core/helpers/eventHub';
import { useAuth } from '../contexts/AuthContext';

// Configure axios to encode colons in query parameters
axios.defaults.paramsSerializer = {
  encode: (param: string) => encodeURIComponent(param)
};

// axiosのレスポンスインターセプターでグローバルエラーハンドリング
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    handleCommonError()(error)
    return Promise.reject(error);
  }
);



export function injectCommonQueryOptions<T extends (...args: any[]) => any>(useHook: T): T {
  function wrapped(...args: Parameters<T>): ReturnType<T> {
    const lastArg = args[args.length - 1];
    let options: any;

    // 最後の引数がオプションオブジェクトか確認
    if (typeof lastArg === "object" && lastArg !== null && !Array.isArray(lastArg) &&
      ('axios' in lastArg || 'query' in lastArg || Object.keys(lastArg).length === 0)) {
      // 既存のオプションを使用
      options = lastArg;
    } else {
      // オプションがないので追加
      options = {};
      args.push(options);
    }

    // 共通処理を注入
    options.axios ||= {};
    injectAxiosOptions(options.axios);

    return useHook(...(args as Parameters<T>));
  }

  return wrapped as T;
}

export function injectCommonMutationOptions<T extends (...args: any[]) => any>(useHook: T): T {
  function wrapped(...args: Parameters<T>): ReturnType<T> {
    const lastArg = args[args.length - 1];
    let options: any;

    // 最後の引数がオプションオブジェクトか確認
    if (typeof lastArg === "object" && lastArg !== null && !Array.isArray(lastArg) &&
      ('axios' in lastArg || 'mutation' in lastArg || Object.keys(lastArg).length === 0)) {
      // 既存のオプションを使用
      options = lastArg;
    } else {
      // オプションがないので追加
      options = {};
      args.push(options);
    }

    // 共通処理を注入
    options.axios ||= {};
    injectAxiosOptions(options.axios);

    return useHook(...(args as Parameters<T>));
  }

  return wrapped as T;
}

export const ErrorCode = {
  BadRequest: 400,
  Unauthorized: 401,
  Forbidden: 403,
  NotFound: 404,
  TooManyRequest: 429,
}
/**
 * 標準的なエラーコードの対応
 * @param openModal
 * @param t
 * @returns
 */
export const handleCommonError = (
  //openModal: OpenModal,
  onError?: ((e: any) => void) | null | undefined
) => (error: AxiosError) => {
  // axios は error.status と error.response.status がある。サーバにリーチできなかったときは error.status, サーバがエラーコードを返したときは error.response.status を読む必要がある。
  // ただし今回の要件では error.response が存在しないケースは一律にエラーとして扱っているので error.status は見ない
  const statusCode = error.response?.status;
  if (onError) onError(error);

  // ログイン画面へリダイレクト
  if (statusCode === ErrorCode.Unauthorized) {
    eventHub.publish('TokenExpired');
    // console.error({ message: "token expired", type: "error" });
    return;
  }

  if (!statusCode || (statusCode >= 400 && statusCode < 500)) {
    // console.error({ message: "400", type: "error" });
    return;
  }

  if (statusCode >= 500 || statusCode === ErrorCode.NotFound) {
    // console.error({ message: "", type: "error" });
    return;
  }
  //console.error({ message: "", type: "error" });
}


export function injectAxiosOptions(axiosOptions: AxiosRequestConfig<any>) {
  axiosOptions.headers ||= {};
  const { token } = useAuth();
  if (token) {
    axiosOptions.headers['Authorization'] = `Bearer ${token}`;
    axiosOptions.headers['AccessToken'] = token;
  }
  axiosOptions.headers["Content-Type"] = "application/json";
  axiosOptions.baseURL = Constants.expoConfig?.extra?.apiBaseUrl
}
