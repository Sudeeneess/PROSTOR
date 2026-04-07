import React from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from './HeaderSeller.module.css';

const HeaderSeller: React.FC = () => {
  const navigate = useNavigate();

  const handleProductsClick = () => {
    navigate("/seller/products");
  };

  const handlePersonalClick = () => {
    navigate("/seller/dashboard"); // ИСПРАВЛЕНО: правильный путь к личному кабинету
  };

  return (
    <header className={styles['seller-header-section']}>
      <div className={styles['seller-header-logo-text']}>
        <span className={styles['seller-header-logo-prostor']}>prostor</span>
        <span className={styles['seller-header-logo-seller']}>Seller</span>
      </div>
      <nav className={styles['seller-header-navigation-bar']}>
        <Link to="/seller/main" className={styles['seller-header-navigation-link']}>На главную</Link>
        <button onClick={handleProductsClick} className={styles['seller-header-navigation-button']}>
          Товары
        </button>
        <Link to="/seller/orders" className={styles['seller-header-navigation-link']}>Заказы</Link>
        <button onClick={handlePersonalClick} className={styles['seller-header-navigation-button']}>
          Личный кабинет
        </button>
      </nav>
    </header>
  );
};

export default HeaderSeller;