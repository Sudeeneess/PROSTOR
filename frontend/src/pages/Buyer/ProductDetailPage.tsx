import React, { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useParams } from 'react-router-dom';
import { IoCheckmark } from 'react-icons/io5';
import type { ProductDetail } from '../../data/mockProductDetails';
import {
  CART_UPDATE_EVENT,
  getQuantityForProduct,
  readCart,
  writeCart,
} from '../../utils/cartStorage';
import { api, type Product, type ProductCardResponse } from '../../services/api';
import {
  firstPhotoUrlFromCard,
  pickDisplayCard,
} from '../../utils/catalogFromApi';
import styles from './ProductDetailPage.module.css';

const TOAST_MS = 1500;

const PLACEHOLDER_DETAIL =
  'https://placehold.co/800x1000/e8eef8/447add?text=PROSTOR';

function formatPriceRub(value: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(value);
}

function buildDetailFromApi(
  p: Product,
  cards: ProductCardResponse[]
): ProductDetail {
  const card = pickDisplayCard(cards);
  const photoUrls: string[] = [];
  for (const c of cards) {
    const u = firstPhotoUrlFromCard(c.photo);
    if (u) photoUrls.push(u);
  }
  if (photoUrls.length === 0) {
    photoUrls.push(PLACEHOLDER_DETAIL);
  }
  return {
    id: p.id,
    name: p.name,
    price: Number(p.price),
    description:
      card?.description?.trim() || 'Описание уточняется у продавца.',
    brandName: card?.brand?.name ?? '—',
    sizeName: card?.size?.name ?? '—',
    type: card?.type ?? '—',
    photos: photoUrls,
  };
}

