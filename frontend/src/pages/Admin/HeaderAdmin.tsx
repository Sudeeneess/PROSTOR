import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './HeaderAdmin.css';

interface HeaderAdminProps {
  onMenuItemChange?: (menuItem: string) => void;
}

const HeaderAdmin: React.FC<HeaderAdminProps> = ({ onMenuItemChange }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleMenuClick = (menuItem: string) => {
    switch(menuItem) {
      case 'main':
        console.log('Переход на главную страницу');
        navigate('/admin');
        if (onMenuItemChange) {
          onMenuItemChange('main');
        }
        break;
      case 'users':
        console.log('Показ страницы пользователей');
        if (onMenuItemChange) {
          onMenuItemChange('users');
        }
        break;
      case 'products':
        console.log('Показ страницы товаров');
        if (onMenuItemChange) {
          onMenuItemChange('products');
        }
        break;
      case 'admin':
        console.log('Показ страницы администратора');
        if (onMenuItemChange) {
          onMenuItemChange('admin');
        }
        break;
      default:
        break;
    }
  };

  return (
    <header className="admin-header">
      <div className="admin-logo">
        prostor
        <span className="admin-badge">Admin</span>
      </div>
      
      <div className="admin-menu">
        <button 
          className="admin-menu-item"
          onClick={() => handleMenuClick('main')}
        >
          Главная
        </button>
        <button 
          className="admin-menu-item"
          onClick={() => handleMenuClick('users')}
        >
          Пользователи
        </button>
        <button 
          className="admin-menu-item"
          onClick={() => handleMenuClick('products')}
        >
          Товары
        </button>
        <button 
          className="admin-menu-item"
          onClick={() => handleMenuClick('admin')}
        >
          Admin
        </button>
      </div>
    </header>
  );
};

export default HeaderAdmin;