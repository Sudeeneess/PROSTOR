const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL as string | undefined
)?.replace(/\/$/, '') || 'http://localhost:8080';

/** Роль из JWT/API: ADMIN, ROLE_CUSTOMER, customer → каноническое имя для guards. */
export function normalizeRole(role: string | undefined | null): string {
  if (role == null || String(role).trim() === '') return 'customer';
  let r = String(role).trim().toLowerCase().replace(/^role_/, '');
  if (r === 'administrator') r = 'admin';
  if (r === 'warehouse' || r === 'warehousemanager' || r === 'warehouse_manager')
    r = 'warehouse_manager';
  return r;
}

/** Роль считается покупательской (витрина + личный кабинет клиента). */
export function isBuyerPortalRole(role: string | undefined | null): boolean {
  const r = (role ?? '').toLowerCase();
  return r === 'customer' || r === 'user';
}

function defaultPathForRole(role: string): string {
  switch (role) {
    case 'admin':
      return '/admin';
    case 'seller':
      return '/seller/dashboard';
    case 'warehouse_manager':
      return '/warehouse/dashboard';
    default:
      return '/customer';
  }
}

/** Разрешить redirectUrl только если путь соответствует роли (иначе ловим «покупатель → /seller»). */
function isRedirectAllowedForRole(role: string, pathnameWithQuery: string): boolean {
  const path = pathnameWithQuery.split('#')[0] ?? pathnameWithQuery;
  const pathname = path.split('?')[0] || path;
  switch (role) {
    case 'admin':
      return pathname === '/admin' || pathname.startsWith('/admin/');
    case 'seller':
      return pathname.startsWith('/seller');
    case 'warehouse_manager':
      return pathname.startsWith('/warehouse');
    case 'customer':
    case 'user':
      return (
        pathname.startsWith('/customer') ||
        pathname.startsWith('/profile') ||
        pathname.startsWith('/orders') ||
        pathname.startsWith('/basket') ||
        pathname.startsWith('/order-formalization') ||
        pathname.startsWith('/catalog') ||
        pathname.startsWith('/product/')
      );
    default:
      return pathname.startsWith('/customer') || pathname.startsWith('/profile');
  }
}

/** Куда вести после успешного логина (redirectUrl от API только если безопасен для роли). */
export function resolveAfterLogin(data: LoginResponse): string {
  const fallback = defaultPathForRole(data.role);
  const url = data.redirectUrl?.trim();
  if (url) {
    try {
      let path = '';
      if (url.startsWith('http://') || url.startsWith('https://')) {
        const u = new URL(url);
        if (u.origin === window.location.origin) {
          path = `${u.pathname}${u.search}${u.hash}`;
        }
      } else if (url.startsWith('/')) {
        path = url;
      }
      if (path && isRedirectAllowedForRole(data.role, path)) {
        return path;
      }
    } catch {
      /* ignore */
    }
  }
  return fallback;
}

/** Выбор роли из списка authorities (не только [0] — порядок в Spring не гарантирован). */
function pickRoleFromAuthorities(authorities: unknown): string {
  if (!Array.isArray(authorities)) return '';
  const normalized = authorities
    .filter((a): a is string => typeof a === 'string' && a.length > 0)
    .map((a) => normalizeRole(a));
  const priority = ['admin', 'warehouse_manager', 'seller', 'customer', 'user'];
  for (const p of priority) {
    if (normalized.includes(p)) return p;
  }
  return normalized[0] ?? '';
}

function pickToken(body: Record<string, unknown>): string | undefined {
  const t = body.token ?? body.accessToken ?? body.access_token;
  return typeof t === 'string' && t.length > 0 ? t : undefined;
}

/** Ответ логина/регистрации может быть плоским или вложенным в `data`. */
/** Сообщение об ошибке: message / error или строки полей валидации { phone: "…", role: "…" }. */
function extractApiErrorMessage(data: unknown): string {
  if (data == null) return '';
  if (typeof data === 'string') return data;
  if (typeof data !== 'object') return '';
  const o = data as Record<string, unknown>;
  if (typeof o.message === 'string') return o.message;
  if (typeof o.error === 'string') return o.error;
  const pieces: string[] = [];
  for (const v of Object.values(o)) {
    if (typeof v === 'string' && v.length) pieces.push(v);
    else if (Array.isArray(v))
      for (const x of v) {
        if (typeof x === 'string') pieces.push(x);
      }
  }
  return pieces.join(' ') || '';
}

