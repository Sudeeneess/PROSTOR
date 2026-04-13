import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import HeaderSeller from "./HeaderSeller";
import styles from './RegistrSeller.module.css';
import { api } from "../../services/api";
import SellerFioInput from "../../components/SellerFioInput";
import { formatFioDisplay } from "../../utils/fioInput";

const SellerEntrance: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    phone: "",
    password: "",
    confirmPassword: "",
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
    } else if (name === "phone") {
      setFormData({
        ...formData,
        phone: value.replace(/\D/g, "").slice(0, 11),
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

    if (!formData.username || !formData.phone || !formData.password || !formData.confirmPassword) {
      setErrorMessage("Заполните username, телефон и пароль");
      setLoading(false);
      return;
    }

    if (formData.inn.length < 10 || formData.inn.length > 12) {
      setErrorMessage("ИНН должен содержать 10-12 цифр");
      setLoading(false);
      return;
    }

    const fioNorm = formatFioDisplay(formData.fullname);
    const fioParts = fioNorm.split(/\s+/).filter(Boolean);
    if (fioParts.length !== 3) {
      setErrorMessage("ФИО должно содержать 3 слова: фамилия, имя, отчество");
      setLoading(false);
      return;
    }

    try {
      const response = await api.register({
        username: formData.username.trim(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        phone: formData.phone,
        role: "SELLER",
        inn: formData.inn,
        companyName: fioNorm,
      });

      if (!response.success) {
        setErrorMessage(response.error || "Ошибка регистрации");
        return;
      }

      const sellerProfile = {
        username: formData.username.trim(),
        phone: formData.phone.replace(/\D/g, ''),
        orgForm: formData.orgForm,
        inn: formData.inn,
        fio: fioNorm,
      };

      // ✅ сохраняем профиль
      localStorage.setItem("sellerProfile", JSON.stringify(sellerProfile));

      setSuccessMessage("Регистрация успешна!");

      // После регистрации сервер не выдаёт JWT, переводим на форму входа.
      setTimeout(() => {
        navigate("/seller/auth");
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
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              className={styles['seller-reg-input-field']}
              required
            />

            <input
              type="tel"
              name="phone"
              placeholder="Телефон (11 цифр)"
              value={formData.phone}
              onChange={handleChange}
              className={styles['seller-reg-input-field']}
              required
            />

            <input
              type="password"
              name="password"
              placeholder="Пароль"
              value={formData.password}
              onChange={handleChange}
              className={styles['seller-reg-input-field']}
              required
            />

            <input
              type="password"
              name="confirmPassword"
              placeholder="Повторите пароль"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={styles['seller-reg-input-field']}
              required
            />

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

            <SellerFioInput
              name="fullname"
              value={formData.fullname}
              onChange={(value) => setFormData({ ...formData, fullname: value })}
              className={styles['seller-reg-input-field']}
              placeholder="Фамилия Имя Отчество"
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