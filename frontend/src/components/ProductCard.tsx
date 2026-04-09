import React, { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { IoCheckmark } from 'react-icons/io5';
import {
  CART_UPDATE_EVENT,
  getQuantityForProduct,
  readCart,
  writeCart,
} from '../utils/cartStorage';
import { api } from '../services/api';
import styles from './ProductCard.module.css';

export type ProductCardProps = {
  id: number;
  price: string;
  name: string;
  rating: string;
  reviews: string;
  /** Первое фото из product_card.photo (URL); без него — плейсхолдер */
  imageUrl?: string | null;
};

const ProductCard: React.FC<ProductCardProps> = ({
  id,
  price,
  name,
  rating,
  reviews,
  imageUrl,
}) => {
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(0);
  const [toastVisible, setToastVisible] = useState(false);

  const isBuyer = (() => {
    const token = localStorage.getItem('token');
    const userRole = api.getStoredUserRole();
    return Boolean(token && userRole === 'customer');
  })();

  const syncQuantityFromStorage = useCallback(() => {
    setQuantity(getQuantityForProduct(readCart(), id));
  }, [id]);

  useEffect(() => {
    syncQuantityFromStorage();
    window.addEventListener(CART_UPDATE_EVENT, syncQuantityFromStorage);
    window.addEventListener('storage', syncQuantityFromStorage);
    return () => {
      window.removeEventListener(CART_UPDATE_EVENT, syncQuantityFromStorage);
      window.removeEventListener('storage', syncQuantityFromStorage);
    };
  }, [syncQuantityFromStorage]);

  useEffect(() => {
    if (!toastVisible) return;
    const idTimer = window.setTimeout(() => setToastVisible(false), 1500);
    return () => window.clearTimeout(idTimer);
  }, [toastVisible]);

  const parsePriceNumber = () =>
    parseInt(price.replace(/[^\d]/g, ''), 10) || 0;

  const goToProduct = () => {
    navigate(`/product/${id}`);
  };

  const handleMainKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      goToProduct();
    }
  };

  const handleAddToCart = () => {
    const token = localStorage.getItem('token');
    const userRole = api.getStoredUserRole();

    if (!token || userRole !== 'customer') {
      navigate('/auth');
      return;
    }

    const cart = readCart();
    const existingItem = cart.find((item) => item.id === id);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({
        id,
        name,
        price: parsePriceNumber(),
        quantity: 1,
      });
    }

    writeCart(cart);
    setQuantity(getQuantityForProduct(cart, id));
    setToastVisible(true);
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    const token = localStorage.getItem('token');
    const userRole = api.getStoredUserRole();
    if (!token || userRole !== 'customer') return;

    const cart = readCart();
    const idx = cart.findIndex((item) => item.id === id);
    if (idx === -1) return;

    const item = cart[idx];
    if (item.quantity <= 1) {
      cart.splice(idx, 1);
    } else {
      item.quantity -= 1;
    }

    writeCart(cart);
    setQuantity(getQuantityForProduct(cart, id));
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    const token = localStorage.getItem('token');
    const userRole = api.getStoredUserRole();
    if (!token || userRole !== 'customer') return;

    const cart = readCart();
    const existingItem = cart.find((item) => item.id === id);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({
        id,
        name,
        price: parsePriceNumber(),
        quantity: 1,
      });
    }

    writeCart(cart);
    setQuantity(getQuantityForProduct(cart, id));
    // Тост только при первом добавлении через «Добавить в корзину», не при «+»
  };

  const showCounter = isBuyer && quantity > 0;

  const toastNode =
    toastVisible &&
    createPortal(
      <div className={styles['toast']} role="status" aria-live="polite">
        <span className={styles['toast-icon']} aria-hidden>
          <IoCheckmark size={20} aria-hidden />
        </span>
        <span className={styles['toast-text']}>Товар добавлен в корзину</span>
      </div>,
      document.body
    );

  return (
    <div className={styles['product-card']}>
      {toastNode}
      <div
        className={styles['product-card-main']}
        onClick={goToProduct}
        onKeyDown={handleMainKeyDown}
        role="link"
        tabIndex={0}
        aria-label={`Открыть карточку: ${name}`}
      >
        <div className={styles['product-image']}>
          {imageUrl ? (
            <img
              src={imageUrl}
              alt=""
              className={styles['product-thumb']}
              loading="lazy"
            />
          ) : (
            <div className={styles['image-placeholder']} aria-hidden>
              📦
            </div>
          )}
        </div>
        <div className={styles['product-info']}>
          <div className={styles['price']}>{price}</div>
          <div className={styles['name']}>{name}</div>
          <div className={styles['rating']}>
            ★ {rating} {reviews} отзывов
          </div>
        </div>
      </div>
      <div className={styles['product-card-actions']}>
        {showCounter ? (
          <div className={styles['cart-counter']} aria-label="Количество в корзине">
            <button
              type="button"
              className={styles['counter-btn']}
              aria-label="Уменьшить количество"
              onClick={handleDecrement}
            >
              −
            </button>
            <span className={styles['counter-value']}>{quantity}</span>
            <button
              type="button"
              className={styles['counter-btn']}
              aria-label="Увеличить количество"
              onClick={handleIncrement}
            >
              +
            </button>
          </div>
        ) : (
          <button
            type="button"
            className={styles['add-to-cart']}
            onClick={(e) => {
              e.stopPropagation();
              handleAddToCart();
            }}
          >
            Добавить в корзину
          </button>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
