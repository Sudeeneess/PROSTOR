import React, { useState } from 'react';
import { LuMenu } from "react-icons/lu";
import { RxAvatar } from "react-icons/rx";
import '../css_files/Header.css';
import AuthPopup from './AuthPopup';

const Header: React.FC = () => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const openPopup = () => setIsPopupOpen(true);
  const closePopup = () => setIsPopupOpen(false);

  return (
    <>
      <header className="header">
        <div className="logo">prostor</div>
        
        <div className="header-center">
          <div className="menu-icon">
            <LuMenu size={38} color='#000000' />
          </div>
          <div className="search-bar">
            <input type="text" placeholder="Поиск товаров..." />
          </div>
          <div className='ava-icon' onClick={openPopup}>
            <RxAvatar size={40} color='#000000' />
          </div>
        </div>

        <div className="header-right"></div>
      </header>

      <AuthPopup isOpen={isPopupOpen} onClose={closePopup} />
    </>
  );
};

export default Header;