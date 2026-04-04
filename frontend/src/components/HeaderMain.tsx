import styles from './HeaderMain.module.css';
import React, { useState } from 'react';
import { LuMenu } from 'react-icons/lu';
import { IoPersonCircleOutline } from 'react-icons/io5';
import { FaBasketShopping } from 'react-icons/fa6';
import { Link, useNavigate } from 'react-router-dom';

export type HeaderMainVariant = 'landing' | 'buyer';

interface HeaderMainProps {
  variant?: HeaderMainVariant;
}

const catalogData = [
  {
    name: 'Верх',
    subcategories: ['Футболки', 'Рубашки', 'Свитера'],
  },
  {
    name: 'Низ',
    subcategories: ['Джинсы', 'Брюки', 'Шорты', 'Юбки'],
  },
  {
    name: 'Верхняя одежда',
    subcategories: ['Куртки', 'Пальто', 'Пуховики', 'Плащи'],
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
    ],
  },
  {
    name: 'Остальное',
    subcategories: ['Аксессуары', 'Сумки', 'Головные уборы', 'Шарфы'],
  },
];

const HeaderMain: React.FC<HeaderMainProps> = ({ variant = 'buyer' }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const navigate = useNavigate();

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

    if (variant === 'landing') {
      switch (role) {
        case 'buyer':
          navigate('/auth');
          break;
        case 'seller':
          navigate('/seller/auth');
          break;
        case 'warehouse':
          navigate('/warehouse/auth');
          break;
        case 'admin':
          navigate('/admin/auth');
          break;
        default:
          break;
      }
      return;
    }

    switch (role) {
      case 'seller':
        navigate('/seller/auth');
        break;
      case 'warehouse':
        navigate('/warehouse/auth');
        break;
      case 'admin':
        navigate('/admin/auth');
        break;
      default:
        break;
    }
  };

  const handleAvatarClick = () => {
    if (variant === 'buyer') {
      navigate('/profile');
    }
  };

  const logo = (
    <Link
      to={variant === 'landing' ? '/' : '/buyer'}
      className={styles['hm-logo']}
      title="На главную"
    >
      prostor
    </Link>
  );

  return (
    <header className={styles['hm-header']}>
      {logo}

      <div className={styles['hm-header-center']}>
        <div
          className={styles['hm-menu-icon']}
          onMouseEnter={handleCatalogMouseEnter}
          onMouseLeave={handleCatalogMouseLeave}
        >
          <LuMenu size={38} color="#000000" />

          {isCatalogOpen && (
            <div className={styles['hm-catalog-wrapper']}>
              <div className={styles['hm-catalog-dropdown']}>
                {catalogData.map((category, index) => (
                  <div
                    key={index}
                    className={`${styles['hm-catalog-item']} ${activeCategory === category.name ? styles['active'] : ''}`}
                    onMouseEnter={() => setActiveCategory(category.name)}
                    onClick={() => console.log(`Выбрана категория: ${category.name}`)}
                  >
                    {category.name}
                  </div>
                ))}
              </div>

              {activeCategory && (
                <div
                  className={styles['hm-subcategory-dropdown']}
                  onMouseEnter={() => setActiveCategory(activeCategory)}
                  onMouseLeave={() => setActiveCategory(null)}
                >
                  <div className={styles['hm-subcategory-header']}>
                    <h3>{activeCategory}</h3>
                  </div>
                  <div className={styles['hm-subcategory-list']}>
                    {catalogData
                      .find((cat) => cat.name === activeCategory)
                      ?.subcategories.map((subcategory, idx) => (
                        <div
                          key={idx}
                          className={styles['hm-subcategory-item']}
                          onClick={() =>
                            console.log(`Выбрана подкатегория: ${subcategory}`)
                          }
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

        <div className={styles['hm-search-bar']}>
          <input type="text" placeholder="Поиск товаров..." />
        </div>

        <div className={styles['hm-header-actions']}>
          <div
            className={styles['hm-avatar-wrap']}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div className={styles['hm-ava-icon']} onClick={handleAvatarClick}>
              <IoPersonCircleOutline size={50} color="#000000" />
            </div>

            {isDropdownOpen && (
              <div className={styles['hm-role-dropdown']} role="menu">
                <div className={styles['hm-role-dropdown-heading']} role="presentation">
                  Сменить роль
                </div>
                {variant === 'landing' && (
                  <div
                    className={styles['hm-role-item']}
                    role="menuitem"
                    onClick={() => handleRoleClick('buyer')}
                  >
                    Войти как покупатель
                  </div>
                )}
                <div
                  className={styles['hm-role-item']}
                  role="menuitem"
                  onClick={() => handleRoleClick('seller')}
                >
                  Войти как продавец
                </div>
                <div
                  className={styles['hm-role-item']}
                  role="menuitem"
                  onClick={() => handleRoleClick('warehouse')}
                >
                  Войти как менеджер склада
                </div>
                <div
                  className={styles['hm-role-item']}
                  role="menuitem"
                  onClick={() => handleRoleClick('admin')}
                >
                  Войти как администратор
                </div>
              </div>
            )}
          </div>

          <div className={styles['hm-basket-icon']} aria-label="Корзина">
            <FaBasketShopping size={40} color="#000000" />
          </div>
        </div>
      </div>

      <div className={styles['hm-header-right']} aria-hidden />
    </header>
  );
};

export default HeaderMain;
