import React, { useState } from 'react';
import './style_main.css';

interface ManagerProps {
  onLogin?: () => void;
}

const manager: React.FC<ManagerProps> = ({ onLogin }) => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = () => {
    // Простая валидация
    if (!login || !password) {
      setError('Введите логин и пароль');
      return;
    }

    // реальная авторизация через API
    console.log('Попытка входа с логином:', login);
    
    // Имитация успешного входа
    if (login.length > 0 && password.length > 0) {
      setError('');
      // Переход в личный кабинет
      if (onLogin) {
        onLogin();
      } else {
        alert('Вход выполнен успешно!');
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div className="container">
      <div className="header">
        <div className="header-title">
          <span className="prostor">PROSTOR</span>
          <span className="manager">Manager</span>
        </div>
        <div className="nav">
          <span>Приемка</span>
          <span>Сборка</span>
          <span>Отгрузка</span>
          <span className="login-bold">Войти</span>
        </div>
      </div>
      
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

export default manager;