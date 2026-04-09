import React, { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CATALOG_CATEGORIES } from '../../data/categories';
import {
  emptyCatalogFilter,
  filterCatalogProducts,
  getAllCatalogProducts,
  getProductsForCategory,
} from '../../data/mockCatalogProducts';
import ProductGrid from '../../components/ProductGrid';
import styles from './CatalogRootPage.module.css';
import { api } from '../../services/api';

/** Корень каталога: список разделов (/catalog) или сетка по бренду (?brand=). */
const CatalogRootPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const brandParam = searchParams.get('brand')?.trim() ?? '';

  const homePath = useMemo(() => {
    const token = localStorage.getItem('token');
    const role = api.getStoredUserRole();
    return token && role === 'customer' ? '/customer' : '/';
  }, []);

  const brandProducts = useMemo(() => {
    if (!brandParam) return null;
    return filterCatalogProducts(getAllCatalogProducts(), {
      ...emptyCatalogFilter(),
      brands: [brandParam],
    });
  }, [brandParam]);

  if (brandParam && brandProducts) {
    return (
      <div className={styles['page']}>
        <div className={styles['inner']}>
          <nav className={styles['breadcrumb']} aria-label="Хлебные крошки">
            <Link to={homePath} className={styles['crumb']}>
              Главная
            </Link>
            <span className={styles['crumbSep']} aria-hidden>
              /
            </span>
            <Link to="/catalog" className={styles['crumb']}>
              Каталог
            </Link>
            <span className={styles['crumbSep']} aria-hidden>
              /
            </span>
            <span className={styles['crumbCurrent']}>Бренд</span>
          </nav>

          <h1 className={styles['title']}>Товары бренда «{brandParam}»</h1>
          <p className={styles['lead']}>
            <Link to="/catalog" className={styles['brandBackLink']}>
              ← Все разделы каталога
            </Link>
          </p>

          {brandProducts.length === 0 ? (
            <p className={styles['brandEmpty']}>
              Товаров с таким брендом нет. Попробуйте другой запрос в поиске или
              перейдите в раздел каталога.
            </p>
          ) : (
            <ProductGrid products={brandProducts} />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={styles['page']}>
      <div className={styles['inner']}>
        <nav className={styles['breadcrumb']} aria-label="Хлебные крошки">
          <Link to={homePath} className={styles['crumb']}>
            Главная
          </Link>
          <span className={styles['crumbSep']} aria-hidden>
            /
          </span>
          <span className={styles['crumbCurrent']}>Каталог</span>
        </nav>

        <h1 className={styles['title']}>Каталог</h1>
        <p className={styles['lead']}>
          Выберите раздел — откроется сетка товаров с фильтрами.
        </p>

        <ul className={styles['grid']}>
          {CATALOG_CATEGORIES.map((cat) => {
            const count = getProductsForCategory(cat.slug).length;
            return (
              <li key={cat.slug}>
                <Link
                  to={`/catalog/${cat.slug}`}
                  className={styles['card']}
                >
                  <span className={styles['cardTitle']}>{cat.name}</span>
                  <span className={styles['cardMeta']}>
                    {count} товаров
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default CatalogRootPage;
