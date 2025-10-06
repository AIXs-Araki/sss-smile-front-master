/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useAuth } from '@/contexts/AuthContext';
import { type AxiosRequestConfig } from 'axios';



export function injectCommonQueryOptions<T extends (...args: any[]) => any>(useHook: T): T {
  function wrapped(...args: Parameters<T>): ReturnType<T> {
    const lastArg = args[args.length - 1];
    let options: any;
    const injectAxiosOptions = useInjectAxiosOptions();

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
    const injectAxiosOptions = useInjectAxiosOptions();

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



export function useInjectAxiosOptions() {
  const { token } = useAuth(); // ★ フック内での呼び出しに修正

  const injectOptions = (axiosOptions: AxiosRequestConfig<any>) => {
    axiosOptions.headers ||= {};
    if (token) {
      axiosOptions.headers['Authorization'] = `Bearer ${token}`;
      axiosOptions.headers['AccessToken'] = token;
    }
    axiosOptions.headers["Content-Type"] = "application/json";
    axiosOptions.baseURL = import.meta.env.VITE_API_BASE_URL;
    console.log(axiosOptions)
  };

  // 注入ロジックを関数として返す
  return injectOptions;
}