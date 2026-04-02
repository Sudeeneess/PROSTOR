import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import HeaderSeller from "./HeaderSeller";
import "./PersonalSeller.css";

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
    // Загружаем данные продавца
    const storedData = localStorage.getItem("sellerProfile");
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      setSeller(parsedData);
      setFormData(parsedData);
    }
    
    // Проверяем роль пользователя
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

      <main className="seller-personal-container">
        <h1 className="seller-personal-title">Личный кабинет</h1>

        <div className="seller-personal-profile-card">
          <div className="seller-personal-profile-info">
            <div className="seller-personal-profile-avatar">
              {seller?.fio ? seller.fio.charAt(0).toUpperCase() : "?"}
            </div>

            <div className="seller-personal-profile-text">
              <span className="seller-personal-profile-name">
                {seller?.fio || "Имя не указано"}
              </span>
              <span className="seller-personal-profile-inn">
                ИНН: {seller?.inn || "—"}
              </span>
            </div>
          </div>

          <button
            className="seller-personal-edit-profile-btn"
            onClick={() => setIsModalOpen(true)}
          >
            изменить профиль
          </button>
        </div>

        <button className="seller-personal-add-product-btn" onClick={handleAddProduct}>
          Добавить товары
          <span className="seller-personal-add-icon"></span>
        </button>

        <div className="seller-personal-menu-links">
          <button onClick={handleMyProducts} className="seller-personal-menu-link">
            Мои товары
          </button>
          <button onClick={handleMyOrders} className="seller-personal-menu-link">
            Мои заказы
          </button>
        </div>

        {/* Модальное окно */}
        {isModalOpen && (
          <div className="seller-personal-modal-overlay">
            <div className="seller-personal-modal-content">
              <h2>Редактирование профиля</h2>
              
              <select
                name="country"
                value={formData.country || ""}
                onChange={handleInputChange}
                className="seller-personal-modal-select"
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
                className="seller-personal-modal-select"
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
                className="seller-personal-modal-input"
                maxLength={12}
                pattern="\d*"
              />

              <input
                type="text"
                name="fio"
                placeholder="ФИО"
                value={formData.fio || ""}
                onChange={handleInputChange}
                className="seller-personal-modal-input"
              />

              <div className="seller-personal-modal-buttons">
                <button onClick={handleSave} className="seller-personal-modal-save-btn">
                  Сохранить
                </button>
                <button onClick={() => setIsModalOpen(false)} className="seller-personal-modal-cancel-btn">
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