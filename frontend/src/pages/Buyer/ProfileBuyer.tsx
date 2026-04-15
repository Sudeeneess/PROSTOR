import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiLogOut, FiPackage, FiCreditCard, FiChevronRight, FiPlus, FiTrash2 } from 'react-icons/fi';
import { FaUserCircle } from 'react-icons/fa';
import { IoCardOutline } from "react-icons/io5";
import HeaderMain from '../../components/HeaderMain';
import { formatRuPhoneFromDigits, formatRuPhoneInput } from '../../utils/phoneFormat';
import styles from './ProfileBuyer.module.css';

interface UserProfile {
  firstName: string;
  lastName: string;
  phone: string;
}

interface SavedCard {
  id: string;
  last4: string;
  brand: 'visa' | 'mastercard' | 'mir';
  expiryDate: string;
  cardholderName: string;
}

const AccountPage: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile>({
    firstName: '',
    lastName: '',
    phone: '+7'
  });
  
  const [editProfile, setEditProfile] = useState<UserProfile>({
    firstName: '',
    lastName: '',
    phone: '+7'
  });
  
  // Состояние для попапа способа оплаты
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  // Состояние для попапа редактирования профиля
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  
  // Состояние для карт
  const [savedCards, setSavedCards] = useState<SavedCard[]>([
    { id: '1', last4: '4532', brand: 'visa', expiryDate: '12/26', cardholderName: 'ALEXEY IVANOV' },
    { id: '2', last4: '8765', brand: 'mastercard', expiryDate: '08/25', cardholderName: 'ALEXEY IVANOV' },
  ]);
  
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [newCard, setNewCard] = useState({
    cardNumber: '',
    expiryDate: '',
    cvc: '',
    cardholderName: ''
  });

  // Загрузка данных пользователя при монтировании
  useEffect(() => {
    loadUserData();
  }, []);

  const phoneFromStorage = (savedPhone: string | null): string => {
    if (!savedPhone) return '+7';
    const digits = savedPhone.replace(/\D/g, '');
    if (digits.length === 11 && digits.startsWith('7')) {
      return formatRuPhoneFromDigits(digits);
    }
    if (savedPhone.trim().startsWith('+')) {
      return savedPhone;
    }
    return '+7';
  };

  const loadUserData = () => {
    try {
      const userName = localStorage.getItem('userName');
      const savedPhone = localStorage.getItem('userPhone');
      const phoneMasked = phoneFromStorage(savedPhone);

      if (userName) {
        const nameParts = userName.split(' ');
        setProfile({
          firstName: nameParts[0] || '',
          lastName: nameParts.slice(1).join(' ') || '',
          phone: phoneMasked,
        });
        setEditProfile({
          firstName: nameParts[0] || '',
          lastName: nameParts.slice(1).join(' ') || '',
          phone: phoneMasked,
        });
      } else {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const userData = JSON.parse(userStr);
          setProfile({
            firstName: userData.name || userData.username || '',
            lastName: '',
            phone: phoneMasked,
          });
          setEditProfile({
            firstName: userData.name || userData.username || '',
            lastName: '',
            phone: phoneMasked,
          });
        }
      }
    } catch (error) {
      console.error('Ошибка загрузки данных пользователя:', error);
    }
  };

  const handleEditProfileClick = () => {
    setEditProfile({ ...profile });
    setIsProfileModalOpen(true);
  };

  const handleSaveProfile = () => {
    // Сохраняем данные
    setProfile({ ...editProfile });
    
    // Сохраняем в localStorage
    const fullName = editProfile.lastName 
      ? `${editProfile.firstName} ${editProfile.lastName}`
      : editProfile.firstName;
    localStorage.setItem('userName', fullName);
    
    if (editProfile.phone && editProfile.phone !== '+7') {
      const phoneDigits = editProfile.phone.replace(/\D/g, '');
      if (phoneDigits.length === 11) {
        localStorage.setItem('userPhone', phoneDigits);
      }
    }
    
    // Обновляем данные в объекте user
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const userData = JSON.parse(userStr);
      userData.name = fullName;
      localStorage.setItem('user', JSON.stringify(userData));
    }
    
    setIsProfileModalOpen(false);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditProfile({ ...editProfile, phone: formatRuPhoneInput(e.target.value) });
  };

  const handlePhoneBlur = () => {
    if (!editProfile.phone || editProfile.phone === '+' || editProfile.phone === '+7' || editProfile.phone === '+7 (___) ___-__-__') {
      setEditProfile({ ...editProfile, phone: '+7' });
    }
  };

  const handleOrdersClick = () => {
    navigate('/orders');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    localStorage.removeItem('userPhone');
    localStorage.removeItem('username');
    localStorage.removeItem('user');
    sessionStorage.removeItem('userRole');
    navigate('/');
  };

  // Функции для работы с картами
  const handleAddCard = () => {
    if (newCard.cardNumber && newCard.expiryDate && newCard.cvc && newCard.cardholderName) {
      const last4 = newCard.cardNumber.slice(-4);
      const newCardObj: SavedCard = {
        id: Date.now().toString(),
        last4: last4,
        brand: 'visa', // Можно определить по первым цифрам
        expiryDate: newCard.expiryDate,
        cardholderName: newCard.cardholderName.toUpperCase()
      };
      setSavedCards([...savedCards, newCardObj]);
      setIsAddingCard(false);
      setNewCard({ cardNumber: '', expiryDate: '', cvc: '', cardholderName: '' });
    }
  };

  const handleDeleteCard = (cardId: string) => {
    setSavedCards(savedCards.filter(card => card.id !== cardId));
  };

  // Функция для получения иконки карты (параметр brand не используется, но оставлен для возможного расширения)
  const getCardIcon = (_brand: string) => {
    return <IoCardOutline size={28} color="#111111" />;
  };

  return (
    <div className={styles['buyer-account-page']}>
      <HeaderMain variant="buyer" />
      
      <main className={styles['buyer-account-main']}>
        <div className={styles['buyer-account-container']}>
          {/* Блок с информацией о пользователе */}
          <div className={styles['buyer-account-header']}>
            <div className={styles['buyer-account-user-info']}>
              <div className={styles['buyer-account-avatar']}>
                <FaUserCircle size={70} color="#686df2" />
              </div>
              
              <div className={styles['buyer-account-name-section']}>
                <h1 className={styles['buyer-account-name']}>
                  {profile.lastName 
                    ? `${profile.firstName} ${profile.lastName}`
                    : profile.firstName}
                </h1>
                {profile.phone && profile.phone !== '+7' && (
                  <p className={styles['buyer-account-phone']}>{profile.phone}</p>
                )}
                <button onClick={handleEditProfileClick} className={styles['buyer-account-edit-btn']}>
                  ✎ изменить профиль
                </button>
              </div>
            </div>
          </div>

          {/* Блок с опциями */}
          <div className={styles['buyer-account-options']}>
            {/* Карточка "Заказы" */}
            <div 
              className={styles['buyer-account-option-card']}
              onClick={handleOrdersClick}
            >
              <div className={styles['buyer-account-option-icon']}>
                <FiPackage size={32} color="#111111" />
              </div>
              <div className={styles['buyer-account-option-content']}>
                <h2 className={styles['buyer-account-option-title']}>Заказы</h2>
                <p className={styles['buyer-account-option-description']}>Просмотр и отслеживание заказов</p>
              </div>
              <div className={styles['buyer-account-option-arrow']}>
                <FiChevronRight size={24} color="#4b5563" />
              </div>
            </div>

            {/* Карточка "Способ оплаты" */}
            <div 
              className={styles['buyer-account-option-card']}
              onClick={() => setIsPaymentModalOpen(true)}
            >
              <div className={styles['buyer-account-option-icon']}>
                <FiCreditCard size={32} color="#111111" />
              </div>
              <div className={styles['buyer-account-option-content']}>
                <h2 className={styles['buyer-account-option-title']}>Способы оплаты</h2>
                <p className={styles['buyer-account-option-description']}>
                  {savedCards.length} {savedCards.length === 1 ? 'карта' : savedCards.length >= 2 && savedCards.length <= 4 ? 'карты' : 'карт'}
                </p>
              </div>
              <div className={styles['buyer-account-option-arrow']}>
                <FiChevronRight size={24} color="#4b5563" />
              </div>
            </div>

            {/* Кнопка "Выйти" */}
            <button 
              className={styles['buyer-account-logout-btn']}
              onClick={handleLogout}
            >
              <FiLogOut size={20} /> Выйти из аккаунта
            </button>
          </div>
        </div>
      </main>

      {/* Модальное окно "Редактирование профиля" */}
      {isProfileModalOpen && (
        <div className={styles['buyer-account-modal-overlay']} onClick={() => setIsProfileModalOpen(false)}>
          <div className={styles['buyer-account-modal-content']} onClick={(e) => e.stopPropagation()}>
            <div className={styles['buyer-account-modal-header']}>
              <h2>Редактирование профиля</h2>
              <button className={styles['buyer-account-modal-close']} onClick={() => setIsProfileModalOpen(false)}>×</button>
            </div>
            <div className={styles['buyer-account-modal-body']}>
              <div className={styles['profile-edit-form']}>
                <div className={styles['profile-edit-field']}>
                  <label>Имя</label>
                  <input
                    type="text"
                    value={editProfile.firstName}
                    onChange={(e) => setEditProfile({ ...editProfile, firstName: e.target.value })}
                    placeholder="Введите имя"
                    className={styles['profile-edit-input']}
                  />
                </div>
                
                <div className={styles['profile-edit-field']}>
                  <label>Фамилия</label>
                  <input
                    type="text"
                    value={editProfile.lastName}
                    onChange={(e) => setEditProfile({ ...editProfile, lastName: e.target.value })}
                    placeholder="Введите фамилию"
                    className={styles['profile-edit-input']}
                  />
                </div>
                
                <div className={styles['profile-edit-field']}>
                  <label>Номер телефона</label>
                  <input
                    type="tel"
                    value={editProfile.phone}
                    onChange={handlePhoneChange}
                    onBlur={handlePhoneBlur}
                    inputMode="tel"
                    autoComplete="tel"
                    maxLength={18}
                    className={styles['profile-edit-input']}
                    placeholder="+7 (___) ___-__-__"
                  />
                </div>
                
                <div className={styles['profile-edit-actions']}>
                  <button onClick={handleSaveProfile} className={styles['profile-edit-save-btn']}>
                    Сохранить
                  </button>
                  <button onClick={() => setIsProfileModalOpen(false)} className={styles['profile-edit-cancel-btn']}>
                    Отмена
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Модальное окно "Способы оплаты" */}
      {isPaymentModalOpen && (
        <div className={styles['buyer-account-modal-overlay']} onClick={() => setIsPaymentModalOpen(false)}>
          <div className={`${styles['buyer-account-modal-content']} ${styles['payment-modal-content']}`} onClick={(e) => e.stopPropagation()}>
            <div className={styles['buyer-account-modal-header']}>
              <h2>Способы оплаты</h2>
              <button className={styles['buyer-account-modal-close']} onClick={() => setIsPaymentModalOpen(false)}>×</button>
            </div>
            <div className={styles['buyer-account-modal-body']}>
              <div className={styles['payment-methods-container']}>
                {/* Существующие карты */}
                {savedCards.map((card) => (
                  <div key={card.id} className={styles['payment-card-item']}>
                    <div className={styles['payment-card-info']}>
                      <div className={styles['payment-card-icon']}>
                        {getCardIcon(card.brand)}
                      </div>
                      <div className={styles['payment-card-details']}>
                        <div className={styles['payment-card-number']}>
                          •••• {card.last4}
                        </div>
                        <div className={styles['payment-card-expiry']}>
                          Срок действия: {card.expiryDate}
                        </div>
                        <div className={styles['payment-card-holder']}>
                          {card.cardholderName}
                        </div>
                      </div>
                    </div>
                    <button 
                      className={styles['payment-card-delete']}
                      onClick={() => handleDeleteCard(card.id)}
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </div>
                ))}

                {/* Форма добавления новой карты */}
                {!isAddingCard ? (
                  <button 
                    className={styles['add-card-button']}
                    onClick={() => setIsAddingCard(true)}
                  >
                    <FiPlus size={20} />
                    Добавить новую карту
                  </button>
                ) : (
                  <div className={styles['add-card-form']}>
                    <h3 className={styles['add-card-title']}>Новая карта</h3>
                    
                    <div className={styles['add-card-field']}>
                      <input
                        type="text"
                        placeholder="Номер карты"
                        value={newCard.cardNumber}
                        onChange={(e) => setNewCard({ ...newCard, cardNumber: e.target.value.replace(/\s/g, '') })}
                        maxLength={19}
                        className={styles['add-card-input']}
                      />
                    </div>
                    
                    <div className={styles['add-card-row']}>
                      <div className={styles['add-card-field']}>
                        <input
                          type="text"
                          placeholder="MM/YY"
                          value={newCard.expiryDate}
                          onChange={(e) => setNewCard({ ...newCard, expiryDate: e.target.value })}
                          maxLength={5}
                          className={styles['add-card-input']}
                        />
                      </div>
                      <div className={styles['add-card-field']}>
                        <input
                          type="text"
                          placeholder="CVC"
                          value={newCard.cvc}
                          onChange={(e) => setNewCard({ ...newCard, cvc: e.target.value })}
                          maxLength={3}
                          className={styles['add-card-input']}
                        />
                      </div>
                    </div>
                    
                    <div className={styles['add-card-field']}>
                      <input
                        type="text"
                        placeholder="Имя держателя карты (как на карте)"
                        value={newCard.cardholderName}
                        onChange={(e) => setNewCard({ ...newCard, cardholderName: e.target.value.toUpperCase() })}
                        className={styles['add-card-input']}
                      />
                    </div>
                    
                    <div className={styles['add-card-actions']}>
                      <button onClick={handleAddCard} className={styles['add-card-save-btn']}>
                        Сохранить карту
                      </button>
                      <button onClick={() => {
                        setIsAddingCard(false);
                        setNewCard({ cardNumber: '', expiryDate: '', cvc: '', cardholderName: '' });
                      }} className={styles['add-card-cancel-btn']}>
                        Отмена
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountPage;