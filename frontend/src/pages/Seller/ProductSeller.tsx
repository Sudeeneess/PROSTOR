import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import HeaderSeller from './HeaderSeller';
import styles from './ProductSeller.module.css';
import {
  api,
  type BrandRow,
  type Category,
  type ProductRequest,
  type SellerProduct,
  type SellerProductCreateRequest,
  type SizeDto,
} from '../../services/api';

export interface SellerProductRow {
  id: number;
  name: string;
  description: string;
  type: string;
  brand: string;
  brandId: number | null;
  size: string;
  sizeId: number | null;
  price: string;
  quantity: number;
  /* GET /api/categories */
  categoryId: number;
  sellerId: number;
  imageUrl: string;
  warehouseId: number | null;
  selected: boolean;
}

function productToRow(p: SellerProduct): SellerProductRow {
  return {
    id: p.id,
    name: p.name,
    description: '',
    type: '',
    brand: '',
    brandId: null,
    size: '',
    sizeId: null,
    price: String(p.price),
    quantity: p.availableQuantity ?? 0,
    categoryId: p.categoryId,
    sellerId: p.sellerId,
    imageUrl: '',
    warehouseId: null,
    selected: false,
  };
}

function createEmptyDraft(defaultCategoryId: number, sellerId: number): SellerProductRow {
  return {
    id: 0,
    name: '',
    description: '',
    type: '',
    brand: '',
    brandId: null,
    size: '',
    sizeId: null,
    price: '0',
    quantity: 0,
    categoryId: defaultCategoryId,
    sellerId,
    imageUrl: '',
    warehouseId: 1,
    selected: false,
  };
}

function toDeleteErrorMessage(raw?: string): string {
  const text = (raw ?? '').toLowerCase();
  if (
    text.includes('orders_items_products_id_fkey') ||
    text.includes('всё ещё есть ссылки в таблице "orders_items"') ||
    text.includes('violates foreign key constraint')
  ) {
    return 'Товар уже участвует в заказах и не может быть удален.';
  }
  if (raw && raw.trim()) return raw;
  return 'Ошибка удаления товара.';
}

function buildCardPhotoPayload(imageUrl: string): Array<Record<string, unknown>> {
  const trimmed = imageUrl.trim();
  if (!trimmed) return [];
  return [{ url: trimmed }];
}

