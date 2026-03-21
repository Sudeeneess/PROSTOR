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
          console.log('Данные пользователя:', {
            username: response.data.username,
            role: response.data.role,
            token: response.data.token ? 'получен' : 'не получен'
          });
          
          // Перенаправление в зависимости от роли
          if (response.data.redirectUrl) {
            console.log('Перенаправление на redirectUrl:', response.data.redirectUrl);
            navigate(response.data.redirectUrl);
          } else if (response.data.role === 'seller') {
            console.log('Перенаправление на страницу продавца');
            navigate('/seller');
          } else if (response.data.role === 'buyer') {
            console.log('Перенаправление на страницу покупателя');
            navigate('/buyer');
          } else {
            console.log('Перенаправление на главную');
            navigate('/');
          }
        } else {
          console.log('Ошибка входа:', response.error);
          console.log('Статус ошибки:', response.status);
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
          console.log('Данные пользователя:', {
            username: response.data.username,
            role: response.data.role
          });
          
          // Перенаправление после регистрации
          if (response.data.redirectUrl) {
            console.log('Перенаправление на redirectUrl:', response.data.redirectUrl);
            navigate(response.data.redirectUrl);
          } else if (response.data.role === 'seller') {
            console.log('Перенаправление на страницу продавца');
            navigate('/seller');
          } else if (response.data.role === 'buyer') {
            console.log('Перенаправление на страницу покупателя');
            navigate('/buyer');
          } else {
            console.log('Перенаправление на главную');
            navigate('/');
          }
        } else {
          console.log('Ошибка регистрации:', response.error);
          console.log('Статус ошибки:', response.status);
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
    <div className="auth-page">
      <Header />
      <div className="auth-container">
        <div className="auth-card">
          <h2 className="auth-title">
            {isLogin ? 'Авторизация' : 'Регистрация'}
            <div className="title-icon">
              <BsPersonFill size={28} color='#000000' />
            </div>
          </h2>
          
          {/* Отображение ошибки */}
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            {!isLogin ? (
              // Форма регистрации
              <>
                <div className="form-group">
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

                <div className="form-group">
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

                <div className="form-group">
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

                <div className="form-group">
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
                <div className="form-group">
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

                <div className="form-group">
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
              className="submit-button"
              disabled={loading}
            >
              {loading ? 'Загрузка...' : (isLogin ? 'Войти' : 'Создать аккаунт')}
            </button>
          </form>

          <div className="auth-footer">
            {isLogin ? (
              <p>
                У вас нет аккаунта?{' '}
                <button 
                  onClick={switchToRegister} 
                  className="link-button"
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
                  className="link-button"
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