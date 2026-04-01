import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import HeaderAdmin from "./HeaderAdmin";
import "./AuthAdmin.css";

const AuthorizationAdmin: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    login: "",
    password: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const savedProfile = JSON.parse(localStorage.getItem("adminProfile") || "{}");

      // ✅ проверка логина и пароля
      if (
        savedProfile.login !== formData.login ||
        savedProfile.password !== formData.password
      ) {
        throw new Error();
      }

      localStorage.setItem("token", "admin-token-" + Date.now());
      sessionStorage.setItem("userRole", "admin");

      setSuccessMessage("Авторизация успешна!");

      setTimeout(() => {
        navigate("/admin"); // 👉 в админку
      }, 1000);

    } catch {
      setErrorMessage("Неверный логин или пароль");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="prostor-admin-app">
      <HeaderAdmin />

      <main className="content-section">
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-form-header">Авторизация администратора</div>

          <div className="form-container">
            <div className="form-field">
              <label>Логин</label>
              <input
                type="text"
                name="login"
                value={formData.login}
                onChange={handleInputChange}
                className="input-field"
                required
              />
            </div>

            <div className="form-field">
              <label>Пароль</label>
              <input
                type="password"
                name="password"
                value={formData.password}
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
            Нет аккаунта? <Link to="/admin/register">Зарегистрироваться</Link>
          </div>
        </form>
      </main>
    </div>
  );
};

export default AuthorizationAdmin;