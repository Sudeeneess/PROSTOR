import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BsPersonFill } from "react-icons/bs";
import HeaderManager from './HeaderManager';
import './AuthPageManager.css';

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
      console.log('Вход менеджера склада:', { username: formData.username });
      
      // Сохраняем данные пользователя
      localStorage.setItem('token', 'test-token-manager');
      sessionStorage.setItem('userName', formData.username);
      sessionStorage.setItem('userRole', 'warehouse_manager');
      
      console.log('Вход успешен! Перенаправление на страницу склада');
      
      // Используем replace, чтобы пользователь не мог вернуться на страницу авторизации через кнопку "Назад"
      navigate('/warehouse', { replace: true });
      
    } catch (err) {
      console.error('Ошибка:', err);
      setError('Произошла ошибка при входе');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <HeaderManager />
      <div className="auth-container">
        <div className="auth-card">
          <h2 className="auth-title">
            Менеджера склада
            <div className="title-icon">
              <BsPersonFill size={28} color='#000000' />
            </div>
          </h2>
          
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="Логин/Email"
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

            <button 
              type="submit" 
              className="submit-button"
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