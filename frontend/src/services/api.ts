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

// Интерфейс ответа от сервера при успешном входе
export interface LoginResponse {
  token: string;
  type: string;
  username: string;
  role: string;
  expiresIn: number;
  redirectUrl: string;
}

// Интерфейс ответа от нашего сервиса
export interface AuthResponse {
  success: boolean;
  data?: LoginResponse;
  error?: string;
  status?: number;
}

// Класс с методами для работы с API
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
      // Отправляем запрос
      const response = await fetch(url, {
        ...options,
        headers,
      });

      console.log('Статус ответа:', response.status);
      console.log('Content-Type:', response.headers.get('content-type'));

      // Получаем ответ как текст
      const responseText = await response.text();
      console.log('Текст ответа:', responseText || '<пустой ответ>');

      // Если ответ пустой
      if (!responseText) {
        if (!response.ok) {
          throw new Error(`Ошибка ${response.status}: Пустой ответ от сервера`);
        }
        return {} as T;
      }

      // Пробуем распарсить JSON
      let data;
      try {
        data = JSON.parse(responseText);
        console.log('Распарсенный JSON:', data);
      } catch (e) {
        console.error('Ошибка парсинга JSON:', e);
        throw new Error(`Сервер вернул невалидный JSON: ${responseText.substring(0, 100)}`);
      }

      // Если сервер вернул ошибку
      if (!response.ok) {
        throw new Error(data.message || data.error || `Ошибка ${response.status}`);
      }

      return data as T;
      
    } catch (error) {
      console.error('Ошибка в request:', error);
      throw error;
    }
  }

  // МЕТОД ДЛЯ ВХОДА
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

      // Проверяем наличие обязательных полей
      if (!response.token) {
        throw new Error('Сервер не вернул токен');
      }

      // Сохраняем данные в localStorage
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify({
        username: response.username,
        role: response.role
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

  // МЕТОД ДЛЯ РЕГИСТРАЦИИ
  async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      // Проверка на клиенте
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

      // Сохраняем данные в localStorage
      if (response.token) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify({
          username: response.username,
          role: response.role
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

  // МЕТОД ДЛЯ ВЫХОДА
  logout(): void {
    console.log('Выход из системы');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('tokenType');
    localStorage.removeItem('expiresIn');
  }

  // ПОЛУЧИТЬ ТЕКУЩЕГО ПОЛЬЗОВАТЕЛЯ
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

  // ПОЛУЧИТЬ ТОКЕН
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // ПОЛУЧИТЬ ТИП ТОКЕНА
  getTokenType(): string | null {
    return localStorage.getItem('tokenType') || 'Bearer';
  }

  // ПРОВЕРИТЬ, АВТОРИЗОВАН ЛИ ПОЛЬЗОВАТЕЛЬ
  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    return !!token;
  }

  // ПОЛУЧИТЬ ЗАГОЛОВКИ ДЛЯ АВТОРИЗОВАННЫХ ЗАПРОСОВ
  getAuthHeaders(): HeadersInit {
    const token = this.getToken();
    const tokenType = this.getTokenType();
    
    return {
      'Authorization': `${tokenType} ${token}`,
      'Content-Type': 'application/json',
    };
  }
}

export const api = new ApiService();