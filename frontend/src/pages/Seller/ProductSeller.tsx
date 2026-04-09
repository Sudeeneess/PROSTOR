import React, { useState, useEffect, useMemo } from 'react';
import HeaderSeller from './HeaderSeller';
import styles from './ProductSeller.module.css';
import { CATALOG_CATEGORIES, findCategoryBySlug } from '../../data/categories';

export interface SellerProductRow {
  id: number;
  name: string;
  description: string;
  sku: string;
  price: string;
  quantity: number;
  /** slug категории — как в справочнике / product.category_id → категория */
  categorySlug: string;
  /** URL фото (в БД — путь или ссылка на медиа) */
  imageUrl: string;
  selected: boolean;
}

function categoryLabel(slug: string): string {
  return findCategoryBySlug(slug)?.name ?? slug;
}

function normalizeLoadedProduct(raw: Record<string, unknown>, id: number): SellerProductRow {
  return {
    id,
    name: String(raw.name ?? ''),
    description: String(raw.description ?? ''),
    sku: String(raw.sku ?? ''),
    price: String(raw.price ?? '0'),
    quantity:
      typeof raw.quantity === 'number'
        ? raw.quantity
        : Number(raw.quantity) || 0,
    categorySlug:
      typeof raw.categorySlug === 'string' && raw.categorySlug
        ? raw.categorySlug
        : CATALOG_CATEGORIES[0]?.slug ?? 'other',
    imageUrl: String(raw.imageUrl ?? ''),
    selected: Boolean(raw.selected),
  };
}

function createEmptyDraft(): SellerProductRow {
  return {
    id: 0,
    name: '',
    description: '',
    sku: '',
    price: '0',
    quantity: 0,
    categorySlug: CATALOG_CATEGORIES[0]?.slug ?? 'other',
    imageUrl: '',
    selected: false,
  };
}

