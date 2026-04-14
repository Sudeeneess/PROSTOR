import React, { useState, useEffect, useMemo, useCallback } from 'react';
import HeaderSeller from './HeaderSeller';
import styles from './ProductSeller.module.css';
import { api, type Category, type Product, type ProductRequest } from '../../services/api';

export interface SellerProductRow {
  id: number;
  name: string;
  description: string;
  sku: string;
  price: string;
  quantity: number;
  /** id категории с сервера (GET /api/categories) */
  categoryId: number;
  sellerId: number;
  imageUrl: string;
  selected: boolean;
}

function productToRow(p: Product): SellerProductRow {
  return {
    id: p.id,
    name: p.name,
    description: '',
    sku: '',
    price: String(p.price),
    quantity: 0,
    categoryId: p.categoryId,
    sellerId: p.sellerId,
    imageUrl: '',
    selected: false,
  };
}

function createEmptyDraft(defaultCategoryId: number, sellerId: number): SellerProductRow {
  return {
    id: 0,
    name: '',
    description: '',
    sku: '',
    price: '0',
    quantity: 0,
    categoryId: defaultCategoryId,
    sellerId,
    imageUrl: '',
    selected: false,
  };
}

const ProductSeller: React.FC = () => {
  const [products, setProducts] = useState<SellerProductRow[]>([]);
  const [apiCategories, setApiCategories] = useState<Category[]>([]);
  const [listError, setListError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [filterName, setFilterName] = useState('');
  const [filterSku, setFilterSku] = useState('');
  const [filterPrice, setFilterPrice] = useState('');
  const [filterCategoryId, setFilterCategoryId] = useState<number | ''>('');

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('edit');
  const [draft, setDraft] = useState<SellerProductRow | null>(null);
  const [saving, setSaving] = useState(false);

  const defaultCategoryId = apiCategories[0]?.id ?? 1;
  const fallbackSellerId = products[0]?.sellerId ?? 1;

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setListError(null);

    const catRes = await api.getCategoriesListForUi();
    const cats =
      catRes.success && catRes.data?.content?.length ? catRes.data.content : [];
    setApiCategories(cats);

    const res = await api.getSellerProducts(0, 100);
    if (!res.success) {
      setProducts([]);
      setListError(res.error ?? 'Не удалось загрузить товары');
      setLoading(false);
      return;
    }
    const rows = (res.data?.content ?? []).map(productToRow);
    setProducts(rows);
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  const categoryLabel = (categoryId: number) =>
    apiCategories.find((c) => c.id === categoryId)?.categoryName ?? `id ${categoryId}`;

  const updateProducts = (list: SellerProductRow[]) => {
    setProducts(list);
  };

  const filteredProducts = useMemo(() => {
    const nameQ = filterName.trim().toLowerCase();
    const skuQ = filterSku.trim().toLowerCase();
    const priceQ = filterPrice.trim();
    return products.filter((p) => {
      if (nameQ && !p.name.toLowerCase().includes(nameQ)) return false;
      if (skuQ && !p.sku.toLowerCase().includes(skuQ)) return false;
      if (priceQ && !String(p.price).includes(priceQ)) return false;
      if (filterCategoryId !== '' && p.categoryId !== filterCategoryId) return false;
      return true;
    });
  }, [products, filterName, filterSku, filterPrice, filterCategoryId]);

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
    if (!apiCategories.length) {
      window.alert('Сначала должны загрузиться категории с сервера. Проверьте бэкенд.');
      return;
    }
    setModalMode('add');
    setDraft(createEmptyDraft(defaultCategoryId, fallbackSellerId));
    setModalOpen(true);
  };

  const deleteSelected = async () => {
    const toDelete = products.filter((p) => p.selected);
    if (!toDelete.length) return;
    if (!window.confirm(`Удалить выбранные товары (${toDelete.length})?`)) return;
    for (const p of toDelete) {
      const res = await api.deleteSellerProduct(p.id);
      if (!res.success) {
        window.alert(res.error ?? 'Ошибка удаления');
        break;
      }
    }
    await loadProducts();
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

  const saveModal = async () => {
    if (!draft) return;
    const price = Number(String(draft.price).replace(',', '.'));
    if (!draft.name.trim()) {
      window.alert('Укажите название товара');
      return;
    }
    if (!Number.isFinite(price) || price <= 0) {
      window.alert('Укажите цену больше нуля');
      return;
    }

    const body: ProductRequest = {
      name: draft.name.trim(),
      price,
      sellerId: draft.sellerId,
      categoryId: draft.categoryId,
    };

    setSaving(true);
    try {
      if (modalMode === 'add') {
        const res = await api.createSellerProduct(body);
        if (!res.success) {
          window.alert(res.error ?? 'Не удалось создать товар');
          return;
        }
      } else {
        const res = await api.updateSellerProduct(draft.id, body);
        if (!res.success) {
          window.alert(res.error ?? 'Не удалось сохранить товар');
          return;
        }
      }
      closeModal();
      await loadProducts();
    } finally {
      setSaving(false);
    }
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
                  value={filterCategoryId === '' ? '' : String(filterCategoryId)}
                  onChange={(e) => {
                    const v = e.target.value;
                    setFilterCategoryId(v === '' ? '' : Number(v));
                  }}
                  aria-label="Фильтр по категории"
                >
                  <option value="">Все категории</option>
                  {apiCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.categoryName}
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
              onClick={() => void deleteSelected()}
            >
              Удалить выбранные
            </button>
            <button
              type="button"
              className={styles['seller-prod-add-btn']}
              onClick={openAddModal}
              disabled={loading}
            >
              + Добавить товар
            </button>
          </div>
        </div>

        {loading && <p className={styles['seller-prod-empty-state']}>Загрузка…</p>}
        {listError && !loading && (
          <p className={styles['seller-prod-empty-state']} role="alert">
            {listError}
          </p>
        )}

        {!loading && !listError && products.length === 0 ? (
          <div className={styles['seller-prod-empty-state']}>
            <p>У вас пока нет товаров на сервере</p>
            <button
              type="button"
              onClick={openAddModal}
              className={styles['seller-prod-add-first-btn']}
            >
              Добавить первый товар
            </button>
          </div>
        ) : !loading && !listError && filteredProducts.length === 0 ? (
          <div className={styles['seller-prod-empty-state']}>
            <p>Нет товаров по текущим фильтрам</p>
            <button
              type="button"
              className={styles['seller-prod-add-first-btn']}
              onClick={() => {
                setFilterName('');
                setFilterSku('');
                setFilterPrice('');
                setFilterCategoryId('');
              }}
            >
              Сбросить фильтры
            </button>
          </div>
        ) : !loading && !listError ? (
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
                  value={categoryLabel(product.categoryId)}
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
        ) : null}
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
                <label htmlFor="sp-photo-url">Фото (URL, только в таблице на экране)</label>
                <input
                  id="sp-photo-url"
                  type="url"
                  value={draft.imageUrl}
                  onChange={(e) => updateDraft({ imageUrl: e.target.value })}
                  className={styles['seller-prod-edit-input']}
                  placeholder="https://..."
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
                <label htmlFor="sp-desc">Описание (не уходит в API)</label>
                <textarea
                  id="sp-desc"
                  value={draft.description}
                  onChange={(e) => updateDraft({ description: e.target.value })}
                  className={styles['seller-prod-edit-textarea']}
                  rows={3}
                />
              </div>

              <div className={styles['seller-prod-form-group']}>
                <label htmlFor="sp-sku">Артикул (не уходит в API)</label>
                <input
                  id="sp-sku"
                  type="text"
                  value={draft.sku}
                  onChange={(e) => updateDraft({ sku: e.target.value })}
                  className={styles['seller-prod-edit-input']}
                />
              </div>

              <div className={styles['seller-prod-form-group']}>
                <label htmlFor="sp-price">Цена (руб.)</label>
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
                <label htmlFor="sp-qty">Количество (не уходит в API)</label>
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
                <label htmlFor="sp-cat">Категория (с сервера)</label>
                <select
                  id="sp-cat"
                  value={draft.categoryId}
                  onChange={(e) =>
                    updateDraft({ categoryId: Number(e.target.value) })
                  }
                  className={styles['seller-prod-edit-input']}
                >
                  {apiCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.categoryName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className={styles['seller-prod-modal-buttons']}>
              <button
                type="button"
                onClick={() => void saveModal()}
                className={styles['seller-prod-save-btn']}
                disabled={saving}
              >
                {saving
                  ? 'Сохранение…'
                  : modalMode === 'add'
                    ? 'Добавить'
                    : 'Сохранить изменения'}
              </button>
              <button
                type="button"
                onClick={closeModal}
                className={styles['seller-prod-cancel-btn']}
                disabled={saving}
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
