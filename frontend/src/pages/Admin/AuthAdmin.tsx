import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import HeaderAdmin from "./HeaderAdmin";
import styles from './AuthAdmin.module.css';
import { api, resolveAfterLogin } from "../../services/api";

const AuthorizationAdmin: React.FC = () => {
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
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

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

      if (response.data.role !== "admin") {
        api.logout();
        setError("Вход доступен только для роли администратора");
        return;
      }

      navigate(resolveAfterLogin(response.data), { replace: true });

    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles['admin-auth-app']}>
      <HeaderAdmin />

      <main className={styles['admin-auth-content-section']}>
        <form className={styles['admin-auth-form']} onSubmit={handleSubmit}>
          <div className={styles['admin-auth-form-header']}>Авторизация администратора</div>

          {error && (
            <div className={styles['admin-auth-error-message']}>
              {error}
            </div>
          )}

          <div className={styles['admin-auth-form-container']}>
            <div className={styles['admin-auth-form-field']}>
              <label>Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className={styles['admin-auth-input-field']}
                placeholder="Username"
                required
                disabled={isLoading}
              />
            </div>

            <div className={styles['admin-auth-form-field']}>
              <label>Пароль</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={styles['admin-auth-input-field']}
                placeholder="Введите пароль"
                required
                disabled={isLoading}
              />
            </div>

            <button className={`${styles['admin-auth-save-button']} ${isLoading ? styles['admin-auth-loading'] : ''}`} disabled={isLoading}>
              {isLoading ? "Вход..." : "Войти"}
            </button>
          </div>

        </form>
      </main>
    </div>
  );
};

export default AuthorizationAdmin;