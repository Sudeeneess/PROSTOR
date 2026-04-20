import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './HeaderAdmin.module.css';
import { api } from '../../services/api';

interface HeaderAdminProps {
  onMenuItemChange?: (menuItem: string) => void;
}

const HeaderAdmin: React.FC<HeaderAdminProps> = ({ onMenuItemChange }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleMenuClick = (menuItem: string) => {
    switch (menuItem) {
      case 'main':
        navigate('/admin');
        if (onMenuItemChange) {
          onMenuItemChange('main');
        }
        break;

      case 'users':
        navigate('/admin/users');
        if (onMenuItemChange) {
          onMenuItemChange('users');
        }
        break;

      case 'receptions':
        navigate('/admin/receptions');
        if (onMenuItemChange) {
          onMenuItemChange('receptions');
        }
        break;

      case 'admin':
        navigate('/admin'); // ✅ ДОБАВИЛИ норм переход
        if (onMenuItemChange) {
          onMenuItemChange('admin');
        }
        break;
      case 'guest':
        api.logout();
        sessionStorage.removeItem('userName');
        localStorage.removeItem('adminProfile');
        window.location.replace('/');
        break;

      default:
        break;
    }
  };

  return (
    <header className={styles['admin-header-container']}>
      <div className={styles['admin-header-logo']}>
        prostor
        <span className={styles['admin-header-badge']}>Admin</span>
      </div>

      <div className={styles['admin-header-menu']}>
        <button
          className={`${styles['admin-header-menu-item']} ${location.pathname === '/admin' ? styles['active'] : ''}`}
          onClick={() => handleMenuClick('main')}
        >
          Главная
        </button>

        <button
          className={`${styles['admin-header-menu-item']} ${location.pathname.startsWith('/admin/users') ? styles['active'] : ''}`}
          onClick={() => handleMenuClick('users')}
        >
          Пользователи
        </button>

        <button
          className={`${styles['admin-header-menu-item']} ${location.pathname.startsWith('/admin/receptions') ? styles['active'] : ''}`}
          onClick={() => handleMenuClick('receptions')}
        >
          Приёмки
        </button>
        <button
          className={styles['admin-header-menu-item']}
          onClick={() => handleMenuClick('guest')}
        >
          Выйти к гостю
        </button>
      </div>
    </header>
  );
};

export default HeaderAdmin;