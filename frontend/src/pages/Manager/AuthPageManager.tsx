import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BsPersonFill } from "react-icons/bs";
import HeaderManager from './HeaderManager';
import styles from './AuthPageManager.module.css'; // Тот же файл с новыми стилями
import { api, resolveAfterLogin } from '../../services/api';

const AuthPageManager: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  // Проверка, авторизован ли уже пользователь
  React.useEffect(() => {
    const token = localStorage.getItem('token');
    const role = sessionStorage.getItem('userRole');
    if (token && role === 'warehouse_manager') {
      navigate('/warehouse', { replace: true });
    }
  }, [navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!formData.username || !formData.password) {
      setError('Пожалуйста, заполните все поля');
      setLoading(false);
      return;
    }

    try {
      const response = await api.login({
        username: formData.username,
        password: formData.password,
      });

      if (!response.success || !response.data) {
        setError(response.error || 'Неверное имя пользователя или пароль');
        return;
      }

      if (response.data.role !== 'warehouse_manager') {
        api.logout();
        setError('Вход доступен только для роли менеджера склада');
        return;
      }

      navigate(resolveAfterLogin(response.data), { replace: true });
    } catch (err) {
      console.error('Ошибка:', err);
      setError('Произошла ошибка при входе');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles['manager-auth-page']}>
      <HeaderManager />
      <div className={styles['manager-auth-container']}>
        <div className={styles['manager-auth-card']}>
          <h2 className={styles['manager-auth-title']}>
            Менеджера склада
            <span className={styles['manager-auth-title-icon']}>
              <BsPersonFill size={28} color='#000000' />
            </span>
          </h2>
          
          {error && (
            <div className={styles['manager-auth-error-message']}>
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className={styles['manager-auth-form-group']}>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="Username"
                required
                disabled={loading}
              />
            </div>

            <div className={styles['manager-auth-form-group']}>
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

            <button 
              type="submit" 
              className={`${styles['manager-auth-submit-button']} ${loading ? styles['manager-auth-loading'] : ''}`}
              disabled={loading}
            >
              {loading ? 'Загрузка...' : 'Войти'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AuthPageManager;