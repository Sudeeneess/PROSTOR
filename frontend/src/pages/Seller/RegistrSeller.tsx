import React from "react";
import { Link } from "react-router-dom";
import "./Seller/RegistrSeller.css";

interface FormValues {
  country?: string;
  orgForm?: string;
  inn?: string;
  fullname?: string;
}

const initialFormData: FormValues = {};

const SellerEntrance: React.FC = () => {
  const [formData, setFormData] = React.useState(initialFormData);
  const [loading, setLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const { name, value } = event.target;
    
    // Ограничения для поля ИНН
    if (name === 'inn') {
      // Удаляем все нецифровые символы
      const numericValue = value.replace(/\D/g, '');
      // Ограничиваем длину до 12 символов
      const truncatedValue = numericValue.slice(0, 12);
      
      setFormData((prev) => ({ ...prev, [name]: truncatedValue }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (event: React.FormEvent): Promise<void> => {
    event.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    // Дополнительная проверка ИНН перед отправкой
    if (formData.inn && formData.inn.length !== 12) {
      setErrorMessage("ИНН должен содержать ровно 12 цифр");
      setLoading(false);
      return;
    }

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      console.log("Данные отправлены:", formData);
      setSuccessMessage("Регистрация прошла успешно!");
    } catch (err) {
      setErrorMessage("Что-то пошло не так. Повторите попытку позже.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="prostor-seller-app">
      <header className="header-section">
        <div className="logo-text">
          <span className="logo-prostor">prostor</span>
          <span className="logo-seller">Seller</span>
        </div>
        <nav className="navigation-bar">
          <Link to="/" className="navigation-link">Главная</Link>
          <Link to="/products" className="navigation-link">Товары</Link>
          <Link to="/orders" className="navigation-link">Заказы</Link>
          <Link to="/profile" className="navigation-link">Профиль</Link>
        </nav>
      </header>

      <section className="content-section">
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-form-header">Регистрация</div>
          <div className="form-container">
            <div className="form-row">
              <div className="form-field">
                <label className="label-text" htmlFor="country">Страна:</label>
                <select
                  id="country"
                  name="country"
                  value={formData.country || ''}
                  onChange={handleChange}
                  className="input-select"
                  required
                >
                  <option value=""></option>
                  <option value="RU">Россия</option>
                  <option value="KZ">Казахстан</option>
                </select>
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-field">
                <label className="label-text" htmlFor="orgForm">Организация:</label>
                <select
                  id="orgForm"
                  name="orgForm"
                  value={formData.orgForm || ''}
                  onChange={handleChange}
                  className="input-select"
                  required
                >
                  <option value=""></option>
                  <option value="IP">Индивидуальный предприниматель</option>
                  <option value="OOO">Общество с ограниченной ответственностью</option>
                  <option value="AO">Акционерное общество</option>
                </select>
              </div>
            </div>

            <div className="form-field">
              <label className="label-text" htmlFor="inn">ИНН:</label>
              <input
                type="text"
                id="inn"
                name="inn"
                value={formData.inn || ''}
                onChange={handleChange}
                className="input-field"
                required
                maxLength={12}
                pattern="\d*"
                inputMode="numeric"
              />
            </div>

            <div className="form-field">
              <label className="label-text" htmlFor="fullname">ФИО:</label>
              <input
                type="text"
                id="fullname"
                name="fullname"
                value={formData.fullname || ''}
                onChange={handleChange}
                className="input-field"
                required
              />
            </div>

            <div className="button-section">
              <button type="submit" className="save-button" disabled={loading}>
                {loading ? 'Регистрация...' : 'Зарегистрироваться'}
              </button>
            </div>
          </div>

          {errorMessage && <p className="error-message">{errorMessage}</p>}
          {successMessage && <p className="success-message">{successMessage}</p>}
          <div className="login-footer">
          Уже есть аккаунт? <Link to="/authorization">Войти</Link>
          </div>
        </form>
      </section>
    </div>
  );
};

export default SellerEntrance;