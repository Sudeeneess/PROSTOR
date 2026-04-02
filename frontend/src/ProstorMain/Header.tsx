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
        navigate('/auth');
        break;
      case 'seller':
        navigate('seller/auth');
        break;
      case 'warehouse':
        navigate('warehouse/auth');
        break;
      case 'admin':
        navigate('admin/auth');
        break;
      default:
        break;
    }
  };

  return (
    <header className="main-header">
      <div className="main-logo">prostor</div>
      
      <div className="main-header-center">
        <div className="main-menu-icon">
          <LuMenu size={38} color='#000000' />
        </div>
        <div className="main-search-bar">
          <input type="text" placeholder="Поиск товаров..." />
        </div>
        <div 
          className="main-avatar-container"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className='main-ava-icon'>
            <IoPersonCircleOutline size={50} color='#000000' />
          </div>
          
          {isDropdownOpen && (
            <div className="main-role-dropdown">
              <div 
                className="main-role-item"
                onClick={() => handleRoleClick('buyer')}
              >
                Войти как покупатель
              </div>
              <div 
                className="main-role-item"
                onClick={() => handleRoleClick('seller')}
              >
                Войти как продавец
              </div>
              <div 
                className="main-role-item"
                onClick={() => handleRoleClick('warehouse')}
              >
                Войти как менеджер склада
              </div>
              <div 
                className="main-role-item"
                onClick={() => handleRoleClick('admin')}
              >
                Войти как администратор
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="main-header-right"></div>
    </header>
  );
};

export default Header;