import React, { useEffect, useState } from 'react';
import ProductGrid from './ProductGrid';
import { api } from '../services/api';
import { enrichProductListForGrid } from '../utils/catalogFromApi';
import type { CatalogGridProduct } from '../data/mockCatalogProducts';
import styles from './ApiProductGrid.module.css';

type ApiProductGridProps = {
  /** Сколько товаров запросить (первая страница API). */
  limit?: number;
  categoryId?: number;
 /** Фильтр по подстроке имени на стороне API */
  name?: string;
};

/**
 * Сетка товаров с бэкенда (как login/register: через api.* + сообщения об ошибках).
 */
const ApiProductGrid: React.FC<ApiProductGridProps> = ({
  limit = 16,
  categoryId,
  name,
}) => {
  const [products, setProducts] = useState<CatalogGridProduct[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setError(null);
      setProducts(null);
      const res = await api.getProducts({
        page: 0,
        size: limit,
        ...(categoryId != null ? { categoryId } : {}),
        ...(name?.trim() ? { name: name.trim() } : {}),
      });
      if (cancelled) return;
      if (!res.success) {
        setError(res.error ?? 'Не удалось загрузить товары');
        setProducts([]);
        return;
      }
      if (!res.data?.content?.length) {
        setError(null);
        setProducts([]);
        return;
      }
      const enriched = await enrichProductListForGrid(res.data.content, {
        categoryKey: categoryId != null ? `s-${categoryId}` : 'home',
        subKey: 'all',
      });
      if (!cancelled) setProducts(enriched);
    })();
    return () => {
      cancelled = true;
    };
  }, [limit, categoryId, name]);

  if (error) {
    return (
      <p className={styles['api-grid-message']} role="alert">
        {error}
      </p>
    );
  }

  if (!products) {
    return (
      <p className={styles['api-grid-message']}>Загрузка каталога…</p>
    );
  }

  if (products.length === 0) {
    return (
      <p className={styles['api-grid-message']}>В этой выборке пока нет товаров.</p>
    );
  }

  return <ProductGrid products={products} />;
};

export default ApiProductGrid;
