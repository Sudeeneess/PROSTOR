import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BsPersonFill } from "react-icons/bs";
import HeaderManager from './HeaderManager';
import './AuthPageManager.css';
// ИЗМЕНЕНИЕ: удален импорт api

const AuthPageManager: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    password: ''
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

    // ИЗМЕНЕНИЕ: убрана вся логика работы с API
    // Теперь просто проверяем, что поля не пустые
    if (!formData.username || !formData.password) {
      setError('Пожалуйста, заполните все поля');
      setLoading(false);
      return;
    }

    try {
      console.log('Вход менеджера склада:', { username: formData.username });
      
      // ИЗМЕНЕНИЕ: имитация успешной авторизации
      // Сохраняем тестовые данные пользователя
      localStorage.setItem('token', 'test-token-manager');
      sessionStorage.setItem('userName', formData.username);
      sessionStorage.setItem('userRole', 'warehouse_manager');
      
      console.log('Вход успешен! Перенаправление на страницу склада');
      
      // ИЗМЕНЕНИЕ: перенаправление на страницу склада
      navigate('/warehouse');
      
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
          
          {/* Отображение ошибки */}
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