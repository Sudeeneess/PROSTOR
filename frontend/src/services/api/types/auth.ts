export interface LoginData {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  password: string;
  confirmPassword: string;
  phone: string;
  role?: string;
  inn?: string;
  companyName?: string;
  displayName?: string;
}

export interface LoginResponse {
  token: string;
  type: string;
  username: string;
  role: string;
  expiresIn: number;
  redirectUrl: string;
  customerId?: number;
}

export interface AuthResponse {
  success: boolean;
  data?: LoginResponse;
  error?: string;
  status?: number;
  needsLogin?: boolean;
}