const ProductSeller: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<SellerProductRow[]>([]);
  const [apiCategories, setApiCategories] = useState<Category[]>([]);
  const [apiBrands, setApiBrands] = useState<BrandRow[]>([]);
  const [apiSizes, setApiSizes] = useState<SizeDto[]>([]);
  const [listError, setListError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [filterName, setFilterName] = useState('');
  const [filterSubcategory, setFilterSubcategory] = useState('');
  const [filterPriceRange, setFilterPriceRange] = useState('');
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

    const [catRes, brandsRes, sizesRes] = await Promise.all([
      api.getCategoriesListForUi(),
      api.getBrands(0, 200),
      api.getSizes(0, 200),
    ]);

    const cats = catRes.success && catRes.data?.content?.length ? catRes.data.content : [];
    const brands = brandsRes.success && brandsRes.data?.content?.length ? brandsRes.data.content : [];
    const sizes = sizesRes.success && sizesRes.data?.content?.length ? sizesRes.data.content : [];
    setApiCategories(cats);
    setApiBrands(brands);
    setApiSizes(sizes);

    const res = await api.getSellerProducts(0, 100);
    if (!res.success) {
      if (res.status === 401 || res.status === 403) {
        api.logout();
        setListError('Сессия продавца недействительна. Войдите заново.');
        setLoading(false);
        navigate('/seller/auth', { replace: true });
        return;
      }
      setProducts([]);
      setListError(res.error ?? 'Не удалось загрузить товары');
      setLoading(false);
      return;
    }
    const rows = (res.data?.content ?? []).map(productToRow);
    const enrichedRows = await Promise.all(
      rows.map(async (row) => {
        const cardsRes = await api.getProductCards(row.id);
        const cards = cardsRes.success ? cardsRes.data ?? [] : [];
        const primaryCard =
          cards.find((card) => card.isActive !== false) ?? cards[0] ?? null;

        return {
          ...row,
          description: primaryCard?.description ?? '',
          type: primaryCard?.type ?? '',
          brand: primaryCard?.brand?.name ?? '—',
          brandId: primaryCard?.brand?.id ?? null,
          size: primaryCard?.size?.name ?? '—',
          sizeId: primaryCard?.size?.id ?? null,
        };
      })
    );
    setProducts(enrichedRows);
    setLoading(false);
  }, [navigate]);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  const categoryLabel = (categoryId: number) =>
    apiCategories.find((c) => c.id === categoryId)?.categoryName ?? `id ${categoryId}`;

  const updateProducts = (list: SellerProductRow[]) => {
    setProducts(list);
  };

  const resetFilters = () => {
    setFilterName('');
    setFilterSubcategory('');
    setFilterPriceRange('');
    setFilterCategoryId('');
  };

  const priceBounds = useMemo(() => {
    const prices = products
      .map((p) => Number(String(p.price).replace(',', '.')))
      .filter((price) => Number.isFinite(price));

    if (!prices.length) {
      return { min: null as number | null, max: null as number | null };
    }

    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
    };
  }, [products]);

  const subcategoryOptions = useMemo(() => {
    const unique = new Set<string>();
    products.forEach((p) => {
      const value = p.type.trim();
      if (value && value !== '—') {
        unique.add(value);
      }
    });
    return Array.from(unique).sort((a, b) => a.localeCompare(b, 'ru'));
  }, [products]);

  const modalSubcategoryOptions = useMemo(() => {
    const unique = new Set(subcategoryOptions);
    const draftType = draft?.type.trim();
    if (draftType && draftType !== '—') {
      unique.add(draftType);
    }
    return Array.from(unique).sort((a, b) => a.localeCompare(b, 'ru'));
  }, [subcategoryOptions, draft?.type]);

  const filteredProducts = useMemo(() => {
    const nameQ = filterName.trim().toLowerCase();
    const subcategoryQ = filterSubcategory.trim();
    const rangeText = filterPriceRange.trim();
    const rangeParts = rangeText
      .split(/[-–—]/)
      .map((part) => Number(part.trim().replace(',', '.')))
      .filter((value) => Number.isFinite(value));

    const rawFrom = rangeParts[0];
    const rawTo = rangeParts.length > 1 ? rangeParts[1] : rangeParts[0];
    const hasFrom = rangeText !== '' && Number.isFinite(rawFrom);
    const hasTo = rangeText !== '' && Number.isFinite(rawTo);
    const normalizedFrom = hasFrom && hasTo ? Math.min(rawFrom, rawTo) : rawFrom;
    const normalizedTo = hasFrom && hasTo ? Math.max(rawFrom, rawTo) : rawTo;

    const minPrice = hasFrom ? normalizedFrom : priceBounds.min;
    const maxPrice = hasTo ? normalizedTo : priceBounds.max;

    return products.filter((p) => {
      if (nameQ && !p.name.toLowerCase().includes(nameQ)) return false;
      if (subcategoryQ && p.type !== subcategoryQ) return false;
      const productPrice = Number(String(p.price).replace(',', '.'));
      if (Number.isFinite(productPrice)) {
        if (minPrice !== null && productPrice < minPrice) return false;
        if (maxPrice !== null && productPrice > maxPrice) return false;
      }
      if (filterCategoryId !== '' && p.categoryId !== filterCategoryId) return false;
      return true;
    });
  }, [
    products,
    filterName,
    filterSubcategory,
    filterPriceRange,
    filterCategoryId,
    priceBounds.max,
    priceBounds.min,
  ]);

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

  const clearSelected = () => {
    updateProducts(products.map((p) => (p.selected ? { ...p, selected: false } : p)));
  };

  const hasActiveFilters =
    filterName.trim() !== '' ||
    filterSubcategory.trim() !== '' ||
    filterPriceRange.trim() !== '' ||
    filterCategoryId !== '';

  const openAddModal = () => {
    if (!apiCategories.length) {
      window.alert('Сначала должны загрузиться категории с сервера. Проверьте бэкенд.');
      return;
    }
    if (!apiBrands.length || !apiSizes.length) {
      window.alert('Не удалось загрузить бренды или размеры. Проверьте справочники на сервере.');
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

    let deletedCount = 0;
    const failed: string[] = [];

    for (const p of toDelete) {
      const res = await api.deleteSellerProduct(p.id);
      if (!res.success) {
        failed.push(`• ${p.name}: ${toDeleteErrorMessage(res.error)}`);
        continue;
      }
      deletedCount += 1;
    }

    await loadProducts();

    if (failed.length === 0) {
      window.alert(`Удалено товаров: ${deletedCount}.`);
      return;
    }

    const lines = [
      `Удалено: ${deletedCount}.`,
      `Не удалось удалить: ${failed.length}.`,
      '',
      ...failed.slice(0, 5),
    ];
    if (failed.length > 5) {
      lines.push(`... и еще ${failed.length - 5}.`);
    }
    window.alert(lines.join('\n'));
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
    if (!draft.type.trim()) {
      window.alert('Укажите подкатегорию');
      return;
    }
    if (!draft.description.trim()) {
      window.alert('Укажите описание товара');
      return;
    }
    if (!draft.brandId) {
      window.alert('Выберите бренд');
      return;
    }
    if (!draft.sizeId) {
      window.alert('Выберите размер');
      return;
    }

    setSaving(true);
    try {
      if (modalMode === 'add') {
        const createBody: SellerProductCreateRequest = {
          name: draft.name.trim(),
          price,
          categoryId: draft.categoryId,
          parentId: null,
          warehouseId: 1,
          initialQuantity: Math.max(0, draft.quantity),
        };
        const res = await api.createSellerProduct(createBody);
        if (!res.success) {
          window.alert(res.error ?? 'Не удалось создать товар');
          return;
        }

        const createdProductId = res.data?.id;
        if (!createdProductId) {
          window.alert('Товар создан, но не удалось получить id для сохранения карточки.');
          closeModal();
          await loadProducts();
          return;
        }

        const cardRes = await api.createProductCard(createdProductId, {
          description: draft.description.trim(),
          type: draft.type.trim(),
          brandId: draft.brandId,
          sizeId: draft.sizeId,
          isActive: true,
          photo: buildCardPhotoPayload(draft.imageUrl),
        });
        if (!cardRes.success) {
          window.alert(
            `Товар создан, но карточка (описание/подкатегория/бренд/размер) не сохранена: ${cardRes.error ?? 'неизвестная ошибка'}`
          );
        }
      } else {
        const body: ProductRequest = {
          name: draft.name.trim(),
          price,
          sellerId: draft.sellerId,
          categoryId: draft.categoryId,
        };
        const res = await api.updateSellerProduct(draft.id, body);
        if (!res.success) {
          window.alert(res.error ?? 'Не удалось сохранить товар');
          return;
        }

        const cardsRes = await api.getProductCards(draft.id);
        const cards = cardsRes.success ? cardsRes.data ?? [] : [];
        const activeCard = cards.find((c) => c.isActive !== false) ?? cards[0];

        if (activeCard) {
          const cardUpdateRes = await api.updateProductCard(draft.id, activeCard.id, {
            productId: draft.id,
            description: draft.description.trim(),
            type: draft.type.trim(),
            brandId: draft.brandId,
            sizeId: draft.sizeId,
            isActive: true,
            photo: buildCardPhotoPayload(draft.imageUrl),
          });
          if (!cardUpdateRes.success) {
            window.alert(
              `Базовые данные товара сохранены, но карточка не обновлена: ${cardUpdateRes.error ?? 'неизвестная ошибка'}`
            );
          }
        } else {
          const cardCreateRes = await api.createProductCard(draft.id, {
            description: draft.description.trim(),
            type: draft.type.trim(),
            brandId: draft.brandId,
            sizeId: draft.sizeId,
            isActive: true,
            photo: buildCardPhotoPayload(draft.imageUrl),
          });
          if (!cardCreateRes.success) {
            window.alert(
              `Базовые данные товара сохранены, но карточка не создана: ${cardCreateRes.error ?? 'неизвестная ошибка'}`
            );
          }
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
                <select
                  className={styles['seller-prod-filter-select']}
                  value={filterSubcategory}
                  onChange={(e) => setFilterSubcategory(e.target.value)}
                  aria-label="Фильтр по подкатегории"
                >
                  <option value="">Все подкатегории</option>
                  {subcategoryOptions.map((subcategory) => (
                    <option key={subcategory} value={subcategory}>
                      {subcategory}
                    </option>
                  ))}
                </select>
                <input
                  type="search"
                  className={styles['seller-prod-filter-input']}
                  placeholder={
                    priceBounds.min === null || priceBounds.max === null
                      ? 'Цена (например: 100-500)'
                      : `Цена ${priceBounds.min}-${priceBounds.max}`
                  }
                  value={filterPriceRange}
                  onChange={(e) => setFilterPriceRange(e.target.value)}
                  aria-label="Фильтр по диапазону цены"
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
                <button
                  type="button"
                  className={styles['seller-prod-filter-reset-btn']}
                  onClick={resetFilters}
                  disabled={!hasActiveFilters}
                >
                  Сбросить фильтры
                </button>
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
              onClick={clearSelected}
            >
              Пропустить
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
              onClick={resetFilters}
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
              <span>Тип</span>
              <span>Бренд</span>
              <span>Размер</span>
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
                  value={product.type}
                  readOnly
                  className={styles['seller-prod-readonly-input']}
                />
                <input
                  type="text"
                  value={product.brand}
                  readOnly
                  className={styles['seller-prod-readonly-input']}
                />
                <input
                  type="text"
                  value={product.size}
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
                <label htmlFor="sp-photo-url">Фото (URL)</label>
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
                <label htmlFor="sp-desc">Описание</label>
                <textarea
                  id="sp-desc"
                  value={draft.description}
                  onChange={(e) => updateDraft({ description: e.target.value })}
                  className={styles['seller-prod-edit-textarea']}
                  rows={3}
                />
              </div>

              <div className={styles['seller-prod-form-row']}>
                <div className={styles['seller-prod-form-group']}>
                  <label htmlFor="sp-cat">Категория</label>
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

                <div className={styles['seller-prod-form-group']}>
                  <label htmlFor="sp-type">Подкатегории</label>
                  <select
                    id="sp-type"
                    value={draft.type}
                    onChange={(e) => updateDraft({ type: e.target.value })}
                    className={styles['seller-prod-edit-input']}
                  >
                    <option value="">Выберите подкатегорию</option>
                    {modalSubcategoryOptions.map((subcategory) => (
                      <option key={subcategory} value={subcategory}>
                        {subcategory}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={styles['seller-prod-form-row']}>
                <div className={styles['seller-prod-form-group']}>
                  <label htmlFor="sp-brand">Бренд</label>
                  <select
                    id="sp-brand"
                    value={draft.brandId ?? ''}
                    onChange={(e) => {
                      const selectedId = e.target.value === '' ? null : Number(e.target.value);
                      const selectedBrand = apiBrands.find((b) => b.id === selectedId) ?? null;
                      updateDraft({
                        brandId: selectedId,
                        brand: selectedBrand?.name ?? '—',
                      });
                    }}
                    className={styles['seller-prod-edit-input']}
                  >
                    <option value="">Выберите бренд</option>
                    {apiBrands.map((brand) => (
                      <option key={brand.id} value={brand.id}>
                        {brand.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles['seller-prod-form-group']}>
                  <label htmlFor="sp-size">Размер</label>
                  <select
                    id="sp-size"
                    value={draft.sizeId ?? ''}
                    onChange={(e) => {
                      const selectedId = e.target.value === '' ? null : Number(e.target.value);
                      const selectedSize = apiSizes.find((s) => s.id === selectedId) ?? null;
                      updateDraft({
                        sizeId: selectedId,
                        size: selectedSize?.name ?? '—',
                      });
                    }}
                    className={styles['seller-prod-edit-input']}
                  >
                    <option value="">Выберите размер</option>
                    {apiSizes.map((size) => (
                      <option key={size.id} value={size.id}>
                        {size.name}
                      </option>
                    ))}
                  </select>
                </div>
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

              {modalMode === 'add' ? (
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
                        warehouseId: 1,
                      })
                    }
                    className={styles['seller-prod-edit-input']}
                  />
                </div>
              ) : (
                <div className={styles['seller-prod-form-group']}>
                  <label htmlFor="sp-qty">Количество</label>
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
                    disabled
                  />
                  <small>Изменение количества в этом окне недоступно.</small>
                </div>
              )}

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
