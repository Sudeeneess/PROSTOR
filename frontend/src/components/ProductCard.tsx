import React, { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { IoCheckmark } from 'react-icons/io5';
import styles from './ProductCard.module.css';

export type ProductCardProps = {
  id: number;
  price: string;
  name: string;
  rating: string;
  reviews: string;
};

type CartItem = {
  id: number;
  name: string;
  price: number;
  quantity: number;
};

const CART_KEY = 'cart';
const CART_UPDATE_EVENT = 'prostoricartupdate';

function readCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as CartItem[]) : [];
  } catch {
    return [];
  }
}

function writeCart(cart: CartItem[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  window.dispatchEvent(new Event(CART_UPDATE_EVENT));
}

function getQuantityForProduct(cart: CartItem[], productId: number): number {
  const item = cart.find((i) => i.id === productId);
  return item?.quantity ?? 0;
}

const ProductCard: React.FC<ProductCardProps> = ({
  id,
  price,
  name,
  rating,
  reviews,
}) => {
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(0);
  const [toastVisible, setToastVisible] = useState(false);

  const isBuyer = (() => {
    const token = localStorage.getItem('token');
    const userRole = sessionStorage.getItem('userRole');
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

  const handleAddToCart = () => {
    const token = localStorage.getItem('token');
    const userRole = sessionStorage.getItem('userRole');

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
    const userRole = sessionStorage.getItem('userRole');
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
    const userRole = sessionStorage.getItem('userRole');
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
    setToastVisible(true);
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
      <div className={styles['product-image']}>
        <div className={styles['image-placeholder']} aria-hidden>
          📦
        </div>
      </div>
      <div className={styles['product-info']}>
        <div className={styles['price']}>{price}</div>
        <div className={styles['name']}>{name}</div>
        <div className={styles['rating']}>
          ★ {rating} {reviews} отзывов
        </div>
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
            onClick={handleAddToCart}
          >
            Добавить в корзину
          </button>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
