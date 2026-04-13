import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ProductGrid from '../../components/ProductGrid';
import CatalogFilters from '../../components/CatalogFilters';
import {
  emptyCatalogFilter,
  filterCatalogProducts,
  type CatalogFilterState,
  type CatalogGridProduct,
} from '../../data/mockCatalogProducts';
import styles from './CatalogCategoryPage.module.css';
import { api } from '../../services/api';
import { enrichProductListForGrid } from '../../utils/catalogFromApi';

function goodsWord(n: number): string {
  const m = n % 10;
  const m100 = n % 100;
  if (m100 >= 11 && m100 <= 14) return 'товаров';
  if (m === 1) return 'товар';
  if (m >= 2 && m <= 4) return 'товара';
  return 'товаров';
}

/** Список товаров раздела: GET /api/categories/:id + /api/products?categoryId= */
const CatalogCategoryPage: React.FC = () => {
  const { categoryId: categoryIdParam = '' } = useParams<{
    categoryId: string;
  }>();
  const categoryId = parseInt(categoryIdParam, 10);

  const homePath = useMemo(() => {
    const token = localStorage.getItem('token');
    const role = api.getStoredUserRole();
    return token && role === 'customer' ? '/customer' : '/';
  }, []);

  const [filter, setFilter] = useState<CatalogFilterState>(() =>
    emptyCatalogFilter()
  );
  const [categoryTitle, setCategoryTitle] = useState<string>('');
  const [baseProducts, setBaseProducts] = useState<CatalogGridProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setFilter(emptyCatalogFilter());
  }, [categoryIdParam]);

  useEffect(() => {
    if (!Number.isFinite(categoryId) || categoryId < 1) {
      setLoading(false);
      setError('Некорректный раздел каталога');
      setBaseProducts([]);
      setCategoryTitle('');
      return;
    }

    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      const catRes = await api.getCategoryById(categoryId);
      if (cancelled) return;
      if (!catRes.success || !catRes.data) {
        setError(catRes.error ?? 'Раздел не найден');
        setCategoryTitle('');
        setBaseProducts([]);
        setLoading(false);
        return;
      }
      setCategoryTitle(catRes.data.categoryName);

      const prodRes = await api.getProducts({
        categoryId,
        page: 0,
        size: 100,
      });
      if (cancelled) return;
      if (!prodRes.success || !prodRes.data?.content) {
        setError(prodRes.error ?? 'Не удалось загрузить товары');
        setBaseProducts([]);
        setLoading(false);
        return;
      }
      const enriched = await enrichProductListForGrid(prodRes.data.content, {
        categoryKey: `s-${categoryId}`,
        subKey: 'all',
      });
      if (!cancelled) {
        setBaseProducts(enriched);
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [categoryId, categoryIdParam]);

  const filteredProducts = useMemo(
    () => filterCatalogProducts(baseProducts, filter),
    [baseProducts, filter]
  );

  if (!Number.isFinite(categoryId) || categoryId < 1) {
    return (
      <div className={styles['page']}>
        <div className={styles['inner']}>
          <p className={styles['notFound']}>Раздел не найден.</p>
          <Link to="/catalog" className={styles['link']}>
            В каталог
          </Link>
        </div>
      </div>
    );
  }

  if (!loading && error && baseProducts.length === 0) {
    return (
      <div className={styles['page']}>
        <div className={styles['inner']}>
          <p className={styles['notFound']} role="alert">
            {error}
          </p>
          <Link to="/catalog" className={styles['link']}>
            В каталог
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
          <span className={styles['crumbCurrent']}>
            {loading ? '…' : categoryTitle || 'Раздел'}
          </span>
        </nav>

        <h1 className={styles['title']}>
          {loading ? 'Загрузка…' : categoryTitle}
        </h1>
        {!loading && (
          <p className={styles['meta']}>
            Показано {filteredProducts.length} из {baseProducts.length}{' '}
            {goodsWord(baseProducts.length)}
          </p>
        )}

        <div className={styles['body']}>
          <CatalogFilters
            products={baseProducts}
            value={filter}
            onChange={setFilter}
          />
          <div className={styles['gridWrap']}>
            {loading && <p className={styles['empty']}>Загрузка товаров…</p>}
            {!loading && filteredProducts.length === 0 && (
              <p className={styles['empty']}>
                {baseProducts.length === 0
                  ? 'В этом разделе пока нет товаров.'
                  : 'Нет товаров по выбранным фильтрам. Сбросьте фильтры.'}
              </p>
            )}
            {!loading && filteredProducts.length > 0 && (
              <ProductGrid products={filteredProducts} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CatalogCategoryPage;
