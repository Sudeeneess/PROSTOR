import React, { useState } from 'react';
import Header from './HeaderBuyer';
import './AccountPage.css';

interface UserProfile {
  name: string;
}

const AccountPage: React.FC = () => {
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

  // Заглушка для перехода на страницу заказов (будет реализовано позже)
  const handleOrdersClick = () => {
    // TODO: Переход на страницу заказов
    console.log('Переход на страницу заказов');
  };

  return (
    <div className="buyer-account-page">
      <Header />
      
      <main className="buyer-account-main">
        <div className="buyer-account-container">
          {/* Блок с информацией о пользователе */}
          <div className="buyer-account-header">
            <div className="buyer-account-user-info">
              <div className="buyer-account-avatar">
                <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="30" cy="30" r="30" fill="#E8F0FE"/>
                  <path d="M30 30C33.3137 30 36 27.3137 36 24C36 20.6863 33.3137 18 30 18C26.6863 18 24 20.6863 24 24C24 27.3137 26.6863 30 30 30Z" fill="#4F46E5"/>
                  <path d="M15 45C15 39.4772 19.4772 35 25 35H35C40.5228 35 45 39.4772 45 45V46H15V45Z" fill="#4F46E5"/>
                </svg>
              </div>
              
              <div className="buyer-account-name-section">
                {isEditing ? (
                  <div className="buyer-account-name-edit">
                    <input
                      type="text"
                      value={editName}
                      onChange={handleNameChange}
                      onKeyPress={handleKeyPress}
                      className="buyer-account-name-input"
                      autoFocus
                    />
                    <div className="buyer-account-edit-actions">
                      <button onClick={handleEditProfile} className="buyer-account-save-btn">
                        Сохранить
                      </button>
                      <button onClick={handleCancelEdit} className="buyer-account-cancel-btn">
                        Отмена
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h1 className="buyer-account-name">{profile.name}</h1>
                    <button onClick={handleEditProfile} className="buyer-account-edit-btn">
                      ✎ изменить профиль
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Блок с опциями */}
          <div className="buyer-account-options">
            {/* Карточка "Заказы" - без модального окна, просто заглушка */}
            <div 
              className="buyer-account-option-card"
              onClick={handleOrdersClick}
            >
              <div className="buyer-account-option-icon">
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 10L32 10" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M8 20L32 20" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M8 30L32 30" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round"/>
                  <circle cx="12" cy="10" r="2" fill="#4F46E5"/>
                  <circle cx="12" cy="20" r="2" fill="#4F46E5"/>
                  <circle cx="12" cy="30" r="2" fill="#4F46E5"/>
                </svg>
              </div>
              <div className="buyer-account-option-content">
                <h2 className="buyer-account-option-title">Заказы</h2>
                <p className="buyer-account-option-description">Просмотр и отслеживание заказов</p>
              </div>
              <div className="buyer-account-option-arrow">→</div>
            </div>

            {/* Карточка "Способ оплаты" - открывает модальное окно */}
            <div 
              className="buyer-account-option-card"
              onClick={() => setIsPaymentModalOpen(true)}
            >
              <div className="buyer-account-option-icon">
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="5" y="12" width="30" height="18" rx="2" stroke="#4F46E5" strokeWidth="2"/>
                  <path d="M12 22L28 22" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round"/>
                  <circle cx="30" cy="22" r="2" fill="#4F46E5"/>
                </svg>
              </div>
              <div className="buyer-account-option-content">
                <h2 className="buyer-account-option-title">Способ оплаты</h2>
                <p className="buyer-account-option-description">Управление платежными методами</p>
              </div>
              <div className="buyer-account-option-arrow">→</div>
            </div>
          </div>
        </div>
      </main>

      {/* Модальное окно "Способ оплаты" */}
      {isPaymentModalOpen && (
        <div className="buyer-account-modal-overlay" onClick={() => setIsPaymentModalOpen(false)}>
          <div className="buyer-account-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="buyer-account-modal-header">
              <h2>Способы оплаты</h2>
              <button className="buyer-account-modal-close" onClick={() => setIsPaymentModalOpen(false)}>×</button>
            </div>
            <div className="buyer-account-modal-body">
              <div className="buyer-account-payment-methods">
                <div className="buyer-account-payment-method buyer-account-selected">
                  <div className="buyer-account-payment-method-icon">💳</div>
                  <div className="buyer-account-payment-method-info">
                    <div className="buyer-account-payment-method-name">Банковская карта</div>
                    <div className="buyer-account-payment-method-details">**** **** **** 1234</div>
                  </div>
                  <div className="buyer-account-payment-method-check">✓</div>
                </div>
                <div className="buyer-account-payment-method">
                  <div className="buyer-account-payment-method-icon">📱</div>
                  <div className="buyer-account-payment-method-info">
                    <div className="buyer-account-payment-method-name">СБП</div>
                    <div className="buyer-account-payment-method-details">Привязан к номеру телефона</div>
                  </div>
                </div>
                <div className="buyer-account-payment-method">
                  <div className="buyer-account-payment-method-icon">🏦</div>
                  <div className="buyer-account-payment-method-info">
                    <div className="buyer-account-payment-method-name">Наличные при получении</div>
                    <div className="buyer-account-payment-method-details">Оплата при доставке</div>
                  </div>
                </div>
                <button className="buyer-account-add-payment-btn">+ Добавить новый способ оплаты</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountPage;