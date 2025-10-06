/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios';
import { AxiosError } from 'axios';
import { eventHub } from '../lib/eventHub';

// axiosのレスポンスインターセプターでグローバルエラーハンドリング
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !window.location.pathname.includes('/login')) {
      console.log('Unauthorized error detected, redirecting to login');
      document.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const ErrorCode = {
  BadRequest: 400,
  Unauthorized: 401,
  Forbidden: 403,
  NotFound: 404,
  TooManyRequest: 429,
}
// Configure axios to encode colons in query parameters
axios.defaults.paramsSerializer = {
  encode: (param: string) => encodeURIComponent(param)
};

// axiosのレスポンスインターセプターでグローバルエラーハンドリング
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Axios interceptor error2:', error);
    handleCommonError()(error)
    return Promise.reject(error);
  }
);

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

  // cognito のログイン画面へリダイレクト
  if (statusCode === ErrorCode.Unauthorized) {
    eventHub.publish('TokenExpired');
    console.error({ message: "", type: "error" });
    return;
  }

  if (!statusCode || (statusCode >= 400 && statusCode < 500)) {
    console.error({ message: "", type: "error" });
    return;
  }

  if (statusCode >= 500 || statusCode === ErrorCode.NotFound) {
    console.error({ message: "", type: "error" });
    return;
  }
  console.error({ message: "", type: "error" });
}
