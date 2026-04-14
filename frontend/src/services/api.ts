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

/**
 * Сообщение об ошибке из тела ответа: `message` / `error` или строки полей валидации.
 * Ответ логина/регистрации может быть плоским или вложенным в `data` (см. `unwrapAuthBody`).
 */
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
    /** Поля вроде customerId могут быть снаружи `data`, а токен — внутри; не теряем верхний уровень. */
    return { ...o, ...(inner as Record<string, unknown>) };
  }
  return o;
}

/** Положительный целочисленный id профиля из ответа логина (customerId и т.п.). */
function parsePositiveIntId(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value) && Number.isInteger(value) && value > 0) {
    return value;
  }
  if (typeof value === 'string' && value.trim() !== '') {
    const n = Number.parseInt(value.trim(), 10);
    if (Number.isFinite(n) && n > 0) return n;
  }
  return null;
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
  const customerId =
    parsePositiveIntId(body.customerId) ?? parsePositiveIntId(body.customer_id);
  const result: LoginResponse = {
    token,
    type,
    username,
    role: normalizeRole(roleRaw),
    expiresIn: expiresIn ?? 0,
    redirectUrl: redirectUrl ?? '',
  };
  if (customerId != null) {
    result.customerId = customerId;
  }
  return result;
}

function createHttpError(status: number, message: string): Error & { status: number } {
  const error = new Error(message) as Error & { status: number };
  error.status = status;
  return error;
}

/** Код ответа из `createHttpError` (если ошибка пришла из `request`). */
function getErrorStatus(error: unknown): number | undefined {
  if (error !== null && typeof error === 'object' && 'status' in error) {
    const s = (error as { status: unknown }).status;
    return typeof s === 'number' ? s : undefined;
  }
  return undefined;
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
  /** Id записи покупателя в БД — приходит в ответе POST /api/auth/login для CUSTOMER. */
  customerId?: number;
}

export interface AuthResponse {
  success: boolean;
  data?: LoginResponse;
  error?: string;
  status?: number;
  /** Регистрация прошла, но сервер не выдал JWT — показать форму входа. */
  needsLogin?: boolean;
}

// ========== ТИПЫ ДАННЫХ API ==========

/** Как Spring отдаёт страницу списка (товары, категории, бренды). */
export interface PageDto<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  sellerId: number;
  categoryId: number;
  parentId?: number | null;
  createdAt?: string;
}

export type ProductsResponse = PageDto<Product>;

/**
 * Тело POST/PUT товара (как ProductRequest в Java).
 * Для POST из кабинета продавца: `sellerId` в JSON всё равно обязателен для валидации,
 * бэкенд потом подставит id текущего продавца — можно временно передать любое положительное число, напр. `1`.
 */
export interface ProductRequest {
  name: string;
  price: number;
  sellerId: number;
  categoryId: number;
  parentId?: number | null;
}

export interface BrandDto {
  id: number;
  name: string;
}

export interface SizeDto {
  id: number;
  name: string;
}

export interface ProductCardResponse {
  id: number;
  productId: number;
  brand?: BrandDto | null;
  size?: SizeDto | null;
  description?: string | null;
  type?: string | null;
  photo?: Array<Record<string, unknown>> | null;
  isActive?: boolean | null;
}

/** Тело POST/PUT /api/products/{productId}/cards — поля как в ProductCardRequest на бэкенде. */
export interface ProductCardRequest {
  productId: number;
  brandId?: number | null;
  sizeId?: number | null;
  description: string;
  type: string;
  photo?: Array<Record<string, unknown>> | null;
  isActive?: boolean;
}

export interface BrandRow {
  id: number;
  name: string;
}

/** Тело POST/PUT /api/brands. */
export interface BrandRequest {
  name: string;
}

/** Тело POST/PUT /api/sizes (поле name, до 30 символов на бэкенде). */
export interface SizeRequest {
  name: string;
}

export interface OrderItem {
  productId: number;
  amount: number;
}

export interface CreateOrderRequest {
  customerId: number;
  statusId?: number;
  items: OrderItem[];
}

export interface OrderStatusDto {
  id: number;
  name: string;
}

/** POST/PUT /api/orders-statuses — обязательное поле name. */
export interface OrderStatusBody {
  name: string;
}

