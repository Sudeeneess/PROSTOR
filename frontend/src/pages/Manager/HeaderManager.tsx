import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HeaderManager.css';

const Header: React.FC = () => {
  const navigate = useNavigate();

  const handleMenuClick = (action: string) => {
    switch(action) {
      case 'receiving':
        console.log('Переход на страницу склада через пункт меню "Приемка"');
        navigate('/warehouse');
        break;
      case 'shipping':
        navigate('/shipping');
        break;
      case 'assembly':
        navigate('/assembly');
        break;
      default:
        break;
    }
  };

  return (
    <header className="manager-header">
      <div className="manager-logo">prostor</div>
      
      <div className="manager-menu">
        <button 
          className="manager-menu-item"
          onClick={() => handleMenuClick('receiving')}
        >
          Приемка
        </button>
        <button 
          className="manager-menu-item"
          onClick={() => handleMenuClick('shipping')}
        >
          Отгрузка
        </button>
        <button 
          className="manager-menu-item"
          onClick={() => handleMenuClick('assembly')}
        >
          Сборка
        </button>
      </div>
    </header>
  );
};

export default Header;