import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BsPersonFill } from "react-icons/bs";
import Header from './HeaderBuyer';
import './AuthPageBuyer.css';
import { api } from '../../services/api';

const AuthPageBuyer: React.FC = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    confirmPassword: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    console.log('Форма отправлена:', { 
      isLogin, 
      username: formData.username 
    });

    try {
      if (isLogin) {
        console.log('Попытка входа...');
        console.log('Отправляемые данные:', {
          username: formData.username,
          password: '***'
        });
        
        const response = await api.login({
          username: formData.username,
          password: formData.password
        });
        
        console.log('Ответ от API:', response);
        
        if (response.success && response.data) {
          console.log('Вход успешен!');
          console.log('Данные от сервера:', response.data);
          
          // ========== СОХРАНЕНИЕ ДАННЫХ ==========
          
          // 1. Сохраняем токен
          if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            console.log('✅ Токен сохранен в localStorage');
          } else {
            console.warn('⚠️ Токен не получен от сервера, создаем тестовый');
            localStorage.setItem('token', 'test-token-' + Date.now());
          }
          
          // 2. Сохраняем роль (приводим к нижнему регистру)
          let userRole = 'buyer'; // роль по умолчанию
          if (response.data.role) {
            userRole = response.data.role.toLowerCase();
          }
          sessionStorage.setItem('userRole', userRole);
          console.log('✅ Роль пользователя сохранена:', userRole);
          
          // 3. Сохраняем username
          if (response.data.username) {
            localStorage.setItem('username', response.data.username);
            console.log('✅ Username сохранен:', response.data.username);
          }
          
          // 4. Сохраняем имя (если есть)
          if (formData.name) {
            localStorage.setItem('userName', formData.name);
            console.log('✅ Имя пользователя сохранено:', formData.name);
          }
          
          // 5. Сохраняем полную информацию о пользователе
          const userData = {
            username: response.data.username || formData.username,
            role: userRole
          };
          localStorage.setItem('user', JSON.stringify(userData));
          console.log('✅ Данные пользователя сохранены:', userData);
          
          // 6. ПРОВЕРКА СОХРАНЕНИЯ
          console.log('========== ПРОВЕРКА СОХРАНЕНИЯ ==========');
          console.log('localStorage token:', localStorage.getItem('token'));
          console.log('sessionStorage role:', sessionStorage.getItem('userRole'));
          console.log('localStorage username:', localStorage.getItem('username'));
          console.log('==========================================');
          
          // 7. Перенаправление
          console.log('Перенаправление на страницу покупателя...');
          navigate('/buyer');
          
        } else {
          console.log('Ошибка входа:', response.error);
          setError(response.error || 'Неверное имя пользователя или пароль');
        }
      } else {
        // Регистрация
        console.log('Попытка регистрации...');
        
        // Валидация на клиенте
        if (formData.password !== formData.confirmPassword) {
          console.log('Пароли не совпадают');
          setError('Пароли не совпадают');
          setLoading(false);
          return;
        }

        if (formData.password.length < 6) {
          console.log('Пароль слишком короткий');
          setError('Пароль должен быть не менее 6 символов');
          setLoading(false);
          return;
        }

        console.log('Отправляемые данные для регистрации:', {
          name: formData.name,
          username: formData.username,
          password: '***'
        });

        const response = await api.register({
          name: formData.name,
          username: formData.username,
          password: formData.password,
          confirmPassword: formData.confirmPassword
        });

        console.log('Ответ от API (регистрация):', response);

        if (response.success && response.data) {
          console.log('Регистрация успешна!');
          console.log('Данные от сервера:', response.data);
          
          // ========== СОХРАНЕНИЕ ДАННЫХ ПОСЛЕ РЕГИСТРАЦИИ ==========
          
          // 1. Сохраняем токен
          if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            console.log('✅ Токен сохранен в localStorage');
          } else {
            console.warn('⚠️ Токен не получен от сервера, создаем тестовый');
            localStorage.setItem('token', 'test-token-' + Date.now());
          }
          
          // 2. Сохраняем роль
          let userRole = 'buyer';
          if (response.data.role) {
            userRole = response.data.role.toLowerCase();
          }
          sessionStorage.setItem('userRole', userRole);
          console.log('✅ Роль пользователя сохранена:', userRole);
          
          // 3. Сохраняем username
          if (response.data.username) {
            localStorage.setItem('username', response.data.username);
            console.log('✅ Username сохранен:', response.data.username);
          }
          
          // 4. Сохраняем имя
          if (formData.name) {
            localStorage.setItem('userName', formData.name);
            console.log('✅ Имя пользователя сохранено:', formData.name);
          }
          
          // 5. Сохраняем полную информацию
          const userData = {
            username: response.data.username || formData.username,
            name: formData.name,
            role: userRole
          };
          localStorage.setItem('user', JSON.stringify(userData));
          console.log('✅ Данные пользователя сохранены:', userData);
          
          // 6. ПРОВЕРКА СОХРАНЕНИЯ
          console.log('========== ПРОВЕРКА СОХРАНЕНИЯ ==========');
          console.log('localStorage token:', localStorage.getItem('token'));
          console.log('sessionStorage role:', sessionStorage.getItem('userRole'));
          console.log('localStorage username:', localStorage.getItem('username'));
          console.log('==========================================');
          
          // 7. Перенаправление
          console.log('Перенаправление на страницу покупателя...');
          navigate('/buyer');
          
        } else {
          console.log('Ошибка регистрации:', response.error);
          setError(response.error || 'Ошибка при регистрации');
        }
      }
    } catch (err) {
      console.error('Критическая ошибка:', err);
      setError('Произошла непредвиденная ошибка. Проверьте подключение к серверу.');
    } finally {
      setLoading(false);
    }
  };

  const switchToRegister = () => {
    console.log('Переключение на форму регистрации');
    setIsLogin(false);
    setFormData({ 
      name: '', 
      username: '', 
      password: '', 
      confirmPassword: '' 
    });
    setError(null);
  };

  const switchToLogin = () => {
    console.log('Переключение на форму входа');
    setIsLogin(true);
    setFormData({ 
      name: '', 
      username: '', 
      password: '', 
      confirmPassword: '' 
    });
    setError(null);
  };

  return (
    <div className="buyer-auth-page">
      <Header />
      <div className="buyer-auth-container">
        <div className="buyer-auth-card">
          <h2 className="buyer-auth-title">
            {isLogin ? 'Авторизация' : 'Регистрация'}
            <div className="buyer-auth-title-icon">
              <BsPersonFill size={28} color='#000000' />
            </div>
          </h2>
          
          {/* Отображение ошибки */}
          {error && (
            <div className="buyer-auth-error-message">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            {!isLogin ? (
              // Форма регистрации
              <>
                <div className="buyer-auth-form-group">
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Введите ваше имя"
                    required
                    disabled={loading}
                  />
                </div>

                <div className="buyer-auth-form-group">
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="Имя пользователя"
                    required
                    disabled={loading}
                  />
                </div>

                <div className="buyer-auth-form-group">
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Придумайте пароль"
                    required
                    disabled={loading}
                  />
                </div>

                <div className="buyer-auth-form-group">
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Повторите пароль"
                    required
                    disabled={loading}
                  />
                </div>
              </>
            ) : (
              // Форма входа
              <>
                <div className="buyer-auth-form-group">
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="Имя пользователя"
                    required
                    disabled={loading}
                  />
                </div>

                <div className="buyer-auth-form-group">
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Введите пароль"
                    required
                    disabled={loading}
                  />
                </div>
              </>
            )}

            <button 
              type="submit" 
              className="buyer-auth-submit-button"
              disabled={loading}
            >
              {loading ? 'Загрузка...' : (isLogin ? 'Войти' : 'Создать аккаунт')}
            </button>
          </form>

          <div className="buyer-auth-footer">
            {isLogin ? (
              <p>
                У вас нет аккаунта?{' '}
                <button 
                  onClick={switchToRegister} 
                  className="buyer-auth-link-button"
                  disabled={loading}
                >
                  Создать аккаунт
                </button>
              </p>
            ) : (
              <p>
                Уже есть аккаунт?{' '}
                <button 
                  onClick={switchToLogin} 
                  className="buyer-auth-link-button"
                  disabled={loading}
                >
                  Войти
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPageBuyer;