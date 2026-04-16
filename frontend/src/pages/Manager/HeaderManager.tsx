import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './HeaderManager.module.css';
import { api } from '../../services/api';

interface HeaderProps {
  onManagementClick?: () => void;
  onMenuItemChange?: (menuItem: string) => void; // Добавляем callback для изменения пункта меню
}

const Header: React.FC<HeaderProps> = ({ onManagementClick, onMenuItemChange }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleMenuClick = (action: string) => {
    switch(action) {
      case 'management':
        if (onManagementClick) {
          onManagementClick();
        } else {
          navigate('/warehouse/dashboard');
        }
        break;
      case 'receiving':
        if (onMenuItemChange) {
          onMenuItemChange('receiving');
        }
        break;
      case 'shipment':
        if (onMenuItemChange) {
          onMenuItemChange('shipment');
        }
        break;
      case 'assembling':
        if (onMenuItemChange) {
          onMenuItemChange('assembling');
        }
        break;
      case 'guest':
        api.logout();
        sessionStorage.removeItem('userName');
        window.location.replace('/');
        break;
      default:
        break;
    }
  };

  return (
    <header className={styles['manager-header']}>
      <div className={styles['manager-logo']}>
        prostor
        <span className={styles['manager-badge']}>Manager</span>
      </div>
      
      <div className={styles['manager-menu']}>
        <button
          type="button"
          className={`${styles['manager-menu-item']} ${location.pathname === '/warehouse/dashboard' ? styles['active'] : ''}`}
          onClick={() => handleMenuClick('management')}
        >
          Управление
        </button>
        <button
          type="button"
          className={styles['manager-menu-item']}
          onClick={() => handleMenuClick('receiving')}
        >
          Приемка
        </button>
        <button
          type="button"
          className={styles['manager-menu-item']}
          onClick={() => handleMenuClick('shipment')}
        >
          Отгрузка
        </button>
        <button
          type="button"
          className={styles['manager-menu-item']}
          onClick={() => handleMenuClick('assembling')}
        >
          Сборка
        </button>
        <button
          type="button"
          className={styles['manager-menu-item']}
          onClick={() => handleMenuClick('guest')}
        >
          Выйти к гостю
        </button>
      </div>
    </header>
  );
};

export default Header;