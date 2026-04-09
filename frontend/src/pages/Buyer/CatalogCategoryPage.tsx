import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ProductGrid from '../../components/ProductGrid';
import CatalogFilters from '../../components/CatalogFilters';
import {
  findCategoryBySlug,
  findSubcategoryBySlug,
} from '../../data/categories';
import {
  emptyCatalogFilter,
  filterCatalogProducts,
  getProductsForCategory,
  type CatalogFilterState,
} from '../../data/mockCatalogProducts';
import styles from './CatalogCategoryPage.module.css';
import { api } from '../../services/api';

function goodsWord(n: number): string {
  const m = n % 10;
  const m100 = n % 100;
  if (m100 >= 11 && m100 <= 14) return 'товаров';
  if (m === 1) return 'товар';
  if (m >= 2 && m <= 4) return 'товара';
  return 'товаров';
}

/** Страница категории или подкатегории: сетка + фильтры по полям БД. */
const CatalogCategoryPage: React.FC = () => {
  const { categorySlug = '', subSlug } = useParams<{
    categorySlug: string;
    subSlug?: string;
  }>();

  const homePath = useMemo(() => {
    const token = localStorage.getItem('token');
    const role = api.getStoredUserRole();
    return token && role === 'customer' ? '/customer' : '/';
  }, []);

  const [filter, setFilter] = useState<CatalogFilterState>(() =>
    emptyCatalogFilter()
  );

  const category = findCategoryBySlug(categorySlug);
  const sub = subSlug
    ? findSubcategoryBySlug(categorySlug, subSlug)
    : undefined;

  // Смена раздела — сбрасываем фильтры (иначе старые чекбоксы «обнулят» выдачу)
  useEffect(() => {
    setFilter(emptyCatalogFilter());
  }, [categorySlug, subSlug]);

  const baseProducts = useMemo(
    () => getProductsForCategory(categorySlug, subSlug),
    [categorySlug, subSlug]
  );

  const filteredProducts = useMemo(
    () => filterCatalogProducts(baseProducts, filter),
    [baseProducts, filter]
  );

  if (!category) {
    return (
      <div className={styles['page']}>
        <div className={styles['inner']}>
          <p className={styles['notFound']}>Категория не найдена.</p>
          <Link to="/catalog" className={styles['link']}>
            В каталог
          </Link>
        </div>
      </div>
    );
  }

  if (subSlug && !sub) {
    return (
      <div className={styles['page']}>
        <div className={styles['inner']}>
          <p className={styles['notFound']}>Подкатегория не найдена.</p>
          <Link to={`/catalog/${categorySlug}`} className={styles['link']}>
            Все товары раздела «{category.name}»
          </Link>
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
          <Link to="/catalog" className={styles['crumb']}>
            Каталог
          </Link>
          <span className={styles['crumbSep']} aria-hidden>
            /
          </span>
          <Link to={`/catalog/${category.slug}`} className={styles['crumb']}>
            {category.name}
          </Link>
          {sub && (
            <>
              <span className={styles['crumbSep']} aria-hidden>
                /
              </span>
              <span className={styles['crumbCurrent']}>{sub.name}</span>
            </>
          )}
        </nav>

        <h1 className={styles['title']}>
          {sub ? `${category.name} — ${sub.name}` : category.name}
        </h1>
        <p className={styles['meta']}>
          Показано {filteredProducts.length} из {baseProducts.length}{' '}
          {goodsWord(baseProducts.length)}
        </p>

        <div className={styles['body']}>
          <CatalogFilters
            products={baseProducts}
            value={filter}
            onChange={setFilter}
            subcategoryOptions={
              sub ? undefined : category.subcategories
            }
          />
          <div className={styles['gridWrap']}>
            {filteredProducts.length === 0 ? (
              <p className={styles['empty']}>
                Нет товаров по выбранным фильтрам. Сбросьте фильтры или
                измените условия.
              </p>
            ) : (
              <ProductGrid products={filteredProducts} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CatalogCategoryPage;
