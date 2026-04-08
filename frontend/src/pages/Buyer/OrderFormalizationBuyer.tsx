import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaMapMarkerAlt, FaUserCircle, FaPhoneAlt, FaCreditCard } from 'react-icons/fa';
import { SiVisa, SiMastercard } from 'react-icons/si';
import { BsCreditCard } from 'react-icons/bs';
import InputMask from 'react-input-mask';
import HeaderMain from '../../components/HeaderMain';
import styles from './OrderFormalizationBuyer.module.css';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface LocationState {
  cartItems: CartItem[];
  totalItems: number;
  totalPrice: number;
}

interface SavedCard {
  id: string;
  last4: string;
  brand: 'visa' | 'mastercard' | 'mir';
  expiryDate: string;
  cardholderName: string;
}

interface Order {
  id: string;
  status: 'pending' | 'confirmed' | 'reserved' | 'shipped' | 'completed' | 'cancelled';
  items: OrderItem[];
  customer: {
    firstName: string;
    lastName?: string;
    phone?: string;
  };
  totalPrice: number;
  totalItems: number;
  createdAt: string;
  paymentStatus: 'pending' | 'simulated';
  deliveryAddress: string;
}

interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  reservedAt?: string;
}

const PICKUP_ADDRESS = 'г. Новосибирск, Улица Блюхера 28';

// Функция для получения только цифр из номера
const getRawPhoneDigits = (phone: string): string => {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 0) return '';
  if (digits[0] === '8') return '7' + digits.slice(1);
  return digits;
};

// Упрощенная функция для резервирования товаров (без проверки наличия)
const reserveProducts = async (items: CartItem[]): Promise<boolean> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      // Просто имитируем успешное резервирование
      console.log('✅ Товары зарезервированы (симуляция):', items.map(i => ({ name: i.name, quantity: i.quantity })));
      resolve(true);
    }, 500);
  });
};

