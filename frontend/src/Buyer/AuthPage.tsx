import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BsPersonFill } from "react-icons/bs";
import Header from './HeaderBuyer';
import './AuthPage.css';

const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true); // true - вход, false - регистрация
  const [formData, setFormData] = useState({
    name: '',
    phoneOrEmail: '',
    password: '',
    confirmPassword: ''
  });

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
      
      // Перенаправление на главную страницу покупателя
      navigate('/buyer');
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

          <div className="auth-footer">
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
    </div>
  );
};

export default AuthPage;