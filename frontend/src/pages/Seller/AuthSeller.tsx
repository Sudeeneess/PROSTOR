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

      // Перенаправление без показа сообщения
      navigate("/seller/dashboard");

    } catch {
      // Ошибка обрабатывается, но не показывается пользователю
      console.error("Ошибка авторизации");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="seller-auth-app">
      <HeaderSeller />

      <main className="seller-auth-content-section">
        <form className="seller-auth-form" onSubmit={handleSubmit}>
          <div className="seller-auth-form-header">Авторизация продавца</div>

          <div className="seller-auth-form-container">
            <div className="seller-auth-form-field">
              <label className="seller-auth-label-text">ИНН</label>
              <input
                type="text"
                name="inn"
                value={formData.inn}
                onChange={handleInputChange}
                className="seller-auth-input-field"
                required
              />
            </div>

            <div className="seller-auth-form-field">
              <label className="seller-auth-label-text">ФИО</label>
              <input
                type="text"
                name="fio"
                value={formData.fio}
                onChange={handleInputChange}
                className="seller-auth-input-field"
                required
              />
            </div>

            <div className="seller-auth-button-section">
              <button className="seller-auth-save-button" disabled={isLoading}>
                {isLoading ? "Вход..." : "Войти"}
              </button>
            </div>
          </div>

          <div className="seller-auth-registration-link">
            Нет аккаунта? <Link to="/seller/register">Регистрация</Link>
          </div>
        </form>
      </main>
    </div>
  );
};

export default Authorizationseller;