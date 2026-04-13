import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import HeaderSeller from "./HeaderSeller";
import styles from './AuthSeller.module.css';
import { api, resolveAfterLogin } from "../../services/api";

const Authorizationseller: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Очищаем ошибку при вводе
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Валидация
    if (!formData.username || !formData.password) {
      setError("Пожалуйста, заполните все поля");
      setIsLoading(false);
      return;
    }

    try {
      const response = await api.login({
        username: formData.username,
        password: formData.password,
      });

      if (!response.success || !response.data) {
        setError(response.error || "Неверное имя пользователя или пароль");
        return;
      }

      if (response.data.role !== "seller") {
        api.logout();
        setError("Вход доступен только для роли продавца");
        return;
      }

      navigate(resolveAfterLogin(response.data), { replace: true });
    } catch {
      setError("Произошла ошибка при входе");
      console.error("Ошибка авторизации");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`seller-app-shell ${styles['seller-auth-page']}`}>
      <HeaderSeller />

      <main className={styles['seller-auth-content-section']}>
        <form className={styles['seller-auth-form']} onSubmit={handleSubmit}>
          <div className={styles['seller-auth-form-header']}>
            Авторизация продавца
          </div>

          {error && (
            <div className={styles['seller-auth-error-message']}>
              {error}
            </div>
          )}

          <div className={styles['seller-auth-form-container']}>
            <div className={styles['seller-auth-form-field']}>
              <label className={styles['seller-auth-label-text']}>Имя пользователя</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className={`${styles['seller-auth-input-field']} ${error && !formData.username ? styles['seller-auth-error'] : ''}`}
                placeholder="Введите username"
                required
                disabled={isLoading}
              />
            </div>

            <div className={styles['seller-auth-form-field']}>
              <label className={styles['seller-auth-label-text']}>Пароль</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={`${styles['seller-auth-input-field']} ${error && !formData.password ? styles['seller-auth-error'] : ''}`}
                placeholder="Введите пароль"
                required
                disabled={isLoading}
              />
            </div>

            <div className={styles['seller-auth-button-section']}>
              <button 
                className={`${styles['seller-auth-save-button']} ${isLoading ? styles['seller-auth-loading'] : ''}`}
                disabled={isLoading}
              >
                {isLoading ? "Загрузка..." : "Войти"}
              </button>
            </div>
          </div>

          <div className={styles['seller-auth-registration-link']}>
            Нет аккаунта? <Link to="/seller/register">Регистрация</Link>
          </div>
        </form>
      </main>
    </div>
  );
};

export default Authorizationseller;