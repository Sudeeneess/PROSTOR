import React, { useState } from 'react';
import { BsPersonFill } from "react-icons/bs";
import '../css_files/AuthPopup.css';

interface AuthPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthPopup: React.FC<AuthPopupProps> = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true); // true - вход, false - регистрация
  const [formData, setFormData] = useState({
    name: '',
    phoneOrEmail: '',
    password: '',
    confirmPassword: ''
  });

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      console.log('Вход:', { 
        phoneOrEmail: formData.phoneOrEmail, 
        password: formData.password 
      });
      // Здесь будет логика входа
    } else {
      console.log('Регистрация:', formData);
      // Здесь будет логика регистрации
    }
  };

  const switchToRegister = () => {
    setIsLogin(false);
    setFormData({ 
      name: '', 
      phoneOrEmail: '', 
      password: '', 
      confirmPassword: '' 
    });
  };

  const switchToLogin = () => {
    setIsLogin(true);
    setFormData({ 
      name: '', 
      phoneOrEmail: '', 
      password: '', 
      confirmPassword: '' 
    });
  };

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-content" onClick={e => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>×</button>
        
        <h2 className="popup-title">
            {isLogin ? 'Авторизация' : 'Регистрация'} <div className="title-icon">
                    <BsPersonFill size={28} color='#000000' />
            </div>
            </h2>
        
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
                />
              </div>

              <div className="form-group">
                <input
                  type="text"
                  id="phoneOrEmail"
                  name="phoneOrEmail"
                  value={formData.phoneOrEmail}
                  onChange={handleInputChange}
                  placeholder="Номер телефона / Email"
                  required
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
                />
              </div>
            </>
          ) : (
            // Форма входа
            <>
              <div className="form-group">
                <input
                  type="text"
                  id="phoneOrEmail"
                  name="phoneOrEmail"
                  value={formData.phoneOrEmail}
                  onChange={handleInputChange}
                  placeholder="Имя"
                  required
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
                />
              </div>
            </>
          )}

          <button type="submit" className="submit-button">
            {isLogin ? 'Войти' : 'Создать аккаунт'}
          </button>
        </form>

        <div className="popup-footer">
          {isLogin ? (
            <p>
              У вас нет аккаунта?{' '}
              <button onClick={switchToRegister} className="link-button">
                Создать аккаунт
              </button>
            </p>
          ) : (
            <p>
              Уже есть аккаунт?{' '}
              <button onClick={switchToLogin} className="link-button">
                Войти
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPopup;