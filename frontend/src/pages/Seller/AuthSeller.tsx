import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import HeaderSeller from "./HeaderSeller";
import styles from './AuthSeller.module.css';

const Authorizationseller: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    inn: "",
    fio: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === "inn") {
      setFormData({
        ...formData,
        inn: value.replace(/\D/g, "").slice(0, 12),
      });
    } else {
      setFormData({ ...formData, fio: value });
    }
    
    // Очищаем ошибку при вводе
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Валидация
    if (!formData.inn || !formData.fio) {
      setError("Пожалуйста, заполните все поля");
      setIsLoading(false);
      return;
    }

    if (formData.inn.length < 10) {
      setError("ИНН должен содержать 10 или 12 цифр");
      setIsLoading(false);
      return;
    }

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const sellerProfile = {
        inn: formData.inn,
        fio: formData.fio,
      };

      // ✅ сохраняем профиль
      localStorage.setItem("sellerProfile", JSON.stringify(sellerProfile));

      // ✅ авторизация
      localStorage.setItem("token", "seller-token-" + Date.now());
      sessionStorage.setItem("userRole", "seller");

      // Перенаправление
      navigate("/seller/dashboard");

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
              <label className={styles['seller-auth-label-text']}>ИНН</label>
              <input
                type="text"
                name="inn"
                value={formData.inn}
                onChange={handleInputChange}
                className={`${styles['seller-auth-input-field']} ${error && !formData.inn ? styles['seller-auth-error'] : ''}`}
                placeholder="Введите 10 или 12 цифр"
                required
                disabled={isLoading}
              />
            </div>

            <div className={styles['seller-auth-form-field']}>
              <label className={styles['seller-auth-label-text']}>ФИО</label>
              <input
                type="text"
                name="fio"
                value={formData.fio}
                onChange={handleInputChange}
                className={`${styles['seller-auth-input-field']} ${error && !formData.fio ? styles['seller-auth-error'] : ''}`}
                placeholder="Иванов Иван Иванович"
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