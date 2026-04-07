import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ProductCard.module.css';

export type ProductCardProps = {
  id: number;
  price: string;
  name: string;
  rating: string;
  reviews: string;
};

const ProductCard: React.FC<ProductCardProps> = ({
  id,
  price,
  name,
  rating,
  reviews,
}) => {
  const navigate = useNavigate();
  const [isAdded, setIsAdded] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleAddToCart = () => {
    // 1. Проверяем авторизацию
    const token = localStorage.getItem('token');
    const userRole = sessionStorage.getItem('userRole');
    
    if (!token || userRole !== 'customer') {
      // Не авторизован — идем на страницу входа
      navigate('/auth');
      return;
    }

    // 2. Авторизован — добавляем в корзину
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = cart.find((item: any) => item.id === id);
    
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      // Парсим цену из строки (убираем "₽", пробелы и берем только цифры)
      const priceNumber = parseInt(price.replace(/[^\d]/g, '')) || 0;
      cart.push({
        id,
        name,
        price: priceNumber,
        quantity: 1
      });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    console.log('Товар добавлен в корзину:', { id, name });
    
    // 3. Анимация кнопки
    setIsAdded(true);
    setIsAnimating(true);
    
    // Сбрасываем через 2 секунды
    setTimeout(() => {
      setIsAdded(false);
      setIsAnimating(false);
    }, 2000);
  };

  return (
    <div className={styles['product-card']}>
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
        <button
          type="button"
          className={`${styles['add-to-cart']} ${isAdded ? styles['added'] : ''} ${isAnimating ? styles['flying'] : ''}`}
          onClick={handleAddToCart}
          disabled={isAdded}
        >
          {isAdded ? '✓ Добавлено' : 'Добавить в корзину'}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;