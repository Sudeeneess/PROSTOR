import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import HeaderAdmin from "./HeaderAdmin";
import styles from './AuthAdmin.module.css';

const AuthorizationAdmin: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    login: "",
    password: "",
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      localStorage.setItem("token", "admin-token-" + Date.now());
      sessionStorage.setItem("userRole", "admin");

      navigate("/admin");

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

          <div className={styles['admin-auth-form-container']}>
            <div className={styles['admin-auth-form-field']}>
              <label>Логин</label>
              <input
                type="text"
                name="login"
                value={formData.login}
                onChange={handleInputChange}
                className={styles['admin-auth-input-field']}
                required
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
                required
              />
            </div>

            <button className={styles['admin-auth-save-button']} disabled={isLoading}>
              {isLoading ? "Вход..." : "Войти"}
            </button>
          </div>

          <div className={styles['admin-auth-registration-link']}>
            Нет аккаунта? <Link to="/admin/register">Зарегистрироваться</Link>
          </div>
        </form>
      </main>
    </div>
  );
};

export default AuthorizationAdmin;