const OrderFormalizationBuyer: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('+7');
  const [selectedCard, setSelectedCard] = useState<string>('new');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [totalItems, setTotalItems] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const [savedCards, setSavedCards] = useState<SavedCard[]>([]);

  useEffect(() => {
    const loadUserData = () => {
      try {
        // Загружаем имя и фамилию
        const userName = localStorage.getItem('userName');
        const savedPhone = localStorage.getItem('userPhone');
        
        if (userName) {
          const nameParts = userName.split(' ');
          setFirstName(nameParts[0] || '');
          setLastName(nameParts.slice(1).join(' ') || '');
        } else {
          const userStr = localStorage.getItem('user');
          if (userStr) {
            const userData = JSON.parse(userStr);
            const username = userData.name || userData.username || '';
            setFirstName(username);
            setLastName('');
          }
        }
        
        // Загружаем телефон
        if (savedPhone) {
          const digits = savedPhone.replace(/\D/g, '');
          if (digits.length === 11) {
            let formatted = '+7';
            if (digits[0] === '7') {
              const remaining = digits.slice(1);
              formatted += ` (${remaining.slice(0, 3)}) ${remaining.slice(3, 6)}-${remaining.slice(6, 8)}-${remaining.slice(8, 10)}`;
            }
            setPhone(formatted);
          } else {
            setPhone('+7');
          }
        } else {
          setPhone('+7');
        }
        
        // Загружаем сохраненные карты
        const savedCardsStr = localStorage.getItem('savedCards');
        if (savedCardsStr) {
          setSavedCards(JSON.parse(savedCardsStr));
        } else {
          // Пример карт для демонстрации с явным указанием типа
          const defaultCards: SavedCard[] = [
            { id: '1', last4: '4532', brand: 'visa', expiryDate: '12/26', cardholderName: 'ALEXEY IVANOV' },
            { id: '2', last4: '8765', brand: 'mastercard', expiryDate: '08/25', cardholderName: 'ALEXEY IVANOV' },
          ];
          setSavedCards(defaultCards);
          localStorage.setItem('savedCards', JSON.stringify(defaultCards));
        }
        
      } catch (error) {
        console.error('Ошибка загрузки данных пользователя:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, []);

  useEffect(() => {
    if (state && state.cartItems) {
      setCartItems(state.cartItems);
      setTotalItems(state.totalItems);
      setTotalPrice(state.totalPrice);
    } else {
      console.warn('Данные корзины не переданы, перенаправление на страницу корзины');
      navigate('/basket');
    }
  }, [state, navigate]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    if (rawValue === '' || rawValue === '+') {
      setPhone('+7');
      return;
    }
    setPhone(rawValue);
  };

  const handlePhoneBlur = () => {
    if (!phone || phone === '+' || phone === '+7' || phone === '+7 (___) ___-__-__') {
      setPhone('+7');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!firstName.trim()) {
      alert('Пожалуйста, введите имя');
      return;
    }
    
    const phoneDigits = getRawPhoneDigits(phone);
    if (phoneDigits.length > 0 && phoneDigits.length !== 11) {
      alert('Пожалуйста, введите корректный номер телефона (10 цифр после +7)');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Резервируем товары (симуляция, без проверки)
      await reserveProducts(cartItems);
      
      // Создаем заказ
      const orderId = `ORDER_${Date.now()}_${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
      
      const fullName = lastName.trim() ? `${firstName} ${lastName}` : firstName;
      
      const newOrder: Order = {
        id: orderId,
        status: 'reserved',
        items: cartItems.map(item => ({
          productId: item.id,
          productName: item.name,
          quantity: item.quantity,
          price: item.price,
          reservedAt: new Date().toISOString()
        })),
        customer: {
          firstName: firstName.trim(),
          lastName: lastName.trim() || undefined,
          phone: phoneDigits.length === 11 ? phoneDigits : undefined
        },
        totalPrice: totalPrice,
        totalItems: totalItems,
        createdAt: new Date().toISOString(),
        paymentStatus: 'simulated',
        deliveryAddress: PICKUP_ADDRESS
      };
      
      // Сохраняем заказ
      const orders = JSON.parse(localStorage.getItem('orders') || '[]');
      orders.push(newOrder);
      localStorage.setItem('orders', JSON.stringify(orders));
      
      // Очищаем корзину покупателя
      localStorage.removeItem('cart');
      
      // Сохраняем данные пользователя
      localStorage.setItem('userName', fullName);
      if (phoneDigits.length === 11) {
        localStorage.setItem('userPhone', phoneDigits);
      }
      
      console.log('✅ Заказ создан:', newOrder);
      
      alert(`✅ Заказ №${orderId.slice(-8)} успешно оформлен!`);
      
      navigate('/buyer/orders');
      
    } catch (error: any) {
      console.error('❌ Ошибка при оформлении заказа:', error);
      alert(`❌ Ошибка: ${error.message || 'Не удалось оформить заказ. Пожалуйста, попробуйте позже.'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToBasket = () => {
    navigate('/basket');
  };

  const getCardIcon = (brand: string) => {
    switch (brand) {
      case 'visa':
        return <SiVisa className={styles['card-icon']} />;
      case 'mastercard':
        return <SiMastercard className={styles['card-icon']} />;
      case 'mir':
        return <BsCreditCard className={styles['card-icon']} />;
      default:
        return <FaCreditCard className={styles['card-icon']} />;
    }
  };

  if (isLoading) {
    return (
      <>
        <HeaderMain variant="buyer" />
        <div className={styles['order-container']}>
          <div className={styles['order-card']}>
            <div className={styles['loading']}>Загрузка...</div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <HeaderMain variant="buyer" />
      <div className={styles['order-container']}>
        <div className={styles['order-layout']}>
          {/* Левая колонка */}
          <div className={styles['order-left']}>
            <button className={styles['back-button']} onClick={handleBackToBasket}>
              ← Назад в корзину
            </button>
            
            <h1 className={styles['order-title']}>Оформление заказа</h1>

            {/* Контактные данные */}
            <div className={styles['section']}>
              <h2 className={styles['section-header']}>
                <span className={styles['section-number']}>1</span>
                Контактные данные
              </h2>
              
              <div className={styles['contact-item']}>
                <FaUserCircle className={styles['contact-icon']} />
                <div className={styles['contact-info']}>
                  <div className={styles['contact-label']}>
                    Имя <span className={styles['required']}>*</span>
                  </div>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className={styles['name-input']}
                    placeholder="Введите имя"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className={styles['contact-item']}>
                <FaUserCircle className={styles['contact-icon']} />
                <div className={styles['contact-info']}>
                  <div className={styles['contact-label']}>Фамилия (необязательно)</div>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className={styles['name-input']}
                    placeholder="Введите фамилию"
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className={styles['contact-item']}>
                <FaPhoneAlt className={styles['contact-icon']} />
                <div className={styles['contact-info']}>
                  <div className={styles['contact-label']}>
                    Номер телефона <span className={styles['optional']}>(необязательно)</span>
                  </div>
                  <InputMask
                    mask="+7 (999) 999-99-99"
                    maskChar="_"
                    value={phone}
                    onChange={handlePhoneChange}
                    onBlur={handlePhoneBlur}
                    className={styles['phone-input']}
                    placeholder="+7 (___) ___-__-__"
                    disabled={isSubmitting}
                  >
                    {(inputProps: any) => <input {...inputProps} type="tel" />}
                  </InputMask>
                </div>
              </div>
            </div>

            {/* Способ оплаты */}
            <div className={styles['section']}>
              <h2 className={styles['section-header']}>
                <span className={styles['section-number']}>2</span>
                Способ оплаты
              </h2>

              {/* Информация о тестовом режиме */}
              <div className={styles['test-mode-info']} style={{ 
                backgroundColor: '#f0f9ff', 
                padding: '12px', 
                borderRadius: '8px', 
                marginBottom: '16px',
                fontSize: '14px',
                color: '#0066cc'
              }}>
                💳 <strong>Тестовый режим</strong> — оплата не требуется
              </div>

              {savedCards.length > 0 && (
                <div className={styles['saved-cards']}>
                  <label className={styles['section-subtitle']}>Мои карты</label>
                  {savedCards.map((card) => (
                    <label key={card.id} className={styles['card-option']}>
                      <input
                        type="radio"
                        name="payment-card"
                        value={card.id}
                        checked={selectedCard === card.id}
                        onChange={(e) => setSelectedCard(e.target.value)}
                        className={styles['card-radio']}
                        disabled={isSubmitting}
                      />
                      <div className={styles['card-info']}>
                        {getCardIcon(card.brand)}
                        <span className={styles['card-number']}>
                          •••• {card.last4}
                        </span>
                        <span className={styles['card-expiry']}>
                          {card.expiryDate}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              )}

              <label className={styles['card-option']}>
                <input
                  type="radio"
                  name="payment-card"
                  value="new"
                  checked={selectedCard === 'new'}
                  onChange={(e) => setSelectedCard(e.target.value)}
                  className={styles['card-radio']}
                  disabled={isSubmitting}
                />
                <div className={styles['card-info']}>
                  <FaCreditCard className={styles['card-icon']} />
                  <span className={styles['new-card-text']}>Новая банковская карта</span>
                </div>
              </label>

              {selectedCard === 'new' && (
                <div className={styles['new-card-form']}>
                  <input
                    type="text"
                    placeholder="Номер карты"
                    className={styles['card-input']}
                    maxLength={19}
                    disabled={isSubmitting}
                  />
                  <div className={styles['card-row']}>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      className={styles['card-input-small']}
                      maxLength={5}
                      disabled={isSubmitting}
                    />
                    <input
                      type="text"
                      placeholder="CVC"
                      className={styles['card-input-small']}
                      maxLength={3}
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Правая колонка */}
          <div className={styles['order-right']}>
            <div className={styles['summary-card']}>
              <h2 className={styles['summary-title']}>Ваш заказ</h2>
              
              <div className={styles['delivery-info']}>
                <div className={styles['delivery-header']}>
                  <FaMapMarkerAlt className={styles['delivery-icon']} />
                  <span>Пункт выдачи</span>
                </div>
                <div className={styles['delivery-address']}>{PICKUP_ADDRESS}</div>
              </div>

              <div className={styles['order-items-summary']}>
                <div className={styles['summary-row']}>
                  <span>Товары, {totalItems} шт.</span>
                  <span>{totalPrice.toLocaleString()} ₽</span>
                </div>
                
                {cartItems.length > 0 && (
                  <div className={styles['order-items-list']}>
                    {cartItems.map((item) => (
                      <div key={item.id} className={styles['order-item-summary']}>
                        <span className={styles['order-item-name']}>
                          {item.name} × {item.quantity}
                        </span>
                        <span className={styles['order-item-price']}>
                          {(item.price * item.quantity).toLocaleString()} ₽
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className={styles['divider']} />
                <div className={styles['total-row']}>
                  <strong>Итого к оплате:</strong>
                  <strong className={styles['total-price']}>{totalPrice.toLocaleString()} ₽</strong>
                </div>
              </div>

              <button 
                className={styles['order-button']} 
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Оформление...' : 'Подтвердить заказ'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrderFormalizationBuyer;

//реальные эндпоинты, просто замените содержимое функции reserveProducts на API-вызовы.