const ProductSeller: React.FC = () => {
  const [products, setProducts] = useState<SellerProductRow[]>([]);
  const [filterName, setFilterName] = useState('');
  const [filterSku, setFilterSku] = useState('');
  const [filterPrice, setFilterPrice] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('edit');
  const [draft, setDraft] = useState<SellerProductRow | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = () => {
    const saved = localStorage.getItem('sellerProducts');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Record<string, unknown>[];
        let next = parsed.map((row, i) => {
          const rawId = row.id;
          const id =
            typeof rawId === 'number'
              ? rawId
              : Number(rawId) > 0
                ? Number(rawId)
                : i + 1;
          return normalizeLoadedProduct(row, id);
        });
        const photosRaw = localStorage.getItem('sellerProductPhotos');
        if (photosRaw) {
          try {
            const photos = JSON.parse(photosRaw) as Record<string, string>;
            next = next.map((p) => ({
              ...p,
              imageUrl:
                p.imageUrl ||
                photos[String(p.id)] ||
                '',
            }));
          } catch {
            /* ignore */
          }
        }
        setProducts(next);
        saveToLocalStorage(next);
        return;
      } catch {
        /* fallback */
      }
    }
    const initial: SellerProductRow[] = [
      {
        id: 1,
        name: 'Товар 1',
        description: 'Описание товара 1',
        sku: 'SKU001',
        price: '1000',
        quantity: 12,
        categorySlug: 'tops',
        imageUrl: 'https://picsum.photos/seed/seller-p1/80/80',
        selected: false,
      },
      {
        id: 2,
        name: 'Товар 2',
        description: 'Описание товара 2',
        sku: 'SKU002',
        price: '2000',
        quantity: 5,
        categorySlug: 'shoes',
        imageUrl: 'https://picsum.photos/seed/seller-p2/80/80',
        selected: false,
      },
    ];
    setProducts(initial);
    saveToLocalStorage(initial);
  };

  const saveToLocalStorage = (list: SellerProductRow[]) => {
    if (list.length > 0) {
      localStorage.setItem('sellerProducts', JSON.stringify(list));
    } else {
      localStorage.removeItem('sellerProducts');
    }
  };

  const updateProducts = (list: SellerProductRow[]) => {
    setProducts(list);
    saveToLocalStorage(list);
  };

  const filteredProducts = useMemo(() => {
    const nameQ = filterName.trim().toLowerCase();
    const skuQ = filterSku.trim().toLowerCase();
    const priceQ = filterPrice.trim();
    return products.filter((p) => {
      if (nameQ && !p.name.toLowerCase().includes(nameQ)) return false;
      if (skuQ && !p.sku.toLowerCase().includes(skuQ)) return false;
      if (priceQ && !String(p.price).includes(priceQ)) return false;
      if (filterCategory && p.categorySlug !== filterCategory) return false;
      return true;
    });
  }, [products, filterName, filterSku, filterPrice, filterCategory]);

  const toggleSelect = (id: number) => {
    updateProducts(
      products.map((p) => (p.id === id ? { ...p, selected: !p.selected } : p))
    );
  };

  const selectAllVisible = () => {
    const visibleIds = new Set(filteredProducts.map((p) => p.id));
    updateProducts(
      products.map((p) =>
        visibleIds.has(p.id) ? { ...p, selected: true } : p
      )
    );
  };

  const openAddModal = () => {
    setModalMode('add');
    setDraft(createEmptyDraft());
    setModalOpen(true);
  };

  const deleteSelected = () => {
    const remaining = products.filter((p) => !p.selected);
    updateProducts(remaining);
  };

  const openEditModal = () => {
    const selected = products.filter((p) => p.selected);
    if (selected.length !== 1) return;
    setModalMode('edit');
    setDraft({ ...selected[0] });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setDraft(null);
  };

  const saveModal = () => {
    if (!draft) return;
    if (modalMode === 'add') {
      const newId =
        products.length > 0 ? Math.max(...products.map((p) => p.id)) + 1 : 1;
      const row: SellerProductRow = {
        ...draft,
        id: newId,
        selected: false,
      };
      updateProducts([...products, row]);
    } else {
      updateProducts(
        products.map((p) =>
          p.id === draft.id ? { ...draft, selected: p.selected } : p
        )
      );
    }
    closeModal();
  };

  const updateDraft = (patch: Partial<SellerProductRow>) => {
    setDraft((d) => (d ? { ...d, ...patch } : null));
  };

  return (
    <div className={`seller-app-shell ${styles['seller-prod-container']}`}>
      <HeaderSeller />

      <div className={styles['seller-prod-content']}>
        <div className={styles['seller-prod-head']}>
          <div className={styles['seller-prod-title-row']}>
            <h2 className={styles['seller-prod-title']}>Мои товары</h2>
            <div className={styles['seller-prod-filters-block']}>
              <p className={styles['seller-prod-filters-label']}>Фильтры</p>
              <div className={styles['seller-prod-filters']} role="search">
              <input
                type="search"
                className={styles['seller-prod-filter-input']}
                placeholder="Название"
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                aria-label="Фильтр по названию"
              />
              <input
                type="search"
                className={styles['seller-prod-filter-input']}
                placeholder="Артикул"
                value={filterSku}
                onChange={(e) => setFilterSku(e.target.value)}
                aria-label="Фильтр по артикулу"
              />
              <input
                type="search"
                className={styles['seller-prod-filter-input']}
                placeholder="Цена"
                value={filterPrice}
                onChange={(e) => setFilterPrice(e.target.value)}
                aria-label="Фильтр по цене"
              />
              <select
                className={styles['seller-prod-filter-select']}
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                aria-label="Фильтр по категории"
              >
                <option value="">Все категории</option>
                {CATALOG_CATEGORIES.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
              </div>
            </div>
          </div>

          <div className={styles['seller-prod-toolbar']}>
            <button
              type="button"
              className={styles['seller-prod-tool-btn']}
              onClick={selectAllVisible}
            >
              Выбрать все
            </button>
            <button
              type="button"
              className={styles['seller-prod-tool-btn']}
              onClick={openEditModal}
            >
              Редактировать выбранные
            </button>
            <button
              type="button"
              className={styles['seller-prod-tool-btn']}
              onClick={deleteSelected}
            >
              Удалить выбранные
            </button>
            <button
              type="button"
              className={styles['seller-prod-add-btn']}
              onClick={openAddModal}
            >
              + Добавить товар
            </button>
          </div>
        </div>

        {products.length === 0 ? (
          <div className={styles['seller-prod-empty-state']}>
            <p>У вас пока нет товаров</p>
            <button
              type="button"
              onClick={openAddModal}
              className={styles['seller-prod-add-first-btn']}
            >
              Добавить первый товар
            </button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className={styles['seller-prod-empty-state']}>
            <p>Нет товаров по текущим фильтрам</p>
            <button
              type="button"
              className={styles['seller-prod-add-first-btn']}
              onClick={() => {
                setFilterName('');
                setFilterSku('');
                setFilterPrice('');
                setFilterCategory('');
              }}
            >
              Сбросить фильтры
            </button>
          </div>
        ) : (
          <div className={styles['seller-prod-table']}>
            <div className={styles['seller-prod-table-header']}>
              <span className={styles['seller-prod-col-photo']}>Фото</span>
              <span>Название</span>
              <span>Описание</span>
              <span>Артикул</span>
              <span>Цена</span>
              <span>Кол-во</span>
              <span>Категория</span>
              <span className={styles['seller-prod-col-check']}>Выбрать</span>
            </div>

            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className={styles['seller-prod-table-row']}
              >
                <div className={styles['seller-prod-thumb-wrap']}>
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt=""
                      className={styles['seller-prod-thumb']}
                    />
                  ) : (
                    <div className={styles['seller-prod-thumb-placeholder']}>
                      —
                    </div>
                  )}
                </div>
                <input
                  type="text"
                  value={product.name}
                  readOnly
                  className={styles['seller-prod-readonly-input']}
                />
                <input
                  type="text"
                  value={product.description}
                  readOnly
                  className={styles['seller-prod-readonly-input']}
                />
                <input
                  type="text"
                  value={product.sku}
                  readOnly
                  className={styles['seller-prod-readonly-input']}
                />
                <input
                  type="text"
                  value={product.price}
                  readOnly
                  className={styles['seller-prod-readonly-input']}
                />
                <input
                  type="text"
                  value={String(product.quantity)}
                  readOnly
                  className={styles['seller-prod-readonly-input']}
                />
                <input
                  type="text"
                  value={categoryLabel(product.categorySlug)}
                  readOnly
                  className={styles['seller-prod-readonly-input']}
                />
                <input
                  type="checkbox"
                  checked={product.selected}
                  onChange={() => toggleSelect(product.id)}
                  className={styles['seller-prod-checkbox-input']}
                  aria-label={`Выбрать ${product.name}`}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {modalOpen && draft && (
        <div className={styles['seller-prod-modal-overlay']} role="dialog" aria-modal="true">
          <div className={styles['seller-prod-modal-content']}>
            <h2>
              {modalMode === 'add'
                ? 'Добавление нового товара'
                : 'Редактирование товара'}
            </h2>

            <div className={styles['seller-prod-edit-form']}>
              <div className={styles['seller-prod-form-group']}>
                <label htmlFor="sp-photo-url">Фото (URL)</label>
                <input
                  id="sp-photo-url"
                  type="url"
                  value={draft.imageUrl}
                  onChange={(e) => updateDraft({ imageUrl: e.target.value })}
                  className={styles['seller-prod-edit-input']}
                  placeholder="https://…"
                />
                <div
                  className={
                    modalMode === 'add'
                      ? styles['seller-prod-photo-preview']
                      : `${styles['seller-prod-photo-preview']} ${styles['seller-prod-photo-preview--large']}`
                  }
                >
                  {draft.imageUrl ? (
                    <img src={draft.imageUrl} alt="Предпросмотр" />
                  ) : (
                    <span className={styles['seller-prod-photo-preview-empty']}>
                      Нет фото
                    </span>
                  )}
                </div>
              </div>

              <div className={styles['seller-prod-form-group']}>
                <label htmlFor="sp-name">Название товара</label>
                <input
                  id="sp-name"
                  type="text"
                  value={draft.name}
                  onChange={(e) => updateDraft({ name: e.target.value })}
                  className={styles['seller-prod-edit-input']}
                />
              </div>

              <div className={styles['seller-prod-form-group']}>
                <label htmlFor="sp-desc">Описание</label>
                <textarea
                  id="sp-desc"
                  value={draft.description}
                  onChange={(e) => updateDraft({ description: e.target.value })}
                  className={styles['seller-prod-edit-textarea']}
                  rows={3}
                />
              </div>

              <div className={styles['seller-prod-form-group']}>
                <label htmlFor="sp-sku">Артикул</label>
                <input
                  id="sp-sku"
                  type="text"
                  value={draft.sku}
                  onChange={(e) => updateDraft({ sku: e.target.value })}
                  className={styles['seller-prod-edit-input']}
                />
              </div>

              <div className={styles['seller-prod-form-group']}>
                <label htmlFor="sp-price">Цена (₽)</label>
                <input
                  id="sp-price"
                  type="number"
                  min={0}
                  value={draft.price}
                  onChange={(e) => updateDraft({ price: e.target.value })}
                  className={styles['seller-prod-edit-input']}
                />
              </div>

              <div className={styles['seller-prod-form-group']}>
                <label htmlFor="sp-qty">Количество на складе</label>
                <input
                  id="sp-qty"
                  type="number"
                  min={0}
                  value={draft.quantity}
                  onChange={(e) =>
                    updateDraft({
                      quantity: Math.max(0, Number(e.target.value) || 0),
                    })
                  }
                  className={styles['seller-prod-edit-input']}
                />
              </div>

              <div className={styles['seller-prod-form-group']}>
                <label htmlFor="sp-cat">Категория</label>
                <select
                  id="sp-cat"
                  value={draft.categorySlug}
                  onChange={(e) => updateDraft({ categorySlug: e.target.value })}
                  className={styles['seller-prod-edit-input']}
                >
                  {CATALOG_CATEGORIES.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className={styles['seller-prod-modal-buttons']}>
              <button
                type="button"
                onClick={saveModal}
                className={styles['seller-prod-save-btn']}
              >
                {modalMode === 'add' ? 'Добавить' : 'Сохранить изменения'}
              </button>
              <button
                type="button"
                onClick={closeModal}
                className={styles['seller-prod-cancel-btn']}
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductSeller;
