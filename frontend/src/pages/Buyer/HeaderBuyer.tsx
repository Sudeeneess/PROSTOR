import './HeaderBuyer.css';
import React, { useState } from 'react';
import { LuMenu } from "react-icons/lu";
import { IoPersonCircleOutline } from "react-icons/io5";
import { FaBasketShopping } from "react-icons/fa6";
import { useNavigate } from 'react-router-dom';

const Header: React.FC = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const navigate = useNavigate();

  // обработчики списков
  const handleMouseEnter = () => {
    setIsDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    setIsDropdownOpen(false);
  };

  const handleCatalogMouseEnter = () => {
    setIsCatalogOpen(true);
  };

  const handleCatalogMouseLeave = () => {
    setIsCatalogOpen(false);
    setActiveCategory(null);
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

  // Обработчик клика на аватар
  const handleAvatarClick = () => {
    navigate('/profile'); 
  };

  //массив подкатегорий
  const catalogData = [
    {
      name: 'Верх',
      subcategories: [
        'Футболки',
        'Рубашки', 
        'Свитера'
      ]
    },
    {
      name: 'Низ',
      subcategories: [
        'Джинсы',
        'Брюки',
        'Шорты',
        'Юбки',
      ]
    },
    {
      name: 'Верхняя одежда',
      subcategories: [
        'Куртки',
        'Пальто',
        'Пуховики',
        'Плащи',
      ]
    },
    {
      name: 'Обувь',
      subcategories: [
        'Кроссовки',
        'Ботинки',
        'Туфли',
        'Сандалии',
        'Сапоги',
        'Кеды',
      ]
    },
    {
      name: 'Остальное',
      subcategories: [
        'Аксессуары',
        'Сумки',
        'Головные уборы',
        'Шарфы',
      ]
    }
  ];

  return (
    <header className="buyer-header">
      <div className="buyer-logo">prostor</div>
      
      <div className="buyer-header-center">
        <div 
          className="buyer-menu-icon"
          onMouseEnter={handleCatalogMouseEnter}
          onMouseLeave={handleCatalogMouseLeave}
        >
          <LuMenu size={38} color='#000000' />
          
          {/*единый контейнер для каталога и подкатегорий */}
          {isCatalogOpen && (
            <div className="buyer-catalog-wrapper">
              {/*осн каталог */}
              <div className="buyer-catalog-dropdown">
                {catalogData.map((category, index) => (
                  <div 
                    key={index} 
                    className={`buyer-catalog-item ${activeCategory === category.name ? 'active' : ''}`}
                    onMouseEnter={() => setActiveCategory(category.name)}
                    onClick={() => console.log(`Выбрана категория: ${category.name}`)}
                  >
                    {category.name}
                  </div>
                ))}
              </div>
              
              {/*Подменю с подкатегориями*/}
              {activeCategory && (
                <div 
                  className="buyer-subcategory-dropdown"
                  onMouseEnter={() => setActiveCategory(activeCategory)} 
                  onMouseLeave={() => setActiveCategory(null)} 
                >
                  <div className="buyer-subcategory-header">
                    <h3>{activeCategory}</h3>
                  </div>
                  <div className="buyer-subcategory-list">
                    {catalogData
                      .find(cat => cat.name === activeCategory)
                      ?.subcategories.map((subcategory, idx) => (
                        <div 
                          key={idx} 
                          className="buyer-subcategory-item"
                          onClick={() => console.log(`Выбрана подкатегория: ${subcategory}`)}
                        >
                          {subcategory}
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="buyer-search-bar">
          <input type="text" placeholder="Поиск товаров..." />
        </div>
        
        <div 
          className="buyer-avatar-container"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div 
            className='buyer-ava-icon'
            onClick={handleAvatarClick}  // Добавлен обработчик клика
            style={{ cursor: 'pointer' }} // Курсор в виде указателя
          >
            <IoPersonCircleOutline size={50} color='#000000' />
          </div>
          <div className='buyer-basket-icon'>
            <FaBasketShopping size={40} color='#000000'/>
          </div>
          
          {isDropdownOpen && (
            <div className="buyer-role-dropdown">
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