export interface OrderItemResponseDto {
  id: number;
  productId: number;
  productName?: string;
  amount: number;
  sellerCommission?: number;
  netPayout?: number;
  isOrdered?: boolean;
  isFinalized?: boolean;
  soldAt?: string;
}

export interface OrderResponseDto {
  id: number;
  customerId: number;
  status: OrderStatusDto;
  orderDate?: string;
  totalAmount: number;
  items: OrderItemResponseDto[];
}

export interface PaymentDto {
  id: number;
  orderItemId: number;
  status: string;
  createdAt: string;
}

/** Элемент движения по складу (GET /api/order-movements). */
export interface OrderMovementDto {
  id: number;
  warehouseId: number;
  orderItemId: number;
  status: string;
  createdAt?: string;
}

/** Ответ GET /api/customer/dashboard (тело Map из бэкенда). */
export interface CustomerDashboard {
  role: string;
  username: string;
  customerId?: number | null;
  message?: string;
  status?: string;
  redirect?: string;
}

export interface Category {
  id: number;
  categoryName: string;
}

/** Тело POST/PUT /api/categories. */
export interface CategoryRequest {
  categoryName: string;
}

/** Единый размер первой страницы категорий для витрины и меню. */
export const CATEGORIES_LIST_PAGE_SIZE = 100;

const CATEGORIES_LIST_CACHE_MS = 60_000;

type CategoriesListResult = {
  success: boolean;
  data?: PageDto<Category>;
  error?: string;
  status?: number;
};

let categoriesListInflight: Promise<CategoriesListResult> | null = null;
let categoriesListCache: CategoriesListResult | null = null;
let categoriesListCacheAt = 0;

function invalidateCategoriesListCache(): void {
  categoriesListCache = null;
  categoriesListCacheAt = 0;
}

// ========== API СЕРВИС ==========

