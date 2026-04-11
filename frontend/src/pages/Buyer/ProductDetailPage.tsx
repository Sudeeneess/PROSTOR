import React, { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useParams } from 'react-router-dom';
import { IoCheckmark } from 'react-icons/io5';
import { getMockProductDetail } from '../../data/mockProductDetails';
import {
  CART_UPDATE_EVENT,
  getQuantityForProduct,
  readCart,
  writeCart,
} from '../../utils/cartStorage';
import { api } from '../../services/api';
import styles from './ProductDetailPage.module.css';

const TOAST_MS = 1500;

function formatPriceRub(value: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(value);
}

const ProductDetailPage: React.FC = () => {
  const { id: idParam } = useParams();
  const navigate = useNavigate();
  const id = idParam ? parseInt(idParam, 10) : NaN;

  const product = Number.isFinite(id) ? getMockProductDetail(id) : undefined;

  const [activePhoto, setActivePhoto] = useState(0);
  const [quantity, setQuantity] = useState(0);
  const [toastVisible, setToastVisible] = useState(false);

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
  }, [id]);

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
    // Тост только у кнопки «Добавить в корзину», не у «+»
  };

  if (!product) {
    return (
      <div className={styles['page']}>
        <div className={styles['inner']}>
          <p className={styles['notFound']}>Товар не найден.</p>
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
