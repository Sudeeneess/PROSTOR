import styles from './HeaderMain.module.css';
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { LuMenu } from 'react-icons/lu';
import { IoPersonCircleOutline } from 'react-icons/io5';
import { FaBasketShopping } from 'react-icons/fa6';
import { Link, useNavigate } from 'react-router-dom';
import {
  searchHeaderCatalog,
  getHeaderSearchNavigatePath,
  getFirstHeaderSearchHit,
  type HeaderSearchHit,
  type CatalogSearchOptions,
} from '../utils/catalogSearch';
import { api } from '../services/api';

export type HeaderMainVariant = 'landing' | 'buyer';

interface HeaderMainProps {
  variant?: HeaderMainVariant;
}

const HeaderMain: React.FC<HeaderMainProps> = ({ variant = 'buyer' }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [catalogMenu, setCatalogMenu] = useState<
    { id: number; categoryName: string }[]
  >([]);
  const [brandNames, setBrandNames] = useState<string[]>([]);
  const [menuLoaded, setMenuLoaded] = useState(false);
  const [searchPanelOpen, setSearchPanelOpen] = useState(false);
  const searchWrapRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const catRes = await api.getCategoriesListForUi();
      const brRes = await api.getBrands(0, 120);
      if (cancelled) return;
      if (catRes.success && catRes.data?.content?.length) {
        setCatalogMenu(
          catRes.data.content.map((c) => ({
            id: c.id,
            categoryName: c.categoryName,
          }))
        );
      }
      if (brRes.success && brRes.data?.content?.length) {
        setBrandNames(brRes.data.content.map((b) => b.name));
      }
      setMenuLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const catalogSearchOpts: CatalogSearchOptions = useMemo(() => {
    if (!menuLoaded) {
      return { apiCategories: [], brandNames };
    }
    return {
      apiCategories: catalogMenu,
      brandNames,
    };
  }, [menuLoaded, catalogMenu, brandNames]);

  const searchResults = useMemo(
    () => searchHeaderCatalog(searchQuery, catalogSearchOpts),
    [searchQuery, catalogSearchOpts]
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
  };

  const closeCatalog = () => {
    setIsCatalogOpen(false);
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
        window.location.replace('/');
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

  const handleCartClick = () => {
    const token = localStorage.getItem('token');
    const userRole = api.getStoredUserRole();

    if (token && userRole === 'customer') {
      navigate('/basket');
    } 
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
                {catalogMenu.map((category) => (
                  <div
                    key={category.id}
                    className={styles['hm-catalog-item']}
                    onClick={() => {
                      navigate(`/catalog/section/${category.id}`);
                      closeCatalog();
                    }}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        navigate(`/catalog/section/${category.id}`);
                        closeCatalog();
                      }
                    }}
                  >
                    {category.categoryName}
                  </div>
                ))}
              </div>
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
                  const hit = getFirstHeaderSearchHit(
                    searchQuery,
                    catalogSearchOpts
                  );
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
                          key={
                            hit.sectionId != null
                              ? `c-${hit.sectionId}`
                              : `c-${hit.slug}`
                          }
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