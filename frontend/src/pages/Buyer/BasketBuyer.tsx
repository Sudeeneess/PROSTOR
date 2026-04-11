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
  image?: string;
};

// Моковые данные с изображениями
const mockCartItems: CartItem[] = [
  { id: '1', name: 'Футболка хлопковая', price: 1500, quantity: 2, image: '👕' },
  { id: '2', name: 'Джинсы классические', price: 3500, quantity: 1, image: '👖' },
  { id: '3', name: 'Кроссовки спортивные', price: 4500, quantity: 1, image: '👟' },
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
    navigate('/order-formalization', { 
      state: { 
        cartItems: cartItems,
        totalItems: totalItems,
        totalPrice: totalPrice
      } 
    });
  };

  return (
    <div className={styles['basket-page']}>
      <HeaderMain variant="buyer" />
      
      <main className={styles['basket-main']}>
        <div className={styles['basket-container']}>
          <div className={styles['basket-header']}>
            <h1 className={styles['basket-title']}>Корзина</h1>
            <p className={styles['basket-subtitle']}>{cartItems.length} товара</p>
          </div>
          
          {cartItems.length === 0 ? (
            <div className={styles['empty-basket']}>
              <div className={styles['empty-animation']}>
                <div className={styles['empty-icon']}>🛒</div>
                <div className={styles['empty-shine']}></div>
              </div>
              <h2>Ваша корзина пуста</h2>
              <p>Похоже, вы еще не выбрали ни одного товара</p>
              <button 
                className={styles['continue-btn']}
                onClick={() => navigate('/customer')}
              >
                Продолжить покупки
              </button>
            </div>
          ) : (
            <div className={styles['basket-content']}>
              <div className={styles['basket-items-section']}>
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
                
                <div className={styles['continue-shopping']}>
                  <button 
                    className={styles['continue-shopping-btn']}
                    onClick={() => navigate('/customer')}
                  >
                    ← Продолжить покупки
                  </button>
                </div>
              </div>
              
              <div className={styles['basket-summary']}>
                <div className={styles['summary-card']}>
                  <h3 className={styles['summary-title']}>Детали заказа</h3>
                  
                  <div className={styles['summary-items']}>
                    <div className={styles['summary-row']}>
                      <span>Товары, {totalItems} шт.</span>
                      <span>{totalPrice.toLocaleString()} ₽</span>
                    </div>
                  </div>
                  
                  <div className={styles['summary-divider']} />
                  
                  <div className={styles['summary-total']}>
                    <span>Итого к оплате</span>
                    <span>{totalPrice.toLocaleString()} ₽</span>
                  </div>
                  
                  <button 
                    className={styles['checkout-btn']}
                    onClick={handleCheckout}
                  >
                    Оформить заказ
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