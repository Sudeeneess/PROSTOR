import React from 'react';
import {
  getFilterOptions,
  type CatalogFilterState,
  type CatalogGridProduct,
} from '../data/mockCatalogProducts';
import styles from './CatalogFilters.module.css';

type Props = {
  products: CatalogGridProduct[];
  value: CatalogFilterState;
  onChange: (next: CatalogFilterState) => void;
  subcategoryOptions?: { slug: string; name: string }[];
};

const CatalogFilters: React.FC<Props> = ({
  products,
  value,
  onChange,
  subcategoryOptions,
}) => {
  const { brands, sizes, priceMinBound, priceMaxBound } =
    getFilterOptions(products);

  const toggle = (
    field: 'brands' | 'sizes' | 'subcategorySlugs',
    item: string
  ) => {
    const set = new Set(value[field]);
    if (set.has(item)) set.delete(item);
    else set.add(item);
    onChange({ ...value, [field]: [...set] });
  };

  const reset = () => {
    onChange({
      brands: [],
      sizes: [],
      subcategorySlugs: [],
      priceMin: '',
      priceMax: '',
    });
  };

  const hasActive =
    value.brands.length > 0 ||
    value.sizes.length > 0 ||
    value.subcategorySlugs.length > 0 ||
    value.priceMin !== '' ||
    value.priceMax !== '';

  return (
    <aside className={styles['panel']} aria-label="Фильтры каталога">
      <div className={styles['head']}>
        <span className={styles['title']}>Фильтры</span>
        {hasActive && (
          <button type="button" className={styles['reset']} onClick={reset}>
            Сбросить
          </button>
        )}
      </div>

      <fieldset className={styles['group']}>
        <legend className={styles['legend']}>Бренд</legend>
        {brands.map((b) => (
          <label key={b} className={styles['row']}>
            <input
              type="checkbox"
              checked={value.brands.includes(b)}
              onChange={() => toggle('brands', b)}
            />
            <span>{b}</span>
          </label>
        ))}
      </fieldset>

      <fieldset className={styles['group']}>
        <legend className={styles['legend']}>Размер</legend>
        {sizes.map((s) => (
          <label key={s} className={styles['row']}>
            <input
              type="checkbox"
              checked={value.sizes.includes(s)}
              onChange={() => toggle('sizes', s)}
            />
            <span>{s}</span>
          </label>
        ))}
      </fieldset>

      {subcategoryOptions && subcategoryOptions.length > 0 && (
        <fieldset className={styles['group']}>
          <legend className={styles['legend']}>Тип товара</legend>
          {subcategoryOptions.map((sub) => (
            <label key={sub.slug} className={styles['row']}>
              <input
                type="checkbox"
                checked={value.subcategorySlugs.includes(sub.slug)}
                onChange={() => toggle('subcategorySlugs', sub.slug)}
              />
              <span>{sub.name}</span>
            </label>
          ))}
        </fieldset>
      )}

      <fieldset className={styles['group']}>
        <legend className={styles['legend']}>Цена, ₽</legend>
        <div className={styles['priceRow']}>
          <input
            type="number"
            className={styles['priceInput']}
            placeholder={`от ${priceMinBound}`}
            min={0}
            value={value.priceMin}
            onChange={(e) =>
              onChange({ ...value, priceMin: e.target.value })
            }
            aria-label="Минимальная цена"
          />
          <span className={styles['dash']} aria-hidden>
            —
          </span>
          <input
            type="number"
            className={styles['priceInput']}
            placeholder={`до ${priceMaxBound}`}
            min={0}
            value={value.priceMax}
            onChange={(e) =>
              onChange({ ...value, priceMax: e.target.value })
            }
            aria-label="Максимальная цена"
          />
        </div>
      </fieldset>
    </aside>
  );
};

export default CatalogFilters;