class ApiService {
  /** Единая запись сессии: localStorage + sessionStorage для существующих guards. */
  persistAuth(response: LoginResponse): void {
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
        status: getErrorStatus(error),
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
        status: getErrorStatus(error),
      };
    }
  }

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

  getCurrentUser(): { username: string; role: string; customerId?: number } | null {
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

  /** customerId, сохранённый при входе (ответ логина). */
  getStoredCustomerId(): number | null {
    const u = this.getCurrentUser();
    if (!u) return null;
    return parsePositiveIntId(u.customerId);
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
  }): Promise<{
    success: boolean;
    data?: ProductsResponse;
    error?: string;
    status?: number;
  }> {
    try {
      const queryParams = new URLSearchParams();
      const merged = { page: 0, size: 20, ...filters };
      Object.entries(merged).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });

      const queryString = queryParams.toString();
      const endpoint = `/api/products${queryString ? `?${queryString}` : ''}`;

      const response = await this.request<ProductsResponse>(endpoint);

      return {
        success: true,
        data: response,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Ошибка загрузки товаров',
        status: getErrorStatus(error),
      };
    }
  }

  async getProductById(
    id: number
  ): Promise<{ success: boolean; data?: Product; error?: string; status?: number }> {
    try {
      const response = await this.request<Product>(`/api/products/${id}`);
      return {
        success: true,
        data: response,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Ошибка загрузки товара',
        status: getErrorStatus(error),
      };
    }
  }

  // ========== ТОВАРЫ ПРОДАВЦА (нужен JWT с ролью SELLER) ==========

  async getSellerProducts(
    page: number = 0,
    size: number = 20
  ): Promise<{
    success: boolean;
    data?: ProductsResponse;
    error?: string;
    status?: number;
  }> {
    try {
      const data = await this.request<ProductsResponse>(
        `/api/seller/products?page=${page}&size=${size}`
      );
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Ошибка загрузки товаров продавца',
        status: getErrorStatus(error),
      };
    }
  }

  async getSellerProductById(
    id: number
  ): Promise<{ success: boolean; data?: Product; error?: string; status?: number }> {
    try {
      const data = await this.request<Product>(`/api/seller/products/${id}`);
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Ошибка загрузки товара',
        status: getErrorStatus(error),
      };
    }
  }

  async createSellerProduct(
    body: ProductRequest
  ): Promise<{ success: boolean; data?: Product; error?: string; status?: number }> {
    try {
      const data = await this.request<Product>('/api/seller/products', {
        method: 'POST',
        body: JSON.stringify(body),
      });
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Ошибка создания товара',
        status: getErrorStatus(error),
      };
    }
  }

  async updateSellerProduct(
    id: number,
    body: ProductRequest
  ): Promise<{ success: boolean; data?: Product; error?: string; status?: number }> {
    try {
      const data = await this.request<Product>(`/api/seller/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(body),
      });
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Ошибка обновления товара',
        status: getErrorStatus(error),
      };
    }
  }

  async deleteSellerProduct(
    id: number
  ): Promise<{ success: boolean; error?: string; status?: number }> {
    try {
      await this.request<Record<string, never>>(`/api/seller/products/${id}`, {
        method: 'DELETE',
      });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Ошибка удаления товара',
        status: getErrorStatus(error),
      };
    }
  }

  async getProductCards(
    productId: number
  ): Promise<{
    success: boolean;
    data?: ProductCardResponse[];
    error?: string;
    status?: number;
  }> {
    try {
      const response = await this.request<ProductCardResponse[]>(
        `/api/products/${productId}/cards`
      );
      return { success: true, data: response };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Ошибка загрузки карточек товара',
        status: getErrorStatus(error),
      };
    }
  }

  async getProductCardById(
    productId: number,
    cardId: number
  ): Promise<{
    success: boolean;
    data?: ProductCardResponse;
    error?: string;
    status?: number;
  }> {
    try {
      const response = await this.request<ProductCardResponse>(
        `/api/products/${productId}/cards/${cardId}`
      );
      return { success: true, data: response };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Ошибка загрузки карточки товара',
        status: getErrorStatus(error),
      };
    }
  }

  /**
   * POST /api/products/{productId}/cards — в теле обязателен productId и он должен совпадать с productId в пути.
   */
  async createProductCard(
    productId: number,
    body: Omit<ProductCardRequest, 'productId'>
  ): Promise<{
    success: boolean;
    data?: ProductCardResponse;
    error?: string;
    status?: number;
  }> {
    try {
      const payload: ProductCardRequest = {
        ...body,
        productId,
      };
      const response = await this.request<ProductCardResponse>(
        `/api/products/${productId}/cards`,
        {
          method: 'POST',
          body: JSON.stringify(payload),
        }
      );
      return { success: true, data: response };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Ошибка создания карточки товара',
        status: getErrorStatus(error),
      };
    }
  }

  async updateProductCard(
    productId: number,
    cardId: number,
    body: ProductCardRequest
  ): Promise<{
    success: boolean;
    data?: ProductCardResponse;
    error?: string;
    status?: number;
  }> {
    try {
      const response = await this.request<ProductCardResponse>(
        `/api/products/${productId}/cards/${cardId}`,
        {
          method: 'PUT',
          body: JSON.stringify(body),
        }
      );
      return { success: true, data: response };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Ошибка обновления карточки товара',
        status: getErrorStatus(error),
      };
    }
  }

  async deleteProductCard(
    productId: number,
    cardId: number
  ): Promise<{ success: boolean; error?: string; status?: number }> {
    try {
      await this.request<Record<string, never>>(`/api/products/${productId}/cards/${cardId}`, {
        method: 'DELETE',
      });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Ошибка удаления карточки товара',
        status: getErrorStatus(error),
      };
    }
  }

  // ========== КАТЕГОРИИ ==========

  /**
   * Единственный метод для загрузки списка категорий на витрине (меню, корень каталога и т.д.):
   * фиксированный {@link CATEGORIES_LIST_PAGE_SIZE}, дедупликация параллельных запросов, кэш в памяти.
   */
  async getCategoriesListForUi(): Promise<CategoriesListResult> {
    const now = Date.now();
    const hit = categoriesListCache;
    if (
      hit?.success &&
      hit.data &&
      now - categoriesListCacheAt < CATEGORIES_LIST_CACHE_MS
    ) {
      return hit;
    }
    if (categoriesListInflight) {
      return categoriesListInflight;
    }

    categoriesListInflight = (async (): Promise<CategoriesListResult> => {
      try {
        const response = await this.request<PageDto<Category>>(
          `/api/categories?page=0&size=${CATEGORIES_LIST_PAGE_SIZE}`
        );
        const res: CategoriesListResult = { success: true, data: response };
        categoriesListCache = res;
        categoriesListCacheAt = Date.now();
        return res;
      } catch (error) {
        return {
          success: false,
          error:
            error instanceof Error ? error.message : 'Ошибка загрузки категорий',
          status: getErrorStatus(error),
        };
      }
    })().finally(() => {
      categoriesListInflight = null;
    });

    return categoriesListInflight;
  }

  /**
   * Произвольная пагинация категорий (например, админка). Для витрины не вызывайте напрямую —
   * используйте {@link getCategoriesListForUi}. При `page === 0` и `size === CATEGORIES_LIST_PAGE_SIZE`
   * запрос уходит в тот же кэш, что и витрина (без лишнего HTTP).
   */
  async getCategories(
    page: number = 0,
    size: number = CATEGORIES_LIST_PAGE_SIZE
  ): Promise<CategoriesListResult> {
    if (page === 0 && size === CATEGORIES_LIST_PAGE_SIZE) {
      return this.getCategoriesListForUi();
    }
    try {
      const response = await this.request<PageDto<Category>>(
        `/api/categories?page=${page}&size=${size}`
      );
      return { success: true, data: response };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Ошибка загрузки категорий',
        status: getErrorStatus(error),
      };
    }
  }

  async getCategoryById(
    id: number
  ): Promise<{ success: boolean; data?: Category; error?: string; status?: number }> {
    try {
      const response = await this.request<Category>(`/api/categories/${id}`);
      return { success: true, data: response };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Ошибка загрузки категории',
        status: getErrorStatus(error),
      };
    }
  }

  async createCategory(
    body: CategoryRequest
  ): Promise<{ success: boolean; data?: Category; error?: string; status?: number }> {
    try {
      const response = await this.request<Category>('/api/categories', {
        method: 'POST',
        body: JSON.stringify(body),
      });
      invalidateCategoriesListCache();
      return { success: true, data: response };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Ошибка создания категории',
        status: getErrorStatus(error),
      };
    }
  }

  async updateCategory(
    id: number,
    body: CategoryRequest
  ): Promise<{ success: boolean; data?: Category; error?: string; status?: number }> {
    try {
      const response = await this.request<Category>(`/api/categories/${id}`, {
        method: 'PUT',
        body: JSON.stringify(body),
      });
      invalidateCategoriesListCache();
      return { success: true, data: response };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Ошибка обновления категории',
        status: getErrorStatus(error),
      };
    }
  }

  async deleteCategory(
    id: number
  ): Promise<{ success: boolean; error?: string; status?: number }> {
    try {
      await this.request<Record<string, never>>(`/api/categories/${id}`, {
        method: 'DELETE',
      });
      invalidateCategoriesListCache();
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Ошибка удаления категории',
        status: getErrorStatus(error),
      };
    }
  }

  // ========== БРЕНДЫ (витрина / поиск) ==========

  async getBrands(
    page: number = 0,
    size: number = 100
  ): Promise<{
    success: boolean;
    data?: PageDto<BrandRow>;
    error?: string;
    status?: number;
  }> {
    try {
      const response = await this.request<PageDto<BrandRow>>(
        `/api/brands?page=${page}&size=${size}`
      );
      return { success: true, data: response };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Ошибка загрузки брендов',
        status: getErrorStatus(error),
      };
    }
  }

  async getBrandById(
    id: number
  ): Promise<{ success: boolean; data?: BrandRow; error?: string; status?: number }> {
    try {
      const response = await this.request<BrandRow>(`/api/brands/${id}`);
      return { success: true, data: response };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Ошибка загрузки бренда',
        status: getErrorStatus(error),
      };
    }
  }

  async createBrand(
    body: BrandRequest
  ): Promise<{ success: boolean; data?: BrandRow; error?: string; status?: number }> {
    try {
      const response = await this.request<BrandRow>('/api/brands', {
        method: 'POST',
        body: JSON.stringify(body),
      });
      return { success: true, data: response };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Ошибка создания бренда',
        status: getErrorStatus(error),
      };
    }
  }

  async updateBrand(
    id: number,
    body: BrandRequest
  ): Promise<{ success: boolean; data?: BrandRow; error?: string; status?: number }> {
    try {
      const response = await this.request<BrandRow>(`/api/brands/${id}`, {
        method: 'PUT',
        body: JSON.stringify(body),
      });
      return { success: true, data: response };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Ошибка обновления бренда',
        status: getErrorStatus(error),
      };
    }
  }

  async deleteBrand(
    id: number
  ): Promise<{ success: boolean; error?: string; status?: number }> {
    try {
      await this.request<Record<string, never>>(`/api/brands/${id}`, {
        method: 'DELETE',
      });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Ошибка удаления бренда',
        status: getErrorStatus(error),
      };
    }
  }

  // ========== РАЗМЕРЫ (/api/sizes) ==========

  async getSizes(
    page: number = 0,
    size: number = 100
  ): Promise<{
    success: boolean;
    data?: PageDto<SizeDto>;
    error?: string;
    status?: number;
  }> {
    try {
      const data = await this.request<PageDto<SizeDto>>(
        `/api/sizes?page=${page}&size=${size}`
      );
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Ошибка загрузки размеров',
        status: getErrorStatus(error),
      };
    }
  }

  async getSizeById(
    id: number
  ): Promise<{ success: boolean; data?: SizeDto; error?: string; status?: number }> {
    try {
      const data = await this.request<SizeDto>(`/api/sizes/${id}`);
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Ошибка загрузки размера',
        status: getErrorStatus(error),
      };
    }
  }

  async createSize(
    body: SizeRequest
  ): Promise<{ success: boolean; data?: SizeDto; error?: string; status?: number }> {
    try {
      const data = await this.request<SizeDto>('/api/sizes', {
        method: 'POST',
        body: JSON.stringify(body),
      });
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Ошибка создания размера',
        status: getErrorStatus(error),
      };
    }
  }

  async updateSize(
    id: number,
    body: SizeRequest
  ): Promise<{ success: boolean; data?: SizeDto; error?: string; status?: number }> {
    try {
      const data = await this.request<SizeDto>(`/api/sizes/${id}`, {
        method: 'PUT',
        body: JSON.stringify(body),
      });
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Ошибка обновления размера',
        status: getErrorStatus(error),
      };
    }
  }

  async deleteSize(
    id: number
  ): Promise<{ success: boolean; error?: string; status?: number }> {
    try {
      await this.request<Record<string, never>>(`/api/sizes/${id}`, {
        method: 'DELETE',
      });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Ошибка удаления размера',
        status: getErrorStatus(error),
      };
    }
  }

  // ========== ЗАКАЗЫ ==========

  /** Список всех заказов (роли ADMIN, WAREHOUSE_MANAGER). */
  async getOrders(
    page: number = 0,
    size: number = 20
  ): Promise<{
    success: boolean;
    data?: PageDto<OrderResponseDto>;
    error?: string;
    status?: number;
  }> {
    try {
      const data = await this.request<PageDto<OrderResponseDto>>(
        `/api/orders?page=${page}&size=${size}`
      );
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Ошибка загрузки заказов',
        status: getErrorStatus(error),
      };
    }
  }

  /** Один заказ (ADMIN или владелец-покупатель). */
  async getOrderById(
    id: number
  ): Promise<{ success: boolean; data?: OrderResponseDto; error?: string; status?: number }> {
    try {
      const data = await this.request<OrderResponseDto>(`/api/orders/${id}`);
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Ошибка загрузки заказа',
        status: getErrorStatus(error),
      };
    }
  }

  /** Заказы покупателя (ADMIN или сам покупатель). */
  async getOrdersForCustomer(
    customerId: number
  ): Promise<{
    success: boolean;
    data?: OrderResponseDto[];
    error?: string;
    status?: number;
  }> {
    try {
      const data = await this.request<OrderResponseDto[]>(
        `/api/orders/customer/${customerId}`
      );
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Ошибка загрузки заказов покупателя',
        status: getErrorStatus(error),
      };
    }
  }

  /** Заказы по статусу (ADMIN, WAREHOUSE_MANAGER). */
  async getOrdersByStatus(
    statusId: number,
    page: number = 0,
    size: number = 20
  ): Promise<{
    success: boolean;
    data?: PageDto<OrderResponseDto>;
    error?: string;
    status?: number;
  }> {
    try {
      const data = await this.request<PageDto<OrderResponseDto>>(
        `/api/orders/status/${statusId}?page=${page}&size=${size}`
      );
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Ошибка загрузки заказов по статусу',
        status: getErrorStatus(error),
      };
    }
  }

  async createOrder(
    orderData: CreateOrderRequest
  ): Promise<{ success: boolean; data?: OrderResponseDto; error?: string; status?: number }> {
    try {
      const response = await this.request<OrderResponseDto>('/api/orders', {
        method: 'POST',
        body: JSON.stringify(orderData),
      });
      return { success: true, data: response };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Ошибка создания заказа',
        status: getErrorStatus(error),
      };
    }
  }

  /** Подтвердить заказ (ADMIN, WAREHOUSE_MANAGER). */
  async confirmOrder(
    orderId: number
  ): Promise<{ success: boolean; data?: OrderResponseDto; error?: string; status?: number }> {
    try {
      const data = await this.request<OrderResponseDto>(`/api/orders/${orderId}/confirm`, {
        method: 'PUT',
      });
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Ошибка подтверждения заказа',
        status: getErrorStatus(error),
      };
    }
  }

  /** Отменить заказ (ADMIN или владелец-покупатель). */
  async cancelOrder(
    orderId: number
  ): Promise<{ success: boolean; data?: OrderResponseDto; error?: string; status?: number }> {
    try {
      const data = await this.request<OrderResponseDto>(`/api/orders/${orderId}/cancel`, {
        method: 'PUT',
      });
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Ошибка отмены заказа',
        status: getErrorStatus(error),
      };
    }
  }

  /** Сменить статус заказа (ADMIN, WAREHOUSE_MANAGER). */
  async setOrderStatus(
    orderId: number,
    statusId: number
  ): Promise<{ success: boolean; data?: OrderResponseDto; error?: string; status?: number }> {
    try {
      const data = await this.request<OrderResponseDto>(
        `/api/orders/${orderId}/status/${statusId}`,
        { method: 'PUT' }
      );
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Ошибка смены статуса заказа',
        status: getErrorStatus(error),
      };
    }
  }

  /** Удалить заказ (только ADMIN). */
  async deleteOrder(
    orderId: number
  ): Promise<{ success: boolean; error?: string; status?: number }> {
    try {
      await this.request<Record<string, never>>(`/api/orders/${orderId}`, {
        method: 'DELETE',
      });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Ошибка удаления заказа',
        status: getErrorStatus(error),
      };
    }
  }

  // ========== СТАТУСЫ ЗАКАЗОВ (/api/orders-statuses) ==========

  async getOrderStatuses(
    page: number = 0,
    size: number = 20
  ): Promise<{
    success: boolean;
    data?: PageDto<OrderStatusDto>;
    error?: string;
    status?: number;
  }> {
    try {
      const data = await this.request<PageDto<OrderStatusDto>>(
        `/api/orders-statuses?page=${page}&size=${size}`
      );
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Ошибка загрузки статусов заказов',
        status: getErrorStatus(error),
      };
    }
  }

  async getOrderStatusById(
    id: number
  ): Promise<{ success: boolean; data?: OrderStatusDto; error?: string; status?: number }> {
    try {
      const data = await this.request<OrderStatusDto>(`/api/orders-statuses/${id}`);
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Ошибка загрузки статуса',
        status: getErrorStatus(error),
      };
    }
  }

  async createOrderStatus(
    body: OrderStatusBody
  ): Promise<{ success: boolean; data?: OrderStatusDto; error?: string; status?: number }> {
    try {
      const data = await this.request<OrderStatusDto>('/api/orders-statuses', {
        method: 'POST',
        body: JSON.stringify(body),
      });
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Ошибка создания статуса',
        status: getErrorStatus(error),
      };
    }
  }

  async updateOrderStatus(
    id: number,
    body: OrderStatusBody
  ): Promise<{ success: boolean; data?: OrderStatusDto; error?: string; status?: number }> {
    try {
      const data = await this.request<OrderStatusDto>(`/api/orders-statuses/${id}`, {
        method: 'PUT',
        body: JSON.stringify(body),
      });
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Ошибка обновления статуса',
        status: getErrorStatus(error),
      };
    }
  }

  async deleteOrderStatus(
    id: number
  ): Promise<{ success: boolean; error?: string; status?: number }> {
    try {
      await this.request<Record<string, never>>(`/api/orders-statuses/${id}`, {
        method: 'DELETE',
      });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Ошибка удаления статуса',
        status: getErrorStatus(error),
      };
    }
  }

  // ========== ДВИЖЕНИЯ ЗАКАЗА (/api/order-movements) ==========

  async getOrderMovementsForOrderItem(
    orderItemId: number
  ): Promise<{
    success: boolean;
    data?: OrderMovementDto[];
    error?: string;
    status?: number;
  }> {
    try {
      const data = await this.request<OrderMovementDto[]>(
        `/api/order-movements/order-item/${orderItemId}`
      );
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Ошибка загрузки движений',
        status: getErrorStatus(error),
      };
    }
  }

  async getOrderMovementById(
    id: number
  ): Promise<{ success: boolean; data?: OrderMovementDto; error?: string; status?: number }> {
    try {
      const data = await this.request<OrderMovementDto>(`/api/order-movements/${id}`);
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Ошибка загрузки движения',
        status: getErrorStatus(error),
      };
    }
  }

  /**
   * Новое движение: на бэкенде параметры в query (orderItemId, warehouseId, statusName).
   */
  async createOrderMovement(
    orderItemId: number,
    warehouseId: number,
    statusName: string
  ): Promise<{ success: boolean; data?: OrderMovementDto; error?: string; status?: number }> {
    try {
      const q = new URLSearchParams({
        orderItemId: String(orderItemId),
        warehouseId: String(warehouseId),
        statusName,
      });
      const data = await this.request<OrderMovementDto>(`/api/order-movements?${q}`, {
        method: 'POST',
      });
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Ошибка создания движения',
        status: getErrorStatus(error),
      };
    }
  }

  async updateOrderMovementStatus(
    movementId: number,
    statusName: string
  ): Promise<{ success: boolean; data?: OrderMovementDto; error?: string; status?: number }> {
    try {
      const encoded = encodeURIComponent(statusName);
      const data = await this.request<OrderMovementDto>(
        `/api/order-movements/${movementId}/status/${encoded}`,
        { method: 'PUT' }
      );
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Ошибка обновления движения',
        status: getErrorStatus(error),
      };
    }
  }

  // ========== ПЛАТЕЖИ (GET + уже были POST / PUT confirm) ==========

  async getPaymentsForOrderItem(
    orderItemId: number
  ): Promise<{
    success: boolean;
    data?: PaymentDto[];
    error?: string;
    status?: number;
  }> {
    try {
      const data = await this.request<PaymentDto[]>(
        `/api/payments/order-item/${orderItemId}`
      );
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Ошибка загрузки платежей',
        status: getErrorStatus(error),
      };
    }
  }

  async getPaymentById(
    paymentId: number
  ): Promise<{ success: boolean; data?: PaymentDto; error?: string; status?: number }> {
    try {
      const data = await this.request<PaymentDto>(`/api/payments/${paymentId}`);
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Ошибка загрузки платежа',
        status: getErrorStatus(error),
      };
    }
  }

  async createPaymentForOrderItem(
    orderItemId: number
  ): Promise<{ success: boolean; data?: PaymentDto; error?: string; status?: number }> {
    try {
      const data = await this.request<PaymentDto>(`/api/payments/order-item/${orderItemId}`, {
        method: 'POST',
      });
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Ошибка создания платежа',
        status: getErrorStatus(error),
      };
    }
  }

  async confirmPayment(
    paymentId: number
  ): Promise<{ success: boolean; data?: PaymentDto; error?: string; status?: number }> {
    try {
      const data = await this.request<PaymentDto>(`/api/payments/${paymentId}/confirm`, {
        method: 'PUT',
      });
      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Ошибка подтверждения платежа',
        status: getErrorStatus(error),
      };
    }
  }

  // ========== ПРОФИЛЬ ==========

  async getCustomerDashboard(): Promise<{
    success: boolean;
    data?: CustomerDashboard;
    error?: string;
    status?: number;
  }> {
    try {
      const response = await this.request<CustomerDashboard>('/api/customer/dashboard');
      return { success: true, data: response };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Ошибка загрузки данных покупателя',
        status: getErrorStatus(error),
      };
    }
  }
}

export const api = new ApiService();