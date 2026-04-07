// src/pages/BasketBuyer/BasketBuyer.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HeaderMain from '../../components/HeaderMain';
import BasketProductCard from '../../components/BasketProductCard';
import styles from './BasketBuyer.module.css';

export type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

// Моковые данные
const mockCartItems: CartItem[] = [
  { id: '1', name: 'Футболка хлопковая', price: 1500, quantity: 2 },
  { id: '2', name: 'Джинсы классические', price: 3500, quantity: 1 },
  { id: '3', name: 'Кроссовки спортивные', price: 4500, quantity: 1 },
];

const BasketBuyer: React.FC = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItem[]>(mockCartItems);

  const handleQuantityChange = (id: string, newQuantity: number) => {
    setCartItems(prev =>
      prev.map(item => item.id === id ? { ...item, quantity: newQuantity } : item)
    );
  };

  const handleRemoveItem = (id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = () => {
    console.log('Оформление заказа:', cartItems);
  };

  return (
    <div className={styles['basket-page']}>
      <HeaderMain variant="buyer" />
      
      <main className={styles['basket-main']}>
        <div className={styles['basket-container']}>
          <h1 className={styles['basket-title']}>Корзина</h1>
          
          {cartItems.length === 0 ? (
            <div className={styles['empty-basket']}>
              <div className={styles['empty-icon']}>🛒</div>
              <h2>Корзина пуста</h2>
              <p>Добавьте товары в корзину, чтобы продолжить</p>
              <button 
                className={styles['continue-btn']}
                onClick={() => navigate('/buyer')}
              >
                Перейти к покупкам
              </button>
            </div>
          ) : (
            <div className={styles['basket-content']}>
              <div className={styles['basket-items']}>
                {cartItems.map(item => (
                  <BasketProductCard
                    key={item.id}
                    id={item.id}
                    name={item.name}
                    price={item.price}
                    quantity={item.quantity}
                    onQuantityChange={handleQuantityChange}
                    onRemove={handleRemoveItem}
                  />
                ))}
              </div>
              
              <div className={styles['basket-summary']}>
                <div className={styles['summary-card']}>
                  <div className={styles['summary-row']}>
                    <span>Товары, {totalItems} шт.</span>
                    <span>{totalPrice.toLocaleString()} ₽</span>
                  </div>
                  <div className={styles['summary-divider']} />
                  <div className={styles['summary-total']}>
                    <span>Итого:</span>
                    <span>{totalPrice.toLocaleString()} ₽</span>
                  </div>
                  <button 
                    className={styles['checkout-btn']}
                    onClick={handleCheckout}
                  >
                    Перейти к оформлению
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default BasketBuyer;