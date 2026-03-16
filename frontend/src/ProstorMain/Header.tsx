import React, { useState } from 'react';
import { LuMenu } from "react-icons/lu";
import { IoPersonCircleOutline } from "react-icons/io5";
import { useNavigate } from 'react-router-dom';
import './Header.css';

const Header: React.FC = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleMouseEnter = () => {
    setIsDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    setIsDropdownOpen(false);
  };

  const handleRoleClick = (role: string) => {
    setIsDropdownOpen(false);
    
    switch(role) {
      case 'buyer':
        navigate('/auth'); // Изменено: теперь ведет на страницу авторизации
        break;
      case 'seller':
        navigate('/auth'); // Тоже на авторизацию, если нужно
        break;
      case 'warehouse':
        navigate('/auth'); // Тоже на авторизацию, если нужно
        break;
      case 'admin':
        navigate('/auth'); // Тоже на авторизацию, если нужно
        break;
      default:
        break;
    }
  };

  return (
    <header className="header">
      <div className="logo">prostor</div>
      
      <div className="header-center">
        <div className="menu-icon">
          <LuMenu size={38} color='#000000' />
        </div>
        <div className="search-bar">
          <input type="text" placeholder="Поиск товаров..." />
        </div>
        <div 
          className="avatar-container"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className='ava-icon'>
            <IoPersonCircleOutline size={50} color='#000000' />
          </div>
          
          {isDropdownOpen && (
            <div className="role-dropdown">
              <div 
                className="role-item"
                onClick={() => handleRoleClick('buyer')}
              >
                Войти как покупатель
              </div>
              <div 
                className="role-item"
                onClick={() => handleRoleClick('seller')}
              >
                Войти как продавец
              </div>
              <div 
                className="role-item"
                onClick={() => handleRoleClick('warehouse')}
              >
                Войти как менеджер склада
              </div>
              <div 
                className="role-item"
                onClick={() => handleRoleClick('admin')}
              >
                Войти как администратор
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="header-right"></div>
    </header>
  );
};

export default Header;