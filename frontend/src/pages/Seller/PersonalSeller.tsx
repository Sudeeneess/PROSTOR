import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import HeaderSeller from "./HeaderSeller";
import SellerFioInput from "../../components/SellerFioInput";
import { formatFioDisplay } from "../../utils/fioInput";
import { RECEPTION_LAST_SELLER_ID, syncSellerSnapshotFromLk } from "../../utils/warehouseReception";
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
      const parsedData = JSON.parse(storedData) as SellerProfile;
      const fio = formatFioDisplay(parsedData.fio || "");
      const normalized = { ...parsedData, fio };
      setSeller(normalized);
      setFormData(normalized);
    }
  }, []);

  const handleAddProduct = () => {
    navigate("/seller/products");
  };

  const handleMyProducts = () => {
    navigate("/seller/products");
  };

  const handleMyOrders = () => {
    navigate("/seller/orders");
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('tokenType');
    sessionStorage.removeItem('userRole');
    // Полная перезагрузка гарантирует главную для гостя (лендинг с HeaderMain)
    window.location.assign('/');
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
    const fio = formatFioDisplay(formData.fio || "");
    const next = { ...formData, fio };
    setSeller(next);
    setFormData(next);
    localStorage.setItem("sellerProfile", JSON.stringify(next));
    const sidRaw = localStorage.getItem(RECEPTION_LAST_SELLER_ID);
    const sid = sidRaw ? Number(sidRaw) : NaN;
    if (Number.isFinite(sid)) {
      syncSellerSnapshotFromLk(sid);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="seller-app-shell">
      <HeaderSeller />

      <main className={styles['seller-personal-container']}>
        <h1 className={styles['seller-personal-title']}>Личный кабинет</h1>

        <div className={styles['seller-personal-profile-card']}>
          <div className={styles['seller-personal-profile-info']}>
            <div className={styles['seller-personal-profile-avatar']}>
              {seller?.fio
                ? formatFioDisplay(seller.fio).charAt(0).toUpperCase()
                : "?"}
            </div>

            <div className={styles['seller-personal-profile-text']}>
              <span className={styles['seller-personal-profile-name']}>
                {formatFioDisplay(seller?.fio || "") || "Имя не указано"}
              </span>
              <span className={styles['seller-personal-profile-inn']}>
                ИНН: {seller?.inn || "—"}
              </span>
            </div>
          </div>

          <button
            className={styles['seller-personal-edit-profile-btn']}
            onClick={() => {
              if (seller) {
                setFormData({
                  ...seller,
                  fio: formatFioDisplay(seller.fio || ""),
                });
              }
              setIsModalOpen(true);
            }}
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

          <button
            type="button"
            className={styles['seller-personal-logout-btn']}
            onClick={handleLogout}
          >
            Выйти из аккаунта
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

              <SellerFioInput
                name="fio"
                value={formData.fio || ""}
                onChange={(v) => setFormData({ ...formData, fio: v })}
                className={styles['seller-personal-modal-input']}
                placeholder="Иванов Иван Иванович"
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
    </div>
  );
};

export default PersonalSeller;