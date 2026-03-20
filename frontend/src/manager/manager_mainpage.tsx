import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HeaderManager from './HeaderManager';
import './style_main.css';

interface ManagerProps {
  onLogin?: () => void;
}

const Manager: React.FC<ManagerProps> = ({ onLogin }) => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  const handleLogin = () => {
    // Простая валидация
    if (!login || !password) {
      setError('Введите логин и пароль');
      return;
    }

    // Здесь должна быть реальная авторизация через API
    console.log('Попытка входа с логином:', login);
    
    // Имитация успешного входа
    if (login.length > 0 && password.length > 0) {
      setError('');
      
      // Вызываем onLogin если он передан
      if (onLogin) {
        onLogin();
      }
      
      // Переход на страницу склада
      navigate('/sklad');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  // Обработчик для клика по вкладкам шапки
  const handleTabClick = (tab: 'priemka' | 'sborka' | 'otgruzka') => {
    console.log('Клик по вкладке:', tab);
    
    // Показываем сообщение для всех вкладок кроме активной
    if (tab !== 'priemka') {
      alert('Раздел временно недоступен');
    } else {
      // Для активной вкладки просто скроллим к форме авторизации
      const authBox = document.querySelector('.auth-container');
      if (authBox) {
        authBox.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  // Обработчик для клика по "Войти" в шапке
  const handleLoginClick = () => {
    console.log('Клик по Войти');
    // Прокручиваем к форме авторизации
    const authBox = document.querySelector('.auth-container');
    if (authBox) {
      authBox.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="container">
      {/* Используем компонент HeaderManager */}
      <HeaderManager 
        activeTab="priemka"
        onTabClick={handleTabClick}
        onLoginClick={handleLoginClick}
      />
      
      <div className="auth-container">
        <div className="auth-box">
          <h2>Авторизация</h2>
          {error && <div className="error-message">{error}</div>}
          <input
            type="text"
            className="input-field"
            placeholder="Логин/Email"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <input
            type="password"
            className="input-field"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button className="login-button" onClick={handleLogin}>
            Войти
          </button>
        </div>
      </div>
    </div>
  );
};

export default Manager;