import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import ProductGrid from '../../components/ProductGrid';
import styles from './CatalogRootPage.module.css';
import { api } from '../../services/api';
import type { Category } from '../../services/api';
import {
  filterCatalogProducts,
  type CatalogFilterState,
} from '../../data/mockCatalogProducts';
import type { CatalogGridProduct } from '../../data/mockCatalogProducts';
import { enrichProductListForGrid } from '../../utils/catalogFromApi';
import CatalogFilters from '../../components/CatalogFilters';

const GOODS_WORDS = ['товар', 'товара', 'товаров'] as const;

function goodsWord(n: number): string {
  const m = n % 10;
  const m100 = n % 100;
  if (m100 >= 11 && m100 <= 14) return GOODS_WORDS[2];
  if (m === 1) return GOODS_WORDS[0];
  if (m >= 2 && m <= 4) return GOODS_WORDS[1];
  return GOODS_WORDS[2];
}

/** Корень каталога: разделы с сервера и опционально сетка по ?brand= */
const CatalogRootPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const brandParam = searchParams.get('brand')?.trim() ?? '';

  const homePath = useMemo(() => {
    const token = localStorage.getItem('token');
    const role = api.getStoredUserRole();
    return token && role === 'customer' ? '/customer' : '/';
  }, []);

  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const [brandProducts, setBrandProducts] = useState<CatalogGridProduct[]>([]);
  const [brandLoading, setBrandLoading] = useState(false);
  const [brandError, setBrandError] = useState<string | null>(null);
  const [filter, setFilter] = useState<CatalogFilterState>(() => ({
    brands: [],
    sizes: [],
    subcategorySlugs: [],
    priceMin: '',
    priceMax: '',
  }));

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setCategoriesLoading(true);
      setCategoriesError(null);
      const res = await api.getCategories(0, 100);
      if (cancelled) return;
      if (!res.success || !res.data?.content) {
        setCategoriesError(res.error ?? 'Не удалось загрузить разделы');
        setCategories([]);
      } else {
        setCategories(res.data.content);
      }
      setCategoriesLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!brandParam) {
      setBrandProducts([]);
      setBrandError(null);
      return;
    }
    let cancelled = false;
    (async () => {
      setBrandLoading(true);
      setBrandError(null);
      const res = await api.getProducts({ page: 0, size: 80 });
      if (cancelled) return;
      if (!res.success || !res.data?.content?.length) {
        setBrandError(res.error ?? 'Не удалось загрузить товары');
        setBrandProducts([]);
        setBrandLoading(false);
        return;
      }
      const enriched = await enrichProductListForGrid(res.data.content, {
        categoryKey: 'catalog',
        subKey: 'brand',
      });
      if (cancelled) return;
      const match = enriched.filter(
        (p) => p.brandName.toLowerCase() === brandParam.toLowerCase()
      );
      setBrandProducts(match);
      setBrandLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [brandParam]);

  const filteredBrandProducts = useMemo(
    () => filterCatalogProducts(brandProducts, filter),
    [brandProducts, filter]
  );

  useEffect(() => {
    setFilter({
      brands: [],
      sizes: [],
      subcategorySlugs: [],
      priceMin: '',
      priceMax: '',
    });
  }, [brandParam]);

  if (brandParam) {
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

          {brandLoading && <p className={styles['lead']}>Загрузка…</p>}
          {brandError && (
            <p className={styles['lead']} role="alert">
              {brandError}
            </p>
          )}
          {!brandLoading && !brandError && brandProducts.length === 0 && (
            <p className={styles['brandEmpty']}>
              Товаров с таким брендом нет в выгрузке с сервера.
            </p>
          )}
          {!brandLoading && !brandError && brandProducts.length > 0 && (
            <>
              <p className={styles['meta']}>
                Показано {filteredBrandProducts.length} из {brandProducts.length}{' '}
                {goodsWord(brandProducts.length)}
              </p>
              <div className={styles['body']}>
                <CatalogFilters
                  products={brandProducts}
                  value={filter}
                  onChange={setFilter}
                />
                <div className={styles['gridWrap']}>
                  {filteredBrandProducts.length === 0 ? (
                    <p className={styles['empty']}>
                      Нет товаров по фильтрам. Сбросьте фильтры.
                    </p>
                  ) : (
                    <ProductGrid products={filteredBrandProducts} />
                  )}
                </div>
              </div>
            </>
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
          Разделы приходят с сервера. Выберите категорию — откроется список
          товаров.
        </p>

        {categoriesLoading && <p className={styles['lead']}>Загрузка разделов…</p>}
        {categoriesError && (
          <p className={styles['lead']} role="alert">
            {categoriesError}
          </p>
        )}
        {!categoriesLoading && !categoriesError && categories.length === 0 && (
          <p className={styles['lead']}>На сервере пока нет категорий.</p>
        )}

        <ul className={styles['grid']}>
          {categories.map((cat) => (
            <li key={cat.id}>
              <Link
                to={`/catalog/section/${cat.id}`}
                className={styles['card']}
              >
                <span className={styles['cardTitle']}>{cat.categoryName}</span>
                <span className={styles['cardMeta']}>Смотреть товары →</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CatalogRootPage;
