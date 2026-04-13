import styles from './HeaderMain.module.css';
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { LuMenu } from 'react-icons/lu';
import { IoPersonCircleOutline } from 'react-icons/io5';
import { FaBasketShopping } from 'react-icons/fa6';
import { Link, useNavigate } from 'react-router-dom';
import { CATALOG_CATEGORIES } from '../data/categories';
import {
  searchHeaderCatalog,
  getHeaderSearchNavigatePath,
  getFirstHeaderSearchHit,
  type HeaderSearchHit,
} from '../utils/catalogSearch';
import { api } from '../services/api';

export type HeaderMainVariant = 'landing' | 'buyer';

interface HeaderMainProps {
  variant?: HeaderMainVariant;
  // onCartClick больше не нужен, убираем его
}

const HeaderMain: React.FC<HeaderMainProps> = ({ variant = 'buyer' }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [activeCategorySlug, setActiveCategorySlug] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchPanelOpen, setSearchPanelOpen] = useState(false);
  const searchWrapRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const searchResults = useMemo(
    () => searchHeaderCatalog(searchQuery),
    [searchQuery]
  );

  const hasSearchQuery = searchQuery.trim().length > 0;
  const hasSearchHits =
    hasSearchQuery &&
    (searchResults.categories.length > 0 ||
      searchResults.subcategories.length > 0 ||
      searchResults.brands.length > 0);

  useEffect(() => {
    const onDocDown = (e: MouseEvent) => {
      if (!searchWrapRef.current?.contains(e.target as Node)) {
        setSearchPanelOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocDown);
    return () => document.removeEventListener('mousedown', onDocDown);
  }, []);

  const applySearchHit = (hit: HeaderSearchHit) => {
    navigate(getHeaderSearchNavigatePath(hit));
    setSearchQuery('');
    setSearchPanelOpen(false);
  };

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
    setActiveCategorySlug(null);
  };

  const closeCatalog = () => {
    setIsCatalogOpen(false);
    setActiveCategorySlug(null);
  };

  const handleRoleClick = (role: string) => {
    setIsDropdownOpen(false);

    if (variant === 'landing') {
      switch (role) {
        case 'buyer':
          navigate('/auth');
          break;
        case 'seller':
          navigate('/seller/main');
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
      case 'guest':
        api.logout();
        navigate('/', { replace: true });
        break;
      case 'seller':
        navigate('/seller/main');
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

  // Новая функция для обработки клика по корзине
  const handleCartClick = () => {
    const token = localStorage.getItem('token');
    const userRole = api.getStoredUserRole();

    if (token && userRole === 'customer') {
      navigate('/basket');
    } 
    // Если не авторизован
    else {
      navigate('/auth');
    }
  };

  const logo = (
    <Link
      to={variant === 'landing' ? '/' : '/customer'}
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
          {/* Клик по иконке — сразу в корень каталога */}
          <button
            type="button"
            className={styles['hm-menu-button']}
            aria-label="Открыть каталог"
            onClick={() => {
              navigate('/catalog');
              closeCatalog();
            }}
          >
            <LuMenu size={38} color="#ffffff" />
          </button>

          {isCatalogOpen && (
            <div className={styles['hm-catalog-wrapper']}>
              <div className={styles['hm-catalog-dropdown']}>
                <div
                  className={`${styles['hm-catalog-item']} ${styles['hm-catalog-all']}`}
                  onMouseEnter={() => setActiveCategorySlug(null)}
                  onClick={() => {
                    navigate('/catalog');
                    closeCatalog();
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      navigate('/catalog');
                      closeCatalog();
                    }
                  }}
                >
                  Все разделы
                </div>
                {CATALOG_CATEGORIES.map((category) => (
                  <div
                    key={category.slug}
                    className={`${styles['hm-catalog-item']} ${activeCategorySlug === category.slug ? styles['active'] : ''}`}
                    onMouseEnter={() => setActiveCategorySlug(category.slug)}
                    onClick={() => {
                      navigate(`/catalog/${category.slug}`);
                      closeCatalog();
                    }}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        navigate(`/catalog/${category.slug}`);
                        closeCatalog();
                      }
                    }}
                  >
                    {category.name}
                  </div>
                ))}
              </div>

              {activeCategorySlug && (
                <div
                  className={styles['hm-subcategory-dropdown']}
                  onMouseEnter={() => setActiveCategorySlug(activeCategorySlug)}
                  onMouseLeave={() => setActiveCategorySlug(null)}
                >
                  <div className={styles['hm-subcategory-header']}>
                    <h3>
                      {CATALOG_CATEGORIES.find((c) => c.slug === activeCategorySlug)
                        ?.name ?? ''}
                    </h3>
                  </div>
                  <div className={styles['hm-subcategory-list']}>
                    {CATALOG_CATEGORIES.find((c) => c.slug === activeCategorySlug)
                      ?.subcategories.map((sub) => (
                        <div
                          key={sub.slug}
                          className={styles['hm-subcategory-item']}
                          onClick={() => {
                            navigate(
                              `/catalog/${activeCategorySlug}/${sub.slug}`
                            );
                            closeCatalog();
                          }}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              navigate(
                                `/catalog/${activeCategorySlug}/${sub.slug}`
                              );
                              closeCatalog();
                            }
                          }}
                        >
                          {sub.name}
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div
          className={styles['hm-search-wrap']}
          ref={searchWrapRef}
        >
          <div className={styles['hm-search-bar']}>
            <input
              type="search"
              role="combobox"
              aria-expanded={searchPanelOpen && hasSearchQuery}
              aria-autocomplete="list"
              aria-controls={
                searchPanelOpen && hasSearchQuery
                  ? 'hm-search-suggestions'
                  : undefined
              }
              placeholder="Поиск товаров…"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSearchPanelOpen(true);
              }}
              onFocus={() => setSearchPanelOpen(true)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setSearchPanelOpen(false);
                  (e.target as HTMLInputElement).blur();
                }
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const hit = getFirstHeaderSearchHit(searchQuery);
                  if (hit) applySearchHit(hit);
                }
              }}
            />
          </div>

          {searchPanelOpen && hasSearchQuery && (
            <div
              id="hm-search-suggestions"
              className={styles['hm-search-dropdown']}
              role="listbox"
              aria-label="Подсказки поиска по каталогу"
            >
              {!hasSearchHits ? (
                <div className={styles['hm-search-empty']}>
                  Ничего не найдено — попробуйте другое написание
                </div>
              ) : (
                <>
                  {searchResults.categories.length > 0 && (
                    <div className={styles['hm-search-group']}>
                      <div className={styles['hm-search-group-label']}>
                        Категории
                      </div>
                      {searchResults.categories.map((hit) => (
                        <button
                          key={`c-${hit.slug}`}
                          type="button"
                          role="option"
                          className={styles['hm-search-item']}
                          onMouseDown={(ev) => ev.preventDefault()}
                          onClick={() => applySearchHit(hit)}
                        >
                          {hit.label}
                          <span className={styles['hm-search-itemHint']}>
                            Раздел каталога
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                  {searchResults.subcategories.length > 0 && (
                    <div className={styles['hm-search-group']}>
                      <div className={styles['hm-search-group-label']}>
                        Подкатегории
                      </div>
                      {searchResults.subcategories.map((hit) => (
                        <button
                          key={`s-${hit.categorySlug}-${hit.subSlug}`}
                          type="button"
                          role="option"
                          className={styles['hm-search-item']}
                          onMouseDown={(ev) => ev.preventDefault()}
                          onClick={() => applySearchHit(hit)}
                        >
                          {hit.label}
                          <span className={styles['hm-search-itemHint']}>
                            {hit.categoryLabel}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                  {searchResults.brands.length > 0 && (
                    <div className={styles['hm-search-group']}>
                      <div className={styles['hm-search-group-label']}>
                        Бренды
                      </div>
                      {searchResults.brands.map((hit) => (
                        <button
                          key={`b-${hit.brandName}`}
                          type="button"
                          role="option"
                          className={styles['hm-search-item']}
                          onMouseDown={(ev) => ev.preventDefault()}
                          onClick={() => applySearchHit(hit)}
                        >
                          {hit.brandName}
                          <span className={styles['hm-search-itemHint']}>
                            Все товары бренда
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        <div className={styles['hm-header-actions']}>
          <div
            className={styles['hm-avatar-wrap']}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div className={styles['hm-ava-icon']} onClick={handleAvatarClick}>
              <IoPersonCircleOutline size={50} color="#ffffff" />
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
                {variant === 'buyer' && (
                  <div
                    className={styles['hm-role-item']}
                    role="menuitem"
                    onClick={() => handleRoleClick('guest')}
                  >
                    Выйти к гостю
                  </div>
                )}
              </div>
            )}
          </div>

          <div 
            className={styles['hm-basket-icon']} 
            aria-label="Корзина"
            onClick={handleCartClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleCartClick()}
          >
            <FaBasketShopping size={40} color="#ffffff" />
          </div>
        </div>
      </div>

      <div className={styles['hm-header-right']} aria-hidden />
    </header>
  );
};

export default HeaderMain;