function unwrapAuthBody(raw: unknown): Record<string, unknown> {
  if (!raw || typeof raw !== 'object') return {};
  const o = raw as Record<string, unknown>;
  const inner = o.data;
  if (inner && typeof inner === 'object' && !Array.isArray(inner)) {
    return inner as Record<string, unknown>;
  }
  return o;
}

function parseLoginPayload(raw: unknown): LoginResponse | null {
  const body = unwrapAuthBody(raw);
  const token = pickToken(body);
  if (!token) return null;
  const username =
    (typeof body.username === 'string' && body.username) ||
    (typeof body.sub === 'string' && body.sub) ||
    '';
  const roleFromField = typeof body.role === 'string' ? body.role.trim() : '';
  const roleFromAuthorities = pickRoleFromAuthorities(body.authorities);
  const roleRaw =
    roleFromField ||
    (roleFromAuthorities.trim() ? roleFromAuthorities : '') ||
    'customer';
  const type = typeof body.type === 'string' ? body.type : 'Bearer';
  const expiresIn =
    typeof body.expiresIn === 'number'
      ? body.expiresIn
      : typeof body.expires_in === 'number'
        ? body.expires_in
        : undefined;
  const redirectUrl =
    typeof body.redirectUrl === 'string'
      ? body.redirectUrl
      : typeof body.redirect_url === 'string'
        ? body.redirect_url
        : '';
  return {
    token,
    type,
    username,
    role: normalizeRole(roleRaw),
    expiresIn: expiresIn ?? 0,
    redirectUrl: redirectUrl ?? '',
  };
}

function createHttpError(status: number, message: string): Error & { status: number } {
  const error = new Error(message) as Error & { status: number };
  error.status = status;
  return error;
}

export interface LoginData {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  password: string;
  confirmPassword: string;
  /** 11 цифр, как ожидает бэкенд (например 79001234567). */
  phone: string;
  /** Роль в терминах API; для покупателя — CUSTOMER, для продавца — SELLER. */
  role?: string;
  /** Для регистрации продавца. */
  inn?: string;
  /** Для регистрации продавца. */
  companyName?: string;
  /** Локальное имя (не в JSON регистрации, только для UI). */
  displayName?: string;
}

export interface LoginResponse {
  token: string;
  type: string;
  username: string;
  /** Уже нормализованная роль (customer, admin, …). */
  role: string;
  expiresIn: number;
  redirectUrl: string;
}

export interface AuthResponse {
  success: boolean;
  data?: LoginResponse;
  error?: string;
  status?: number;
  /** Регистрация прошла, но сервер не выдал JWT — показать форму входа. */
  needsLogin?: boolean;
}

// ========== НОВЫЕ ТИПЫ ==========

export interface Product {
  id: number;
  name: string;
  price: number;
  sellerId: number;
  categoryId: number;
  parentId?: number | null;
}

