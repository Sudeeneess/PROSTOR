import React from "react";
import { useNavigate } from "react-router-dom";
import HeaderSeller from "./HeaderSeller"; // поправь путь если нужно
import "./OrdersSeller.css";

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
    <div className="seller-orders-page">
      <HeaderSeller />

      <div className="seller-orders-container">
        <div className="seller-orders-header">
          <h1>Заказы</h1>

          <button className="seller-orders-back-button" onClick={handleBack}>
            ← Назад
          </button>
        </div>

        <div className="seller-orders-grid">
          <div className="seller-orders-card">
            <span>Новые</span>
            <span className="seller-orders-count">{orders.new}</span>
          </div>

          <div className="seller-orders-card">
            <span>В сборке</span>
            <span className="seller-orders-count">{orders.assembling}</span>
          </div>

          <div className="seller-orders-card">
            <span>Проданные</span>
            <span className="seller-orders-count">{orders.sold}</span>
          </div>

          <div className="seller-orders-card">
            <span>В пути</span>
            <span className="seller-orders-count">{orders.onTheWay}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrdersSeller;