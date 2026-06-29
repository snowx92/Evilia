import axios, {
  AxiosError,
  AxiosHeaders,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from 'axios';
import { ApiError, type ApiResponse, type ApiErrorPayload } from '@/types/api';
import { env } from '@/lib/env';

// Lazy import to avoid a circular dep between store -> client.
type TokenProvider = () => string | null;
type OnUnauthorized = () => void;

let tokenProvider: TokenProvider = () => null;
let onUnauthorized: OnUnauthorized = () => {};

export function configureAuthBridge(opts: {
  getToken: TokenProvider;
  onUnauthorized: OnUnauthorized;
}) {
  tokenProvider = opts.getToken;
  onUnauthorized = opts.onUnauthorized;
}

export const api: AxiosInstance = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 30_000,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = tokenProvider();
  if (token) {
    const headers = AxiosHeaders.from(config.headers);
    headers.set('Authorization', `Bearer ${token}`);
    config.headers = headers;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorPayload | ApiResponse<unknown>>) => {
    if (error.response?.status === 401) {
      onUnauthorized();
    }

    const body = error.response?.data;
    const status = error.response?.status ?? 0;
    let message = error.message;
    let code: string | undefined;
    let fieldErrors: Record<string, string[]> | undefined;

    if (body && typeof body === 'object') {
      if ('message' in body && typeof body.message === 'string') message = body.message;
      if ('code' in body && typeof (body as ApiErrorPayload).code === 'string') {
        code = (body as ApiErrorPayload).code;
      }
      if ('errors' in body) fieldErrors = (body as ApiErrorPayload).errors;
    }

    return Promise.reject(new ApiError({ status, message, code, errors: fieldErrors }));
  },
);

/**
 * Most Luna Care responses wrap their payload as `{ status, message, data }`.
 * This helper unwraps `data` while keeping the raw envelope for debugging.
 */
export async function unwrap<T>(promise: Promise<{ data: ApiResponse<T> }>): Promise<T> {
  const res = await promise;
  return res.data.data;
}