const ProductDetailPage: React.FC = () => {
  const { id: idParam } = useParams();
  const navigate = useNavigate();
  const id = idParam ? parseInt(idParam, 10) : NaN;

  const [product, setProduct] = useState<ProductDetail | undefined>(undefined);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [activePhoto, setActivePhoto] = useState(0);
  const [quantity, setQuantity] = useState(0);
  const [toastVisible, setToastVisible] = useState(false);

  useEffect(() => {
    if (!Number.isFinite(id) || id < 1) {
      setProduct(undefined);
      setLoadError(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      setLoadError(null);
      const pr = await api.getProductById(id);
      if (cancelled) return;
      if (!pr.success || !pr.data) {
        setProduct(undefined);
        setLoadError(pr.error ?? 'Товар не найден');
        setLoading(false);
        return;
      }
      const cr = await api.getProductCards(id);
      const cards = cr.success && cr.data ? cr.data : [];
      if (cancelled) return;
      setProduct(buildDetailFromApi(pr.data, cards));
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const isBuyer = (() => {
    const token = localStorage.getItem('token');
    const userRole = api.getStoredUserRole();
    return Boolean(token && userRole === 'customer');
  })();

  const syncQuantity = useCallback(() => {
    if (!product) return;
    setQuantity(getQuantityForProduct(readCart(), product.id));
  }, [product]);

  useEffect(() => {
    setActivePhoto(0);
  }, [id, product?.id]);

  useEffect(() => {
    if (!product) return;
    syncQuantity();
    window.addEventListener(CART_UPDATE_EVENT, syncQuantity);
    window.addEventListener('storage', syncQuantity);
    return () => {
      window.removeEventListener(CART_UPDATE_EVENT, syncQuantity);
      window.removeEventListener('storage', syncQuantity);
    };
  }, [product, syncQuantity]);

  useEffect(() => {
    if (!toastVisible) return;
    const t = window.setTimeout(() => setToastVisible(false), TOAST_MS);
    return () => window.clearTimeout(t);
  }, [toastVisible]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleAdd = () => {
    if (!product) return;
    const token = localStorage.getItem('token');
    const userRole = api.getStoredUserRole();
    if (!token || userRole !== 'customer') {
      navigate('/auth');
      return;
    }

    const cart = readCart();
    const existing = cart.find((item) => item.id === product.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
      });
    }
    writeCart(cart);
    setQuantity(getQuantityForProduct(cart, product.id));
    setToastVisible(true);
  };

  const handleDec = () => {
    if (!product) return;
    const token = localStorage.getItem('token');
    const userRole = api.getStoredUserRole();
    if (!token || userRole !== 'customer') return;

    const cart = readCart();
    const idx = cart.findIndex((item) => item.id === product.id);
    if (idx === -1) return;
    const item = cart[idx];
    if (item.quantity <= 1) {
      cart.splice(idx, 1);
    } else {
      item.quantity -= 1;
    }
    writeCart(cart);
    setQuantity(getQuantityForProduct(cart, product.id));
  };

  const handleInc = () => {
    if (!product) return;
    const token = localStorage.getItem('token');
    const userRole = api.getStoredUserRole();
    if (!token || userRole !== 'customer') return;

    const cart = readCart();
    const existing = cart.find((item) => item.id === product.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
      });
    }
    writeCart(cart);
    setQuantity(getQuantityForProduct(cart, product.id));
  };

  if (loading) {
    return (
      <div className={styles['page']}>
        <div className={styles['inner']}>
          <p className={styles['notFound']}>Загрузка товара…</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className={styles['page']}>
        <div className={styles['inner']}>
          <p className={styles['notFound']} role="alert">
            {loadError ?? 'Товар не найден.'}
          </p>
          <button type="button" className={styles['back']} onClick={() => navigate('/')}>
            На главную
          </button>
        </div>
      </div>
    );
  }

  const mainSrc = product.photos[activePhoto] ?? product.photos[0];
  const showCounter = isBuyer && quantity > 0;

  const toastNode =
    toastVisible &&
    createPortal(
      <div className={styles['toast']} role="status" aria-live="polite">
        <span aria-hidden>
          <IoCheckmark size={20} />
        </span>
        <span>Товар добавлен в корзину</span>
      </div>,
      document.body
    );

  return (
    <div className={styles['page']}>
      {toastNode}
      <div className={styles['inner']}>
        <button type="button" className={styles['back']} onClick={handleBack}>
          ← назад
        </button>

        <div className={styles['layout']}>
          <div className={styles['gallery']}>
            <div className={styles['thumbs']} role="tablist" aria-label="Ракурсы товара">
              {product.photos.map((src, index) => (
                <button
                  key={src}
                  type="button"
                  role="tab"
                  aria-selected={index === activePhoto}
                  className={`${styles['thumb']} ${index === activePhoto ? styles['thumbActive'] : ''}`}
                  onClick={() => setActivePhoto(index)}
                >
                  <img src={src} alt="" loading="lazy" />
                </button>
              ))}
            </div>
            <div className={styles['mainPhoto']}>
              <img src={mainSrc} alt={product.name} />
            </div>
          </div>

          <div className={styles['info']}>
            <h1 className={styles['title']}>{product.name}</h1>
            <p className={styles['description']}>{product.description}</p>

            <div className={styles['meta']}>
              <div className={styles['metaRow']}>
                <span className={styles['metaLabel']}>Бренд</span>
                <span className={styles['metaValue']}>{product.brandName}</span>
              </div>
            </div>

            <p className={styles['price']}>{formatPriceRub(product.price)}</p>

            <div className={styles['meta']}>
              <div className={styles['metaRow']}>
                <span className={styles['metaLabel']}>Размер</span>
                <span className={styles['metaValue']}>{product.sizeName}</span>
              </div>
              <div className={styles['metaRow']}>
                <span className={styles['metaLabel']}>Тип</span>
                <span className={styles['metaValue']}>{product.type}</span>
              </div>
            </div>

            <p className={styles['article']}>
              Артикул: {String(product.id).padStart(7, '0')}
            </p>

            <div className={styles['purchasePanel']}>
              <div className={styles['purchaseRow']}>
                <button type="button" className={styles['addBtn']} onClick={handleAdd}>
                  Добавить в корзину
                </button>
                {showCounter && (
                  <div className={styles['cartCounter']} aria-label="Количество в корзине">
                    <button
                      type="button"
                      className={styles['counterBtn']}
                      aria-label="Уменьшить количество"
                      onClick={handleDec}
                    >
                      −
                    </button>
                    <span className={styles['counterValue']}>{quantity}</span>
                    <button
                      type="button"
                      className={styles['counterBtn']}
                      aria-label="Увеличить количество"
                      onClick={handleInc}
                    >
                      +
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
