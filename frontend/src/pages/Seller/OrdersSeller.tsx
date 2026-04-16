import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import HeaderSeller from "./HeaderSeller";
import styles from './OrdersSeller.module.css';
import { api } from "../../services/api";

const OrdersSeller: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orders, setOrders] = useState({
    new: 0,
    assembling: 0,
    sold: 0,
    onTheWay: 0,
  });

  useEffect(() => {
    const loadDashboard = async () => {
      setLoading(true);
      setError(null);
      const res = await api.getSellerOrdersDashboard();
      if (!res.success || !res.data) {
        setError(res.error ?? "Не удалось загрузить статистику");
        setLoading(false);
        return;
      }

      setOrders({
        new: res.data.newProducts ?? 0,
        assembling: res.data.assembling ?? 0,
        sold: res.data.sold ?? 0,
        onTheWay: res.data.onTheWay ?? 0,
      });
      setLoading(false);
    };

    void loadDashboard();
  }, []);

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

        {loading && <p className={styles['seller-orders-status']}>Загрузка...</p>}
        {error && !loading && (
          <p className={styles['seller-orders-status']} role="alert">{error}</p>
        )}

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