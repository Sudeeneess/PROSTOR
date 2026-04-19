import React from 'react';
import styles from './BasketProductCard.module.css';

export type BasketProductCardProps = {
  id: number;
  name: string;
  price: number;
  quantity: number;
  onQuantityChange: (id: number, newQuantity: number) => void;
  onRemove: (id: number) => void;
};

const BasketProductCard: React.FC<BasketProductCardProps> = ({
  id,
  name,
  price,
  quantity,
  onQuantityChange,
  onRemove,
}) => {
  const handleDecrease = () => {
    if (quantity > 1) {
      onQuantityChange(id, quantity - 1);
    }
  };

  const handleIncrease = () => {
    onQuantityChange(id, quantity + 1);
  };

  return (
    <div className={styles['basket-product-card']}>
      <div className={styles['product-image']}>
        <div className={styles['image-placeholder']}>📦</div>
      </div>
      <div className={styles['product-info']}>
        <div className={styles['price']}>{price.toLocaleString()} ₽</div>
        <div className={styles['name']}>{name}</div>
        <div className={styles['product-actions']}>
          <div className={styles['quantity-controls']}>
            <button 
              className={styles['quantity-btn']}
              onClick={handleDecrease}
              disabled={quantity <= 1}
            >
              −
            </button>
            <span className={styles['quantity-value']}>{quantity}</span>
            <button 
              className={styles['quantity-btn']}
              onClick={handleIncrease}
            >
              +
            </button>
          </div>
          <button 
            className={styles['remove-btn']}
            onClick={() => onRemove(id)}
          >
            Удалить
          </button>
        </div>
      </div>
    </div>
  );
};

export default BasketProductCard;