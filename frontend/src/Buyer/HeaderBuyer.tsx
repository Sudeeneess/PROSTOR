import './HeaderBuyer.css';
import React, { useState } from 'react';
import { LuMenu } from "react-icons/lu";
import { IoPersonCircleOutline } from "react-icons/io5";
import { FaBasketShopping } from "react-icons/fa6";

import { useNavigate } from 'react-router-dom';

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
        navigate('/');
        break;
      case 'seller':
        navigate('/seller');
        break;
      case 'warehouse':
        navigate('/warehouse');
        break;
      case 'admin':
        navigate('/admin');
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
          <div className='basket-icon'>
            <FaBasketShopping size={40} color='#000000'/>
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