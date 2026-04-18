import type { RequestFn } from '../client';
import type { LoginData, RegisterData, AuthResponse, LoginResponse } from '../types/auth';
import { getErrorStatus } from '../utils/httpError';
import { parseLoginPayload, parsePositiveIntId } from '../utils/authPayload';

export function createAuthService(request: RequestFn) {
  function getCurrentUser(): { username: string; role: string; customerId?: number } | null {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        console.error('Ошибка парсинга данных пользователя');
        return null;
      }
    }
    return null;
  }

  function persistAuth(response: LoginResponse): void {
    localStorage.setItem('token', response.token);
    const userPayload: {
      username: string;
      role: string;
      customerId?: number;
    } = {
      username: response.username,
      role: response.role,
    };
    if (response.customerId != null && response.customerId > 0) {
      userPayload.customerId = response.customerId;
    }
    localStorage.setItem('user', JSON.stringify(userPayload));
    sessionStorage.setItem('userRole', response.role);
    if (response.username?.trim()) {
      sessionStorage.setItem('userName', response.username.trim());
    }

    if (response.type) {
      localStorage.setItem('tokenType', response.type);
    }
    if (response.expiresIn) {
      localStorage.setItem('expiresIn', response.expiresIn.toString());
    }
  }

  return {
    persistAuth,

    async login(credentials: LoginData): Promise<AuthResponse> {
      try {
        const raw = await request<unknown>('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({
            username: credentials.username,
            password: credentials.password,
          }),
        });

        const parsed = parseLoginPayload(raw);
        if (!parsed) {
          throw new Error('Сервер не вернул токен');
        }

        persistAuth(parsed);

        return {
          success: true,
          data: parsed,
        };
      } catch (error) {
        console.error('Ошибка при входе:', error);

        return {
          success: false,
          error: error instanceof Error ? error.message : 'Ошибка при входе',
          status: getErrorStatus(error),
        };
      }
    },

    async register(userData: RegisterData): Promise<AuthResponse> {
      try {
        if (userData.password !== userData.confirmPassword) {
          throw new Error('Пароли не совпадают');
        }

        if (userData.password.length < 6) {
          throw new Error('Пароль должен быть не менее 6 символов');
        }

        const phoneDigits = userData.phone.replace(/\D/g, '');
        if (phoneDigits.length !== 11) {
          throw new Error('Телефон: ровно 11 цифр (например 79001234567)');
        }

        const role = (userData.role ?? 'CUSTOMER').toUpperCase();
        const innDigits = userData.inn ? userData.inn.replace(/\D/g, '') : '';
        const companyName = userData.companyName?.trim() ?? '';

        const raw = await request<unknown>('/api/auth/register', {
          method: 'POST',
          body: JSON.stringify({
            username: userData.username,
            password: userData.password,
            phone: phoneDigits,
            role,
            inn: innDigits || null,
            companyName: companyName || null,
          }),
        });

        const parsed = parseLoginPayload(raw);
        if (parsed) {
          persistAuth(parsed);
          return { success: true, data: parsed };
        }

        return {
          success: true,
          needsLogin: true,
        };
      } catch (error) {
        console.error('Ошибка при регистрации:', error);

        return {
          success: false,
          error: error instanceof Error ? error.message : 'Ошибка при регистрации',
          status: getErrorStatus(error),
        };
      }
    },

    logout(): void {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('tokenType');
      localStorage.removeItem('expiresIn');
      localStorage.removeItem('userName');
      localStorage.removeItem('userPhone');
      localStorage.removeItem('userFirstName');
      localStorage.removeItem('userLastName');
      localStorage.removeItem('username');
      localStorage.removeItem('sellerProfile');
      localStorage.removeItem('adminProfile');
      sessionStorage.removeItem('userRole');
      sessionStorage.removeItem('userName');
    },

    getStoredUserRole(): string | null {
      try {
        const raw = localStorage.getItem('user');
        if (raw) {
          const u = JSON.parse(raw) as { role?: string };
          if (u?.role != null && String(u.role).trim() !== '') {
            const r = String(u.role).toLowerCase();
            if (r === 'user') return 'customer';
            return r;
          }
        }
      } catch {
      }
      const s = sessionStorage.getItem('userRole');
      if (!s) return null;
      const low = s.toLowerCase();
      return low === 'user' ? 'customer' : low;
    },

    getCurrentUser,

    getStoredCustomerId(): number | null {
      const u = getCurrentUser();
      if (!u) return null;
      return parsePositiveIntId(u.customerId);
    },

    getToken(): string | null {
      return localStorage.getItem('token');
    },

    getTokenType(): string | null {
      return localStorage.getItem('tokenType') || 'Bearer';
    },

    isAuthenticated(): boolean {
      const token = localStorage.getItem('token');
      return !!token;
    },

    getAuthHeaders(): HeadersInit {
      const token = localStorage.getItem('token');
      const tokenType = localStorage.getItem('tokenType') || 'Bearer';

      return {
        Authorization: `${tokenType} ${token}`,
        'Content-Type': 'application/json',
      };
    },
  };
}
