import React from "react";
import { useNavigate } from "react-router-dom";
import HeaderSeller from "./HeaderSeller"; // поправь путь если нужно
import styles from './OrdersSeller.module.css';

const OrdersSeller: React.FC = () => {
  const navigate = useNavigate();

  const orders = {
    new: 0,
    assembling: 0,
    sold: 0,
    onTheWay: 0,
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1); // назад
    } else {
      navigate("/seller/dashboard"); // если нет истории
    }
  };

  return (
    <div className={`seller-app-shell ${styles['seller-orders-page']}`}>
      <HeaderSeller />

      <div className={styles['seller-orders-container']}>
        <div className={styles['seller-orders-header']}>
          <h1>Заказы</h1>

          <button className={styles['seller-orders-back-button']} onClick={handleBack}>
            ← Назад
          </button>
        </div>

        <div className={styles['seller-orders-grid']}>
          <div className={styles['seller-orders-card']}>
            <span>Новые</span>
            <span className={styles['seller-orders-count']}>{orders.new}</span>
          </div>

          <div className={styles['seller-orders-card']}>
            <span>В сборке</span>
            <span className={styles['seller-orders-count']}>{orders.assembling}</span>
          </div>

          <div className={styles['seller-orders-card']}>
            <span>Проданные</span>
            <span className={styles['seller-orders-count']}>{orders.sold}</span>
          </div>

          <div className={styles['seller-orders-card']}>
            <span>В пути</span>
            <span className={styles['seller-orders-count']}>{orders.onTheWay}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrdersSeller;