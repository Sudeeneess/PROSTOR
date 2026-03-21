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
    <header className="buyer-header">
      <div className="buyer-logo">prostor</div>
      
      <div className="buyer-header-center">
        <div className="buyer-menu-icon">
          <LuMenu size={38} color='#000000' />
        </div>
        <div className="buyer-search-bar">
          <input type="text" placeholder="Поиск товаров..." />
        </div>
        <div 
          className="buyer-avatar-container"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className='buyer-ava-icon'>
            <IoPersonCircleOutline size={50} color='#000000' />
          </div>
          <div className='buyer-basket-icon'>
            <FaBasketShopping size={40} color='#000000'/>
          </div>
          
          {isDropdownOpen && (
            <div className="buyer-role-dropdown">
              <div 
                className="buyer-role-item"
                onClick={() => handleRoleClick('buyer')}
              >
                Войти как покупатель
              </div>
              <div 
                className="buyer-role-item"
                onClick={() => handleRoleClick('seller')}
              >
                Войти как продавец
              </div>
              <div 
                className="buyer-role-item"
                onClick={() => handleRoleClick('warehouse')}
              >
                Войти как менеджер склада
              </div>
              <div 
                className="buyer-role-item"
                onClick={() => handleRoleClick('admin')}
              >
                Войти как администратор
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="buyer-header-right"></div>
    </header>
  );
};

export default Header;