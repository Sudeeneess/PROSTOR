import React from 'react';
import styles from './ProductCard.module.css';

export type ProductCardProps = {
  price: string;
  name: string;
  rating: string;
  reviews: string;
};

const ProductCard: React.FC<ProductCardProps> = ({
  price,
  name,
  rating,
  reviews,
}) => {
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
        <button type="button" className={styles['add-to-cart']}>
          Добавить в корзину
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
