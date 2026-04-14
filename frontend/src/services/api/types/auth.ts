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
