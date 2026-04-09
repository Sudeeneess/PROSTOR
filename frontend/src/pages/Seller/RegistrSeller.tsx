import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import HeaderSeller from "./HeaderSeller";
import styles from './RegistrSeller.module.css';

const SellerEntrance: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    country: "",
    orgForm: "",
    inn: "",
    fullname: "",
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === "inn") {
      setFormData({
        ...formData,
        inn: value.replace(/\D/g, "").slice(0, 12),
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    if (formData.inn.length !== 12) {
      setErrorMessage("ИНН должен содержать 12 цифр");
      setLoading(false);
      return;
    }

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const sellerProfile = {
        country: formData.country,
        orgForm: formData.orgForm,
        inn: formData.inn,
        fio: formData.fullname,
      };

      // ✅ сохраняем профиль
      localStorage.setItem("sellerProfile", JSON.stringify(sellerProfile));

      // ✅ создаём авторизацию
      localStorage.setItem("token", "seller-token-" + Date.now());
      sessionStorage.setItem("userRole", "seller");

      setSuccessMessage("Регистрация успешна!");

      // ✅ сразу в личный кабинет
      setTimeout(() => {
        navigate("/seller/dashboard");
      }, 1000);

    } catch {
      setErrorMessage("Ошибка регистрации");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`seller-app-shell ${styles['seller-reg-app']}`}>
      <HeaderSeller />

      <main className={styles['seller-reg-content-section']}>
        <form className={styles['seller-reg-auth-form']} onSubmit={handleSubmit}>
          <div className={styles['seller-reg-auth-form-header']}>Регистрация продавца</div>

          <div className={styles['seller-reg-form-container']}>
            <select
              name="country"
              value={formData.country}
              onChange={handleChange}
              required
              className={styles['seller-reg-input-select']}
            >
              <option value="">Страна</option>
              <option value="RU">Россия</option>
              <option value="KZ">Казахстан</option>
            </select>

            <select
              name="orgForm"
              value={formData.orgForm}
              onChange={handleChange}
              required
              className={styles['seller-reg-input-select']}
            >
              <option value="">Выберите форму организации</option>
              <option value="IP">Индивидуальный предприниматель</option>
              <option value="OOO">Общество с ограниченной ответственностью</option>
              <option value="AO">Акционерное общество</option>
            </select>

            <input
              type="text"
              name="inn"
              placeholder="ИНН"
              value={formData.inn}
              onChange={handleChange}
              className={styles['seller-reg-input-field']}
              required
            />

            <input
              type="text"
              name="fullname"
              placeholder="ФИО"
              value={formData.fullname}
              onChange={handleChange}
              className={styles['seller-reg-input-field']}
              required
            />

            <div className={styles['seller-reg-button-section']}>
              <button className={styles['seller-reg-save-button']} disabled={loading}>
                {loading ? "Регистрация..." : "Зарегистрироваться"}
              </button>
            </div>
          </div>

          {errorMessage && <p className={styles['seller-reg-error-message']}>{errorMessage}</p>}
          {successMessage && <p className={styles['seller-reg-success-message']}>{successMessage}</p>}

          <div className={styles['seller-reg-login-footer']}>
            Уже есть аккаунт? <Link to="/seller/auth">Войти</Link>
          </div>
        </form>
      </main>
    </div>
  );
};

export default SellerEntrance;