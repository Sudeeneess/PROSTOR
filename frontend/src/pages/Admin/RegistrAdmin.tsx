import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import HeaderAdmin from "./HeaderAdmin";
import "./RegistrAdmin.css";

const RegistrAdmin: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    login: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validatePassword = (password: string): boolean => {
    return password.length >= 6 && /\d/.test(password);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!validatePassword(formData.password)) {
      setErrorMessage("Пароль должен содержать минимум 6 символов и хотя бы одну цифру");
      setLoading(false);
      return;
    }

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const adminProfile = {
        login: formData.login,
        password: formData.password,
      };

      // ✅ сохраняем пользователя
      localStorage.setItem("adminProfile", JSON.stringify(adminProfile));

      // ✅ сразу авторизуем
      localStorage.setItem("token", "admin-token-" + Date.now());
      sessionStorage.setItem("userRole", "admin");

      setSuccessMessage("Регистрация успешна!");

      setTimeout(() => {
        navigate("/admin"); // 👉 сразу в админку
      }, 1000);

    } catch {
      setErrorMessage("Ошибка регистрации");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="prostor-admin-app">
      <HeaderAdmin />

      <main className="content-section">
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-form-header">Регистрация администратора</div>

          <div className="form-container">
            <input
              type="text"
              name="login"
              placeholder="Логин"
              value={formData.login}
              onChange={handleChange}
              className="input-field"
              required
            />

            <input
              type="password"
              name="password"
              placeholder="Пароль"
              value={formData.password}
              onChange={handleChange}
              className="input-field"
              required
            />

            <button className="save-button" disabled={loading}>
              {loading ? "Регистрация..." : "Зарегистрироваться"}
            </button>
          </div>

          {errorMessage && <p className="error-message">{errorMessage}</p>}
          {successMessage && <p className="success-message">{successMessage}</p>}

          <div className="login-footer">
            Уже есть аккаунт? <Link to="/admin/auth">Войти</Link>
          </div>
        </form>
      </main>
    </div>
  );
};

export default RegistrAdmin;