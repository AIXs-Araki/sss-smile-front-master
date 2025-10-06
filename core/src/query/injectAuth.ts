import { AxiosError, AxiosRequestConfig } from 'axios';
import { ReactNode, useContext, useCallback, createContext } from 'react';

import { env } from '../env';

export type InvalidRequest = {
  // レスポンスされるエラーの型定義をより具体的にすると、さらに安全になります
  //例: message: string; code: number;
}

export interface AuthStorage {
  getToken: () => string | null;
}

export interface InjectAxiosOptions {
  (axiosOptions: AxiosRequestConfig): void;
}

// より柔軟なオプション
export type HTTPOptions = {
  // 特定のHTTPステータスコードを無視する
  ignoreStatusCodes?: number[];
  // 特定のHTTPステータスコードのデフォルトエラー処理を上書きする
  errorHandlers?: {
    [statusCode: number]: (error: AxiosError<InvalidRequest>) => void;
  };
  // (旧: errorMessages) API固有のエラーコードに対するカスタムメッセージ
  customErrorMessages?: Map<number, string | ((response: any) => ReactNode)>;
  gotoLogin: () => void;
  injectAxiosOptions?: InjectAxiosOptions;
}

const ErrorCode = {
  BadRequest: 400,
  Unauthorized: 401,
  Forbidden: 403,
  NotFound: 404,
  TooManyRequest: 429,
} as const;

export type OpenModal = (input: { type: "completed" | "error"; message: string | null | ReactNode; }) => void

export const CompletedModalContext = createContext<OpenModal>(() => { });

/**
 * API呼び出しにおける共通エラーハンドラを生成するカスタムフック
 * @param httpOptions API呼び出しごとに指定されるカスタムオプション
 * @returns react-queryのonErrorに渡すためのエラー処理関数
 */
export function useApiErrorHandler(httpOptions: HTTPOptions) {
  const openModal = useContext(CompletedModalContext);

  return useCallback((userOnError?: (error: any) => void) => (error: AxiosError<InvalidRequest>) => {
    console.error("API Error:", error);

    const statusCode = error.response?.status;

    // ユーザーが指定したonErrorを先に実行
    userOnError?.(error);

    if (!statusCode) {
      openModal({ message: "ネットワークエラーが発生しました", type: "error" });
      return;
    }

    // 1. 無視するステータスコードかチェック
    if (httpOptions?.ignoreStatusCodes?.includes(statusCode)) {
      return;
    }

    // 2. オーバーライド用のハンドラが指定されていれば実行
    if (httpOptions?.errorHandlers && httpOptions.errorHandlers[statusCode]) {
      httpOptions.errorHandlers[statusCode](error);
      return;
    }

    switch (statusCode) {
      case ErrorCode.Unauthorized:
        httpOptions.gotoLogin();
        break;
      case ErrorCode.Forbidden:
        openModal({ message: "エラーが発生しました", type: "error" });
        break;
      case ErrorCode.NotFound:
        openModal({ message: "サーバーエラーが発生しました", type: "error" });
        break;
      default:
        if (statusCode >= 500) {
          openModal({ message: "サーバーエラーが発生しました", type: "error" });
        } else if (statusCode >= 400) {
          openModal({ message: "エラーが発生しました", type: "error" });
        }
        break;
    }
  }, [openModal, httpOptions]);
}

/**
 * 共通のmutation用オプションを生成するフック
 */
export function useCommonMutationOptions(httpOptions: HTTPOptions) {
  const errorHandler = useApiErrorHandler(httpOptions);

  return useCallback(<T extends Record<string, any>>(userOptions?: T): T => {
    const options = { ...userOptions } as T;
    (options as any).mutation ||= {};
    (options as any).axios ||= {};

    const originalOnError = (options as any).mutation.onError;
    (options as any).mutation.onError = errorHandler(originalOnError);

    if (httpOptions.injectAxiosOptions) {
      httpOptions.injectAxiosOptions((options as any).axios);
    }

    return options;
  }, [errorHandler, httpOptions]);
}