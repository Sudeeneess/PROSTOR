import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import InputMask from 'react-input-mask';
import { BsPersonFill } from 'react-icons/bs';
import HeaderMain from '../../components/HeaderMain';
import styles from './AuthPageBuyer.module.css';
import { api, isBuyerPortalRole } from '../../services/api';

function persistRegistrationPhone(phoneMasked: string) {
  const digits = phoneMasked.replace(/\D/g, '');
  if (digits.length === 11) {
    localStorage.setItem('userPhone', digits);
  }
}

const AuthPageBuyer: React.FC = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    username: '',
    password: '',
    confirmPassword: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
    setInfo(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setInfo(null);

    try {
      if (isLogin) {
        const response = await api.login({
          username: formData.username,
          password: formData.password,
        });

        if (response.success && response.data) {
          if (!isBuyerPortalRole(response.data.role)) {
            api.logout();
            setError(
              'Этот логин относится к другой роли (продавец, склад или администратор). Войдите через соответствующий раздел на главной странице.'
            );
            setLoading(false);
            return;
          }
          if (formData.name.trim()) {
            localStorage.setItem('userName', formData.name.trim());
            const nameParts = formData.name.trim().split(/\s+/);
            if (nameParts.length >= 2) {
              localStorage.setItem('userFirstName', nameParts[0]);
              localStorage.setItem('userLastName', nameParts.slice(1).join(' '));
            } else {
              localStorage.setItem('userFirstName', formData.name.trim());
              localStorage.removeItem('userLastName');
            }
          }
          navigate('/customer', { replace: true });
        } else {
          setError(response.error || 'Неверное имя пользователя или пароль');
        }
      } else {
        if (formData.password !== formData.confirmPassword) {
          setError('Пароли не совпадают');
          setLoading(false);
          return;
        }
        if (formData.password.length < 6) {
          setError('Пароль должен быть не менее 6 символов');
          setLoading(false);
          return;
        }

        const response = await api.register({
          username: formData.username,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          phone: formData.phone,
          role: 'CUSTOMER',
          displayName: formData.name.trim() || undefined,
        });

        if (!response.success) {
          setError(response.error || 'Ошибка при регистрации');
          return;
        }

        if (response.needsLogin) {
          if (formData.name.trim()) {
            localStorage.setItem('userName', formData.name.trim());
          }
          persistRegistrationPhone(formData.phone);
          setInfo('Регистрация прошла успешно. Войдите в систему.');
          setIsLogin(true);
          setFormData((prev) => ({
            ...prev,
            password: '',
            confirmPassword: '',
          }));
          return;
        }

        if (response.data) {
          if (!isBuyerPortalRole(response.data.role)) {
            api.logout();
            setError(
              'Этот логин относится к другой роли (продавец, склад или администратор). Войдите через соответствующий раздел на главной странице.'
            );
            setLoading(false);
            return;
          }
          if (formData.name.trim()) {
            localStorage.setItem('userName', formData.name.trim());
          }
          persistRegistrationPhone(formData.phone);
          navigate('/customer', { replace: true });
        }
      }
    } catch (err) {
      setError('Произошла непредвиденная ошибка. Проверьте подключение к серверу.');
    } finally {
      setLoading(false);
    }
  };

  const switchToRegister = () => {
    setIsLogin(false);
    setFormData({
      name: '',
      phone: '',
      username: '',
      password: '',
      confirmPassword: '',
    });
    setError(null);
    setInfo(null);
  };

  const switchToLogin = () => {
    setIsLogin(true);
    setFormData({
      name: '',
      phone: '',
      username: '',
      password: '',
      confirmPassword: '',
    });
    setError(null);
    setInfo(null);
  };

  return (
    <div className={styles['buyer-auth-page']}>
      <HeaderMain variant="landing" />
      <div className={styles['buyer-auth-container']}>
        <div className={styles['buyer-auth-card']}>
          <h2 className={styles['buyer-auth-title']}>
            {isLogin ? 'Авторизация клиента' : 'Регистрация клиента'}
            <div className={styles['buyer-auth-title-icon']}>
              <BsPersonFill size={28} color="#000000" />
            </div>
          </h2>

          {info && (
            <div className={styles['buyer-auth-success-message']} role="status">
              {info}
            </div>
          )}
          {error && (
            <div className={styles['buyer-auth-error-message']}>{error}</div>
          )}

          <form onSubmit={handleSubmit}>
            {!isLogin ? (
              <>
                <div className={styles['buyer-auth-form-group']}>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Введите ваше имя"
                    required
                    disabled={loading}
                  />
                </div>

                <div className={styles['buyer-auth-form-group']}>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="Имя пользователя"
                    required
                    disabled={loading}
                  />
                </div>

                <div className={styles['buyer-auth-form-group']}>
                  <InputMask
                    mask="+7 (999) 999-99-99"
                    maskChar="_"
                    id="phone-reg"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+7 (___) ___-__-__"
                    disabled={loading}
                    required
                    autoComplete="tel"
                  >
                    {(inputProps: React.InputHTMLAttributes<HTMLInputElement>) => (
                      <input {...inputProps} type="tel" />
                    )}
                  </InputMask>
                </div>

                <div className={styles['buyer-auth-form-group']}>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Придумайте пароль"
                    required
                    disabled={loading}
                  />
                </div>

                <div className={styles['buyer-auth-form-group']}>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Повторите пароль"
                    required
                    disabled={loading}
                  />
                </div>
              </>
            ) : (
              <>
                <div className={styles['buyer-auth-form-group']}>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="Имя пользователя"
                    required
                    disabled={loading}
                  />
                </div>

                <div className={styles['buyer-auth-form-group']}>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Введите пароль"
                    required
                    disabled={loading}
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              className={styles['buyer-auth-submit-button']}
              disabled={loading}
            >
              {loading ? 'Загрузка...' : isLogin ? 'Войти' : 'Создать аккаунт'}
            </button>
          </form>

          <div className={styles['buyer-auth-footer']}>
            {isLogin ? (
              <p>
                У вас нет аккаунта?{' '}
                <button
                  type="button"
                  onClick={switchToRegister}
                  className={styles['buyer-auth-link-button']}
                  disabled={loading}
                >
                  Создать аккаунт
                </button>
              </p>
            ) : (
              <p>
                Уже есть аккаунт?{' '}
                <button
                  type="button"
                  onClick={switchToLogin}
                  className={styles['buyer-auth-link-button']}
                  disabled={loading}
                >
                  Войти
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPageBuyer;
