import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './HeaderManager.css';

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
        console.log('Переход на главную страницу склада');
        if (onManagementClick) {
          onManagementClick();
        } else {
          navigate('/warehouse');
        }
        break;
      case 'receiving':
        console.log('Показ страницы приемки');
        if (onMenuItemChange) {
          onMenuItemChange('receiving'); // Передаем, что выбран пункт "Приемка"
        }
        break;
      case 'shipment':
        console.log('Показ страницы отгрузки');
        if (onMenuItemChange) {
          onMenuItemChange('shipment'); // Передаем, что выбран пункт "Отгрузка"
        }
        break;
      case 'assembling':
        console.log('Показ страницы сборки');
        if (onMenuItemChange) {
          onMenuItemChange('assembling'); // Передаем, что выбран пункт "Сборка"
        }
        break;
      default:
        break;
    }
  };

  if (location.pathname === '/auth/warehouse') {
    return (
      <header className="manager-header">
        <div className="manager-logo">prostor</div>
      </header>
    );
  }

  return (
    <header className="manager-header">
      <div className="manager-logo">
        prostor
        <span className="manager-badge">Manager</span>
      </div>
      
      <div className="manager-menu">
        <button 
          className={`manager-menu-item ${location.pathname === '/warehouse' ? 'active' : ''}`}
          onClick={() => handleMenuClick('management')}
        >
          Управление
        </button>
        <button 
          className={`manager-menu-item`}
          onClick={() => handleMenuClick('receiving')}
        >
          Приемка
        </button>
        <button 
          className={`manager-menu-item`}
          onClick={() => handleMenuClick('shipment')}
        >
          Отгрузка
        </button>
        <button 
          className={`manager-menu-item`}
          onClick={() => handleMenuClick('assembling')}
        >
          Сборка
        </button>
      </div>
    </header>
  );
};

export default Header;