export interface ProductsResponse {
  content: Product[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface OrderItem {
  productId: number;
  amount: number;
}

export interface CreateOrderRequest {
  customerId: number;
  statusId: number;
  items: OrderItem[];
}

export interface Category {
  id: number;
  categoryName: string;
}

// ========== API СЕРВИС ==========

class ApiService {
  /** Единая запись сессии: localStorage + sessionStorage для существующих guards. */
  persistAuth(response: LoginResponse): void {
    localStorage.setItem('token', response.token);
    localStorage.setItem(
      'user',
      JSON.stringify({
        username: response.username,
        role: response.role,
      })
    );
    sessionStorage.setItem('userRole', response.role);

    if (response.type) {
      localStorage.setItem('tokenType', response.type);
    }
    if (response.expiresIn) {
      localStorage.setItem('expiresIn', response.expiresIn.toString());
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = localStorage.getItem('token');

    console.log(`Отправка ${options.method || 'GET'} запроса на:`, url);
    
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

      console.log('Статус ответа:', response.status);

      const responseText = await response.text();
      console.log('Текст ответа:', responseText || '<пустой ответ>');

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

      let data;
      try {
        data = JSON.parse(responseText);
        console.log('Распарсенный JSON:', data);
      } catch (e) {
        console.error('Ошибка парсинга JSON:', e);
        throw new Error(`Сервер вернул невалидный JSON: ${responseText.substring(0, 100)}`);
      }

      if (!response.ok) {
        const errText = extractApiErrorMessage(data);
        throw createHttpError(response.status, errText || `Ошибка ${response.status}`);
      }

      return data as T;
      
    } catch (error) {
      console.error('Ошибка в request:', error);
      throw error;
    }
  }

  // ========== АУТЕНТИФИКАЦИЯ ==========
  
  async login(credentials: LoginData): Promise<AuthResponse> {
    try {
      const raw = await this.request<unknown>('/api/auth/login', {
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

      this.persistAuth(parsed);

      return {
        success: true,
        data: parsed,
      };
      
    } catch (error) {
      console.error('Ошибка при входе:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Ошибка при входе',
        status: (error as any).status
      };
    }
  }

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

      const raw = await this.request<unknown>('/api/auth/register', {
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
        this.persistAuth(parsed);
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
        status: (error as any).status
      };
    }
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('tokenType');
    localStorage.removeItem('expiresIn');
    sessionStorage.removeItem('userRole');
  }

  /** Роль для guards: сначала `user` в localStorage, иначе sessionStorage (обратная совместимость). */
  getStoredUserRole(): string | null {
    try {
      const raw = localStorage.getItem('user');
      if (raw) {
        const u = JSON.parse(raw) as { role?: string };
        if (u?.role != null && String(u.role).trim() !== '') {
          const r = String(u.role).toLowerCase();
          // На бэкенде при отсутствии роли в БД подставляется USER — для витрины это клиент
          if (r === 'user') return 'customer';
          return r;
        }
      }
    } catch {
      /* ignore */
    }
    const s = sessionStorage.getItem('userRole');
    if (!s) return null;
    const low = s.toLowerCase();
    return low === 'user' ? 'customer' : low;
  }

  getCurrentUser(): { username: string; role: string } | null {
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

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getTokenType(): string | null {
    return localStorage.getItem('tokenType') || 'Bearer';
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    return !!token;
  }

  getAuthHeaders(): HeadersInit {
    const token = this.getToken();
    const tokenType = this.getTokenType();
    
    return {
      'Authorization': `${tokenType} ${token}`,
      'Content-Type': 'application/json',
    };
  }

  // ========== ТОВАРЫ ==========

  async getProducts(filters?: {
    categoryId?: number;
    sellerId?: number;
    minPrice?: number;
    maxPrice?: number;
    name?: string;
    page?: number;
    size?: number;
  }): Promise<{ success: boolean; data?: ProductsResponse; error?: string }> {
    try {
      const queryParams = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, value.toString());
          }
        });
      }
      
      const queryString = queryParams.toString();
      const endpoint = `/api/products${queryString ? `?${queryString}` : ''}`;
      
      const response = await this.request<ProductsResponse>(endpoint);
      
      return {
        success: true,
        data: response
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Ошибка загрузки товаров'
      };
    }
  }

  async getProductById(id: number): Promise<{ success: boolean; data?: Product; error?: string }> {
    try {
      const response = await this.request<Product>(`/api/products/${id}`);
      return {
        success: true,
        data: response
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Ошибка загрузки товара'
      };
    }
  }

  // ========== КАТЕГОРИИ ==========

  async getCategories(page: number = 0): Promise<{ success: boolean; data?: Category[]; error?: string }> {
    try {
      const response = await this.request<any>(`/api/categories?page=${page}`);
      
      // API возвращает пагинированный ответ
      const categories = response.content || response;
      
      return {
        success: true,
        data: Array.isArray(categories) ? categories : []
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Ошибка загрузки категорий'
      };
    }
  }

  // ========== ЗАКАЗЫ ==========

  async createOrder(orderData: CreateOrderRequest): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const response = await this.request('/api/orders', {
        method: 'POST',
        body: JSON.stringify(orderData)
      });
      
      return {
        success: true,
        data: response
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Ошибка создания заказа'
      };
    }
  }

  // ========== ПРОФИЛЬ ==========

  async getCustomerDashboard(): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const response = await this.request('/api/customer/dashboard');
      return {
        success: true,
        data: response
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Ошибка загрузки данных покупателя'
      };
    }
  }
}

export const api = new ApiService();