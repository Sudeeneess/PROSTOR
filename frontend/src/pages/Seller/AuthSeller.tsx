import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import HeaderSeller from "./HeaderSeller";
import "./AuthSeller.css";

const Authorizationseller: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    inn: "",
    fio: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

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

      setSuccessMessage("Авторизация успешна!");

      setTimeout(() => {
        navigate("/seller/dashboard");
      }, 1000);

    } catch {
      setErrorMessage("Ошибка авторизации");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="prostor-seller-app">
      <HeaderSeller />

      <main className="content-section">
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-form-header">Авторизация продавца</div>

          <div className="form-container">
            <div className="form-field">
              <label>ИНН</label>
              <input
                type="text"
                name="inn"
                value={formData.inn}
                onChange={handleInputChange}
                className="input-field"
                required
              />
            </div>

            <div className="form-field">
              <label>ФИО</label>
              <input
                type="text"
                name="fio"
                value={formData.fio}
                onChange={handleInputChange}
                className="input-field"
                required
              />
            </div>

            <button className="save-button" disabled={isLoading}>
              {isLoading ? "Вход..." : "Войти"}
            </button>
          </div>

          {errorMessage && <p className="error-message">{errorMessage}</p>}
          {successMessage && <p className="success-message">{successMessage}</p>}

          <div className="registration-link">
            Нет аккаунта? <Link to="/seller/register">Регистрация</Link>
          </div>
        </form>
      </main>
    </div>
  );
};

export default Authorizationseller;