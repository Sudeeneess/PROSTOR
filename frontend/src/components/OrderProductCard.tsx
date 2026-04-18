import React from 'react';
import styles from './OrderProductCard.module.css';

export type OrderProductCardProps = {
  price: string;
  name: string;
  statusLabel: string;
  imageUrl?: string;
};

const OrderProductCard: React.FC<OrderProductCardProps> = ({
  price,
  name,
  statusLabel,
  imageUrl,
}) => {
  return (
    <article className={styles['order-product-card']}>
      <div className={styles['order-product-card__image']}>
        {imageUrl ? (
          <img src={imageUrl} alt="" />
        ) : (
          <div className={styles['order-product-card__placeholder']} aria-hidden>
            📦
          </div>
        )}
      </div>
      <div className={styles['order-product-card__body']}>
        <div className={styles['order-product-card__price']}>{price}</div>
        <div className={styles['order-product-card__name']}>{name}</div>
        <div className={styles['order-product-card__status']}>{statusLabel}</div>
      </div>
    </article>
  );
};

export default OrderProductCard;
