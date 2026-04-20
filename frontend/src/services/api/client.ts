import { createHttpError } from './utils/httpError';
import { extractApiErrorMessage } from './utils/apiErrorMessage';

export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL as string | undefined
)?.replace(/\/$/, '') || (
  import.meta.env.DEV
    ? 'http://localhost:8080'
    : ''
);

export type RequestFn = <T>(
  endpoint: string,
  options?: RequestInit
) => Promise<T>;

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = localStorage.getItem('token');
  const dev = import.meta.env.DEV;

  if (dev) {
    console.log(`[API] ${options.method || 'GET'}`, url);
  }

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const responseText = await response.text();
    if (dev) {
      const preview = responseText ? responseText.slice(0, 200) : '(пусто)';
      console.log('[API] статус', response.status, preview);
    }

    if (!responseText) {
      if (!response.ok) {
        const message =
          response.status === 401
            ? 'Неверное имя пользователя или пароль'
            : `Ошибка ${response.status}: Пустой ответ от сервера`;
        throw createHttpError(response.status, message);
      }
      return {} as T;
    }

    let data: unknown;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      if (dev) console.error('[API] невалидный JSON', e);
      throw new Error(`Сервер вернул невалидный JSON: ${responseText.substring(0, 100)}`);
    }

    if (!response.ok) {
      const errText = extractApiErrorMessage(data);
      throw createHttpError(response.status, errText || `Ошибка ${response.status}`);
    }

    return data as T;
  } catch (error) {
    if (dev) console.error('[API] ошибка запроса', error);
    throw error;
  }
}
