import React from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Seller/Autho.css";

const Authorizationseller: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = React.useState({
    inn: '',
    fio: ''
  });
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'inn') {
      const onlyNumbers = value.replace(/[^0-9]/g, '');
      const truncatedValue = onlyNumbers.slice(0, 12);
      setFormData(prev => ({
        ...prev,
        [name]: truncatedValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      navigate('/dashboard');
      setSuccessMessage('Авторизация успешна!');
    } catch (error) {
      setErrorMessage('Ошибка авторизации. Попробуйте снова.');
    } finally {
      setIsLoading(false);
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
          <Link to="/" className="navigation-link">На главную</Link>
          <Link to="/products" className="navigation-link">Товары</Link>
          <Link to="/orders" className="navigation-link">Заказы</Link>
          <Link to="/profile" className="navigation-link">Личный кабинет</Link>
        </nav>
      </header>

      <main className="content-section">
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-form-header">Авторизация</div>

          <div className="form-container">
            <div className="form-field">
              <label className="label-text" htmlFor="inn">ИНН</label>
              <input
                type="text"
                id="inn"
                name="inn"
                value={formData.inn}
                onChange={handleInputChange}
                className="input-field"
                required
                maxLength={12}
                pattern="[0-9]*"
                inputMode="numeric"
              />
              <small className="input-hint"></small>
            </div>

            <div className="form-field">
              <label className="label-text" htmlFor="fio">ФИО</label>
              <input
                type="text"
                id="fio"
                name="fio"
                value={formData.fio}
                onChange={handleInputChange}
                className="input-field"
                required
              />
            </div>
            
            <div className="button-section">
              <button type="submit" className="save-button" disabled={isLoading}>
                {isLoading ? 'Авторизация...' : 'Войти'}
              </button>
            </div>
          </div>

          {errorMessage && (
            <p className="error-message">{errorMessage}</p>
          )}

          {successMessage && (
            <p className="success-message">{successMessage}</p>
          )}

          <div className="registration-link">
            <span>У вас нет аккаунта? </span>
            <Link to="/seller-entrance">Создать аккаунт</Link>
          </div>
        </form>
      </main>
    </div>
  );
};

export default Authorizationseller;