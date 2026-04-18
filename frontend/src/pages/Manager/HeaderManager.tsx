import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './HeaderManager.module.css';
import { api } from '../../services/api';

export type WarehouseHeaderSection = 'dashboard' | 'receiving' | 'shipment' | 'assembling';

interface HeaderProps {
  onManagementClick?: () => void;
  onMenuItemChange?: (menuItem: string) => void; // Добавляем callback для изменения пункта меню
  /** Какой экран склада открыт (дашборд и вложенные разделы на одном URL). */
  activeWarehouseSection?: WarehouseHeaderSection;
}

const Header: React.FC<HeaderProps> = ({ onManagementClick, onMenuItemChange, activeWarehouseSection }) => {
  const navigate = useNavigate();

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
          className={`${styles['manager-menu-item']} ${activeWarehouseSection === 'dashboard' ? styles['active'] : ''}`}
          onClick={() => handleMenuClick('management')}
        >
          Управление
        </button>
        <button
          type="button"
          className={`${styles['manager-menu-item']} ${activeWarehouseSection === 'receiving' ? styles['active'] : ''}`}
          onClick={() => handleMenuClick('receiving')}
        >
          Приемка
        </button>
        <button
          type="button"
          className={`${styles['manager-menu-item']} ${activeWarehouseSection === 'shipment' ? styles['active'] : ''}`}
          onClick={() => handleMenuClick('shipment')}
        >
          Отгрузка
        </button>
        <button
          type="button"
          className={`${styles['manager-menu-item']} ${activeWarehouseSection === 'assembling' ? styles['active'] : ''}`}
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