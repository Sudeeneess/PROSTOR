const API_BASE_URL = 'http://localhost:8080'; 

export interface LoginData {
  username: string;
  password: string;
}

export interface RegisterData {
  name: string;
  username: string;
  password: string;
  confirmPassword: string;
}

export interface LoginResponse {
  token: string;
  type: string;
  username: string;
  role: string;
  expiresIn: number;
  redirectUrl: string;
}

export interface AuthResponse {
  success: boolean;
  data?: LoginResponse;
  error?: string;
  status?: number;
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
          throw new Error(`Ошибка ${response.status}: Пустой ответ от сервера`);
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
        throw new Error(data.message || data.error || `Ошибка ${response.status}`);
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
      console.log('Попытка входа с username:', credentials.username);
      
      const response = await this.request<LoginResponse>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          username: credentials.username,
          password: credentials.password,
        }),
      });

      console.log('Успешный ответ от сервера:', response);

      if (!response.token) {
        throw new Error('Сервер не вернул токен');
      }

      // Нормализуем роль к нижнему регистру
      const normalizedRole = response.role.toLowerCase();

      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify({
        username: response.username,
        role: normalizedRole
      }));
      
      if (response.type) {
        localStorage.setItem('tokenType', response.type);
      }
      
      if (response.expiresIn) {
        localStorage.setItem('expiresIn', response.expiresIn.toString());
      }

      return {
        success: true,
        data: response,
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

      console.log('Попытка регистрации пользователя:', userData.username);

      const response = await this.request<LoginResponse>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: userData.name,
          username: userData.username,
          password: userData.password,
        }),
      });

      console.log('Успешная регистрация:', response);

      if (response.token) {
        const normalizedRole = response.role.toLowerCase();
        
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify({
          username: response.username,
          role: normalizedRole
        }));
        
        if (response.type) {
          localStorage.setItem('tokenType', response.type);
        }
        
        if (response.expiresIn) {
          localStorage.setItem('expiresIn', response.expiresIn.toString());
        }
      }

      return {
        success: true,
        data: response,
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
    console.log('Выход из системы');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('tokenType');
    localStorage.removeItem('expiresIn');
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