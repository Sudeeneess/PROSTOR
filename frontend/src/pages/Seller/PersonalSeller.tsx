import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import HeaderSeller from "./HeaderSeller";
import styles from './PersonalSeller.module.css';

interface SellerProfile {
  fio?: string;
  inn?: string;
  country?: string;
  orgForm?: string;
}

const PersonalSeller: React.FC = () => {
  const [seller, setSeller] = useState<SellerProfile | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<SellerProfile>({});
  const navigate = useNavigate();

  useEffect(() => {
    const storedData = localStorage.getItem("sellerProfile");
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      setSeller(parsedData);
      setFormData(parsedData);
    }
    
    const userRole = sessionStorage.getItem('userRole');
    console.log("Current user role:", userRole);
  }, []);

  const handleAddProduct = () => {
    navigate("/seller/add-products");
  };

  const handleMyProducts = () => {
    console.log("Navigating to /seller/products");
    navigate("/seller/products");
  };

  const handleMyOrders = () => {
    navigate("/seller/orders");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'inn') {
      const onlyNumbers = value.replace(/\D/g, '');
      const truncatedValue = onlyNumbers.slice(0, 12);
      setFormData({ ...formData, [name]: truncatedValue });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSave = () => {
    setSeller(formData);
    localStorage.setItem("sellerProfile", JSON.stringify(formData));
    setIsModalOpen(false);
  };

  return (
    <>
      <HeaderSeller />

      <main className={styles['seller-personal-container']}>
        <h1 className={styles['seller-personal-title']}>Личный кабинет</h1>

        <div className={styles['seller-personal-profile-card']}>
          <div className={styles['seller-personal-profile-info']}>
            <div className={styles['seller-personal-profile-avatar']}>
              {seller?.fio ? seller.fio.charAt(0).toUpperCase() : "?"}
            </div>

            <div className={styles['seller-personal-profile-text']}>
              <span className={styles['seller-personal-profile-name']}>
                {seller?.fio || "Имя не указано"}
              </span>
              <span className={styles['seller-personal-profile-inn']}>
                ИНН: {seller?.inn || "—"}
              </span>
            </div>
          </div>

          <button
            className={styles['seller-personal-edit-profile-btn']}
            onClick={() => setIsModalOpen(true)}
          >
            изменить профиль
          </button>
        </div>

        {/* Единый класс для всех кнопок действий */}
        <div className={styles['seller-personal-actions']}>
          <button 
            className={styles['seller-personal-action-btn']} 
            onClick={handleAddProduct}
          >
            Добавить товары
          </button>

          <button 
            className={styles['seller-personal-action-btn']} 
            onClick={handleMyProducts}
          >
            Мои товары
          </button>

          <button 
            className={styles['seller-personal-action-btn']} 
            onClick={handleMyOrders}
          >
            Мои заказы
          </button>
        </div>

        {/* Модальное окно */}
        {isModalOpen && (
          <div className={styles['seller-personal-modal-overlay']}>
            <div className={styles['seller-personal-modal-content']}>
              <h2>Редактирование профиля</h2>
              
              <select
                name="country"
                value={formData.country || ""}
                onChange={handleInputChange}
                className={styles['seller-personal-modal-select']}
              >
                <option value="">Выберите страну</option>
                <option value="RU">Россия</option>
                <option value="KZ">Казахстан</option>
                <option value="BY">Беларусь</option>
              </select>

              <select
                name="orgForm"
                value={formData.orgForm || ""}
                onChange={handleInputChange}
                className={styles['seller-personal-modal-select']}
              >
                <option value="">Выберите форму организации</option>
                <option value="IP">Индивидуальный предприниматель</option>
                <option value="OOO">Общество с ограниченной ответственностью</option>
                <option value="AO">Акционерное общество</option>
              </select>

              <input
                type="text"
                name="inn"
                placeholder="ИНН (12 цифр)"
                value={formData.inn || ""}
                onChange={handleInputChange}
                className={styles['seller-personal-modal-input']}
                maxLength={12}
                pattern="\d*"
              />

              <input
                type="text"
                name="fio"
                placeholder="ФИО"
                value={formData.fio || ""}
                onChange={handleInputChange}
                className={styles['seller-personal-modal-input']}
              />

              <div className={styles['seller-personal-modal-buttons']}>
                <button onClick={handleSave} className={styles['seller-personal-modal-save-btn']}>
                  Сохранить
                </button>
                <button onClick={() => setIsModalOpen(false)} className={styles['seller-personal-modal-cancel-btn']}>
                  Отмена
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
};

export default PersonalSeller;