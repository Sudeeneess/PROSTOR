import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiLogOut, FiPackage, FiCreditCard, FiChevronRight } from 'react-icons/fi';
import { FaUserCircle } from 'react-icons/fa';
import HeaderMain from '../../components/HeaderMain';
import styles from './AccountPage.module.css';

interface UserProfile {
  name: string;
}

const AccountPage: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile>({
    name: 'Алексей Иванов'
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(profile.name);
  
  // Состояние для попапа способа оплаты
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const handleEditProfile = () => {
    if (isEditing) {
      // Сохраняем изменения
      setProfile({ ...profile, name: editName });
      setIsEditing(false);
    } else {
      // Открываем режим редактирования
      setEditName(profile.name);
      setIsEditing(true);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditName(profile.name);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditName(e.target.value);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleEditProfile();
    }
  };

  const handleOrdersClick = () => {
    navigate('/orders');
  };

  const handleLogout = () => {
    // Очищаем данные авторизации
    localStorage.removeItem('token');
    sessionStorage.removeItem('userRole');
    // Перенаправляем на главную страницу (лендинг)
    navigate('/');
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
                <FaUserCircle size={70} color="#4F46E5" />
              </div>
              
              <div className={styles['buyer-account-name-section']}>
                {isEditing ? (
                  <div className={styles['buyer-account-name-edit']}>
                    <input
                      type="text"
                      value={editName}
                      onChange={handleNameChange}
                      onKeyPress={handleKeyPress}
                      className={styles['buyer-account-name-input']}
                      autoFocus
                    />
                    <div className={styles['buyer-account-edit-actions']}>
                      <button onClick={handleEditProfile} className={styles['buyer-account-save-btn']}>
                        Сохранить
                      </button>
                      <button onClick={handleCancelEdit} className={styles['buyer-account-cancel-btn']}>
                        Отмена
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h1 className={styles['buyer-account-name']}>{profile.name}</h1>
                    <button onClick={handleEditProfile} className={styles['buyer-account-edit-btn']}>
                      ✎ изменить профиль
                    </button>
                  </>
                )}
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
                <FiPackage size={32} color="#6B7280" />
              </div>
              <div className={styles['buyer-account-option-content']}>
                <h2 className={styles['buyer-account-option-title']}>Заказы</h2>
                <p className={styles['buyer-account-option-description']}>Просмотр и отслеживание заказов</p>
              </div>
              <div className={styles['buyer-account-option-arrow']}>
                <FiChevronRight size={24} color="#9CA3AF" />
              </div>
            </div>

            {/* Карточка "Способ оплаты" */}
            <div 
              className={styles['buyer-account-option-card']}
              onClick={() => setIsPaymentModalOpen(true)}
            >
              <div className={styles['buyer-account-option-icon']}>
                <FiCreditCard size={32} color="#6B7280" />
              </div>
              <div className={styles['buyer-account-option-content']}>
                <h2 className={styles['buyer-account-option-title']}>Способ оплаты</h2>
                <p className={styles['buyer-account-option-description']}>Управление платежными методами</p>
              </div>
              <div className={styles['buyer-account-option-arrow']}>
                <FiChevronRight size={24} color="#9CA3AF" />
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

      {/* Модальное окно "Способ оплаты" */}
      {isPaymentModalOpen && (
        <div className={styles['buyer-account-modal-overlay']} onClick={() => setIsPaymentModalOpen(false)}>
          <div className={styles['buyer-account-modal-content']} onClick={(e) => e.stopPropagation()}>
            <div className={styles['buyer-account-modal-header']}>
              <h2>Способы оплаты</h2>
              <button className={styles['buyer-account-modal-close']} onClick={() => setIsPaymentModalOpen(false)}>×</button>
            </div>
            <div className={styles['buyer-account-modal-body']}>
              <div className={styles['buyer-account-payment-methods']}>
                <div className={`${styles['buyer-account-payment-method']} ${styles['buyer-account-selected']}`}>
                  <div className={styles['buyer-account-payment-method-icon']}>💳</div>
                  <div className={styles['buyer-account-payment-method-info']}>
                    <div className={styles['buyer-account-payment-method-name']}>Банковская карта</div>
                    <div className={styles['buyer-account-payment-method-details']}>**** **** **** 1234</div>
                  </div>
                  <div className={styles['buyer-account-payment-method-check']}>✓</div>
                </div>
                <div className={styles['buyer-account-payment-method']}>
                  <div className={styles['buyer-account-payment-method-icon']}>📱</div>
                  <div className={styles['buyer-account-payment-method-info']}>
                    <div className={styles['buyer-account-payment-method-name']}>СБП</div>
                    <div className={styles['buyer-account-payment-method-details']}>Привязан к номеру телефона</div>
                  </div>
                </div>
                <div className={styles['buyer-account-payment-method']}>
                  <div className={styles['buyer-account-payment-method-icon']}>🏦</div>
                  <div className={styles['buyer-account-payment-method-info']}>
                    <div className={styles['buyer-account-payment-method-name']}>Наличные при получении</div>
                    <div className={styles['buyer-account-payment-method-details']}>Оплата при доставке</div>
                  </div>
                </div>
                <button className={styles['buyer-account-add-payment-btn']}>+ Добавить новый способ оплаты</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountPage;