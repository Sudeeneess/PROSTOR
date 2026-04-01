import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HeaderAdmin.css';

interface HeaderAdminProps {
  onMenuItemChange?: (menuItem: string) => void;
}

const HeaderAdmin: React.FC<HeaderAdminProps> = ({ onMenuItemChange }) => {
  const navigate = useNavigate();

  const handleMenuClick = (menuItem: string) => {
    switch (menuItem) {
      case 'main':
        navigate('/admin');
        if (onMenuItemChange) {
          onMenuItemChange('main');
        }
        break;

      case 'users':
        navigate('/admin/users'); // ✅ ДОБАВИЛИ
        if (onMenuItemChange) {
          onMenuItemChange('users');
        }
        break;

      case 'products':
        navigate('/admin/products'); // уже есть ✅
        if (onMenuItemChange) {
          onMenuItemChange('products');
        }
        break;

      case 'admin':
        navigate('/admin'); // ✅ ДОБАВИЛИ норм переход
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
      </div>
    </header>
  );
};

export default HeaderAdmin;